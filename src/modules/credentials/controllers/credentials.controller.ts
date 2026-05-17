import { BadRequestException, Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { CredentialsStatusService } from '../services/credentials-status.service';
import { CredentialsStatusResponseDto } from '../../repositories/dto/ghcr-pat.dto';

@ApiTags('credentials')
@Controller('credentials')
export class CredentialsController {
  constructor(private readonly credentialsStatus: CredentialsStatusService) {}

  @Get('status')
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Aggregated status of all user credentials (GitHub App, GHCR PAT, providers)',
    description:
      'Used by the dashboard banner to determine whether anything needs the ' +
      "user's attention. Server-cached for ~5 minutes per user.",
  })
  async getStatus(@Req() req: Request): Promise<CredentialsStatusResponseDto> {
    const user = req.user as AuthenticatedUser | undefined;
    if (!user?.userId) {
      throw new BadRequestException('Authenticated user has no userId');
    }
    return this.credentialsStatus.getStatus(user.userId);
  }
}
