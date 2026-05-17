import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeployHint } from '../services/dockerhub.service';

export class ResourceAmountDto {
  @ApiProperty({ example: '250m' })
  request: string;

  @ApiProperty({ example: '1000m' })
  limit: string;
}

export class ResourceProfileDto {
  @ApiProperty({
    example: 'medium',
    enum: ['nano', 'small', 'medium', 'large', 'xlarge'],
  })
  name: string;

  @ApiProperty({ type: ResourceAmountDto })
  cpu: ResourceAmountDto;

  @ApiProperty({ type: ResourceAmountDto })
  memory: ResourceAmountDto;
}

export class ResourceProfilesResponseDto {
  @ApiProperty({ type: [ResourceProfileDto] })
  profiles: ResourceProfileDto[];

  @ApiProperty({ example: 'small' })
  defaultProfile: string;
}

export class DockerHubSearchResultDto {
  @ApiProperty({ example: 'nginx' })
  name: string;

  @ApiProperty({ example: 'Official build of Nginx.' })
  description: string;

  @ApiProperty({ example: 1000000000 })
  pullCount: number;

  @ApiProperty({ example: 18000 })
  starCount: number;

  @ApiProperty({ example: true })
  isOfficial: boolean;

  @ApiProperty({ example: false })
  isAutomated: boolean;
}

export class ImageSearchResponseDto {
  @ApiProperty({ type: [DockerHubSearchResultDto] })
  results: DockerHubSearchResultDto[];

  @ApiProperty({ example: 10 })
  count: number;
}

export class DockerHubTagDto {
  @ApiProperty({ example: '1.25' })
  name: string;

  @ApiPropertyOptional({ example: 'sha256:abc123...' })
  digest: string;

  @ApiProperty({ example: 12345678, description: 'Size in bytes' })
  size: number;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  lastUpdated: string;

  @ApiProperty({ example: 'amd64' })
  architecture: string;

  @ApiProperty({
    example: true,
    description:
      'True if the image has a linux/amd64 variant (compatible with x86_64 nodes)',
  })
  compatible: boolean;

  @ApiProperty({
    type: [String],
    example: ['linux/amd64', 'linux/arm64/v8'],
    description: 'All platform variants available for this tag',
  })
  platforms: string[];

  @ApiProperty({
    enum: ['deployable', 'needs-sidecar', 'cli-tool', 'build-image', 'base-os'],
    example: 'deployable',
    description:
      'Deployment suitability hint — informational only, user can always override. ' +
      'deployable: ready to deploy; needs-sidecar: requires reverse proxy (e.g. PHP-FPM); ' +
      'cli-tool: command-line tool, no server; build-image: build/dev image; base-os: OS or runtime base image.',
  })
  deployHint: DeployHint;

  @ApiPropertyOptional({
    example:
      'PHP FastCGI Process Manager — requires nginx/Apache reverse proxy to serve HTTP',
    nullable: true,
    description:
      'Human-readable explanation of the deploy hint. Null when deployable.',
  })
  deployHintReason: string | null;
}

export class ImageTagsResponseDto {
  @ApiProperty({ type: [DockerHubTagDto] })
  tags: DockerHubTagDto[];

  @ApiProperty({ example: 200 })
  count: number;

  @ApiPropertyOptional({ example: 2, nullable: true })
  nextPage: number | null;
}

export class ImageVerifyResponseDto {
  @ApiProperty({ example: true })
  exists: boolean;

  @ApiPropertyOptional({ example: 'sha256:abc123...', nullable: true })
  digest: string | null;

  @ApiPropertyOptional({ example: 12345678, nullable: true })
  size: number | null;

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00Z', nullable: true })
  lastUpdated: string | null;
}

export class ImageInspectDto {
  @ApiProperty({ example: 'neosmemo/memos:0.26' })
  imageRef: string;

  @ApiProperty({
    type: [Number],
    example: [5230],
    description:
      'All ports declared via EXPOSE in the image. Empty if not found or unreachable.',
  })
  exposedPorts: number[];

  @ApiPropertyOptional({
    example: 5230,
    nullable: true,
    description:
      'First exposed TCP port — use this as the suggested value for the port field.',
  })
  suggestedPort: number | null;
}
