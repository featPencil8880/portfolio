import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test('resume pages, notes, feeds, and metadata are generated before JavaScript runs', async ({ browser, request }) => {
    const page = await browser.newPage({ javaScriptEnabled: false });

    await page.goto('/education.html');
    await expect(page.locator('#educationTimeline .education-card')).toHaveCount(1);
    await expect(page.locator('#educationTimeline')).toContainText('University of Manitoba');

    await page.goto('/experience.html');
    await expect(page.locator('#experienceTimeline .experience-card')).toHaveCount(1);
    await expect(page.locator('#experienceTimeline')).toContainText('Youth Mentor / Educator');

    await page.goto('/skills.html');
    await expect(page.locator('#skillsCard .skills-chip')).toHaveCount(8);
    await expect(page.locator('#hobbiesCard')).toContainText('Photography');

    await page.goto('/notes.html');
    await expect(page.locator('#notesIndex .notes-year-heading')).toHaveText('2026');
    await expect(page.locator('link[rel="alternate"][type="application/rss+xml"]')).toHaveAttribute('href', 'rss.xml');

    await page.goto('/notes/where-do-we-exist-in-our-minds/');
    await expect(page.locator('#noteArticle h1')).toHaveText('WHERE DO WE EXIST IN OUR MINDS?');
    await expect(page.locator('link[rel="alternate"][type="application/rss+xml"]')).toHaveAttribute('href', 'rss.xml');
    await expect(page.locator('#ogTitle')).toHaveAttribute('content', 'WHERE DO WE EXIST IN OUR MINDS? — IAN');
    expect(await page.locator('#noteJsonLd').textContent()).toContain('"@type":"BlogPosting"');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        'http://127.0.0.1:4173/notes/where-do-we-exist-in-our-minds/'
    );

    const sitemap = await request.get('/sitemap.xml');
    expect(await sitemap.text()).toContain('/notes/where-do-we-exist-in-our-minds/');
    const feed = await request.get('/rss.xml');
    expect(await feed.text()).toContain('<title>WHERE DO WE EXIST IN OUR MINDS?</title>');

    await page.close();
});

test('notes archive groups by year and keeps category and search filters working', async ({ page }) => {
    await page.goto('/notes.html');
    await expect(page.locator('body')).toHaveAttribute('data-rendered', 'true');
    await expect(page.locator('#notesIndex .notes-year-heading')).toHaveText('2026');

    await page.getByRole('button', { name: /introspection/i }).click();
    await expect(page.locator('#notesIndex .note-index-item')).toHaveCount(1);
    await page.locator('#notesSearch').fill('no matching note');
    await expect(page.locator('#notesIndex')).toContainText('No notes match that search.');
});

test('all primary pages initialize without JavaScript errors', async ({ page }) => {
    test.setTimeout(60_000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.stack || error.message));

    for (const path of [
        '/index.html', '/profile.html', '/education.html', '/experience.html',
        '/skills.html', '/survey.html', '/notes.html',
        '/notes/where-do-we-exist-in-our-minds/', '/404.html'
    ]) {
        await page.goto(path, { waitUntil: 'domcontentloaded' });
        try {
            await expect(page.locator('body')).toHaveAttribute('data-rendered', 'true', { timeout: 10000 });
        } catch (error) {
            throw new Error(`The page failed to initialize at ${path}. Page errors: ${errors.join(' | ')}\n${error.message}`);
        }
    }

    expect(errors).toEqual([]);
});

test('survey posts responses to Formspree and only shows thanks after success', async ({ page }) => {
    let submittedBody;
    await page.route('https://formspree.io/f/playwright-test', async route => {
        submittedBody = route.request().postDataJSON();
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ ok: true })
        });
    });

    await page.goto('/survey.html');
    await page.getByRole('button', { name: /start/i }).click();
    await page.locator('#surveyDynamicContent input[type="text"]').fill('Test visitor');
    await page.getByRole('button', { name: /next/i }).first().click();
    await page.locator('#surveyDynamicContent textarea').fill('The portfolio is easy to navigate.');
    await page.getByRole('button', { name: /submit/i }).first().click();

    await expect(page.locator('#surveyThanksCard')).toBeVisible();
    expect(submittedBody.respondent).toBe('Test visitor');
    expect(submittedBody.response).toContain('The portfolio is easy to navigate.');
});

test('survey keeps answers visible when Formspree rejects a response', async ({ page }) => {
    await page.route('https://formspree.io/f/playwright-test', route =>
        route.fulfill({ status: 503, body: 'Unavailable' }));

    await page.goto('/survey.html');
    await page.getByRole('button', { name: /start/i }).click();
    await page.locator('#surveyDynamicContent input[type="text"]').fill('Test visitor');
    await page.getByRole('button', { name: /next/i }).first().click();
    await page.locator('#surveyDynamicContent textarea').fill('Please keep this answer.');
    await page.getByRole('button', { name: /submit/i }).first().click();

    await expect(page.locator('#surveyThanksCard')).toBeHidden();
    await expect(page.locator('#surveySubmitStatus')).toContainText('HTTP 503');
    await expect(page.locator('#surveyDynamicContent textarea')).toHaveValue('Please keep this answer.');
});

test('Decap CMS configuration is served for the GitHub-backed editor', async ({ request }) => {
    const cmsPage = await request.get('/admin/');
    expect(cmsPage.ok()).toBeTruthy();
    expect(await cmsPage.text()).toContain('decap-cms');

    const config = await request.get('/admin/config.yml');
    expect(config.ok()).toBeTruthy();
    const configText = await config.text();
    expect(configText).toContain('repo: featPencil8880/portfoli');
    expect(configText).toContain('file: content.json');
    expect(configText).toContain('site_url: "http://127.0.0.1:4173"');
});

test('the local editor still opens and exports valid JSON', async ({ page }) => {
    await page.goto('/index.html?admin=1');
    await expect(page.locator('#adminBackdrop')).toBeVisible();
    const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.locator('#adminExportBtn').click()
    ]);

    expect(download.suggestedFilename()).toBe('content.json');
    const filePath = await download.path();
    const exported = JSON.parse(await readFile(filePath, 'utf8'));
    expect(exported.profile.name).toBe('IAN');
    expect(exported.posts[0].slug).toBe('where-do-we-exist-in-our-minds');
});

test('build creates responsive variants for the photo archive', async ({ request }) => {
    const manifestResponse = await request.get('/photos/manifest.json');
    expect(manifestResponse.ok()).toBeTruthy();
    const manifest = await manifestResponse.json();
    const photo = manifest['photos/polaroid/car.jpg'];
    expect(photo.avif).toContain('320w.avif 320w');
    expect(photo.webp).toContain('320w.webp 320w');

    const variant = await request.get('/photos/polaroid/car-320w.avif');
    expect(variant.ok()).toBeTruthy();
    expect(variant.headers()['content-type']).toBe('image/avif');
});
