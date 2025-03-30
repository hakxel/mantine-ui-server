/**
 * Type definitions for the Mantine UI MCP server
 */

/**
 * Represents a Mantine component's property
 */
export interface MantineComponentProp {
  name: string;
  type: string;
  defaultValue?: string;
  description: string;
  required: boolean;
}

/**
 * Represents a code example for a Mantine component
 */
export interface MantineComponentExample {
  title: string;
  code: string;
  description?: string;
  preview?: string; // Base64 encoded image if available
}

/**
 * Represents a Mantine component's documentation
 */
export interface MantineComponentDoc {
  name: string;
  description: string;
  props: MantineComponentProp[];
  examples: MantineComponentExample[];
  importStatement: string;
  packageName: string;
  version: string;
  url: string;
  relatedComponents?: string[];
  lastFetchedAt: Date;
}

/**
 * Configuration for component generation
 */
export interface ComponentGenerationConfig {
  name: string;
  mantineComponent: string;
  props?: Record<string, any>;
  styling?: {
    useModule?: boolean;
    responsive?: boolean;
    themeOverrides?: Record<string, any>;
  };
  patterns?: string[];
  variants?: Array<{
    name: string;
    props: Record<string, any>;
  }>;
  includeTests?: boolean;
}

/**
 * Theme configuration type
 */
export interface ThemeConfig {
  extension: 'colors' | 'components' | 'typography' | 'spacing' | 'radius' | 'shadows' | 'other';
  definitions: Record<string, any>;
  darkMode?: boolean;
  output?: 'merge' | 'separate';
}

/**
 * Component theme configuration
 */
export interface ComponentThemeConfig {
  component: string;
  colorScheme?: 'both' | 'light' | 'dark';
  baseColor?: string;
  variants?: Array<{
    name: string;
    styles: Record<string, any>;
  }>;
  customSelectors?: Record<string, any>;
}

/**
 * Represents a cache entry
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: Date;
  version: string;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  storage: 'memory' | 'file';
}

/**
 * Server configuration
 */
export interface ServerConfig {
  mantineVersion?: string;
  defaultMantineImports?: Record<string, string>;
  projectDefaults?: {
    componentStructure?: string;
    stylingApproach?: string;
    themeIntegration?: string;
    typescript?: boolean;
  };
  caching?: {
    documentation?: CacheConfig;
  };
  extensions?: {
    paths?: string[];
    enabled?: string[];
  };
}
