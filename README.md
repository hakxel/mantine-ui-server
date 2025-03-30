# Mantine UI MCP Server

A Model Context Protocol (MCP) server that provides tools for working with Mantine UI components.

## Features

### Documentation Tools
- **get_component_docs**: Get detailed documentation for any Mantine component
- **search_components**: Search for Mantine components by keyword
- **list_components**: List all available Mantine components

### Component Generation
- **generate_component**: Generate custom Mantine-based components with variants

### Theme Utilities
- **create_theme_config**: Create Mantine theme configurations
- **create_component_theme**: Create component-specific theme configurations

## Installation

### Global Installation

```bash
# Install globally
npm install -g @hakxel/mantine-ui-server

# Run the server directly
mantine-ui-server
```

### Using with npx

```bash
npx @hakxel/mantine-ui-server
```

## Configuration

### For Claude Desktop

Add the server configuration to your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`  
**Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mantine": {
      "command": "npx",
      "args": ["@hakxel/mantine-ui-server"],
      "env": {
        "MANTINE_VERSION": "7.16.2" // Optional: specify version
      }
    }
  }
}
```

### For VS Code with Claude Extension

Add to your VSCode settings or Cline extension settings:

```json
{
  "mcpServers": {
    "mantine": {
      "command": "npx", 
      "args": ["@hakxel/mantine-ui-server"],
      "env": {
        "MANTINE_VERSION": "7.16.2" // Optional: specify version
      }
    }
  }
}
```

## Usage Examples

### Get Component Documentation

```
get_component_docs(component: "Button", section: "props")
```

Returns detailed documentation for the Button component, specifically its props.

### Search Components

```
search_components(query: "input")
```

Returns a list of all components matching the search query "input".

### Generate a Component

```
generate_component(
  name: "CustomButton", 
  mantineComponent: "Button",
  props: {
    size: "md",
    variant: "filled"
  },
  styling: {
    useModule: true
  }
)
```

Generates a new CustomButton component based on Mantine's Button.

### Create a Theme Configuration

```
create_theme_config(
  extension: "colors",
  definitions: {
    primary: ["#90CAF9", "#2196F3", "#1976D2"],
    secondary: ["#CE93D8", "#9C27B0", "#7B1FA2"]
  },
  darkMode: true
)
```

Creates a color palette theme configuration for light and dark modes.

## Environment Variables

- `MANTINE_VERSION`: Specify which version of Mantine to use for documentation (default: latest)
- `CACHE_DOCS`: Set to "false" to disable documentation caching
- `CACHE_TTL`: Documentation cache time-to-live in seconds
- `CACHE_STORAGE`: Storage method for cache ("memory" or "file")

## Development

```bash
# Clone the repository
git clone https://github.com/hakxel/mantine-ui-server.git
cd mantine-ui-server

# Install dependencies
npm install

# Build the server
npm run build

# For development with auto-rebuild
npm run watch
```

### Debugging

Since MCP servers communicate over stdio, you can use the MCP Inspector for debugging:

```bash
npm run inspector
```

## License

MIT
