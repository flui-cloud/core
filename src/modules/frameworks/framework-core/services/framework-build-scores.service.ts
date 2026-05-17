import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FrameworkBuildScoresEntity } from '../entities/framework-build-scores.entity';

export interface BuildScores {
  githubActions: number;
  railpack: number;
}

const SEED_SCORES: Array<{
  framework: string;
  githubActionsScore: number;
  railpackScore: number;
}> = [
  { framework: 'nextjs', githubActionsScore: 95, railpackScore: 90 },
  { framework: 'nuxt', githubActionsScore: 95, railpackScore: 80 },
  { framework: 'svelte-kit', githubActionsScore: 95, railpackScore: 80 },
  { framework: 'angular', githubActionsScore: 90, railpackScore: 75 },
  { framework: 'nestjs', githubActionsScore: 95, railpackScore: 45 },
  { framework: 'spring-boot', githubActionsScore: 95, railpackScore: 15 },
  { framework: 'django', githubActionsScore: 95, railpackScore: 50 },
  { framework: 'fastapi', githubActionsScore: 95, railpackScore: 55 },
  { framework: 'aspnet-core', githubActionsScore: 95, railpackScore: 10 },
  { framework: 'express', githubActionsScore: 90, railpackScore: 70 },
  { framework: 'react-router', githubActionsScore: 90, railpackScore: 75 },
  { framework: 'remix', githubActionsScore: 90, railpackScore: 70 },
  { framework: 'flask', githubActionsScore: 90, railpackScore: 55 },
  { framework: 'rails', githubActionsScore: 85, railpackScore: 60 },
  { framework: 'laravel', githubActionsScore: 85, railpackScore: 55 },
  { framework: 'go', githubActionsScore: 90, railpackScore: 65 },
  { framework: 'phoenix', githubActionsScore: 85, railpackScore: 40 },
];

/**
 * Manages per-framework deployability scores for GitHub Actions and Railpack paths.
 * Seeds default values on first boot. Railpack scores are updatable by automation.
 */
@Injectable()
export class FrameworkBuildScoresService implements OnModuleInit {
  private readonly logger = new Logger(FrameworkBuildScoresService.name);

  constructor(
    @InjectRepository(FrameworkBuildScoresEntity)
    private readonly scoresRepository: Repository<FrameworkBuildScoresEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedIfEmpty();
  }

  async getScores(framework: string): Promise<BuildScores> {
    const normalizedFramework = this.normalizeFrameworkKey(framework);
    const entity = await this.scoresRepository.findOne({
      where: { framework: normalizedFramework },
    });

    if (!entity) {
      // Unknown framework — return conservative defaults
      return { githubActions: 50, railpack: 0 };
    }

    return {
      githubActions: entity.githubActionsScore,
      railpack: entity.railpackScore,
    };
  }

  async updateRailpackScore(
    framework: string,
    score: number,
    updatedBy = 'system',
  ): Promise<void> {
    const normalizedFramework = this.normalizeFrameworkKey(framework);
    await this.scoresRepository.upsert(
      { framework: normalizedFramework, railpackScore: score, updatedBy },
      ['framework'],
    );
    this.logger.log(
      `Updated Railpack score for ${normalizedFramework}: ${score} (by ${updatedBy})`,
    );
  }

  async getAllScores(): Promise<FrameworkBuildScoresEntity[]> {
    return this.scoresRepository.find({ order: { framework: 'ASC' } });
  }

  private async seedIfEmpty(): Promise<void> {
    const count = await this.scoresRepository.count();
    if (count > 0) {
      return;
    }

    this.logger.log('Seeding framework build scores');
    await this.scoresRepository.save(
      SEED_SCORES.map((s) => this.scoresRepository.create(s)),
    );
    this.logger.log(
      `Seeded ${SEED_SCORES.length} framework build score entries`,
    );
  }

  /**
   * Normalize FrameworkType enum values to DB keys (lowercase with hyphens).
   * E.g. 'NEXTJS' → 'nextjs', 'SPRING_BOOT' → 'spring-boot'
   */
  private normalizeFrameworkKey(framework: string): string {
    return framework.toLowerCase().replaceAll('_', '-');
  }
}
