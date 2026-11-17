import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'dist');
const publicFiles = [
    '404.html', 'index.html', 'profile.html', 'education.html', 'experience.html',
    'skills.html', 'survey.html', 'games.html', 'note.html', 'notes.html',
    'chrome.js', 'portfolio.js', 'style.css', 'content.json', 'favicon.svg',
    'manifest.webmanifest', 'cat2-sprite@2x.png', 'admin', 'games', 'googleFonts',
    'icons', 'js', 'jspsych', 'photos'
];
const pageFiles = [
    'index.html', 'profile.html', 'education.html', 'experience.html',
    'skills.html', 'survey.html', 'games.html', 'notes.html', '404.html'
];
const sitemapPages = [
    '', 'profile.html', 'education.html', 'experience.html', 'skills.html',
    'survey.html', 'games.html', 'notes.html'
];
const variantWidths = [320, 640, 960, 1280];

function escapeHtml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function stripTags(value = '') {
    return String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function slugify(value = '') {
    return String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 64);
}

function getTitle(post) {
    for (const field of post.fields || []) {
        const title = (field.blocks || []).find(block => block.type === 'title' && block.content);
        if (title) return String(title.content);
    }
    return (post.fields || [])[0]?.name || '(untitled)';
}

function getPreview(post) {
    let subtitle = '';
    let excerpt = '';
    for (const field of post.fields || []) {
        for (const block of field.blocks || []) {
            if (block.type === 'subtitle' && !subtitle) subtitle = String(block.content || '');
            if (block.type === 'paragraph' && !excerpt) excerpt = stripTags(block.content || '');
        }
    }
    return {
        title: getTitle(post),
        subtitle,
        excerpt: excerpt.length > 200 ? `${excerpt.slice(0, 197)}…` : excerpt
    };
}

function resolvePostSlugs(posts) {
    const seen = new Set();
    return posts.map(post => {
        const requested = String(post.slug || '').toLowerCase();
        const titleSlug = slugify(getTitle(post));
        const idSuffix = String(post.id || '').replace(/[^a-z0-9]/gi, '').slice(-4).toLowerCase();
        let slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(requested)
            ? requested
            : `${titleSlug || 'note'}${idSuffix ? `-${idSuffix}` : ''}`;
        if (seen.has(slug)) {
            if (!idSuffix) throw new Error(`Duplicate note slug "${slug}" and missing unique note id.`);
            slug = `${slug}-${idSuffix}`;
        }
        if (seen.has(slug)) throw new Error(`Duplicate note slug "${slug}".`);
        seen.add(slug);
        post.slug = slug;
        return post;
    });
}

function getGitHubPagesUrl() {
    const result = spawnSync('git', ['config', '--get', 'remote.origin.url'], { cwd: root, encoding: 'utf8' });
    const remote = result.status === 0 ? result.stdout.trim() : '';
    const match = remote.match(/github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?$/i);
    if (!match) return '';
    const owner = match[1];
    const repository = match[2];
    if (repository.toLowerCase() === `${owner}.github.io`.toLowerCase()) {
        return `https://${owner}.github.io`;
    }
    return `https://${owner}.github.io/${repository}`;
}

function elementContent(html, id, content) {
    const openingPattern = new RegExp(`<([a-z][\\w:-]*)\\b(?=[^>]*\\bid="${id}")[^>]*>`, 'i');
    const opening = openingPattern.exec(html);
    if (!opening) throw new Error(`Cannot render build content: element #${id} is missing.`);
    const tag = opening[1];
    const contentStart = opening.index + opening[0].length;
    const tagPattern = new RegExp(`<\\/?${tag}\\b[^>]*>`, 'gi');
    tagPattern.lastIndex = contentStart;
    let depth = 1;
    let token;
    while ((token = tagPattern.exec(html))) {
        if (/^<\//.test(token[0])) depth--;
        else if (!/\/>$/.test(token[0])) depth++;
        if (depth === 0) {
            return html.slice(0, contentStart) + content + html.slice(token.index);
        }
    }
    throw new Error(`Cannot render build content: element #${id} is not closed.`);
}

function setTagAttribute(tag, attribute, value) {
    const escaped = escapeHtml(value);
    const pattern = new RegExp(`\\b${attribute}="[^"]*"`, 'i');
    return pattern.test(tag)
        ? tag.replace(pattern, `${attribute}="${escaped}"`)
        : tag.replace(/\/?>$/, match => ` ${attribute}="${escaped}"${match}`);
}

function setMeta(html, selector, value, id = '') {
    const idPattern = id ? `(?=[^>]*\\bid="${id}")` : '';
    const selectorPattern = id ? '' : `(?=[^>]*\\b${selector.attribute}="${selector.value}")`;
    const pattern = new RegExp(`<meta\\b${idPattern}${selectorPattern}[^>]*>`, 'i');
    if (pattern.test(html)) return html.replace(pattern, tag => setTagAttribute(tag, 'content', value));
    const type = id ? `id="${id}"` : `${selector.attribute}="${selector.value}"`;
    return html.replace('</head>', `    <meta ${type} content="${escapeHtml(value)}"/>\n</head>`);
}

function setCanonical(html, url) {
    const pattern = /<link\b(?=[^>]*\brel="canonical")[^>]*>/i;
    if (pattern.test(html)) return html.replace(pattern, tag => setTagAttribute(tag, 'href', url));
    return html.replace('</head>', `    <link rel="canonical" href="${escapeHtml(url)}"/>\n</head>`);
}

function setOgUrl(html, url) {
    const pattern = /<meta\b(?=[^>]*\bproperty="og:url")[^>]*>/i;
    if (pattern.test(html)) return html.replace(pattern, tag => setTagAttribute(tag, 'content', url));
    return html.replace('</head>', `    <meta property="og:url" content="${escapeHtml(url)}"/>\n</head>`);
}

function replaceTitle(html, title) {
    return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
}

function renderActions(actions = []) {
    return actions.map(action => {
        if (!action?.label || !action.href) return '';
        const style = action.style === 'primary' ? 'btn--primary' : 'btn--ghost';
        return `<a class="btn ${style}" href="${escapeHtml(action.href)}">${escapeHtml(action.label)}</a>`;
    }).join('');
}

function renderNoteLinks(posts, groupByYear = false) {
    if (!posts.length) return '<p class="no-posts">No field notes yet.</p>';
    const renderItem = post => {
        const preview = getPreview(post);
        const label = escapeHtml(String(post.label || 'General'));
        const excerpt = preview.subtitle || preview.excerpt;
        return `<a class="note-index-item" href="notes/${escapeHtml(post.slug)}/">
            <span class="note-index-date">${escapeHtml(post.date || '')}</span>
            <span class="note-index-main"><strong>${escapeHtml(preview.title)}</strong>${excerpt ? `<span>${escapeHtml(excerpt)}</span>` : ''}</span>
            <span class="note-index-label">${label}</span>
            <span class="note-index-arrow" aria-hidden="true">→</span>
        </a>`;
    };
    if (!groupByYear) return posts.map(renderItem).join('');

    const years = new Map();
    [...posts].sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))).forEach(post => {
        const year = /^\d{4}(?:-|$)/.test(post.date || '') ? post.date.slice(0, 4) : 'Undated';
        if (!years.has(year)) years.set(year, []);
        years.get(year).push(post);
    });
    return [...years].map(([year, yearPosts]) =>
        `<section class="notes-year-group"><h3 class="notes-year-heading">${escapeHtml(year)}</h3>${yearPosts.map(renderItem).join('')}</section>`
    ).join('');
}

function renderTimeline(entries, kind) {
    const sorted = [...entries].sort((a, b) => Number(b.sortYear || 0) - Number(a.sortYear || 0));
    if (!sorted.length) return `<p class="${kind}-empty">No ${kind} entries yet.</p>`;
    return sorted.map(entry => {
        const isEducation = kind === 'education';
        const title = isEducation ? entry.institution : entry.position;
        const organization = isEducation ? entry.degree : entry.organization;
        const highlights = (entry.highlights || []).map(item =>
            `<span class="${kind}-chip">${escapeHtml(item)}</span>`).join('');
        const documents = isEducation ? '' : (entry.documents || []).map(document =>
            `<a class="experience-doc-link" href="${escapeHtml(document.path || '#')}" target="_blank" rel="noopener">${escapeHtml(document.title || 'Document')}</a>`).join('');
        return `<article class="${kind}-card">
            <div class="${kind}-card-icon card-icon card-icon--${isEducation ? 'edu' : 'exp'}" aria-hidden="true"></div>
            <div class="${kind}-card-body">
                <h3 class="${isEducation ? 'education-institution' : 'experience-position'}">${escapeHtml(title || '')}</h3>
                <p class="${isEducation ? 'education-degree' : 'experience-organization'}">${escapeHtml(organization || '')}</p>
                <div class="${kind}-meta"><span class="${kind}-years">${escapeHtml(entry.years || '')}</span>${entry.location ? `<span class="${kind}-loc-sep">/</span><span class="${isEducation ? 'education-location' : 'experience-location'}">${escapeHtml(entry.location)}</span>` : ''}</div>
                ${entry.description ? `<p class="${kind}-description">${escapeHtml(entry.description)}</p>` : ''}
                ${highlights ? `<div class="${kind}-highlights">${highlights}</div>` : ''}
                ${documents ? `<div class="experience-docs"><div class="experience-docs-label">Attached documents</div><div class="experience-docs-list">${documents}</div></div>` : ''}
            </div>
        </article>`;
    }).join('');
}

function renderSkillCard(title, items, emptyCopy) {
    const sorted = [...items].sort((a, b) => String(a).localeCompare(String(b)));
    if (!sorted.length) return `<h2 class="skills-card-title">${title}</h2><p class="no-content">${emptyCopy}</p>`;
    return `<h2 class="skills-card-title">${title}<span class="skills-count">${sorted.length}</span></h2>
        <div class="skills-chips">${sorted.map(item => `<span class="skills-chip">${escapeHtml(item)}</span>`).join('')}</div>`;
}

function noteBodyHtml(post) {
    let titleSeen = false;
    let subtitleSeen = false;
    return (post.fields || []).map(field => {
        const blocks = (field.blocks || []).map(block => {
            const content = escapeHtml(block.content || '');
            if (block.type === 'title' && !titleSeen) {
                titleSeen = true;
                return '';
            }
            if (block.type === 'subtitle' && !subtitleSeen) {
                subtitleSeen = true;
                return '';
            }
            if (block.type === 'paragraph') return `<p class="post-field-paragraph">${content}</p>`;
            if (block.type === 'title') return `<h2 class="post-field-title">${content}</h2>`;
            if (block.type === 'subtitle') return `<h3 class="post-field-subtitle">${content}</h3>`;
            if (block.type === 'actions') {
                const actions = String(block.content || '').split('\n').map(line => {
                    const [label, href, style] = line.split('|').map(value => value.trim());
                    if (!label || !href || /^(javascript|data):/i.test(href)) return '';
                    return `<a class="btn ${style === 'primary' ? 'btn--primary' : 'btn--ghost'}" href="${escapeHtml(href)}">${escapeHtml(label)}</a>`;
                }).join('');
                return actions ? `<div class="post-field-actions">${actions}</div>` : '';
            }
            return '';
        }).join('');
        if (!blocks.trim()) return '';
        const label = (post.fields || []).length > 1 ? `<h2 class="note-field-heading">${escapeHtml(field.name || '')}</h2>` : '';
        return `<section class="note-field">${label}${blocks}</section>`;
    }).join('');
}

function renderNotePage(template, post, index, siteUrl) {
    const preview = getPreview(post);
    const authorName = String(index.profile?.name || 'Portfolio');
    const title = `${preview.title} — ${authorName}`;
    const description = preview.excerpt || preview.subtitle || `A field note by ${authorName}.`;
    const url = `${siteUrl}/notes/${post.slug}/`;
    const orderedPosts = [...index.posts].sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
    const postIndex = orderedPosts.findIndex(item => item.slug === post.slug);
    const newer = postIndex > 0 ? orderedPosts[postIndex - 1] : null;
    const older = postIndex >= 0 ? orderedPosts[postIndex + 1] : null;
    const article = `<header class="note-header">
        <p class="eyebrow"><span class="eyebrow-num">✳</span> ${escapeHtml(post.label || 'General')}</p>
        <h1 class="note-title">${escapeHtml(preview.title)}</h1>
        ${preview.subtitle ? `<p class="note-subtitle">${escapeHtml(preview.subtitle)}</p>` : ''}
        <div class="note-meta"><span>${escapeHtml(post.date || '')}</span>${post.author ? `<span>${escapeHtml(post.author)}</span>` : ''}</div>
    </header>
    <div class="note-body prose">${noteBodyHtml(post) || '<p class="no-content">This note has no content yet.</p>'}</div>
    <footer class="note-footer">
        <div class="note-actions"><a class="link-btn" href="notes.html">All notes</a></div>
        <nav class="note-pagination" aria-label="More notes">
            ${newer ? `<a class="note-nav-link" href="notes/${escapeHtml(newer.slug)}/"><span class="note-nav-label">Newer</span><span>${escapeHtml(getTitle(newer))}</span></a>` : '<span></span>'}
            ${older ? `<a class="note-nav-link note-nav-link--next" href="notes/${escapeHtml(older.slug)}/"><span class="note-nav-label">Older</span><span>${escapeHtml(getTitle(older))}</span></a>` : '<span></span>'}
        </nav>
    </footer>`;

    let html = elementContent(template, 'noteArticle', article);
    html = html.replace('data-note-slug="__NOTE_SLUG__"', `data-note-slug="${escapeHtml(post.slug)}"`);
    html = html.replace(/<head>/i, `<head>\n    <base href="${escapeHtml(siteUrl)}/"/>`);
    html = replaceTitle(html, title);
    html = setMeta(html, { attribute: 'name', value: 'description' }, description);
    html = setMeta(html, null, title, 'ogTitle');
    html = setMeta(html, null, description, 'ogDescription');
    html = setMeta(html, null, url, 'ogUrl');
    html = setCanonical(html, url);
    html = html.replace(/<script src="portfolio\.js" defer><\/script>/i, '<script src="site-config.js" defer></script>\n    <script src="portfolio.js" defer></script>');
    const jsonLd = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: preview.title,
        description,
        datePublished: post.date || undefined,
        url,
        author: { '@type': 'Person', name: authorName },
        keywords: post.label || undefined
    }).replace(/</g, '\\u003c');
    html = html.replace('</head>', `    <script id="noteJsonLd" type="application/ld+json">${jsonLd}</script>\n</head>`);
    return html;
}

function updatePageMeta(html, file, siteUrl) {
    const route = file === 'index.html' ? '' : file;
    const url = `${siteUrl}/${route}`;
    html = setCanonical(html, url);
    return setOgUrl(html, url);
}

async function copyPublicFiles() {
    for (const file of publicFiles) {
        try {
            await cp(join(root, file), join(output, file), { recursive: true });
        } catch (error) {
            if (error.code !== 'ENOENT') throw error;
            throw new Error(`Required public file "${file}" is missing.`, { cause: error });
        }
    }
}

async function configureCMS(siteUrl) {
    const configPath = join(output, 'admin', 'config.yml');
    let config = await readFile(configPath, 'utf8');
    config = config
        .replace(/^site_url:.*$/m, `site_url: "${siteUrl}"`)
        .replace(/^display_url:.*$/m, `display_url: "${siteUrl}"`);
    await writeFile(configPath, config);
}

async function processPhotos() {
    const photoRoot = join(root, 'photos');
    const imagePaths = [];
    async function collect(directory) {
        for (const entry of await readdir(directory, { withFileTypes: true })) {
            const path = join(directory, entry.name);
            if (entry.isDirectory()) await collect(path);
            else if (/\.(jpe?g|png|webp)$/i.test(entry.name)) imagePaths.push(path);
        }
    }
    await collect(photoRoot);

    const variants = {};
    for (const file of imagePaths) {
        const relativePath = relative(root, file).split(sep).join('/');
        const extension = extname(relativePath);
        const stem = relativePath.slice(0, -extension.length);
        const metadata = await sharp(file).metadata();
        const widths = variantWidths.filter(width => width < (metadata.width || 0));
        const formats = { avif: [], webp: [] };
        for (const width of widths) {
            const source = sharp(file).rotate().resize({ width, withoutEnlargement: true });
            const avifPath = `${stem}-${width}w.avif`;
            const webpPath = `${stem}-${width}w.webp`;
            await Promise.all([
                source.clone().avif({ quality: 52 }).toFile(join(output, avifPath)),
                source.clone().webp({ quality: 78 }).toFile(join(output, webpPath))
            ]);
            formats.avif.push(`${avifPath} ${width}w`);
            formats.webp.push(`${webpPath} ${width}w`);
        }
        if (widths.length) variants[relativePath] = {
            avif: formats.avif.join(', '),
            webp: formats.webp.join(', ')
        };
    }
    await writeFile(join(output, 'photos', 'manifest.json'), JSON.stringify(variants, null, 2));
    return variants;
}

function renderRootPage(file, html, data, siteUrl) {
    const posts = data.posts;
    if (file === 'index.html') {
        const profile = data.profile || {};
        const actions = renderActions(profile.actions || []);
        const hero = `<p class="eyebrow"><span class="eyebrow-dot" aria-hidden="true"></span>${escapeHtml(profile.location || 'Portfolio')}</p>
            <h1 class="hero-name" id="heroName">${escapeHtml(profile.name || 'Portfolio')}</h1>
            <p class="hero-role">${escapeHtml(profile.title || '')}</p>
            <p class="hero-bio">${escapeHtml(profile.bio || '')}</p>
            <div class="hero-actions">${actions}</div>`;
        html = elementContent(html, 'heroText', hero);
        html = elementContent(html, 'postList', renderNoteLinks(posts));
        const education = [...data.education].sort((a, b) => Number(b.sortYear || 0) - Number(a.sortYear || 0))[0];
        const facts = {
            location: profile.location || '',
            studied: education ? [education.degree, education.institution].filter(Boolean).join(', ') : '',
            focus: profile.tagline || '',
            offclock: (data.hobbies || []).slice(0, 3).join(', ')
        };
        for (const [key, value] of Object.entries(facts)) {
            const pattern = new RegExp(`(<[^>]*data-fact="${key}"[^>]*>)[\\s\\S]*?(<\\/[^>]+>)`, 'i');
            html = html.replace(pattern, (_match, opening, closing) => `${opening}${escapeHtml(value)}${closing}`);
        }
    }
    if (file === 'profile.html') {
        const profile = data.profile || {};
        html = elementContent(html, 'profileGreeting', escapeHtml(profile.greeting || ''));
        html = elementContent(html, 'profileName', `${escapeHtml(profile.name || 'Portfolio')}${profile.pronouns ? ` <span class="profile-hero-pronouns">(${escapeHtml(profile.pronouns)})</span>` : ''}`);
        html = elementContent(html, 'profileTitle', escapeHtml(profile.title || ''));
        html = elementContent(html, 'profileTagline', escapeHtml(profile.tagline || ''));
        html = elementContent(html, 'profileActions', renderActions(profile.actions || []));
        html = elementContent(html, 'profileBio', escapeHtml(profile.bio || ''));
        html = elementContent(html, 'profileAbout', (profile.about || '').split(/\n\s*\n/).map(line => line.trim()).filter(Boolean).map(line => `<p>${escapeHtml(line)}</p>`).join(''));
        const meta = [];
        if (profile.location) meta.push(`<span class="profile-meta-item">⌖ ${escapeHtml(profile.location)}</span>`);
        if (profile.email) meta.push(`<span class="profile-meta-item"><a href="mailto:${escapeHtml(profile.email)}">✉ Email</a></span>`);
        if (profile.linkedin) {
            const linkedin = /^https?:\/\//i.test(profile.linkedin) ? profile.linkedin : `https://${profile.linkedin}`;
            meta.push(`<span class="profile-meta-item"><a href="${escapeHtml(linkedin)}" target="_blank" rel="noopener">↗ LinkedIn</a></span>`);
        }
        html = elementContent(html, 'profileMeta', meta.join('<span class="meta-sep">/</span>'));
        html = elementContent(html, 'postList', renderNoteLinks(posts.filter(post => post.tab === 'profile')));
    }
    if (file === 'education.html') {
        const entries = [...data.education].sort((a, b) => Number(b.sortYear || 0) - Number(a.sortYear || 0));
        const newest = entries[0] || {};
        html = elementContent(html, 'educationHeroMeta', [newest.institution, newest.degree, newest.years, newest.location].filter(Boolean).map(value => `<span>${escapeHtml(value)}</span>`).join(''));
        html = elementContent(html, 'educationTimeline', renderTimeline(entries, 'education'));
        html = elementContent(html, 'postList', renderNoteLinks(posts.filter(post => post.tab === 'education')));
    }
    if (file === 'experience.html') {
        const entries = [...data.experience].sort((a, b) => Number(b.sortYear || 0) - Number(a.sortYear || 0));
        const newest = entries[0] || {};
        html = elementContent(html, 'experienceHeroMeta', [newest.position, newest.organization, newest.years, newest.location].filter(Boolean).map(value => `<span>${escapeHtml(value)}</span>`).join(''));
        html = elementContent(html, 'experienceTimeline', renderTimeline(entries, 'experience'));
        html = elementContent(html, 'postList', renderNoteLinks(posts.filter(post => post.tab === 'experience')));
    }
    if (file === 'skills.html') {
        html = elementContent(html, 'skillsCard', renderSkillCard('Skills', data.skills, 'Add a few skills in the editor.'));
        html = elementContent(html, 'hobbiesCard', renderSkillCard('Hobbies', data.hobbies, 'Add a few hobbies in the editor.'));
        html = elementContent(html, 'postList', renderNoteLinks(posts.filter(post => post.tab === 'skills')));
    }
    if (file === 'notes.html') {
        html = elementContent(html, 'notesCount', `${posts.length} note${posts.length === 1 ? '' : 's'}`);
        html = elementContent(html, 'notesIndex', renderNoteLinks(posts, true));
    }

    const pageTitle = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.replace(/&amp;/g, '&') || 'Portfolio';
    const description = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1] || '';
    html = updatePageMeta(html, file, siteUrl);
    html = setMeta(html, { attribute: 'property', value: 'og:title' }, pageTitle);
    html = setMeta(html, { attribute: 'property', value: 'og:description' }, description);
    return html.replace(/<script src="portfolio\.js" defer><\/script>/i, '<script src="site-config.js" defer></script>\n    <script src="portfolio.js" defer></script>');
}

function buildRss(data, siteUrl) {
    const notes = [...data.posts].sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
    const items = notes.map(post => {
        const preview = getPreview(post);
        return `<item><title>${escapeHtml(preview.title)}</title><link>${escapeHtml(siteUrl)}/notes/${escapeHtml(post.slug)}/</link><guid isPermaLink="true">${escapeHtml(siteUrl)}/notes/${escapeHtml(post.slug)}/</guid>${post.date ? `<pubDate>${new Date(`${post.date}T12:00:00Z`).toUTCString()}</pubDate>` : ''}<description>${escapeHtml(preview.excerpt || preview.subtitle)}</description></item>`;
    }).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${escapeHtml(data.site?.projectName || 'Portfolio')} — Field notes</title><link>${escapeHtml(siteUrl)}/notes.html</link><description>Recent field notes</description><language>en</language>${items}</channel></rss>\n`;
}

async function main() {
    const sourceJson = JSON.parse(await readFile(join(root, 'content.json'), 'utf8'));
    sourceJson.posts = resolvePostSlugs(Array.isArray(sourceJson.posts) ? sourceJson.posts : []);
    sourceJson.education = Array.isArray(sourceJson.education) ? sourceJson.education : [];
    sourceJson.experience = Array.isArray(sourceJson.experience) ? sourceJson.experience : [];
    sourceJson.skills = Array.isArray(sourceJson.skills) ? sourceJson.skills : [];
    sourceJson.hobbies = Array.isArray(sourceJson.hobbies) ? sourceJson.hobbies : [];

    const envUrl = process.env.SITE_URL;
    const siteUrl = String(envUrl || sourceJson.site?.url || getGitHubPagesUrl()).replace(/\/+$/, '');
    if (!siteUrl) throw new Error('Set SITE_URL (or site.url in content.json) to build canonical URLs and feeds.');
    let parsedSiteUrl;
    try {
        parsedSiteUrl = new URL(siteUrl);
    } catch (error) {
        throw new Error(`SITE_URL must be an absolute URL: ${siteUrl}`, { cause: error });
    }
    if (!['http:', 'https:'].includes(parsedSiteUrl.protocol)) throw new Error('SITE_URL must use HTTP or HTTPS.');
    if (process.env.NODE_ENV === 'production' && parsedSiteUrl.protocol !== 'https:') throw new Error('Production builds require an HTTPS SITE_URL.');

    const formspreeId = String(process.env.FORMSPREE_ID || '').trim();
    if (formspreeId && !/^[A-Za-z0-9_-]+$/.test(formspreeId)) throw new Error('FORMSPREE_ID contains unsupported characters.');

    await rm(output, { recursive: true, force: true });
    await mkdir(output, { recursive: true });
    await copyPublicFiles();
    await configureCMS(siteUrl);
    const photoVariants = await processPhotos();

    const data = structuredClone(sourceJson);
    data.site = { ...(data.site || {}), url: siteUrl };
    await writeFile(join(output, 'content.json'), `${JSON.stringify(data, null, 2)}\n`);
    const config = {
        siteUrl,
        formspreeEndpoint: formspreeId ? `https://formspree.io/f/${formspreeId}` : '',
        photoVariants
    };
    await writeFile(join(output, 'site-config.js'), `window.PORTFOLIO_CONFIG = Object.freeze(${JSON.stringify(config)});\n`);

    const noteTemplate = await readFile(join(output, 'note.html'), 'utf8');
    for (const [index, post] of data.posts.entries()) {
        const route = join(output, 'notes', post.slug, 'index.html');
        await mkdir(dirname(route), { recursive: true });
        await writeFile(route, renderNotePage(noteTemplate, post, data, siteUrl));
    }

    for (const file of pageFiles) {
        const path = join(output, file);
        let html = await readFile(path, 'utf8');
        html = renderRootPage(file, html, data, siteUrl);
        await writeFile(path, html);
    }

    const urls = [...sitemapPages.map(page => `${siteUrl}/${page}`),
        ...data.posts.map(post => `${siteUrl}/notes/${post.slug}/`)];
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `<url><loc>${escapeHtml(url)}</loc></url>`).join('')}</urlset>\n`;
    await writeFile(join(output, 'sitemap.xml'), sitemap);
    await writeFile(join(output, 'rss.xml'), buildRss(data, siteUrl));
    await writeFile(join(output, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);

    console.log(`Built ${data.posts.length} note page(s) and ${Object.keys(photoVariants).length} responsive image set(s) into dist/.`);
}

main().catch(error => {
    console.error('Build failed:', error);
    process.exitCode = 1;
});
