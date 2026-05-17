import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfigureIssuerDto {
  @ApiProperty({
    description:
      "Email address for ACME (Let's Encrypt) certificate registration",
    example: 'admin@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  acmeEmail: string;
}
