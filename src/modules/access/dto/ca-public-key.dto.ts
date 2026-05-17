import { ApiProperty } from '@nestjs/swagger';

export class CAPublicKeyDto {
  @ApiProperty({
    example: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIC...',
    description: 'CA public key in OpenSSH format',
  })
  publicKey: string;

  @ApiProperty({
    example: 'SHA256:abc123def456...',
    description: 'SHA256 fingerprint of the CA public key',
  })
  fingerprint: string;

  @ApiProperty({
    example: 'ed25519',
    description: 'Key type',
  })
  type: string;

  @ApiProperty({
    example: '2025-01-20T10:00:00Z',
    description: 'CA creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-04-20T10:00:00Z',
    description: 'CA expiration timestamp',
    required: false,
  })
  expiresAt?: Date;
}
