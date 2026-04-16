const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('console', (msg) => console.log('BROWSER_LOG', msg.type(), msg.text()));
  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame()) {
      console.log('NAVIGATED', frame.url());
    }
  });

  page.on('response', async (resp) => {
    const url = resp.url();
    if (url.includes('/auth/v1/token') || url.includes('/auth/v1')) {
      let body = '';
      try {
        body = await resp.text();
      } catch {
        body = '';
      }
      console.log('AUTH_RESPONSE', resp.status(), url, body.slice(0, 180));
    }
  });

  await page.goto('https://shelbymarketplace2026.vercel.app/login?redirect=%2Fsell', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'mcguireflanigan@gmail.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button:has-text("Sign In")');
  await page.waitForTimeout(5000);

  const url = page.url();
  const error = await page.locator('div.bg-red-50').first().textContent().catch(() => null);
  const body = await page.textContent('body');
  const hasProfile = body ? body.includes('My Profile') : false;
  const cookies = await page.context().cookies('https://shelbymarketplace2026.vercel.app');
  const sbCookies = cookies.filter((c) => c.name.includes('sb-')).map((c) => c.name);

  console.log(JSON.stringify({ url, error, hasProfile, sbCookies }, null, 2));

  await browser.close();
})();
