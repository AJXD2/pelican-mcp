# pelican-mcp

An MCP server for managing [Pelican Panel](https://pelican.dev) game servers. Lets Claude start/stop servers, manage files, create backups, run console commands, and perform admin operations — all through natural language.

## Installation

### Via npx (recommended)

No install needed. Add to your Claude Desktop config:

```json
{
  "mcpServers": {
    "pelican": {
      "command": "npx",
      "args": ["-y", "pelican-mcp"],
      "env": {
        "PELICAN_URL": "https://your-panel.example.com",
        "PELICAN_API_KEY": "pacc_..."
      }
    }
  }
}
```

### From source (requires [Bun](https://bun.sh))

```bash
git clone https://github.com/AJXD2/pelican-mcp
cd pelican-mcp
bun install
```

Then add to your Claude Desktop config:

```json
{
  "mcpServers": {
    "pelican": {
      "command": "bun",
      "args": ["run", "/path/to/pelican-mcp/src/index.ts"],
      "env": {
        "PELICAN_URL": "https://your-panel.example.com",
        "PELICAN_API_KEY": "pacc_..."
      }
    }
  }
}
```

## Configuration

| Variable | Description |
|---|---|
| `PELICAN_URL` | Base URL of your Pelican Panel instance |
| `PELICAN_API_KEY` | API key from Account → API Credentials |

For admin tools (`admin_*`, database, plugin management), use an **Application API** key generated in the panel's admin area.

## Tools

### Server Control
| Tool | Description |
|---|---|
| `list_servers` | List all accessible servers |
| `get_server` | Get server details |
| `get_resource_usage` | CPU, memory, disk, network stats |
| `start_server` | Start a server |
| `stop_server` | Gracefully stop a server |
| `restart_server` | Restart a server |
| `kill_server` | Force-kill a server |

### File Management
| Tool | Description |
|---|---|
| `list_files` | List files at a path |
| `read_file` | Read file contents |
| `write_file` | Write/overwrite a file |
| `delete_files` | Delete files or directories |
| `rename_file` | Rename or move a file |

### Backups
| Tool | Description |
|---|---|
| `list_backups` | List server backups |
| `create_backup` | Create a new backup |
| `delete_backup` | Delete a backup |

### Console
| Tool | Description |
|---|---|
| `send_command` | Send a console command to a running server |

### Admin (Application API key required)
| Tool | Description |
|---|---|
| `admin_list_servers` | List all servers on the panel |
| `admin_list_nodes` | List all nodes |
| `admin_list_users` | List all users |
| `admin_create_server` | Create a new server |
| `admin_update_server` | Update server name/owner/description |
| `admin_suspend_server` | Suspend a server |
| `admin_unsuspend_server` | Unsuspend a server |
| `admin_reinstall_server` | Reinstall a server |
| `admin_delete_server` | Delete a server |

### Databases (Application API key required)
| Tool | Description |
|---|---|
| `list_server_databases` | List databases for a server |
| `create_server_database` | Create a database |
| `delete_server_database` | Delete a database |

### Plugins (Application API key required)
| Tool | Description |
|---|---|
| `list_plugins` | List all panel plugins |
| `install_plugin` | Install a plugin |
| `update_plugin` | Update a plugin |
| `uninstall_plugin` | Uninstall a plugin |
| `enable_plugin` | Enable a plugin |
| `disable_plugin` | Disable a plugin |
