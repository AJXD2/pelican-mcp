import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PelicanClient } from "../client.ts";

async function appRequest<T>(
  client: PelicanClient,
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const baseUrl: string = (client as unknown as { baseUrl: string }).baseUrl;
  const apiKey: string = (client as unknown as { apiKey: string }).apiKey;
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
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
    throw new Error(`Pelican API error ${res.status}: ${msg}`);
  }
  return body as T;
}

interface PluginAttributes {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  installed: boolean;
}

interface PluginObject {
  attributes: PluginAttributes;
}

interface PaginatedResponse<T> {
  data: T[];
}

export function registerPluginTools(server: McpServer, client: PelicanClient) {
  server.registerTool(
    "list_plugins",
    {
      description:
        "List all plugins available on the panel (requires Application API key).",
      inputSchema: z.object({}),
    },
    async () => {
      const res = await appRequest<PaginatedResponse<PluginObject>>(
        client,
        "/api/application/plugins",
      );
      if (!res.data || res.data.length === 0) {
        return { content: [{ type: "text", text: "No plugins found." }] };
      }
      const text = res.data
        .map((p) => {
          const a = p.attributes;
          return `[${a.id}] ${a.name} — version: ${a.version} | enabled: ${a.enabled} | installed: ${a.installed}`;
        })
        .join("\n");
      return { content: [{ type: "text", text }] };
    },
  );

  server.registerTool(
    "install_plugin",
    {
      description: "Install a plugin by its ID (requires Application API key).",
      inputSchema: z.object({
        id: z.string().describe("Plugin ID (from list_plugins)"),
      }),
    },
    async ({ id }) => {
      await appRequest<void>(client, `/api/application/plugins/${id}/install`, {
        method: "POST",
      });
      return {
        content: [{ type: "text", text: `Plugin ${id} installation started.` }],
      };
    },
  );

  server.registerTool(
    "uninstall_plugin",
    {
      description: "Uninstall a plugin by its ID (requires Application API key).",
      inputSchema: z.object({
        id: z.string().describe("Plugin ID"),
        delete_data: z
          .boolean()
          .default(false)
          .describe("Delete plugin data files (default: false)"),
      }),
    },
    async ({ id, delete_data }) => {
      await appRequest<void>(client, `/api/application/plugins/${id}/uninstall`, {
        method: "POST",
        body: JSON.stringify({ delete: delete_data }),
      });
      return {
        content: [{ type: "text", text: `Plugin ${id} uninstalled.` }],
      };
    },
  );

  server.registerTool(
    "enable_plugin",
    {
      description: "Enable an installed plugin (requires Application API key).",
      inputSchema: z.object({
        id: z.string().describe("Plugin ID"),
      }),
    },
    async ({ id }) => {
      await appRequest<void>(client, `/api/application/plugins/${id}/enable`, {
        method: "POST",
      });
      return {
        content: [{ type: "text", text: `Plugin ${id} enabled.` }],
      };
    },
  );

  server.registerTool(
    "disable_plugin",
    {
      description: "Disable an installed plugin (requires Application API key).",
      inputSchema: z.object({
        id: z.string().describe("Plugin ID"),
      }),
    },
    async ({ id }) => {
      await appRequest<void>(client, `/api/application/plugins/${id}/disable`, {
        method: "POST",
      });
      return {
        content: [{ type: "text", text: `Plugin ${id} disabled.` }],
      };
    },
  );

  server.registerTool(
    "update_plugin",
    {
      description:
        "Update an installed plugin to the latest version (requires Application API key).",
      inputSchema: z.object({
        id: z.string().describe("Plugin ID"),
      }),
    },
    async ({ id }) => {
      await appRequest<void>(client, `/api/application/plugins/${id}/update`, {
        method: "POST",
      });
      return {
        content: [{ type: "text", text: `Plugin ${id} update started.` }],
      };
    },
  );
}
