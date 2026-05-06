# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: shop.spec.js >> Orders >> test
- Location: qa-cicd-practice-full\qa-cicd-practice\tests\webautomation\shop.spec.js:232:3

# Error details

```
Error: locator.click: Target page, context or browser has been closed
Call log:
  - waiting for getByRole('link', { name: 'Details' }).nth(1)

```

# Test source

```ts
  134 |     await expect(page.locator('input[name="email"]')).toBeVisible();
  135 |     await expect(page.locator('input[name="password"]')).toBeVisible();
  136 |   });
  137 |   //weak password
  138 |   test('should show error for weak password', async ({ page }) => {
  139 |     await page.goto('/register');
  140 |     await page.fill('input[name="username"]', 'newuser');
  141 |     await page.fill('input[name="email"]', 'new@test.com');
  142 |     await page.fill('input[name="password"]', 'abc');
  143 |     await page.click('button[type="submit"]');
  144 |     await expect(page.locator('.alert-err')).toBeVisible();
  145 |   });
  146 |    //invalid email
  147 |   test('should show error for invalid email format', async ({ page }) => {
  148 |     await page.goto('/register');
  149 |     await page.fill('input[name="username"]', 'newuser');
  150 |     await page.fill('input[name="email"]', 'notanemail');
  151 |     await page.fill('input[name="password"]', 'pass123');
  152 |     await page.click('button[type="submit"]');
  153 |     await expect(page.locator('.alert-err')).toBeVisible();
  154 |   });
  155 |    //invalid username format
  156 |   test('should show error for invalid username format', async ({ page }) => {
  157 |     await page.goto('/register');
  158 |     await page.fill('input[name="username"]', '@@@');
  159 |     await page.fill('input[name="email"]', 'test@email.com');
  160 |     await page.fill('input[name="password"]', 'pass123');
  161 |     await page.click('button[type="submit"]');
  162 |     await expect(page.locator('.alert-err')).toBeVisible();
  163 |   });
  164 |   //email duplication 
  165 |   test('should show error for registration with already existing email', async ({ page }) => {
  166 |     await page.goto('/register');
  167 |     await page.fill('input[name="username"]', 'bhumee');
  168 |     await page.fill('input[name="email"]', 'ary@b.com');
  169 |     await page.fill('input[name="password"]', 'pass123');
  170 |     await page.click('button[type="submit"]');
  171 |     await expect(page.locator('.alert-err')).toBeVisible();
  172 |   });
  173 | 
  174 |   //username exceeding 16 characters
  175 |   test('username field should not allow more than 16 characters', async ({ page }) => {
  176 |   await page.goto('/register');
  177 |   
  178 |   const usernameField = page.locator('input[name="username"]');
  179 | 
  180 |   // Try typing more than 16 characters
  181 |   const longUsername = 'abcdefghijklmnopqr'; // 18 chars
  182 |   await usernameField.type(longUsername);
  183 | 
  184 |   // Get the actual value typed
  185 |   const value = await usernameField.inputValue();
  186 | 
  187 |   // Assert only 16 characters are present
  188 |   expect(value.length).toBe(16);
  189 | 
  190 |   // Optional: confirm exact value
  191 |   expect(value).toBe('abcdefghijklmnop');
  192 | });
  193 | 
  194 | test('sign in link in register page leads to sign in page', async ({ page }) => {
  195 |   await page.goto('/register');
  196 |   await page.getByRole('link', { name: 'Register' }).click();
  197 |   await page.getByRole('paragraph').filter({ hasText: 'Already registered? Sign in' }).getByRole('link').click();
  198 |    await expect(page.url()).toBe('http://localhost:3001/login');
  199 |   
  200 | });
  201 |  
  202 | 
  203 | });
  204 | 
  205 | // ── Orders (authenticated) ────────────────────────────────────────────────────
  206 | test.describe('Orders', () => {
  207 | 
  208 |   test.beforeEach(async ({ page }) => {
  209 |     // Login before each order test
  210 |     await page.goto('/login');
  211 |     await page.fill('input[name="username"]', 'alice');
  212 |     await page.fill('input[name="password"]', 'alice123');
  213 |     await page.click('button[type="submit"]');
  214 |     await expect(page.url()).toBe('http://localhost:3001/');
  215 |   });
  216 | 
  217 |   //order history displayed for logged in user
  218 |   test('should show order history for logged in user', async ({ page }) => {
  219 |     await page.goto('/account/orders');
  220 |     await expect(page.locator('table')).toBeVisible();
  221 |   });
  222 | 
  223 |   //logged in user can place orders
  224 |   test('should place an order from product page', async ({ page }) => {
  225 |     await page.goto('/products/3');
  226 |     await page.fill('input[name="quantity"]', '1');
  227 |     await page.click('button[type="submit"]');
  228 |     await expect(page.url()).toContain('/account/orders');
  229 |   });
  230 | 
  231 |   //update order(logged in user)
  232 |   test('test', async ({ page }) => {
  233 |    await page.goto('/orders');
> 234 |   await page.getByRole('link', { name: 'Details' }).nth(1).click();
      |                                                            ^ Error: locator.click: Target page, context or browser has been closed
  235 |   await page.getByRole('link', { name: '✏️ Edit Order' }).click();
  236 |   await page.getByRole('combobox').selectOption('cancelled');
  237 |   await page.getByRole('button', { name: 'Save Changes' }).click();
  238 |   await expect(page.getByText('Order updated!')).toBeVisible();
  239 | });
  240 | 
  241 | });
  242 | 
  243 | // ── Admin ─────────────────────────────────────────────────────────────────────
  244 | test.describe('Admin panel', () => {
  245 | 
  246 |   test('should deny access to non-admin users', async ({ page }) => {
  247 |     await page.goto('/login');
  248 |     await page.fill('input[name="username"]', 'alice');
  249 |     await page.fill('input[name="password"]', 'alice123');
  250 |     await page.click('button[type="submit"]');
  251 |     await page.goto('/admin');
  252 |     await expect(page.locator('.alert-err')).toBeVisible();
  253 |   });
  254 | 
  255 |   test('should allow admin to access admin panel', async ({ page }) => {
  256 |     await page.goto('/login');
  257 |     await page.fill('input[name="username"]', 'admin');
  258 |     await page.fill('input[name="password"]', 'shopAdmin@99');
  259 |     await page.click('button[type="submit"]');
  260 |     await page.goto('/admin');
  261 |     await expect(page.locator('h1')).toContainText('Admin Panel');
  262 |   });
  263 | 
  264 | });
```