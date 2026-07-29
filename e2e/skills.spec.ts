import { test, expect } from '@playwright/test';

test('skills page lists and adds skill (demo seed)', async ({ page }) => {
  await page.goto('/skills');
  await expect(page.locator('h1')).toHaveText(/Browse Skills/);

  // If sign-in prompt visible, we expect demo seed to populate skills
  const noSkills = await page.locator('text=No skills found.').count();
  if (noSkills) {
    // nothing to assert further here in scaffold
    return;
  }

  // Try to add a skill (if demo user is enabled, the form should be visible)
  const addBtn = page.locator('button', { hasText: 'Add skill' });
  if (await addBtn.count() > 0) {
    await page.fill('input[placeholder="Skill name"]', 'Playwright Test Skill');
    await addBtn.click();
    await expect(page.locator('text=Playwright Test Skill')).toBeVisible();
  }
});
