import { test, expect, devices } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'https://shelbymarketplace2026.vercel.app';
const EMAIL = process.env.E2E_EMAIL;
const PASSWORD = process.env.E2E_PASSWORD;

async function gotoReady(page: any, path: string) {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
}

async function login(page: any, redirect = '/') {
  if (!EMAIL || !PASSWORD) {
    throw new Error('Set E2E_EMAIL and E2E_PASSWORD to run authenticated smoke tests.');
  }

  await gotoReady(page, `/login?redirect=${encodeURIComponent(redirect)}`);
  await page.getByPlaceholder('you@example.com').fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();
}

test('unauthenticated users are redirected from protected admin route', async ({ page }) => {
  await gotoReady(page, '/admin');
  await expect(page).toHaveURL(/\/login\?redirect=%2Fadmin/);
});

test('authenticated user can access sell wizard', async ({ page }) => {
  test.skip(!EMAIL || !PASSWORD, 'Set E2E_EMAIL and E2E_PASSWORD to run authenticated smoke tests.');
  await login(page, '/sell');
  await expect(page).toHaveURL(/\/sell/);
  await expect(page.getByRole('heading', { name: 'Sell Your Shelby', exact: true })).toBeVisible();
});

test('listing contact CTA behaves for auth/unauth states', async ({ page, request }) => {
  test.setTimeout(90000);

  const apiRes = await request.get(`${BASE_URL}/api/listings?page=1&pageSize=1`);
  expect(apiRes.status()).toBe(200);
  const apiPayload = await apiRes.json();
  const listingId = apiPayload?.data?.[0]?.id;
  expect(Boolean(listingId)).toBeTruthy();

  await gotoReady(page, `/listings/${listingId}`);

  await expect
    .poll(async () => {
      const body = (await page.textContent('body')) || '';
      return (
        body.includes('Create Account to Contact Seller') ||
        body.includes('Email Seller') ||
        body.includes('Contact Seller')
      );
    }, { timeout: 30000 })
    .toBeTruthy();

  if (EMAIL && PASSWORD) {
    await login(page, `/listings/${listingId}`);
    await expect(page).toHaveURL(new RegExp(`/listings/${listingId}`));
    const authBody = (await page.textContent('body')) || '';
    expect(authBody.includes('Email Seller') || authBody.includes('Contact Seller')).toBeTruthy();
  }
});

test('all six Klaviyo events accept full payload schema', async ({ request }) => {
  const events = [
    'Viewed listing',
    'New listing created',
    'Listing approved',
    'Price drop',
    'Contact seller',
    'User signup',
  ];

  for (const event of events) {
    const response = await request.post(`${BASE_URL}/api/klaviyo/track`, {
      data: {
        event,
        profile: { email: 'qa-events@example.com', first_name: 'QA', last_name: 'Bot' },
        properties: {
          vehicle_name: '2022 Ford Shelby GT500',
          price: 105000,
          image: 'https://example.com/car.jpg',
          url: `${BASE_URL}/listings/test-id`,
          location: 'Las Vegas, NV',
        },
      },
    });
    expect(response.status(), `${event} should return 200`).toBe(200);
  }
});

test.describe('mobile smoke', () => {
  const iphone = devices['iPhone 13'];
  test.use({ viewport: iphone.viewport, userAgent: iphone.userAgent, deviceScaleFactor: iphone.deviceScaleFactor, isMobile: iphone.isMobile, hasTouch: iphone.hasTouch });

  test('mobile home and listings load with key CTAs visible', async ({ page }) => {
    test.setTimeout(90000);

    await gotoReady(page, '/');
    await expect(page.getByRole('button', { name: /search inventory/i })).toBeVisible();

    await gotoReady(page, '/listings');
    await expect(page.getByRole('button', { name: 'Filters' })).toBeVisible({ timeout: 30000 });
  });
});
