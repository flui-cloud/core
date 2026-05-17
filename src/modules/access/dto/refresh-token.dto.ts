import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { CloudProvider } from '../../providers/enums/cloud-provider.enum';

export class ProviderRefreshTokenDto {
  @ApiProperty({
    description: 'Provider type',
    enum: CloudProvider,
    example: CloudProvider.CONTABO,
  })
  @IsNotEmpty()
  @IsEnum(CloudProvider)
  provider: CloudProvider;

  @ApiProperty({ description: 'Refresh token' })
  @IsNotEmpty()
  @IsString()
  refresh_token: string;

  @ApiProperty({ description: 'Client ID for provider authentication' })
  @IsNotEmpty()
  @IsString()
  client_id: string;

  @ApiProperty({ description: 'Client secret for provider authentication' })
  @IsNotEmpty()
  @IsString()
  client_secret: string;
}
