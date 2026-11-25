import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { PelicanClient } from "./client.ts";
import { registerServerTools } from "./tools/servers.ts";
import { registerFileTools } from "./tools/files.ts";
import { registerBackupTools } from "./tools/backups.ts";
import { registerConsoleTools } from "./tools/console.ts";
import { registerAdminTools } from "./tools/admin.ts";
import { registerDatabaseTools } from "./tools/databases.ts";
import { registerPluginTools } from "./tools/plugins.ts";

const url = process.env["PELICAN_URL"];
const fallbackKey = process.env["PELICAN_API_KEY"];
const clientKey = process.env["PELICAN_CLIENT_API_KEY"] || fallbackKey;
const appKey = process.env["PELICAN_APP_API_KEY"] || fallbackKey;

if (!url || (!clientKey && !appKey)) {
  console.error(
    "Error: PELICAN_URL and at least one API key (PELICAN_API_KEY, PELICAN_CLIENT_API_KEY, or PELICAN_APP_API_KEY) must be set.",
  );
  process.exit(1);
}

const client = new PelicanClient(url, { clientKey, appKey });
const server = new McpServer({ name: "pelican-mcp", version: "1.0.0" });

registerServerTools(server, client);
registerFileTools(server, client);
registerBackupTools(server, client);
registerConsoleTools(server, client);
registerAdminTools(server, client);
registerDatabaseTools(server, client);
registerPluginTools(server, client);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Pelican MCP server running on stdio");
