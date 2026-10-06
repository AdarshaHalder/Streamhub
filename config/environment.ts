import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';

/**
 * Loads config/env/.env.<TEST_ENV> (default "local"). Real environment variables
 * always win, so CI can override any single value without editing files.
 */
const envName = process.env.TEST_ENV ?? 'local';
const envFile = path.resolve(__dirname, 'env', `.env.${envName}`);
if (!fs.existsSync(envFile)) {
  throw new Error(`Unknown TEST_ENV "${envName}": ${envFile} does not exist`);
}
dotenv.config({ path: envFile, quiet: true });

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable ${name} (env: ${envName})`);
  return value;
}

export const env = {
  name: envName,
  baseUrl: required('BASE_URL'),
  appPort: Number(process.env.APP_PORT ?? 4173),
  startApp: process.env.START_APP !== 'false',
  apiBaseUrl: required('API_BASE_URL'),
  apiMaxResponseMs: Number(process.env.API_MAX_RESPONSE_MS ?? 5000),
  headless: process.env.HEADLESS !== 'false',
} as const;
