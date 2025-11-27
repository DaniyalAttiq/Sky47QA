import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login';
import { SuperOrgPage } from '../pages/superOrg';
import { captureToastScreenshot } from '../utils/toastWatcher';

test.describe('Super Admin - Organizations Module', () => {
  let loginPage: LoginPage;
  let superOrgPage: SuperOrgPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    superOrgPage = new SuperOrgPage(page);

    await loginPage.goto();
    await loginPage.login('super_admin@sky47.com', 'Password@123', true);
    await loginPage.expectSuccessToast();
  });

  // ===== Test 1: Navigate to Organizations =====
  test('S4-SORG-01: Navigate to Organizations page', async ({ page }, testInfo) => {
    await superOrgPage.navigateToOrganizations();
    await superOrgPage.expectOrganizationsPage();
    await captureToastScreenshot(page, testInfo);
  });

  // ===== Test 2: Create, Rename, Delete Department =====
  test('S4-SORG-02: Create, rename, and delete a department', async ({ page }, testInfo) => {
    const randomNum = Math.floor(Math.random() * 10000);
    const orgName = `QA Org ${randomNum}`;
    const deptName = `QA Dept ${randomNum}`;
    const updatedDeptName = `${deptName} Updated`;

    await superOrgPage.navigateToOrganizations();
    await superOrgPage.expectOrganizationsPage();

    await superOrgPage.clickCreateOrganization();
    await superOrgPage.fillOrganizationName(orgName);
    await superOrgPage.clickCreateInForm();
    await captureToastScreenshot(page, testInfo);

    const orgLocator = page.getByText(orgName, { exact: true });
    await expect(orgLocator).toBeVisible();

    await superOrgPage.openFirstOrganization();
    await superOrgPage.expectDepartmentsPage();

    await superOrgPage.clickCreateDepartment();
    await superOrgPage.fillDepartmentName(deptName);
    await superOrgPage.clickCreateDepartmentInForm();
    await captureToastScreenshot(page, testInfo);

    const deptLocator = page.getByText(deptName, { exact: true });
    await expect(deptLocator).toBeVisible();

    // Rename department
    const deptCard = deptLocator.locator('..');
    const moreOptionsBtn = deptCard.getByRole('button', { name: 'More options' });
    await moreOptionsBtn.click();

    const editOption = page.getByRole('menuitem', { name: /Edit/i });
    await editOption.click();

    const editInput = page.getByPlaceholder(/Enter department name/i).or(page.getByRole('textbox').first());
    await editInput.fill(updatedDeptName);

    const renameButton = page.getByRole('button', { name: /^Rename$/i });
    await renameButton.click();

    await expect(page.getByText(/department renamed successfully!/i)).toBeVisible();
    await captureToastScreenshot(page, testInfo);

    // Delete department
    const updatedDeptLocator = page.getByText(updatedDeptName, { exact: true });
    const updatedDeptCard = updatedDeptLocator.locator('..');
    const moreOptionsDelete = updatedDeptCard.getByRole('button', { name: 'More options' });
    await moreOptionsDelete.click();

    const deleteOption = page.getByRole('menuitem', { name: /Delete/i });
    await deleteOption.click();

    const confirmDeleteButton = page.getByRole('button', { name: /^Delete$/i });
    await confirmDeleteButton.click();

    await expect(page.getByText(/department deleted successfully!/i)).toBeVisible();
    await captureToastScreenshot(page, testInfo);
    await expect(page.getByText(updatedDeptName, { exact: true })).toHaveCount(0);
  });

  // ===== Test 3: Create Organization =====
  test('S4-SORG-03: Create new organization', async ({ page }, testInfo) => {
    const randomNum = Math.floor(Math.random() * 10000);
    const orgName = `QA Org ${randomNum}`;

    await superOrgPage.navigateToOrganizations();
    await superOrgPage.expectOrganizationsPage();

    await superOrgPage.clickCreateOrganization();
    await superOrgPage.fillOrganizationName(orgName);
    await superOrgPage.clickCreateInForm();
    await captureToastScreenshot(page, testInfo);

    const orgLocator = page.getByText(orgName, { exact: true });
    await expect(orgLocator).toBeVisible();
  });

  // ===== Test 4: Create Department under an Organization =====
  test('S4-SORG-04: Create department under first organization', async ({ page }, testInfo) => {
    const randomNum = Math.floor(Math.random() * 10000);
    const deptName = `QA Dept ${randomNum}`;

    await superOrgPage.navigateToOrganizations();
    await superOrgPage.expectOrganizationsPage();

    await superOrgPage.openFirstOrganization();
    await superOrgPage.expectDepartmentsPage();

    await superOrgPage.clickCreateDepartment();
    await superOrgPage.fillDepartmentName(deptName);
    await superOrgPage.clickCreateDepartmentInForm();
    await captureToastScreenshot(page, testInfo);

    const deptLocator = page.getByText(deptName, { exact: true });
    await expect(deptLocator).toBeVisible();
  });

  // ===== Test 5: Edit / Rename Organization =====
  test('S4-SORG-05: Rename organization', async ({ page }, testInfo) => {
    const randomNum = Math.floor(Math.random() * 10000);
    const orgName = `QA Org ${randomNum}`;
    const updatedName = `${orgName} Renamed`;

    await superOrgPage.navigateToOrganizations();
    await superOrgPage.expectOrganizationsPage();

    await superOrgPage.clickCreateOrganization();
    await superOrgPage.fillOrganizationName(orgName);
    await superOrgPage.clickCreateInForm();
    await captureToastScreenshot(page, testInfo);

    const orgLocator = page.getByText(orgName, { exact: true });
    await expect(orgLocator).toBeVisible();

    const orgCard = orgLocator.locator('..');
    const moreOptionsBtn = orgCard.getByRole('button', { name: 'More options' });
    await moreOptionsBtn.click();

    const editOption = page.getByRole('menuitem', { name: /Edit/i });
    await editOption.click();

    const editInput = page.getByPlaceholder(/Enter organization name/i).or(page.getByRole('textbox').first());
    await editInput.fill(updatedName);

    const renameButton = page.getByRole('button', { name: /^Rename$/i });
    await renameButton.click();

    await expect(page.getByText(/organization renamed successfully!/i)).toBeVisible();
    await captureToastScreenshot(page, testInfo);

    const updatedOrgLocator = page.getByText(updatedName, { exact: true });
    await expect(updatedOrgLocator).toBeVisible();
  });

  // ===== Test 6: Delete Organization =====
  test('S4-SORG-06: Delete organization', async ({ page }, testInfo) => {
    const randomNum = Math.floor(Math.random() * 10000);
    const orgName = `QA Org ${randomNum}`;

    await superOrgPage.navigateToOrganizations();
    await superOrgPage.expectOrganizationsPage();

    await superOrgPage.clickCreateOrganization();
    await superOrgPage.fillOrganizationName(orgName);
    await superOrgPage.clickCreateInForm();
    await captureToastScreenshot(page, testInfo);

    const orgLocator = page.getByText(orgName, { exact: true });
    await expect(orgLocator).toBeVisible();

    const orgCard = orgLocator.locator('..');
    const moreOptionsBtn = orgCard.getByRole('button', { name: 'More options' });
    await moreOptionsBtn.click();

    const deleteOption = page.getByRole('menuitem', { name: /Delete/i });
    await deleteOption.click();

    const confirmDeleteButton = page.getByRole('button', { name: /^Delete$/i });
    await confirmDeleteButton.click();

    await expect(page.getByText(/organization deleted successfully!/i)).toBeVisible();
    await captureToastScreenshot(page, testInfo);

    await expect(page.getByText(orgName, { exact: true })).toHaveCount(0);
  });
});
