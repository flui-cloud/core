import { Command } from '@oclif/core';
import { ProfileManager } from '../../lib/profile-manager';

export default class ContextShow extends Command {
  static readonly description = 'Show the active profile';

  static readonly examples = ['<%= config.bin %> <%= command.id %>'];

  async run(): Promise<void> {
    console.log(ProfileManager.getActiveProfile());
  }
}
