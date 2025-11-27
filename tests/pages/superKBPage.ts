import { expect, Page } from '@playwright/test';

export class SuperKBPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // ===== Navigate to Knowledge Bases via sidebar =====
    async navigateToKnowledgeBases() {
        console.log('➡️ Navigating to Knowledge Bases via sidebar...');
        await this.page.waitForTimeout(1000); // ensure sidebar loaded

        const kbSidebarLink = this.page.locator('[data-slot="sidebar-menu-button"]', {
            hasText: 'Knowledge Base',
        });

        await expect(kbSidebarLink).toBeVisible({ timeout: 15000 });
        await kbSidebarLink.click();
        await this.page.waitForTimeout(500); // Brief pause between clicks
        await kbSidebarLink.click(); // Click twice to ensure navigation

        

        // Retry mechanism for heading
        const heading = this.page.getByRole('heading', { name: /^Knowledge Bases$/i });
        await this.page.waitForTimeout(2000); // small delay to let DOM settle

        let retries = 5;
        while (retries > 0) {
            if (await heading.isVisible().catch(() => false)) break;
            await this.page.waitForTimeout(1000);
            retries--;
        }

        await expect(heading).toBeVisible({ timeout: 10000 });
        await heading.scrollIntoViewIfNeeded();
        console.log('✅ Knowledge Bases page loaded');
    }

    // ===== Click "Create Knowledge Base" button =====
    async clickCreateKB() {
        const createButton = this.page.getByRole('button', { name: 'Create Knowledge Base' });
        await expect(createButton).toBeVisible({ timeout: 5000 });
        await createButton.click();
        console.log('✅ Clicked Create Knowledge Base button');
    }

    // ===== Fill Knowledge Base form =====
    async fillKnowledgeBaseForm(name: string, department: string) {
        const nameInput = this.page.locator('input[placeholder="Enter Knowledge base name"]');
        await expect(nameInput).toBeVisible({ timeout: 5000 });
        await nameInput.fill(name);
        console.log(`📝 Filled Knowledge Base name: ${name}`);

        const deptDropdown = this.page.locator(`label:has-text("Assign Department") + button`);
        await expect(deptDropdown).toBeVisible({ timeout: 5000 });
        await deptDropdown.click();

        const deptOption = this.page.getByRole('option', { name: department, exact: true });
        await expect(deptOption).toBeVisible({ timeout: 5000 });
        await deptOption.click();

        await this.page.locator('body').click({ position: { x: 0, y: 0 } });
        console.log(`✅ Assigned department: ${department} and closed dropdown`);
    }

    // ===== Save Knowledge Base =====
    async saveKnowledgeBase() {
        const saveBtn = this.page.getByRole('button', { name: 'Create' });
        await expect(saveBtn).toBeVisible({ timeout: 5000 });
        await saveBtn.click();

        const successToast = this.page.locator('text=Knowledge Base created successfully');
        await expect(successToast).toBeVisible({ timeout: 10000 });
        console.log('🎉 Knowledge Base created successfully');
    }

    // ===== Verify Knowledge Base exists in list =====
    async verifyKnowledgeBaseExists(name: string) {
        const kbLocator = this.page.getByText(name, { exact: true });
        await kbLocator.waitFor({ timeout: 10000 });
        await expect(kbLocator).toBeVisible();
        console.log(`✅ Verified Knowledge Base "${name}" exists`);
    }

    // ===== View Knowledge Base by name =====
    async viewKnowledgeBase(kbName: string) {
        const firstViewButton = this.page.getByRole('button', { name: 'View Knowledge Base' }).first();
        await expect(firstViewButton).toBeVisible({ timeout: 10000 });
        await firstViewButton.click();
        console.log('✅ Clicked the first "View Knowledge Base" button');
    }


    // ===== View the first organization KB =====
    async viewFirstOrganizationKB() {
        const firstViewButton = this.page.getByRole('button', { name: 'View Knowledge Base' }).first();
        await expect(firstViewButton).toBeVisible({ timeout: 10000 });
        await firstViewButton.click();
        console.log('✅ Clicked the first "View Knowledge Base" button');
    }

    // ===== Update Knowledge Base name =====
    async updateKnowledgeBaseName(newName: string) {
        const kbNameInput = this.page.locator('input[placeholder="Knowledge base name"]');
        await expect(kbNameInput).toBeVisible({ timeout: 5000 });
        await kbNameInput.fill(newName);
        console.log(`📝 Updated Knowledge Base name to "${newName}"`);
    }






    // ===== Open Settings from sidebar =====
    async openSettingsFromSidebar() {

        const sidebar = this.page.locator('div[data-slot="sidebar"]');
        const settingsBtn = sidebar.getByRole('link', { name: 'Settings' });
        await expect(settingsBtn).toBeVisible({ timeout: 10000 });
        await settingsBtn.click();
        console.log('✅ Clicked Settings in sidebar');

        const settingsHeading = this.page.getByRole('heading', { name: 'Knowledge Base Settings' });
        await expect(settingsHeading).toBeVisible({ timeout: 10000 });
        console.log('✅ Knowledge Base Settings page loaded');
    }

    // ===== Optional: Force close any open dropdowns =====
    async clickOutside() {
        await this.page.locator('body').click({ position: { x: 0, y: 0 } });
        console.log('✅ Clicked outside to close any open dropdowns/modals');
    }
}
