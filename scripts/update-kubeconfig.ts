/**
 * One-time script to update the kubeconfig for an existing cluster.
 *
 * Usage:
 *   npx ts-node scripts/update-kubeconfig.ts <cluster-id> <ssh-master-ip> [server-ip]
 *
 * It SSHes to <ssh-master-ip> (the reachable public IP), fetches
 * /etc/rancher/k3s/k3s.yaml, and writes [server-ip] into the kubeconfig
 * server field. When [server-ip] is omitted it defaults to the cluster's
 * masterPrivateIp — the K3s API is reachable only inside the VNet (6443 is
 * never public), so intra-cluster traffic stays on the private network.
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
  const sshMasterIp = process.argv[3];
  const serverIpArg = process.argv[4];

  if (!clusterId || !sshMasterIp) {
    console.error(
      'Usage: npx ts-node scripts/update-kubeconfig.ts <cluster-id> <ssh-master-ip> [server-ip]',
    );
    process.exit(1);
  }

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

  const serverIp = serverIpArg ?? cluster.masterPrivateIp ?? sshMasterIp;
  console.log(
    `Cluster: ${cluster.name} (${cluster.id}) — fetching from ${sshMasterIp}, server will be ${serverIp}`,
  );

  const raw = execSync(
    `ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@${sshMasterIp} "sudo cat /etc/rancher/k3s/k3s.yaml"`,
    { encoding: 'utf-8' },
  );

  const kubeconfig = raw.replace(/127\.0\.0\.1/g, serverIp);
  console.log(`Kubeconfig fetched (${kubeconfig.length} bytes)`);
  console.log('Server URL:', kubeconfig.match(/server: .*/)?.[0]);

  cluster.kubeconfigEncrypted = encryptionService.encrypt(kubeconfig);
  await clusterRepo.save(cluster);

  console.log('Kubeconfig updated successfully!');
  await app.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
