import { Args, Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import { ProfileManager } from '../../lib/profile-manager';

export default class ContextCreate extends Command {
  static readonly description = 'Create a new profile';

  static readonly examples = [
    '<%= config.bin %> <%= command.id %> dev',
    '<%= config.bin %> <%= command.id %> prod --switch',
  ];

  static readonly args = {
    name: Args.string({
      required: true,
      description: 'Profile name (alphanumeric, hyphens, underscores)',
    }),
  };

  static readonly flags = {
    switch: Flags.boolean({
      char: 's',
      description: 'Switch to the new profile after creating it',
      default: false,
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ContextCreate);

    try {
      ProfileManager.createProfile(args.name);
      console.log(chalk.green(`✓ Profile '${args.name}' created`));

      if (flags.switch) {
        ProfileManager.setActiveProfile(args.name);
        console.log(chalk.green(`✓ Switched to profile '${args.name}'`));
      } else {
        console.log(
          chalk.dim(`  Run 'flui context use ${args.name}' to switch to it`),
        );
      }
    } catch (error) {
      this.error(error instanceof Error ? error.message : String(error));
    }
  }
}
