import { Command } from '@oclif/core';
import { execFileSync, spawnSync } from 'node:child_process';

export default class Update extends Command {
  static readonly description = 'Update the flui CLI to the latest version';

  static readonly examples = ['<%= config.bin %> <%= command.id %>'];

  async run(): Promise<void> {
    const packageName = this.config.name;
    const currentVersion = this.config.version;

    this.log(`Current version: ${currentVersion}`);
    process.stdout.write('Checking latest version on npm...');

    let latest: string;
    try {
      latest = execFileSync('npm', ['view', packageName, 'version'], {
        encoding: 'utf8',
      }).trim();
    } catch {
      this.error(
        'Could not reach npm registry. Check your internet connection.',
      );
    }

    process.stdout.write(`\r\x1B[K`);

    if (latest === currentVersion) {
      this.log(`Already on the latest version (${currentVersion}).`);
      return;
    }

    this.log(`New version available: ${currentVersion} → ${latest}`);
    const readline = await import('node:readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const confirm = await new Promise<boolean>((resolve) => {
      rl.question(`Update to ${latest}? [Y/n] `, (answer) => {
        rl.close();
        resolve(answer.trim().toLowerCase() !== 'n');
      });
    });

    if (!confirm) {
      this.log('Update cancelled.');
      return;
    }

    this.log(`Installing ${packageName}@${latest}...`);
    const result = spawnSync(
      'npm',
      ['install', '-g', `${packageName}@${latest}`],
      {
        stdio: 'inherit',
        shell: true,
      },
    );

    if (result.status !== 0) {
      this.error(
        'Update failed. Try running manually: npm install -g ' + packageName,
      );
    }

    this.log(`Successfully updated to ${latest}.`);
  }
}
