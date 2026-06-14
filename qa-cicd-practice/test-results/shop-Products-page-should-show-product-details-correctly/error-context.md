# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: shop.spec.ts >> Products page >> should show product details correctly
- Location: tests\webautomation\shop.spec.ts:46:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('.pprice')
Expected substring: "$59.99"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('.pprice')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - link "ShopEase" [ref=e3] [cursor=pointer]:
      - /url: /
      - text: Shop
      - emphasis [ref=e4]: Ease
    - navigation [ref=e5]:
      - link "Shop" [ref=e6] [cursor=pointer]:
        - /url: /products
      - link "Search" [ref=e7] [cursor=pointer]:
        - /url: /search
      - link "Sign in" [ref=e8] [cursor=pointer]:
        - /url: /login
      - link "Register" [ref=e9] [cursor=pointer]:
        - /url: /register
  - generic [ref=e10]:
    - link "← Back to shop" [ref=e12] [cursor=pointer]:
      - /url: /products
    - generic [ref=e13]:
      - generic [ref=e14]: 🎧
      - generic [ref=e15]:
        - generic [ref=e16]: Electronics
        - heading "Wireless Headphones" [level=1] [ref=e17]
        - paragraph [ref=e18]: Premium sound with active noise cancellation and 30-hour battery life.
        - generic [ref=e19]: $59.99
        - paragraph [ref=e20]: 0 units in stock
        - generic [ref=e21]:
          - link "Sign in" [ref=e22] [cursor=pointer]:
            - /url: /login
          - text: to place an order.
    - separator [ref=e23]
    - generic [ref=e24]: Customer Reviews
    - generic [ref=e25]:
      - generic [ref=e26]:
        - generic [ref=e27]:
          - generic [ref=e28]: Alice
          - generic [ref=e29]: ★★★★★
          - generic [ref=e30]: 2026-03-12
        - generic [ref=e31]: Absolutely love these headphones — crystal clear sound!
      - generic [ref=e32]:
        - generic [ref=e33]:
          - generic [ref=e34]: Bob
          - generic [ref=e35]: ★★★★☆
          - generic [ref=e36]: 2026-03-13
        - generic [ref=e37]: Great value for the price. Would buy again.
      - generic [ref=e38]:
        - generic [ref=e39]:
          - generic [ref=e40]: alice
          - generic [ref=e41]: ★★★★★
          - generic [ref=e42]: 2026-03-23
        - img [ref=e44]
      - generic [ref=e45]:
        - generic [ref=e46]:
          - generic [ref=e47]: alice
          - generic [ref=e48]: ★★★★★
          - generic [ref=e49]: 2026-03-23
        - img [ref=e51]
      - generic [ref=e52]:
        - generic [ref=e53]:
          - generic [ref=e54]: alice
          - generic [ref=e55]: ★★★★☆
          - generic [ref=e56]: 2026-03-29
        - generic [ref=e57]: Great product, fast delivery!
      - generic [ref=e58]:
        - generic [ref=e59]:
          - generic [ref=e60]: alice
          - generic [ref=e61]: ★★★★☆
          - generic [ref=e62]: 2026-03-29
        - generic [ref=e63]: Great product, fast delivery!
      - generic [ref=e64]:
        - generic [ref=e65]:
          - generic [ref=e66]: alice
          - generic [ref=e67]: ★★★★☆
          - generic [ref=e68]: 2026-03-29
        - generic [ref=e69]: Great product, fast delivery!
      - generic [ref=e70]:
        - generic [ref=e71]:
          - generic [ref=e72]: alice
          - generic [ref=e73]: ★★★★☆
          - generic [ref=e74]: 2026-03-29
        - generic [ref=e75]: Great product, fast delivery!
      - generic [ref=e76]:
        - generic [ref=e77]:
          - generic [ref=e78]: alice
          - generic [ref=e79]: ★★★★☆
          - generic [ref=e80]: 2026-03-29
        - generic [ref=e81]: Great product, fast delivery!
      - generic [ref=e82]:
        - generic [ref=e83]:
          - generic [ref=e84]: alice
          - generic [ref=e85]: ★★★★☆
          - generic [ref=e86]: 2026-03-29
        - generic [ref=e87]: Great product, fast delivery!
      - generic [ref=e88]:
        - generic [ref=e89]:
          - generic [ref=e90]: alice
          - generic [ref=e91]: ★★★★☆
          - generic [ref=e92]: 2026-03-29
        - generic [ref=e93]: Great product, fast delivery!
      - generic [ref=e94]:
        - generic [ref=e95]:
          - generic [ref=e96]: alice
          - generic [ref=e97]: ★★★★☆
          - generic [ref=e98]: 2026-03-29
        - generic [ref=e99]: Great product, fast delivery!
      - generic [ref=e100]:
        - generic [ref=e101]:
          - generic [ref=e102]: alice
          - generic [ref=e103]: ★★★★☆
          - generic [ref=e104]: 2026-03-29
        - generic [ref=e105]: Great product, fast delivery!
      - generic [ref=e106]:
        - generic [ref=e107]:
          - generic [ref=e108]: alice
          - generic [ref=e109]: ★★★★☆
          - generic [ref=e110]: 2026-03-29
        - generic [ref=e111]: Great product, fast delivery!
      - generic [ref=e112]:
        - generic [ref=e113]:
          - generic [ref=e114]: alice
          - generic [ref=e115]: ★★★★☆
          - generic [ref=e116]: 2026-03-29
        - generic [ref=e117]: Great product, fast delivery!
      - generic [ref=e118]:
        - generic [ref=e119]:
          - generic [ref=e120]: alice
          - generic [ref=e121]: ★★★★☆
          - generic [ref=e122]: 2026-03-29
        - generic [ref=e123]: Great product, fast delivery!
      - generic [ref=e124]:
        - generic [ref=e125]:
          - generic [ref=e126]: alice
          - generic [ref=e127]: ★★★★☆
          - generic [ref=e128]: 2026-04-07
        - generic [ref=e129]: Great product, fast delivery!
      - generic [ref=e130]:
        - generic [ref=e131]:
          - generic [ref=e132]: alice
          - generic [ref=e133]: ★★★★☆
          - generic [ref=e134]: 2026-04-07
        - generic [ref=e135]: Great product, fast delivery!
    - generic [ref=e136]:
      - link "Sign in" [ref=e137] [cursor=pointer]:
        - /url: /login
      - text: to leave a review.
  - contentinfo [ref=e138]: © 2026 ShopEase · All rights reserved · Node v24.13.1
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
  29  |     await page.goto('/products');
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
> 49  |     await expect(page.locator('.pprice')).toContainText('$59.99');
      |                                           ^ Error: expect(locator).toContainText(expected) failed
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
  130 |     await page.goto('/register');
  131 |     await page.fill('input[name="username"]', 'newuser');
  132 |     await page.fill('input[name="email"]', 'notanemail');
  133 |     await page.fill('input[name="password"]', 'pass123');
  134 |     await page.click('button[type="submit"]');
  135 |     await expect(page.locator('.alert-err')).toBeVisible();
  136 |   });
  137 | 
  138 | });
  139 | 
  140 | // ── Orders (authenticated) ────────────────────────────────────────────────────
  141 | test.describe('Orders', () => {
  142 | 
  143 |   test.beforeEach(async ({ page }) => {
  144 |     // Login before each order test
  145 |     await page.goto('/login');
  146 |     await page.fill('input[name="username"]', 'alice');
  147 |     await page.fill('input[name="password"]', 'alice123');
  148 |     await page.click('button[type="submit"]');
  149 |     await expect(page).toHaveURL('http://localhost:3001/');
```