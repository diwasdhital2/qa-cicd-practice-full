# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: webautomation\shop.spec.ts >> Products page >> should display all products
- Location: tests\webautomation\shop.spec.ts:28:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3001/products
Call log:
  - navigating to "http://localhost:3001/products", waiting until "load"

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
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | // ── Homepage ─────────────────────────────────────────────────────────────────
  4   | test.describe('Homepage', () => {
  5   | 
  6   |   test('should load the homepage', async ({ page }) => {
  7   |     await page.goto('/');
  8   |     await expect(page).toHaveTitle(/ShopEase/);
  9   |   });
  10  | 
  11  |   test('should show featured products on homepage', async ({ page }) => {
  12  |     await page.goto('/');
  13  |     const products = page.locator('.pcard');
  14  |     await expect(products).toHaveCount(3);
  15  |   });
  16  | 
  17  |   test('should have working navigation links', async ({ page }) => {
  18  |     await page.goto('/');
  19  |     await expect(page.locator('a[href="/products"]').first()).toBeVisible();
  20  |     await expect(page.locator('a[href="/search"]')).toBeVisible();
  21  |   });
  22  | 
  23  | });
  24  | 
  25  | // ── Products ──────────────────────────────────────────────────────────────────
  26  | test.describe('Products page', () => {
  27  | 
  28  |   test('should display all products', async ({ page }) => {
> 29  |     await page.goto('/products');
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3001/products
  30  |     const cards = page.locator('.pcard');
  31  |     await expect(cards).toHaveCount(6);
  32  |   });
  33  | 
  34  |   test('should filter products by category', async ({ page }) => {
  35  |     await page.goto('/products?category=Electronics');
  36  |     const cards = page.locator('.pcard');
  37  |     await expect(cards).toHaveCount(1);
  38  |   });
  39  | 
  40  |   test('should navigate to product detail page', async ({ page }) => {
  41  |     await page.goto('/products');
  42  |     await page.locator('.pcard').first().locator('a.btn').click();
  43  |     await expect(page).toHaveURL(/\/products\//);
  44  |   });
  45  | 
  46  |   test('should show product details correctly', async ({ page }) => {
  47  |     await page.goto('/products/1');
  48  |     await expect(page.locator('h1')).toContainText('Wireless Headphones');
  49  |     await expect(page.getByText('$59.99')).toBeVisible();
  50  |   });
  51  | 
  52  | });
  53  | 
  54  | // ── Search ────────────────────────────────────────────────────────────────────
  55  | test.describe('Search', () => {
  56  | 
  57  |   test('should load the search page', async ({ page }) => {
  58  |     await page.goto('/search');
  59  |     await expect(page.locator('input[name="q"]')).toBeVisible();
  60  |   });
  61  | 
  62  |   test('should return results for a valid keyword', async ({ page }) => {
  63  |     await page.goto('/search?q=headphones');
  64  |     await expect(page.locator('.pcard')).toHaveCount(1);
  65  |   });
  66  | 
  67  |   test('should show no results message for unknown keyword', async ({ page }) => {
  68  |     await page.goto('/search?q=xyznotfound');
  69  |     await expect(page.locator('.alert-info')).toBeVisible();
  70  |   });
  71  | 
  72  | });
  73  | 
  74  | // ── Login ─────────────────────────────────────────────────────────────────────
  75  | test.describe('Login', () => {
  76  | 
  77  |   test('should load the login page', async ({ page }) => {
  78  |     await page.goto('/login');
  79  |     await expect(page.locator('input[name="username"]')).toBeVisible();
  80  |     await expect(page.locator('input[name="password"]')).toBeVisible();
  81  |   });
  82  | 
  83  |   test('should login successfully with valid credentials', async ({ page }) => {
  84  |     await page.goto('/login');
  85  |     await page.fill('input[name="username"]', 'alice');
  86  |     await page.fill('input[name="password"]', 'alice123');
  87  |     await page.click('button[type="submit"]');
  88  |     await expect(page).toHaveURL('http://localhost:3001/');
  89  |     await expect(page.locator('.chip')).toContainText('alice');
  90  |   });
  91  | 
  92  |   test('should show error for invalid credentials', async ({ page }) => {
  93  |     await page.goto('/login');
  94  |     await page.fill('input[name="username"]', 'alice');
  95  |     await page.fill('input[name="password"]', 'wrongpassword');
  96  |     await page.click('button[type="submit"]');
  97  |     await expect(page.locator('.alert-err')).toContainText('Invalid username or password.');
  98  |   });
  99  | 
  100 |   test('should login case-insensitively', async ({ page }) => {
  101 |     await page.goto('/login');
  102 |     await page.fill('input[name="username"]', 'ALICE');
  103 |     await page.fill('input[name="password"]', 'alice123');
  104 |     await page.click('button[type="submit"]');
  105 |     await expect(page).toHaveURL('http://localhost:3001/');
  106 |   });
  107 | 
  108 | });
  109 | 
  110 | // ── Register ──────────────────────────────────────────────────────────────────
  111 | test.describe('Register', () => {
  112 | 
  113 |   test('should load the register page', async ({ page }) => {
  114 |     await page.goto('/register');
  115 |     await expect(page.locator('input[name="username"]')).toBeVisible();
  116 |     await expect(page.locator('input[name="email"]')).toBeVisible();
  117 |     await expect(page.locator('input[name="password"]')).toBeVisible();
  118 |   });
  119 | 
  120 |   test('should show error for weak password', async ({ page }) => {
  121 |     await page.goto('/register');
  122 |     await page.fill('input[name="username"]', 'newuser');
  123 |     await page.fill('input[name="email"]', 'new@test.com');
  124 |     await page.fill('input[name="password"]', 'abc');
  125 |     await page.click('button[type="submit"]');
  126 |     await expect(page.locator('.alert-err')).toBeVisible();
  127 |   });
  128 | 
  129 |   test('should show error for invalid email format', async ({ page }) => {
```