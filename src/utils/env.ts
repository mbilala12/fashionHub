import fs from 'node:fs';
import path from 'node:path';

export type AppEnv = {
  envName: string;
  baseURL: string;
};

function loadJson(filePath: string): any {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function resolveEnv(): AppEnv {
  // Highest-priority overrides via env vars
  const envBaseUrl = process.env.BASE_URL || process.env.TEST_BASE_URL;
  if (envBaseUrl) {
    return { envName: process.env.TEST_ENV || process.env.ENV || 'custom', baseURL: envBaseUrl };
  }

  // Next: CLI flag --env=xxx or environment variables indicating the env name
  const cliEnv = process.env.TEST_ENV || process.env.env || process.env.ENV;
  const argEnv = process.argv.find(a => a.startsWith('--env='))?.split('=')[1];
  const preferred = argEnv || cliEnv || 'prod';

  const configDir = path.resolve(process.cwd(), 'configs');
  const tryFiles = [
    path.join(configDir, `${preferred}.json`),
    path.join(configDir, 'prod.json')
  ];

  for (const file of tryFiles) {
    const cfg = loadJson(file);
    if (cfg?.baseURL) return cfg as AppEnv;
  }
  // Fallback hard-coded prod
  return { envName: 'prod', baseURL: 'https://pocketaces2.github.io/fashionhub' };
}
