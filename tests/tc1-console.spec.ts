import { test, expect } from '@playwright/test';
import { watchConsole } from '../src/utils/consoleWatcher';
import { canReach } from '../src/utils/net';
test.beforeAll(async ({ baseURL }) => {
  if (!baseURL) test.skip(true, 'No baseURL configured.');
  const reachable = await canReach(baseURL!);
  test.skip(!reachable, `Base URL not reachable: ${baseURL}`);
});


test.describe('TC1 - Console errors', () => {
  test('Home page should have no console errors', async ({ page, baseURL }) => {
    const watcher = await watchConsole(page);
    await page.goto(baseURL!, { waitUntil: 'domcontentloaded' });
    // small wait to capture late console errors
    await page.waitForTimeout(500);
    if (watcher.errors.length) {
      const msgs = watcher.errors.map(m => m.text()).join('\n---\n');
      throw new Error(`Console errors found on Home page:\n${msgs}`);
    }
  });

  test('About page should demonstrate error capture (expected errors)', async ({ page, baseURL }) => {
    const watcher = await watchConsole(page);
    await page.goto(`${baseURL}/about.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    // We expect at least one error on the about page per the challenge hint
    expect(watcher.errors.length).toBeGreaterThan(0);
    console.log(`Captured ${watcher.errors.length} console error(s) on About page as expected.`);
  });
});