import { ApiProperty } from '@nestjs/swagger';

export class DnsLookupResponseDto {
  @ApiProperty({ description: 'The hostname that was looked up' })
  hostname: string;

  @ApiProperty({ description: 'The expected IP address' })
  expectedIp: string;

  @ApiProperty({
    description: 'The IP addresses the hostname currently resolves to',
    type: [String],
  })
  resolvedAddresses: string[];

  @ApiProperty({
    description: 'Whether the hostname resolves to the expected IP',
  })
  matches: boolean;
}
