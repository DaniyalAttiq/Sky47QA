import { expect, Page, Locator } from '@playwright/test';

export class SuperOrgPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ===== Navigate to Organizations Page =====
  async navigateToOrganizations() {
    console.log('➡️ Navigating to Organizations page...');
    await this.page.waitForTimeout(1000);

    const orgLink = this.page.locator('[data-slot="sidebar-menu-button"]', { hasText: 'Organization' });
    await expect(orgLink).toBeVisible({ timeout: 10000 });
    await orgLink.click();

    await this.page.waitForURL(/\/organizations$/, { timeout: 20000 });
    console.log('🌐 URL changed to /organizations');

    const heading = this.page
      .getByRole('heading', { name: /Organizations/i })
      .or(this.page.locator('text=Organizations'))
      .first();

    await expect(heading).toBeVisible({ timeout: 20000 });
    console.log(`✅ Organizations page loaded — heading found: "${await heading.textContent()}"`);
  }

  // ===== Validate Organizations Page =====
  async expectOrganizationsPage() {
    const heading = this.page.getByRole('heading', { name: /Organizations/i });
    await expect(heading).toBeVisible({ timeout: 10000 });

    const createBtn = this.page.getByRole('button', { name: /Create Organization/i });
    await expect(createBtn).toBeVisible({ timeout: 5000 });

    console.log('✅ Organizations page validated');
  }

  // ===== Click Create Organization =====
  async clickCreateOrganization() {
    const button = this.page.getByRole('button', { name: /Create Organization/i });
    await expect(button).toBeVisible({ timeout: 5000 });
    await button.click();
    console.log('✅ Clicked Create Organization');
  }

  // ===== Fill Organization Name =====
  async fillOrganizationName(name: string) {
    const input = this.page.getByPlaceholder('Enter organization name').or(this.page.getByRole('textbox').first());
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill(name);
    console.log(`✅ Organization name filled: "${name}"`);
  }

  // ===== Click Create in Organization Form =====
  async clickCreateInForm() {
    const button = this.page.getByRole('button', { name: /^Create$/i });
    await expect(button).toBeVisible({ timeout: 5000 });
    await button.click();
    console.log('✅ Clicked Create in modal');
  }

  // ===== Open First Organization =====
 // ===== Open first organization =====
async openFirstOrganization() {
  // Wait for the organization cards container to be visible
  const cardsContainer = this.page.locator('div.mt-8.grid'); // adjust selector if needed
  await expect(cardsContainer).toBeVisible({ timeout: 10000 });
  console.log('📦 Organization cards container is visible');

  // Wait for at least one "View Organization" button to appear
  const viewButtons = this.page.getByRole('button', { name: /View Organization/i });
  await expect(viewButtons.first()).toBeVisible({ timeout: 10000 });
  console.log(`👆 Found ${await viewButtons.count()} organization card(s)`);

  // Click the first organization
  await viewButtons.first().click();
  console.log('✅ Opened first organization');
}


  // ===== Expect Departments Page =====
  async expectDepartmentsPage() {
    const heading = this.page.getByRole('heading', { name: /Departments/i }).first();
    await expect(heading).toBeVisible({ timeout: 10000 });


    const createBtn = this.page.getByRole('button', { name: /Add Department/i });
    await expect(createBtn).toBeVisible({ timeout: 5000 });
    console.log('✅ Departments page validated');
  }

  // ===== Department Methods =====
  async clickCreateDepartment() {
    const button = this.page.getByRole('button', { name: /Add Department/i });
    await expect(button).toBeVisible({ timeout: 5000 });
    await button.click();
    console.log('✅ Clicked Add Department');
  }

  async fillDepartmentName(name: string) {
    const input = this.page.getByPlaceholder(/Enter department name/i).or(this.page.getByRole('textbox').first());
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill(name);
    console.log(`✅ Department name filled: "${name}"`);
  }

  async clickCreateDepartmentInForm() {
    const button = this.page.getByRole('button', { name: /^Create$/i });
    await expect(button).toBeVisible({ timeout: 5000 });
    await button.click();
    console.log('✅ Department created');
  }
}
