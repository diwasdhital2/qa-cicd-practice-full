import { test, expect } from '@playwright/test';
import { LoginPage } from '../../Pages/loginPage';
import { TEST_USERS, URLS, MESSAGES } from '../../testData';

test.describe('Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should load the login page', async () => {
    await loginPage.expectPageLoaded();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await loginPage.login(TEST_USERS.valid.username, TEST_USERS.valid.password);
    await expect(page).toHaveURL(URLS.home);
    await expect(page.getByText(`👤 ${TEST_USERS.valid.username}`)).toBeVisible();
  });

  test('should show error for invalid credentials', async () => {
    await loginPage.login(TEST_USERS.invalid.username, TEST_USERS.invalid.password);
    await loginPage.expectErrorMessage(MESSAGES.invalidCredentials);
  });

  test('should login case-insensitively', async ({ page }) => {
    await loginPage.login(TEST_USERS.upperCase.username, TEST_USERS.upperCase.password);
    await expect(page).toHaveURL(URLS.home);
  });
});