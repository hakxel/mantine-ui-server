/**
 * Configuration management for the Mantine UI MCP server
 */

import { ServerConfig } from '../types/index.js';

// Default configuration values
export const defaultConfig: ServerConfig = {
  mantineVersion: '7.16.2', // Default to latest version at time of writing
  defaultMantineImports: {
    core: '@mantine/core',
    hooks: '@mantine/hooks',
    dates: '@mantine/dates',
    form: '@mantine/form',
    notifications: '@mantine/notifications',
  },
  projectDefaults: {
    componentStructure: 'default',
    stylingApproach: 'css-modules',
    themeIntegration: 'provider',
    typescript: true,
  },
  caching: {
    documentation: {
      ttl: 86400000, // 24 hours in milliseconds
      storage: 'file',
    },
  },
  extensions: {
    paths: [],
    enabled: [],
  },
};

// Global configuration instance
let config: ServerConfig = { ...defaultConfig };

/**
 * Initializes the configuration with default values and applies overrides
 * @param overrides Optional configuration overrides
 * @returns The merged configuration
 */
export function initConfig(overrides?: Partial<ServerConfig>): ServerConfig {
  config = {
    ...defaultConfig,
    ...overrides,
    // Deep merge for nested properties
    projectDefaults: {
      ...defaultConfig.projectDefaults,
      ...overrides?.projectDefaults,
    },
    caching: {
      ...defaultConfig.caching,
      ...overrides?.caching,
    },
  };
  return config;
}

/**
 * Gets the current configuration
 * @returns The current configuration
 */
export function getConfig(): ServerConfig {
  return config;
}

/**
 * Updates the configuration
 * @param updates Configuration updates to apply
 * @returns The updated configuration
 */
export function updateConfig(updates: Partial<ServerConfig>): ServerConfig {
  config = {
    ...config,
    ...updates,
    // Deep merge for nested properties
    projectDefaults: {
      ...config.projectDefaults,
      ...updates.projectDefaults,
    },
    caching: {
      ...config.caching,
      ...updates.caching,
    },
  };
  return config;
}

/**
 * Read environment variables for configuration
 * @returns A configuration object based on environment variables
 */
export function loadConfigFromEnv(): Partial<ServerConfig> {
  const env = process.env;
  const config: Partial<ServerConfig> = {};

  if (env.MANTINE_VERSION) {
    config.mantineVersion = env.MANTINE_VERSION;
  }

  if (env.CACHE_DOCS === 'false') {
    config.caching = {
      documentation: {
        ttl: 0, // Disable caching
        storage: 'memory',
      },
    };
  } else if (env.CACHE_TTL) {
    config.caching = {
      documentation: {
        ttl: parseInt(env.CACHE_TTL, 10) * 1000, // Convert to milliseconds
        storage: env.CACHE_STORAGE as 'memory' | 'file' || 'file',
      },
    };
  }

  return config;
}
