import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';
import { createMediaManifest } from '../scripts/media-manifest.mjs';

const source = readFileSync(new URL('../src/data.ts', import.meta.url), 'utf8');
const mediaSource = readFileSync(new URL('../src/media.ts', import.meta.url), 'utf8');
const compilerOptions = { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 };
const manifest = createMediaManifest(resolve('public/uploads'));
const compiledMedia = ts.transpileModule(mediaSource, { compilerOptions }).outputText.replace('__PORTFOLIO_MEDIA__', JSON.stringify(manifest));
const mediaModule = `data:text/javascript;base64,${Buffer.from(compiledMedia).toString('base64')}`;
const compiled = ts.transpileModule(source, { compilerOptions }).outputText.replace("'./media'", `'${mediaModule}'`);
const { projects, experience, awards, skills, links, navigation } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

test('exactly the three supplied projects are represented', () => {
  assert.deepEqual(projects.map(p => p.name), ['StudyMate.AI', 'AI-Powered Pizzeria', 'NewsApp']);
  assert.equal(new Set(projects.map(p => p.id)).size, 3);
});
test('every case study contains complete and distinct engineering content', () => {
  for (const project of projects) {
    for (const key of ['problem', 'solution', 'architecture', 'optimization', 'deployment']) assert.ok(project[key].length > 30, `${project.id}: ${key}`);
    assert.ok(project.features.length >= 5);
    assert.ok(project.flows.length >= 2);
    assert.ok(project.challenges.length >= 2);
    assert.ok(project.implementation.length >= 4);
    assert.ok(project.stack.length >= 5);
  }
  assert.equal(new Set(projects.map(p => p.description)).size, 3);
});
test('live demos and verified repositories use the supplied accounts', () => {
  assert.equal(projects[0].live, 'https://study-mate-ai-six.vercel.app/');
  assert.equal(projects[1].live, 'https://pizzeria-ashen-alpha.vercel.app/');
  assert.equal(projects[0].github, 'https://github.com/Shilpa2504/StudyMate.AI');
  assert.equal(projects[1].github, 'https://github.com/Shilpa2504/Pizzeria');
  assert.equal(projects[2].live, undefined);
  for (const p of projects) for (const url of [p.live, p.github].filter(Boolean)) assert.equal(new URL(url).protocol, 'https:');
});
test('screenshots, when added, have real assets and meaningful descriptions', () => {
  for (const project of projects) for (const image of project.screenshots) {
    assert.ok(image.alt.length > 15);
    assert.ok(image.caption.length > 5);
    assert.ok(image.src.startsWith('/') && !image.src.includes('..'));
    assert.ok(existsSync(resolve('public', decodeURIComponent(image.src.slice(1)))), image.src);
  }
});
test('only the supplied employers and recognitions appear', () => {
  assert.deepEqual(experience.map(e => e.company), ['Accenture', 'FindInbox Limited']);
  assert.equal(awards.length, 3);
  assert.deepEqual(awards.map(a => a.date), ['February 2026', 'December 2025', 'December 2025']);
  assert.equal(experience[0].period, 'Nov 2024 — Present');
});
test('navigation, toolkit, and contact data are complete', () => {
  assert.deepEqual(navigation.map(item => item.id), ['home', 'about', 'experience', 'projects', 'skills', 'education', 'certifications', 'achievements', 'contact']);
  assert.ok(skills.flatMap(group => group.items).includes('C#'));
  assert.ok(skills.flatMap(group => group.items).includes('.NET'));
  assert.doesNotMatch(source, /Gemini/);
  assert.equal(skills.length, 7);
  assert.equal(links.email, 'mailto:shilpakalwar25@gmail.com');
  assert.ok(existsSync(resolve('public', decodeURIComponent(links.resume.slice(1)))));
  assert.ok(!source.includes('Lorem ipsum'));
});
test('the document has semantic metadata and no invented canonical domain', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /<html lang="en">/);
  assert.match(html, /name="description"/);
  assert.match(html, /property="og:title"/);
  assert.match(html, /application\/ld\+json/);
  assert.doesNotMatch(html, /example\.com|your-domain/);
});