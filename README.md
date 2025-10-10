# Playwright Setup & Usage (VS Code)

This project uses [Playwright](https://playwright.dev/) for end-to-end testing.  
Follow the guide below to install, run tests, and generate reports in **VS Code**.

---

## 🚀 Installation

1. **Clone the repository**  
   ```bash
   git clone <repo-url>
   cd <repo-folder>
   ```

2. **Install dependencies**  
   ```bash
   npm install
   ```

3. **Install Playwright browsers** (Chromium, Firefox, WebKit)  
   ```bash
   npx playwright install
   ```

---

## 🧪 Running Tests

- Run all tests:  
  ```bash
  npx playwright test
  ```

- Run a single test file (example: `signup.spec.ts`):  
  ```bash
  npx playwright test signup.spec.ts
  ```

- Run on a specific browser (Chromium only):  
  ```bash
  npx playwright test signup.spec.ts --project=chromium
  ```

- Run in headed mode (see the browser):  
  ```bash
  npx playwright test signup.spec.ts --headed
  ```

- Run tests with UI mode:  
  ```bash
  npx playwright test --ui
  ```

---

## 📊 Test Reports

- Run with HTML report:  
  ```bash
  npx playwright test --reporter=html
  ```

- Show the last HTML report:  
  ```bash
  npx playwright show-report
  ```

- Save report in a custom folder:  
  ```bash
  npx playwright test --reporter=html --output=reports/signup
  ```

- Export as PDF for Jira:  
  Open the `playwright-report/index.html` in your browser → **Print → Save as PDF**.

---

## 🛠 VS Code Tips

- Install the **Playwright Test for VS Code** extension.  
  - Provides test explorer in the sidebar.  
  - Allows you to run/debug tests directly from VS Code.  
  - Shows test results inline.  

- Debugging:  
  Add a `debug` flag in a test:
  ```ts
  test('debug signup flow', async ({ page }) => {
    await page.pause(); // opens Playwright Inspector
  });
  ```

---

## ⚙️ Configuration

- Main config file: `playwright.config.ts`  
- Example snippet:
  ```ts
  import { defineConfig } from '@playwright/test';

  export default defineConfig({
    testDir: './tests',
    timeout: 30 * 1000,
    retries: 1,
    reporter: [['list'], ['html', { open: 'never' }]],
    use: {
      baseURL: 'http://localhost:3000',
      headless: true,
    },
  });
  ```

---

✅ With this setup you can:  
- Write and run Playwright tests inside VS Code.  
- Generate reports for Jira.  
- Debug with Playwright Inspector.  
