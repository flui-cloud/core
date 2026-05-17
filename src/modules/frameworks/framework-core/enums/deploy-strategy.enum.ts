export enum DeployStrategy {
  /**
   * Let Railpack handle everything automatically.
   * Used for high-confidence frameworks with clear, predictable structure.
   */
  RAILPACK_DIRECT = 'railpack_direct',

  /**
   * Use Railpack but inject explicit build/start command overrides via railway.toml.
   * Used when the framework is recognized but commands are ambiguous or need guidance.
   */
  RAILPACK_WITH_OVERRIDES = 'railpack_with_overrides',

  /**
   * Skip Railpack entirely and use a generated or provided Dockerfile.
   * Used for stacks where Railpack support is inconsistent (.NET, Elixir, etc.).
   */
  DOCKERFILE = 'dockerfile',

  /**
   * Project structure is not ready for deployment.
   * Build is blocked with human-readable recommendations.
   */
  NEEDS_ADJUSTMENT = 'needs_adjustment',
}
