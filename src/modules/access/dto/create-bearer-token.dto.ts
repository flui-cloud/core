import { IsBoolean, IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CloudProvider } from '../../providers/enums/cloud-provider.enum';

export class CreateBearerTokenDto {
  @ApiProperty({
    description: 'Provider type',
    enum: CloudProvider,
    example: CloudProvider.CONTABO,
  })
  @IsNotEmpty()
  @IsEnum(CloudProvider)
  provider: CloudProvider;

  @ApiProperty({ description: 'Client ID for provider authentication' })
  @IsNotEmpty()
  @IsString()
  client_id: string;

  @ApiProperty({ description: 'Client secret for provider authentication' })
  @IsNotEmpty()
  @IsString()
  client_secret: string;

  @ApiProperty({ description: 'Username for provider authentication' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ description: 'Password for provider authentication' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ description: 'Save credentials and auto refresh token' })
  @IsNotEmpty()
  @IsBoolean()
  save_credentials: boolean;
}
