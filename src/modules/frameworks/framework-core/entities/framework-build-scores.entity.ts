import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

/**
 * Stores deployability scores per framework for GitHub Actions and Railpack paths.
 * Railpack scores are updatable via test suite automation.
 * GitHub Actions scores are seeded statically and rarely change.
 */
@Entity('framework_build_scores')
export class FrameworkBuildScoresEntity {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  framework: string;

  @Column({ type: 'int' })
  githubActionsScore: number;

  @Column({ type: 'int' })
  railpackScore: number;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'varchar', length: 50, default: 'system' })
  updatedBy: string;
}
