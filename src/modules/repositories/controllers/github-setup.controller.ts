import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { Admin } from '../../auth/decorators/admin.decorator';
import { GitHubIntegrationConfigService } from '../services/github-integration-config.service';
import {
  GitHubSetupOAuthDto,
  GitHubSetupAppDto,
  GitHubSetupStatusResponseDto,
} from '../dto/github-oauth.dto';

@ApiTags('GitHub Setup')
@ApiBearerAuth()
@Controller('repositories/github/setup')
export class GitHubSetupController {
  constructor(private readonly configService: GitHubIntegrationConfigService) {}

  @Get('status')
  @ApiOperation({
    summary: 'Get GitHub integration setup status',
    description:
      'Returns whether GitHub has been configured and which auth method is active. Call this first to decide which setup flow to show.',
  })
  @ApiResponse({
    status: 200,
    description: 'Setup status',
    type: GitHubSetupStatusResponseDto,
  })
  async getStatus(): Promise<GitHubSetupStatusResponseDto> {
    return this.configService.getSetupStatus();
  }

  @Post('oauth')
  @UseGuards(AdminGuard)
  @Admin()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Configure GitHub OAuth App',
    description:
      'Store GitHub OAuth App credentials (Client ID + Secret). ' +
      'Create your OAuth App at https://github.com/settings/developers. ' +
      'Set the callback URL to: <your-api-url>/api/v1/repositories/github/callback',
  })
  @ApiResponse({
    status: 200,
    description: 'OAuth App configured',
    type: GitHubSetupStatusResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid credentials' })
  async configureOAuth(
    @Body() dto: GitHubSetupOAuthDto,
  ): Promise<GitHubSetupStatusResponseDto> {
    await this.configService.configureOAuth(
      dto.clientId,
      dto.clientSecret,
      dto.callbackUrl,
    );
    return this.configService.getSetupStatus();
  }

  @Post('pat')
  @UseGuards(AdminGuard)
  @Admin()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enable Personal Access Token mode',
    description:
      'Switch to PAT mode. No OAuth App required — each user will connect their own GitHub PAT via POST /repositories/github/connect-pat.',
  })
  @ApiResponse({
    status: 200,
    description: 'PAT mode enabled',
    type: GitHubSetupStatusResponseDto,
  })
  async configurePat(): Promise<GitHubSetupStatusResponseDto> {
    await this.configService.configurePatMode();
    return this.configService.getSetupStatus();
  }

  @Post('github-app')
  @UseGuards(AdminGuard)
  @Admin()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Configure GitHub App',
    description:
      'Store GitHub App credentials (App ID, Private Key, Webhook Secret). ' +
      'Create your GitHub App at https://github.com/settings/apps/new. ' +
      'Required permissions: contents (write), actions (read+write), workflows (write), packages (write). ' +
      'Subscribe to webhook events: installation, workflow_run, push.',
  })
  @ApiResponse({
    status: 200,
    description: 'GitHub App configured',
    type: GitHubSetupStatusResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid credentials' })
  async configureGitHubApp(
    @Body() dto: GitHubSetupAppDto,
  ): Promise<GitHubSetupStatusResponseDto> {
    await this.configService.configureGitHubApp(dto);
    return this.configService.getSetupStatus();
  }

  @Delete()
  @UseGuards(AdminGuard)
  @Admin()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Reset GitHub integration configuration',
    description:
      'Removes all stored GitHub OAuth App config. Does not revoke existing user tokens.',
  })
  @ApiResponse({ status: 204, description: 'Config reset' })
  async resetConfig(): Promise<void> {
    await this.configService.resetConfig();
  }
}
