import { test, expect, request } from '@playwright/test';
import { isSkippable, normalize } from '../src/utils/links';
import { canReach } from '../src/utils/net';
test.beforeAll(async ({ baseURL }) => {
  if (!baseURL) test.skip(true, 'No baseURL configured.');
  const reachable = await canReach(baseURL!);
  test.skip(!reachable, `Base URL not reachable: ${baseURL}`);
});


test('TC2 - All links should return 200/30x and not 40x', async ({ page, baseURL, browser }) => {
  await page.goto(baseURL!);
  const hrefs = await page.locator('a[href]').evaluateAll(links =>
    Array.from(new Set(links.map(a => (a as HTMLAnchorElement).getAttribute('href') || '')))
  );

  const base = baseURL!;
  const urls = hrefs
    .filter(h => !isSkippable(h))
    .map(h => normalize(base, h));

  const unique = Array.from(new Set(urls));

  const api = await request.newContext();
  const failures: { url: string; status: number }[] = [];
  for (const url of unique) {
    const res = await api.fetch(url, { method: 'HEAD' }).catch(() => null);
    let status = res?.status() ?? 0;
    // Some servers may not support HEAD; fallback to GET
    if (!res || status === 0 || status >= 400) {
      const resGet = await api.get(url).catch(() => null);
      status = resGet?.status() ?? 0;
    }
    console.log(`Checked ${url} -> ${status}`);
    if (!(status >= 200 && status < 400)) failures.push({ url, status });
  }

  if (failures.length) {
    const list = failures.map(f => `${f.url} -> ${f.status}`).join('\n');
    throw new Error(`Found non-success statuses for ${failures.length} link(s):\n${list}`);
  }

  // Optionally visit each link to ensure client navigation works (best-effort, ignore external domains)
  for (const url of unique) {
    if (!url.startsWith(base)) continue;
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded' });
    expect(resp?.status(), `Visit ${url}`).toBeTruthy();
    await page.goto(base, { waitUntil: 'domcontentloaded' });
  }
});