/**
 * Documentation fetcher for Mantine components
 * Fetches documentation from mantine.dev website
 */

import axios from 'axios';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { MantineComponentDoc, MantineComponentProp, MantineComponentExample } from '../types/index.js';
import { getConfig } from '../utils/config.js';
import { getCache, setCache } from '../utils/cache.js';

// Base URL for Mantine documentation
const MANTINE_DOCS_BASE_URL = 'https://mantine.dev';

/**
 * Gets the documentation for a Mantine component
 * @param componentName Name of the Mantine component
 * @param forceRefresh Whether to bypass the cache and fetch fresh documentation
 * @returns Component documentation
 */
export async function getComponentDocumentation(
  componentName: string,
  forceRefresh = false
): Promise<MantineComponentDoc> {
  const config = getConfig();
  const cacheKey = `component_doc_${componentName}_${config.mantineVersion}`;
  
  // Check cache first if not forcing refresh
  if (!forceRefresh && config.caching?.documentation) {
    const cachedDoc = getCache<MantineComponentDoc>(
      cacheKey,
      config.caching.documentation,
      config.mantineVersion || '7.16.2'
    );
    
    if (cachedDoc) {
      return cachedDoc;
    }
  }
  
  // If not in cache or forcing refresh, fetch from website
  const componentDoc = await fetchComponentDocFromWebsite(componentName);
  
  // Cache the result
  if (config.caching?.documentation) {
    setCache(
      cacheKey,
      componentDoc,
      config.caching.documentation,
      config.mantineVersion || '7.16.2'
    );
  }
  
  return componentDoc;
}

/**
 * Fetches component documentation from the Mantine website
 * @param componentName Name of the component
 * @returns Component documentation
 */
async function fetchComponentDocFromWebsite(componentName: string): Promise<MantineComponentDoc> {
  // Normalize component name
  const normalizedName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
  
  // Determine the URL path for the component
  const componentUrl = `${MANTINE_DOCS_BASE_URL}/core/${normalizedName.toLowerCase()}`;
  
  try {
    // Use Puppeteer to render the page with JavaScript
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.goto(componentUrl, { waitUntil: 'networkidle2' });
    
    // Wait for important content to load
    await page.waitForSelector('.mantine-Code-root', { timeout: 5000 }).catch(() => {});
    
    // Get the HTML content
    const content = await page.content();
    
    // Close the browser
    await browser.close();
    
    // Parse the HTML using Cheerio
    const $ = cheerio.load(content);
    
    // Extract component description
    const description = $('.mantine-Title-root').next('p').text().trim();
    
    // Extract props table data
    const props: MantineComponentProp[] = [];
    $('.mantine-Table-root tbody tr').each((i, elem) => {
      const columns = $(elem).find('td');
      if (columns.length >= 4) {
        props.push({
          name: $(columns[0]).text().trim(),
          type: $(columns[1]).text().trim(),
          defaultValue: $(columns[2]).text().trim() || undefined,
          description: $(columns[3]).text().trim(),
          required: $(columns[0]).text().includes('*')
        });
      }
    });
    
    // Extract code examples
    const examples: MantineComponentExample[] = [];
    $('.mantine-Code-root').each((i, elem) => {
      const codeBlock = $(elem);
      const title = codeBlock.prev('h2, h3').text().trim() || `Example ${i + 1}`;
      const code = codeBlock.text().trim();
      
      examples.push({
        title,
        code,
        description: codeBlock.prev('p').text().trim() || undefined
      });
    });
    
    // Get import statement (from first example usually)
    let importStatement = '';
    if (examples.length > 0) {
      const importRegex = /import\s+{\s*[^}]*}\s+from\s+['"]@mantine\/[^'"]+['"]/;
      const match = examples[0].code.match(importRegex);
      importStatement = match ? match[0] : `import { ${normalizedName} } from '@mantine/core'`;
    } else {
      importStatement = `import { ${normalizedName} } from '@mantine/core'`;
    }
    
    // Determine package name from import statement
    const packageRegex = /@mantine\/([a-z-]+)/;
    const packageMatch = importStatement.match(packageRegex);
    const packageName = packageMatch ? `@mantine/${packageMatch[1]}` : '@mantine/core';
    
    // Extract related components
    const relatedComponents: string[] = [];
    $('.mantine-Anchor-root').each((i, elem) => {
      const href = $(elem).attr('href');
      if (href && href.startsWith('/core/') && !href.endsWith(normalizedName.toLowerCase())) {
        const relatedComponent = href.split('/').pop();
        if (relatedComponent) {
          relatedComponents.push(relatedComponent.charAt(0).toUpperCase() + relatedComponent.slice(1));
        }
      }
    });
    
    return {
      name: normalizedName,
      description,
      props,
      examples,
      importStatement,
      packageName,
      version: getConfig().mantineVersion || '7.16.2',
      url: componentUrl,
      relatedComponents: Array.from(new Set(relatedComponents)), // Remove duplicates
      lastFetchedAt: new Date()
    };
  } catch (error) {
    console.error(`Error fetching documentation for ${componentName}:`, error);
    throw new Error(`Failed to fetch documentation for ${componentName}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Searches for components that match a query
 * @param query Search query
 * @returns Array of matching component names
 */
export async function searchComponents(query: string): Promise<string[]> {
  try {
    const response = await axios.get(`${MANTINE_DOCS_BASE_URL}/api/search`, {
      params: { query },
      headers: {
        'User-Agent': 'MantineMcpServer/1.0.0'
      }
    });
    
    if (response.data && Array.isArray(response.data.results)) {
      return response.data.results
        .filter((result: any) => result.type === 'component')
        .map((result: any) => result.title);
    }
    
    return [];
  } catch (error) {
    console.error(`Error searching for components with query "${query}":`, error);
    return [];
  }
}

/**
 * Gets a list of all Mantine components
 * @returns Array of component names
 */
export async function listAllComponents(): Promise<string[]> {
  try {
    // Try to get common components from Mantine site navigation
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.goto(`${MANTINE_DOCS_BASE_URL}/core/button`, { waitUntil: 'networkidle2' });
    
    // Extract components from navigation
    const componentNames = await page.evaluate(() => {
      const navLinks = Array.from(document.querySelectorAll('a[href^="/core/"]'));
      return navLinks.map(link => {
        const href = link.getAttribute('href');
        if (!href) return null;
        const componentName = href.split('/').pop();
        if (!componentName) return null;
        return componentName.charAt(0).toUpperCase() + componentName.slice(1);
      }).filter(Boolean);
    });
    
    await browser.close();
    
    return componentNames as string[];
  } catch (error) {
    console.error('Error listing all components:', error);
    
    // Fallback to a list of common components
    return [
      'Accordion', 'ActionIcon', 'Affix', 'Alert', 'Anchor', 
      'AppShell', 'AspectRatio', 'Autocomplete', 'Avatar',
      'Badge', 'Blockquote', 'Box', 'Breadcrumbs', 'Burger', 'Button',
      'Card', 'Carousel', 'Center', 'Checkbox', 'Chip', 'Code', 'Collapse', 
      'ColorInput', 'ColorPicker', 'Container',
      'DateInput', 'DatePicker', 'DatePickerInput', 'DateTimePicker', 'Divider', 'Drawer', 'Dropzone',
      'FileInput', 'Flex', 'FloatingActionButton', 'FocusTrap',
      'Grid', 'Group',
      'Highlight',
      'Image', 'Indicator', 'Input', 'Indicator',
      'JsonInput',
      'Kbd',
      'List', 'Loader',
      'Mark', 'Menu', 'Modal', 'MultiSelect',
      'Navbar', 'NativeSelect', 'Notification', 'NumberInput',
      'Overlay',
      'Pagination', 'Paper', 'PasswordInput', 'Pill', 'PinInput', 'Popover', 'Portal', 'Progress',
      'Radio', 'RangeCalendar', 'RangeSlider', 'Rating', 'RingProgress',
      'ScrollArea', 'SegmentedControl', 'Select', 'SimpleGrid', 'Skeleton', 'Slider', 'Space', 'Spoiler', 
      'Stack', 'Stepper', 'Switch',
      'Table', 'Tabs', 'Text', 'Textarea', 'TextInput', 'ThemeIcon', 'Timeline', 'Title', 'Tooltip',
      'UnstyledButton'
    ];
  }
}
