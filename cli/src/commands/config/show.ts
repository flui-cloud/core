import { Command } from '@oclif/core';
import { ConfigStorage } from '../../lib/config-storage';
import { PreferencesResolver } from '../../config/preferences-resolver';
import { echoPreferences } from '../../config/preferences-echo';

export default class ConfigShow extends Command {
  static readonly description =
    'Show every preference resolved through the layered config (flag > env > project > user > default). Useful for debugging where a value is coming from.';

  static readonly examples = ['<%= config.bin %> <%= command.id %>'];

  async run(): Promise<void> {
    const resolver = new PreferencesResolver(new ConfigStorage());
    echoPreferences(resolver.resolveAll(), resolver);
  }
}
