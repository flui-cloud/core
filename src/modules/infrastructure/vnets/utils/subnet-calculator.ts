import IPCIDR from 'ip-cidr';

/**
 * Utility class for calculating and validating subnet IP ranges within VNets
 */
export class SubnetCalculator {
  /**
   * Parses and validates a CIDR notation IP range
   * @param ipRange - CIDR notation (e.g., "10.0.0.0/16")
   * @returns IPCIDR instance
   * @throws Error if CIDR is invalid
   */
  static parseVNetCIDR(ipRange: string): IPCIDR {
    try {
      const cidr = new IPCIDR(ipRange);
      return cidr;
    } catch {
      throw new Error(`Invalid CIDR notation: ${ipRange}`);
    }
  }

  /**
   * Validates that a subnet range fits within a VNet range
   * @param vnetRange - VNet CIDR (e.g., "10.0.0.0/16")
   * @param subnetRange - Subnet CIDR (e.g., "10.0.1.0/24")
   * @returns true if subnet is within VNet range
   */
  static validateSubnetInRange(
    vnetRange: string,
    subnetRange: string,
  ): boolean {
    try {
      const vnetCidr = this.parseVNetCIDR(vnetRange);
      const subnetCidr = this.parseVNetCIDR(subnetRange);

      // Get the start and end addresses
      const vnetStart = vnetCidr.start({ type: 'bigInteger' });
      const vnetEnd = vnetCidr.end({ type: 'bigInteger' });
      const subnetStart = subnetCidr.start({ type: 'bigInteger' });
      const subnetEnd = subnetCidr.end({ type: 'bigInteger' });

      // Check if subnet is within VNet boundaries
      return subnetStart >= vnetStart && subnetEnd <= vnetEnd;
    } catch {
      return false;
    }
  }

  /**
   * Calculates the next available subnet range within a VNet
   * @param vnetRange - VNet CIDR (e.g., "10.0.0.0/16")
   * @param existingSubnets - Array of existing subnet CIDRs
   * @param subnetSize - Desired subnet prefix length (default: 16 for /16)
   * @returns Next available subnet CIDR or null if no space available
   */
  static calculateNextSubnetRange(
    vnetRange: string,
    existingSubnets: string[],
    subnetSize: number = 16,
  ): string | null {
    try {
      const vnetCidr = this.parseVNetCIDR(vnetRange);
      const vnetPrefix = Number.parseInt(vnetRange.split('/')[1], 10);

      // Validate subnet size
      if (subnetSize < vnetPrefix) {
        throw new Error(
          `Subnet size /${subnetSize} must be larger than or equal to VNet size /${vnetPrefix}`,
        );
      }

      // If no existing subnets, return the first subnet of the requested size
      if (!existingSubnets || existingSubnets.length === 0) {
        // For a VNet like 10.0.0.0/16, return 10.0.0.0/16 if subnetSize is 16
        // For a VNet like 10.0.0.0/16, return 10.0.0.0/24 if subnetSize is 24
        const baseIp = vnetRange.split('/')[0];
        return `${baseIp}/${subnetSize}`;
      }

      // Parse all existing subnets
      const existingCidrs = existingSubnets
        .map((subnet) => {
          try {
            return this.parseVNetCIDR(subnet);
          } catch {
            return null;
          }
        })
        .filter((cidr) => cidr !== null);

      // Sort existing subnets by start address
      existingCidrs.sort((a, b) => {
        const startA = a.start({ type: 'bigInteger' }) as bigint;
        const startB = b.start({ type: 'bigInteger' }) as bigint;
        if (startA < startB) return -1;
        if (startA > startB) return 1;
        return 0;
      });

      // Calculate the size of the desired subnet in IP addresses
      const subnetHostCount = BigInt(2 ** (32 - subnetSize));

      // Get VNet boundaries
      const vnetStart = vnetCidr.start({ type: 'bigInteger' }) as bigint;
      const vnetEnd = vnetCidr.end({ type: 'bigInteger' }) as bigint;

      // Try to find a gap between existing subnets
      let candidateStart = vnetStart;

      for (const existingCidr of existingCidrs) {
        const existingStart = existingCidr.start({
          type: 'bigInteger',
        }) as bigint;
        const existingEnd = existingCidr.end({ type: 'bigInteger' }) as bigint;

        // Check if there's space before this existing subnet
        if (candidateStart + subnetHostCount <= existingStart) {
          // Found a gap! Create subnet starting at candidateStart
          const candidateIp = this.bigIntToIp(candidateStart);
          const candidateRange = `${candidateIp}/${subnetSize}`;

          // Validate it fits within VNet
          if (this.validateSubnetInRange(vnetRange, candidateRange)) {
            return candidateRange;
          }
        }

        // Move candidate to after this existing subnet
        candidateStart = existingEnd + BigInt(1);
      }

      // Check if there's space after all existing subnets
      if (candidateStart + subnetHostCount - BigInt(1) <= vnetEnd) {
        const candidateIp = this.bigIntToIp(candidateStart);
        const candidateRange = `${candidateIp}/${subnetSize}`;

        if (this.validateSubnetInRange(vnetRange, candidateRange)) {
          return candidateRange;
        }
      }

      // No space available
      return null;
    } catch (error) {
      throw new Error(`Failed to calculate next subnet: ${error.message}`);
    }
  }

  /**
   * Converts a BigInt IP address to dotted decimal notation
   * @param ipBigInt - IP address as BigInt
   * @returns IP address in dotted decimal notation
   */
  private static bigIntToIp(ipBigInt: bigint): string {
    const num = Number(ipBigInt);
    return [
      (num >>> 24) & 0xff,
      (num >>> 16) & 0xff,
      (num >>> 8) & 0xff,
      num & 0xff,
    ].join('.');
  }

  /**
   * Checks if two subnet ranges overlap
   * @param range1 - First CIDR range
   * @param range2 - Second CIDR range
   * @returns true if ranges overlap
   */
  static doSubnetsOverlap(range1: string, range2: string): boolean {
    try {
      const cidr1 = this.parseVNetCIDR(range1);
      const cidr2 = this.parseVNetCIDR(range2);

      const start1 = cidr1.start({ type: 'bigInteger' }) as bigint;
      const end1 = cidr1.end({ type: 'bigInteger' }) as bigint;
      const start2 = cidr2.start({ type: 'bigInteger' }) as bigint;
      const end2 = cidr2.end({ type: 'bigInteger' }) as bigint;

      // Ranges overlap if either range's start is within the other range
      return (
        (start1 >= start2 && start1 <= end2) ||
        (start2 >= start1 && start2 <= end1)
      );
    } catch {
      return false;
    }
  }
}
