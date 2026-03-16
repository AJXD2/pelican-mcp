import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { PelicanClient } from "./client.ts";
import { registerServerTools } from "./tools/servers.ts";
import { registerFileTools } from "./tools/files.ts";
import { registerBackupTools } from "./tools/backups.ts";
import { registerConsoleTools } from "./tools/console.ts";
import { registerAdminTools } from "./tools/admin.ts";

const url = process.env["PELICAN_URL"];
const key = process.env["PELICAN_API_KEY"];

if (!url || !key) {
  console.error("Error: PELICAN_URL and PELICAN_API_KEY environment variables must be set.");
  process.exit(1);
}

const client = new PelicanClient(url, key);
const server = new McpServer({ name: "pelican-mcp", version: "1.0.0" });

registerServerTools(server, client);
registerFileTools(server, client);
registerBackupTools(server, client);
registerConsoleTools(server, client);
registerAdminTools(server, client);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Pelican MCP server running on stdio");
