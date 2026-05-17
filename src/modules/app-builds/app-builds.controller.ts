import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  ParseUUIDPipe,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { AppBuildService } from './services/app-build.service';
import { ApplicationDeployService } from '../applications/services/application-deploy.service';
import { TriggerBuildDto } from './dto/trigger-build.dto';
import {
  AppBuildResponseDto,
  TriggerBuildResponseDto,
} from './dto/app-build-response.dto';
import { BuildCheckResponseDto } from './dto/build-check-response.dto';

@ApiTags('App Builds')
@ApiBearerAuth()
@Controller('applications')
export class AppBuildsController {
  constructor(
    private readonly appBuildService: AppBuildService,
    private readonly applicationDeployService: ApplicationDeployService,
  ) {}

  @Post(':applicationId/build')
  @ApiOperation({
    summary: 'Trigger a source build for a GIT_BUILD application',
  })
  @ApiResponse({ status: 201, type: TriggerBuildResponseDto })
  async triggerBuild(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @Body() dto: TriggerBuildDto,
    @Req() req: Request,
  ): Promise<TriggerBuildResponseDto> {
    const user = req.user as AuthenticatedUser;
    const { operation, build } = await this.appBuildService.triggerBuild(
      applicationId,
      dto.buildClusterId,
      user?.userId,
      dto.skipIfSameCommit,
      dto.forceRebuild,
    );

    return {
      operationId: operation.id,
      buildId: build.id,
    };
  }

  @Get(':applicationId/builds')
  @ApiOperation({ summary: 'List builds for an application' })
  @ApiResponse({ status: 200, type: [AppBuildResponseDto] })
  async listBuilds(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
  ): Promise<AppBuildResponseDto[]> {
    return this.appBuildService.findBuildsByApplicationId(applicationId);
  }

  @Get(':applicationId/builds/latest')
  @ApiOperation({ summary: 'Get the latest build for an application' })
  @ApiResponse({ status: 200, type: AppBuildResponseDto })
  async getLatestBuild(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
  ): Promise<AppBuildResponseDto> {
    const build =
      await this.appBuildService.findLatestBuildByApplicationId(applicationId);
    if (!build) {
      throw new NotFoundException(
        `No builds found for application ${applicationId}`,
      );
    }
    return build;
  }

  @Post('builds/:buildId/cancel')
  @ApiOperation({
    summary: 'Cancel an active build (cleans up K8s Job + pods)',
  })
  @ApiResponse({ status: 200 })
  async cancelBuild(
    @Param('buildId', ParseUUIDPipe) buildId: string,
  ): Promise<void> {
    return this.appBuildService.cancelBuild(buildId);
  }

  @Get('builds/:buildId')
  @ApiOperation({ summary: 'Get a specific build by ID' })
  @ApiResponse({ status: 200, type: AppBuildResponseDto })
  async getBuild(
    @Param('buildId', ParseUUIDPipe) buildId: string,
  ): Promise<AppBuildResponseDto> {
    const build = await this.appBuildService.findBuildById(buildId);
    if (!build) {
      throw new NotFoundException(`Build ${buildId} not found`);
    }
    return build;
  }

  @Post('builds/:buildId/refresh')
  @ApiOperation({
    summary:
      'Force a re-poll of the external build provider (GitHub Actions) and return the updated row',
  })
  @ApiResponse({ status: 200, type: AppBuildResponseDto })
  async refreshBuild(
    @Param('buildId', ParseUUIDPipe) buildId: string,
  ): Promise<AppBuildResponseDto> {
    return this.appBuildService.refreshBuildFromProvider(buildId);
  }

  /**
   * Pre-flight check before triggering a build.
   * Resolves HEAD commit SHA, checks for an existing completed build on that commit,
   * and returns current cluster resource availability.
   * Call this before showing the Build button to enable the "skip build" UX.
   */
  @Get(':applicationId/build/check')
  @ApiOperation({
    summary:
      'Pre-flight check: resolve HEAD commit, detect existing build, check cluster resources',
  })
  @ApiResponse({ status: 200, type: BuildCheckResponseDto })
  async checkBuild(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @Req() req: Request,
  ): Promise<BuildCheckResponseDto> {
    const user = req.user as AuthenticatedUser;
    return this.appBuildService.checkBuild(applicationId, user?.userId);
  }

  /**
   * Deploy directly from an existing completed build, skipping the build step entirely.
   * Use the buildId returned by GET .../build/check when canSkipBuild is true.
   */
  @Post(':applicationId/builds/:buildId/deploy')
  @ApiOperation({
    summary: 'Deploy directly from an existing completed build (skip rebuild)',
  })
  @ApiResponse({ status: 201 })
  async deployFromBuild(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @Param('buildId', ParseUUIDPipe) buildId: string,
    @Req() req: Request,
  ) {
    const user = req.user as AuthenticatedUser;
    const build = await this.appBuildService.findBuildById(buildId);
    if (!build) {
      throw new NotFoundException(`Build ${buildId} not found`);
    }
    if (build.applicationId !== applicationId) {
      throw new NotFoundException(
        `Build ${buildId} does not belong to application ${applicationId}`,
      );
    }
    if (!build.imageRef) {
      throw new NotFoundException(
        `Build ${buildId} has no imageRef — cannot deploy`,
      );
    }
    return this.applicationDeployService.triggerDeployWithImage(
      applicationId,
      build.imageRef,
      user?.userId,
    );
  }
}
