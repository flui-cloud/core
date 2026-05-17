import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DockerHubService } from '../services/dockerhub.service';
import { ResourceProfilesService } from '../services/resource-profiles.service';
import {
  ImageSearchResponseDto,
  ImageTagsResponseDto,
  ImageVerifyResponseDto,
  ImageInspectDto,
  ResourceProfilesResponseDto,
} from '../dto/images.dto';

@ApiTags('Images')
@ApiBearerAuth()
@Controller('images')
export class ImagesController {
  constructor(
    private readonly dockerHubService: DockerHubService,
    private readonly resourceProfilesService: ResourceProfilesService,
  ) {}

  /**
   * List available resource profiles for application deployments
   */
  @Get('profiles')
  @ApiOperation({
    summary: 'List resource profiles',
    description:
      'Returns the available CPU/RAM profiles for application deployments. ' +
      'Use the profile name when creating an application.',
  })
  @ApiResponse({ status: 200, type: ResourceProfilesResponseDto })
  getProfiles(): ResourceProfilesResponseDto {
    return this.resourceProfilesService.getProfiles();
  }

  /**
   * Search public images on DockerHub
   */
  @Get('search')
  @ApiOperation({
    summary: 'Search Docker images',
    description: 'Search public images on DockerHub by name or keyword',
  })
  @ApiQuery({
    name: 'q',
    description: 'Search query (e.g. "nginx", "node", "postgres")',
    example: 'nginx',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Max results to return (default: 10, max: 25)',
    example: 10,
  })
  @ApiResponse({ status: 200, type: ImageSearchResponseDto })
  async search(
    @Query('q') q: string,
    @Query('limit') limit?: string,
  ): Promise<ImageSearchResponseDto> {
    if (!q || q.trim().length === 0) {
      throw new BadRequestException('Query parameter "q" is required');
    }

    const pageSize = Math.min(Number.parseInt(limit || '10', 10) || 10, 25);
    const results = await this.dockerHubService.searchImages(
      q.trim(),
      pageSize,
    );

    return { results, count: results.length };
  }

  /**
   * List available tags for a Docker image
   */
  @Get('tags')
  @ApiOperation({
    summary: 'List image tags',
    description:
      'List available tags for a DockerHub image. Supports official (nginx) and user images (myuser/myimage)',
  })
  @ApiQuery({
    name: 'image',
    description: 'Image name without tag (e.g. "nginx", "myuser/myimage")',
    example: 'nginx',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Tags per page (default: 25, max: 100)',
    example: 25,
  })
  @ApiResponse({ status: 200, type: ImageTagsResponseDto })
  async listTags(
    @Query('image') image: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<ImageTagsResponseDto> {
    if (!image || image.trim().length === 0) {
      throw new BadRequestException('Query parameter "image" is required');
    }

    const pageNum = Math.max(Number.parseInt(page || '1', 10) || 1, 1);
    const pageSize = Math.min(Number.parseInt(limit || '25', 10) || 25, 100);

    return this.dockerHubService.listTags(image.trim(), pageNum, pageSize);
  }

  /**
   * Inspect a Docker image and return its exposed ports
   */
  @Get('inspect')
  @ApiOperation({
    summary: 'Inspect image ports',
    description:
      'Fetches the image manifest from Docker Registry API v2 and returns the ports declared ' +
      'via EXPOSE. No image pull required. Returns empty list for private or unreachable images.',
  })
  @ApiQuery({
    name: 'imageRef',
    description:
      'Full image reference with optional tag (e.g. "neosmemo/memos:0.26", "nginx")',
    example: 'neosmemo/memos:0.26',
  })
  @ApiResponse({ status: 200, type: ImageInspectDto })
  async inspect(@Query('imageRef') imageRef: string): Promise<ImageInspectDto> {
    if (!imageRef || imageRef.trim().length === 0) {
      throw new BadRequestException('Query parameter "imageRef" is required');
    }

    const exposedPorts = await this.dockerHubService.inspectImagePorts(
      imageRef.trim(),
    );
    return {
      imageRef: imageRef.trim(),
      exposedPorts,
      suggestedPort: exposedPorts.length > 0 ? exposedPorts[0] : null,
    };
  }

  /**
   * Verify if a Docker image exists on DockerHub
   */
  @Get('verify')
  @ApiOperation({
    summary: 'Verify image exists',
    description:
      'Check if a Docker image (with optional tag) exists on DockerHub. ' +
      'Returns digest and metadata if found.',
  })
  @ApiQuery({
    name: 'image',
    description:
      'Full image reference with optional tag (e.g. "nginx:1.25", "nginx:latest")',
    example: 'nginx:1.25',
  })
  @ApiResponse({ status: 200, type: ImageVerifyResponseDto })
  async verify(@Query('image') image: string): Promise<ImageVerifyResponseDto> {
    if (!image || image.trim().length === 0) {
      throw new BadRequestException('Query parameter "image" is required');
    }

    return this.dockerHubService.verifyImage(image.trim());
  }
}
