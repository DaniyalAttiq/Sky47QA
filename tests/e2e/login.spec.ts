// tests/login.spec.ts
import { test, expect, Page, TestInfo } from '@playwright/test';
import { LoginPage } from '../pages/login';
import { captureToastScreenshot } from '../utils/toastWatcher'; // 👈 Make sure this path matches your project structure

test.describe('Login Page', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  // ----------------- Existing Tests -----------------

  test('S4-TC-9: should login successfully with valid credentials', async ({ page }, testInfo) => {
    await loginPage.login('Rahim@yopmail.com', 'StrongPass123!', true);
    await loginPage.expectSuccessToast();
    await captureToastScreenshot(page, testInfo); // 👈 Capture toast screenshot
  });

  test('S4-TC-10: should show error for invalid credentials', async ({ page }, testInfo) => {
    await loginPage.login('invalid@example.com', 'wrongpassword');
    await loginPage.expectInvalidCredentialsToast();
    await captureToastScreenshot(page, testInfo);
  });

  test('S4-TC-83: should navigate to forgot password page', async ({ page }, testInfo) => {
    await loginPage.forgotPasswordLink().click();
    await page.waitForURL('**/forgot-password');
    await captureToastScreenshot(page, testInfo); // optional (in case toast appears)
  });

  test('S4-TC-84: should navigate to Sign Up page from login', async ({ page }, testInfo) => {
    await page.getByRole('link', { name: 'Sign Up' }).click();
    await page.waitForURL('**/signup');
    await page.getByRole('heading', { name: 'Create Account' }).isVisible();
    await captureToastScreenshot(page, testInfo);
  });

  test('S4-TC-15: should show required field errors when login with empty credentials', async ({ page }, testInfo) => {
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByText('Email address is required.').isVisible();
    await page.getByText('Password is required.').isVisible();
    await captureToastScreenshot(page, testInfo);
  });

  test('S4-TC-80: should toggle Remember Me checkbox', async ({ page }, testInfo) => {
    const rememberMe = page.getByRole('checkbox', { name: 'Remember me' });

    let checked = await rememberMe.isChecked();
    console.log('Initially checked:', checked);

    await rememberMe.click();
    checked = await rememberMe.isChecked();
    console.log('After first click:', checked);

    await rememberMe.click();
    checked = await rememberMe.isChecked();
    console.log('After second click:', checked);

    await captureToastScreenshot(page, testInfo); // optional (in case of UI notification)
  });


});
