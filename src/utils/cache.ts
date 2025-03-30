/**
 * Caching utilities for the Mantine UI MCP server
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { CacheEntry, CacheConfig } from '../types/index.js';

// In-memory cache store
const memoryCache: Record<string, CacheEntry<any>> = {};

// Cache directory path
const CACHE_DIR = path.join(os.homedir(), '.mantine-mcp-cache');

/**
 * Ensures the cache directory exists
 */
function ensureCacheDir(): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

/**
 * Gets the file path for a cache key
 * @param key Cache key
 * @returns File path for the cache key
 */
function getCacheFilePath(key: string): string {
  return path.join(CACHE_DIR, `${key.replace(/[^a-z0-9]/gi, '_')}.json`);
}

/**
 * Sets a value in the cache
 * @param key Cache key
 * @param value Value to cache
 * @param config Cache configuration
 * @param version Version identifier (typically Mantine version)
 */
export function setCache<T>(
  key: string, 
  value: T, 
  config: CacheConfig,
  version: string
): void {
  const entry: CacheEntry<T> = {
    data: value,
    timestamp: new Date(),
    version,
  };

  // Always store in memory
  memoryCache[key] = entry;

  // Store in file if configured
  if (config.storage === 'file') {
    ensureCacheDir();
    const filePath = getCacheFilePath(key);
    fs.writeFileSync(filePath, JSON.stringify(entry), 'utf8');
  }
}

/**
 * Gets a value from the cache
 * @param key Cache key
 * @param config Cache configuration
 * @param currentVersion Current version (typically Mantine version)
 * @returns Cached value or null if not found or expired
 */
export function getCache<T>(
  key: string, 
  config: CacheConfig,
  currentVersion: string
): T | null {
  // First check memory cache
  const memoryEntry = memoryCache[key] as CacheEntry<T> | undefined;
  
  if (memoryEntry && isValidCacheEntry(memoryEntry, config.ttl, currentVersion)) {
    return memoryEntry.data;
  }

  // If not in memory and file storage is enabled, check file
  if (config.storage === 'file') {
    try {
      const filePath = getCacheFilePath(key);
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const fileEntry = JSON.parse(fileContent) as CacheEntry<T>;
        
        if (isValidCacheEntry(fileEntry, config.ttl, currentVersion)) {
          // Update memory cache
          memoryCache[key] = fileEntry;
          return fileEntry.data;
        }
      }
    } catch (error) {
      console.error(`Error reading cache file for key ${key}:`, error);
    }
  }

  return null;
}

/**
 * Checks if a cache entry is valid (not expired and matching version)
 * @param entry Cache entry
 * @param ttl Time to live in milliseconds
 * @param currentVersion Current version to check against
 * @returns Whether the cache entry is valid
 */
function isValidCacheEntry<T>(
  entry: CacheEntry<T>, 
  ttl: number,
  currentVersion: string
): boolean {
  // If TTL is 0, cache is disabled
  if (ttl === 0) {
    return false;
  }

  // Check version match
  if (entry.version !== currentVersion) {
    return false;
  }

  // Check if expired
  const entryTimestamp = new Date(entry.timestamp).getTime();
  const now = Date.now();
  return (now - entryTimestamp) < ttl;
}

/**
 * Clears the cache for a specific key
 * @param key Cache key
 * @param config Cache configuration
 */
export function clearCache(key: string, config: CacheConfig): void {
  // Clear from memory
  delete memoryCache[key];

  // Clear from file if applicable
  if (config.storage === 'file') {
    try {
      const filePath = getCacheFilePath(key);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Error clearing cache file for key ${key}:`, error);
    }
  }
}

/**
 * Clears all cache entries
 * @param config Cache configuration
 */
export function clearAllCache(config: CacheConfig): void {
  // Clear memory cache
  Object.keys(memoryCache).forEach(key => {
    delete memoryCache[key];
  });

  // Clear file cache if applicable
  if (config.storage === 'file') {
    try {
      ensureCacheDir();
      const files = fs.readdirSync(CACHE_DIR);
      files.forEach(file => {
        const filePath = path.join(CACHE_DIR, file);
        fs.unlinkSync(filePath);
      });
    } catch (error) {
      console.error('Error clearing all cache files:', error);
    }
  }
}
