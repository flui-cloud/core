export interface CreateServerConfig {
  name: string;
  server_type?: string;
  image?: string;
  location?: string;
  ssh_keys?: string[];
  environment?: string;
  cluster_name?: string;
}

export interface ServerCreationResult {
  serverId: string;
  ipAddress?: string;
  status: string;
  actionId?: number;
}

export interface ServerDeletionResult {
  actionId?: number;
  message: string;
}
