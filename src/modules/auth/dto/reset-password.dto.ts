import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description:
      'When true triggers an invite email (requires SMTP). When false a fresh temp password is generated and returned.',
  })
  @IsBoolean()
  sendInvite: boolean;
}

export class ResetPasswordResultDto {
  @ApiPropertyOptional({
    description: 'Returned only when sendInvite=false. Shown once.',
  })
  tempPassword?: string;
}
