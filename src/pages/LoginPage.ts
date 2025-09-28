import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly username: Locator;
  readonly password: Locator;
  readonly submit: Locator;

  constructor(page: Page) {
    this.page = page;
    this.username = page.getByLabel(/user(name)?/i).or(page.getByPlaceholder(/user/i));
    this.password = page.getByLabel(/pass(word)?/i).or(page.getByPlaceholder(/pass/i));
    this.submit = page.getByRole('button', { name: /log ?in|sign ?in|submit/i });
  }

  async goto(baseURL: string) {
    await this.page.goto(`${baseURL}/login.html`, { waitUntil: 'domcontentloaded' });
  }

  async login(u: string, p: string) {
    await this.username.fill(u);
    await this.password.fill(p);
    await this.submit.click();
  }

  async expectLoggedIn() {
    const logout = this.page.locator('[data-testid="logout"], [data-test="logout"], #logout, .logout').first();
    const welcome = this.page.getByText(/welcome|logged in|sign ?out|logout/i).first();

    await Promise.race([
      this.page.waitForURL(/account\.html|dashboard|my[- ]?account/i, { timeout: 8000 }),
      logout.waitFor({ state: 'visible', timeout: 8000 }),
      welcome.waitFor({ state: 'visible', timeout: 8000 })
    ]);
  }
}
