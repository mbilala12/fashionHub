import { test } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { canReach } from '../src/utils/net';
test.beforeAll(async ({ baseURL }) => {
  if (!baseURL) test.skip(true, 'No baseURL configured.');
  const reachable = await canReach(baseURL!);
  test.skip(!reachable, `Base URL not reachable: ${baseURL}`);
});


test('TC3 - Customer can log in with valid credentials', async ({ page, baseURL }) => {
  const login = new LoginPage(page);
  await login.goto(baseURL!);
  await login.login('demouser', 'fashion123');
  await login.expectLoggedIn();
});