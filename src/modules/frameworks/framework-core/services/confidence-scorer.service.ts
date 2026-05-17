import { Injectable, Logger } from '@nestjs/common';
import { IDetectionContext } from '../interfaces/detection-context.interface';
import { IDetectionResult, IFrameworkMetadata } from '../interfaces';

/**
 * Service for calculating and comparing confidence scores for framework detection
 */
@Injectable()
export class ConfidenceScorerService {
  private readonly logger = new Logger(ConfidenceScorerService.name);

  /**
   * Calculate adjusted confidence score based on context and metadata
   */
  calculateScore(
    baseScore: number,
    context: IDetectionContext,
    metadata?: IFrameworkMetadata,
  ): number {
    let score = baseScore;

    // Apply penalties
    score = this.applyPenalties(score, context, metadata);

    // Apply boosts
    score = this.applyBoosts(score, context);

    // Clamp to 0-100 range
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Select best detection result from multiple results
   */
  selectBestMatch(results: IDetectionResult[]): IDetectionResult | null {
    if (results.length === 0) {
      return null;
    }

    if (results.length === 1) {
      return results[0];
    }

    // Sort by confidence (descending)
    const sorted = [...results].sort((a, b) => b.confidence - a.confidence);

    const best = sorted[0];
    const secondBest = sorted[1];

    // Log if there's competition
    if (secondBest && Math.abs(best.confidence - secondBest.confidence) < 10) {
      this.logger.warn(
        `Close confidence scores: ${best.framework} (${best.confidence}) vs ${secondBest.framework} (${secondBest.confidence})`,
      );
    }

    return best;
  }

  /**
   * Determine if confidence is sufficient to proceed
   */
  isConfidenceSufficient(confidence: number): {
    sufficient: boolean;
    requiresConfirmation: boolean;
    message?: string;
  } {
    if (confidence >= 80) {
      return { sufficient: true, requiresConfirmation: false };
    }

    if (confidence >= 50) {
      return {
        sufficient: true,
        requiresConfirmation: true,
        message: `Detection confidence is moderate (${confidence}%). Please review the detected framework before proceeding.`,
      };
    }

    return {
      sufficient: false,
      requiresConfirmation: false,
      message: `Detection confidence is too low (${confidence}%). Please provide a .flui.yaml configuration file or a Dockerfile.`,
    };
  }

  /**
   * Apply penalty adjustments to score
   */
  private applyPenalties(
    score: number,
    context: IDetectionContext,
    metadata?: IFrameworkMetadata,
  ): number {
    let adjusted = score;

    // Penalty: Missing critical dependencies
    if (context.packageJson) {
      const hasDependencies =
        context.packageJson.dependencies || context.packageJson.devDependencies;
      if (!hasDependencies) {
        adjusted -= 10;
        this.logger.debug('Penalty: No dependencies found (-10)');
      }
    }

    // Penalty: Unsupported version
    if (metadata && context.packageJson) {
      // This is a placeholder - actual version checking would be more complex
      // For now, we assume versions are supported
    }

    // Penalty: Incompatible Node.js version
    if (
      context.packageJson?.engines?.node &&
      context.nodeVersion &&
      !this.isNodeVersionCompatible(
        context.nodeVersion,
        context.packageJson.engines.node,
      )
    ) {
      adjusted -= 20;
      this.logger.debug('Penalty: Incompatible Node.js version (-20)');
    }

    // Penalty: Non-standard structure (e.g., monorepo without explicit config)
    if (
      this.isLikelyMonorepo(context) &&
      !context.fluiConfig?.framework?.name
    ) {
      adjusted -= 30;
      this.logger.debug(
        'Penalty: Monorepo structure without explicit config (-30)',
      );
    }

    return adjusted;
  }

  /**
   * Apply boost adjustments to score
   */
  private applyBoosts(score: number, context: IDetectionContext): number {
    let adjusted = score;

    // Boost: .nvmrc present (confirms Node version)
    if (context.nodeVersion) {
      adjusted += 5;
      this.logger.debug('Boost: .nvmrc present (+5)');
    }

    // Boost: Lockfile present (stable dependencies)
    if (context.lockfilePresent) {
      adjusted += 5;
      this.logger.debug(
        `Boost: Lockfile present (${context.lockfileName}) (+5)`,
      );
    }

    // Boost: CI config present
    if (context.hasCIConfig) {
      adjusted += 10;
      this.logger.debug('Boost: CI configuration present (+10)');
    }

    // Boost: Tests configured
    if (context.hasTests) {
      adjusted += 10;
      this.logger.debug('Boost: Tests configured (+10)');
    }

    // Boost: User explicitly specified framework in .flui.yaml
    if (context.fluiConfig?.framework?.name) {
      adjusted += 20;
      this.logger.debug('Boost: Framework specified in .flui.yaml (+20)');
    }

    return adjusted;
  }

  /**
   * Check if Node.js version is compatible with requirement
   * Simple implementation - could be enhanced with semver library
   */
  private isNodeVersionCompatible(
    actualVersion: string,
    requiredVersion: string,
  ): boolean {
    // Extract major version numbers
    const actualMajor = Number.parseInt(actualVersion.split('.')[0], 10);
    const requiredMajor = Number.parseInt(
      requiredVersion.replaceAll(/[^\d.]/g, '').split('.')[0],
      10,
    );

    // Simple check: actual should be >= required
    return actualMajor >= requiredMajor;
  }

  /**
   * Detect if repository is likely a monorepo
   */
  private isLikelyMonorepo(context: IDetectionContext): boolean {
    // Check for common monorepo indicators
    const monorepoIndicators = [
      'packages',
      'apps',
      'workspaces',
      'lerna.json',
      'nx.json',
      'pnpm-workspace.yaml',
      'turbo.json',
    ];

    return monorepoIndicators.some((indicator) => {
      return (
        context.files.some((file) => file.includes(indicator)) ||
        context.rootFiles.includes(indicator)
      );
    });
  }
}
