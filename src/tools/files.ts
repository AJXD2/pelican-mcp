import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PelicanClient } from "../client.ts";

export function registerFileTools(server: McpServer, client: PelicanClient) {
  server.registerTool(
    "list_files",
    {
      description: "List files and directories at a given path on a server.",
      inputSchema: z.object({
        id: z.string().describe("Short server identifier"),
        directory: z.string().default("/").describe("Directory path to list (default: /)"),
      }),
    },
    async ({ id, directory }) => {
      const files = await client.listFiles(id, directory);
      if (files.length === 0) {
        return { content: [{ type: "text", text: `Directory '${directory}' is empty.` }] };
      }
      const text = files
        .map((f) => {
          const a = f.attributes;
          const type = a.is_file ? "file" : "dir ";
          const size = a.is_file ? ` (${(a.size / 1024).toFixed(1)} KB)` : "";
          return `[${type}] ${a.name}${size}`;
        })
        .join("\n");
      return { content: [{ type: "text", text }] };
    },
  );

  server.registerTool(
    "read_file",
    {
      description: "Read the contents of a file on a server.",
      inputSchema: z.object({
        id: z.string().describe("Short server identifier"),
        file: z.string().describe("Full path to the file (e.g. /server.properties)"),
      }),
    },
    async ({ id, file }) => {
      const contents = await client.readFile(id, file);
      return { content: [{ type: "text", text: contents }] };
    },
  );

  server.registerTool(
    "write_file",
    {
      description: "Write or overwrite a file on a server.",
      inputSchema: z.object({
        id: z.string().describe("Short server identifier"),
        file: z.string().describe("Full path to the file (e.g. /server.properties)"),
        contents: z.string().describe("File contents to write"),
      }),
    },
    async ({ id, file, contents }) => {
      await client.writeFile(id, file, contents);
      return { content: [{ type: "text", text: `File '${file}' written successfully.` }] };
    },
  );

  server.registerTool(
    "delete_files",
    {
      description: "Delete one or more files or directories on a server.",
      inputSchema: z.object({
        id: z.string().describe("Short server identifier"),
        files: z.array(z.string()).describe("List of file/directory paths to delete"),
      }),
    },
    async ({ id, files }) => {
      await client.deleteFiles(id, files);
      return {
        content: [{ type: "text", text: `Deleted ${files.length} item(s): ${files.join(", ")}` }],
      };
    },
  );

  server.registerTool(
    "rename_file",
    {
      description: "Rename or move a file on a server.",
      inputSchema: z.object({
        id: z.string().describe("Short server identifier"),
        from: z.string().describe("Current file path"),
        to: z.string().describe("New file path"),
      }),
    },
    async ({ id, from, to }) => {
      await client.renameFile(id, from, to);
      return { content: [{ type: "text", text: `Renamed '${from}' → '${to}'.` }] };
    },
  );
}
