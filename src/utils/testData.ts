import fs from 'node:fs';
import path from 'node:path';

export type LoginCreds = { username: string; password: string };

function readJsonIfExists(p: string): any | null {
  try {
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, 'utf-8');
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return null;
}

export function getLoginCreds(): LoginCreds {
  // Highest priority: environment variables (handy for CI/secrets)
  const envUser = process.env.LOGIN_USERNAME || process.env.PLAYWRIGHT_USERNAME || process.env.USERNAME;
  const envPass = process.env.LOGIN_PASSWORD || process.env.PLAYWRIGHT_PASSWORD || process.env.PASSWORD;
  if (envUser && envPass) return { username: envUser, password: envPass };

  // Otherwise use a repo file
  const candidates = [
    path.resolve(process.cwd(), 'tests', 'data', 'login.json')
  ];
  for (const p of candidates) {
    const j = readJsonIfExists(p);
    if (j?.validUser?.username && j?.validUser?.password) {
      return { username: j.validUser.username, password: j.validUser.password };
    }
  }

  // Final fallback (demo creds)
  return { username: 'demouser', password: 'fashion123' };
}
