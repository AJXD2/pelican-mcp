import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PelicanClient } from "../client.ts";

export function registerServerTools(server: McpServer, client: PelicanClient) {
  server.registerTool(
    "list_servers",
    {
      description: "List all game servers accessible with the current API key.",
      inputSchema: z.object({}),
    },
    async () => {
      const servers = await client.listServers();
      const text = servers
        .map((s) => {
          const a = s.attributes;
          return `[${a.identifier}] ${a.name} — ${a.node} | status: ${a.status ?? "unknown"} | suspended: ${a.is_suspended}`;
        })
        .join("\n");
      return {
        content: [{ type: "text", text: text || "No servers found." }],
      };
    },
  );

  server.registerTool(
    "get_server",
    {
      description: "Get details for a specific server by its short identifier (e.g. '1a2b3c4d').",
      inputSchema: z.object({
        id: z.string().describe("Short server identifier"),
      }),
    },
    async ({ id }) => {
      const s = await client.getServer(id);
      const a = s.attributes;
      const text = [
        `Name: ${a.name}`,
        `Identifier: ${a.identifier}`,
        `UUID: ${a.uuid}`,
        `Node: ${a.node}`,
        `Status: ${a.status ?? "unknown"}`,
        `Suspended: ${a.is_suspended}`,
        `Installing: ${a.is_installing}`,
        `Memory limit: ${a.limits.memory} MB`,
        `Disk limit: ${a.limits.disk} MB`,
        `CPU limit: ${a.limits.cpu}%`,
        `SFTP: ${a.sftp_details.ip}:${a.sftp_details.port}`,
      ].join("\n");
      return { content: [{ type: "text", text }] };
    },
  );

  server.registerTool(
    "get_resource_usage",
    {
      description: "Get current CPU, memory, disk, and network usage for a server.",
      inputSchema: z.object({
        id: z.string().describe("Short server identifier"),
      }),
    },
    async ({ id }) => {
      const res = await client.getServerResources(id);
      const r = res.resources;
      const toMB = (b: number | undefined) =>
        b != null ? (b / 1024 / 1024).toFixed(1) + " MB" : "N/A";
      const text = [
        `State: ${res.current_state}`,
        `Suspended: ${res.is_suspended}`,
        `CPU: ${r?.cpu_absolute != null ? r.cpu_absolute.toFixed(2) + "%" : "N/A"}`,
        `Memory: ${toMB(r?.memory_bytes)}`,
        `Disk: ${toMB(r?.disk_bytes)}`,
        `Network RX: ${toMB(r?.network_rx_bytes)}`,
        `Network TX: ${toMB(r?.network_tx_bytes)}`,
        `Uptime: ${r?.uptime != null ? Math.floor(r.uptime / 1000) + "s" : "N/A"}`,
      ].join("\n");
      return { content: [{ type: "text", text }] };
    },
  );

  server.registerTool(
    "start_server",
    {
      description: "Send a start signal to a server.",
      inputSchema: z.object({
        id: z.string().describe("Short server identifier"),
      }),
    },
    async ({ id }) => {
      await client.powerAction(id, "start");
      return { content: [{ type: "text", text: `Start signal sent to server ${id}.` }] };
    },
  );

  server.registerTool(
    "stop_server",
    {
      description: "Gracefully stop a server.",
      inputSchema: z.object({
        id: z.string().describe("Short server identifier"),
      }),
    },
    async ({ id }) => {
      await client.powerAction(id, "stop");
      return { content: [{ type: "text", text: `Stop signal sent to server ${id}.` }] };
    },
  );

  server.registerTool(
    "restart_server",
    {
      description: "Restart a server.",
      inputSchema: z.object({
        id: z.string().describe("Short server identifier"),
      }),
    },
    async ({ id }) => {
      await client.powerAction(id, "restart");
      return { content: [{ type: "text", text: `Restart signal sent to server ${id}.` }] };
    },
  );

  server.registerTool(
    "kill_server",
    {
      description: "Force-kill a server immediately (unsaved data may be lost).",
      inputSchema: z.object({
        id: z.string().describe("Short server identifier"),
      }),
    },
    async ({ id }) => {
      await client.powerAction(id, "kill");
      return { content: [{ type: "text", text: `Kill signal sent to server ${id}.` }] };
    },
  );
}
