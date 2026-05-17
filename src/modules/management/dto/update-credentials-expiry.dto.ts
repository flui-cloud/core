import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, ValidateIf } from 'class-validator';

export class UpdateCredentialsExpiryDto {
  @ApiPropertyOptional({
    description:
      'New expiry date for the active credential. Pass null to clear the expiry.',
    example: '2027-03-14T00:00:00.000Z',
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsDateString()
  expiresAt: string | null;
}
