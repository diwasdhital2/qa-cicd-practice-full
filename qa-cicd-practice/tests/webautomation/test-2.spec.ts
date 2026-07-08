import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
 await page.goto('http://localhost:3001/register');

 await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible();
 await expect(page.locator('div').nth(3)).toBeVisible();
 await page.getByRole('textbox', { name: 'Letters and numbers only' }).click();
 await page.getByRole('textbox', { name: 'Letters and numbers only' }).fill('testing');
 await page.getByText('Email').click();
 await page.getByRole('textbox', { name: 'you@example.com' }).click();
 await page.getByRole('textbox', { name: 'you@example.com' }).fill('abc@gmail.com');
 await page.getByRole('textbox', { name: 'Min 5 chars, 1 letter, 1' }).click();
 await page.getByRole('textbox', { name: 'Min 5 chars, 1 letter, 1' }).fill('ascbef123');
 await page.getByRole('button', { name: 'Create account' }).click();
 await page.getByRole('textbox', { name: 'you@example.com' }).click();
 await page.getByRole('textbox', { name: 'you@example.com' }).press('ArrowLeft');
 await page.getByRole('textbox', { name: 'you@example.com' }).press('ArrowLeft');
 await page.getByRole('textbox', { name: 'you@example.com' }).press('ArrowLeft');
 await page.getByRole('textbox', { name: 'you@example.com' }).press('ArrowLeft');
 await page.getByRole('textbox', { name: 'you@example.com' }).press('ArrowLeft');
 await page.getByRole('textbox', { name: 'you@example.com' }).press('ArrowLeft');
 await page.getByRole('textbox', { name: 'you@example.com' }).press('ArrowLeft');
 await page.getByRole('textbox', { name: 'you@example.com' }).press('ArrowLeft');
 await page.getByRole('textbox', { name: 'you@example.com' }).press('ArrowLeft');
 await page.getByRole('textbox', { name: 'you@example.com' }).press('ArrowLeft');
 await page.getByRole('textbox', { name: 'you@example.com' }).press('ArrowLeft');
 await page.getByRole('textbox', { name: 'you@example.com' }).press('ArrowRight');
 await page.getByRole('textbox', { name: 'you@example.com' }).fill('abcd@gmail.com');
 await page.getByRole('textbox', { name: 'Min 5 chars, 1 letter, 1' }).click();
 await page.getByRole('textbox', { name: 'Min 5 chars, 1 letter, 1' }).fill('abcdef123');
 await page.getByRole('button', { name: 'Create account' }).click();
});
 