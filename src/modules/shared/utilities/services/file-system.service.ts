import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { existsSync } from 'node:fs';

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  children?: FileTreeNode[];
}

@Injectable()
export class FileSystemService {
  private readonly logger = new Logger(FileSystemService.name);

  async readFile(filePath: string): Promise<string> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    } catch (error) {
      this.logger.error(`Failed to read file: ${filePath}`, error.stack);
      throw new Error(`Failed to read file: ${filePath}`);
    }
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    try {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, content, 'utf-8');
    } catch (error) {
      this.logger.error(`Failed to write file: ${filePath}`, error.stack);
      throw new Error(`Failed to write file: ${filePath}`);
    }
  }

  fileExists(filePath: string): boolean {
    return existsSync(filePath);
  }

  async fileExistsAsync(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${filePath}`, error.stack);
      throw new Error(`Failed to delete file: ${filePath}`);
    }
  }

  async scanDirectory(dirPath: string): Promise<string[]> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      return entries.map((entry) => entry.name);
    } catch (error) {
      this.logger.error(`Failed to scan directory: ${dirPath}`, error.stack);
      throw new Error(`Failed to scan directory: ${dirPath}`);
    }
  }

  async getFileTree(
    rootPath: string,
    maxDepth = 5,
    currentDepth = 0,
  ): Promise<FileTreeNode> {
    try {
      const stat = await fs.stat(rootPath);
      const name = path.basename(rootPath);

      if (stat.isFile()) {
        return {
          name,
          path: rootPath,
          type: 'file',
          size: stat.size,
        };
      }

      if (currentDepth >= maxDepth) {
        return {
          name,
          path: rootPath,
          type: 'directory',
        };
      }

      const entries = await fs.readdir(rootPath, { withFileTypes: true });
      const children: FileTreeNode[] = [];

      for (const entry of entries) {
        if (entry.name.startsWith('.')) continue;
        if (entry.name === 'node_modules') continue;

        const fullPath = path.join(rootPath, entry.name);
        const childNode = await this.getFileTree(
          fullPath,
          maxDepth,
          currentDepth + 1,
        );
        children.push(childNode);
      }

      return {
        name,
        path: rootPath,
        type: 'directory',
        children,
      };
    } catch (error) {
      this.logger.error(`Failed to get file tree: ${rootPath}`, error.stack);
      throw new Error(`Failed to get file tree: ${rootPath}`);
    }
  }

  async createDirectory(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      this.logger.error(`Failed to create directory: ${dirPath}`, error.stack);
      throw new Error(`Failed to create directory: ${dirPath}`);
    }
  }

  async deleteDirectory(dirPath: string): Promise<void> {
    try {
      await fs.rm(dirPath, { recursive: true, force: true });
    } catch (error) {
      this.logger.error(`Failed to delete directory: ${dirPath}`, error.stack);
      throw new Error(`Failed to delete directory: ${dirPath}`);
    }
  }

  async copyFile(source: string, destination: string): Promise<void> {
    try {
      await fs.mkdir(path.dirname(destination), { recursive: true });
      await fs.copyFile(source, destination);
    } catch (error) {
      this.logger.error(
        `Failed to copy file from ${source} to ${destination}`,
        error.stack,
      );
      throw new Error(`Failed to copy file from ${source} to ${destination}`);
    }
  }

  async getFileSize(filePath: string): Promise<number> {
    try {
      const stat = await fs.stat(filePath);
      return stat.size;
    } catch (error) {
      this.logger.error(`Failed to get file size: ${filePath}`, error.stack);
      throw new Error(`Failed to get file size: ${filePath}`);
    }
  }

  joinPath(...paths: string[]): string {
    return path.join(...paths);
  }

  resolvePath(...paths: string[]): string {
    return path.resolve(...paths);
  }

  basename(filePath: string): string {
    return path.basename(filePath);
  }

  dirname(filePath: string): string {
    return path.dirname(filePath);
  }

  extname(filePath: string): string {
    return path.extname(filePath);
  }
}
