import type {
  PaginatedResponse,
  ServerObject,
  ServerResourceStats,
  FileObject,
  BackupObject,
  NodeObject,
  UserObject,
  AdminServerObject,
} from "./types.ts";

export class PelicanError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(`Pelican API error ${status}: ${message}`);
    this.name = "PelicanError";
  }
}

export class PelicanClient {
  constructor(
    private baseUrl: string,
    private apiKey: string,
  ) {
    // Strip trailing slash
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
    });

    if (res.status === 204) return undefined as T;

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg =
        (body as { errors?: Array<{ detail?: string }> }).errors?.[0]?.detail ??
        res.statusText;
      throw new PelicanError(res.status, msg);
    }

    return body as T;
  }

  // ─── Client API: Servers ────────────────────────────────────────────────────

  async listServers(): Promise<ServerObject[]> {
    const res = await this.request<PaginatedResponse<ServerObject>>("/api/client");
    return res.data;
  }

  async getServer(id: string): Promise<ServerObject> {
    return this.request<ServerObject>(`/api/client/servers/${id}`);
  }

  async getServerResources(id: string): Promise<ServerResourceStats> {
    return this.request<ServerResourceStats>(
      `/api/client/servers/${id}/resources`,
    );
  }

  async powerAction(
    id: string,
    action: "start" | "stop" | "restart" | "kill",
  ): Promise<void> {
    await this.request(`/api/client/servers/${id}/power`, {
      method: "POST",
      body: JSON.stringify({ signal: action }),
    });
  }

  async sendCommand(id: string, command: string): Promise<void> {
    await this.request(`/api/client/servers/${id}/command`, {
      method: "POST",
      body: JSON.stringify({ command }),
    });
  }

  // ─── Client API: Files ──────────────────────────────────────────────────────

  async listFiles(id: string, directory: string = "/"): Promise<FileObject[]> {
    const params = new URLSearchParams({ directory });
    const res = await this.request<{ data: FileObject[] }>(
      `/api/client/servers/${id}/files/list?${params}`,
    );
    return res.data;
  }

  async readFile(id: string, file: string): Promise<string> {
    const params = new URLSearchParams({ file });
    const url = `${this.baseUrl}/api/client/servers/${id}/files/contents?${params}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: "text/plain",
      },
    });
    if (!res.ok) {
      throw new PelicanError(res.status, res.statusText);
    }
    return res.text();
  }

  async writeFile(id: string, file: string, contents: string): Promise<void> {
    const params = new URLSearchParams({ file });
    const url = `${this.baseUrl}/api/client/servers/${id}/files/write?${params}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "text/plain",
      },
      body: contents,
    });
    if (!res.ok && res.status !== 204) {
      throw new PelicanError(res.status, res.statusText);
    }
  }

  async deleteFiles(id: string, files: string[]): Promise<void> {
    await this.request(`/api/client/servers/${id}/files/delete`, {
      method: "POST",
      body: JSON.stringify({ root: "/", files }),
    });
  }

  async renameFile(id: string, from: string, to: string): Promise<void> {
    await this.request(`/api/client/servers/${id}/files/rename`, {
      method: "PUT",
      body: JSON.stringify({ root: "/", files: [{ from, to }] }),
    });
  }

  // ─── Client API: Backups ────────────────────────────────────────────────────

  async listBackups(id: string): Promise<BackupObject[]> {
    const res = await this.request<PaginatedResponse<BackupObject>>(
      `/api/client/servers/${id}/backups`,
    );
    return res.data;
  }

  async createBackup(id: string, name?: string): Promise<BackupObject> {
    return this.request<BackupObject>(`/api/client/servers/${id}/backups`, {
      method: "POST",
      body: JSON.stringify(name ? { name } : {}),
    });
  }

  async deleteBackup(id: string, backupId: string): Promise<void> {
    await this.request(`/api/client/servers/${id}/backups/${backupId}`, {
      method: "DELETE",
    });
  }

  // ─── Application API ────────────────────────────────────────────────────────

  async adminListServers(): Promise<AdminServerObject[]> {
    const res = await this.request<PaginatedResponse<AdminServerObject>>(
      "/api/application/servers",
    );
    return res.data;
  }

  async adminListNodes(): Promise<NodeObject[]> {
    const res = await this.request<PaginatedResponse<NodeObject>>(
      "/api/application/nodes",
    );
    return res.data;
  }

  async adminListUsers(): Promise<UserObject[]> {
    const res = await this.request<PaginatedResponse<UserObject>>(
      "/api/application/users",
    );
    return res.data;
  }

  async adminSuspendServer(id: string): Promise<void> {
    await this.request(`/api/application/servers/${id}/suspend`, {
      method: "POST",
    });
  }

  async adminUnsuspendServer(id: string): Promise<void> {
    await this.request(`/api/application/servers/${id}/unsuspend`, {
      method: "POST",
    });
  }

  async adminDeleteServer(id: string): Promise<void> {
    await this.request(`/api/application/servers/${id}`, {
      method: "DELETE",
    });
  }

  async adminCreateServer(data: {
    name: string;
    user: number;
    egg: number;
    docker_image: string;
    startup: string;
    environment: Record<string, string>;
    limits: { memory: number; swap: number; disk: number; io: number; cpu: number };
    feature_limits: { databases: number; allocations: number; backups: number };
    allocation: { default: number };
  }): Promise<AdminServerObject> {
    return this.request<AdminServerObject>("/api/application/servers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async adminReinstallServer(id: string): Promise<void> {
    await this.request(`/api/application/servers/${id}/reinstall`, {
      method: "POST",
    });
  }

  async adminUpdateServerDetails(id: string, data: {
    name: string;
    user: number;
    description?: string;
    external_id?: string;
  }): Promise<AdminServerObject> {
    return this.request<AdminServerObject>(`/api/application/servers/${id}/details`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }
}
