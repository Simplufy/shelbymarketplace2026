const { chromium } = require('@playwright/test');

const BASE_URL = 'https://shelbymarketplace2026.vercel.app';

function randomEmail() {
  return `qa_dealer_${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`;
}

async function signup(email, password) {
  const response = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      firstName: 'QA',
      lastName: 'Dealer',
    }),
  });

  const body = await response.text();
  return { status: response.status, body };
}

async function runBrowser(email, password) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(`${BASE_URL}/login?redirect=%2Fdealers%2Fregister`, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Sign In")');

    await page.waitForURL(/\/dealers\/register/, { timeout: 20000 });

    await page.fill('input[placeholder="e.g. Shelby Performance Motors"]', 'QA Dealer Motors');
    await page.fill('input[placeholder="DL-12345678"]', 'DL-QA-2026-01');
    await page.fill('input[placeholder="https://yourdealer.com"]', 'https://qadealer.example.com');
    await page.fill('input[placeholder="(555) 123-4567"]', '(555) 111-2222');
    await page.fill('input[placeholder="City, State"]', 'Austin, TX');
    await page.click('button:has-text("Next")');

    await page.waitForSelector('h2:has-text("Required Documents")', { timeout: 15000 });

    const fileInputs = page.locator('input[type="file"]');
    const fileCount = await fileInputs.count();
    if (fileCount < 2) {
      throw new Error(`Expected at least 2 document upload inputs, got ${fileCount}`);
    }

    const testFile = 'E:/Pavel-Shelby-Project/public/images/logo.png';
    await fileInputs.nth(0).setInputFiles(testFile);
    await fileInputs.nth(1).setInputFiles(testFile);

    await page.waitForTimeout(2500);
    await page.click('button:has-text("Next")');

    await page.waitForSelector('h2:has-text("Select Your Plan")', { timeout: 15000 });
    await page.click('button:has-text("Review & Submit")');

    await page.waitForSelector('h2:has-text("Review Your Application")', { timeout: 15000 });
    await page.click('button:has-text("Complete Registration")');

    await page.waitForTimeout(5000);
    const finalUrl = page.url();
    const pageText = (await page.textContent('body')) || '';

    return {
      finalUrl,
      stripeRedirected:
        finalUrl.includes('checkout.stripe.com') ||
        finalUrl.includes('buy.stripe.com') ||
        pageText.includes('stripe.com'),
      pageSnippet: pageText.slice(0, 200),
    };
  } finally {
    await browser.close();
  }
}

(async () => {
  const email = randomEmail();
  const password = 'StrongPass123!';

  const signupResult = await signup(email, password);
  const browserResult = await runBrowser(email, password);

  console.log(
    JSON.stringify(
      {
        email,
        password,
        signupResult,
        browserResult,
      },
      null,
      2
    )
  );
})();
