# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: webautomation\login.spec.ts >> Login >> should show error for invalid credentials
- Location: tests\webautomation\login.spec.ts:20:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3001/login
Call log:
  - navigating to "http://localhost:3001/login", waiting until "load"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e6]:
    - heading "This site can’t be reached" [level=1] [ref=e7]
    - paragraph [ref=e8]:
      - strong [ref=e9]: localhost
      - text: refused to connect.
    - generic [ref=e10]:
      - paragraph [ref=e11]: "Try:"
      - list [ref=e12]:
        - listitem [ref=e13]: Checking the connection
        - listitem [ref=e14]:
          - link "Checking the proxy and the firewall" [ref=e15] [cursor=pointer]:
            - /url: "#buttons"
    - generic [ref=e16]: ERR_CONNECTION_REFUSED
  - generic [ref=e17]:
    - button "Reload" [ref=e19] [cursor=pointer]
    - button "Details" [ref=e20] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Login', () => {
  4  | 
  5  |   test('should load the login page', async ({ page }) => {
  6  |     await page.goto('/login');
  7  |     await expect(page.locator('input[name="username"]')).toBeVisible();
  8  |     await expect(page.locator('input[name="password"]')).toBeVisible();
  9  |   });
  10 | 
  11 |   test('should login successfully with valid credentials', async ({ page }) => {
  12 |     await page.goto('/login');
  13 |     await page.fill('input[name="username"]', 'alice');
  14 |     await page.fill('input[name="password"]', 'alice123');
  15 |     await page.click('button[type="submit"]');
  16 |     await expect(page).toHaveURL('http://localhost:3001/');
  17 |     await expect(page.getByText('👤 alice')).toBeVisible();
  18 |   });
  19 | 
  20 |   test('should show error for invalid credentials', async ({ page }) => {
> 21 |     await page.goto('/login');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3001/login
  22 |     await page.fill('input[name="username"]', 'alice');
  23 |     await page.fill('input[name="password"]', 'wrongpassword');
  24 |     await page.click('button[type="submit"]');
  25 |     await expect(page.locator('.alert-err')).toContainText('Invalid username or password.');
  26 |   });
  27 | 
  28 |   test('should login case-insensitively', async ({ page }) => {
  29 |     await page.goto('/login');
  30 |     await page.fill('input[name="username"]', 'ALICE');
  31 |     await page.fill('input[name="password"]', 'alice123');
  32 |     await page.click('button[type="submit"]');
  33 |     await expect(page).toHaveURL('http://localhost:3001/');
  34 |   });
  35 | 
  36 | });
```