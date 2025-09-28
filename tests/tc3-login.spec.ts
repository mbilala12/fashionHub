import { test } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { canReach } from '../src/utils/net';
import { getLoginCreds } from '../src/utils/testData';

test.beforeAll(async ({ baseURL }) => {
  if (!baseURL) test.skip(true, 'No baseURL configured.');
  const reachable = await canReach(baseURL!);
  test.skip(!reachable, `Base URL not reachable: ${baseURL}`);
});


test('TC3 - Customer can log in with valid credentials', async ({ page, baseURL }) => {
  const login = new LoginPage(page);
  await login.goto(baseURL!);

  const { username, password } = getLoginCreds();
  await login.login(username, password);

  await login.expectLoggedIn();
});