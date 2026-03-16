import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PelicanClient } from "../client.ts";

export function registerAdminTools(server: McpServer, client: PelicanClient) {
  server.registerTool(
    "admin_list_servers",
    {
      description:
        "List all servers on the panel (requires Application API key with server read permission).",
      inputSchema: z.object({}),
    },
    async () => {
      const servers = await client.adminListServers();
      if (servers.length === 0) {
        return { content: [{ type: "text", text: "No servers found." }] };
      }
      const text = servers
        .map((s) => {
          const a = s.attributes;
          return `[${a.id}] ${a.name} — node: ${a.node} | suspended: ${a.suspended} | status: ${a.status ?? "unknown"}`;
        })
        .join("\n");
      return { content: [{ type: "text", text }] };
    },
  );

  server.registerTool(
    "admin_list_nodes",
    {
      description:
        "List all nodes registered on the panel (requires Application API key).",
      inputSchema: z.object({}),
    },
    async () => {
      const nodes = await client.adminListNodes();
      if (nodes.length === 0) {
        return { content: [{ type: "text", text: "No nodes found." }] };
      }
      const text = nodes
        .map((n) => {
          const a = n.attributes;
          return `[${a.id}] ${a.name} — ${a.fqdn} | mem: ${a.memory} MB | disk: ${a.disk} MB | maintenance: ${a.maintenance_mode}`;
        })
        .join("\n");
      return { content: [{ type: "text", text }] };
    },
  );

  server.registerTool(
    "admin_list_users",
    {
      description:
        "List all users on the panel (requires Application API key with user read permission).",
      inputSchema: z.object({}),
    },
    async () => {
      const users = await client.adminListUsers();
      if (users.length === 0) {
        return { content: [{ type: "text", text: "No users found." }] };
      }
      const text = users
        .map((u) => {
          const a = u.attributes;
          return `[${a.id}] ${a.username} (${a.email}) — admin: ${a.root_admin}`;
        })
        .join("\n");
      return { content: [{ type: "text", text }] };
    },
  );

  server.registerTool(
    "admin_suspend_server",
    {
      description:
        "Suspend a server by its numeric ID (requires Application API key).",
      inputSchema: z.object({
        id: z.string().describe("Numeric server ID (from admin_list_servers)"),
      }),
    },
    async ({ id }) => {
      await client.adminSuspendServer(id);
      return { content: [{ type: "text", text: `Server ${id} suspended.` }] };
    },
  );

  server.registerTool(
    "admin_unsuspend_server",
    {
      description:
        "Unsuspend a server by its numeric ID (requires Application API key).",
      inputSchema: z.object({
        id: z.string().describe("Numeric server ID (from admin_list_servers)"),
      }),
    },
    async ({ id }) => {
      await client.adminUnsuspendServer(id);
      return { content: [{ type: "text", text: `Server ${id} unsuspended.` }] };
    },
  );

  server.registerTool(
    "admin_delete_server",
    {
      description:
        "Permanently delete a server by its numeric ID (requires Application API key). This cannot be undone.",
      inputSchema: z.object({
        id: z.string().describe("Numeric server ID (from admin_list_servers)"),
      }),
    },
    async ({ id }) => {
      await client.adminDeleteServer(id);
      return { content: [{ type: "text", text: `Server ${id} deleted.` }] };
    },
  );

  server.registerTool(
    "admin_reinstall_server",
    {
      description:
        "Reinstall a server by its numeric ID (requires Application API key). This will re-run the install script.",
      inputSchema: z.object({
        id: z.string().describe("Numeric server ID"),
      }),
    },
    async ({ id }) => {
      await client.adminReinstallServer(id);
      return { content: [{ type: "text", text: `Server ${id} queued for reinstall.` }] };
    },
  );

  server.registerTool(
    "admin_update_server",
    {
      description:
        "Update a server's name, owner, or description (requires Application API key).",
      inputSchema: z.object({
        id: z.string().describe("Numeric server ID"),
        name: z.string().describe("New server name"),
        user: z.number().describe("User ID of the new owner"),
        description: z.string().optional().describe("Server description"),
      }),
    },
    async ({ id, name, user, description }) => {
      await client.adminUpdateServerDetails(id, { name, user, description });
      return { content: [{ type: "text", text: `Server ${id} updated: name='${name}'.` }] };
    },
  );

  server.registerTool(
    "admin_create_server",
    {
      description:
        "Create a new server (requires Application API key). Provide server name, owner user ID, egg ID, docker image, startup command, environment variables, resource limits, and the default allocation ID.",
      inputSchema: z.object({
        name: z.string().describe("Server name"),
        user: z.number().describe("Owner user ID"),
        egg: z.number().describe("Egg ID"),
        docker_image: z.string().describe("Docker image"),
        startup: z.string().describe("Startup command"),
        environment: z.record(z.string(), z.string()).default({}).describe("Environment variables"),
        memory: z.number().describe("Memory limit in MB"),
        swap: z.number().default(0).describe("Swap limit in MB"),
        disk: z.number().describe("Disk limit in MB"),
        io: z.number().default(500).describe("IO weight (10-1000)"),
        cpu: z.number().default(0).describe("CPU limit percent (0 = unlimited)"),
        databases: z.number().default(0),
        allocations: z.number().default(0),
        backups: z.number().default(0),
        allocation_id: z.number().describe("Default allocation ID"),
      }),
    },
    async ({ name, user, egg, docker_image, startup, environment, memory, swap, disk, io, cpu, databases, allocations, backups, allocation_id }) => {
      const a = await client.adminCreateServer({
        name,
        user,
        egg,
        docker_image,
        startup,
        environment,
        limits: { memory, swap, disk, io, cpu },
        feature_limits: { databases, allocations, backups },
        allocation: { default: allocation_id },
      });
      return { content: [{ type: "text", text: `Server '${name}' created (ID: ${a.attributes.id}, identifier: ${a.attributes.identifier}).` }] };
    },
  );
}
