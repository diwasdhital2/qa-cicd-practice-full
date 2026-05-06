'use strict';
const { test, expect } = require('@playwright/test');

// ── Homepage ─────────────────────────────────────────────────────────────────
test.describe('Homepage', () => {

  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/ShopEase/);
  });

  test('should show featured products on homepage', async ({ page }) => {
    await page.goto('/');
    const products = page.locator('.pcard');
    await expect(products).toHaveCount(3);
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[href="/products"]').first()).toBeVisible();
    await expect(page.locator('a[href="/search"]')).toBeVisible();
  });

});

// ── Products ──────────────────────────────────────────────────────────────────
test.describe('Products page', () => {

  test('should display all products', async ({ page }) => {
    await page.goto('/products');
    const cards = page.locator('.pcard');
    await expect(cards).toHaveCount(6);
  });

  test('should filter products by category', async ({ page }) => {
    await page.goto('/products?category=Electronics');
    const cards = page.locator('.pcard');
    await expect(cards).toHaveCount(1);
  });

  test('should navigate to product detail page', async ({ page }) => {
    await page.goto('/products');
    await page.locator('.pcard').first().locator('a.btn').click();
    await expect(page.url()).toContain('/products/');
  });

  test('should show product details correctly', async ({ page }) => {
    await page.goto('/products/1');
    await expect(page.locator('h1')).toContainText('Wireless Headphones');
    await expect(page.locator('.pprice')).toContainText('$59.99');
  });

});

// ── Search ────────────────────────────────────────────────────────────────────
test.describe('Search', () => {

  test('should load the search page', async ({ page }) => {
    await page.goto('/search');
    await expect(page.locator('input[name="q"]')).toBeVisible();
  });

  test('should return results for a valid keyword', async ({ page }) => {
    await page.goto('/search?q=headphones');
    await expect(page.locator('.pcard')).toHaveCount(1);
  });

  test('should show no results message for unknown keyword', async ({ page }) => {
    await page.goto('/search?q=xyznotfound');
    await expect(page.locator('.alert-info')).toBeVisible();
  });

});

// ── Login ─────────────────────────────────────────────────────────────────────
test.describe('Login', () => {
// login test cases
  test('should load the login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });
//login with valid credentials
  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'alice');
    await page.fill('input[name="password"]', 'alice123');
    await page.click('button[type="submit"]');
    await expect(page.url()).toBe('http://localhost:3001/');
    await expect(page.locator('.chip')).toContainText('alice');
  });
//login with invalid credentials
  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'alice');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('.alert-err')).toContainText('Invalid username or password.');
  });
//login case insensitive
  test('should login case-insensitively', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'ALICE');
    await page.fill('input[name="password"]', 'alice123');
    await page.click('button[type="submit"]');
    await expect(page.url()).toBe('http://localhost:3001/');
  });
  //space omitting test
  test('test if the unwanted spaces in username field omitted', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input [name="username"]','  alice ')
    await page.fill('input [name="password"]','alice123')
    await page.click('button [type="submit"]');
    await expect(page.getByText('👤 alice')).toBeVisible();
    await expect(page.url()).toBe('http://localhost:3001/');
});
  //sign in button enabled
  test('sign in button enabled',async({page}) =>{
    await page.goto('/login');
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeDisabled(); 
    await page.fill('input[name="username"]','sdf');
    await page.fill('input [name="password"]','123www');
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeEnabled();
  });

});

// ── Register ──────────────────────────────────────────────────────────────────
test.describe('Register', () => {

  test('should load the register page', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });
  //weak password
  test('should show error for weak password', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="username"]', 'newuser');
    await page.fill('input[name="email"]', 'new@test.com');
    await page.fill('input[name="password"]', 'abc');
    await page.click('button[type="submit"]');
    await expect(page.locator('.alert-err')).toBeVisible();
  });
   //invalid email
  test('should show error for invalid email format', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="username"]', 'newuser');
    await page.fill('input[name="email"]', 'notanemail');
    await page.fill('input[name="password"]', 'pass123');
    await page.click('button[type="submit"]');
    await expect(page.locator('.alert-err')).toBeVisible();
  });
   //invalid username format
  test('should show error for invalid username format', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="username"]', '@@@');
    await page.fill('input[name="email"]', 'test@email.com');
    await page.fill('input[name="password"]', 'pass123');
    await page.click('button[type="submit"]');
    await expect(page.locator('.alert-err')).toBeVisible();
  });
  //email duplication 
  test('should show error for registration with already existing email', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="username"]', 'bhumee');
    await page.fill('input[name="email"]', 'ary@b.com');
    await page.fill('input[name="password"]', 'pass123');
    await page.click('button[type="submit"]');
    await expect(page.locator('.alert-err')).toBeVisible();
  });

  //username exceeding 16 characters
  test('username field should not allow more than 16 characters', async ({ page }) => {
  await page.goto('/register');
  
  const usernameField = page.locator('input[name="username"]');

  // Try typing more than 16 characters
  const longUsername = 'abcdefghijklmnopqr'; // 18 chars
  await usernameField.type(longUsername);

  // Get the actual value typed
  const value = await usernameField.inputValue();

  // Assert only 16 characters are present
  expect(value.length).toBe(16);

  // Optional: confirm exact value
  expect(value).toBe('abcdefghijklmnop');
});

test('sign in link in register page leads to sign in page', async ({ page }) => {
  await page.goto('/register');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('paragraph').filter({ hasText: 'Already registered? Sign in' }).getByRole('link').click();
   await expect(page.url()).toBe('http://localhost:3001/login');
  
});
 

});

// ── Orders (authenticated) ────────────────────────────────────────────────────
test.describe('Orders', () => {

  test.beforeEach(async ({ page }) => {
    // Login before each order test
    await page.goto('/login');
    await page.fill('input[name="username"]', 'alice');
    await page.fill('input[name="password"]', 'alice123');
    await page.click('button[type="submit"]');
    await expect(page.url()).toBe('http://localhost:3001/');
  });

  //order history displayed for logged in user
  test('should show order history for logged in user', async ({ page }) => {
    await page.goto('/account/orders');
    await expect(page.locator('table')).toBeVisible();
  });

  //logged in user can place orders
  test('should place an order from product page', async ({ page }) => {
    await page.goto('/products/3');
    await page.fill('input[name="quantity"]', '1');
    await page.click('button[type="submit"]');
    await expect(page.url()).toContain('/account/orders');
  });

  //update order(logged in user)
  test('edit order', async ({ page }) => {
    await page.goto('/account/orders');
    await page.getByRole('link', { name: 'Details' }).nth(1).click();
    await page.getByRole('link', { name: '✏️ Edit Order' }).click();
    await page.getByRole('combobox').selectOption('cancelled');
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.getByText('Order updated!')).toBeVisible();
});

});

// ── Admin ─────────────────────────────────────────────────────────────────────
test.describe('Admin panel', () => {

  test('should deny access to non-admin users', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'alice');
    await page.fill('input[name="password"]', 'alice123');
    await page.click('button[type="submit"]');
    await page.goto('/admin');
    await expect(page.locator('.alert-err')).toBeVisible();
  });

  test('should allow admin to access admin panel', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'shopAdmin@99');
    await page.click('button[type="submit"]');
    await expect(page.url()).toBe('http://localhost:3001/');
    await page.goto('/admin');
    await expect(page.locator('h1')).toContainText('Admin Panel');
  });
   
  //admin able to delete users
  test('admin should be able to delete users', async ({ page }) => {
      await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'shopAdmin@99');
    await page.click('button[type="submit"]');
    await expect(page.url()).toBe('http://localhost:3001/');
  await page.goto('/admin');
  
 page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });                          
  await page.getByRole('row', { name: '6 new@gmail.com Test@12345' }).getByRole('button',{name : 'Delete'}).click();
});




});