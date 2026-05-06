import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3001/');
  await page.getByRole('link', { name: 'Sign in' }).click();
  await page.getByRole('textbox', { name: 'Your username' }).click();
  await page.getByRole('textbox', { name: 'Your username' }).fill('alice');
  await page.getByRole('textbox', { name: 'Your password' }).click();
  await page.getByRole('textbox', { name: 'Your password' }).fill('alice123');
  await page.getByRole('textbox', { name: 'Your password' }).press('Enter');    
  await expect(page.getByText('Shop Search 👤 alice 🛒 Cart')).toBeVisible();
});