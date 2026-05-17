import { NodeSizeDto } from '../../../src/modules/providers/dto/node-size.dto';
import chalk from 'chalk';

export interface ServerTypeValidationResult {
  isValid: boolean;
  serverType?: NodeSizeDto;
  suggestedAlternative?: NodeSizeDto;
  suggestedRegion?: string;
  reason?: string;
}

export interface RegionAvailabilityResult {
  available: boolean;
  serverType?: NodeSizeDto;
  region: string;
}

export interface ServerTypeSimilarityScore {
  serverType: NodeSizeDto;
  score: number;
  reasons: string[];
}

export class ServerTypeValidatorService {
  /**
   * Validate if a server type exists and is available
   */
  validateServerType(
    requestedType: string,
    availableTypes: NodeSizeDto[],
    region?: string,
  ): ServerTypeValidationResult {
    // Find exact match
    const exactMatch = availableTypes.find(
      (type) => type.id === requestedType || type.name === requestedType,
    );

    if (exactMatch) {
      // Check if it's deprecated
      if (exactMatch.deprecated) {
        const alternative = this.findSimilarServerType(
          exactMatch,
          availableTypes,
          region,
        );
        return {
          isValid: false,
          serverType: exactMatch,
          suggestedAlternative: alternative,
          reason: `Server type '${requestedType}' is deprecated and no longer available`,
        };
      }

      // Check if it's available in the requested region
      if (region) {
        // Use real-time availability if present
        if (exactMatch.availability && exactMatch.availability.length > 0) {
          const av = exactMatch.availability.find((a) => a.location === region);

          if (!av) {
            return {
              isValid: false,
              serverType: exactMatch,
              reason: `Server type '${requestedType}' is not supported in region '${region}'`,
            };
          }

          if (!av.available) {
            const alternative = this.findSimilarServerType(
              exactMatch,
              availableTypes,
              region,
            );
            return {
              isValid: false,
              serverType: exactMatch,
              suggestedAlternative: alternative,
              reason: `Server type '${requestedType}' is temporarily out of stock in region '${region}'`,
            };
          }
        } else {
          // Fallback to old logic for cached data
          const locationExists = exactMatch.locations.some(
            (loc) => loc.name === region,
          );
          if (!locationExists) {
            return {
              isValid: false,
              serverType: exactMatch,
              reason: `Server type '${requestedType}' is not available in region '${region}'`,
            };
          }
        }
      }

      return {
        isValid: true,
        serverType: exactMatch,
      };
    }

    // No exact match - find similar alternative
    const firstAvailable = availableTypes.find((type) => !type.deprecated);
    const alternative = this.findSimilarServerType(
      firstAvailable || availableTypes[0],
      availableTypes,
      region,
    );

    return {
      isValid: false,
      suggestedAlternative: alternative,
      reason: `Server type '${requestedType}' not found`,
    };
  }

  /**
   * Find the most similar server type based on specs
   */
  findSimilarServerType(
    reference: NodeSizeDto,
    availableTypes: NodeSizeDto[],
    region?: string,
  ): NodeSizeDto | undefined {
    const candidates = availableTypes.filter((type) => {
      // Exclude deprecated types
      if (type.deprecated) return false;

      // Exclude the reference itself
      if (type.id === reference.id) return false;

      // Filter by region if specified
      if (region) {
        // Use real-time availability if present
        if (type.availability && type.availability.length > 0) {
          const av = type.availability.find((a) => a.location === region);
          if (!av || !av.available || av.deprecated) return false;
        } else {
          // Fallback to old logic
          const locationExists = type.locations.some(
            (loc) => loc.name === region,
          );
          if (!locationExists) return false;
        }
      }

      return true;
    });

    if (candidates.length === 0) {
      return undefined;
    }

    // Calculate similarity scores
    const scoredCandidates = candidates.map((candidate) => {
      const score = this.calculateSimilarityScore(reference, candidate);
      return score;
    });

    // Sort by score (highest first)
    scoredCandidates.sort((a, b) => b.score - a.score);

    return scoredCandidates[0].serverType;
  }

  /**
   * Calculate similarity score between two server types
   */
  private calculateSimilarityScore(
    reference: NodeSizeDto,
    candidate: NodeSizeDto,
  ): ServerTypeSimilarityScore {
    let score = 0;
    const reasons: string[] = [];

    // CPU type match (high weight)
    if (reference.cpuType === candidate.cpuType) {
      score += 30;
      reasons.push(`Same CPU type (${candidate.cpuType})`);
    }

    // Core count similarity (high weight)
    const coreDiff = Math.abs(reference.cores - candidate.cores);
    if (coreDiff === 0) {
      score += 40;
      reasons.push(`Same core count (${candidate.cores})`);
    } else if (coreDiff === 1) {
      score += 30;
      reasons.push(
        `Similar core count (${candidate.cores} vs ${reference.cores})`,
      );
    } else if (coreDiff <= 2) {
      score += 15;
    }

    // Memory similarity (medium weight)
    const memoryDiff = Math.abs(reference.memory - candidate.memory);
    const memoryDiffPercent = memoryDiff / reference.memory;
    if (memoryDiff === 0) {
      score += 20;
      reasons.push(`Same memory (${candidate.memory}GB)`);
    } else if (memoryDiffPercent <= 0.25) {
      score += 15;
      reasons.push(
        `Similar memory (${candidate.memory}GB vs ${reference.memory}GB)`,
      );
    } else if (memoryDiffPercent <= 0.5) {
      score += 10;
    }

    // Storage type match (low weight)
    if (reference.storageType === candidate.storageType) {
      score += 5;
    }

    // Architecture match (medium weight)
    if (reference.architecture === candidate.architecture) {
      score += 10;
    }

    // Price similarity (medium weight)
    const refPrice = this.getMonthlyPrice(reference);
    const candPrice = this.getMonthlyPrice(candidate);
    if (refPrice && candPrice) {
      const priceDiffPercent = Math.abs(refPrice - candPrice) / refPrice;
      if (priceDiffPercent <= 0.2) {
        score += 15;
        reasons.push(
          `Similar price (€${candPrice.toFixed(2)}/mo vs €${refPrice.toFixed(2)}/mo)`,
        );
      } else if (priceDiffPercent <= 0.5) {
        score += 10;
      } else if (priceDiffPercent <= 1) {
        score += 5;
      }
    }

    return {
      serverType: candidate,
      score,
      reasons,
    };
  }

  /**
   * Get monthly price for a server type
   */
  private getMonthlyPrice(serverType: NodeSizeDto): number | null {
    // Get first available price (usually location-specific)
    if (serverType.prices.length === 0) {
      return null;
    }

    const price = serverType.prices[0];
    if (price.priceMonthly) {
      return Number.parseFloat(price.priceMonthly.gross);
    }

    // Fallback: calculate from hourly price
    if (price.priceHourly) {
      return Number.parseFloat(price.priceHourly.gross) * 730; // ~730 hours per month
    }

    return null;
  }

  /**
   * Get formatted price information for a server type
   */
  getFormattedPrice(serverType: NodeSizeDto): {
    monthly?: string;
    hourly?: string;
    currency: string;
  } {
    if (serverType.prices.length === 0) {
      return {
        currency: 'EUR',
      };
    }

    const price = serverType.prices[0]; // Get first location price
    const currency = 'EUR'; // Default currency for European providers

    return {
      monthly: price.priceMonthly ? price.priceMonthly.gross : undefined,
      hourly: price.priceHourly ? price.priceHourly.gross : undefined,
      currency,
    };
  }

  /**
   * Get available regions for a server type
   * Uses real-time availability data if available, falls back to locations
   */
  getAvailableRegions(serverType: NodeSizeDto): string[] {
    // Use real-time availability if present
    if (serverType.availability && serverType.availability.length > 0) {
      return serverType.availability
        .filter((av) => av.available && !av.deprecated)
        .map((av) => av.location);
    }

    // Fallback to old logic for cached data without availability
    return serverType.locations
      .filter((loc) => !loc.deprecation)
      .map((loc) => loc.name);
  }

  /**
   * Check if server type is available in a specific region (real-time check)
   */
  isAvailableInRegion(serverType: NodeSizeDto, region: string): boolean {
    // Use real-time availability if present
    if (serverType.availability && serverType.availability.length > 0) {
      const av = serverType.availability.find((a) => a.location === region);
      return av ? av.available && !av.deprecated : false;
    }

    // Fallback to old logic for cached data
    const loc = serverType.locations.find((l) => l.name === region);
    return loc ? !loc.deprecation : false;
  }

  /**
   * Get regions where server type is out of stock
   */
  getOutOfStockRegions(serverType: NodeSizeDto): string[] {
    if (!serverType.availability || serverType.availability.length === 0) {
      return [];
    }

    return serverType.availability
      .filter((av) => !av.available || av.deprecated)
      .map((av) => av.location);
  }

  /**
   * Format availability info for display
   */
  formatAvailabilityInfo(serverType: NodeSizeDto): string {
    const available = this.getAvailableRegions(serverType);
    const outOfStock = this.getOutOfStockRegions(serverType);

    if (available.length === 0) {
      return chalk.red('Out of stock in all regions');
    }

    let info = `Available in: ${available.join(', ')}`;
    if (outOfStock.length > 0) {
      info += `\nOut of stock: ${outOfStock.join(', ')}`;
    }
    return info;
  }

  /**
   * Format server type info as string
   */
  formatServerTypeInfo(serverType: NodeSizeDto): string {
    const price = this.getFormattedPrice(serverType);
    const regions = this.getAvailableRegions(serverType);

    let info = `${serverType.name} (${serverType.cores} vCPU, ${serverType.memory}GB RAM, ${serverType.disk}GB ${serverType.storageType})`;

    if (price.monthly) {
      info += `\n  • Monthly cost: €${price.monthly}`;
    }
    if (price.hourly) {
      info += `\n  • Hourly cost: €${price.hourly}`;
    }
    if (regions.length > 0) {
      info += `\n  • Available in: ${regions.join(', ')}`;
    }

    return info;
  }

  /**
   * Find first available server type across multiple regions
   * Checks regions in priority order and returns first match
   */
  findServerTypeInRegions(
    requestedType: string,
    availableTypes: NodeSizeDto[],
    regions: string[],
  ): RegionAvailabilityResult | null {
    for (const region of regions) {
      const validation = this.validateServerType(
        requestedType,
        availableTypes,
        region,
      );

      if (validation.isValid && validation.serverType) {
        return {
          available: true,
          serverType: validation.serverType,
          region,
        };
      }
    }

    return null;
  }

  /**
   * Find best fallback server type across multiple regions
   * Tries fallback types in order across all regions
   */
  findFallbackServerTypeInRegions(
    fallbackTypes: string[],
    availableTypes: NodeSizeDto[],
    regions: string[],
  ): RegionAvailabilityResult | null {
    // Try each fallback type across all regions
    for (const fallbackType of fallbackTypes) {
      for (const region of regions) {
        const validation = this.validateServerType(
          fallbackType,
          availableTypes,
          region,
        );

        if (validation.isValid && validation.serverType) {
          return {
            available: true,
            serverType: validation.serverType,
            region,
          };
        }
      }
    }

    return null;
  }

  /**
   * Validate server type with multi-region fallback
   * Returns the best match considering region availability
   */
  validateServerTypeWithRegionFallback(
    requestedType: string,
    availableTypes: NodeSizeDto[],
    preferredRegion: string,
    fallbackRegions: string[],
    fallbackTypes: string[],
  ): ServerTypeValidationResult {
    // First try: requested type in preferred region
    const preferredResult = this.validateServerType(
      requestedType,
      availableTypes,
      preferredRegion,
    );

    if (preferredResult.isValid) {
      return preferredResult;
    }

    // Second try: requested type in fallback regions
    const allRegions = [preferredRegion, ...fallbackRegions];
    const regionResult = this.findServerTypeInRegions(
      requestedType,
      availableTypes,
      fallbackRegions,
    );

    if (regionResult?.available) {
      return {
        isValid: true,
        serverType: regionResult.serverType,
        suggestedRegion: regionResult.region,
        reason: `Server type '${requestedType}' is available in region '${regionResult.region}' instead of '${preferredRegion}'`,
      };
    }

    // Third try: fallback types across all regions
    const fallbackResult = this.findFallbackServerTypeInRegions(
      fallbackTypes,
      availableTypes,
      allRegions,
    );

    if (fallbackResult?.available) {
      return {
        isValid: false,
        suggestedAlternative: fallbackResult.serverType,
        suggestedRegion: fallbackResult.region,
        reason:
          preferredResult.reason ||
          `Server type '${requestedType}' not available`,
      };
    }

    // No alternatives found
    return {
      isValid: false,
      reason: `Server type '${requestedType}' and fallback types not available in any region`,
    };
  }
}
