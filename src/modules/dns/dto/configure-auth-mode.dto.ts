import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export class ConfigureAuthModeDto {
  @ApiProperty({
    description: 'Auth mode to activate on the cluster',
    enum: ['local', 'oidc'],
    example: 'local',
  })
  @IsEnum(['local', 'oidc'])
  authMode: 'local' | 'oidc';

  @ApiProperty({
    description:
      'JWT secret for HS256 token signing (required when authMode=local)',
    example: 'a-32-char-random-secret-string-here',
    required: false,
  })
  @IsString()
  @IsOptional()
  jwtSecret?: string;

  @ApiProperty({
    description:
      'Admin email to seed on first boot (optional when authMode=local)',
    example: 'admin@flui.cloud',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  adminEmail?: string;

  @ApiProperty({
    description:
      'Admin password to seed on first boot (optional when authMode=local, auto-generated if omitted)',
    required: false,
  })
  @IsString()
  @IsOptional()
  adminPassword?: string;

  @ApiProperty({
    description: 'OIDC issuer URL (required when authMode=oidc)',
    example: 'https://auth.example.com',
    required: false,
  })
  @IsString()
  @IsOptional()
  oidcIssuer?: string;

  @ApiProperty({
    description: 'OIDC client ID / audience (required when authMode=oidc)',
    example: '123456789@project',
    required: false,
  })
  @IsString()
  @IsOptional()
  oidcClientId?: string;
}
