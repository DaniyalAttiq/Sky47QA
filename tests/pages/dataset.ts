import { expect, Page } from '@playwright/test';

export class DatasetPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // ===== Navigate to Datasets tab (inside KB) =====
    async navigateToDatasetsTab() {
        console.log('➡️ Navigating to Datasets tab...');
        const datasetTab = this.page.getByRole('heading', { name: 'Data Sets' }).first;
        await expect(this.page.getByRole('heading', { name: /^Data Sets$/i })).toBeVisible({ timeout: 10000 });
        console.log('✅ Datasets tab opened');
    }

    // ===== Click Create Dataset button =====
    async clickCreateDataset() {
        const createBtn = this.page.getByRole('button', { name: 'Add File' });
        await expect(createBtn).toBeVisible({ timeout: 10000 });
        await createBtn.click();
        console.log('✅ Clicked Create Dataset button');
    }

    // ===== Fill Dataset form =====
    async fillDatasetForm(name: string, source: string) {
        const nameInput = this.page.locator('input[placeholder="Enter Dataset name"]');
        await expect(nameInput).toBeVisible({ timeout: 10000 });
        await nameInput.fill(name);
        console.log(`📝 Filled Dataset name: ${name}`);

        const sourceDropdown = this.page.locator(`label:has-text("Data Source") + button`);
        if (await sourceDropdown.isVisible().catch(() => false)) {
            await sourceDropdown.click();
            const sourceOption = this.page.getByRole('option', { name: source, exact: true });
            await expect(sourceOption).toBeVisible({ timeout: 5000 });
            await sourceOption.click();
            await this.page.locator('body').click({ position: { x: 0, y: 0 } });
            console.log(`✅ Selected data source: ${source}`);
        }
    }

    // ===== Save Dataset =====
    async saveDataset() {
        const saveBtn = this.page.getByRole('button', { name: 'Create' });
        await expect(saveBtn).toBeVisible({ timeout: 10000 });
        await saveBtn.click();
        await expect(this.page.locator('text=Dataset created successfully')).toBeVisible({ timeout: 10000 });
        console.log('🎉 Dataset created successfully');
    }

    // ===== Verify Dataset exists =====
    async verifyDatasetExists(name: string) {
        const datasetItem = this.page.getByText(name, { exact: true });
        await datasetItem.waitFor({ timeout: 10000 });
        await expect(datasetItem).toBeVisible();
        console.log(`✅ Verified dataset "${name}" exists`);
    }

    // ===== Delete Dataset =====
    async deleteDataset(name: string) {
        const deleteBtn = this.page.getByRole('button', { name: `Delete ${name}` });
        await deleteBtn.waitFor({ state: 'visible', timeout: 10000 });
        await deleteBtn.click({ force: true });

        const confirm = this.page.getByRole('button', { name: /Delete/i });
        if (await confirm.isVisible().catch(() => false)) {
            await confirm.click({ force: true });
        }

        await expect(this.page.getByText(name, { exact: true })).toHaveCount(0, { timeout: 10000 });
        console.log(`🗑️ Deleted dataset "${name}" successfully`);
    }

    // ===== View first dataset =====
    async viewFirstDataset() {
        const firstViewBtn = this.page.getByRole('button', { name: 'View Dataset' }).first();
        await expect(firstViewBtn).toBeVisible({ timeout: 10000 });
        await firstViewBtn.click();
        console.log('✅ Clicked first "View Dataset" button');
    }

    // ===== Open Settings from sidebar =====
    async openSettingsFromSidebar() {
        const sidebar = this.page.locator('div[data-slot="sidebar"]');
        const settingsBtn = sidebar.getByRole('link', { name: 'Settings' });
        await expect(settingsBtn).toBeVisible({ timeout: 10000 });
        await settingsBtn.click();
        console.log('✅ Opened Settings tab');

        const settingsHeading = this.page.getByRole('heading', { name: 'Dataset Settings' });
        await expect(settingsHeading).toBeVisible({ timeout: 10000 });
        console.log('✅ Dataset Settings loaded');
    }

    // ===== Update Dataset name =====
    async updateDatasetName(newName: string) {
        const nameInput = this.page.locator('input[placeholder="Dataset name"]');
        await expect(nameInput).toBeVisible({ timeout: 10000 });
        await nameInput.fill(newName);
        console.log(`📝 Updated Dataset name to "${newName}"`);
    }
}
