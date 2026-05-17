import { ApiProperty } from '@nestjs/swagger';
import { AuthzInstallStatus } from '../enums/authz-install-status.enum';

export class AuthzInstallResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() clusterId: string;
  @ApiProperty() clusterName: string;
  @ApiProperty({ enum: AuthzInstallStatus }) status: AuthzInstallStatus;
  @ApiProperty({ required: false }) operationId?: string;
  @ApiProperty({ required: false }) errorMessage?: string;
  @ApiProperty({ required: false }) installedAt?: Date;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
