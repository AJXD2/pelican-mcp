import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PelicanClient } from "../client.ts";

export function registerConsoleTools(server: McpServer, client: PelicanClient) {
  server.registerTool(
    "send_command",
    {
      description:
        "Send a console command to a running server (e.g. 'say Hello', 'op username', 'list').",
      inputSchema: z.object({
        id: z.string().describe("Short server identifier"),
        command: z.string().describe("Console command to send"),
      }),
    },
    async ({ id, command }) => {
      await client.sendCommand(id, command);
      return {
        content: [{ type: "text", text: `Command sent to server ${id}: ${command}` }],
      };
    },
  );
}
