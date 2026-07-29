// Simple headless check using Playwright to validate header behaviour
// This script attempts to open the app at multiple viewports and
// reports whether the desktop nav (text=Skills) or mobile header
// (menu button / Sign In text) is visible after hydration.

const fs = require('fs');
const path = require('path');

async function run() {
  let playwright;
  try {
    playwright = require('playwright');
  } catch (e) {
    console.error('Playwright is not installed. Run `npm i -D playwright` first.');
    process.exit(2);
  }

  const browser = await playwright.chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const base = process.env.BASE_URL || 'http://localhost:3002';
  const sizes = [
    { name: 'mobile', width: 375, height: 800 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 800 },
  ];

  const outDir = path.join(process.cwd(), 'tmp', 'header-check');
  fs.mkdirSync(outDir, { recursive: true });

  for (const s of sizes) {
    console.log(`Checking ${s.name} ${s.width}x${s.height}...`);
    await page.setViewportSize({ width: s.width, height: s.height });
    await page.goto(base, { waitUntil: 'networkidle' });

    // Wait briefly for client-side hydration to mount Header
    await page.waitForTimeout(500);

    // More robust checks:
    const navCount = await page.locator('nav').count().catch(() => 0);
    const navVisible = navCount > 0 && await page.locator('nav').first().isVisible().catch(() => false);
    const logoCount = await page.locator('text=SkillBarter').count().catch(() => 0);
    const mobileMenuButtons = await page.locator('button').filter({ has: page.locator('svg') }).count().catch(() => 0);

    const screenshotPath = path.join(outDir, `header-${s.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    console.log(`${s.name}: navCount=${navCount}, navVisible=${navVisible}, logoCount=${logoCount}, menuButtons=${mobileMenuButtons}, screenshot=${screenshotPath}`);
  }

  await browser.close();
}

run().catch(err => { console.error(err); process.exit(1); });
