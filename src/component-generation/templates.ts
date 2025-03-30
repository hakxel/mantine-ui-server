/**
 * Component templates for the Mantine UI MCP server
 */

import { ComponentGenerationConfig } from '../types/index.js';

/**
 * Base template for a functional component
 * @param config Component generation configuration
 * @returns Generated component code
 */
export function generateBasicComponentTemplate(config: ComponentGenerationConfig): string {
  const { 
    name, 
    mantineComponent, 
    props = {}, 
    styling = {},
    includeTests = false 
  } = config;

  // Extract styling options
  const { useModule = false, responsive = false } = styling;
  
  // Generate import statements
  const importsBlock = generateImports(mantineComponent, useModule, responsive);
  
  // Generate props interface
  const propsInterface = generatePropsInterface(name, props);
  
  // Generate component function
  const componentBody = generateComponentBody(name, mantineComponent, props, styling);
  
  // Assemble the full component code
  return `${importsBlock}

${propsInterface}

export function ${name}(${props ? `{ ${Object.keys(props).join(', ')} }: ${name}Props` : ''}) {
${componentBody}
}
`;
}

/**
 * Generate import statements for the component
 * @param mantineComponent Mantine component to import
 * @param useModule Whether to use CSS modules
 * @param responsive Whether to add responsive imports
 * @returns Import statements block
 */
function generateImports(
  mantineComponent: string,
  useModule: boolean,
  responsive: boolean
): string {
  let imports = `import { ${mantineComponent} } from '@mantine/core';\n`;
  
  if (responsive) {
    imports += `import { useMediaQuery } from '@mantine/hooks';\n`;
  }
  
  if (useModule) {
    imports += `import classes from './${mantineComponent.toLowerCase()}.module.css';\n`;
  }
  
  return imports;
}

/**
 * Generate props interface for the component
 * @param name Component name
 * @param props Component props
 * @returns Props interface code
 */
function generatePropsInterface(
  name: string,
  props: Record<string, any>
): string {
  if (!props || Object.keys(props).length === 0) {
    return ''; // No props, no interface needed
  }
  
  // Start the interface definition
  let interfaceCode = `export interface ${name}Props {\n`;
  
  // Add each prop with its type
  for (const [propName, propConfig] of Object.entries(props)) {
    const required = propConfig.required ? '' : '?';
    const type = propConfig.type || 'any';
    const comment = propConfig.description ? `  /** ${propConfig.description} */\n` : '';
    
    interfaceCode += `${comment}  ${propName}${required}: ${type};\n`;
  }
  
  // Close the interface
  interfaceCode += `}`;
  
  return interfaceCode;
}

/**
 * Generate the component body
 * @param name Component name
 * @param mantineComponent Mantine component to use
 * @param props Component props
 * @param styling Styling options
 * @returns Component body code
 */
function generateComponentBody(
  name: string,
  mantineComponent: string,
  props: Record<string, any>,
  styling: ComponentGenerationConfig['styling'] = {}
): string {
  const { useModule = false, responsive = false, themeOverrides = {} } = styling;
  
  let body = '';
  
  // Add responsive hooks if needed
  if (responsive) {
    body += `  const isMobile = useMediaQuery('(max-width: 768px)');\n`;
  }
  
  // Start the return statement
  body += `  return (\n`;
  
  // Generate the component JSX
  const componentProps = generateComponentProps(props, themeOverrides, useModule);
  
  body += `    <${mantineComponent}${componentProps ? ` ${componentProps}` : ''}>
      {/* Your component content here */}
    </${mantineComponent}>
  );`;
  
  return body;
}

/**
 * Generate component props string
 * @param props Component props
 * @param themeOverrides Theme overrides
 * @param useModule Whether to use CSS modules
 * @returns Component props string
 */
function generateComponentProps(
  props: Record<string, any>,
  themeOverrides: Record<string, any>,
  useModule: boolean
): string {
  const propParts = [];
  
  // Add className if using modules
  if (useModule) {
    propParts.push(`className={classes.root}`);
  }
  
  // Add any theme overrides as inline styles or class names
  if (Object.keys(themeOverrides).length > 0) {
    const overridesStr = JSON.stringify(themeOverrides, null, 2)
      .replace(/"([^"]+)":/g, '$1:')
      .replace(/"/g, "'");
    
    propParts.push(`sx={${overridesStr}}`);
  }
  
  // Add responsive props if needed
  for (const [propName, propConfig] of Object.entries(props)) {
    if (propConfig.responsive) {
      propParts.push(`${propName}={isMobile ? ${propConfig.mobileValue} : ${propConfig.defaultValue}}`);
    } else if (propConfig.defaultValue !== undefined) {
      // Add non-responsive props with default values
      const value = typeof propConfig.defaultValue === 'string' 
        ? `"${propConfig.defaultValue}"`
        : propConfig.defaultValue;
      
      propParts.push(`${propName}={${value}}`);
    }
  }
  
  return propParts.join('\n      ');
}

/**
 * Generate a CSS module template for the component
 * @param config Component generation configuration
 * @returns Generated CSS module code
 */
export function generateCssModuleTemplate(config: ComponentGenerationConfig): string {
  const { themeOverrides = {} } = config.styling || {};
  
  // Start with the root class
  let css = `.root {\n`;
  
  // Add any theme overrides as CSS properties
  for (const [prop, value] of Object.entries(themeOverrides)) {
    // Convert camelCase to kebab-case
    const cssProperty = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
    css += `  ${cssProperty}: ${value};\n`;
  }
  
  // Close the root class
  css += `}\n`;
  
  return css;
}

/**
 * Generate variant templates for a component
 * @param config Component generation configuration
 * @returns Object with generated variants
 */
export function generateVariants(config: ComponentGenerationConfig): Record<string, string> {
  const { name, mantineComponent, variants = [] } = config;
  const result: Record<string, string> = {};
  
  if (!variants.length) {
    return result;
  }
  
  // Generate a variant for each configuration
  for (const variant of variants) {
    const variantConfig = {
      ...config,
      name: `${name}${variant.name.charAt(0).toUpperCase() + variant.name.slice(1)}`,
      props: {
        ...config.props,
        ...variant.props
      },
    };
    
    result[variant.name] = generateBasicComponentTemplate(variantConfig);
  }
  
  return result;
}

/**
 * Generate index file for exporting all components
 * @param configs Component generation configurations
 * @returns Generated index file content
 */
export function generateIndexFile(configs: ComponentGenerationConfig[]): string {
  let exports = '';
  
  for (const config of configs) {
    exports += `export { ${config.name} } from './${config.name}';\n`;
    exports += `export type { ${config.name}Props } from './${config.name}';\n`;
  }
  
  return exports;
}

/**
 * Generate test file for a component
 * @param config Component generation configuration
 * @returns Generated test file content
 */
export function generateTestFile(config: ComponentGenerationConfig): string {
  const { name } = config;
  
  return `import { render, screen } from '@testing-library/react';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('renders correctly', () => {
    render(<${name} />);
    // Add your test assertions here
  });
  
  // Add more tests as needed
});
`;
}
