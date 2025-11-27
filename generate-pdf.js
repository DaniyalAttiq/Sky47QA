const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generatePDF() {
  const outputPath = path.join(__dirname, 'test-report.pdf');

  console.log('🔍 Checking if allure-results exist...');
  if (!fs.existsSync(path.join(__dirname, 'allure-results'))) {
    console.error('❌ allure-results directory not found. Run tests first.');
    process.exit(1);
  }

  console.log('🚀 Starting Allure server...');
  const { spawn } = require('child_process');
  const allureProcess = spawn('allure', ['serve', 'allure-results', '--port', '63346'], {
    stdio: 'inherit',
    shell: true
  });

  // Wait for server to start
  console.log('⏳ Waiting for Allure server to start...');
  await new Promise(resolve => setTimeout(resolve, 10000));

  try {
    console.log('🌐 Launching browser...');
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-dev-shm-usage'
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 900 });

    console.log('📄 Loading Allure report...');
    await page.goto('http://localhost:63346', {
      waitUntil: 'networkidle0',
      timeout: 180000
    });

    console.log('⏳ Waiting for full report load...');
    await new Promise(resolve => setTimeout(resolve, 20000));

    // Navigate through all sections to load content
    console.log('🔍 Navigating through report sections...');

    // Go to Suites tab and expand
    try {
      const suitesTab = await page.$('text=Suites');
      if (suitesTab) {
        await suitesTab.click();
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (e) { console.log('Suites tab not found'); }

    // Go to Behaviors tab
    try {
      const behaviorsTab = await page.$('text=Behaviors');
      if (behaviorsTab) {
        await behaviorsTab.click();
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (e) { console.log('Behaviors tab not found'); }

    // Go to Packages tab
    try {
      const packagesTab = await page.$('text=Packages');
      if (packagesTab) {
        await packagesTab.click();
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (e) { console.log('Packages tab not found'); }

    // Back to Overview
    try {
      const overviewTab = await page.$('text=Overview');
      if (overviewTab) {
        await overviewTab.click();
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (e) { console.log('Overview tab not found'); }

    // Expand all test suites and cases
    console.log('📋 Expanding all test details...');
    await page.evaluate(async () => {
      // Expand all collapsible sections
      const expandButtons = document.querySelectorAll('.fa-chevron-right, .expand-button, button[data-toggle="collapse"], .collapsed');
      console.log(`Found ${expandButtons.length} expand buttons`);
      for (const btn of expandButtons) {
        try {
          btn.click();
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (e) { console.log('Expand button click failed'); }
      }

      // Click on test links to load details
      const testLinks = document.querySelectorAll('a[href*="#"], .test-link, [data-test-uid], .test-item');
      console.log(`Found ${testLinks.length} test links`);
      for (const link of testLinks.slice(0, 20)) { // Limit to first 20
        try {
          link.scrollIntoView();
          link.click();
          await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (e) { console.log('Test link click failed'); }
      }

      // Scroll to load all content
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise(resolve => setTimeout(resolve, 3000));
      window.scrollTo(0, 0);
    });

    console.log('⏳ Final wait for content...');
    await new Promise(resolve => setTimeout(resolve, 15000));

    console.log('📄 Generating detailed PDF...');
    await page.pdf({
      path: outputPath,
      width: '210mm',
      height: '297mm',
      printBackground: true,
      margin: {
        top: '40px',
        right: '20px',
        bottom: '40px',
        left: '20px'
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; text-align: center; width: 100%; margin: 0 20px;">
          <span>Test Execution Report - ${new Date().toLocaleDateString()}</span>
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; text-align: center; width: 100%; margin: 0 20px;">
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
      preferCSSPageSize: false
    });

    await browser.close();

    console.log(`✅ Detailed PDF report generated: ${outputPath}`);
    if (fs.existsSync(outputPath)) {
      console.log(`📄 File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
    }

  } catch (error) {
    console.error('❌ PDF generation failed:', error.message);
    console.error(error.stack);
  } finally {
    // Kill the Allure server
    try {
      allureProcess.kill('SIGTERM');
      await new Promise(resolve => setTimeout(resolve, 2000));
      if (!allureProcess.killed) {
        allureProcess.kill('SIGKILL');
      }
    } catch (e) {
      console.log('⚠️ Could not kill Allure server');
    }
  }
}

generatePDF().catch(() => process.exit(1));