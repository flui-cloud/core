import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Req,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { AppBuildService } from '../services/app-build.service';
import { TriggerStandaloneBuildDto } from '../dto/trigger-standalone-build.dto';
import { AppBuildResponseDto } from '../dto/app-build-response.dto';

@ApiTags('Builds')
@ApiBearerAuth()
@Controller('builds')
export class StandaloneBuildsController {
  constructor(private readonly appBuildService: AppBuildService) {}

  /**
   * Trigger a standalone build (no application required).
   * Used in the wizard flow: build first, then create the app from the completed build.
   * Subscribe to WS namespace /applications with subscribe:build { buildId } for real-time events.
   */
  @Post()
  @ApiOperation({ summary: 'Trigger a standalone build (wizard flow)' })
  @ApiResponse({ status: 201, type: AppBuildResponseDto })
  async triggerStandaloneBuild(
    @Body() dto: TriggerStandaloneBuildDto,
    @Req() req: Request,
  ): Promise<AppBuildResponseDto> {
    const user = req.user as AuthenticatedUser;
    const build = await this.appBuildService.triggerStandaloneBuild(
      dto.gitUrl,
      dto.branch,
      dto.targetClusterId,
      dto.buildClusterId ?? dto.targetClusterId,
      user?.userId,
    );
    return build;
  }

  /**
   * Get a build by ID (works for both standalone and app-linked builds).
   */
  @Get(':buildId')
  @ApiOperation({ summary: 'Get a build by ID' })
  @ApiResponse({ status: 200, type: AppBuildResponseDto })
  async getBuild(
    @Param('buildId', ParseUUIDPipe) buildId: string,
  ): Promise<AppBuildResponseDto> {
    const build = await this.appBuildService.findBuildById(buildId);
    if (!build) throw new NotFoundException(`Build ${buildId} not found`);
    return build;
  }

  /**
   * Delete a standalone build (only allowed when the build is not yet linked to an application).
   * Cancels the build if still active, then removes the DB record.
   */
  @Delete(':buildId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a standalone build (only if not yet linked to an app)',
  })
  @ApiResponse({ status: 204 })
  async deleteStandaloneBuild(
    @Param('buildId', ParseUUIDPipe) buildId: string,
  ): Promise<void> {
    return this.appBuildService.deleteStandaloneBuild(buildId);
  }
}
