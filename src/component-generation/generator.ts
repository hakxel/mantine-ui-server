/**
 * Component generator for the Mantine UI MCP server
 */

import * as fs from 'fs';
import * as path from 'path';
import { 
  generateBasicComponentTemplate, 
  generateCssModuleTemplate,
  generateVariants, 
  generateIndexFile,
  generateTestFile 
} from './templates.js';
import { ComponentGenerationConfig } from '../types/index.js';
import { getConfig } from '../utils/config.js';
import { getComponentDocumentation } from '../documentation/fetcher.js';

/**
 * Generate a Mantine component based on the provided configuration
 * @param config Component generation configuration
 * @param outputPath Path to output the generated component
 * @returns Object containing the paths of the generated files
 */
export async function generateComponent(
  config: ComponentGenerationConfig,
  outputPath?: string
): Promise<{ files: Record<string, string>, content: Record<string, string> }> {
  try {
    // Validate the component exists in Mantine
    await validateMantineComponent(config.mantineComponent);
    
    // Generate the component files
    const generatedFiles = await buildComponentFiles(config);
    
    // If outputPath is provided, write files to disk
    if (outputPath) {
      await writeComponentFiles(generatedFiles, outputPath);
    }
    
    return {
      files: Object.keys(generatedFiles).reduce((acc, key) => {
        acc[key] = path.join(outputPath || '', key);
        return acc;
      }, {} as Record<string, string>),
      content: generatedFiles
    };
  } catch (error) {
    console.error(`Error generating component:`, error);
    throw new Error(`Failed to generate component: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Validate that the specified Mantine component exists
 * @param componentName Mantine component name
 */
async function validateMantineComponent(componentName: string): Promise<void> {
  try {
    // Try to get documentation for the component to validate it exists
    await getComponentDocumentation(componentName);
  } catch (error) {
    throw new Error(`Invalid Mantine component: ${componentName}. Please ensure the component name is correct.`);
  }
}

/**
 * Build all component files based on the configuration
 * @param config Component generation configuration
 * @returns Object with filenames as keys and content as values
 */
async function buildComponentFiles(
  config: ComponentGenerationConfig
): Promise<Record<string, string>> {
  const { 
    name, 
    styling = {},
    includeTests = false,
    variants = []
  } = config;
  
  const files: Record<string, string> = {};
  
  // Generate the main component file
  files[`${name}.tsx`] = generateBasicComponentTemplate(config);
  
  // Generate CSS module if requested
  if (styling.useModule) {
    files[`${name}.module.css`] = generateCssModuleTemplate(config);
  }
  
  // Generate variants if specified
  const variantFiles = generateVariants(config);
  Object.entries(variantFiles).forEach(([variantName, content]) => {
    files[`${name}${variantName.charAt(0).toUpperCase() + variantName.slice(1)}.tsx`] = content;
  });
  
  // Generate test file if requested
  if (includeTests) {
    files[`${name}.test.tsx`] = generateTestFile(config);
  }
  
  // Generate index file for exports
  files['index.ts'] = `export { ${name} } from './${name}';\n`;
  
  if (config.props && Object.keys(config.props).length > 0) {
    files['index.ts'] += `export type { ${name}Props } from './${name}';\n`;
  }
  
  // Add variant exports
  variants.forEach(variant => {
    const variantName = `${name}${variant.name.charAt(0).toUpperCase() + variant.name.slice(1)}`;
    files['index.ts'] += `export { ${variantName} } from './${variantName}';\n`;
  });
  
  return files;
}

/**
 * Write generated component files to disk
 * @param files Object with filenames as keys and content as values
 * @param outputPath Base path to write files to
 */
async function writeComponentFiles(
  files: Record<string, string>,
  outputPath: string
): Promise<void> {
  // Create the output directory if it doesn't exist
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }
  
  // Write each file
  for (const [filename, content] of Object.entries(files)) {
    const filePath = path.join(outputPath, filename);
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

/**
 * Generate a component based on an academic template
 * @param config Component generation configuration
 * @param template Academic template name
 * @param outputPath Path to output the generated component
 * @returns Object containing the paths of the generated files
 */
export async function generateAcademicComponent(
  config: ComponentGenerationConfig,
  template: 'publication' | 'research' | 'citation' | 'timeline',
  outputPath?: string
): Promise<{ files: Record<string, string>, content: Record<string, string> }> {
  // Extend the base configuration with academic-specific props and styling
  const academicConfig = {
    ...config,
    props: {
      ...config.props,
      ...getAcademicTemplateProps(template)
    },
    styling: {
      ...config.styling,
      ...getAcademicTemplateStyling(template)
    }
  };
  
  return generateComponent(academicConfig, outputPath);
}

/**
 * Get academic template props based on template type
 * @param template Academic template name
 * @returns Props for the academic template
 */
function getAcademicTemplateProps(
  template: 'publication' | 'research' | 'citation' | 'timeline'
): Record<string, any> {
  switch (template) {
    case 'publication':
      return {
        title: {
          type: 'string',
          description: 'Publication title',
          required: true
        },
        authors: {
          type: 'string[]',
          description: 'List of authors',
          required: true
        },
        journal: {
          type: 'string',
          description: 'Journal name',
          required: false
        },
        date: {
          type: 'string',
          description: 'Publication date',
          required: false
        },
        abstract: {
          type: 'string',
          description: 'Publication abstract',
          required: false
        },
        doi: {
          type: 'string',
          description: 'Digital Object Identifier',
          required: false
        },
        url: {
          type: 'string',
          description: 'Link to publication',
          required: false
        }
      };
      
    case 'research':
      return {
        title: {
          type: 'string',
          description: 'Research project title',
          required: true
        },
        description: {
          type: 'string',
          description: 'Research description',
          required: true
        },
        imageUrl: {
          type: 'string',
          description: 'URL to research image',
          required: false
        },
        tags: {
          type: 'string[]',
          description: 'Research tags',
          required: false,
          defaultValue: []
        },
        date: {
          type: 'string',
          description: 'Research date',
          required: false
        }
      };
      
    case 'citation':
      return {
        text: {
          type: 'string',
          description: 'Citation text',
          required: true
        },
        source: {
          type: 'string',
          description: 'Citation source',
          required: false
        },
        url: {
          type: 'string',
          description: 'Citation URL',
          required: false
        }
      };
      
    case 'timeline':
      return {
        items: {
          type: '{ date: string; title: string; description: string; }[]',
          description: 'Timeline items',
          required: true
        },
        current: {
          type: 'number',
          description: 'Current active item index',
          required: false,
          defaultValue: 0
        }
      };
      
    default:
      return {};
  }
}

/**
 * Get academic template styling based on template type
 * @param template Academic template name
 * @returns Styling for the academic template
 */
function getAcademicTemplateStyling(
  template: 'publication' | 'research' | 'citation' | 'timeline'
): ComponentGenerationConfig['styling'] {
  const serverConfig = getConfig();
  
  switch (template) {
    case 'publication':
      return {
        useModule: true,
        responsive: true,
        themeOverrides: {
          padding: '1rem',
          borderRadius: '0.5rem',
          border: '1px solid var(--mantine-color-gray-3)',
          backgroundColor: 'var(--mantine-color-gray-0)'
        }
      };
      
    case 'research':
      return {
        useModule: true,
        responsive: true,
        themeOverrides: {
          overflow: 'hidden',
          transition: 'transform 200ms ease, box-shadow 200ms ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: 'var(--mantine-shadow-md)'
          }
        }
      };
      
    case 'citation':
      return {
        useModule: true,
        themeOverrides: {
          fontStyle: 'italic',
          padding: '1rem 2rem',
          borderLeft: '3px solid var(--mantine-color-blue-6)',
          backgroundColor: 'var(--mantine-color-gray-0)'
        }
      };
      
    case 'timeline':
      return {
        useModule: true,
        responsive: true,
        themeOverrides: {
          width: '100%',
          maxWidth: '800px',
          margin: '0 auto'
        }
      };
      
    default:
      return {};
  }
}
