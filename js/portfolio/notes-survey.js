/* =========================================================
   30b. NOTE PAGES & ARCHIVE
   ========================================================= */
let notesQuery = '';
let notesTag = '';

function getAllNotesSorted() {
    return [...thoughtsPosts].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

function getSiteUrl() {
    return String((contentData.site && contentData.site.url) || '').replace(/\/+$/, '');
}

function absoluteUrl(path) {
    const base = getSiteUrl();
    if (!base) return path;
    return `${base}/${String(path).replace(/^\/+/, '')}`;
}

function setHeadValue(selector, value, attr = 'content') {
    const el = document.querySelector(selector);
    if (el) el.setAttribute(attr, value || '');
}

function fillNoteMeta(post, preview) {
    const name = (contentData.profile && contentData.profile.name) || 'Portfolio';
    const title = `${preview.title} — ${name}`;
    const description = preview.excerpt || preview.subtitle || `A field note by ${name}.`;
    const url = absoluteUrl(getPostUrl(post));

    document.title = title;
    setHeadValue('meta[name="description"]', description);
    setHeadValue('#ogTitle', title);
    setHeadValue('#ogDescription', description);
    setHeadValue('#ogUrl', url);
    const canonical = document.getElementById('canonical');
    if (canonical) canonical.setAttribute('href', url);

    let ld = document.getElementById('noteJsonLd');
    if (!ld) {
        ld = document.createElement('script');
        ld.type = 'application/ld+json';
        ld.id = 'noteJsonLd';
        document.head.appendChild(ld);
    }
    ld.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: preview.title,
        description,
        datePublished: post.date,
        url,
        author: { '@type': 'Person', name },
        keywords: post.label || undefined
    });
}

function renderNotePage() {
    const host = document.getElementById('noteArticle');
    if (!host) return;

    const params = new URLSearchParams(location.search);
    let slug = document.body.dataset.noteSlug;
    if (!slug || slug === '__NOTE_SLUG__') slug = params.get('slug') || params.get('note') || '';
    const post = getNoteBySlug(slug);

    if (!post) {
        host.innerHTML = `
            <div class="note-missing">
                <p class="eyebrow"><span class="eyebrow-num">404</span> Note</p>
                <h1 class="note-title">That note has wandered off.</h1>
                <p class="note-subtitle">It may have been renamed, or the link may be out of date.</p>
                <p><a class="btn btn--primary" href="notes.html">Browse all notes</a></p>
            </div>`;
        document.title = 'Note not found — Portfolio';
        return;
    }

    const preview = getPostPreview(post);
    const label = getLabel(post.label);
    const safeColor = /^#[0-9a-f]{3,8}$/i.test(label.color || '') ? label.color : '#8fb8b5';
    const fields = Array.isArray(post.fields) ? post.fields : [];
    let sawTitle = false;
    let sawSubtitle = false;

    const fieldsHtml = fields.map((field) => {
        const blocks = (field.blocks || []).map(block => {
            if (!sawTitle && block.type === 'title') { sawTitle = true; return ''; }
            if (!sawSubtitle && block.type === 'subtitle') { sawSubtitle = true; return ''; }
            return renderBlockHtml(block);
        }).join('');
        if (!blocks.trim()) return '';
        const fieldLabel = fields.length > 1
            ? `<h2 class="note-field-heading">${escapeHtml(field.name || '')}</h2>`
            : '';
        return `<section class="note-field">${fieldLabel}${blocks}</section>`;
    }).join('');

    const all = getAllNotesSorted();
    const index = all.findIndex(p => p.id === post.id);
    const newer = index > 0 ? all[index - 1] : null;
    const older = index >= 0 && index < all.length - 1 ? all[index + 1] : null;

    host.innerHTML = `
        <header class="note-header">
            <p class="eyebrow"><span class="eyebrow-num">✳</span> ${escapeHtml(formatLabelName(post.label))}</p>
            <h1 class="note-title">${escapeHtml(preview.title)}</h1>
            ${preview.subtitle ? `<p class="note-subtitle">${escapeHtml(preview.subtitle)}</p>` : ''}
            <div class="note-meta">
                <span>${escapeHtml(formatPostDate(post.date))}</span>
                ${post.author ? `<span>${escapeHtml(post.author)}</span>` : ''}
                <a href="notes.html?tag=${encodeURIComponent(slugify(formatLabelName(post.label), 40))}" style="--tag-color:${safeColor}">${escapeHtml(formatLabelName(post.label))}</a>
            </div>
        </header>

        ${renderReplyToBanner(post)}
        <div class="note-body prose">
            ${fieldsHtml || '<p class="no-content">This note has no content yet.</p>'}
        </div>
        ${renderReplyFromBanner(post)}

        <footer class="note-footer">
            <div class="note-actions">
                <button class="link-btn" type="button" data-copy-link>Copy link</button>
                <a class="link-btn" href="notes.html">All notes</a>
            </div>
            <nav class="note-pagination" aria-label="More notes">
                ${newer
                    ? `<a class="note-nav-link" href="${escapeHtml(getPostUrl(newer))}"><span class="note-nav-label">Newer</span><span>${escapeHtml(getPostTitle(newer))}</span></a>`
                    : '<span></span>'}
                ${older
                    ? `<a class="note-nav-link note-nav-link--next" href="${escapeHtml(getPostUrl(older))}"><span class="note-nav-label">Older</span><span>${escapeHtml(getPostTitle(older))}</span></a>`
                    : '<span></span>'}
            </nav>
        </footer>
    `;

    fillNoteMeta(post, preview);
    if (typeof track === 'function') track('note_view', { slug: post.slug, title: preview.title });
}

function renderNotesIndex() {
    const host = document.getElementById('notesIndex');
    if (!host) return;

    const searchInput = document.getElementById('notesSearch');
    const tagsHost = document.getElementById('notesTags');
    const countEl = document.getElementById('notesCount');

    const params = new URLSearchParams(location.search);
    if (params.get('tag') && !notesTag) notesTag = params.get('tag');
    if (searchInput && searchInput.value !== notesQuery) searchInput.value = notesQuery;

    const all = getAllNotesSorted();
    const counts = {};
    all.forEach(post => {
        const key = slugify(formatLabelName(post.label), 40) || 'general';
        counts[key] = (counts[key] || 0) + 1;
    });

    if (tagsHost) {
        tagsHost.innerHTML = [
            `<button class="post-filter-chip${notesTag ? '' : ' is-active'}" data-note-tag="" type="button">All <span class="chip-count">${all.length}</span></button>`,
            ...Object.keys(counts).sort((a, b) => counts[b] - counts[a]).map(key => {
                const post = all.find(p => (slugify(formatLabelName(p.label), 40) || 'general') === key);
                const color = post ? getLabel(post.label).color : '#8fb8b5';
                return `<button class="post-filter-chip${notesTag === key ? ' is-active' : ''}" data-note-tag="${escapeHtml(key)}" style="--chip-color:${/^#[0-9a-f]{3,8}$/i.test(color || '') ? color : '#8fb8b5'}" type="button">${escapeHtml(formatLabelName(post ? post.label : key))} <span class="chip-count">${counts[key]}</span></button>`;
            })
        ].join('');
    }

    const query = notesQuery.trim().toLowerCase();
    const filtered = all.filter(post => {
        const key = slugify(formatLabelName(post.label), 40) || 'general';
        if (notesTag && key !== notesTag) return false;
        if (!query) return true;
        const preview = getPostPreview(post);
        const body = (post.fields || []).map(f => (f.blocks || []).map(b => b.content || b.label || '').join(' ')).join(' ');
        return [preview.title, preview.subtitle, preview.excerpt, post.label, post.date, body]
            .join(' ').toLowerCase().includes(query);
    });

    if (countEl) countEl.textContent = `${filtered.length} note${filtered.length === 1 ? '' : 's'}`;

    if (!filtered.length) {
        host.innerHTML = '<p class="no-posts">No notes match that search.</p>';
        return;
    }

    const renderItem = post => {
        const preview = getPostPreview(post);
        const color = getLabel(post.label).color;
        const safeColor = /^#[0-9a-f]{3,8}$/i.test(color || '') ? color : '#8fb8b5';
        return `<a class="note-index-item" href="${escapeHtml(getPostUrl(post))}" style="--note-color:${safeColor}">
                <span class="note-index-date">${escapeHtml(formatPostDate(post.date))}</span>
                <span class="note-index-main">
                    <strong>${escapeHtml(preview.title)}</strong>
                    ${preview.subtitle || preview.excerpt ? `<span>${escapeHtml(preview.subtitle || preview.excerpt)}</span>` : ''}
                </span>
                <span class="note-index-label">${escapeHtml(formatLabelName(post.label))}</span>
                <span class="note-index-arrow" aria-hidden="true">→</span>
            </a>`;
    };
    const years = new Map();
    filtered.forEach(post => {
        const year = /^\d{4}(?:-|$)/.test(post.date || '') ? post.date.slice(0, 4) : 'Undated';
        if (!years.has(year)) years.set(year, []);
        years.get(year).push(post);
    });
    host.innerHTML = [...years].map(([year, posts]) =>
        `<section class="notes-year-group"><h3 class="notes-year-heading">${escapeHtml(year)}</h3>${posts.map(renderItem).join('')}</section>`
    ).join('');
}

(function bindNotesIndex() {
    const search = document.getElementById('notesSearch');
    const tags = document.getElementById('notesTags');
    search?.addEventListener('input', () => {
        notesQuery = search.value;
        renderNotesIndex();
    });
    tags?.addEventListener('click', (e) => {
        const chip = e.target.closest('[data-note-tag]');
        if (!chip) return;
        notesTag = chip.dataset.noteTag || '';
        const url = new URL(location.href);
        if (notesTag) url.searchParams.set('tag', notesTag);
        else url.searchParams.delete('tag');
        history.replaceState({}, '', url);
        renderNotesIndex();
    });
})();

document.getElementById('noteArticle')?.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-copy-link]');
    if (!btn) return;
    const url = location.href;
    try {
        await navigator.clipboard.writeText(url);
        btn.textContent = 'Link copied';
        setTimeout(() => { btn.textContent = 'Copy link'; }, 1800);
    } catch (err) {
        btn.textContent = 'Copy failed';
    }
});

/* =========================================================
   31. SKILLS & HOBBIES
   ========================================================= */
function populateSkillsForm() {
    const s = document.getElementById('skillsList');
    const h = document.getElementById('hobbiesList');
    if (s) s.value = (contentData.skills || []).join('\n');
    if (h) h.value = (contentData.hobbies || []).join('\n');
}

document.getElementById('skillsForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const skillsRaw  = (document.getElementById('skillsList')?.value || '').trim();
    const hobbiesRaw = (document.getElementById('hobbiesList')?.value || '').trim();

    contentData.skills  = skillsRaw  ? skillsRaw.split('\n').map(s => s.trim()).filter(Boolean) : [];
    contentData.hobbies = hobbiesRaw ? hobbiesRaw.split('\n').map(s => s.trim()).filter(Boolean) : [];

    saveContent();
    if (document.getElementById('skillsCard')) renderSkillsPage();
    showAdminToast('Skills and hobbies saved');
    playSound('success');
});

function renderSkillsPage() {
    const skillsCard  = document.getElementById('skillsCard');
    const hobbiesCard = document.getElementById('hobbiesCard');
    if (!skillsCard && !hobbiesCard) return;

    const renderList = (card, title, items, emptyCopy) => {
        const list = (items || []).map(s => String(s).trim()).filter(Boolean);
        if (!list.length) {
            card.innerHTML = `
                <h2 class="skills-card-title">${title}</h2>
                <p class="no-content">${emptyCopy}</p>`;
            card.style.display = '';
            return;
        }
        card.innerHTML = `
            <h2 class="skills-card-title">${title}<span class="skills-count">${list.length}</span></h2>
            <div class="skills-chips">
                ${list.map(s => `<span class="skills-chip">${escapeHtml(s)}</span>`).join('')}
            </div>`;
        card.style.display = '';
    };

    if (skillsCard) {
        renderList(
            skillsCard,
            'Skills',
            (contentData.skills || []).slice().sort((a, b) => a.localeCompare(b)),
            'Add a few skills in the editor.'
        );
    }

    if (hobbiesCard) {
        renderList(
            hobbiesCard,
            'Hobbies',
            (contentData.hobbies || []).slice().sort((a, b) => a.localeCompare(b)),
            'Add a few hobbies in the editor.'
        );
    }
}

/* =========================================================
32. CROSS-PAGE NAVIGATION PARAMS
(?roll=1 or ?date=YYYY-MM-DD arriving from a subpage)
========================================================= */
(function handleCrossPageParams() {
if (!document.getElementById('postList')) return;
const params = new URLSearchParams(location.search);
const rollParam = params.get('roll');
const dateParam = params.get('date');

if (rollParam === '1' && getCurrentTab() === 'home') {
    setTimeout(() => { if (typeof rollDice === 'function') rollDice(); }, 300);
}

if (dateParam) {
    const parts = dateParam.split('-');
    if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const d = parseInt(parts[2], 10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
            currentDateFilter = new Date(y, m - 1, d);
            renderCalendar(currentViewDate);
            renderPosts();
        }
    }
}

if (rollParam || dateParam) {
    history.replaceState({}, '', location.pathname);
}
})();

/* =========================================================
   33. SURVEY — ADMIN FORM
   ========================================================= */
function populateSurveyAdminForm() {
    // Contact email is global (from profile)
    const emailEl = document.getElementById('surveyContactEmail');
    if (emailEl) emailEl.value = (contentData.profile && contentData.profile.email) || '';

    // Reset to "Add New Survey" state
    resetSurveyForm();
    renderAdminSurveyList();
}

function resetSurveyForm() {
    if (!Array.isArray(contentData.surveys)) contentData.surveys = [];
    const titleEl = document.getElementById('surveyFormTitle');
    if (titleEl) titleEl.textContent = 'Add New Survey';
    const editId = document.getElementById('surveyEditId');
    if (editId) editId.value = '';
    const t = document.getElementById('surveyTitle');
    if (t) t.value = '';
    const a = document.getElementById('surveyActive');
    if (a) a.checked = false;
    const it = document.getElementById('surveyIntroTitle');
    if (it) it.value = 'Share your thoughts';
    const ix = document.getElementById('surveyIntroText');
    if (ix) ix.value = '';
    const tt = document.getElementById('surveyThankYouTitle');
    if (tt) tt.value = 'Thank you!';
    const tm = document.getElementById('surveyThankYouMessage');
    if (tm) tm.value = '';
    resetSurveyFieldsEditor();
}

function loadSurveyForEdit(surveyId) {
    const s = contentData.surveys.find(x => x.id === surveyId);
    if (!s) return;
    document.getElementById('surveyFormTitle').textContent = 'Edit Survey';
    document.getElementById('surveyEditId').value = s.id;
    document.getElementById('surveyTitle').value = s.title || '';
    document.getElementById('surveyActive').checked = !!s.active;
    document.getElementById('surveyIntroTitle').value = s.introTitle || '';
    document.getElementById('surveyIntroText').value = s.introText || '';
    document.getElementById('surveyThankYouTitle').value = s.thankYouTitle || '';
    document.getElementById('surveyThankYouMessage').value = s.thankYouMessage || '';
    loadSurveyFieldsIntoEditor(s);
    document.getElementById('surveyForm').scrollIntoView({ behavior: 'smooth' });
}

function renderAdminSurveyList() {
    const listEl = document.getElementById('adminSurveyList');
    if (!listEl) return;
    if (!Array.isArray(contentData.surveys) || !contentData.surveys.length) {
        listEl.innerHTML = '<p class="admin-empty">No surveys yet. Add one above.</p>';
        return;
    }
    listEl.innerHTML = contentData.surveys.map(s => `
        <div class="admin-item">
            <div class="admin-item-info">
                <strong>${escapeHtml(s.title || '(untitled)')} ${s.active ? '★' : ''}</strong>
                <span>${s.active ? 'Active' : 'Inactive'} · ${(s.fields || []).length} field${(s.fields || []).length !== 1 ? 's' : ''}</span>
            </div>
            <div class="admin-item-actions">
                <button data-survey-action="edit" data-survey-id="${s.id}" type="button">Edit</button>
                ${!s.active ? `<button data-survey-action="activate" data-survey-id="${s.id}" type="button">Set Active</button>` : ''}
                <button data-survey-action="delete" data-survey-id="${s.id}" type="button">Delete</button>
            </div>
        </div>
    `).join('');
}

document.getElementById('surveyForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    ensureSurveysArray();

    const title = (document.getElementById('surveyTitle')?.value || '').trim();
    if (!title) { alert('Survey title is required.'); return; }

    if (!workingSurveyFields.length) { alert('Add at least one field before saving.'); return; }
    for (let i = 0; i < workingSurveyFields.length; i++) {
        const f = workingSurveyFields[i];
        if (!f.name || !f.name.trim()) {
            alert(`Field ${i + 1} needs a name.`);
            return;
        }
        if (!f.blocks || !f.blocks.length) {
            alert(`Field "${f.name}" is empty — add at least one block.`);
            return;
        }
    }

    const editId = document.getElementById('surveyEditId')?.value || '';
    const active = !!document.getElementById('surveyActive')?.checked;

    // If activating, deactivate all others
    if (active) {
        contentData.surveys.forEach(s => s.active = false);
    }

    const surveyObj = {
        id: editId || ('s_' + Math.random().toString(36).slice(2, 10)),
        title,
        active,
        introTitle: (document.getElementById('surveyIntroTitle')?.value || '').trim(),
        introText: (document.getElementById('surveyIntroText')?.value || '').trim(),
        thankYouTitle: (document.getElementById('surveyThankYouTitle')?.value || '').trim(),
        thankYouMessage: (document.getElementById('surveyThankYouMessage')?.value || '').trim(),
        fields: workingSurveyFields.map(f => ({
            name: f.name.trim(),
            blocks: (f.blocks || []).map(serializeSurveyBlock)
        }))
    };

    if (editId) {
        const idx = contentData.surveys.findIndex(s => s.id === editId);
        if (idx !== -1) contentData.surveys[idx] = surveyObj;
        else contentData.surveys.push(surveyObj);
    } else {
        contentData.surveys.push(surveyObj);
    }

    // Contact email (global)
    if (!contentData.profile) contentData.profile = {};
    contentData.profile.email = (document.getElementById('surveyContactEmail')?.value || '').trim();

    saveContent();
    resetSurveyForm();
    renderAdminSurveyList();
    if (document.getElementById('surveyDynamicContent')) renderSurveyPage();
    playSound('success');
});

document.getElementById('surveyCancelBtn')?.addEventListener('click', resetSurveyForm);

document.getElementById('adminSurveyList')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-survey-action]');
    if (!btn) return;
    const id = btn.dataset.surveyId;
    const action = btn.dataset.surveyAction;
    const survey = contentData.surveys.find(s => s.id === id);
    if (!survey) return;

    if (action === 'edit') {
        loadSurveyForEdit(id);
    } else if (action === 'activate') {
        contentData.surveys.forEach(s => s.active = false);
        survey.active = true;
        saveContent();
        renderAdminSurveyList();
        if (document.getElementById('surveyDynamicContent')) renderSurveyPage();
    } else if (action === 'delete') {
        if (!confirm(`Delete survey "${survey.title}"?`)) return;
        contentData.surveys = contentData.surveys.filter(s => s.id !== id);
        saveContent();
        renderAdminSurveyList();
        if (document.getElementById('surveyDynamicContent')) renderSurveyPage();
    }
});

/* =========================================================
   34. SURVEY — PAGE RENDERER + VISITOR FORM
   ========================================================= */
let surveyPage = 0;
let surveyAnswers = {};
let surveySubmitted = false;
let surveySubmitting = false;

function setSurveyStatus(message, mailto = '') {
    const status = document.getElementById('surveySubmitStatus');
    if (!status) return;
    status.replaceChildren();
    status.hidden = !message;
    if (!message) return;
    status.append(document.createTextNode(message));
    if (mailto) {
        const link = document.createElement('a');
        link.href = mailto;
        link.textContent = 'Open an email draft.';
        status.append(document.createTextNode(' '), link);
    }
}

function renderSurveyPage() {
    const container = document.getElementById('surveyDynamicContent');
    if (!container) return;

    const s = getActiveSurvey();
    if (!s) {
        container.innerHTML = '<p class="no-posts">No active survey. Check back later.</p>';
        const thanksTitleEl0 = document.getElementById('surveyThanksTitle');
        if (thanksTitleEl0) thanksTitleEl0.textContent = '';
        return;
    }
    const fields = s.fields || [];

    // Thank-you card content (state-independent)
    const thanksTitleEl = document.getElementById('surveyThanksTitle');
    const thanksMsgEl   = document.getElementById('surveyThanksMessage');
    if (thanksTitleEl) thanksTitleEl.textContent = s.thankYouTitle || 'Thank you!';
    if (thanksMsgEl) {
        const paragraphs = (s.thankYouMessage || '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
        thanksMsgEl.innerHTML = paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('');
    }

    const formCard   = document.getElementById('surveyFormCard');
    const thanksCard = document.getElementById('surveyThanksCard');

    const surveyContainer = container.closest('.survey-container');
    if (surveySubmitted) {
        if (formCard)   formCard.style.display   = 'none';
        if (thanksCard) thanksCard.style.display = '';
        if (surveyContainer) surveyContainer.classList.add('is-thanked');
        return;
    } else {
        if (formCard)   formCard.style.display   = '';
        if (thanksCard) thanksCard.style.display = 'none';
        if (surveyContainer) surveyContainer.classList.remove('is-thanked');
    }

    if (!fields.length) {
        container.innerHTML = '<p class="no-posts">No survey fields configured yet.</p>';
        return;
    }

    if (surveyPage === 0) {
        container.innerHTML = renderSurveyIntro(s);
    } else {
        const fieldIdx = surveyPage - 1;
        container.innerHTML = renderSurveyFieldScreen(fields[fieldIdx], fieldIdx, surveyPage, fields.length);
    }
}

function renderSurveyIntro(s) {
    const title = s.introTitle || 'Share your thoughts';
    const text  = s.introText || '';
    return `
        <div class="survey-intro-screen">
            <h2 class="survey-card-title">${escapeHtml(title)}</h2>
            ${text ? `<p class="survey-intro">${escapeHtml(text)}</p>` : ''}
            <button type="button" class="survey-submit survey-start-btn" data-survey-action="start">Start →</button>
        </div>
    `;
}

function renderSurveyFieldScreen(field, fieldIdx, pageNum, totalFields) {
    if (!field) return '<p class="no-posts">Missing field.</p>';
    const blocksHtml = (field.blocks || []).map((block, bi) => renderSurveyBlock(block, fieldIdx, bi)).join('');
    const isFirst = pageNum === 1;
    const isLast  = pageNum === totalFields;

    const navHtml = `
        <div class="survey-page-nav">
            <button type="button" class="survey-nav-prev" ${isFirst ? 'disabled' : ''} data-survey-action="prev">‹ Prev</button>
            <span class="survey-progress">${pageNum} / ${totalFields}</span>
            ${isLast
                ? `<button type="button" class="survey-nav-submit" data-survey-action="submit">Submit</button>`
                : `<button type="button" class="survey-nav-next" data-survey-action="next">Next ›</button>`
            }
        </div>
    `;

    return `
        <div class="survey-field-screen" data-field-idx="${fieldIdx}">
            <div class="survey-field-name-badge">${escapeHtml(field.name || 'Section')}</div>
            ${navHtml}
            <div class="survey-field-content">${blocksHtml}</div>
            ${navHtml}
        </div>
    `;
}

function renderSurveyBlock(block, fi, bi) {
    const key = fi + '-' + bi;
    const existing = surveyAnswers[key] || '';
    const req = block.required ? ' <span class="survey-req">*</span>' : '';

    if (block.type === 'heading') {
        return `<h3 class="survey-field-heading">${escapeHtml(block.content || '')}</h3>`;
    }
    if (block.type === 'paragraph') {
        return `<p class="survey-field-paragraph">${escapeHtml(block.content || '')}</p>`;
    }
    if (block.type === 'text') {
        return `
            <div class="survey-input-group">
                <label>${escapeHtml(block.label || '')}${req}</label>
                <input type="${/email/i.test(block.label || '') ? 'email' : 'text'}" data-key="${key}" value="${escapeHtml(existing)}" placeholder="${escapeHtml(block.placeholder || '')}" autocomplete="${/email/i.test(block.label || '') ? 'email' : 'off'}">
            </div>`;
    }
    if (block.type === 'textarea') {
        return `
            <div class="survey-input-group">
                <label>${escapeHtml(block.label || '')}${req}</label>
                <textarea data-key="${key}" rows="5" placeholder="${escapeHtml(block.placeholder || '')}">${escapeHtml(existing)}</textarea>
            </div>`;
    }
    if (block.type === 'select') {
        const opts = (block.options || []).map(o =>
            `<option value="${escapeHtml(o)}" ${existing === o ? 'selected' : ''}>${escapeHtml(o)}</option>`
        ).join('');
        return `
            <div class="survey-input-group">
                <label>${escapeHtml(block.label || '')}${req}</label>
                <select data-key="${key}">
                    <option value="">— Select —</option>
                    ${opts}
                </select>
            </div>`;
    }
    if (block.type === 'radio') {
        const opts = (block.options || []).map(o =>
            `<label class="survey-radio-option">
                <input type="radio" name="radio-${key}" data-key="${key}" value="${escapeHtml(o)}" ${existing === o ? 'checked' : ''}>
                <span>${escapeHtml(o)}</span>
            </label>`
        ).join('');
        return `
            <div class="survey-input-group" data-key="${key}">
                <label>${escapeHtml(block.label || '')}${req}</label>
                <div class="survey-radio-group">${opts}</div>
            </div>`;
    }
    if (block.type === 'rating') {
        let stars = '';
        for (let i = 5; i >= 1; i--) {
            const checked = existing === String(i) ? 'checked' : '';
            stars += `<input type="radio" name="rating-${key}" id="rating-${key}-${i}" data-key="${key}" value="${i}" ${checked}><label for="rating-${key}-${i}" title="${i} star${i !== 1 ? 's' : ''}">★</label>`;
        }
        return `
            <div class="survey-input-group" data-key="${key}">
                <label>${escapeHtml(block.label || '')}${req}</label>
                <div class="rating-stars">${stars}</div>
            </div>`;
    }
    return '';
}

/* Survey page navigation */
document.getElementById('surveyDynamicContent')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-survey-action]');
    if (!btn) return;
    const action = btn.dataset.surveyAction;

    if (action === 'start') {
        surveyPage = 1;
        renderSurveyPage();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (action === 'prev') {
        captureSurveyFieldAnswers();
        if (surveyPage > 1) {
            surveyPage--;
            renderSurveyPage();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } else if (action === 'next') {
        captureSurveyFieldAnswers();
        const fieldIdx = surveyPage - 1;
        if (!validateSurveyField(fieldIdx)) return;
        surveyPage++;
        renderSurveyPage();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (action === 'submit') {
        captureSurveyFieldAnswers();
        const fieldIdx = surveyPage - 1;
        if (!validateSurveyField(fieldIdx)) return;
        submitSurvey();
    }
});

function captureSurveyFieldAnswers() {
    const container = document.getElementById('surveyDynamicContent');
    if (!container) return;
    container.querySelectorAll('[data-key]').forEach(el => {
        const key = el.dataset.key;
        if (el.type === 'radio') {
            if (el.checked) surveyAnswers[key] = el.value;
        } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
            surveyAnswers[key] = el.value;
        }
    });
}

function validateSurveyField(fieldIdx) {
    const active = getActiveSurvey();
    if (!active) return true;
    const field = (active.fields || [])[fieldIdx];
    if (!field) return true;
    let allValid = true;

    (field.blocks || []).forEach((block, bi) => {
        if (!block.required) return;
        if (block.type === 'heading' || block.type === 'paragraph') return;
        const key = fieldIdx + '-' + bi;
        const val = surveyAnswers[key];
        const isEmpty = !val || (typeof val === 'string' && !val.trim());
        if (isEmpty) {
            allValid = false;
            const group = document.querySelector(`.survey-input-group[data-key="${key}"]`);
            const el    = document.querySelector(`[data-key="${key}"]`);
            const target = group || el;
            if (target) {
                target.classList.add('has-error');
                setTimeout(() => target.classList.remove('has-error'), 2500);
            }
        }
    });
    return allValid;
}

async function submitSurvey() {
    if (surveySubmitting) return;

    const toEmail = (contentData.profile && contentData.profile.email || '').trim();
    const active = getActiveSurvey();
    if (!active) { alert('No active survey.'); return; }
    const fields = active.fields || [];

    // Find a name-like value for the subject line
    let nameVal = '';
    let replyEmail = '';
    for (let fi = 0; fi < fields.length; fi++) {
        for (let bi = 0; bi < (fields[fi].blocks || []).length; bi++) {
            const b = fields[fi].blocks[bi];
            if (b.type === 'text' && b.label && /name/i.test(b.label)) {
                const v = surveyAnswers[fi + '-' + bi];
                if (v) { nameVal = v; break; }
            }
        }
        if (nameVal) break;
    }
    for (let fi = 0; fi < fields.length && !replyEmail; fi++) {
        const bi = (fields[fi].blocks || []).findIndex(block => block.type === 'text' && /email/i.test(block.label || ''));
        if (bi !== -1) replyEmail = surveyAnswers[fi + '-' + bi] || '';
    }

    const subject = nameVal ? `Survey response from ${nameVal}` : 'Portfolio survey response';

    const bodyLines = [];
    fields.forEach((field, fi) => {
        bodyLines.push(`── ${field.name || 'Field ' + (fi + 1)} ──`);
        (field.blocks || []).forEach((block, bi) => {
            if (block.type === 'heading' || block.type === 'paragraph') return;
            const key = fi + '-' + bi;
            const val = surveyAnswers[key];
            if (val && (typeof val !== 'string' || val.trim())) {
                bodyLines.push(`${block.label || block.type}: ${val}`);
            }
        });
        bodyLines.push('');
    });
    const body = bodyLines.join('\n').trim();
    const mailto = `mailto:${toEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    const endpoint = String(window.PORTFOLIO_CONFIG?.formspreeEndpoint || '').trim();
    if (!endpoint) {
        if (!toEmail) {
            setSurveyStatus('Online delivery is not configured and no contact email is available. Please try again later.');
            return;
        }
        setSurveyStatus('Online delivery is not configured. Your answers are still here; send the email draft to deliver them.', mailto);
        window.location.href = mailto;
        return;
    }

    surveySubmitting = true;
    setSurveyStatus('Sending your response…');
    document.querySelectorAll('[data-survey-action="submit"]').forEach(button => { button.disabled = true; });

    let response;
    try {
        response = await fetch(endpoint, {
            method: 'POST',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({
                _subject: subject,
                survey: active.title || 'Portfolio survey',
                respondent: nameVal,
                replyEmail,
                response: body
            })
        });
    } catch (error) {
        console.error('Survey endpoint could not be reached.', error);
        surveySubmitting = false;
        document.querySelectorAll('[data-survey-action="submit"]').forEach(button => { button.disabled = false; });
        if (toEmail) {
            setSurveyStatus('The survey service could not be reached. Your answers are still here; use the backup email option.', mailto);
            window.location.href = mailto;
        } else {
            setSurveyStatus('The survey service could not be reached, and no contact email is available. Your answers are still here; please try again later.');
        }
        return;
    }

    surveySubmitting = false;
    document.querySelectorAll('[data-survey-action="submit"]').forEach(button => { button.disabled = false; });
    if (!response.ok) {
        console.error(`Survey endpoint returned HTTP ${response.status}.`);
        setSurveyStatus(`The survey service rejected the response (HTTP ${response.status}). Your answers are still here; please try again.`);
        return;
    }

    setSurveyStatus('');
    surveySubmitted = true;
    renderSurveyPage();
    playSound('success');
}

document.getElementById('surveyResetBtn')?.addEventListener('click', () => {
    surveyPage = 0;
    surveyAnswers = {};
    surveySubmitted = false;
    surveySubmitting = false;
    setSurveyStatus('');
    renderSurveyPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

