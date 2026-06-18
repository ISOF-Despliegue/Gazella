import { Page } from '@playwright/test';

export async function loginViaUI(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.waitForSelector('input[type="email"]', { state: 'visible', timeout: 10000 });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button:has-text("Ingresar")');

  await page.waitForFunction(
    () => localStorage.getItem('gazella_access_token') !== null,
    { timeout: 15000 }
  );

  await page.waitForURL(/dashboard/, { timeout: 10000 });
}