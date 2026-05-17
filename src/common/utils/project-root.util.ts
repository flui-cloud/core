import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Find the project root directory by looking for package.json
 *
 * This function walks up the directory tree from the current file location
 * until it finds a directory containing package.json. This works reliably
 * whether the code is running via ts-node or from compiled JavaScript.
 *
 * @param startPath - Starting directory (defaults to __dirname of this file)
 * @returns Absolute path to the project root directory
 * @throws Error if package.json cannot be found
 */
export function getProjectRoot(startPath: string = __dirname): string {
  let currentPath = startPath;
  const root = path.parse(currentPath).root;

  // Walk up the directory tree until we find package.json or hit the filesystem root
  while (currentPath !== root) {
    const packageJsonPath = path.join(currentPath, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      return currentPath;
    }

    // Move up one directory
    currentPath = path.dirname(currentPath);
  }

  throw new Error(
    `Could not find project root (package.json) starting from ${startPath}. ` +
      `This usually means the file structure is corrupted.`,
  );
}

/**
 * Get absolute path to a file/directory relative to project root
 *
 * @param relativePath - Path relative to project root (e.g., 'src/assets/script.sh')
 * @returns Absolute path to the file/directory
 *
 * @example
 * const scriptPath = getProjectPath('src/modules/instances/assets/scripts/flui-init.sh');
 */
export function getProjectPath(...relativePath: string[]): string {
  const root = getProjectRoot();
  return path.join(root, ...relativePath);
}
