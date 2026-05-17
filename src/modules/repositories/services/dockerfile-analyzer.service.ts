import { Injectable } from '@nestjs/common';

export interface DockerfileAnalysis {
  port: number | null;
  isFluiManaged: boolean;
  baseRuntime: string | null;
  hasMultiStage: boolean;
}

/**
 * Analyzes a Dockerfile to extract deployment-relevant metadata.
 * Operates on raw content strings — no file I/O, no external dependencies.
 */
@Injectable()
export class DockerfileAnalyzerService {
  analyze(content: string): DockerfileAnalysis {
    const lines = content.split('\n');

    return {
      port: this.extractPort(lines),
      isFluiManaged: this.detectFluiManaged(lines),
      baseRuntime: this.extractBaseRuntime(lines),
      hasMultiStage: this.detectMultiStage(lines),
    };
  }

  /**
   * Extracts the first numeric port from EXPOSE directives.
   * Handles formats: `EXPOSE 3000`, `EXPOSE 3000/tcp`, `EXPOSE 3000 8080`.
   */
  private extractPort(lines: string[]): number | null {
    for (const line of lines) {
      const trimmed = line.trim();
      if (!/^EXPOSE\s/i.test(trimmed)) continue;

      const tokens = trimmed.replace(/^EXPOSE\s+/i, '').split(/\s+/);
      for (const token of tokens) {
        const numStr = token.split('/')[0];
        const port = Number.parseInt(numStr, 10);
        if (!Number.isNaN(port) && port > 0 && port <= 65535) {
          return port;
        }
      }
    }
    return null;
  }

  /**
   * Checks if `#flui-managed` appears in the first two lines (case-insensitive).
   */
  private detectFluiManaged(lines: string[]): boolean {
    const first2 = lines.slice(0, 2);
    return first2.some((line) =>
      line.trim().toLowerCase().includes('#flui-managed'),
    );
  }

  /**
   * Extracts the base runtime from the last FROM instruction.
   * Maps common image names to a human-readable runtime label.
   */
  private extractBaseRuntime(lines: string[]): string | null {
    let lastFrom: string | null = null;
    for (const line of lines) {
      const trimmed = line.trim();
      if (/^FROM\s/i.test(trimmed)) {
        lastFrom = trimmed;
      }
    }
    if (!lastFrom) return null;

    // Extract image name (ignore tag and AS alias)
    const imagePart = lastFrom
      .replace(/^FROM\s+/i, '')
      .split(/\s+/)[0]
      .split(':')[0]
      .toLowerCase();

    return this.mapImageToRuntime(imagePart);
  }

  private mapImageToRuntime(image: string): string {
    const runtimeMap: Record<string, string> = {
      node: 'node',
      python: 'python',
      'eclipse-temurin': 'java',
      openjdk: 'java',
      amazoncorretto: 'java',
      'mcr.microsoft.com/dotnet/aspnet': 'dotnet',
      'mcr.microsoft.com/dotnet/sdk': 'dotnet',
      golang: 'go',
      ruby: 'ruby',
      php: 'php',
      elixir: 'elixir',
      nginx: 'nginx',
      alpine: 'alpine',
      debian: 'debian',
      ubuntu: 'ubuntu',
    };

    for (const [key, runtime] of Object.entries(runtimeMap)) {
      if (image === key || image.startsWith(`${key}/`) || image.includes(key)) {
        return runtime;
      }
    }
    return image.split('/').pop() ?? null;
  }

  /**
   * Returns true if the Dockerfile has more than one FROM instruction (multi-stage build).
   */
  private detectMultiStage(lines: string[]): boolean {
    let fromCount = 0;
    for (const line of lines) {
      if (/^FROM\s/i.test(line.trim())) {
        fromCount++;
        if (fromCount > 1) return true;
      }
    }
    return false;
  }
}
