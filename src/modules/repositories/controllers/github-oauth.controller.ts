import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  Query,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { GitHubOAuthService } from '../services/github-oauth.service';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import {
  GitHubOAuthInitiateResponseDto,
  GitHubOAuthCallbackDto,
  GitHubOAuthStatusResponseDto,
  ConnectPatDto,
  ConnectPatResponseDto,
  PublicRepoSearchResultDto,
  PublicRepoBranchDto,
} from '../dto/github-oauth.dto';

@ApiTags('GitHub OAuth')
@ApiBearerAuth()
@Controller('repositories/github')
export class GitHubOAuthController {
  private readonly logger = new Logger(GitHubOAuthController.name);

  constructor(private readonly githubOAuthService: GitHubOAuthService) {}

  @Get('connect')
  @ApiOperation({
    summary: 'Initiate GitHub OAuth flow',
    description:
      'Returns a GitHub authorization URL. Only available when setup method is oauth_app.',
  })
  @ApiResponse({
    status: 200,
    description: 'OAuth URL generated',
    type: GitHubOAuthInitiateResponseDto,
  })
  @ApiResponse({
    status: 503,
    description: 'GitHub integration not configured',
  })
  async connect(@Req() req: Request): Promise<GitHubOAuthInitiateResponseDto> {
    const { userId } = req.user as AuthenticatedUser;
    return this.githubOAuthService.initiateOAuth(userId);
  }

  @Get('callback')
  @ApiOperation({ summary: 'Handle GitHub OAuth callback' })
  @ApiResponse({
    status: 302,
    description: 'Redirect to frontend after successful authentication',
  })
  @ApiResponse({ status: 400, description: 'Invalid callback parameters' })
  async callback(@Req() req: Request, @Res() res: Response): Promise<void> {
    const query = req.query as unknown as GitHubOAuthCallbackDto;

    if (query.error) {
      this.logger.warn(
        `GitHub OAuth error: ${query.error} - ${query.error_description}`,
      );
      return res.redirect(
        `${this.getFrontendUrl()}/repositories?error=${encodeURIComponent(query.error_description || query.error)}`,
      );
    }

    if (!query.code || !query.state) {
      throw new BadRequestException(
        `Missing required OAuth parameter: ${query.code ? 'state' : 'code'}`,
      );
    }

    try {
      const result = await this.githubOAuthService.handleCallback(
        query.code,
        query.state,
      );
      this.logger.log(`OAuth callback successful for user ${result.userId}`);
      return res.redirect(
        `${this.getFrontendUrl()}/repositories?connected=true`,
      );
    } catch (error) {
      this.logger.error(`OAuth callback failed: ${error.message}`, error.stack);
      return res.redirect(
        `${this.getFrontendUrl()}/repositories?error=${encodeURIComponent(error.message)}`,
      );
    }
  }

  @Post('connect-pat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Connect GitHub via Personal Access Token',
    description:
      'Only available when setup method is pat. The token is validated then stored encrypted.',
  })
  @ApiResponse({
    status: 200,
    description: 'PAT connected',
    type: ConnectPatResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid token or wrong auth mode' })
  @ApiResponse({
    status: 503,
    description: 'GitHub integration not configured',
  })
  async connectPat(
    @Req() req: Request,
    @Body() dto: ConnectPatDto,
  ): Promise<ConnectPatResponseDto> {
    const { userId } = req.user as AuthenticatedUser;
    return this.githubOAuthService.connectWithPat(
      userId,
      dto.personalAccessToken,
    );
  }

  @Get('status')
  @ApiOperation({
    summary: 'Check GitHub connection status for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Connection status',
    type: GitHubOAuthStatusResponseDto,
  })
  async getStatus(@Req() req: Request): Promise<GitHubOAuthStatusResponseDto> {
    const { userId } = req.user as AuthenticatedUser;
    return this.githubOAuthService.getStatus(userId);
  }

  @Post('disconnect')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Disconnect GitHub for the current user' })
  @ApiResponse({ status: 204, description: 'GitHub disconnected successfully' })
  @ApiResponse({
    status: 404,
    description: 'No active GitHub connection found',
  })
  async disconnect(@Req() req: Request): Promise<void> {
    const { userId } = req.user as AuthenticatedUser;
    await this.githubOAuthService.revokeAccess(userId);
  }

  @Post('test')
  @ApiOperation({ summary: 'Test GitHub connection for the current user' })
  @ApiResponse({ status: 200, description: 'Connection test result' })
  async testConnection(
    @Req() req: Request,
  ): Promise<{ success: boolean; message: string }> {
    const { userId } = req.user as AuthenticatedUser;
    return this.githubOAuthService.testConnection(userId);
  }

  @Get('search/public')
  @ApiOperation({
    summary: 'Search public GitHub repositories',
    description:
      'Proxies to GitHub search API. Uses system GITHUB_TOKEN if configured (5000 req/hr), otherwise unauthenticated (60 req/hr).',
  })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Max results to return (default: 10, max: 100)',
  })
  @ApiResponse({
    status: 200,
    description: 'Matching public repositories',
    type: [PublicRepoSearchResultDto],
  })
  async searchPublicRepositories(
    @Query('q') q: string,
    @Query('limit') limit = 10,
  ): Promise<PublicRepoSearchResultDto[]> {
    if (!q) {
      throw new BadRequestException('Query parameter "q" is required');
    }
    return this.githubOAuthService.searchPublicRepositories(q, Number(limit));
  }

  @Get('public/branches')
  @ApiOperation({
    summary: 'List branches of a public GitHub repository',
    description:
      'Proxies to GitHub branches API. No connected GitHub account required.',
  })
  @ApiQuery({
    name: 'repo',
    required: true,
    description: 'Repository in owner/repo format (e.g. "vercel/next.js")',
  })
  @ApiResponse({
    status: 200,
    description: 'Branch list',
    type: [PublicRepoBranchDto],
  })
  async getPublicRepoBranches(
    @Query('repo') repo: string,
  ): Promise<PublicRepoBranchDto[]> {
    if (!repo) {
      throw new BadRequestException('Query parameter "repo" is required');
    }
    return this.githubOAuthService.getPublicRepoBranches(repo);
  }

  private getFrontendUrl(): string {
    return process.env.FRONTEND_URL || 'http://localhost:4200';
  }
}
