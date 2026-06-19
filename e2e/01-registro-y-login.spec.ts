import { test, expect } from '@playwright/test';
import { loginViaUI } from './helpers/login';

const TEST_EMAIL    = `playwright_${Date.now()}@prueba.com`;
const TEST_PASSWORD = 'Prueba1234!';

test.describe('CP-IDP-01 + CP-CLI-01 — Registro y login', () => {

  test('CP-IDP-01: registro de usuario nuevo — API retorna 201', async ({ request }) => {
    const response = await request.post('http://localhost:4000/api/auth/registration', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        name: 'Playwright',
        parentalSurname: 'Tester',
      },
    });

    const body = await response.json();
    console.log('Status:', response.status(), '| Body:', JSON.stringify(body));

    expect(response.status()).toBe(201);
  });

  test('CP-IDP-02: registro con email duplicado retorna 409', async ({ request }) => {
    const response = await request.post('http://localhost:4000/api/auth/registration', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        email: 'organizer@gazella.test',
        password: TEST_PASSWORD,
        name: 'Duplicado',
      },
    });

    expect(response.status()).toBe(409);
    const body = await response.json();
    console.log('Respuesta duplicado:', JSON.stringify(body));
  });

  test('CP-CLI-06: ruta protegida sin sesión redirige a login', async ({ page }) => {
    await page.goto('/mis-proyectos');
    await expect(page).toHaveURL(/login/, { timeout: 5000 });
  });

  test('CP-CLI-01: login con credenciales válidas llega a dashboard', async ({ page }) => {
    await loginViaUI(page, 'organizer@gazella.test', 'Organizer1!');
    await expect(page).toHaveURL(/dashboard/);
  });

});
