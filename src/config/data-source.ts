import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { SSHKeyEntity } from '../modules/access/entities/ssh-key.entity';
import { ProviderCredentialsEntity } from '../modules/access/entities/credentials.entity';
import { ApiTokenEntity } from '../modules/access/entities/api-token.entity';
import { ProviderConfigurationEntity } from '../modules/management/entities/provider-configuration.entity';
import { InfrastructureOperationEntity } from '../modules/infrastructure/servers/entities/infrastructure-operations.entity';
import { ServerEntity } from '../modules/infrastructure/servers/entities/server.entity';
import { ClusterEntity } from '../modules/infrastructure/clusters/entities/cluster.entity';
import { ClusterNodeEntity } from '../modules/infrastructure/clusters/entities/cluster-node.entity';
import { NodeBillableIntervalEntity } from '../modules/infrastructure/clusters/entities/node-billable-interval.entity';
import { VolumeBillableIntervalEntity } from '../modules/infrastructure/clusters/entities/volume-billable-interval.entity';
import { CAKeypairEntity } from '../modules/access/entities/ca-keypair.entity';

// Load environment variables from .env file
config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number.parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'developer',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'myapp_dev',
  entities: [
    SSHKeyEntity,
    ProviderCredentialsEntity,
    ApiTokenEntity,
    ProviderConfigurationEntity,
    InfrastructureOperationEntity,
    ServerEntity,
    ClusterEntity,
    ClusterNodeEntity,
    NodeBillableIntervalEntity,
    VolumeBillableIntervalEntity,
    CAKeypairEntity,
  ],
  migrations: ['src/migrations/**/*.ts'],
  synchronize: false,
  logging: true,
});
