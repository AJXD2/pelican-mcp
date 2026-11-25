import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PelicanClient } from "../client.ts";

interface DatabaseAttributes {
  id: number;
  name: string;
  host: number;
  remote: string;
}

interface DatabaseObject {
  attributes: DatabaseAttributes;
}

interface PaginatedResponse<T> {
  data: T[];
}

export function registerDatabaseTools(server: McpServer, client: PelicanClient) {
  server.registerTool(
    "list_server_databases",
    {
      description: "List all databases for a server (requires Application API key).",
      inputSchema: z.object({
        id: z.string().describe("Numeric server ID"),
      }),
    },
    async ({ id }) => {
      const res = await client.appRequest<PaginatedResponse<DatabaseObject>>(
        `/api/application/servers/${id}/databases`,
      );
      if (res.data.length === 0) {
        return { content: [{ type: "text", text: "No databases found." }] };
      }
      const text = res.data
        .map((db) => {
          const a = db.attributes;
          return `[${a.id}] ${a.name} — host: ${a.host} | remote: ${a.remote}`;
        })
        .join("\n");
      return { content: [{ type: "text", text }] };
    },
  );

  server.registerTool(
    "create_server_database",
    {
      description: "Create a database for a server (requires Application API key).",
      inputSchema: z.object({
        id: z.string().describe("Numeric server ID"),
        database: z.string().describe("Database name"),
        remote: z
          .string()
          .default("%")
          .describe("Remote connection source (default: %)"),
        host: z.number().describe("Database host ID"),
      }),
    },
    async ({ id, database, remote, host }) => {
      const db = await client.appRequest<DatabaseObject>(
        `/api/application/servers/${id}/databases`,
        {
          method: "POST",
          body: JSON.stringify({ database, remote, host }),
        },
      );
      const a = db.attributes;
      return {
        content: [
          { type: "text", text: `Database '${a.name}' created (ID: ${a.id}).` },
        ],
      };
    },
  );

  server.registerTool(
    "delete_server_database",
    {
      description: "Delete a database from a server (requires Application API key).",
      inputSchema: z.object({
        id: z.string().describe("Numeric server ID"),
        database_id: z.string().describe("Database ID"),
      }),
    },
    async ({ id, database_id }) => {
      await client.appRequest<void>(
        `/api/application/servers/${id}/databases/${database_id}`,
        { method: "DELETE" },
      );
      return {
        content: [
          {
            type: "text",
            text: `Database ${database_id} deleted from server ${id}.`,
          },
        ],
      };
    },
  );
}
