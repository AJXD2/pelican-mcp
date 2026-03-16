// ─── Shared ───────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  object: string;
  data: T[];
  meta: {
    pagination: {
      total: number;
      count: number;
      per_page: number;
      current_page: number;
      total_pages: number;
    };
  };
}

// ─── Client API ───────────────────────────────────────────────────────────────

export interface ServerLimits {
  memory: number;
  swap: number;
  disk: number;
  io: number;
  cpu: number;
  threads: string | null;
}

export interface ServerFeatureLimits {
  databases: number;
  allocations: number;
  backups: number;
}

export interface ServerRelationships {
  allocations?: { data: AllocationObject[] };
  variables?: { data: EggVariableObject[] };
}

export interface ServerAttributes {
  server_owner: boolean;
  identifier: string;
  internal_id: number;
  uuid: string;
  name: string;
  node: string;
  sftp_details: {
    ip: string;
    port: number;
  };
  description: string;
  limits: ServerLimits;
  invocation: string;
  docker_image: string;
  egg_features: string[] | null;
  feature_limits: ServerFeatureLimits;
  status: string | null;
  is_suspended: boolean;
  is_installing: boolean;
  is_transferring: boolean;
  relationships?: ServerRelationships;
}

export interface ServerObject {
  object: "server";
  attributes: ServerAttributes;
}

export interface ServerResourceStats {
  current_state: string;
  is_suspended: boolean;
  resources: {
    memory_bytes: number;
    cpu_absolute: number;
    disk_bytes: number;
    network_rx_bytes: number;
    network_tx_bytes: number;
    uptime: number;
  };
}

export interface AllocationObject {
  object: "allocation";
  attributes: {
    id: number;
    ip: string;
    ip_alias: string | null;
    port: number;
    notes: string | null;
    is_default: boolean;
  };
}

export interface EggVariableObject {
  object: "egg_variable";
  attributes: {
    name: string;
    description: string;
    env_variable: string;
    default_value: string;
    server_value: string;
    is_editable: boolean;
    rules: string;
  };
}

export interface FileObject {
  object: "file_object";
  attributes: {
    name: string;
    mode: string;
    mode_bits: string;
    size: number;
    is_file: boolean;
    is_symlink: boolean;
    mimetype: string;
    created_at: string;
    modified_at: string;
  };
}

export interface BackupAttributes {
  uuid: string;
  is_successful: boolean;
  is_locked: boolean;
  name: string;
  ignored_files: string[];
  checksum: string | null;
  bytes: number;
  created_at: string;
  completed_at: string | null;
}

export interface BackupObject {
  object: "backup";
  attributes: BackupAttributes;
}

// ─── Application API ──────────────────────────────────────────────────────────

export interface NodeAttributes {
  id: number;
  uuid: string;
  public: boolean;
  name: string;
  description: string | null;
  location_id: number;
  fqdn: string;
  scheme: string;
  behind_proxy: boolean;
  maintenance_mode: boolean;
  memory: number;
  memory_overallocate: number;
  disk: number;
  disk_overallocate: number;
  upload_size: number;
  daemon_listen: number;
  daemon_sftp: number;
  daemon_base: string;
  created_at: string;
  updated_at: string;
}

export interface NodeObject {
  object: "node";
  attributes: NodeAttributes;
}

export interface UserAttributes {
  id: number;
  external_id: string | null;
  uuid: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  language: string;
  root_admin: boolean;
  "2fa": boolean;
  created_at: string;
  updated_at: string;
}

export interface UserObject {
  object: "user";
  attributes: UserAttributes;
}

export interface AdminServerAttributes {
  id: number;
  external_id: string | null;
  uuid: string;
  identifier: string;
  name: string;
  description: string;
  status: string | null;
  suspended: boolean;
  limits: ServerLimits;
  feature_limits: ServerFeatureLimits;
  user: number;
  node: number;
  allocation: number;
  nest: number;
  egg: number;
  container: {
    startup_command: string;
    image: string;
    installed: number;
    environment: Record<string, string>;
  };
  updated_at: string;
  created_at: string;
}

export interface AdminServerObject {
  object: "server";
  attributes: AdminServerAttributes;
}
