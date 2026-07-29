// Headless UX check script
// Visits /skills and /exchanges, captures console logs, screenshots,
// and attempts to interact with actionable elements to reproduce
// missing-button or intermittent load issues.

const fs = require('fs');
const path = require('path');

async function run() {
  let playwright;
  try {
    playwright = require('playwright');
  } catch (e) {
    console.error('Playwright is not installed. Run `npm i -D playwright` first.');
    process.exit(2);
  }

  const outDir = path.join(process.cwd(), 'tmp', 'ux-check');
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await playwright.chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const base = process.env.BASE_URL || 'http://localhost:3000';

  // Try to create a test user via register endpoint so we can sign in
  const rnd = Date.now();
  const testEmail = `ux-test-${rnd}@example.com`;
  const testPassword = 'Password123!';
  try {
    const regResp = await context.request.post(base + '/api/auth/register', {
      data: { name: 'UX Tester', email: testEmail, password: testPassword },
    });
    console.log(`/api/auth/register -> ${regResp.status()} ${regResp.statusText()}`);
  } catch (e) {
    console.warn('Registration failed or is not available, continuing to sign-in attempt');
  }

  // Programmatic sign-in using NextAuth CSRF + credentials callback so we can
  // set the auth cookie into the browser context for subsequent UI checks.
  try {
    const csrf = await context.request.get(base + '/api/auth/csrf');
    const csrfJson = await csrf.json().catch(() => ({}));
    const csrfToken = csrfJson?.csrfToken;
    console.log(`/api/auth/csrf -> ${csrf.status()} token=${csrfToken ? 'ok' : 'missing'}`);

    if (csrfToken) {
      const cb = await context.request.post(base + '/api/auth/callback/credentials', {
        form: { csrfToken, email: testEmail, password: testPassword },
        // do not follow redirects so we can read Set-Cookie
        maxRedirects: 0,
      }).catch(() => null);

      if (cb) {
        console.log(`/api/auth/callback/credentials -> ${cb.status()}`);
        const setCookie = cb.headers()['set-cookie'];
        if (setCookie) {
          // Parse cookies and add them to browser context
          const cookies = [];
          const items = Array.isArray(setCookie) ? setCookie : [setCookie];
          for (const item of items) {
            const parts = item.split(';')[0].split('=');
            const name = parts.shift();
            const value = parts.join('=');
            cookies.push({ name, value, domain: 'localhost', path: '/', httpOnly: true });
          }
          await context.addCookies(cookies);
          console.log('Added cookies to browser context from credentials callback');
          const existing = await context.cookies();
          console.log('Browser context cookies:', existing.map(c => ({ name: c.name, value: c.value, domain: c.domain, path: c.path })));
        } else {
          console.log('No set-cookie in credentials response');
        }
      }
    }
  } catch (e) {
    console.warn('Programmatic sign-in failed:', e?.message || e);
  }

  const logs = [];
  page.on('console', msg => {
    const text = `[console:${msg.type()}] ${msg.text()}`;
    logs.push(text);
    console.log(text);
  });

  page.on('pageerror', err => {
    const text = `[pageerror] ${err.stack || err.message}`;
    logs.push(text);
    console.error(text);
  });

  // helper to visit and capture
  async function visitAndCapture(route, name) {
    console.log(`Visiting ${route}...`);
    await page.goto(base + route, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const ss = path.join(outDir, `${name}.png`);
    await page.screenshot({ path: ss, fullPage: true });
    console.log(`Saved screenshot ${ss}`);
    return ss;
  }

  // 1) /skills
  // Attempt to sign in first using credentials provider
  await page.goto(base + '/auth/signin', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  // fill credential form
  const emailInput = page.locator('input[name="email"]');
  const passInput = page.locator('input[name="password"]');
  if (await emailInput.count() > 0) {
    await emailInput.fill(testEmail);
    await passInput.fill(testPassword);
    const signInBtn = page.locator('button', { hasText: 'Sign in' });
    // monitor callback response
    const callbackRespPromise = page.waitForResponse(resp => resp.url().includes('/api/auth/callback/credentials') && resp.request().method() === 'POST', { timeout: 5000 }).catch(() => null);
    await signInBtn.click().catch(() => null);
    const callbackResp = await callbackRespPromise;
    if (callbackResp) {
      const text = await callbackResp.text().catch(() => '');
      console.log(`/api/auth/callback/credentials -> ${callbackResp.status()} body=${text.substring(0,200)}`);
    } else {
      console.log('No /api/auth/callback/credentials POST detected');
    }
    await page.waitForTimeout(500);
    // Check session via API
    try {
      const sessionResp = await context.request.get(base + '/api/auth/session');
      const sessionBody = await sessionResp.text();
      console.log(`/api/auth/session -> ${sessionResp.status()} ${sessionResp.statusText()} body=${sessionBody.substring(0,200)}`);
    } catch (e) {
      console.warn('Failed to fetch /api/auth/session after sign-in');
    }
  }

  await visitAndCapture('/skills', 'skills-before');

  // Try to find Add skill button
  const addBtn = page.locator('button', { hasText: 'Add skill' });
  if (await addBtn.count() > 0) {
    console.log('Add skill button found — attempting to submit a test skill');
    // fill fields if present
    const nameInput = page.locator('input[placeholder="Skill name"]');
    if (await nameInput.count() > 0) {
      await nameInput.fill('UX Check Skill');
    }

    // monitor network response for /api/skills
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/skills') && resp.request().method() === 'POST', { timeout: 5000 }).catch(() => null),
      addBtn.click().catch(() => null),
    ]);

    if (response) {
      console.log(`/api/skills POST -> ${response.status()} ${response.statusText()}`);
    } else {
      console.log('No POST to /api/skills detected (user may be unauthenticated or action failed)');
    }
    await page.waitForTimeout(500);
    await visitAndCapture('/skills', 'skills-after');
  } else {
    console.log('Add skill button not present (likely unauthenticated).');
  }

  // 2) Check Exchanges link in header
  // Try to find link element to /exchanges and click it
  const exchangesLink = page.locator('a[href="/exchanges"]');
  if (await exchangesLink.count() > 0) {
    console.log('Exchanges link present in header — attempting click');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 5000 }).catch(() => null),
      exchangesLink.first().click().catch(() => null),
    ]);
    await page.waitForTimeout(500);
    await visitAndCapture('/exchanges', 'exchanges-after');
  } else {
    console.log('Exchanges link not present in header (user likely not signed in).');
  }

  // Save logs
  fs.writeFileSync(path.join(outDir, 'console.log'), logs.join('\n'));
  console.log(`Wrote logs to ${path.join(outDir, 'console.log')}`);

  await browser.close();
}

run().catch(err => { console.error(err); process.exit(1); });
