import { test, expect } from '@playwright/test';
import { SuperKBPage } from '../pages/superKBPage';

test.describe('Knowledge Base Tests', () => {
    let kbPage: SuperKBPage;

    test.beforeEach(async ({ page }) => {
        kbPage = new SuperKBPage(page);
        await page.goto('https://r08sgs0k08gw0sgccscoo4o8.49.13.228.64.sslip.io/');

        // Optional login
        const emailInput = page.getByRole('textbox', { name: 'Email Address' });
        const passwordInput = page.getByRole('textbox', { name: 'Password' });
        const loginBtn = page.getByRole('button', { name: 'Login' });

        if (await emailInput.isVisible().catch(() => false)) {
            await emailInput.fill('super_admin@sky47.com');
            await passwordInput.fill('Password@123');
            await loginBtn.click();
            console.log('✅ Logged in successfully');
        }
    });

    test('Create and Delete a Knowledge Base', async ({ page }) => {
        await kbPage.navigateToKnowledgeBases();
        await kbPage.clickCreateKB();

        const kbName = `Test KB ${Date.now()}`;
        const department = 'Haider';
        await kbPage.fillKnowledgeBaseForm(kbName, department);
        await kbPage.saveKnowledgeBase();
        await kbPage.verifyKnowledgeBaseExists(kbName);

        // Delete KB
        const deleteButton = page.getByRole('button', { name: `Delete ${kbName}` });
        await deleteButton.waitFor({ state: 'visible', timeout: 10000 });
        await deleteButton.click({ force: true });
        const confirmBtn = page.getByRole('button', { name: /Delete/i });
        if (await confirmBtn.isVisible().catch(() => false)) {
            await confirmBtn.click({ force: true });
        }

        await expect(page.getByText(kbName, { exact: true })).toHaveCount(0, { timeout: 10000 });
        console.log(`✅ Verified "${kbName}" has been deleted`);
    });

    test('Create KB -> View KB -> Open Settings', async ({ page }) => {
        await kbPage.navigateToKnowledgeBases();
        await kbPage.clickCreateKB();

        const kbName = `Test KB ${Date.now()}`;
        const department = 'Haider';
        await kbPage.fillKnowledgeBaseForm(kbName, department);
        await kbPage.saveKnowledgeBase();
        await kbPage.verifyKnowledgeBaseExists(kbName);

        // View the KB and open settings
        await kbPage.viewKnowledgeBase(kbName);
        await kbPage.openSettingsFromSidebar();
    });


    test('View first organization KB and update name', async ({ page }) => {
        await kbPage.navigateToKnowledgeBases();
        // View first organization KB
        await kbPage.viewFirstOrganizationKB();
        await kbPage.openSettingsFromSidebar();

        // Update the KB name
        const newKBName = `Updated KB ${Date.now()}`;
        await kbPage.updateKnowledgeBaseName(newKBName);

        // Optional: Verify the input value is updated
        const kbNameInput = page.locator('input[placeholder="Knowledge base name"]');
        await expect(kbNameInput).toHaveValue(newKBName, { timeout: 5000 });
        await kbNameInput.press('Enter');
        console.log('✅ Knowledge Base name updated successfully');
    });
});

