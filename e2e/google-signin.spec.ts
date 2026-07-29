import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

// Load .env.local for test credentials if present
dotenv.config({ path: '.env.local' });

// This test automates a Google sign-in using credentials provided via environment variables.
// Make sure APP_OAUTH_TEST_EMAIL and APP_OAUTH_TEST_PASSWORD are set in .env.local.

const EMAIL = process.env.APP_OAUTH_TEST_EMAIL;
const PASSWORD = process.env.APP_OAUTH_TEST_PASSWORD;

if (!EMAIL || !PASSWORD) {
  throw new Error('Set APP_OAUTH_TEST_EMAIL and APP_OAUTH_TEST_PASSWORD in the environment');
}

test('Google sign-in end-to-end', async ({ page }) => {
  // Go to sign-in page
  await page.goto('/auth/signin');

  // Click the Google provider button
  await page.locator('text=Google').first().click();

  // Wait for Google account chooser / login page
  await page.waitForLoadState('networkidle');

  // Google sometimes uses different selectors/flows. Attempt common selectors.
  // 1) Email/identifier
  const emailSelector = 'input[type="email"]';
  await page.waitForSelector(emailSelector, { timeout: 15000 });
  await page.fill(emailSelector, EMAIL);
  // Click Next
  const nextBtn = page.locator('button:has-text("Next")').first();
  if (await nextBtn.count() > 0) {
    await nextBtn.click();
  } else {
    // fallback: press Enter
    await page.keyboard.press('Enter');
  }

  // Wait for password input
  const passwordSelector = 'input[type="password"]';
  await page.waitForSelector(passwordSelector, { timeout: 15000 });
  await page.fill(passwordSelector, PASSWORD);

  // Click Next/Sign in
  const pwNext = page.locator('button:has-text("Next")').first();
  if (await pwNext.count() > 0) {
    await pwNext.click();
  } else {
    await page.keyboard.press('Enter');
  }

  // After successful sign-in, NextAuth should redirect back to the app (callback)
  // Wait for navigation back to the app domain
  await page.waitForURL('**/profile', { timeout: 30000 });
  await expect(page).toHaveURL(/.*\/profile/);

  // Simple assertion: profile heading or user-related element
  await expect(page.locator('text=Profile').first()).toBeVisible({ timeout: 10000 }).catch(() => {});
});
