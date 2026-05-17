import { Injectable, Logger } from '@nestjs/common';
import { spawn, ChildProcess, exec } from 'node:child_process';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export interface AgentSession {
  agentSocketPath: string;
  agentPid: number;
  cleanup: () => Promise<void>;
}

@Injectable()
export class EphemeralAgentService {
  private readonly logger = new Logger(EphemeralAgentService.name);
  private readonly isWindows = os.platform() === 'win32';

  /**
   * Create a temporary ssh-agent and load an ephemeral certificate
   *
   * @param privateKey - ED25519 private key (PEM format)
   * @param certificate - SSH certificate signed by CA (-cert.pub format)
   * @returns AgentSession with socket path and cleanup function
   */
  async createAgentWithCertificate(
    privateKey: string,
    certificate: string,
  ): Promise<AgentSession> {
    this.logger.log('🔐 Creating ephemeral ssh-agent session...');

    let tempDir: string | null = null;
    let agentProcess: ChildProcess | null = null;

    try {
      // 1. Create temporary directory for key files
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'flui-agent-'));
      this.logger.debug(`Created temp directory: ${tempDir}`);

      // 2. Write private key and certificate to temp files
      // IMPORTANT: ssh-add requires the certificate to be named <keyfile>-cert.pub
      const keyPath = path.join(tempDir, 'ephemeral_key');
      const certPath = path.join(tempDir, 'ephemeral_key-cert.pub');

      await fs.writeFile(keyPath, privateKey, { mode: 0o600 });
      await fs.writeFile(certPath, certificate, { mode: 0o644 });

      this.logger.debug(`Wrote key: ${keyPath}`);
      this.logger.debug(`Wrote cert: ${certPath}`);

      // 3. Start ssh-agent
      const agentInfo = await this.startAgent();
      agentProcess = agentInfo.process;
      const agentSocketPath = agentInfo.socketPath;
      const agentPid = agentInfo.pid;

      this.logger.log(
        `✅ ssh-agent started (PID: ${agentPid}, Socket: ${agentSocketPath})`,
      );

      // 4. Load private key + certificate into agent
      await this.loadCertificateIntoAgent(keyPath, agentSocketPath);

      this.logger.log(`✅ Ephemeral certificate loaded into agent`);

      // 5. Cleanup temp directory (agent has loaded keys into memory)
      await fs.rm(tempDir, { recursive: true, force: true });
      this.logger.debug(`Cleaned up temp directory: ${tempDir}`);
      tempDir = null; // Mark as cleaned

      // 6. Return session with cleanup function
      const cleanup = async () => {
        this.logger.log(`🧹 Cleaning up agent session (PID: ${agentPid})...`);

        // Kill agent process
        if (agentProcess && !agentProcess.killed) {
          agentProcess.kill('SIGTERM');
          this.logger.debug(`Agent process killed (PID: ${agentPid})`);
        }

        // Remove socket file (agent creates it, so clean it up)
        try {
          await fs.unlink(agentSocketPath);
          this.logger.debug(`Agent socket removed: ${agentSocketPath}`);
        } catch (error) {
          // Ignore errors - socket may already be removed by agent
          this.logger.debug(`Socket cleanup skipped: ${error.message}`);
        }
      };

      return {
        agentSocketPath,
        agentPid,
        cleanup,
      };
    } catch (error) {
      this.logger.error(`❌ Failed to create agent session: ${error.message}`);

      // Cleanup on error
      if (agentProcess && !agentProcess.killed) {
        agentProcess.kill('SIGTERM');
      }

      if (tempDir) {
        try {
          await fs.rm(tempDir, { recursive: true, force: true });
        } catch (cleanupError) {
          this.logger.warn(
            `Failed to cleanup temp dir: ${cleanupError.message}`,
          );
        }
      }

      throw error;
    }
  }

  /**
   * Start ssh-agent process
   */
  private async startAgent(): Promise<{
    process: ChildProcess;
    socketPath: string;
    pid: number;
  }> {
    return new Promise((resolve, reject) => {
      // Use Unix-style socket path on all platforms
      // Git Bash on Windows properly translates /tmp paths
      const socketPath = path.join(
        os.tmpdir(),
        `flui-agent-${Date.now()}.sock`,
      );

      this.logger.debug(`Starting ssh-agent with socket: ${socketPath}`);

      const agentProcess = spawn('ssh-agent', ['-D', '-a', socketPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: false,
        windowsHide: true,
      });

      let agentPid: number | null = null;

      // Wait for agent to be ready
      const readyTimeout = setTimeout(() => {
        agentProcess.kill('SIGTERM');
        reject(new Error('ssh-agent startup timeout (5s)'));
      }, 5000);

      // Capture stderr for debugging
      agentProcess.stderr?.on('data', (data) => {
        this.logger.debug(`[ssh-agent stderr] ${data.toString()}`);
      });

      // Agent is ready when socket file exists
      const checkReady = async () => {
        try {
          // Verify socket exists (works on all platforms with Unix-style paths)
          await fs.access(socketPath);

          clearTimeout(readyTimeout);
          resolve({
            process: agentProcess,
            socketPath,
            pid: agentProcess.pid,
          });
        } catch {
          // Socket not ready yet, wait a bit
          setTimeout(checkReady, 100);
        }
      };

      agentProcess.on('spawn', () => {
        agentPid = agentProcess.pid!;
        this.logger.debug(`ssh-agent spawned with PID: ${agentPid}`);
        // Start checking if socket is ready
        setTimeout(checkReady, 100);
      });

      agentProcess.on('error', (error) => {
        clearTimeout(readyTimeout);
        reject(new Error(`ssh-agent spawn error: ${error.message}`));
      });

      agentProcess.on('exit', (code, signal) => {
        clearTimeout(readyTimeout);
        if (code !== null && code !== 0) {
          reject(new Error(`ssh-agent exited with code ${code}`));
        }
      });
    });
  }

  /**
   * Load private key + certificate into running ssh-agent
   */
  private async loadCertificateIntoAgent(
    keyPath: string,
    agentSocketPath: string,
  ): Promise<void> {
    this.logger.debug(`Loading certificate into agent: ${keyPath}`);

    try {
      // Set SSH_AUTH_SOCK environment variable for ssh-add
      const env = {
        ...process.env,
        SSH_AUTH_SOCK: agentSocketPath,
      };

      // Execute ssh-add to load the key
      // ssh-add will automatically load both the key and the -cert.pub file
      const command = `ssh-add "${keyPath}"`;

      this.logger.debug(`Executing: ${command}`);
      this.logger.debug(`With SSH_AUTH_SOCK: ${agentSocketPath}`);

      const { stdout, stderr } = await execAsync(command, { env });

      if (stdout) {
        this.logger.debug(`ssh-add stdout: ${stdout}`);
      }
      if (stderr) {
        this.logger.debug(`ssh-add stderr: ${stderr}`);
      }

      // Verify certificate was loaded by listing identities
      const { stdout: listOutput } = await execAsync('ssh-add -L', { env });

      if (listOutput.includes('-cert-v01@openssh.com')) {
        this.logger.log('✅ Certificate confirmed in agent');
        this.logger.debug(`Agent identities:\n${listOutput}`);
      } else {
        throw new Error('Certificate not found in agent after loading');
      }
    } catch (error) {
      this.logger.error(`❌ Failed to load certificate: ${error.message}`);
      if (error.stderr) {
        this.logger.error(`ssh-add stderr: ${error.stderr}`);
      }
      throw new Error(`ssh-add failed: ${error.message}`);
    }
  }
}
