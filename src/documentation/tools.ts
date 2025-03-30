/**
 * Documentation tools for the Mantine UI MCP server
 */

import { 
  getComponentDocumentation, 
  searchComponents, 
  listAllComponents 
} from './fetcher.js';
import { MantineComponentDoc } from '../types/index.js';

/**
 * Gets documentation for a specific Mantine component
 * @param component Name of the component
 * @param section Section of documentation to retrieve (props, examples, api, all)
 * @param forceRefresh Whether to bypass cache and fetch fresh data
 * @param format Format of returned documentation (markdown, json)
 * @returns The component documentation in the requested format
 */
export async function getComponentDocs(
  component: string,
  section: 'props' | 'examples' | 'api' | 'all' = 'all',
  forceRefresh = false,
  format: 'markdown' | 'json' = 'json'
): Promise<string | MantineComponentDoc> {
  try {
    const componentDoc = await getComponentDocumentation(component, forceRefresh);
    
    // If JSON format is requested, return the appropriate section
    if (format === 'json') {
      switch (section) {
        case 'props':
          return { ...componentDoc, examples: [], relatedComponents: [] };
        case 'examples':
          return { ...componentDoc, props: [], relatedComponents: [] };
        case 'api':
          return {
            name: componentDoc.name,
            description: componentDoc.description,
            props: [],
            examples: [],
            importStatement: componentDoc.importStatement,
            packageName: componentDoc.packageName,
            version: componentDoc.version,
            url: componentDoc.url,
            relatedComponents: componentDoc.relatedComponents,
            lastFetchedAt: componentDoc.lastFetchedAt
          };
        case 'all':
        default:
          return componentDoc;
      }
    }
    
    // If markdown format is requested, format the documentation as markdown
    let markdown = `# ${componentDoc.name}\n\n`;
    
    if (section === 'all' || section === 'api') {
      markdown += `## Overview\n\n`;
      markdown += `${componentDoc.description}\n\n`;
      markdown += `### Import\n\n`;
      markdown += `\`\`\`typescript\n${componentDoc.importStatement}\n\`\`\`\n\n`;
      
      if (componentDoc.relatedComponents && componentDoc.relatedComponents.length > 0) {
        markdown += `### Related Components\n\n`;
        componentDoc.relatedComponents.forEach(related => {
          markdown += `- ${related}\n`;
        });
        markdown += '\n';
      }
    }
    
    if (section === 'all' || section === 'props') {
      markdown += `## Props\n\n`;
      
      if (componentDoc.props.length > 0) {
        markdown += `| Property | Type | Default | Description | Required |\n`;
        markdown += `| -------- | ---- | ------- | ----------- | -------- |\n`;
        
        componentDoc.props.forEach(prop => {
          markdown += `| ${prop.name} | \`${prop.type}\` | ${prop.defaultValue || '-'} | ${prop.description} | ${prop.required ? 'Yes' : 'No'} |\n`;
        });
        
        markdown += '\n';
      } else {
        markdown += 'No props documentation available.\n\n';
      }
    }
    
    if (section === 'all' || section === 'examples') {
      markdown += `## Examples\n\n`;
      
      if (componentDoc.examples.length > 0) {
        componentDoc.examples.forEach(example => {
          markdown += `### ${example.title}\n\n`;
          
          if (example.description) {
            markdown += `${example.description}\n\n`;
          }
          
          markdown += `\`\`\`tsx\n${example.code}\n\`\`\`\n\n`;
        });
      } else {
        markdown += 'No examples available.\n\n';
      }
    }
    
    return markdown;
  } catch (error) {
    throw new Error(`Failed to get documentation for component ${component}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Search for Mantine components matching a query
 * @param query Search query
 * @returns List of matching component names
 */
export async function searchMantineComponents(query: string): Promise<string[]> {
  try {
    return await searchComponents(query);
  } catch (error) {
    console.error('Error searching for components:', error);
    return [];
  }
}

/**
 * Get a list of all available Mantine components
 * @returns Array of component names
 */
export async function listMantineComponents(): Promise<string[]> {
  try {
    return await listAllComponents();
  } catch (error) {
    console.error('Error listing components:', error);
    return [];
  }
}
