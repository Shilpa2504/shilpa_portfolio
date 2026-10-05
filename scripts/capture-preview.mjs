import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

await mkdir('test-results/visual-review', { recursive: true });
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || undefined });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  await page.goto(process.env.PREVIEW_URL || 'http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'test-results/visual-review/desktop.png' });
  await page.locator('#projects').screenshot({ path: 'test-results/visual-review/projects.png' });
  await page.locator('.project-pizzeria').getByRole('button', { name: 'View case study', exact: true }).click();
  await page.getByRole('dialog').waitFor();
  await page.screenshot({ path: 'test-results/visual-review/case-study.png' });
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({ state: 'detached' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(process.env.PREVIEW_URL || 'http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'test-results/visual-review/mobile.png' });
  await page.locator('.project-pizzeria').screenshot({ path: 'test-results/visual-review/mobile-project.png' });
  console.log('Visual review captures saved to test-results/visual-review.');
} finally { await browser.close(); }