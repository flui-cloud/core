/**
 * One-time script to update the kubeconfig for an existing cluster.
 *
 * Usage:
 *   npx ts-node scripts/update-kubeconfig.ts <cluster-id> <master-ip>
 *
 * It will SSH to the master, fetch /etc/rancher/k3s/k3s.yaml,
 * replace 127.0.0.1 with the master IP, encrypt it, and update the DB.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { EncryptionService } from '../src/modules/shared/encryption/services/encryption.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClusterEntity } from '../src/modules/infrastructure/clusters/entities/cluster.entity';
import { Repository } from 'typeorm';
import { execSync } from 'child_process';

async function main() {
  const clusterId = process.argv[2];
  const masterIp = process.argv[3];

  if (!clusterId || !masterIp) {
    console.error('Usage: npx ts-node scripts/update-kubeconfig.ts <cluster-id> <master-ip>');
    process.exit(1);
  }

  console.log(`Fetching kubeconfig from ${masterIp}...`);

  // Read kubeconfig via SSH using the CLI CA key
  const raw = execSync(
    `ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@${masterIp} "sudo cat /etc/rancher/k3s/k3s.yaml"`,
    { encoding: 'utf-8' },
  );

  // Replace localhost with real IP
  const kubeconfig = raw.replace(/127\.0\.0\.1/g, masterIp);
  console.log(`Kubeconfig fetched (${kubeconfig.length} bytes)`);
  console.log('Server URL:', kubeconfig.match(/server: .*/)?.[0]);

  // Boot NestJS to get EncryptionService and DB connection
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error'],
  });

  const encryptionService = app.get(EncryptionService);
  const clusterRepo = app.get<Repository<ClusterEntity>>(
    getRepositoryToken(ClusterEntity),
  );

  const cluster = await clusterRepo.findOne({ where: { id: clusterId } });
  if (!cluster) {
    console.error(`Cluster ${clusterId} not found`);
    await app.close();
    process.exit(1);
  }

  console.log(`Updating kubeconfig for cluster: ${cluster.name} (${cluster.id})`);
  cluster.kubeconfigEncrypted = encryptionService.encrypt(kubeconfig);
  await clusterRepo.save(cluster);

  console.log('Kubeconfig updated successfully!');
  await app.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
