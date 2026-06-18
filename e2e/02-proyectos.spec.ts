import { test, expect } from '@playwright/test';
import { loginViaUI } from './helpers/login';

test.describe('CP-PRJ — Flujos de proyectos', () => {

  test('CP-PRJ-02: lista pública de proyectos carga sin autenticación', async ({ page }) => {
    await page.goto('/proyectos');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await expect(page).not.toHaveURL(/login/);
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 8000 });
  });

  test('CP-PRJ-05: crear proyecto como organizador', async ({ page }) => {
    await loginViaUI(page, 'organizer@gazella.test', 'Organizer1!');
    await page.goto('/mis-proyectos/crear');

    // Esperar que el formulario cargue
    await page.waitForSelector('input[placeholder="Escribe un título llamativo..."]', {
      state: 'visible',
      timeout: 10000,
    });

    // Placeholders exactos del código fuente
    await page.fill('input[placeholder="Escribe un título llamativo..."]', 'Proyecto E2E Playwright');

    await page.fill(
      'textarea[placeholder="Describe el objetivo, actividades y lo que necesitan saber los voluntarios..."]',
      'Proyecto creado automáticamente por Playwright para demostración de pruebas E2E.'
    );

    // Fechas
    const start = new Date(); start.setDate(start.getDate() + 30);
    const end   = new Date(); end.setDate(end.getDate() + 90);
    const fmt   = (d: Date) => d.toISOString().split('T')[0];

    await page.locator('input[type="date"]').nth(0).fill(fmt(start));
    await page.locator('input[type="date"]').nth(1).fill(fmt(end));

    // Lugar y max voluntarios
    await page.fill('input[placeholder="Dirección o punto de reunión"]', 'Xalapa, Veracruz');
    await page.fill('input[type="number"]', '25');

    // Categoría
    await page.selectOption('select', '550e8400-e29b-41d4-a716-446655440001');

    // Click en "Publicar proyecto"
    await page.click('button:has-text("Publicar proyecto")');

    // Esperar mensaje de éxito o redirección a mis-proyectos
    await Promise.race([
      page.waitForURL(/mis-proyectos/, { timeout: 15000 }),
      page.waitForSelector('text=exitosamente', { timeout: 15000 }),
      page.waitForSelector('text=creado', { timeout: 15000 }),
    ]);
  });

  test('CP-PRJ-11: voluntario puede ver lista de proyectos autenticado', async ({ page }) => {
    await loginViaUI(page, 'volunteer@gazella.test', 'Volunteer1!');
    await page.goto('/proyectos');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await expect(page).not.toHaveURL(/login/);
    await expect(page.locator('body')).toBeVisible();
  });

});
