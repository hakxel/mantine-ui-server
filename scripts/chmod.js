#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const executablePath = path.resolve(__dirname, '../build/index.js');
console.log(`Setting executable permissions for: ${executablePath}`);

try {
  fs.chmodSync(executablePath, 0o755);
  console.log('Permissions set successfully.');
} catch (error) {
  console.error('Error setting permissions:', error);
  process.exit(1);
}
