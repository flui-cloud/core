import { Command } from '@oclif/core';
import chalk from 'chalk';
import { ProfileManager } from '../../lib/profile-manager';

export default class ContextList extends Command {
  static readonly description = 'List all profiles';

  static readonly examples = ['<%= config.bin %> <%= command.id %>'];

  async run(): Promise<void> {
    const profiles = ProfileManager.listProfiles();
    const active = ProfileManager.getActiveProfile();

    if (profiles.length === 0) {
      console.log(
        chalk.dim(
          'No profiles found. Run flui context create <name> to create one.',
        ),
      );
      return;
    }

    for (const profile of profiles) {
      if (profile === active) {
        console.log(chalk.green(`* ${profile}`));
      } else {
        console.log(`  ${profile}`);
      }
    }
  }
}
