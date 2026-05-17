import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CrashDiagnosesRepository } from '../repositories/crash-diagnoses.repository';
import { CrashDiagnosisDto } from '../dto/crash-diagnosis.dto';
import { CrashDiagnosisEntity } from '../entities/crash-diagnosis.entity';
import { CrashDiagnosisStatusFilter } from '../enums/crash-diagnosis-status-filter.enum';

@ApiTags('applications')
@ApiBearerAuth()
@Controller('applications/:applicationId/crash-diagnoses')
export class CrashDiagnosesController {
  constructor(
    private readonly crashDiagnosesRepository: CrashDiagnosesRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List crash diagnoses for an application' })
  @ApiQuery({
    name: 'status',
    enum: CrashDiagnosisStatusFilter,
    required: false,
  })
  async list(
    @Param('applicationId') applicationId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
    @Query(
      'status',
      new ParseEnumPipe(CrashDiagnosisStatusFilter, { optional: true }),
    )
    status?: CrashDiagnosisStatusFilter,
  ): Promise<CrashDiagnosisDto[]> {
    const entries = await this.crashDiagnosesRepository.findByApplication(
      applicationId,
      {
        status: status ?? CrashDiagnosisStatusFilter.ALL,
        limit: limit ?? 50,
        offset: offset ?? 0,
      },
    );
    return entries.map((e) => this.toDto(e));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single crash diagnosis' })
  async getOne(
    @Param('applicationId') applicationId: string,
    @Param('id') id: string,
  ): Promise<CrashDiagnosisDto> {
    const entry = await this.crashDiagnosesRepository.findById(id);
    if (entry?.applicationId !== applicationId) {
      throw new NotFoundException(`Crash diagnosis ${id} not found`);
    }
    return this.toDto(entry);
  }

  @Post(':id/dismiss')
  @ApiOperation({ summary: 'Mark a crash diagnosis as resolved' })
  async dismiss(
    @Param('applicationId') applicationId: string,
    @Param('id') id: string,
  ): Promise<CrashDiagnosisDto> {
    const entry = await this.crashDiagnosesRepository.findById(id);
    if (entry?.applicationId !== applicationId) {
      throw new NotFoundException(`Crash diagnosis ${id} not found`);
    }
    await this.crashDiagnosesRepository.markResolved(id);
    const updated = await this.crashDiagnosesRepository.findById(id);
    return this.toDto(updated);
  }

  private toDto(entity: CrashDiagnosisEntity): CrashDiagnosisDto {
    return {
      id: entity.id,
      applicationId: entity.applicationId,
      podName: entity.podName,
      containerName: entity.containerName,
      category: entity.category,
      severity: entity.severity,
      title: entity.title,
      explanation: entity.explanation,
      evidence: entity.evidence,
      patternMatchedKey: entity.patternMatchedKey,
      suggestedAction: entity.suggestedAction,
      resolvedAt: entity.resolvedAt,
      createdAt: entity.createdAt,
    };
  }
}
