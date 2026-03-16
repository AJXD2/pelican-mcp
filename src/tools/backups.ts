import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PelicanClient } from "../client.ts";

export function registerBackupTools(server: McpServer, client: PelicanClient) {
  server.registerTool(
    "list_backups",
    {
      description: "List all backups for a server.",
      inputSchema: z.object({
        id: z.string().describe("Short server identifier"),
      }),
    },
    async ({ id }) => {
      const backups = await client.listBackups(id);
      if (backups.length === 0) {
        return { content: [{ type: "text", text: "No backups found." }] };
      }
      const text = backups
        .map((b) => {
          const a = b.attributes;
          const size = (a.bytes / 1024 / 1024).toFixed(1);
          const done = a.completed_at ? new Date(a.completed_at).toLocaleString() : "in progress";
          return `[${a.uuid.slice(0, 8)}] ${a.name} — ${size} MB | ${done} | successful: ${a.is_successful}`;
        })
        .join("\n");
      return { content: [{ type: "text", text }] };
    },
  );

  server.registerTool(
    "create_backup",
    {
      description: "Create a new backup for a server.",
      inputSchema: z.object({
        id: z.string().describe("Short server identifier"),
        name: z.string().optional().describe("Optional backup name"),
      }),
    },
    async ({ id, name }) => {
      const backup = await client.createBackup(id, name);
      const a = backup.attributes;
      return {
        content: [
          {
            type: "text",
            text: `Backup '${a.name}' created (UUID: ${a.uuid}). It may take a moment to complete.`,
          },
        ],
      };
    },
  );

  server.registerTool(
    "delete_backup",
    {
      description: "Delete a backup by its UUID.",
      inputSchema: z.object({
        id: z.string().describe("Short server identifier"),
        backup_id: z.string().describe("Backup UUID"),
      }),
    },
    async ({ id, backup_id }) => {
      await client.deleteBackup(id, backup_id);
      return { content: [{ type: "text", text: `Backup ${backup_id} deleted.` }] };
    },
  );
}
