import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class RegisterCADto {
  @ApiProperty({
    description: 'SSH CA public key in OpenSSH format (ssh-ed25519 or ssh-rsa)',
    example:
      'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAbCdEfGhIjKlMnOpQrStUvWxYz...',
  })
  @IsString()
  publicKey: string;

  @ApiPropertyOptional({
    description: 'Optional name for the CA (defaults to flui-ca-{date})',
    example: 'flui-ca-2025-12-31',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description:
      'If true, replaces existing active CA by setting it to inactive',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  replace?: boolean;

  @ApiPropertyOptional({
    description: 'Optional metadata to store with the CA',
    example: { source: 'cli', version: '1.0.0' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class RegisterCAResponseDto {
  @ApiProperty({
    description: 'CA keypair ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'CA name',
    example: 'flui-ca-2025-12-31',
  })
  name: string;

  @ApiProperty({
    description: 'CA public key in OpenSSH format',
    example:
      'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAbCdEfGhIjKlMnOpQrStUvWxYz...',
  })
  publicKey: string;

  @ApiProperty({
    description: 'SHA256 fingerprint of the public key',
    example: 'SHA256:abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  })
  fingerprint: string;

  @ApiProperty({
    description: 'Key type (ed25519 or rsa)',
    example: 'ed25519',
  })
  type: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-12-31T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Optional expiration date',
    example: '2026-03-31T10:00:00.000Z',
  })
  expiresAt?: Date;

  @ApiProperty({
    description: 'Status message',
    example: 'CA registered successfully',
  })
  message: string;
}
