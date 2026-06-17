import { test, expect } from '@playwright/test';

test.describe('Login', () => {

  test('should load the login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'alice');
    await page.fill('input[name="password"]', 'alice123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:3001/');
    await expect(page.getByText('👤 alice')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'alice');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('.alert-err')).toContainText('Invalid username or password.');
  });

  test('should login case-insensitively', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'ALICE');
    await page.fill('input[name="password"]', 'alice123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:3001/');
  });

});