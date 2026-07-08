import { Page, Locator, expect } from '@playwright/test';

/**
 * RegisterPage — Page Object Model
 * App : qa-cicd-practice (http://localhost:3001)
 * Route: /register
 *
 * ⚠️  Update locators below if your register form uses different selectors.
 */
export class RegisterPage {
  readonly page: Page;

  // ── Locators ──────────────────────────────────────────────────────────────
  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput  = page.locator('input[name="username"]');
    this.emailInput     = page.locator('input[name="email"]');
    this.passwordInput  = page.locator('input[name="password"]');
    this.submitButton   = page.locator('button[type="submit"]');
    this.errorAlert     = page.locator('.alert-err');
    this.successMessage = page.locator('.alert-success');
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  async goto() {
    await this.page.goto('/register');
  }

  async fillUsername(username: string) {
    await this.usernameInput.fill(username);
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async submit() {
    await this.submitButton.click();
  }

  /** Full register flow in one call */
  async register(username: string, email: string, password: string) {
    await this.goto();
    await this.fillUsername(username);
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  async expectPageLoaded() {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async expectRegisterSuccess() {
    await expect(this.page).toHaveURL('http://localhost:3001/');
  }

  async expectRegisterError(message?: string) {
    await expect(this.errorAlert).toBeVisible();
    if (message) {
      await expect(this.errorAlert).toContainText(message);
    }
  }

  async expectSuccessMessage(message?: string) {
    await expect(this.successMessage).toBeVisible();
    if (message) {
      await expect(this.successMessage).toContainText(message);
    }
  }
}