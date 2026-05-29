import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { getNestApp, closeNestApp } from '../../lib/nest-app';
import { printContextBanner } from '../../lib/context-banner';
import { buildNipBaseDomain } from '../../lib/nip-base-domain.util';
import { CliControlClusterService } from '../../services/cli-control-cluster.service';
import { CliSshService } from '../../services/cli-ssh.service';
import { EncryptionService } from 'src/modules/shared/encryption/services/encryption.service';
import { ClusterStatus } from 'src/modules/infrastructure/clusters/entities/cluster.entity';

export default class EnvCredentials extends Command {
  static readonly description =
    'Display control cluster connection information.\n' +
    'Secrets are hidden by default; pass --show-secrets to print them. To populate\n' +
    'a local .env.local for development use `flui dev creds` instead.';

  static readonly examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --format json',
    '<%= config.bin %> <%= command.id %> --test',
    '<%= config.bin %> <%= command.id %> --verify',
  ];

  static readonly flags = {
    format: Flags.string({
      description: 'Output format (text or json)',
      options: ['text', 'json'],
      default: 'text',
    }),
    test: Flags.boolean({
      description: 'Test connections to all services',
      default: false,
    }),
    verify: Flags.boolean({
      description:
        'Verify Kubernetes Secret (flui-secrets) is deployed on the cluster',
      default: false,
    }),
    'show-secrets': Flags.boolean({
      description:
        'Print secret values in plaintext. Off by default — use `flui dev creds` to write secrets to .env.local instead.',
      default: false,
    }),
  };

  private redact(value: string, show: boolean): string {
    if (!value) return '(not available)';
    return show ? value : '(hidden — pass --show-secrets to reveal)';
  }

  private resolveStackPasswords(
    cluster: { metadata?: any },
    encryptionService: EncryptionService,
    spinner: ReturnType<typeof ora>,
  ): {
    postgresPassword: string;
    redisPassword: string;
    grafanaPassword: string;
  } | null {
    const stackPasswords = cluster.metadata?.observabilityStack?.passwords;
    if (stackPasswords) {
      return {
        postgresPassword: stackPasswords.postgres,
        redisPassword: stackPasswords.redis,
        grafanaPassword: stackPasswords.grafana,
      };
    }
    const metadata = cluster.metadata;
    if (
      !metadata?.postgresPasswordEncrypted ||
      !metadata?.redisPasswordEncrypted ||
      !metadata?.grafanaPasswordEncrypted
    ) {
      spinner.fail('Credentials not available in cluster metadata');
      console.log(
        chalk.yellow(
          '\n⚠️  Cluster was created without storing credentials.\n',
        ),
      );
      return null;
    }
    try {
      return {
        postgresPassword: encryptionService.decrypt(
          metadata.postgresPasswordEncrypted,
        ),
        redisPassword: encryptionService.decrypt(
          metadata.redisPasswordEncrypted,
        ),
        grafanaPassword: encryptionService.decrypt(
          metadata.grafanaPasswordEncrypted,
        ),
      };
    } catch (error) {
      spinner.fail('Failed to decrypt credentials');
      console.log(
        chalk.red(`\n❌ Decryption error: ${(error as Error).message}\n`),
      );
      return null;
    }
  }

  private tryDecrypt(svc: EncryptionService, value?: string): string {
    if (!value) return '';
    try {
      return svc.decrypt(value);
    } catch {
      return '';
    }
  }

  private async runHealthCheck(
    controlService: CliControlClusterService,
    masterIp: string,
    nipHostnameToken: string | null | undefined,
  ): Promise<any> {
    const s = ora('Testing connections...').start();
    const result = await controlService.checkObservabilityServices(
      masterIp,
      nipHostnameToken,
    );
    s.succeed('Connection tests completed');
    return result;
  }

  private async runSecretVerify(
    sshService: CliSshService,
    masterIp: string,
  ): Promise<{ exists: boolean; keys: string[]; hasSshCa: boolean } | null> {
    const s = ora('Verifying Kubernetes Secret on cluster...').start();
    return this.verifyKubernetesSecret(sshService, masterIp, s);
  }

  private resolveZitadelSecrets(
    clusterMeta: any,
    encryptionService: EncryptionService,
    baseDomain: string,
  ): {
    domain: string;
    masterkey: string;
    dbAdminPassword: string;
    dbUserPassword: string;
    adminTempPassword: string;
  } {
    const authMode = clusterMeta?.authMode || 'local';
    const isZitadelMode = authMode === 'oidc';
    const domain = isZitadelMode
      ? clusterMeta?.zitadelDomain || `auth.${baseDomain}`
      : '';
    const empty = {
      domain,
      masterkey: '',
      dbAdminPassword: '',
      dbUserPassword: '',
      adminTempPassword: '',
    };
    if (!isZitadelMode || !clusterMeta?.zitadelMasterkeyEncrypted) return empty;
    try {
      return {
        domain,
        masterkey: encryptionService.decrypt(
          clusterMeta.zitadelMasterkeyEncrypted,
        ),
        dbAdminPassword: encryptionService.decrypt(
          clusterMeta.zitadelDbAdminPasswordEncrypted,
        ),
        dbUserPassword: encryptionService.decrypt(
          clusterMeta.zitadelDbUserPasswordEncrypted,
        ),
        adminTempPassword: clusterMeta.zitadelAdminTempPasswordEncrypted
          ? encryptionService.decrypt(
              clusterMeta.zitadelAdminTempPasswordEncrypted,
            )
          : '',
      };
    } catch {
      return empty;
    }
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(EnvCredentials);
    printContextBanner();
    let spinner = ora('Fetching credentials...').start();

    try {
      const app = await getNestApp();
      const controlService = app.get(CliControlClusterService);
      const encryptionService = app.get(EncryptionService);

      // Get control cluster
      const cluster = await controlService.getControlCluster();

      if (!cluster) {
        spinner.fail('No control cluster found');
        console.log(chalk.yellow('\n⚠️  No control cluster exists.\n'));
        console.log(chalk.dim('Create one with:'));
        console.log(`   ${chalk.cyan('flui env create')}\n`);
        return;
      }

      if (cluster.status !== ClusterStatus.READY) {
        spinner.fail(`Cluster is not ready (status: ${cluster.status})`);
        console.log(
          chalk.yellow(
            '\n⚠️  Cluster must be in READY status to retrieve credentials.\n',
          ),
        );
        return;
      }

      spinner.succeed('Cluster found');

      // Get endpoints
      const endpoints = await controlService.getObservabilityEndpoints(
        cluster.id,
      );
      const masterIp = cluster.masterIpAddress;

      if (!masterIp) {
        spinner.fail('Master IP address not available');
        return;
      }

      const stackPwResult = this.resolveStackPasswords(
        cluster,
        encryptionService,
        spinner,
      );
      if (!stackPwResult) return;
      let { postgresPassword, redisPassword, grafanaPassword } = stackPwResult;

      // Read encryption key from ~/.flui/encryption.key (shared with API)
      const encryptionKeyPath = path.join(
        os.homedir(),
        '.flui',
        'encryption.key',
      );
      let encryptionKey = fs.existsSync(encryptionKeyPath)
        ? fs.readFileSync(encryptionKeyPath, 'utf-8').trim()
        : '';
      if (encryptionKey) {
        encryptionKey = this.redact(encryptionKey, flags['show-secrets']);
      }

      const clusterMeta = cluster.metadata as any;
      const baseDomain = buildNipBaseDomain(masterIp, cluster.nipHostnameToken);
      const zitadel = this.resolveZitadelSecrets(
        clusterMeta,
        encryptionService,
        baseDomain,
      );
      let {
        masterkey: zitadelMasterkey,
        dbAdminPassword: zitadelDbAdminPassword,
        dbUserPassword: zitadelDbUserPassword,
        adminTempPassword: zitadelAdminTempPassword,
      } = zitadel;
      const { domain: zitadelDomain } = zitadel;

      const adminEmail = clusterMeta?.adminEmail || 'admin@flui.cloud';
      let adminPassword = this.tryDecrypt(
        encryptionService,
        clusterMeta?.adminPasswordEncrypted,
      );

      const showSecrets = flags['show-secrets'];
      postgresPassword = this.redact(postgresPassword, showSecrets);
      redisPassword = this.redact(redisPassword, showSecrets);
      grafanaPassword = this.redact(grafanaPassword, showSecrets);
      adminPassword = adminPassword
        ? this.redact(adminPassword, showSecrets)
        : '';
      zitadelMasterkey = zitadelMasterkey
        ? this.redact(zitadelMasterkey, showSecrets)
        : '';
      zitadelDbAdminPassword = zitadelDbAdminPassword
        ? this.redact(zitadelDbAdminPassword, showSecrets)
        : '';
      zitadelDbUserPassword = zitadelDbUserPassword
        ? this.redact(zitadelDbUserPassword, showSecrets)
        : '';
      zitadelAdminTempPassword = zitadelAdminTempPassword
        ? this.redact(zitadelAdminTempPassword, showSecrets)
        : '';

      const healthStatus = flags.test
        ? await this.runHealthCheck(
            controlService,
            masterIp,
            cluster.nipHostnameToken,
          )
        : null;

      const secretStatus = flags.verify
        ? await this.runSecretVerify(app.get(CliSshService), masterIp)
        : null;

      // Output based on format
      if (flags.format === 'json') {
        const output = {
          cluster: {
            id: cluster.id,
            name: cluster.name,
            status: cluster.status,
            masterIp,
          },
          endpoints,
          credentials: {
            admin: {
              email: adminEmail,
              password: adminPassword || '(not available)',
              note: 'Bootstrap credentials — change after first login',
            },
            postgresql: {
              host: masterIp,
              port: 30432,
              user: 'fluicloud',
              database: 'fluicloud',
              password: postgresPassword,
            },
            redis: {
              host: masterIp,
              port: 30379,
              password: redisPassword,
            },
            grafana: {
              url: endpoints.grafana,
              username: 'admin',
              password: grafanaPassword,
            },
            ...(zitadelDomain && {
              zitadel: {
                console: `https://${zitadelDomain}/ui/console`,
                issuer: `https://${zitadelDomain}`,
                audience:
                  clusterMeta?.zitadelAudience ||
                  '(configure after first setup)',
                adminUsername: `flui-admin@zitadel.${zitadelDomain}`,
                adminPassword: zitadelAdminTempPassword || '(not available)',
                masterkey: zitadelMasterkey || '(not available)',
                dbAdminPassword: zitadelDbAdminPassword || '(not available)',
                dbUserPassword: zitadelDbUserPassword || '(not available)',
              },
            }),
            ...(encryptionKey && { encryptionKey }),
          },
          connectionStrings: {
            postgresql: `postgresql://fluicloud:${postgresPassword}@${masterIp}:30432/fluicloud`,
            redis: `redis://:${redisPassword}@${masterIp}:30379`,
          },
          healthStatus,
          secretStatus,
        };
        console.log(JSON.stringify(output, null, 2));
      } else {
        // Text format
        this.displayTextOutput(
          masterIp,
          endpoints,
          {
            postgres: postgresPassword,
            redis: redisPassword,
            grafana: grafanaPassword,
          },
          { email: adminEmail, password: adminPassword },
          healthStatus,
          secretStatus,
          zitadelDomain
            ? {
                domain: zitadelDomain,
                adminUsername: `flui-admin@zitadel.${zitadelDomain}`,
                adminPassword: zitadelAdminTempPassword,
                audience: clusterMeta?.zitadelAudience || '',
                masterkey: zitadelMasterkey,
                dbAdminPassword: zitadelDbAdminPassword,
                dbUserPassword: zitadelDbUserPassword,
              }
            : null,
        );
      }
    } catch (error) {
      spinner.fail('Error retrieving credentials');
      console.error(chalk.red(`\n❌ ${error.message}\n`));
      this.exit(1);
    } finally {
      await closeNestApp();
    }
  }

  private displayTextOutput(
    masterIp: string,
    endpoints: any,
    passwords: { postgres: string; redis: string; grafana: string },
    admin: { email: string; password: string },
    healthStatus: any,
    secretStatus: {
      exists: boolean;
      keys: string[];
      hasSshCa: boolean;
    } | null,
    zitadel: {
      domain: string;
      adminUsername: string;
      adminPassword: string;
      audience: string;
      masterkey: string;
      dbAdminPassword: string;
      dbUserPassword: string;
    } | null = null,
  ): void {
    console.log(chalk.cyan('\n📋 Control Cluster Credentials'));
    console.log(chalk.cyan('━'.repeat(50)));

    // Endpoints section
    console.log(chalk.cyan('\n🌐 Endpoints:\n'));
    console.log(
      `   ${chalk.bold('Flui Web:')}   ${endpoints.fluiWeb || 'N/A'}`,
    );
    console.log(
      `   ${chalk.bold('Flui API:')}   ${endpoints.fluiApi || 'N/A'}`,
    );
    console.log(
      `   ${chalk.bold('Grafana:')}    ${endpoints.grafana || 'N/A'}`,
    );
    console.log(
      `   ${chalk.bold('Prometheus:')} ${endpoints.prometheus || 'N/A'}`,
    );
    console.log(`   ${chalk.bold('Loki:')}       ${endpoints.loki || 'N/A'}`);
    console.log(
      `   ${chalk.bold('PostgreSQL:')} ${endpoints.postgres || 'N/A'}`,
    );
    console.log(`   ${chalk.bold('Redis:')}      ${endpoints.redis || 'N/A'}`);

    // Health status if tested
    if (healthStatus) {
      console.log(chalk.cyan('\n💚 Health Status:\n'));
      console.log(
        `   ${chalk.bold('Prometheus:')} ${this.formatHealth(healthStatus.prometheus)}`,
      );
      console.log(
        `   ${chalk.bold('Loki:')}       ${this.formatHealth(healthStatus.loki)}`,
      );
      console.log(
        `   ${chalk.bold('Grafana:')}    ${this.formatHealth(healthStatus.grafana)}`,
      );
      console.log(
        `   ${chalk.bold('PostgreSQL:')} ${this.formatHealth(healthStatus.postgres)}`,
      );
      console.log(
        `   ${chalk.bold('Redis:')}      ${this.formatHealth(healthStatus.redis)}`,
      );
    }

    // Credentials section
    console.log(chalk.cyan('\n🔑 Credentials:\n'));

    console.log(`   ${chalk.bold('Flui API Admin:')}`);
    console.log(`     ${chalk.dim('Email:')}    ${admin.email}`);
    if (admin.password) {
      console.log(
        `     ${chalk.dim('Password:')} ${chalk.yellow(admin.password)}`,
      );
      console.log(
        `     ${chalk.red('⚠️  Bootstrap credentials — change after first login')}`,
      );
    } else {
      console.log(
        `     ${chalk.dim('Password:')} ${chalk.dim('(not available)')}`,
      );
    }

    console.log(`\n   ${chalk.bold('PostgreSQL:')}`);
    console.log(`     ${chalk.dim('Host:')}     ${masterIp}`);
    console.log(`     ${chalk.dim('Port:')}     30432`);
    console.log(`     ${chalk.dim('User:')}     fluicloud`);
    console.log(`     ${chalk.dim('Database:')} fluicloud`);
    console.log(
      `     ${chalk.dim('Password:')} ${chalk.yellow(passwords.postgres)}`,
    );

    console.log(`\n   ${chalk.bold('Redis:')}`);
    console.log(`     ${chalk.dim('Host:')}     ${masterIp}`);
    console.log(`     ${chalk.dim('Port:')}     30379`);
    console.log(
      `     ${chalk.dim('Password:')} ${chalk.yellow(passwords.redis)}`,
    );

    console.log(`\n   ${chalk.bold('Grafana:')}`);
    console.log(`     ${chalk.dim('URL:')}      ${endpoints.grafana}`);
    console.log(`     ${chalk.dim('Username:')} admin`);
    console.log(
      `     ${chalk.dim('Password:')} ${chalk.yellow(passwords.grafana)}`,
    );

    if (zitadel) {
      console.log(`\n   ${chalk.bold('Zitadel (Identity Provider):')}`);
      console.log(
        `     ${chalk.dim('Console:')}           https://${zitadel.domain}/ui/console`,
      );
      console.log(
        `     ${chalk.dim('Admin Username:')}    ${zitadel.adminUsername}`,
      );
      console.log(
        `     ${chalk.dim('Admin Password:')}    ${chalk.yellow(zitadel.adminPassword || 'N/A')}`,
      );
      console.log(
        `     ${chalk.dim('Masterkey:')}         ${chalk.yellow(zitadel.masterkey || 'N/A')}`,
      );
      console.log(
        `     ${chalk.dim('DB Admin Password:')} ${chalk.yellow(zitadel.dbAdminPassword || 'N/A')}`,
      );
      console.log(
        `     ${chalk.dim('DB User Password:')}  ${chalk.yellow(zitadel.dbUserPassword || 'N/A')}`,
      );
      console.log(
        `     ${chalk.dim('Audience (API):')}    ${chalk.dim(zitadel.audience || '(set after first Zitadel console setup)')}`,
      );
    }

    // Connection strings section
    console.log(chalk.cyan('\n📝 Connection Strings:\n'));
    console.log(`   ${chalk.bold('PostgreSQL:')}`);
    const pgConn = chalk.dim(
      `postgresql://fluicloud:${passwords.postgres}@${masterIp}:30432/fluicloud`,
    );
    console.log(`     ${pgConn}`);
    console.log(`\n   ${chalk.bold('Redis:')}`);
    const redisConn = chalk.dim(
      `redis://:${passwords.redis}@${masterIp}:30379`,
    );
    console.log(`     ${redisConn}`);

    // Kubernetes Secret status if verified
    if (secretStatus) {
      console.log(chalk.cyan('\n🔐 Kubernetes Secret (flui-secrets):\n'));
      if (secretStatus.exists) {
        console.log(
          `   ${chalk.bold('Status:')}  ${chalk.green('✅ deployed')}`,
        );
        console.log(
          `   ${chalk.bold('Keys:')}    ${secretStatus.keys.join(', ')}`,
        );
        console.log(
          `   ${chalk.bold('SSH CA:')}  ${secretStatus.hasSshCa ? chalk.green('✅ configured') : chalk.yellow('⚠️  missing')}`,
        );
      } else {
        console.log(
          `   ${chalk.bold('Status:')}  ${chalk.red('❌ not found')}`,
        );
        console.log(
          chalk.dim('   Secret is created automatically during cluster setup.'),
        );
        console.log(
          chalk.dim('   If missing, recreate the cluster or deploy manually.'),
        );
      }
    }

    // Test commands section
    console.log(chalk.cyan('\n🧪 Test Commands:\n'));
    console.log(`   ${chalk.bold('PostgreSQL:')}`);
    const pgTest = chalk.dim(
      `PGPASSWORD='${passwords.postgres}' psql -h ${masterIp} -p 30432 -U fluicloud -d fluicloud`,
    );
    console.log(`     ${pgTest}`);
    console.log(`\n   ${chalk.bold('Redis:')}`);
    const redisTest = chalk.dim(
      `redis-cli -h ${masterIp} -p 30379 -a '${passwords.redis}'`,
    );
    console.log(`     ${redisTest}`);

    console.log(); // Empty line at the end
  }

  private async verifyKubernetesSecret(
    sshService: CliSshService,
    masterIp: string,
    spinner: ReturnType<typeof ora>,
  ): Promise<{ exists: boolean; keys: string[]; hasSshCa: boolean }> {
    try {
      const result = await sshService.sshExec(
        masterIp,
        "kubectl get secret flui-secrets -n default -o jsonpath='{.data}'",
      );
      const data = JSON.parse(result);
      const keys = Object.keys(data);
      const hasSshCa =
        keys.includes('SSH_CA_PRIVATE_KEY') &&
        keys.includes('SSH_CA_PUBLIC_KEY');
      spinner.succeed('Kubernetes Secret verified');
      return { exists: true, keys, hasSshCa };
    } catch {
      spinner.warn('Kubernetes Secret not found or not accessible');
      return { exists: false, keys: [], hasSshCa: false };
    }
  }

  private formatHealth(status: 'healthy' | 'unreachable'): string {
    if (status === 'healthy') {
      return `${chalk.green('✅ healthy')}`;
    }
    return `${chalk.red('❌ unreachable')}`;
  }
}
