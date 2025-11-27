import { test, expect, Page } from '@playwright/test';
import { DatasetPage } from '../pages/dataset';
import path from 'path';

test.describe('Dataset & File Tests (within a Knowledge Base)', () => {
  let datasetPage: DatasetPage;

  // ----- Reusable login + KB creation function -----
  async function loginAndCreateKB(page: Page) {
    // ----- Optional login -----
    const emailInput = page.getByRole('textbox', { name: 'Email Address' });
    const passwordInput = page.getByRole('textbox', { name: 'Password' });
    const loginBtn = page.getByRole('button', { name: 'Login' });

    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill('super_admin@sky47.com');
      await passwordInput.fill('Password@123');
      await loginBtn.click();
      console.log('✅ Logged in successfully');
    }

    // ----- Navigate to Knowledge Bases -----
    console.log('➡️ Navigating to Knowledge Bases...');
    const kbSidebarLink = page.locator('[data-slot="sidebar-menu-button"]', {
      hasText: 'Knowledge Base',
    });
    await kbSidebarLink.first().click();
    await expect(page.getByRole('heading', { name: /^Knowledge Bases$/i })).toBeVisible({ timeout: 10000 });
    console.log('✅ Knowledge Bases page opened');

    // ----- Create KB -----
    const createButton = page.getByRole('button', { name: 'Create Knowledge Base' });
    await expect(createButton).toBeVisible({ timeout: 10000 });
    await createButton.click();

    const kbName = `Test KB ${Date.now()}`;
    const department = 'Haider';
    const nameInput = page.locator('input[placeholder="Enter Knowledge base name"]');
    await nameInput.fill(kbName);

    const deptDropdown = page.locator(`label:has-text("Assign Department") + button`);
    await deptDropdown.click();
    await page.getByRole('option', { name: department, exact: true }).click();
    await page.locator('body').click({ position: { x: 0, y: 0 } });

    const saveBtn = page.getByRole('button', { name: 'Create' });
    await saveBtn.click();
    await expect(page.locator('text=Knowledge Base created successfully')).toBeVisible({ timeout: 10000 });
    console.log(`🎉 Knowledge Base "${kbName}" created`);

    // ----- Open KB -----
    const viewBtn = page.getByRole('button', { name: 'View Knowledge Base' }).first();
    await expect(viewBtn).toBeVisible({ timeout: 10000 });
    await viewBtn.click();
    console.log(`✅ Opened Knowledge Base "${kbName}"`);
  }

  test.beforeEach(async ({ page }) => {
    datasetPage = new DatasetPage(page);
    await page.goto('https://r08sgs0k08gw0sgccscoo4o8.49.13.228.64.sslip.io/');
    await loginAndCreateKB(page);
  });

 
  test('Click "Add File" button, upload a file, and delete it', async ({ page }) => {
  await datasetPage.navigateToDatasetsTab();

  // Locate and click the Add File button
  const addFileBtn = page.getByRole('button', { name: 'Add File' });
  await expect(addFileBtn).toBeVisible({ timeout: 10000 });
  await addFileBtn.click();
  console.log('✅ Clicked "Add File" button');

  // Upload a file
  const fileInput = page.locator('input[type="file"]');
  await expect(fileInput).toBeVisible({ timeout: 5000 });

  const filePath = path.resolve(__dirname, '../test-data/sample.pdf');
  await fileInput.setInputFiles(filePath);
  console.log(`📂 Uploaded file: ${filePath}`);

  await page.getByRole('button', { name: 'Upload' }).click();
  console.log('✅ Clicked "Upload" button');

  // Verify upload success
  const uploadedFileName = page.getByText('sample.pdf', { exact: true });
  await expect(uploadedFileName).toBeVisible({ timeout: 10000 });
  console.log('🎉 File uploaded successfully and visible on UI');

  // ===== Click the Trash/Delete button for the uploaded file =====
  // Locate the row for the uploaded file
  const datasetRow = page.getByRole('row', { name: 'Select row file icon sample.' });

// Locate the delete button (4th button) inside the row
const deleteBtn = datasetRow.getByRole('button').nth(3);
await expect(deleteBtn).toBeVisible({ timeout: 10000 });
await deleteBtn.click({ force: true });
console.log('🗑️ Clicked trash button to delete the uploaded dataset');

// Confirm deletion
const confirmBtn = page.getByRole('button', { name: /Remove/i });
if (await confirmBtn.isVisible().catch(() => false)) {
  await confirmBtn.click({ force: true });
  console.log('✅ Confirmed deletion');
}

// Verify the file is gone
await expect(page.getByText('sample.pdf', { exact: true })).toHaveCount(0, { timeout: 10000 });
console.log('✅ Dataset file deleted successfully');
});


  test.afterEach(async ({ page }) => {
  });
});
