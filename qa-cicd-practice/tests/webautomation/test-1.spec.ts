import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  // Recording...
   await page.locator('body').click();
});