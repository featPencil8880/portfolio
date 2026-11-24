import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test('resume pages, notes, feeds, and metadata are generated before JavaScript runs', async ({ browser, request }) => {
    test.setTimeout(60_000);
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

    await page.goto('/index.html');
    await expect(page.locator('.hero-actions a')).toHaveText(['Explore My Profile', 'Leave Feedback']);

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

test('hidden notes do not create home label chips or inflate their counts', async ({ page }) => {
    await page.addInitScript(() => {
        const note = (id, title, hideFromList = false) => ({
            id,
            date: '2026-11-15',
            tab: 'home',
            label: 'introspection',
            hideFromList,
            fields: [{ name: 'Note', blocks: [{ type: 'title', content: title }] }]
        });
        localStorage.setItem('portfolioContent', JSON.stringify({
            posts: [
                note('hidden-note', 'Hidden note', true),
                note('visible-note', 'Visible note')
            ]
        }));
    });

    await page.goto('/index.html');
    await expect(page.locator('.post-card')).toHaveCount(1);
    await expect(page.locator('.post-card-title')).toHaveText('Visible note');
    await expect(page.locator('#postFilterChips .chip-count')).toHaveText('1');
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

test('survey inputs and choice groups expose their labels accessibly', async ({ page }) => {
    await page.goto('/survey.html');
    await page.getByRole('button', { name: /start/i }).click();

    await expect(page.getByLabel('Your name')).toBeVisible();
    await expect(page.getByLabel('Your name')).toHaveAttribute('autocomplete', 'name');
    await expect(page.getByLabel('Your name')).toHaveAttribute('inputmode', 'text');
    await expect(page.getByLabel('Your email')).toHaveAttribute('autocomplete', 'email');
    await expect(page.getByLabel('Your email')).toHaveAttribute('inputmode', 'email');
    await expect(page.getByRole('radiogroup', { name: /how do you know me/i })).toBeVisible();

    await page.getByLabel('Your name').fill('Test visitor');
    await page.getByRole('button', { name: /next/i }).first().click();
    await expect(page.getByRole('radiogroup', { name: /rate this site/i })).toBeVisible();
});

test('survey rejects malformed optional email addresses and explains the error', async ({ page }) => {
    await page.goto('/survey.html');
    await page.getByRole('button', { name: /start/i }).click();
    await page.getByLabel('Your name').fill('Test visitor');
    const email = page.getByLabel('Your email');
    await email.fill('not-an-email');
    await page.getByRole('button', { name: /next/i }).first().click();

    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#survey-email-error-0-2')).toBeVisible();
    await expect(page.locator('.survey-progress').first()).toHaveText('1 / 2');

    await email.fill('visitor@example.com');
    await page.getByRole('button', { name: /next/i }).first().click();
    await expect(page.locator('.survey-progress').first()).toHaveText('2 / 2');
});

test('calendar arrow keys move by day and selected dates are announced', async ({ page }) => {
    await page.goto('/index.html');
    const firstDay = page.locator('#calendarGrid .calendar-day[data-date]').first();
    await firstDay.focus();
    const firstDate = await firstDay.getAttribute('data-date');
    const expectedDate = await page.evaluate(dateKey => {
        const [year, month, day] = dateKey.split('-').map(Number);
        const next = new Date(year, month - 1, day + 1);
        return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`;
    }, firstDate);

    await page.keyboard.press('ArrowRight');
    const focusedDay = page.locator('#calendarGrid .calendar-day[data-date]:focus');
    await expect(focusedDay).toHaveAttribute('data-date', expectedDate);
    await page.keyboard.press('Enter');

    const announcedDate = await page.evaluate(dateKey => {
        const [year, month, day] = dateKey.split('-').map(Number);
        return new Date(year, month - 1, day).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }, expectedDate);
    await expect(page.locator('#wordedDate')).toHaveAttribute('aria-live', 'polite');
    await expect(page.locator('#wordedDate')).toHaveText(announcedDate);
});

test('reading a note updates the document title and restores it on close', async ({ page }) => {
    await page.goto('/index.html');
    const originalTitle = await page.title();
    const card = page.locator('.post-card').first();
    await card.focus();
    await page.keyboard.press('Enter');

    await expect(page).toHaveTitle('WHERE DO WE EXIST IN OUR MINDS? — IAN');
    await page.keyboard.press('Escape');
    await expect(page).toHaveTitle(originalTitle);
});

test('each cognitive game explains that results are informal', async ({ page }) => {
    for (const path of ['/games/memory.html', '/games/reaction.html', '/games/stroop.html']) {
        await page.goto(path);
        await expect(page.locator('.game-caveat')).toContainText(/informal|casual/i);
        await expect(page.locator('.game-caveat')).toContainText(/not a validated/i);
    }
});

test('untrusted profile and document links with unsafe schemes are omitted', async ({ page }) => {
    await page.addInitScript(() => {
        localStorage.setItem('portfolioContent', JSON.stringify({
            profile: {
                name: 'Test',
                actions: [
                    { label: 'Unsafe', href: 'javascript:blocked' },
                    { label: 'Safe', href: 'https://example.com/' }
                ],
                linkedin: 'javascript:blocked'
            },
            experience: [{
                position: 'Test role',
                organization: 'Test organization',
                years: '2020–2021',
                documents: [
                    { title: 'Unsafe document', path: 'data:text/html,blocked' },
                    { title: 'Safe document', path: 'https://example.com/document.pdf' }
                ]
            }]
        }));
    });

    await page.goto('/profile.html');
    await expect(page.locator('#profileActions a')).toHaveCount(1);
    await expect(page.locator('#profileActions a')).toHaveAttribute('href', 'https://example.com/');
    await expect(page.locator('#profileMeta a')).toHaveCount(0);

    await page.goto('/experience.html');
    await expect(page.locator('.experience-doc-link')).toHaveCount(1);
    await expect(page.locator('.experience-doc-link')).toHaveAttribute('href', 'https://example.com/document.pdf');
});

test('note permalink remains keyboard-navigable inside a card', async ({ page }) => {
    await page.goto('/index.html');
    const permalink = page.locator('.post-card-permalink').first();
    await permalink.focus();
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/\/notes\/where-do-we-exist-in-our-minds\/$/);
});

test('clearing portfolio data preserves unrelated origin storage', async ({ page }) => {
    await page.addInitScript(() => {
        if (sessionStorage.getItem('clear-data-test-seeded')) return;
        sessionStorage.setItem('clear-data-test-seeded', 'true');
        localStorage.setItem('unrelated-app-data', 'keep');
        localStorage.setItem('portfolioSettings', '{"fontSize":"large"}');
        localStorage.setItem('portfolioContent', '{"profile":{"name":"Draft"}}');
    });

    await page.goto('/index.html');
    await page.locator('#settingsBtn').click();
    page.once('dialog', dialog => dialog.accept());
    await Promise.all([
        page.waitForNavigation(),
        page.locator('#settingsClearDataBtn').click()
    ]);
    await expect(page.locator('body')).toHaveAttribute('data-rendered', 'true');

    const storage = await page.evaluate(() => ({
        unrelated: localStorage.getItem('unrelated-app-data'),
        settings: localStorage.getItem('portfolioSettings'),
        content: localStorage.getItem('portfolioContent')
    }));
    expect(storage).toEqual({ unrelated: 'keep', settings: null, content: null });
});

test('memory cards and reaction target are keyboard-operable controls', async ({ page }) => {
    await page.goto('/games/memory.html');
    await page.getByRole('button', { name: /start game/i }).click();
    const card = page.locator('.memory-card[data-index="0"]');
    await expect(card).toHaveAttribute('aria-label', 'Card 1, face down');
    await expect(card).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(card).toHaveAttribute('aria-pressed', 'true');
    await expect(card).not.toHaveAttribute('aria-label', /face down/i);

    await page.goto('/games/reaction.html');
    await page.getByRole('button', { name: /start test/i }).click();
    await expect(page.getByRole('button', { name: /wait/i })).toBeFocused();
});

test('Decap CMS uses the Turbo backend and a compatible CMS version', async ({ request }) => {
    const cmsPage = await request.get('/admin/');
    expect(cmsPage.ok()).toBeTruthy();
    expect(await cmsPage.text()).toContain('decap-cms@3.17.0');

    const config = await request.get('/admin/config.yml');
    expect(config.ok()).toBeTruthy();
    const configText = await config.text();
    expect(configText).toMatch(/backend:\s+name: turbo-github\s+turbo_site_id: f1bfaa59-b9ba-4a0c-921d-c73c50158dd1/);
    expect(configText).not.toContain('repo: featPencil8880/portfoli');
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
