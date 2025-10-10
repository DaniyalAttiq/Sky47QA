import { Page, expect } from '@playwright/test';

export class SignupPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Locators
  nameInput = () => this.page.getByPlaceholder('Full Name');
  emailInput = () => this.page.getByPlaceholder('Email Address');
  passwordInput = () => this.page.getByPlaceholder('Password').first(); // disambiguate
  confirmPasswordInput = () => this.page.getByPlaceholder('Confirm Password');
  createAccountButton = () => this.page.getByRole('button', { name: 'Create Account' });
  toastMessage = () => this.page.locator('[data-sonner-toast], [role="alert"], .toast, .notification');

  // Actions
  async goto() {
    await this.page.goto('https://r08sgs0k08gw0sgccscoo4o8.49.13.228.64.sslip.io/signup');
  }

  async signup(fullName: string, email: string, password: string) {
    await this.nameInput().fill(fullName);
    await this.emailInput().fill(email);
    await this.passwordInput().fill(password);
    await this.confirmPasswordInput().fill(password);
    await this.createAccountButton().click();
  }

  // Assertions
  async expectSuccessToast() {
    await expect(this.toastMessage().first()).toContainText('Account created successfully!');
  }

  async expectUnverifiedToast() {
    await expect(this.toastMessage().first()).toContainText('Account exists but not verified. Please check your email.');
  }

  async expectAlreadyExistsToast() {
    await expect(this.toastMessage().first()).toContainText('Email already exists.');
  }
}
