import { test, expect } from '@playwright/test';
import { SignupPage } from '../pages/signup';

test.describe('Signup Page', () => {
  let signupPage: SignupPage;

  test.beforeEach(async ({ page }) => {
    signupPage = new SignupPage(page);
    await signupPage.goto();
  });

  // 🔹 Capture screenshot for Allure after every test
  test.afterEach(async ({ page }, testInfo) => {
    const screenshot = await page.screenshot();
    await testInfo.attach('screenshot', {
      body: screenshot,
      contentType: 'image/png',
    });
  });

  test('S4-TC-1: should verify email and login successfully via Yopmail', async ({ page }) => {
    const uniqueEmail = `user_${Date.now()}@yopmail.com`;
    await signupPage.signup('Daniyal', uniqueEmail, 'StrongP@ssw0rd!');
    await signupPage.expectSuccessToast();
    await page.waitForURL('**/verification');
    await page.goto(`https://yopmail.com/?login=${uniqueEmail}`);
    
    const inboxFrame = page.frameLocator('#ifinbox');

    await expect(inboxFrame.getByText(/Verify your account/i)).toBeVisible({ timeout: 30000 });
    await inboxFrame.getByText(/Verify your account/i).first().click();

    const mailFrame = page.frameLocator('#ifmail');
    const confirmButton = mailFrame.getByRole('link', { name: 'Confirm My Account' });

    await expect(confirmButton).toBeVisible({ timeout: 10000 });
    const verifyUrl = await confirmButton.getAttribute('href');

    await page.goto(verifyUrl!);
    await expect(page.getByText(/Your Account Successfully Created/i)).toBeVisible();

    await page.getByRole('button', { name: /Continue/i }).click();
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByRole('heading', { name: /Login Account/i })).toBeVisible();

    await page.fill('input[placeholder="Email Address"]', uniqueEmail);
    await page.fill('input[placeholder="Password"]', 'StrongP@ssw0rd!');
    await page.click('button:has-text("Login")');
    await expect(page.getByText(/Coming Soon/i)).toBeVisible();
  });

  test('S4-TC-2: should show unverified account toast if user exists but not verified', async ({ page }) => {
    await signupPage.signup('Daniyal', 'daniyal.unverified@yopmail.com', 'StrongP@ssw0rd!');
    await signupPage.expectUnverifiedToast();
    await page.waitForURL('**/verification');
    await expect(page.getByText(/Verify your email/i)).toBeVisible();
  });

  test('S4-TC-96: should show already exists toast if email is fully registered & verified', async () => {
    await signupPage.signup('Daniyal', 'daniyal.attiq@yopmail.com', 'StrongP@ssw0rd!');
    await signupPage.expectAlreadyExistsToast();
  });

 test('S4-TC-7: Password & Confirm Password validation end-to-end', async ({ page }) => {
  // Fill other required fields
  await signupPage.nameInput().fill('Daniyal');
  await signupPage.emailInput().fill(`pass_matrix_${Date.now()}@yopmail.com`);

  // 🔹 Password validation cases
  const passwordCases = [
    { password: 'Ab1@', error: 'Password must be at least 8 characters long.' },
    { password: '', error: 'Password is required' },
    { password: 'abcdefgh', error: 'Must include only upper & lower case, number, and symbol.' },
    { password: 'ABCDEFGH', error: 'Must include only upper & lower case, number, and symbol.' },
    { password: 'Abcdefgh', error: 'Must include only upper & lower case, number, and symbol.' },
    { password: 'Abc@ 123', error: 'Must include only upper & lower case, number, and symbol.' },
    { password: 'Abc@1234567890123456789012345678901', error: 'Password must not exceed 32 characters.' },
  ];

  const confirmPasswordCases = [
    { password: 'Abc@1234', confirmPassword: '', error: 'Please confirm your password.' },
    { password: 'Abc@1234', confirmPassword: 'Abc@12', error: 'Passwords do not match.' },
  ];

  for (const { password, error } of passwordCases) {
    await signupPage.passwordInput().fill(password);
    await signupPage.confirmPasswordInput().click();
    await expect(page.getByText(error, { exact: false })).toBeVisible();
  }

  for (const { password, confirmPassword, error } of confirmPasswordCases) {
    await signupPage.passwordInput().fill(password);
    await signupPage.confirmPasswordInput().fill(confirmPassword);
    await signupPage.confirmPasswordInput().blur();
    await expect(page.getByText(error, { exact: false })).toBeVisible();
  }

  await signupPage.passwordInput().fill('Abc@1234');
  await signupPage.confirmPasswordInput().fill('Abc@1234');
  await signupPage.confirmPasswordInput().blur();

  const allErrorMessages = [
    'Password must be at least 8 characters long.',
    'Password is required',
    'Must include only upper & lower case, number, and symbol.',
    'Password must not exceed 32 characters.',
    // confirm password-related
    'Please confirm your password.',
    'Passwords do not match.',
  ];

  for (const msg of allErrorMessages) {
    await expect(page.getByText(msg, { exact: false })).not.toBeVisible();
  }
});



  test('S4-TC-8: User Skips Email Verification and Tries to Login', async ({ page }) => {
    const uniqueEmail = `verify_back_${Date.now()}@yopmail.com`;
    const password = 'StrongP@ssw0rd!';
    await signupPage.signup('Daniyal', uniqueEmail, password);

    await signupPage.expectSuccessToast();
    await page.waitForURL('**/verification');
    await expect(page.getByText(/Verify your email/i)).toBeVisible();

    await page.getByRole('button', { name: 'Go back' }).click();
    await page.getByRole('link', { name: 'Log In' }).click();

    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByRole('heading', { name: /Login Account/i })).toBeVisible();

    await page.getByRole('textbox', { name: 'Email Address' }).fill(uniqueEmail);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: /Login/i }).click();

    await page.waitForURL('**/verification');
    await expect(page.getByText(/Please verify your email./i)).toBeVisible();
  });

  test('S4-TC-10: Verify mandatory fields validation when left blank', async ({ page }) => {
    await signupPage.createAccountButton().click();

    await expect(page.getByText('Full name is required')).toBeVisible();
    await expect(page.getByText('Email address is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
    await expect(page.getByText('Please confirm your password')).toBeVisible();
  });
});
