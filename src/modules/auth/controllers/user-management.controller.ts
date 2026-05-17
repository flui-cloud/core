import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { Admin } from '../decorators/admin.decorator';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import {
  CreateIdentityUserDto,
  CreatedIdentityUserDto,
} from '../dto/create-identity-user.dto';
import { UpdateIdentityRoleDto } from '../dto/update-identity-role.dto';
import { ListIdentityUsersQueryDto } from '../dto/list-identity-users.query';
import {
  ResetPasswordDto,
  ResetPasswordResultDto,
} from '../dto/reset-password.dto';
import { UserManagementService } from '../services/user-management.service';
import { IdentityUser } from '../interfaces/identity-directory.interface';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth/users')
@UseGuards(JwtAuthGuard, AdminGuard)
@Admin()
export class UserManagementController {
  constructor(private readonly users: UserManagementService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new identity user (admin)' })
  @ApiCreatedResponse({ type: CreatedIdentityUserDto })
  create(@Body() dto: CreateIdentityUserDto): Promise<CreatedIdentityUserDto> {
    return this.users.createUser(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List identity users (admin)' })
  list(@Query() query: ListIdentityUsersQueryDto): Promise<IdentityUser[]> {
    return this.users.listUsers(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get identity user details (admin)' })
  async get(@Param('id') id: string): Promise<IdentityUser> {
    const user = await this.users.getUser(id);
    if (!user) {
      // 404 thrown via service in delete/setRole; replicate here for direct GET
      throw new (await import('@nestjs/common')).NotFoundException(
        `User ${id} not found`,
      );
    }
    return user;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an identity user (admin)' })
  async delete(
    @Param('id') id: string,
    @Request() req: { user: AuthenticatedUser },
  ): Promise<void> {
    await this.users.deleteUser(id, req.user.userId);
  }

  @Patch(':id/role')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Change role for an identity user (admin)' })
  async setRole(
    @Param('id') id: string,
    @Body() dto: UpdateIdentityRoleDto,
    @Request() req: { user: AuthenticatedUser },
  ): Promise<void> {
    await this.users.setRole(id, dto.role, req.user.userId);
  }

  @Post(':id/reset-password')
  @ApiOperation({
    summary: 'Reset password / resend invite for an identity user (admin)',
  })
  @ApiOkResponse({ type: ResetPasswordResultDto })
  reset(
    @Param('id') id: string,
    @Body() dto: ResetPasswordDto,
  ): Promise<ResetPasswordResultDto> {
    return this.users.resetPassword(id, dto.sendInvite);
  }
}
