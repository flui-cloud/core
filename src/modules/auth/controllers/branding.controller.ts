import {
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { Admin } from '../decorators/admin.decorator';
import {
  IDENTITY_BRANDING,
  IIdentityBranding,
} from '../interfaces/identity-branding.interface';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth/branding')
@UseGuards(JwtAuthGuard, AdminGuard)
@Admin()
export class BrandingController {
  constructor(
    @Inject(IDENTITY_BRANDING)
    private readonly branding: IIdentityBranding,
  ) {}

  @Post('resync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Re-apply branding (logos + label policy) on the identity provider (admin)',
  })
  @ApiOkResponse({ schema: { example: { applied: true } } })
  async resync(): Promise<{ applied: boolean }> {
    const applied = await this.branding.ensureBranding(true);
    return { applied };
  }
}
