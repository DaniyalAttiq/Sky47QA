import { test } from '@playwright/test';
import { ForgotPasswordPage } from '../pages/forgotpassword';
import { SignupPage } from '../pages/signup';
import { LoginPage } from '../pages/login';
import { captureToastScreenshot } from '../utils/toastWatcher'; // 👈 Add this import

test.describe('Forgot Password Page', () => {
  let forgotPasswordPage: ForgotPasswordPage;
  let signupPage: SignupPage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    forgotPasswordPage = new ForgotPasswordPage(page);
    signupPage = new SignupPage(page);
    loginPage = new LoginPage(page);
  });

  test('S4-TC-FP-1: should send reset link for valid email', async ({ page }, testInfo) => {
    await forgotPasswordPage.goto();
    await forgotPasswordPage.submitEmail('TestQA@yopmail.com');
    await forgotPasswordPage.expectSuccessToast();

    // 🖼️ Capture toast screenshot
    await captureToastScreenshot(page, testInfo);
  });

  test('S4-TC-FP-2: should show inline error for empty email', async ({ page }, testInfo) => {
    await forgotPasswordPage.goto();
    await forgotPasswordPage.submitEmail('');
    await forgotPasswordPage.expectEmailRequiredError();

    // 🖼️ Capture screenshot if any toast/error shows up
    await captureToastScreenshot(page, testInfo);
  });

  test('S4-TC-FP-3: should navigate back to login page', async ({ page }, testInfo) => {
    await forgotPasswordPage.goto();
    await forgotPasswordPage.goBackToLogin();
    await page.waitForURL('**/login');
    await captureToastScreenshot(page, testInfo);
  });

  test('Complete forgot password flow', async ({ page }, testInfo) => {
    // Extend test timeout (2 minutes total)
    test.setTimeout(120000);

    const uniqueEmail = `user_${Date.now()}@yopmail.com`;
    const oldPassword = 'StrongP@ssw0rd!';
    const newPassword = 'NewP@ssw0rd!';

    // ---------- Step 1: Signup ----------
    await signupPage.goto();

    try {
      const outerFrameLocator = page.frameLocator('iframe[name="ifmail"]');
      const innerFrameLocator = outerFrameLocator.frameLocator('iframe[name="a-ijb51y6qb473"]');
      const captchaCheckbox = innerFrameLocator.getByRole('checkbox', { name: "I'm not a robot" });

      if (await captchaCheckbox.isVisible()) {
        await captchaCheckbox.click();
        console.log('✅ reCAPTCHA checkbox clicked successfully');
      } else {
        console.log('ℹ️ reCAPTCHA checkbox not visible');
      }
    } catch (error) {
      console.log('⚠️ reCAPTCHA iframe or checkbox not found — continuing test');
    }

    await signupPage.signup('Daniyal', uniqueEmail, oldPassword);
    await signupPage.expectSuccessToast();
    await captureToastScreenshot(page, testInfo); // 🖼️ capture toast screenshot
    await page.waitForURL('**/verification');

    // ---------- Step 2: Verify Account via Yopmail ----------
    for (let i = 0; i < 3; i++) {
      try {
        await page.goto(`https://yopmail.com/?login=${uniqueEmail}`, { timeout: 40000, waitUntil: 'domcontentloaded' });
        break;
      } catch (e) {
        console.log(`⚠️ Yopmail load attempt ${i + 1} failed, retrying...`);
        if (i === 2) throw e;
      }
    }

    await page.waitForTimeout(5000);
    await page.getByRole('button', { name: '' }).click();
    const inboxFrame = page.frameLocator('#ifinbox');
    await inboxFrame.getByText(/Verify your account/i).first().waitFor({ timeout: 30000 });
    await inboxFrame.getByText(/Verify your account/i).first().click();

    const mailFrame = page.frameLocator('#ifmail');
    const confirmButton = mailFrame.getByRole('link', { name: 'Confirm My Account' });
    await confirmButton.waitFor({ timeout: 10000 });

    const verifyUrl = await confirmButton.getAttribute('href');
    await page.goto(verifyUrl!);
    await page.getByText(/Your Account Successfully Created/i).waitFor();
    await page.getByRole('button', { name: /Continue/i }).click();
    await page.waitForURL(/.*\/login/);

    // ---------- Step 3: Forgot Password ----------
    await forgotPasswordPage.goto();
    await forgotPasswordPage.submitEmail(uniqueEmail);
    await forgotPasswordPage.expectSuccessToast();
    await captureToastScreenshot(page, testInfo); // 🖼️ capture toast screenshot

    // ---------- Step 4: Get Reset Link from Yopmail ----------
    for (let i = 0; i < 3; i++) {
      try {
        await page.goto(`https://yopmail.com/?login=${uniqueEmail}`, { timeout: 40000, waitUntil: 'domcontentloaded' });
        break;
      } catch (e) {
        console.log(`⚠️ Yopmail reload attempt ${i + 1} failed, retrying...`);
        if (i === 2) throw e;
      }
    }

    await page.waitForTimeout(5000);
    await page.getByRole('button', { name: '' }).click();
    const inboxResetFrame = page.frameLocator('#ifinbox');
    await inboxResetFrame.getByText(/Reset your password/i).first().waitFor({ timeout: 30000 });
    await inboxResetFrame.getByText(/Reset your password/i).first().click();

    const resetMailFrame = page.frameLocator('#ifmail');
    const resetLink = resetMailFrame.getByRole('link', { name: 'Reset Password' });
    await resetLink.waitFor();
    const resetUrl = await resetLink.getAttribute('href');

    // ---------- Step 5: Set New Password ----------
    await page.goto(resetUrl!);
    await page.fill('input[placeholder="Password"]', newPassword);
    await page.fill('input[placeholder="Confirm Password"]', newPassword);
    await page.click('button:has-text("Reset Password")', { timeout: 5000 });
    await page.getByText(/Password reset successfully!/i).waitFor({ state: 'visible', timeout: 10000 });
    await captureToastScreenshot(page, testInfo); // 🖼️ capture toast screenshot

    // ---------- Step 6: Try Login with Old Password (should fail) ----------
    await loginPage.goto();
    await loginPage.login(uniqueEmail, oldPassword);
    await loginPage.expectInvalidCredentialsToast();
    await captureToastScreenshot(page, testInfo); // 🖼️ capture toast screenshot

    // ---------- Step 7: Try Login with New Password (should succeed) ----------
    await loginPage.login(uniqueEmail, newPassword);
    await loginPage.expectSuccessToast();
    await captureToastScreenshot(page, testInfo); // 🖼️ capture toast screenshot
  });
});
