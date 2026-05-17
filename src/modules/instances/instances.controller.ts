import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { InstancesService } from './instances.service';
import { InstanceFiltersDto } from './dto/instance-filters.dto';
import { InstanceResponseDto } from './dto/instance-response.dto';
import { ProviderErrorDto } from './dto/provider-error.dto';

@ApiTags('Virtual Instances')
@ApiBearerAuth()
@Controller('instances')
export class InstancesController {
  constructor(private readonly instancesService: InstancesService) {}

  @Get()
  @ApiOperation({ summary: 'List all instances' })
  @ApiQuery({
    name: 'skipCache',
    required: false,
    type: Boolean,
    description: 'Skip cache and fetch fresh data from providers',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all instances',
    type: InstanceResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query() filters: InstanceFiltersDto,
    @Query('skipCache') skipCache?: boolean,
  ): Promise<InstanceResponseDto> {
    const filtersWithCache = { ...filters, skipCache };
    const entities =
      await this.instancesService.listInstances(filtersWithCache);
    const instances = entities.data;
    const errors = entities.partialErrors?.map(
      (e) => new ProviderErrorDto(e.provider, e.message),
    );

    return new InstanceResponseDto(instances, errors);
  }
}
