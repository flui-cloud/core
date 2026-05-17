import { Injectable, Logger } from '@nestjs/common';
import { ChildProcess } from 'node:child_process';

export interface TerminalConnection {
  process: ChildProcess; // Native SSH process
  serverId: string;
  serverIp: string;
  tenantId?: string;
  createdAt: Date;
  cleanup?: () => Promise<void>; // Cleanup function for temp files
}

@Injectable()
export class TerminalConnectionManager {
  private readonly logger = new Logger(TerminalConnectionManager.name);
  private readonly connections = new Map<string, TerminalConnection>();

  /**
   * Add a new connection (no limits for now)
   */
  addConnection(socketId: string, connection: TerminalConnection): void {
    // Simply add - no validation or limits
    this.connections.set(socketId, connection);
    this.logger.debug(
      `Added connection for socket ${socketId} to server ${connection.serverId}`,
    );
  }

  /**
   * Get connection by socket ID
   */
  getConnection(socketId: string): TerminalConnection | undefined {
    return this.connections.get(socketId);
  }

  /**
   * Check if connection exists
   */
  hasConnection(socketId: string): boolean {
    return this.connections.has(socketId);
  }

  /**
   * Remove connection
   */
  async removeConnection(socketId: string): Promise<void> {
    const connection = this.connections.get(socketId);
    if (connection) {
      // Kill SSH process if still running
      if (connection.process && !connection.process.killed) {
        try {
          connection.process.kill('SIGTERM');
          this.logger.debug(`Killed SSH process for socket ${socketId}`);
        } catch (error) {
          this.logger.error(`Error killing SSH process: ${error.message}`);
        }
      }

      // Cleanup temp files if cleanup function exists
      if (connection.cleanup) {
        try {
          await connection.cleanup();
          this.logger.debug(`Cleaned up temp files for socket ${socketId}`);
        } catch (error) {
          this.logger.error(`Error cleaning up temp files: ${error.message}`);
        }
      }

      this.connections.delete(socketId);
      this.logger.debug(`Removed connection for socket ${socketId}`);
    }
  }

  /**
   * Get all connections for a tenant
   */
  getConnectionsByTenant(tenantId: string): TerminalConnection[] {
    const result: TerminalConnection[] = [];
    this.connections.forEach((conn) => {
      if (conn.tenantId === tenantId) {
        result.push(conn);
      }
    });
    return result;
  }

  /**
   * Get connection statistics
   */
  getStats() {
    const tenantCounts = new Map<string, number>();
    const serverCounts = new Map<string, number>();

    this.connections.forEach((conn) => {
      const tenant = conn.tenantId || 'global';
      tenantCounts.set(tenant, (tenantCounts.get(tenant) || 0) + 1);
      serverCounts.set(
        conn.serverId,
        (serverCounts.get(conn.serverId) || 0) + 1,
      );
    });

    return {
      totalConnections: this.connections.size,
      byTenant: Object.fromEntries(tenantCounts),
      byServer: Object.fromEntries(serverCounts),
      connections: Array.from(this.connections.entries()).map(
        ([socketId, conn]) => ({
          socketId,
          serverId: conn.serverId,
          serverIp: conn.serverIp,
          tenantId: conn.tenantId,
          connectedAt: conn.createdAt,
          duration: Date.now() - conn.createdAt.getTime(),
        }),
      ),
    };
  }

  /**
   * Clean up all connections
   */
  closeAllConnections(): void {
    this.logger.log(`Closing all ${this.connections.size} connections`);
    this.connections.forEach((conn, socketId) => {
      this.removeConnection(socketId);
    });
  }
}
