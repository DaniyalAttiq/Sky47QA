import { Page, TestInfo } from '@playwright/test';

export async function captureToastScreenshot(page: Page, testInfo: TestInfo) {
  const toastLocator = page.locator('.toast, [role="alert"], .notification'); // adjust to match your toast selector
  
  try {
    // Wait briefly for toast to appear
    await toastLocator.first().waitFor({ state: 'visible', timeout: 5000 });
    
    // If visible, take a screenshot
    if (await toastLocator.first().isVisible()) {
      const screenshotPath = testInfo.outputPath(`toast-${Date.now()}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      
      // Attach screenshot to the HTML report
      await testInfo.attach('toast-screenshot', {
        path: screenshotPath,
        contentType: 'image/png',
      });
    }
  } catch (error) {
    // No toast found or timeout — ignore
  }
}
