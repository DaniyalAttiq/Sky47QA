import { Page, expect } from '@playwright/test';

export class ForgotPasswordPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Locators
  backToLoginLink = () => this.page.getByRole('link', { name: 'Back to login' });
  emailInput = () => this.page.getByPlaceholder('Email Address');
  sendResetLinkButton = () => this.page.getByRole('button', { name: 'Send Reset Link' });
  toastMessage = () => this.page.locator('[data-sonner-toast], [role="alert"], .toast, .notification');
  
  // Inline error locator for empty email
  emailError = () => this.page.locator('text=Email address is required');

  // Actions
  async goto() {
    await this.page.goto('https://r08sgs0k08gw0sgccscoo4o8.49.13.228.64.sslip.io/forgot-password');
  }

  async submitEmail(email: string) {
    await this.emailInput().fill(email);
    await this.sendResetLinkButton().click();
  }

  async goBackToLogin() {
    await this.backToLoginLink().click();
  }

  // Assertions
  async expectSuccessToast() {
    await expect(this.toastMessage().first())
      .toContainText('Password reset link sent! Please check your email.');
  }

  async expectEmailRequiredError() {
    await expect(this.emailError()).toBeVisible();
  }
}
