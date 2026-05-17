import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

/**
 * CLI Logger Service
 *
 * Manages operation logs for async CLI operations:
 * - Writes logs to ~/.flui/logs/<operation-id>.log
 * - Allows real-time log streaming
 * - Persists logs for later inspection
 */
@Injectable()
export class CliLoggerService {
  private readonly logger = new Logger(CliLoggerService.name);
  private readonly fluiDir = path.join(os.homedir(), '.flui');
  private readonly logsDir = path.join(this.fluiDir, 'logs');

  constructor() {
    this.ensureLogsDir();
  }

  /**
   * Ensure ~/.flui/logs directory exists
   */
  private ensureLogsDir(): void {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true, mode: 0o755 });
    }
  }

  /**
   * Get log file path for operation
   */
  getLogFilePath(operationId: string): string {
    return path.join(this.logsDir, `${operationId}.log`);
  }

  /**
   * Write log message to operation log file
   */
  writeLog(
    operationId: string,
    message: string,
    level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' = 'INFO',
  ): void {
    const logFilePath = this.getLogFilePath(operationId);
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] [${level}] ${message}\n`;

    try {
      fs.appendFileSync(logFilePath, logLine, { encoding: 'utf-8' });
    } catch (error) {
      this.logger.error(`Failed to write log to ${logFilePath}:`, error);
    }
  }

  /**
   * Read entire log file
   */
  readLog(operationId: string): string {
    const logFilePath = this.getLogFilePath(operationId);

    if (!fs.existsSync(logFilePath)) {
      return '';
    }

    try {
      return fs.readFileSync(logFilePath, 'utf-8');
    } catch (error) {
      this.logger.error(`Failed to read log from ${logFilePath}:`, error);
      return '';
    }
  }

  /**
   * Read last N lines from log file
   */
  tailLog(operationId: string, lines: number = 100): string {
    const content = this.readLog(operationId);
    if (!content) return '';

    const allLines = content.split('\n');
    const lastLines = allLines.slice(-lines);
    return lastLines.join('\n');
  }

  /**
   * Stream log file (for real-time monitoring)
   * Returns a readable stream
   */
  streamLog(operationId: string): fs.ReadStream | null {
    const logFilePath = this.getLogFilePath(operationId);

    if (!fs.existsSync(logFilePath)) {
      return null;
    }

    return fs.createReadStream(logFilePath, { encoding: 'utf-8' });
  }

  /**
   * Check if log file exists
   */
  hasLog(operationId: string): boolean {
    const logFilePath = this.getLogFilePath(operationId);
    return fs.existsSync(logFilePath);
  }

  /**
   * Delete log file
   */
  deleteLog(operationId: string): void {
    const logFilePath = this.getLogFilePath(operationId);

    if (fs.existsSync(logFilePath)) {
      fs.unlinkSync(logFilePath);
      this.logger.debug(`Deleted log file: ${logFilePath}`);
    }
  }

  /**
   * List all operation IDs with logs
   */
  listLogs(): string[] {
    if (!fs.existsSync(this.logsDir)) {
      return [];
    }

    const files = fs.readdirSync(this.logsDir);
    return files
      .filter((f) => f.endsWith('.log'))
      .map((f) => f.replace('.log', ''));
  }

  /**
   * Clean old logs (older than N days)
   */
  cleanOldLogs(daysOld: number = 30): number {
    const files = fs.readdirSync(this.logsDir);
    const now = Date.now();
    const maxAge = daysOld * 24 * 60 * 60 * 1000;
    let deleted = 0;

    for (const file of files) {
      if (!file.endsWith('.log')) continue;

      const filePath = path.join(this.logsDir, file);
      const stats = fs.statSync(filePath);
      const age = now - stats.mtimeMs;

      if (age > maxAge) {
        fs.unlinkSync(filePath);
        deleted++;
      }
    }

    this.logger.log(`Cleaned ${deleted} old log files`);
    return deleted;
  }
}
