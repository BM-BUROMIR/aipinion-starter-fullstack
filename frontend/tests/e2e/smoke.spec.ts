import { test, expect } from '@playwright/test';

test('loads the app and shows login screen', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Welcome')).toBeVisible();
  await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
});
