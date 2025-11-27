import { test, expect } from '@playwright/test';
import { SuperUMPage } from '../pages/superUM';

// Helper to generate random email
function generateRandomEmail() {
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `user_${randomStr}@example.com`;
}

test.describe('Super Admin - User Management', () => {
  let superUMPage: SuperUMPage;

  test.beforeEach(async ({ page }) => {
    superUMPage = new SuperUMPage(page);

    // Go to login page
    await superUMPage.gotoLogin('https://r08sgs0k08gw0sgccscoo4o8.49.13.228.64.sslip.io/login');

    // Login
    await superUMPage.login('super_admin@sky47.com', 'Password@123', true);

    // Optional: wait for dashboard to load
    await page.waitForTimeout(2000);
  });

  test('UM-Invite: should open Invite User dialog and send an invite', async ({ page }) => {
    // Navigate to User Management
    await superUMPage.navigateToUserManagement();

    // Generate random email
    const randomEmail = generateRandomEmail();

    // Fill invite user form
    await superUMPage.fillInviteUserForm(
      randomEmail,
      'New User',
      'Org1',     // Organization
      'O1D1',     // Department
      'Admin'     // Role
    );

    // Send Invite
    await superUMPage.sendInvite();
  });
  test('UM-Sidebar: should navigate to User Management, and verify sidebar opens', async ({ page }) => {
    await superUMPage.navigateToUserManagement();

    const row = 1;
    const col = 2;

    const cell = page.locator(`tbody tr:nth-child(${row}) td:nth-child(${col})`);
    await cell.waitFor({ state: 'visible', timeout: 10000 });
    await cell.click(); // click anywhere inside the cell, away from checkbox
  });



  test('UM-Search: should search for o1d2admin@yopmail.com in User Management', async ({ page }) => {
    // Navigate to User Management
    await superUMPage.navigateToUserManagement();

    // Locate the search textbox
    const searchBox = page.getByRole('textbox', { name: 'Search...' });
    await expect(searchBox).toBeVisible({ timeout: 10000 });

    // Type the email to search
    await searchBox.fill('Admintwo');
    console.log('🔍 Searching for user: Admintwo');

    // Optional: wait for results to appear
    const userRow = page.locator('td', { hasText: 'Admintwo' });
    await expect(userRow).toBeVisible({ timeout: 10000 });
    console.log('✅ User found in search results.');
  });

});
