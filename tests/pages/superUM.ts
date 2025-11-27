import { expect, Page, Locator } from '@playwright/test';

export class SuperUMPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ===== Navigate to Login =====
  async gotoLogin(url: string) {
    await this.page.goto(url);
    console.log(`➡️ Navigated to ${url}`);
  }

  // ===== Login Method =====
  async login(email: string, password: string, rememberMe = true) {
    const emailInput = this.page.getByRole('textbox', { name: 'Email Address' });
    const passwordInput = this.page.getByRole('textbox', { name: 'Password' });
    const loginBtn = this.page.getByRole('button', { name: 'Login' });

    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await emailInput.fill(email);
    await passwordInput.fill(password);

    if (rememberMe) {
      const rememberCheckbox = this.page.getByRole('checkbox', { name: /remember/i });
      if (await rememberCheckbox.isVisible().catch(() => false)) {
        await rememberCheckbox.check();
      }
    }

    await loginBtn.click();
    console.log('✅ Submitted login form');
  }

  // ===== Navigate to User Management =====
  async navigateToUserManagement() {
  console.log('➡️ Navigating to User Management...');
  await this.page.waitForTimeout(2000); // Wait for 2 seconds to ensure sidebar is loaded

  // Click on User Management in sidebar
  const navButton = this.page.locator('[data-slot="sidebar-menu-button"]', { hasText: 'User Management' });
  await expect(navButton).toBeVisible({ timeout: 10000 });
  await navButton.click();

  // Wait for route change
  await this.page.waitForURL(/\/users$/, { timeout: 15000 });
  console.log('🌐 URL changed to /users');

  // Wait for main heading or unique page element (fallback chain)
  await this.page
    .locator('h3:has-text("User Management")')
    .or(this.page.locator('text=Invite User'))
    .or(this.page.locator('text=User List'))
    .first()
    .waitFor({ state: 'visible', timeout: 20000 });

  // Additional check: ensure the page is fully loaded by checking for table or list elements
  await this.page.waitForSelector('table, [data-testid="user-list"], .user-table', { timeout: 10000 }).catch(() => {
    console.log('Table or user list not found, but proceeding as page might still be loading');
  });

  console.log('✅ User Management page content loaded');
}


  // ===== Open Invite User Dialog =====
  async openInviteUserDialog(): Promise<Locator> {
    const inviteBtn = this.page.getByRole('button', { name: /Invite User/i });
    await expect(inviteBtn).toBeVisible({ timeout: 5000 });
    await inviteBtn.click();

    const dialog = this.page.getByRole('dialog', { name: /Invite User/i });
    await expect(dialog).toBeVisible({ timeout: 10000 });

    console.log('✅ Invite User dialog opened');
    return dialog;
  }

  // ===== Select Option from Custom Dropdown =====
  async selectDropdownOption(labelText: string, optionText: string) {
    const combobox = this.page.locator(`label:has-text("${labelText}") + button`);
    await expect(combobox).toBeVisible({ timeout: 5000 });
    await combobox.click();

    const option = this.page.getByRole('option', { name: optionText });
    await expect(option).toBeVisible({ timeout: 5000 });
    await option.click();

    console.log(`✅ Selected "${optionText}" from "${labelText}" dropdown`);
  }

  // ===== Fill Invite User Form =====
  async fillInviteUserForm(
    email: string,
    name: string,
    organization: string,
    department?: string,
    role: 'Admin' | 'User' = 'Admin'
  ) {
    const dialog = await this.openInviteUserDialog();

    // Fill Email & Name
    await dialog.getByPlaceholder('Enter email address').fill(email);
    await dialog.getByPlaceholder('Enter name').fill(name);

    // Select Organization
    await this.selectDropdownOption('Organization', organization);

    // Wait for Department dropdown to be enabled, if provided
    if (department) {
      const deptCombobox = this.page.locator(`label:has-text("Department") + button`);
      await expect(deptCombobox).toBeEnabled({ timeout: 5000 });
      await this.selectDropdownOption('Department', department);
    }

    // Select Role
    await this.selectDropdownOption('Role', role);

    console.log(`✅ Filled Invite User form with email: ${email}, name: ${name}, org: ${organization}, dept: ${department}, role: ${role}`);
  }

  // ===== Click first cell in User Management table =====
async clickFirstCellInTable() {
  // Get the first row in the table
  await this.page.waitForSelector('table tr', { timeout: 5000 });
  const firstRow = this.page.locator('table tr').first();

  // Get the first cell in that row
  const firstCell = firstRow.locator('td').first();
  await this.page.locator('table tr').count();
console.log('Number of rows in table:', await this.page.locator('table tr').count());

const rowCount = await this.page.locator('table tr').count();
console.log('Number of rows in table:', rowCount);



  // If the first cell contains a button (checkbox) click it
  const button = firstCell.locator('button');
  if (await button.count() > 0) {
    await expect(button).toBeVisible({ timeout: 5000 });
    await button.click();
    console.log('✅ Clicked first cell button in User Management table');
  } else {
    // Otherwise click the cell itself
    await firstCell.click();
    console.log('✅ Clicked first cell in User Management table');
  }

  // Optional: wait for sidebar to open (replace with your sidebar locator)
  const sidebar = this.page.locator('div[data-slot="sidebar"]');
  await expect(sidebar).toBeVisible({ timeout: 5000 });
  console.log('✅ Sidebar opened after clicking first cell');
}





  // ===== Send Invite =====
  async sendInvite() {
    const dialog = this.page.getByRole('dialog', { name: /Invite User/i });
    const sendButton = dialog.getByRole('button', { name: /Send Invite/i });
    await expect(sendButton).toBeVisible({ timeout: 5000 });
    await sendButton.click();

    // Use a reliable locator for success toast/message
   // const successToast = this.page.locator('text=User added successfully!');
   // await expect(successToast).toBeVisible({ timeout: 10000 });

    console.log('🎉 Invite sent successfully');
    const invitationDialog = this.page.getByRole('dialog', { name: 'Invitation Sent!' });
    await expect(invitationDialog).toBeVisible({ timeout: 5000 });

    const cancelBtn = invitationDialog.getByRole('button', { name: 'Cancel' });
    await expect(cancelBtn).toBeVisible({ timeout: 5000 });
    await cancelBtn.click();
    console.log('✅ Closed Invitation Sent modal via Cancel button');
  }

  // ===== Click User Cell and Verify Sidebar =====
  async clickUserCellAndVerifySidebar(email: string) {
    // Locate the cell containing the email
    const userCell = this.page.locator('td').filter({ hasText: email });
    await expect(userCell).toBeVisible({ timeout: 10000 });
    await userCell.click();
    console.log(`✅ Clicked on "${email}" cell and sidebar opened`);
  }

}