import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import { getNestApp, closeNestApp } from '../../lib/nest-app';
import { CliLoggerService } from '../../services/cli-logger.service';
import { CliOperationRepository } from '../../lib/repositories/cli-operation.repository';
import { printContextBanner } from '../../lib/context-banner';

export default class EnvLogs extends Command {
  static readonly description =
    'View operation logs in real-time or retrospectively';

  static readonly examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --tail 50',
    '<%= config.bin %> <%= command.id %> --operation op_123',
  ];

  static readonly flags = {
    tail: Flags.integer({
      char: 't',
      description: 'Number of lines to show from the end',
      default: 100,
    }),
    operation: Flags.string({
      char: 'o',
      description: 'Specific operation ID to view logs for',
    }),
    list: Flags.boolean({
      char: 'l',
      description: 'List all operations with logs',
      default: false,
    }),
  };

  async run(): Promise<void> {
    try {
      const { flags } = await this.parse(EnvLogs);
      printContextBanner();
      const app = await getNestApp();
      const loggerService = app.get(CliLoggerService);
      const operationRepo = app.get(CliOperationRepository);

      // List all operations
      if (flags.list) {
        const operations = await operationRepo.find({
          order: { createdAt: 'DESC' },
        });

        if (operations.length === 0) {
          console.log(chalk.yellow('\nNo operations found.\n'));
          return;
        }

        console.log(chalk.cyan('\n📜 Operations:\n'));
        for (const op of operations) {
          const statusColor = this.getStatusColor(op.status);
          const hasLogs = loggerService.hasLog(op.id);
          const logsIndicator = hasLogs ? chalk.green('✓') : chalk.dim('-');

          console.log(`   ${logsIndicator} ${chalk.bold(op.id)}`);
          console.log(`      Type: ${op.operationType}`);
          console.log(`      Status: ${statusColor(op.status)}`);
          console.log(`      Created: ${op.createdAt.toLocaleString()}`);
          if (hasLogs) {
            const logsCmd = chalk.cyan(`flui env logs --operation ${op.id}`);
            console.log(`      View logs: ${logsCmd}`);
          }
          console.log('');
        }

        return;
      }

      // Determine which operation to show logs for
      let operationId = flags.operation;

      if (!operationId) {
        // Find most recent operation
        const operations = await operationRepo.find({
          order: { createdAt: 'DESC' },
        });

        if (operations.length === 0) {
          console.log(chalk.yellow('\nNo operations found.\n'));
          console.log(chalk.dim('Create a cluster first:'));
          console.log(`   ${chalk.cyan('flui env create')}\n`);
          return;
        }

        operationId = operations[0].id;
        console.log(
          chalk.dim(
            `\nShowing logs for most recent operation: ${operationId}\n`,
          ),
        );
      }

      // Check if logs exist
      if (!loggerService.hasLog(operationId)) {
        console.log(
          chalk.yellow(`\nNo logs found for operation: ${operationId}\n`),
        );
        console.log(chalk.dim('Available operations with logs:'));
        const logsIds = loggerService.listLogs();
        if (logsIds.length > 0) {
          logsIds.forEach((id) => {
            console.log(`   - ${id}`);
          });
        } else {
          console.log(`   ${chalk.dim('(none)')}`);
        }
        console.log('');
        return;
      }

      // Display logs
      const logs = loggerService.tailLog(operationId, flags.tail);

      console.log(chalk.cyan(`\n📋 Operation Logs: ${operationId}\n`));
      console.log(chalk.dim('─'.repeat(80)));
      console.log(logs);
      console.log(chalk.dim('─'.repeat(80)));
      console.log('');

      // Show real-time monitoring hint
      if (flags.tail < 1000) {
        console.log(chalk.dim('💡 Tip: Use --tail 1000 to see more lines\n'));
      }
    } catch (error) {
      console.log(chalk.red('\n❌ Error:\n'));
      if (error instanceof Error) {
        console.log(`   ${error.message}\n`);
      } else {
        console.log(`   ${String(error)}\n`);
      }
      this.exit(1);
    } finally {
      await closeNestApp();
    }
  }

  private getStatusColor(status: string): (text: string) => string {
    const colors: Record<string, (text: string) => string> = {
      PENDING: chalk.yellow,
      IN_PROGRESS: chalk.blue,
      COMPLETED: chalk.green,
      FAILED: chalk.red,
    };
    return colors[status] || chalk.white;
  }
}
