import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class IpDetectionService {
  private readonly logger = new Logger(IpDetectionService.name);

  /**
   * Auto-detect public IP using external services with fallback
   */
  async getPublicIp(): Promise<string> {
    const services = [
      { url: 'https://api.ipify.org?format=json', parseJson: true, key: 'ip' },
      { url: 'https://ifconfig.me/ip', parseJson: false },
      { url: 'https://icanhazip.com', parseJson: false },
    ];

    for (const service of services) {
      try {
        const response = await axios.get(service.url, {
          timeout: 5000,
          headers: { 'User-Agent': 'Flui-CLI/1.0' },
        });

        const ip = service.parseJson
          ? response.data[service.key]
          : response.data.trim();

        if (this.validateIp(ip)) {
          this.logger.log(`Detected public IP: ${ip} (via ${service.url})`);
          return ip;
        }
      } catch (error) {
        this.logger.warn(
          `Failed to detect IP from ${service.url}: ${error.message}`,
        );
      }
    }

    throw new Error('Unable to detect public IP address from any service');
  }

  /**
   * Validate IP format (IPv4 or IPv6)
   */
  validateIp(ip: string): boolean {
    // IPv4: 0.0.0.0 to 255.255.255.255
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;

    // IPv6: Simplified pattern
    const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;

    if (ipv4Regex.test(ip)) {
      // Validate octets are 0-255
      const octets = ip.split('.').map(Number);
      return octets.every((octet) => octet >= 0 && octet <= 255);
    }

    return ipv6Regex.test(ip);
  }

  /**
   * Validate CIDR notation
   */
  validateCidr(cidr: string): boolean {
    // IPv4 CIDR: 0.0.0.0/0 to 255.255.255.255/32
    const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/(\d{1,2})$/;

    // IPv6 CIDR: ::/0 to ffff:ffff::/128
    const cidr6Regex = /^([0-9a-fA-F:]+)\/(\d{1,3})$/;

    if (cidrRegex.test(cidr)) {
      const [ip, prefix] = cidr.split('/');
      const prefixNum = Number.parseInt(prefix);
      return this.validateIp(ip) && prefixNum >= 0 && prefixNum <= 32;
    }

    if (cidr6Regex.test(cidr)) {
      const [ip, prefix] = cidr.split('/');
      const prefixNum = Number.parseInt(prefix);
      return this.validateIp(ip) && prefixNum >= 0 && prefixNum <= 128;
    }

    return false;
  }

  /**
   * Convert single IP to CIDR notation
   */
  toCidr(ip: string): string {
    if (this.validateCidr(ip)) {
      return ip; // Already in CIDR format
    }

    if (!this.validateIp(ip)) {
      throw new Error(`Invalid IP address: ${ip}`);
    }

    // Convert to CIDR
    if (ip.includes(':')) {
      return `${ip}/128`; // IPv6 single host
    } else {
      return `${ip}/32`; // IPv4 single host
    }
  }

  /**
   * Parse comma-separated list of IPs/CIDRs
   *
   * @example
   * parseCidrList("192.168.1.1,10.0.0.0/24,2001:db8::1/64")
   * // Returns: ["192.168.1.1/32", "10.0.0.0/24", "2001:db8::1/64"]
   */
  parseCidrList(input: string): string[] {
    if (!input || input.trim().length === 0) {
      throw new Error('IP/CIDR list cannot be empty');
    }

    const items = input
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const results: string[] = [];
    const errors: string[] = [];

    for (const item of items) {
      try {
        if (this.validateCidr(item)) {
          results.push(item);
        } else if (this.validateIp(item)) {
          results.push(this.toCidr(item));
        } else {
          errors.push(`Invalid IP or CIDR: ${item}`);
        }
      } catch (error) {
        errors.push(error.message);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Invalid IP/CIDR entries:\n  ${errors.join('\n  ')}`);
    }

    return results;
  }
}
