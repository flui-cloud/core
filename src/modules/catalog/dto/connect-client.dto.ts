import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConnectClientDto {
  @ApiProperty({
    description:
      'UUID of the building-block catalog install this client should connect to RIGHT NOW (not a permanent link — the connection can be swapped or released with subsequent Connect/Disconnect calls). Must be on the same cluster as the client. The backend validates that the BB slug matches one of spec.linkedBuildingBlocks[].ref of the client manifest and wires envs via secretKeyRef — passwords never flow through this API.',
  })
  @IsUUID()
  targetInstallId: string;
}
