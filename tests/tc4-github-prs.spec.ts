import { test, expect, request } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

type PR = {
  title: string;
  created_at: string;
  user: { login: string };
};

async function fetchAllOpenPRs(owner: string, repo: string) {
  const perPage = 100;
  let pageNum = 1;
  const all: PR[] = [];
  const headers: Record<string, string> = {
    'User-Agent': 'playwright-fh',
    'Accept': 'application/vnd.github+json'
  };
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const ctx = await request.newContext();
  try {
    while (true) {
      const url = `https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=${perPage}&page=${pageNum}`;
      const res = await ctx.get(url, { headers });
      expect(res.ok(), `GitHub API request failed for page ${pageNum}`).toBeTruthy();
      const pageData = (await res.json()) as PR[];
      all.push(...pageData);
      if (pageData.length < perPage) break;
      pageNum += 1;
    }
  } finally {
    await ctx.dispose();
  }
  return all;
}

test('TC4 - Output open PRs to CSV (name, created date, author) with pagination', async () => {
  const data = await fetchAllOpenPRs('appwrite', 'appwrite');

  const rows = [['PR Name', 'Created Date (UTC)', 'Author']];
  for (const pr of data) {
    rows.push([pr.title, pr.created_at, pr.user.login]);
  }

  const csv = rows.map(r => r.map(v => `\"${(v || '').replaceAll('\"', '\"\"')}\"`).join(',')).join('\n');
  const outDir = path.join(process.cwd(), 'artifacts');
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, 'appwrite_open_prs.csv');
  fs.writeFileSync(file, csv, 'utf-8');
  console.log(`CSV written to: ${file} (total PRs: ${data.length})`);
  console.log(csv);
});
