import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('page navigation and all internal links are valid', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page).toHaveTitle(/Shilpa Gupta/);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('.project-card')).toHaveCount(3);
  const broken = await page.locator('a[href^="#"]').evaluateAll(elements => elements.map(el => el.getAttribute('href')!).filter(href => !document.getElementById(href.slice(1))));
  expect(broken).toEqual([]);
  await page.getByRole('link', { name: 'Explore my work' }).click();
  await expect(page).toHaveURL(/#projects$/);
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Projects' })).toHaveAttribute('aria-current', 'location');
  expect(errors).toEqual([]);
});

for (const name of ['StudyMate.AI', 'AI-Powered Pizzeria', 'NewsApp']) {
  test(`${name} dialog supports keyboard close and restores focus`, async ({ page }) => {
    await page.goto('/');
    const card = page.locator('.project-card').filter({ has: page.getByRole('heading', { name, exact: true }) });
    const trigger = card.getByRole('button', { name: 'View case study', exact: true });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name, exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Close case study' })).toBeFocused();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');
    await expect(dialog.locator('.case-section')).toHaveCount(6);
    await page.keyboard.press('Shift+Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('dialog'))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
  });
}

test('NewsApp concept search, categories, and bookmarking work', async ({ page }) => {
  await page.goto('/');
  await page.locator('.project-newsapp').getByRole('button', { name: 'View case study', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText(/NOT AN ORIGINAL APP SCREENSHOT/)).toBeVisible();
  await dialog.getByRole('button', { name: 'Science', exact: true }).click();
  await expect(dialog.locator('.news-article')).toHaveCount(1);
  await dialog.getByRole('button', { name: /^Bookmark New perspectives/ }).click();
  await dialog.getByRole('button', { name: 'Saved', exact: true }).click();
  await expect(dialog.locator('.news-article')).toHaveCount(1);
  await dialog.getByRole('button', { name: /^Remove bookmark/ }).click();
  await expect(dialog.getByRole('status')).toHaveText('Bookmark a concept story to see it here.');
  await dialog.getByRole('button', { name: 'For you', exact: true }).click();
  await dialog.getByRole('textbox', { name: 'Search concept stories' }).fill('business');
  await expect(dialog.locator('.news-article')).toHaveCount(1);
});

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`layout and dialogs fit a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    for (const project of ['studymate', 'pizzeria', 'newsapp']) {
      await page.locator(`.project-${project}`).getByRole('button', { name: 'View case study', exact: true }).click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
    }
  });
}

test('mobile menu is keyboard accessible and closes after navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const toggle = page.getByRole('button', { name: /^(Open|Close) navigation$/ });
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
  await toggle.click();
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: /Projects/ }).click();
  await expect(page).toHaveURL(/#projects$/);
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toHaveCount(0);
  await expect(page.locator('#projects')).toBeFocused();
});

test('reduced motion disables smooth scrolling and hero movement', async ({ page }) => {
  await page.goto('/');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  expect(await page.locator('h1').evaluate(el => getComputedStyle(el).transform)).toBe('none');
});

test('contact email can be copied', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await page.getByRole('button', { name: 'Copy email address' }).click();
  await expect(page.locator('.copy-status')).toHaveText('Email copied to clipboard.');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('shilpakalwar25@gmail.com');
});

test('view resume points to the supplied original PDF', async ({ page, request }) => {
  await page.goto('/');
  const resume = page.getByRole('link', { name: 'View resume' });
  await expect(resume).toHaveAttribute('href', '/assets/shilpa_Gupta.pdf');
  const response = await request.get((await resume.getAttribute('href'))!);
  expect(response.ok()).toBe(true);
  expect(response.headers()['content-type']).toContain('application/pdf');
  expect((await response.body()).subarray(0, 5).toString()).toBe('%PDF-');
});

test('resume download and social image are real production assets', async ({ page, request }) => {
  const pdf = await request.get('/assets/shilpa_Gupta.pdf');
  expect(pdf.ok()).toBe(true);
  expect((await pdf.body()).subarray(0, 5).toString()).toBe('%PDF-');
  const image = await request.get('/social-card.png');
  expect(image.ok()).toBe(true);
  expect(image.headers()['content-type']).toContain('image/png');
  await page.goto('/');
  const downloaded = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download resume' }).click();
  const download = await downloaded;
  expect(download.suggestedFilename()).toBe('shilpa_Gupta.pdf');
});

test('supplied portrait and both project galleries load their actual images', async ({ page }) => {
  await page.goto('/');
  const portrait = page.locator('.portrait-frame img');
  await expect(portrait).toBeVisible();
  await expect.poll(() => portrait.evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  for (const [id, count] of [['studymate', 8], ['pizzeria', 10]] as const) {
    const card = page.locator(`.project-${id}`);
    const preview = card.locator('.real-screenshot img');
    await preview.scrollIntoViewIfNeeded();
    await expect.poll(() => preview.evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await card.getByRole('button', { name: 'View case study', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.locator('.gallery-thumbnail')).toHaveCount(count);
    for (let index = 0; index < count; index += 1) {
      await dialog.locator('.gallery-thumbnail').nth(index).click();
      await expect(dialog.locator('.gallery-thumbnail').nth(index)).toHaveAttribute('aria-pressed', 'true');
      await expect.poll(() => dialog.locator('figure > img').evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    }
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  }
});

test('page and each case study meet automated WCAG AA checks', async ({ page }) => {
  await page.goto('/');
  const audit = async () => {
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(results.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) }))).toEqual([]);
  };
  await audit();
  for (const project of ['studymate', 'pizzeria', 'newsapp']) {
    await page.locator(`.project-${project}`).getByRole('button', { name: 'View case study', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await audit();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  }
});