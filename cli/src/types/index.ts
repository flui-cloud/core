export interface HetznerServer {
  id: number;
  name: string;
  status: 'running' | 'off' | 'starting' | 'stopping';
  created: string;
  public_net: {
    ipv4: {
      ip: string;
    };
    ipv6: {
      ip: string;
    };
  };
  server_type: {
    name: string;
    cores: number;
    memory: number;
    disk: number;
  };
  datacenter: {
    name: string;
    location: {
      name: string;
      city: string;
      country: string;
    };
  };
  labels: Record<string, string>;
}

export interface HetznerServerCreateOptions {
  name: string;
  server_type: string;
  image: string;
  location: string;
  labels: Record<string, string>;
  user_data: string;
  ssh_keys?: number[];
}

export interface Config {
  hetzner_token?: string;
}
