import { Args, Command } from '@oclif/core';
import chalk from 'chalk';
import { ProfileManager } from '../../lib/profile-manager';

export default class ContextUse extends Command {
  static readonly description = 'Switch to a different profile';

  static readonly examples = [
    '<%= config.bin %> <%= command.id %> prod',
    '<%= config.bin %> <%= command.id %> default',
  ];

  static readonly args = {
    name: Args.string({
      required: true,
      description: 'Profile name to switch to',
    }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(ContextUse);

    if (!ProfileManager.profileExists(args.name)) {
      this.error(
        `Profile '${args.name}' does not exist. Run 'flui context create ${args.name}' to create it.`,
      );
    }

    ProfileManager.setActiveProfile(args.name);
    console.log(chalk.green(`✓ Switched to profile '${args.name}'`));
  }
}
