#!/usr/bin/env node

/**
 * Mantine UI MCP Server
 * 
 * This server provides tools for working with Mantine UI components, including:
 * - Documentation for components
 * - Component generation
 * - Theme utilities
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

// Import utilities and modules
import { initConfig, loadConfigFromEnv, getConfig } from './utils/config.js';
import { 
  getComponentDocs,
  searchMantineComponents,
  listMantineComponents
} from './documentation/tools.js';
import { 
  generateComponent,
  generateAcademicComponent
} from './component-generation/generator.js';
import {
  generateTheme,
  generateComponentTheme,
  generateAcademicTheme,
  generateCompleteTheme
} from './theme-utils/theme-generator.js';
import { ComponentGenerationConfig, ThemeConfig, ComponentThemeConfig } from './types/index.js';

// Initialize configuration with environment variables
initConfig(loadConfigFromEnv());

// Create MCP server
const server = new Server(
  {
    name: "mantine-ui-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Handler for listing available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_component_docs",
        description: "Get documentation for a Mantine component",
        inputSchema: {
          type: "object",
          properties: {
            component: {
              type: "string",
              description: "Name of the Mantine component"
            },
            section: {
              type: "string",
              enum: ["props", "examples", "api", "all"],
              description: "Section of documentation to retrieve"
            },
            forceRefresh: {
              type: "boolean",
              description: "Force refresh of documentation from source"
            },
            format: {
              type: "string",
              enum: ["markdown", "json"],
              description: "Format of returned documentation"
            }
          },
          required: ["component"]
        }
      },
      {
        name: "search_components",
        description: "Search for Mantine components",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query"
            }
          },
          required: ["query"]
        }
      },
      {
        name: "list_components",
        description: "List all available Mantine components",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "generate_component",
        description: "Generate a Mantine component",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Name of the component to generate"
            },
            mantineComponent: {
              type: "string",
              description: "Mantine component to base on"
            },
            props: {
              type: "object",
              description: "Custom props configuration"
            },
            styling: {
              type: "object",
              description: "Styling options"
            },
            variants: {
              type: "array",
              items: {
                type: "object"
              },
              description: "Component variants"
            },
            includeTests: {
              type: "boolean",
              description: "Generate test file"
            }
          },
          required: ["name", "mantineComponent"]
        }
      },
      {
        name: "generate_academic_component",
        description: "Generate a component based on an academic template",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Name of the component to generate"
            },
            mantineComponent: {
              type: "string",
              description: "Mantine component to base on"
            },
            template: {
              type: "string",
              enum: ["publication", "research", "citation", "timeline"],
              description: "Academic template to use"
            },
            props: {
              type: "object",
              description: "Additional props configuration"
            },
            styling: {
              type: "object",
              description: "Additional styling options"
            }
          },
          required: ["name", "mantineComponent", "template"]
        }
      },
      {
        name: "create_theme_config",
        description: "Create a Mantine theme configuration",
        inputSchema: {
          type: "object",
          properties: {
            extension: {
              type: "string",
              enum: ["colors", "components", "typography", "spacing", "radius", "shadows", "other"],
              description: "Theme extension type"
            },
            definitions: {
              type: "object",
              description: "Theme definitions"
            },
            darkMode: {
              type: "boolean",
              description: "Generate dark mode variants"
            },
            output: {
              type: "string",
              enum: ["merge", "separate"],
              description: "How to output the extension"
            }
          },
          required: ["extension", "definitions"]
        }
      },
      {
        name: "create_component_theme",
        description: "Create a theme configuration for a specific component",
        inputSchema: {
          type: "object",
          properties: {
            component: {
              type: "string",
              description: "Mantine component to theme"
            },
            colorScheme: {
              type: "string",
              enum: ["both", "light", "dark"],
              description: "Color schemes to generate"
            },
            baseColor: {
              type: "string",
              description: "Base color from your palette"
            },
            variants: {
              type: "array",
              items: {
                type: "object"
              },
              description: "Component variants to create"
            },
            customSelectors: {
              type: "object",
              description: "Custom CSS selectors to include"
            }
          },
          required: ["component"]
        }
      },
      {
        name: "create_academic_theme",
        description: "Create an academic-focused theme configuration",
        inputSchema: {
          type: "object",
          properties: {}
        }
      }
    ]
  };
});

/**
 * Handler for calling tools
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    switch (request.params.name) {
      case "get_component_docs": {
        const { component, section = 'all', forceRefresh = false, format = 'json' } = request.params.arguments as any;
        
        if (!component) {
          throw new McpError(ErrorCode.InvalidParams, "Component name is required");
        }
        
        const docs = await getComponentDocs(
          component, 
          section as any, 
          forceRefresh, 
          format as any
        );
        
        return {
          content: [{
            type: "text",
            text: typeof docs === 'string' ? docs : JSON.stringify(docs, null, 2)
          }]
        };
      }
        
      case "search_components": {
        const { query } = request.params.arguments as any;
        
        if (!query) {
          throw new McpError(ErrorCode.InvalidParams, "Search query is required");
        }
        
        const results = await searchMantineComponents(query);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(results, null, 2)
          }]
        };
      }
        
      case "list_components": {
        const components = await listMantineComponents();
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(components, null, 2)
          }]
        };
      }
        
      case "generate_component": {
        const args = request.params.arguments as Record<string, any>;
        
        if (!args.name || !args.mantineComponent) {
          throw new McpError(ErrorCode.InvalidParams, "Component name and Mantine component are required");
        }
        
        const config: ComponentGenerationConfig = {
          name: args.name,
          mantineComponent: args.mantineComponent,
          props: args.props,
          styling: args.styling,
          variants: args.variants,
          includeTests: args.includeTests
        };
        
        const result = await generateComponent(config);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              files: result.files,
              preview: result.content[`${config.name}.tsx`]
            }, null, 2)
          }]
        };
      }
        
      case "generate_academic_component": {
        const { name, mantineComponent, template, props, styling } = request.params.arguments as any;
        
        if (!name || !mantineComponent || !template) {
          throw new McpError(
            ErrorCode.InvalidParams, 
            "Component name, Mantine component, and template are required"
          );
        }
        
        const config: ComponentGenerationConfig = {
          name,
          mantineComponent,
          props,
          styling
        };
        
        const result = await generateAcademicComponent(config, template);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              files: result.files,
              preview: result.content[`${config.name}.tsx`]
            }, null, 2)
          }]
        };
      }
        
      case "create_theme_config": {
        const args = request.params.arguments as Record<string, any>;
        
        if (!args.extension || !args.definitions) {
          throw new McpError(ErrorCode.InvalidParams, "Extension type and definitions are required");
        }
        
        const config: ThemeConfig = {
          extension: args.extension as "colors" | "components" | "typography" | "spacing" | "radius" | "shadows" | "other",
          definitions: args.definitions,
          darkMode: args.darkMode,
          output: args.output as "merge" | "separate" | undefined
        };
        
        const themeConfig = generateTheme(config);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(themeConfig, null, 2)
          }]
        };
      }
        
      case "create_component_theme": {
        const args = request.params.arguments as Record<string, any>;
        
        if (!args.component) {
          throw new McpError(ErrorCode.InvalidParams, "Component name is required");
        }
        
        const config: ComponentThemeConfig = {
          component: args.component,
          colorScheme: args.colorScheme as "both" | "light" | "dark" | undefined,
          baseColor: args.baseColor,
          variants: args.variants,
          customSelectors: args.customSelectors
        };
        
        const themeConfig = generateComponentTheme(config);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(themeConfig, null, 2)
          }]
        };
      }
        
      case "create_academic_theme": {
        const themeConfig = generateAcademicTheme();
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(themeConfig, null, 2)
          }]
        };
      }
        
      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
    }
  } catch (error) {
    console.error(`Error executing tool ${request.params.name}:`, error);
    
    return {
      content: [{
        type: "text",
        text: `Error: ${error instanceof Error ? error.message : String(error)}`
      }],
      isError: true
    };
  }
});

/**
 * Start the server
 */
async function main() {
  console.error(`Starting Mantine UI MCP server...`);
  console.error(`Version: ${getConfig().mantineVersion || 'latest'}`);
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error(`Mantine UI MCP server running`);
}

// Handle errors and shutdown
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('SIGINT', async () => {
  console.error('Shutting down Mantine UI MCP server...');
  await server.close();
  process.exit(0);
});

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
