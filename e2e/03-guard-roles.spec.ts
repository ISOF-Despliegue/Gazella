import { test, expect } from '@playwright/test';
import { loginViaUI } from './helpers/login';

test.describe('CP-CLI-06 — Guards de rol', () => {

  test('voluntario bloqueado de /mis-proyectos/crear — redirige a dashboard', async ({ page }) => {
    await loginViaUI(page, 'volunteer@gazella.test', 'Volunteer1!');
    await page.goto('/mis-proyectos/crear');
    await expect(page).toHaveURL(/dashboard/, { timeout: 8000 });
  });

  test('organizador bloqueado de /editor/articulos — redirige a dashboard', async ({ page }) => {
    await loginViaUI(page, 'organizer@gazella.test', 'Organizer1!');
    await page.goto('/editor/articulos');
    await expect(page).toHaveURL(/dashboard/, { timeout: 8000 });
  });

  test('sin sesión, /perfil redirige a login', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/perfil');
    await expect(page).toHaveURL(/login/, { timeout: 5000 });
  });

});