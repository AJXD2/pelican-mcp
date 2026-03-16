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
}
