import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import ora from 'ora';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { ApiClient, ApiError } from '../../lib/api-client';
import { ConfigStorage } from '../../lib/config-storage';
import {
  promptInput,
  promptMaskedInput,
  confirmPrompt,
} from '../../lib/prompts';

interface SetupStatus {
  configured: boolean;
  authMethod: string | null;
  appSlug?: string;
}

interface SetupPayload {
  appId: string;
  privateKey: string;
  webhookSecret: string;
  appSlug: string;
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
}

export default class IntegrationSetupGithubApp extends Command {
  static readonly description =
    'Configure the GitHub App credentials in Flui (admin only). Interactively prompts for App ID, slug, client ID/secret, webhook secret and private key path. Secrets are hidden during input and encrypted at rest in the database.';

  static readonly examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --private-key-file ./flui-cloud.pem',
  ];

  static readonly flags = {
    'private-key-file': Flags.string({
      description:
        'Path to the GitHub App private key PEM file (skips the path prompt)',
    }),
    'callback-url': Flags.string({
      description:
        'OAuth callback URL configured on the GitHub App. Defaults to <api-url>/repositories/github-app/user-callback',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(IntegrationSetupGithubApp);

    const configStorage = new ConfigStorage();
    const apiUrl = configStorage.getApiUrlOrThrow();
    const apiKey = configStorage.getApiKey();
    if (!apiKey) {
      this.error('Not logged in. Run `flui auth login` first.', { exit: 1 });
    }
    const api = new ApiClient({ baseUrl: apiUrl, apiKey });

    let status: SetupStatus | null = null;
    try {
      status = await api.get<SetupStatus>('/repositories/github/setup/status');
    } catch {
      /* empty */
    }

    if (status?.configured) {
      console.log(
        chalk.yellow(
          `\n  GitHub integration is already configured (authMethod=${status.authMethod}${status.appSlug ? `, appSlug=${status.appSlug}` : ''}).`,
        ),
      );
      const ok = await confirmPrompt(
        'Overwrite the existing configuration?',
        false,
      );
      if (!ok) {
        console.log(chalk.dim('\n  Cancelled.\n'));
        return;
      }
    }

    console.log(
      chalk.dim(
        '\n  Get these values from https://github.com/settings/apps/<your-app>\n',
      ),
    );

    const appId = await promptInput({
      message: 'App ID',
      validate: (v) =>
        /^\d+$/.test(v) ? null : 'App ID must be a numeric string',
    });
    const appSlug = await promptInput({
      message: 'App slug (last segment of the app URL)',
      default: 'flui-cloud',
    });
    const clientId = await promptInput({
      message: 'Client ID (e.g. Iv23...)',
    });

    const clientSecret = await promptMaskedInput('Client Secret');
    if (!clientSecret) {
      this.error('Client Secret cannot be empty', { exit: 1 });
    }

    const webhookSecret = await promptMaskedInput('Webhook Secret');
    if (!webhookSecret) {
      this.error('Webhook Secret cannot be empty', { exit: 1 });
    }

    const privateKeyFile =
      flags['private-key-file'] ??
      (await promptInput({
        message: 'Path to private key (.pem) file',
        validate: (v) => (v.endsWith('.pem') ? null : 'Expected a .pem file'),
      }));

    let privateKey: string;
    try {
      const resolved = path.isAbsolute(privateKeyFile)
        ? privateKeyFile
        : path.resolve(process.cwd(), privateKeyFile);
      privateKey = await fs.readFile(resolved, 'utf-8');
    } catch (err) {
      this.error(
        `Failed to read private key from "${privateKeyFile}": ${(err as Error).message}`,
        { exit: 1 },
      );
    }
    if (!privateKey.includes('BEGIN') || !privateKey.includes('PRIVATE KEY')) {
      this.error(
        `File "${privateKeyFile}" does not look like a PEM private key`,
        { exit: 1 },
      );
    }

    const defaultCallback = `${apiUrl.replace(/\/$/, '')}/repositories/github-app/user-callback`;
    const callbackUrl =
      flags['callback-url'] ??
      (await promptInput({
        message: 'Callback URL (must match the GitHub App setting)',
        default: defaultCallback,
      }));

    const payload: SetupPayload = {
      appId,
      privateKey,
      webhookSecret,
      appSlug,
      clientId,
      clientSecret,
      callbackUrl,
    };

    const spinner = ora('Saving GitHub App configuration…').start();
    try {
      await api.post<unknown>(
        '/repositories/github/setup/github-app',
        payload,
      );
      spinner.succeed('GitHub App configured');
    } catch (error: unknown) {
      spinner.fail('Failed to save configuration');
      if (error instanceof ApiError) {
        console.log(chalk.red(`  ${error.statusCode}: ${error.message}`));
        if (error.statusCode === 403) {
          console.log(
            chalk.yellow('  Admin privileges required for this operation.'),
          );
        }
      } else {
        console.log(chalk.red(`  ${(error as Error).message}`));
      }
      this.exit(1);
    }

    console.log('');
    console.log(
      chalk.dim(
        `  Verify with: ${chalk.cyan('flui integration installations')}`,
      ),
    );
    console.log(
      chalk.dim(
        `  Connect a user with: ${chalk.cyan('flui integration connect github')}`,
      ),
    );
    console.log('');
  }
}
