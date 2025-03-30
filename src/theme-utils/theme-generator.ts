/**
 * Theme utilities for the Mantine UI MCP server
 */

import type { MantineThemeOverride, MantineColorsTuple } from '@mantine/core';
import { ThemeConfig, ComponentThemeConfig } from '../types/index.js';

/**
 * Generate a theme configuration based on provided settings
 * @param config Theme configuration
 * @returns Generated theme configuration
 */
export function generateTheme(config: ThemeConfig): Record<string, any> {
  const { extension, definitions, darkMode = false } = config;
  
  switch (extension) {
    case 'colors':
      return generateColorPalettes(definitions);
    case 'components':
      return generateComponentThemes(definitions);
    case 'typography':
      return generateTypographyTheme(definitions);
    case 'spacing':
      return generateSpacingTheme(definitions);
    case 'radius':
      return generateRadiusTheme(definitions);
    case 'shadows':
      return generateShadowsTheme(definitions);
    case 'other':
    default:
      return definitions;
  }
}

/**
 * Generate color palettes based on provided definitions
 * @param definitions Color definitions
 * @returns Generated color palettes
 */
export function generateColorPalettes(
  definitions: Record<string, string | MantineColorsTuple>
): Record<string, MantineColorsTuple> {
  const palettes: Record<string, MantineColorsTuple> = {};
  
  for (const [name, value] of Object.entries(definitions)) {
    if (typeof value === 'string') {
      // If a single color is provided, generate a palette
      palettes[name] = generateColorShades(value);
    } else if (Array.isArray(value) && value.length === 10) {
      // If a complete palette is provided, use it directly
      palettes[name] = value;
    }
  }
  
  return palettes;
}

/**
 * Generate color shades from a base color
 * @param baseColor Base color in hex format
 * @returns Array of 10 color shades
 */
export function generateColorShades(baseColor: string): MantineColorsTuple {
  // This is a simplified algorithm; in a real implementation, this would use
  // color manipulation libraries to generate proper shades
  const hexToRgb = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  };
  
  const rgbToHex = (r: number, g: number, b: number): string => {
    return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
  };
  
  const lighten = (rgb: [number, number, number], amount: number): [number, number, number] => {
    return [
      rgb[0] + (255 - rgb[0]) * amount,
      rgb[1] + (255 - rgb[1]) * amount,
      rgb[2] + (255 - rgb[2]) * amount
    ];
  };
  
  const darken = (rgb: [number, number, number], amount: number): [number, number, number] => {
    return [
      rgb[0] * (1 - amount),
      rgb[1] * (1 - amount),
      rgb[2] * (1 - amount)
    ];
  };
  
  const rgb = hexToRgb(baseColor);
  
  // Generate 10 shades, with the base color at index 5
  return [
    rgbToHex(...lighten(rgb, 0.9)),
    rgbToHex(...lighten(rgb, 0.7)),
    rgbToHex(...lighten(rgb, 0.5)),
    rgbToHex(...lighten(rgb, 0.3)),
    rgbToHex(...lighten(rgb, 0.1)),
    baseColor,
    rgbToHex(...darken(rgb, 0.1)),
    rgbToHex(...darken(rgb, 0.2)),
    rgbToHex(...darken(rgb, 0.3)),
    rgbToHex(...darken(rgb, 0.4))
  ] as MantineColorsTuple;
}

/**
 * Generate component theme configurations
 * @param definitions Component theme definitions
 * @returns Generated component theme configurations
 */
export function generateComponentThemes(
  definitions: Record<string, any>
): Record<string, any> {
  const componentThemes: Record<string, any> = {};
  
  for (const [component, config] of Object.entries(definitions)) {
    componentThemes[component] = {
      defaultProps: config.defaultProps || {},
      styles: (theme: any) => ({
        root: {
          ...(config.styles?.root || {})
        },
        ...(config.styles || {})
      }),
      variants: config.variants || {}
    };
  }
  
  return { components: componentThemes };
}

/**
 * Generate typography theme configuration
 * @param definitions Typography definitions
 * @returns Generated typography theme
 */
export function generateTypographyTheme(
  definitions: Record<string, any>
): Record<string, any> {
  return {
    fontFamily: definitions.fontFamily || undefined,
    fontFamilyMonospace: definitions.fontFamilyMonospace || undefined,
    headings: definitions.headings || undefined,
    fontSizes: definitions.fontSizes || undefined,
    lineHeights: definitions.lineHeights || undefined,
  };
}

/**
 * Generate spacing theme configuration
 * @param definitions Spacing definitions
 * @returns Generated spacing theme
 */
export function generateSpacingTheme(
  definitions: Record<string, any>
): Record<string, any> {
  return {
    spacing: definitions.values || definitions
  };
}

/**
 * Generate radius theme configuration
 * @param definitions Radius definitions
 * @returns Generated radius theme
 */
export function generateRadiusTheme(
  definitions: Record<string, any>
): Record<string, any> {
  return {
    radius: definitions.values || definitions
  };
}

/**
 * Generate shadows theme configuration
 * @param definitions Shadow definitions
 * @returns Generated shadows theme
 */
export function generateShadowsTheme(
  definitions: Record<string, any>
): Record<string, any> {
  return {
    shadows: definitions.values || definitions
  };
}

/**
 * Generate theme for a specific component
 * @param config Component theme configuration
 * @returns Generated component theme
 */
export function generateComponentTheme(config: ComponentThemeConfig): Record<string, any> {
  const { component, colorScheme = 'both', baseColor, variants, customSelectors } = config;
  
  // Base theme structure
  const componentTheme: Record<string, any> = {
    defaultProps: {},
    styles: (theme: any) => ({
      root: {
        // Base styles for the component
      },
      // Add custom selectors if provided
      ...(customSelectors || {})
    })
  };
  
  // Add variants if provided
  if (variants && variants.length > 0) {
    componentTheme.variants = {};
    
    variants.forEach(variant => {
      componentTheme.variants[variant.name] = (theme: any) => ({
        root: {
          ...variant.styles
        }
      });
    });
  }
  
  // Create final theme object
  const themeObject: Record<string, any> = {
    components: {
      [component]: componentTheme
    }
  };
  
  return themeObject;
}

/**
 * Generate a Mantine theme configuration
 * @param configs Array of theme configurations
 * @returns Complete Mantine theme configuration
 */
export function generateCompleteTheme(configs: ThemeConfig[]): MantineThemeOverride {
  // Start with empty theme
  const theme: Record<string, any> = {};
  
  // Apply each configuration
  configs.forEach(config => {
    const generatedConfig = generateTheme(config);
    
    // Merge the generated config into the theme
    if (config.extension === 'components') {
      theme.components = {
        ...theme.components,
        ...generatedConfig.components
      };
    } else if (config.extension === 'colors') {
      theme.colors = {
        ...theme.colors,
        ...generatedConfig
      };
    } else {
      // For other extensions, merge at the top level
      Object.assign(theme, generatedConfig);
    }
  });
  
  return theme as MantineThemeOverride;
}

/**
 * Generate academic-specific theme
 * @returns Academic theme configuration
 */
export function generateAcademicTheme(): MantineThemeOverride {
  return {
    // Academic-focused typography
    fontFamily: '"Merriweather", serif',
    fontFamilyMonospace: '"Roboto Mono", monospace',
    headings: {
      fontFamily: '"Roboto", sans-serif',
      fontWeight: '500',
    },
    
    // Academic color palette
    colors: {
      // Example academic-focused colors
      academicBlue: generateColorShades('#2C3E50') as MantineColorsTuple,
      academicGreen: generateColorShades('#27AE60') as MantineColorsTuple,
      academicRed: generateColorShades('#C0392B') as MantineColorsTuple,
      academicGold: generateColorShades('#F39C12') as MantineColorsTuple,
      paperWhite: generateColorShades('#FAFAFA') as MantineColorsTuple,
    },
    
    // Component-specific overrides
    components: {
      Paper: {
        defaultProps: {
          p: 'md',
          shadow: 'xs',
          withBorder: true,
        },
        styles: () => ({
          root: {
            backgroundColor: 'var(--mantine-color-paperWhite-0)',
            transition: 'all 200ms ease',
          }
        })
      },
      Text: {
        defaultProps: {
          size: 'md',
        },
        styles: () => ({
          root: {
            lineHeight: 1.6,
          }
        })
      },
      // Publication-specific components
      Card: {
        defaultProps: {
          shadow: 'sm',
          p: 'lg',
          radius: 'md',
        },
        styles: () => ({
          root: {
            backgroundColor: 'var(--mantine-color-paperWhite-0)',
          }
        })
      },
    },
  };
}
