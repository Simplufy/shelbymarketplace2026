import { test, expect, devices } from '@playwright/test';

const BASE_URL = 'https://shelbymarketplace2026.vercel.app';
const EMAIL = 'mcguireflanigan@gmail.com';
const PASSWORD = 'password';

async function login(page: any, redirect = '/') {
  await page.goto(`${BASE_URL}/login?redirect=${encodeURIComponent(redirect)}`);
  await page.getByPlaceholder('you@example.com').fill(EMAIL);
  await page.getByPlaceholder('••••••••').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();
}

test('unauthenticated users are redirected from protected admin route', async ({ page }) => {
  await page.goto(`${BASE_URL}/admin`);
  await expect(page).toHaveURL(/\/login\?redirect=%2Fadmin/);
});

test('authenticated user can access sell wizard', async ({ page }) => {
  await login(page, '/sell');
  await expect(page).toHaveURL(/\/sell/);
  await expect(page.getByRole('heading', { name: 'Sell Your Shelby' })).toBeVisible();
});

test('listing contact CTA behaves for auth/unauth states', async ({ page, request }) => {
  const apiRes = await request.get(`${BASE_URL}/api/listings?page=1&pageSize=1`);
  expect(apiRes.status()).toBe(200);
  const apiPayload = await apiRes.json();
  const listingId = apiPayload?.data?.[0]?.id;
  expect(Boolean(listingId)).toBeTruthy();

  await page.goto(`${BASE_URL}/listings/${listingId}`);
  await page.waitForLoadState('networkidle');

  await expect
    .poll(async () => {
      const body = (await page.textContent('body')) || '';
      return (
        body.includes('Create Account to Contact Seller') ||
        body.includes('Email Seller') ||
        body.includes('Contact Seller')
      );
    })
    .toBeTruthy();

  await login(page, `/listings/${listingId}`);
  await expect(page).toHaveURL(new RegExp(`/listings/${listingId}`));
  await page.waitForLoadState('networkidle');
  const authBody = (await page.textContent('body')) || '';
  expect(authBody.includes('Email Seller') || authBody.includes('Contact Seller')).toBeTruthy();
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
    await page.goto(`${BASE_URL}/`);
    await expect(page.getByText('Find the spec nobody else can.')).toBeVisible();

    await page.goto(`${BASE_URL}/listings`);
    await expect(page.getByRole('button', { name: 'Filters' })).toBeVisible();
  });
});
