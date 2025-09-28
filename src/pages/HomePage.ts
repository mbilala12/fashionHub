import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly navLinks: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navLinks = page.locator('a[href]');
  }

  async goto(baseURL: string) {
    await this.page.goto(baseURL, { waitUntil: 'domcontentloaded' });
    await expect(this.page).toHaveTitle(/fashion|hub|pocket/i);
  }
}
