import { Args, Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import { ProfileManager } from '../../lib/profile-manager';

export default class ContextDelete extends Command {
  static readonly description = 'Delete a profile';

  static readonly examples = [
    '<%= config.bin %> <%= command.id %> dev --force',
  ];

  static readonly args = {
    name: Args.string({
      required: true,
      description: 'Profile name to delete',
    }),
  };

  static readonly flags = {
    force: Flags.boolean({
      char: 'f',
      description: 'Skip confirmation prompt',
      default: false,
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ContextDelete);

    if (args.name === ProfileManager.DEFAULT_PROFILE) {
      this.error(
        `Cannot delete the '${ProfileManager.DEFAULT_PROFILE}' profile`,
      );
    }

    const active = ProfileManager.getActiveProfile();
    if (args.name === active) {
      this.error(
        `Cannot delete the active profile '${args.name}'. Switch to another profile first with 'flui context use <name>'.`,
      );
    }

    if (!ProfileManager.profileExists(args.name)) {
      this.error(`Profile '${args.name}' does not exist`);
    }

    if (!flags.force) {
      console.log(
        chalk.yellow(
          `⚠️  This will permanently delete all data in profile '${args.name}'.`,
        ),
      );
      console.log(chalk.dim(`   Re-run with --force to confirm deletion.`));
      return;
    }

    try {
      ProfileManager.deleteProfile(args.name);
      console.log(chalk.green(`✓ Profile '${args.name}' deleted`));
    } catch (error) {
      this.error(error instanceof Error ? error.message : String(error));
    }
  }
}
