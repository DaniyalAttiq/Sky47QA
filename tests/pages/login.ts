// tests/pages/login.ts
import { Page, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ===== Locators =====
  emailInput = () => this.page.getByPlaceholder('Email Address');
  passwordInput = () => this.page.getByPlaceholder('Password').first();
  loginButton = () => this.page.getByRole('button', { name: 'Login' });
  rememberMeCheckbox = () => this.page.getByRole('checkbox', { name: 'Remember me' });
  forgotPasswordLink = () => this.page.getByRole('link', { name: 'Forgot Password' });
  toastMessage = () =>
    this.page.locator('[data-sonner-toast], [role="alert"], .toast, .notification');

  // New Google button locator
  googleButton = () => this.page.getByRole('link', { name: 'Continue with Google' });

  // ===== Actions =====
  async goto() {
    await this.page.goto('https://r08sgs0k08gw0sgccscoo4o8.49.13.228.64.sslip.io/login');
  }

  async login(email: string, password: string, rememberMe = false) {
    await this.emailInput().fill(email);
    await this.passwordInput().fill(password);

    if (rememberMe) {
      await this.rememberMeCheckbox().check();
    }

    await this.loginButton().click();
  }




  // ===== Assertions =====
  async expectSuccessToast() {
    await expect(this.toastMessage().first()).toContainText('Logged in successfully!');
  }

  async expectInvalidCredentialsToast() {
    await expect(this.toastMessage().first()).toContainText(
      'Invalid email or password.'
    );
  }

  async expectAccountNotVerifiedToast() {
    await expect(this.toastMessage().first()).toContainText(
      'Please verify your email.'
    );
  }
}
