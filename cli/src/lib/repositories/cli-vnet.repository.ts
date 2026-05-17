import { Injectable, Logger } from '@nestjs/common';
import { VNetEntity } from 'src/modules/infrastructure/vnets/entities/vnet.entity';
import { VNetSubnetEntity } from 'src/modules/infrastructure/vnets/entities/vnet-subnet.entity';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import { ProfileManager } from '../profile-manager';

interface VNetRecord extends VNetEntity {
  subnets: VNetSubnetEntity[];
}

@Injectable()
export class CliVnetRepository {
  private readonly logger = new Logger(CliVnetRepository.name);
  private readonly dataDir: string;
  private readonly dataFile: string;

  constructor() {
    this.dataDir = ProfileManager.getProfileDir();
    this.dataFile = path.join(this.dataDir, 'vnets.json');
    this.ensureDataDir();
  }

  private ensureDataDir(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true, mode: 0o700 });
    }
  }

  private load(): VNetRecord[] {
    if (!fs.existsSync(this.dataFile)) return [];
    try {
      const data = fs.readFileSync(this.dataFile, 'utf-8');
      return JSON.parse(data) as VNetRecord[];
    } catch (error) {
      this.logger.error(`Failed to load vnets from ${this.dataFile}:`, error);
      return [];
    }
  }

  private persist(records: VNetRecord[]): void {
    const data = JSON.stringify(records, null, 2);
    fs.writeFileSync(this.dataFile, data, { encoding: 'utf-8', mode: 0o600 });
  }

  async findActive(): Promise<VNetRecord | null> {
    const records = this.load();
    return records.length > 0 ? records[0] : null;
  }

  async findByProviderResourceId(
    providerResourceId: string,
  ): Promise<VNetRecord | null> {
    return (
      this.load().find((r) => r.providerResourceId === providerResourceId) ||
      null
    );
  }

  async save(record: Partial<VNetRecord>): Promise<VNetRecord> {
    const records = this.load();
    const now = new Date();
    if (!record.id) {
      record.id = uuidv4();
      record.createdAt = now;
    }
    record.updatedAt = now;
    if (!record.subnets) record.subnets = [];

    const idx = records.findIndex((r) => r.id === record.id);
    if (idx >= 0) {
      records[idx] = { ...records[idx], ...record } as VNetRecord;
    } else {
      records.push(record as VNetRecord);
    }
    this.persist(records);
    return records.find((r) => r.id === record.id);
  }

  async addSubnet(
    vnetId: string,
    subnet: Partial<VNetSubnetEntity>,
  ): Promise<VNetSubnetEntity> {
    const records = this.load();
    const vnet = records.find((r) => r.id === vnetId);
    if (!vnet) throw new Error(`VNet ${vnetId} not found`);
    const now = new Date();
    const newSubnet: VNetSubnetEntity = {
      ...subnet,
      id: subnet.id || uuidv4(),
      vnetId,
      attachedServerIds: subnet.attachedServerIds || [],
      createdAt: now,
      updatedAt: now,
    } as VNetSubnetEntity;
    vnet.subnets = [...(vnet.subnets || []), newSubnet];
    vnet.updatedAt = now;
    this.persist(records);
    return newSubnet;
  }

  async attachServerToSubnet(
    subnetId: string,
    serverId: string,
  ): Promise<void> {
    const records = this.load();
    for (const vnet of records) {
      const subnet = vnet.subnets?.find((s) => s.id === subnetId);
      if (subnet) {
        if (!subnet.attachedServerIds) subnet.attachedServerIds = [];
        if (!subnet.attachedServerIds.includes(serverId)) {
          subnet.attachedServerIds.push(serverId);
          vnet.updatedAt = new Date();
          this.persist(records);
        }
        return;
      }
    }
    this.logger.warn(
      `Subnet ${subnetId} not found — cannot attach ${serverId}`,
    );
  }

  async attachServerToVNet(
    vnetProviderResourceId: string,
    serverId: string,
  ): Promise<void> {
    const records = this.load();
    const vnet = records.find(
      (r) => r.providerResourceId === vnetProviderResourceId,
    );
    if (!vnet) {
      this.logger.warn(
        `VNet ${vnetProviderResourceId} not found — cannot attach ${serverId}`,
      );
      return;
    }
    const subnet = vnet.subnets?.[0];
    if (!subnet) {
      this.logger.warn(
        `VNet ${vnetProviderResourceId} has no subnets — cannot attach ${serverId}`,
      );
      return;
    }
    if (!subnet.attachedServerIds) subnet.attachedServerIds = [];
    if (!subnet.attachedServerIds.includes(serverId)) {
      subnet.attachedServerIds.push(serverId);
      vnet.updatedAt = new Date();
      this.persist(records);
    }
  }

  async remove(id: string): Promise<void> {
    const records = this.load();
    const filtered = records.filter((r) => r.id !== id);
    if (filtered.length < records.length) this.persist(filtered);
  }
}
