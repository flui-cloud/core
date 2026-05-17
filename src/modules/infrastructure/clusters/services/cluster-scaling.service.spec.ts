import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ClusterScalingService } from './cluster-scaling.service';
import { ClusterStatus } from '../entities/cluster.entity';
import { NodeType } from '../entities/cluster-node.entity';
import { OperationType } from '../../servers/entities/infrastructure-operations.entity';

describe('ClusterScalingService', () => {
  function makeService(
    overrides: {
      cluster?: any;
      firewallId?: string | null;
      queueAdd?: jest.Mock;
      saveOp?: jest.Mock;
    } = {},
  ) {
    const queueAdd = overrides.queueAdd ?? jest.fn().mockResolvedValue({});
    const saveOp =
      overrides.saveOp ??
      jest
        .fn()
        .mockImplementation((op) => Promise.resolve({ ...op, id: 'op-1' }));

    const clusterRepo = {
      findOne: jest.fn().mockResolvedValue(overrides.cluster ?? null),
    };
    const nodeRepo = { delete: jest.fn(), save: jest.fn() };
    const opRepo = {
      create: jest.fn().mockImplementation((x) => x),
      save: saveOp,
    };
    const queue = { add: queueAdd } as any;
    const firewallsService = {
      getFirewallByClusterId: jest
        .fn()
        .mockResolvedValue(
          overrides.firewallId === undefined
            ? { id: 'fw-1' }
            : overrides.firewallId
              ? { id: overrides.firewallId }
              : null,
        ),
    } as any;

    const capabilitiesFactory = {
      isProviderSupported: jest.fn().mockReturnValue(true),
      getCapabilitiesProvider: jest.fn(),
    };
    const nodeScalingService = {
      assertNodeUnlocked: jest.fn().mockResolvedValue(undefined),
    };
    const svc = new ClusterScalingService(
      clusterRepo as any,
      nodeRepo as any,
      opRepo as any,
      queue,
      firewallsService,
      capabilitiesFactory as any,
      nodeScalingService as any,
    );
    return { svc, queueAdd, saveOp, clusterRepo, opRepo, firewallsService };
  }

  const baseCluster = (extra: Partial<any> = {}) => ({
    id: 'c-1',
    name: 'test',
    provider: 'HETZNER',
    status: ClusterStatus.READY,
    metadata: { vnetConfig: { vnetId: 'vnet-1', subnetId: 'sub-1' } },
    nodes: [
      { id: 'n-master', nodeType: NodeType.MASTER, serverName: 'master' },
      { id: 'n-w1', nodeType: NodeType.WORKER, serverName: 'w1' },
    ],
    nodeCount: 2,
    minNodes: 1,
    maxNodes: 5,
    masterIpAddress: '1.2.3.4',
    bootstrapKeyId: 'bk-1',
    ...extra,
  });

  describe('addWorkers', () => {
    it('queues add-worker job with default count=1', async () => {
      const { svc, queueAdd } = makeService({ cluster: baseCluster() });
      const op = await svc.addWorkers('c-1');
      expect(op.operationType).toBe(OperationType.ADD_WORKER);
      expect(queueAdd).toHaveBeenCalledWith(
        'add-worker',
        expect.objectContaining({ count: 1, providerFirewallIds: ['fw-1'] }),
        expect.any(Object),
      );
    });

    it('rejects count > 5', async () => {
      const { svc } = makeService({ cluster: baseCluster() });
      await expect(svc.addWorkers('c-1', 6)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rejects count < 1', async () => {
      const { svc } = makeService({ cluster: baseCluster() });
      await expect(svc.addWorkers('c-1', 0)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rejects when cluster not found', async () => {
      const { svc } = makeService({ cluster: null });
      await expect(svc.addWorkers('c-1', 1)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('rejects when cluster has no VNet', async () => {
      const { svc } = makeService({
        cluster: baseCluster({ metadata: {} }),
      });
      await expect(svc.addWorkers('c-1', 1)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rejects when cluster status not READY', async () => {
      const { svc } = makeService({
        cluster: baseCluster({ status: ClusterStatus.CREATING }),
      });
      await expect(svc.addWorkers('c-1', 1)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rejects when projected count exceeds maxNodes', async () => {
      const { svc } = makeService({
        cluster: baseCluster({ maxNodes: 2 }), // already 2 nodes (master+1)
      });
      await expect(svc.addWorkers('c-1', 2)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('passes empty providerFirewallIds when no firewall found', async () => {
      const { svc, queueAdd } = makeService({
        cluster: baseCluster(),
        firewallId: null,
      });
      await svc.addWorkers('c-1', 1);
      expect(queueAdd).toHaveBeenCalledWith(
        'add-worker',
        expect.objectContaining({ providerFirewallIds: [] }),
        expect.any(Object),
      );
    });
  });

  describe('removeWorker', () => {
    it('queues remove-worker job for a worker', async () => {
      const cluster = baseCluster({
        nodes: [
          { id: 'n-master', nodeType: NodeType.MASTER, serverName: 'master' },
          { id: 'n-w1', nodeType: NodeType.WORKER, serverName: 'w1' },
          { id: 'n-w2', nodeType: NodeType.WORKER, serverName: 'w2' },
        ],
      });
      const { svc, queueAdd } = makeService({ cluster });
      const op = await svc.removeWorker('c-1', 'n-w1');
      expect(op.operationType).toBe(OperationType.REMOVE_WORKER);
      expect(queueAdd).toHaveBeenCalledWith(
        'remove-worker',
        expect.objectContaining({ clusterId: 'c-1', nodeId: 'n-w1' }),
        expect.any(Object),
      );
    });

    it('rejects removing the master', async () => {
      const { svc } = makeService({ cluster: baseCluster() });
      await expect(svc.removeWorker('c-1', 'n-master')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rejects when removal would violate minNodes', async () => {
      const { svc } = makeService({
        cluster: baseCluster({ minNodes: 1 }),
      });
      await expect(svc.removeWorker('c-1', 'n-w1')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rejects unknown nodeId', async () => {
      const { svc } = makeService({ cluster: baseCluster() });
      await expect(svc.removeWorker('c-1', 'unknown')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('rejects unknown cluster', async () => {
      const { svc } = makeService({ cluster: null });
      await expect(svc.removeWorker('c-1', 'n-w1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
