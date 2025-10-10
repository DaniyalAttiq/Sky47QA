// tests/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login';

test.describe('Login Page', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  // ----------------- Existing Tests -----------------
  test('S4-TC-9: should login successfully with valid credentials', async () => {
    await loginPage.login('skyqa1@yopmail.com', 'Admin@123', true);
    await loginPage.expectSuccessToast();
  });

  test('S4-TC-10: should show error for invalid credentials', async () => {
    await loginPage.login('invalid@example.com', 'wrongpassword');
    await loginPage.expectInvalidCredentialsToast();
  });

  test('S4-TC-14: should show unverified account toast', async () => {
    await loginPage.login('daniyalawan@yopmail.com', 'Admin@123');
    await loginPage.expectAccountNotVerifiedToast();
  });

  test('S4-TC-83: should navigate to forgot password page', async ({ page }) => {
    await loginPage.forgotPasswordLink().click();
    await page.waitForURL('**/forgot-password');
  });

  test('S4-TC-84: should navigate to Sign Up page from login', async ({ page }) => {
    await page.getByRole('link', { name: 'Sign Up' }).click();
    await page.waitForURL('**/signup');
    await page.getByRole('heading', { name: 'Create Account' }).isVisible();
  });

  test('S4-TC-15: should show required field errors when login with empty credentials', async ({ page }) => {
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByText('Email address is required.').isVisible();
    await page.getByText('Password is required.').isVisible();
  });

  test('S4-TC-80: should toggle Remember Me checkbox', async ({ page }) => {
    const rememberMe = page.getByRole('checkbox', { name: 'Remember me' });

    let checked = await rememberMe.isChecked();
    console.log('Initially checked:', checked);

    await rememberMe.click();
    checked = await rememberMe.isChecked();
    console.log('After first click:', checked);

    await rememberMe.click();
    checked = await rememberMe.isChecked();
    console.log('After second click:', checked);
  });

  // ----------------- Social Login Tests Without Popup -----------------
  test('S4-TC-86: Google button href points to Google OAuth', async ({ page }) => {
    const googleLink = page.getByRole('link', { name: /continue with google/i });

    // Verify href attribute
    await expect(googleLink).toHaveAttribute('href', /auth\/google/);

    // Optional: navigate in the same tab
    const href = await googleLink.getAttribute('href');
    await page.goto(href!);  // stays in the same tab
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/auth\/google/);
  });

  test('S4-TC-87: GitHub button href points to GitHub OAuth', async ({ page }) => {
    const githubLink = page.getByRole('button', { name: /continue with github/i }).locator('a');

    // Verify href attribute
    await expect(githubLink).toHaveAttribute('href', /auth\/github/);

    // Optional: navigate in the same tab
    const href = await githubLink.getAttribute('href');
    await page.goto(href!);  // stays in the same tab
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/auth\/github/);
  });

});

