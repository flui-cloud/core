import { IsEnum, IsFQDN, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CertificateProvider } from '../../providers/enums/certificate-provider.enum';

export class ConfigureSystemIngressDto {
  @ApiProperty({
    description: 'FQDN for the flui-api ingress (e.g. api.example.com)',
    example: 'api.example.com',
  })
  @IsNotEmpty()
  @IsFQDN()
  apiDomain: string;

  @ApiProperty({
    description: 'FQDN for the flui-web ingress (e.g. app.example.com)',
    example: 'app.example.com',
  })
  @IsNotEmpty()
  @IsFQDN()
  appDomain: string;

  @ApiPropertyOptional({
    enum: CertificateProvider,
    description:
      'Certificate issuer to use. Defaults to LETS_ENCRYPT (production)',
    default: CertificateProvider.LETS_ENCRYPT,
  })
  @IsOptional()
  @IsEnum(CertificateProvider)
  issuer?: CertificateProvider;
}
