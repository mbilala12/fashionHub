import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

type PR = {
  title: string;
  created_at: string;
  user: { login: string };
  html_url: string;
  number: number;
};

test('TC4 - Output open PRs to CSV (name, created date, author)', async ({ request }) => {
  const url = 'https://api.github.com/repos/appwrite/appwrite/pulls?state=open&per_page=100';
  const res = await request.get(url, {
    headers: { 'User-Agent': 'playwright-fh', 'Accept': 'application/vnd.github+json' }
  });
  expect(res.ok()).toBeTruthy();
  const data = (await res.json()) as PR[];

  const rows = [['PR Name', 'Created Date (UTC)', 'Author']];
  for (const pr of data) {
    rows.push([pr.title, pr.created_at, pr.user.login]);
  }

  const csv = rows.map(r => r.map(v => `"${(v || '').replaceAll('"', '""')}"`).join(',')).join('\n');
  const outDir = path.join(process.cwd(), 'artifacts');
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, 'appwrite_open_prs.csv');
  fs.writeFileSync(file, csv, 'utf-8');
  console.log(`CSV written to: ${file}`);
  console.log(csv);
});
