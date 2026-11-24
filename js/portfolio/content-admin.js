/* =========================================================
   35. LABELS ADMIN
   ========================================================= */
function countLabelUsage(key) {
    let posts = 0, photos = 0;
    (contentData.posts || []).forEach(p => { if (p.label === key) posts++; });
    (contentData.photos || []).forEach(p => {
        if (Array.isArray(p.labels) && p.labels.includes(key)) photos++;
    });
    return { posts, photos, total: posts + photos };
}

function resetLabelsForm() {
    const form = document.getElementById('labelsForm');
    if (!form) return;
    form.reset();
    const editKey = document.getElementById('labelEditKey');
    if (editKey) editKey.value = '';
    const titleEl = document.getElementById('labelsFormTitle');
    if (titleEl) titleEl.textContent = 'Add New Label';
    const colorEl = document.getElementById('labelColor');
    if (colorEl) colorEl.value = '#B5E8A0';
    updateLabelPreview();
}

function updateLabelPreview() {
    const preview = document.getElementById('labelPreview');
    const colorEl = document.getElementById('labelColor');
    const keyEl = document.getElementById('labelKeyInput');
    if (!preview || !colorEl) return;
    const color = colorEl.value;
    const name = (keyEl?.value || 'Preview').trim() || 'Preview';
    preview.textContent = formatLabelName(name);
    preview.style.background = color;
}

function renderAdminLabelsList() {
    const listEl = document.getElementById('adminLabelsList');
    if (!listEl) return;
    const keys = Object.keys(contentData.labels || {});
    if (!keys.length) {
        listEl.innerHTML = '<p class="admin-empty">No labels yet. Add one above.</p>';
        return;
    }

    listEl.innerHTML = keys.sort().map(key => {
        const rawColor = (contentData.labels[key] || {}).color || '#E0E0E0';
        const color = /^#[0-9a-f]{3,8}$/i.test(rawColor) ? rawColor : '#E0E0E0';
        const usage = countLabelUsage(key);
        const usageText = usage.total > 0
            ? `${usage.posts} note${usage.posts !== 1 ? 's' : ''}, ${usage.photos} photo${usage.photos !== 1 ? 's' : ''}`
            : 'Unused';
        return `
            <div class="admin-item">
                <div class="admin-item-info">
                    <strong>
                        <span class="admin-label-chip" style="background:${color};">${escapeHtml(formatLabelName(key))}</span>
                    </strong>
                    <span>${escapeHtml(color.toUpperCase())} / ${usageText}</span>
                </div>
                <div class="admin-item-actions">
                    <button data-action="edit" data-label-key="${escapeHtml(key)}" type="button">Edit</button>
                    <button data-action="delete" data-label-key="${escapeHtml(key)}" type="button">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

document.getElementById('labelsForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const keyInput = document.getElementById('labelKeyInput');
    const colorInput = document.getElementById('labelColor');
    const editKey = document.getElementById('labelEditKey').value;
    if (!keyInput || !colorInput) return;

    const rawKey = keyInput.value.trim().toLowerCase();
    if (!rawKey) { alert('Label name is required.'); return; }

    // Rename check: block if key changed while in use
    if (editKey && editKey !== rawKey) {
        const usage = countLabelUsage(editKey);
        if (usage.total > 0) {
            alert(`"${editKey}" is used in ${usage.total} item${usage.total !== 1 ? 's' : ''}. Remove those references before renaming.`);
            return;
        }
        delete contentData.labels[editKey];
    }

    // Duplicate check
    if (!editKey || editKey !== rawKey) {
        if (contentData.labels[rawKey]) {
            alert(`Label "${rawKey}" already exists.`);
            return;
        }
    }

    contentData.labels[rawKey] = { color: colorInput.value.toLowerCase() };

    saveContent();
    resetLabelsForm();
    refreshAfterLabelsChange();
    playSound('success');
});

document.getElementById('labelsCancelBtn')?.addEventListener('click', resetLabelsForm);

document.getElementById('adminLabelsList')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const key = btn.dataset.labelKey;
    if (!key || !contentData.labels[key]) return;

    if (btn.dataset.action === 'edit') {
        document.getElementById('labelEditKey').value = key;
        document.getElementById('labelKeyInput').value = key;
        document.getElementById('labelColor').value = contentData.labels[key].color || '#B5E8A0';
        document.getElementById('labelsFormTitle').textContent = 'Edit Label';
        updateLabelPreview();
        document.getElementById('labelsForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (btn.dataset.action === 'delete') {
        const usage = countLabelUsage(key);
        if (usage.total > 0) {
            alert(`Cannot delete "${key}" — it's used in ${usage.total} item${usage.total !== 1 ? 's' : ''}. Remove those references first.`);
            return;
        }
        if (!confirm(`Delete label "${key}"?`)) return;
        delete contentData.labels[key];
        saveContent();
        refreshAfterLabelsChange();
        resetLabelsForm();
    }
});

// Quick-pick swatches
document.querySelectorAll('.label-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
        const colorEl = document.getElementById('labelColor');
        if (colorEl) {
            colorEl.value = swatch.dataset.color;
            updateLabelPreview();
        }
    });
});

// Live preview on color/key change
document.getElementById('labelColor')?.addEventListener('input', updateLabelPreview);
document.getElementById('labelKeyInput')?.addEventListener('input', updateLabelPreview);

function refreshAfterLabelsChange() {
    populateLabelSelect();
    populatePhotoLabelPicker();
    renderAdminLabelsList();
    if (document.getElementById('postList')) {
        renderLabelChips();
        renderPosts();
    }
    if (typeof currentViewDate !== 'undefined') renderCalendar(currentViewDate);
    const photosModal = document.getElementById('photosModal');
    if (photosModal && !photosModal.hidden) renderPhotosModal();
}

/* =========================================================
   36. POSTS FIELDS EDITOR
   ========================================================= */
let workingFields = [];
let currentPostTab = 'home';

function resetPostsFieldsEditor() {
    workingFields = [];
    renderFieldsEditor();
}

function renderFieldsEditor() {
    const editor = document.getElementById('fieldsEditor');
    if (!editor) return;

    if (!workingFields.length) {
        editor.innerHTML = '<p class="admin-empty">No fields yet. Click <strong>+ Add Field</strong> to begin.</p>';
        return;
    }

    editor.innerHTML = workingFields.map((field, fi) => {
        const isExpanded = field._expanded !== false;
        const blockCount = (field.blocks || []).length;
        return `
        <div class="field-editor ${isExpanded ? 'is-expanded' : 'is-collapsed'}" data-fi="${fi}">
            <div class="field-editor-header">
                <button type="button" class="field-toggle-btn" data-action="toggle-field" data-fi="${fi}" title="${isExpanded ? 'Collapse' : 'Expand'}">
                    ${isExpanded ? '▼' : '▶'}
                </button>
                <input type="text" class="field-name" data-fi="${fi}" value="${escapeHtml(field.name || '')}" placeholder="Field name (required)">
                ${!isExpanded ? `<span class="field-collapsed-meta">${blockCount} block${blockCount !== 1 ? 's' : ''}</span>` : ''}
                <button type="button" class="field-remove-btn" data-action="remove-field" data-fi="${fi}" title="Remove field">×</button>
            </div>
            ${isExpanded ? `
            <div class="field-blocks">
                ${(field.blocks || []).map((block, bi) => `
                    <div class="block-editor" data-fi="${fi}" data-bi="${bi}">
                        <span class="block-type-badge">${block.type}</span>
                        ${block.type === 'paragraph'
                            ? `<textarea class="block-content-textarea" data-fi="${fi}" data-bi="${bi}" rows="3" placeholder="Paragraph text…">${escapeHtml(block.content || '')}</textarea>`
                            : block.type === 'actions'
                            ? `<textarea class="block-content-textarea" data-fi="${fi}" data-bi="${bi}" rows="3" placeholder="One per line: Label | href | primary">${escapeHtml(block.content || '')}</textarea>`
                            : `<input type="text" class="block-content-input" data-fi="${fi}" data-bi="${bi}" value="${escapeHtml(block.content || '')}" placeholder="${block.type} text…">`
                        }
                        <button type="button" class="block-remove-btn" data-action="remove-block" data-fi="${fi}" data-bi="${bi}" title="Remove block">×</button>
                    </div>
                `).join('')}
            </div>
            <div class="field-add-block-row">
                <button type="button" class="add-block-btn" data-action="add-block" data-type="title" data-fi="${fi}">+ Title</button>
                <button type="button" class="add-block-btn" data-action="add-block" data-type="subtitle" data-fi="${fi}">+ Subtitle</button>
                <button type="button" class="add-block-btn" data-action="add-block" data-type="paragraph" data-fi="${fi}">+ Paragraph</button>
                <button type="button" class="add-block-btn" data-action="add-block" data-type="actions" data-fi="${fi}">+ Actions</button>
            </div>
            ` : ''}
        </div>
    `;
    }).join('');
}

document.getElementById('addFieldBtn')?.addEventListener('click', () => {
    workingFields.push({ name: '', blocks: [], _expanded: true });
    renderFieldsEditor();
});

document.getElementById('fieldsEditor')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const fi = parseInt(btn.dataset.fi, 10);
    if (isNaN(fi)) return;

    if (btn.dataset.action === 'toggle-field') {
        if (!workingFields[fi]) return;
        workingFields[fi]._expanded = workingFields[fi]._expanded === false;
        renderFieldsEditor();
    } else if (btn.dataset.action === 'remove-field') {
        if (!confirm('Remove this field and all its blocks?')) return;
        workingFields.splice(fi, 1);
        renderFieldsEditor();
    } else if (btn.dataset.action === 'add-block') {
        const type = btn.dataset.type;
        if (!workingFields[fi]) return;
        workingFields[fi].blocks.push({ type, content: '' });
        renderFieldsEditor();
    } else if (btn.dataset.action === 'remove-block') {
        const bi = parseInt(btn.dataset.bi, 10);
        if (isNaN(bi) || !workingFields[fi]) return;
        workingFields[fi].blocks.splice(bi, 1);
        renderFieldsEditor();
    }
});

/* Live-sync field name + block content into workingFields */
document.getElementById('fieldsEditor')?.addEventListener('input', (e) => {
    const t = e.target;
    const fi = parseInt(t.dataset.fi, 10);
    if (isNaN(fi) || !workingFields[fi]) return;

    if (t.classList.contains('field-name')) {
        workingFields[fi].name = t.value;
    } else if (t.classList.contains('block-content-input') || t.classList.contains('block-content-textarea')) {
        const bi = parseInt(t.dataset.bi, 10);
        if (!isNaN(bi) && workingFields[fi].blocks[bi]) {
            workingFields[fi].blocks[bi].content = t.value;
        }
    }
});

/* =========================================================
   37. POSTS MANAGER — TAB CONTEXT
   ========================================================= */
function updateAdminFormTitle() {
    const titleEl = document.getElementById('adminFormTitle');
    if (!titleEl) return;
    const label = currentPostTab === 'home' ? 'Home' : (currentPostTab.charAt(0).toUpperCase() + currentPostTab.slice(1));
    if (adminEditIndex.value === '') {
        titleEl.textContent = 'Add a ' + label + ' note';
    } else {
        titleEl.textContent = 'Edit ' + label + ' note';
    }
}

/* =========================================================
   38. PAGINATION & READING MODES
   ========================================================= */
let activeReadingPostId = null;
let postReadingPage = 0;
let heroReadingTab = null;
let heroReadingPage = 0;

function getCurrentTab() {
    const page = document.body.dataset.page || '';
    return ['home', 'profile', 'education', 'experience', 'skills', 'survey'].includes(page)
        ? page
        : null;
}

function renderBlockHtml(block) {
    if (!block || !block.content) return '';
    if (block.type === 'title')     return `<h2 class="post-field-title">${escapeHtml(block.content)}</h2>`;
    if (block.type === 'subtitle')  return `<h3 class="post-field-subtitle">${escapeHtml(block.content)}</h3>`;
    if (block.type === 'paragraph') return `<p class="post-field-paragraph">${escapeHtml(block.content)}</p>`;
    if (block.type === 'actions') {
        const actions = String(block.content).split('\n').map(line => {
            const [label, href, style] = line.split('|').map(s => (s || '').trim());
            return label && href ? { label, href, style: style || 'primary' } : null;
        }).filter(Boolean);
        if (!actions.length) return '';
        return `<div class="post-field-actions">${actions.map(a => {
            const href = safeHref(a.href);
            return href
                ? `<a href="${escapeHtml(href)}" class="btn btn-${escapeHtml(a.style)}">${escapeHtml(a.label)}</a>`
                : '';
        }).join('')}</div>`;
    }
    return '';
}

function renderPaginatedFields(post, pageNum, opts = {}) {
    const showNav     = opts.showNav !== false;
    const showBanners = opts.showBanners !== false;
    const fields = (post && post.fields) || [];
    const total = fields.length;
    if (total === 0) return '<p class="no-content">This post is empty.</p>';

    const clampedPage = Math.max(0, Math.min(pageNum, total - 1));
    const field = fields[clampedPage];
    const blocksHtml = (field.blocks || []).map(renderBlockHtml).join('');
    const showArrows = showNav && total > 1;

    const navHtml = showArrows ? `
        <div class="post-page-nav">
            <button class="page-prev" ${clampedPage === 0 ? 'disabled' : ''} type="button" aria-label="Previous page">‹</button>
            <span class="page-counter">${clampedPage + 1} / ${total}</span>
            <button class="page-next" ${clampedPage === total - 1 ? 'disabled' : ''} type="button" aria-label="Next page">›</button>
        </div>
    ` : '';

    const topBanner    = (showBanners && clampedPage === 0)          ? renderReplyToBanner(post)   : '';
    const bottomBanner = (showBanners && clampedPage === total - 1)  ? renderReplyFromBanner(post) : '';

    return `
        ${topBanner}
        ${navHtml}
        <div class="post-page-content" data-page="${clampedPage}">
            ${blocksHtml}
        </div>
        ${navHtml}
        ${bottomBanner}
    `;
}

/* =========================================================
   39. HOME HERO — FEATURED NOTE OR PROFILE COPY
   ========================================================= */
function getHeroPostForTab(tabName) {
    const ids = (contentData.site && contentData.site.heroPostIds) || {};
    const id = ids[tabName];
    return id ? thoughtsPosts.find(p => p.id === id) || null : null;
}

function getHeroContainer(tabName) {
    return tabName === 'home' ? document.getElementById('heroText') : null;
}

function renderHeroForTab(tabName) {
    if (tabName !== 'home') return;
    const container = getHeroContainer('home');
    if (!container) return;

    const post = getHeroPostForTab('home');
    if (!post) {
        renderHero();
        return;
    }

    const isReading = document.body.classList.contains('hero-focused') && heroReadingTab === 'home';
    container.innerHTML = isReading
        ? renderPaginatedFields(post, heroReadingPage)
        : renderPaginatedFields(post, 0, { showNav: false, showBanners: false });
}

function openHeroReading(tabName) {
    const post = getHeroPostForTab(tabName);
    if (!post) { alert('No hero post set for this tab. Pick one in admin.'); return; }
    heroReadingTab = tabName;
    heroReadingPage = 0;
    document.body.classList.add('hero-focused');
    document.body.classList.remove('post-focused');
    renderHeroForTab(tabName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeHeroReading() {
    if (!heroReadingTab) return;
    const tab = heroReadingTab;
    document.body.classList.remove('hero-focused');
    heroReadingTab = null;
    heroReadingPage = 0;
    renderHeroForTab(tab);
}

function handleHeroPage(delta) {
    if (!heroReadingTab) return;
    const post = getHeroPostForTab(heroReadingTab);
    if (!post) return;
    const total = (post.fields || []).length;
    const newPage = Math.max(0, Math.min(heroReadingPage + delta, total - 1));
    if (newPage === heroReadingPage) return;
    heroReadingPage = newPage;
    renderHeroForTab(heroReadingTab);
}

/* Handle pagination clicks globally (works in both modes) */
document.addEventListener('click', (e) => {
    const prev = e.target.closest('.page-prev');
    const next = e.target.closest('.page-next');
    if (!prev && !next) return;
    e.stopPropagation();

    if (document.body.classList.contains('hero-focused')) {
        if (prev) handleHeroPage(-1);
        if (next) handleHeroPage(1);
    } else if (document.body.classList.contains('post-focused')) {
        // handled by postList delegation
    }
});

/* =========================================================
   40. LEGACY CLEANUP
   Hero editors, the site panel in Settings and the old single
   survey migration have been replaced by the editor tabs in
   section 47. Kept out of the initialisation path on purpose.
   ========================================================= */

/* =========================================================
   43. SURVEY FIELDS EDITOR (admin)
   ========================================================= */
let workingSurveyFields = [];

function resetSurveyFieldsEditor() {
    workingSurveyFields = [];
    renderSurveyFieldsEditor();
}

function loadSurveyFieldsIntoEditor(survey) {
    workingSurveyFields = JSON.parse(JSON.stringify((survey && survey.fields) || []))
        .map(f => ({ ...f, _expanded: false }));
    renderSurveyFieldsEditor();
}

function renderSurveyFieldsEditor() {
    const editor = document.getElementById('surveyFieldsEditor');
    if (!editor) return;

    if (!workingSurveyFields.length) {
        editor.innerHTML = '<p class="admin-empty">No fields yet. Click <strong>+ Add Field</strong> to begin.</p>';
        return;
    }

    editor.innerHTML = workingSurveyFields.map((field, fi) => {
        const isExpanded = field._expanded !== false;
        const blockCount = (field.blocks || []).length;
        return `
        <div class="field-editor ${isExpanded ? 'is-expanded' : 'is-collapsed'}" data-fi="${fi}">
            <div class="field-editor-header">
                <button type="button" class="field-toggle-btn" data-action="toggle-field" data-fi="${fi}" title="${isExpanded ? 'Collapse' : 'Expand'}">
                    ${isExpanded ? '▼' : '▶'}
                </button>
                <input type="text" class="field-name" data-fi="${fi}" value="${escapeHtml(field.name || '')}" placeholder="Field name (required)">
                ${!isExpanded ? `<span class="field-collapsed-meta">${blockCount} block${blockCount !== 1 ? 's' : ''}</span>` : ''}
                <button type="button" class="field-remove-btn" data-action="remove-field" data-fi="${fi}" title="Remove field">×</button>
            </div>
            ${isExpanded ? `
            <div class="field-blocks">
                ${(field.blocks || []).map((block, bi) => renderSurveyBlockEditor(block, fi, bi)).join('')}
            </div>
            <div class="field-add-block-row">
                <button type="button" class="add-block-btn" data-action="add-block" data-type="heading"   data-fi="${fi}">+ Heading</button>
                <button type="button" class="add-block-btn" data-action="add-block" data-type="paragraph" data-fi="${fi}">+ Paragraph</button>
                <button type="button" class="add-block-btn" data-action="add-block" data-type="text"      data-fi="${fi}">+ Text</button>
                <button type="button" class="add-block-btn" data-action="add-block" data-type="textarea"  data-fi="${fi}">+ Textarea</button>
                <button type="button" class="add-block-btn" data-action="add-block" data-type="select"    data-fi="${fi}">+ Select</button>
                <button type="button" class="add-block-btn" data-action="add-block" data-type="radio"     data-fi="${fi}">+ Radio</button>
                <button type="button" class="add-block-btn" data-action="add-block" data-type="rating"    data-fi="${fi}">+ Rating</button>
            </div>
            ` : ''}
        </div>
    `;
    }).join('');
}

function renderSurveyBlockEditor(block, fi, bi) {
    const base = `<div class="block-editor" data-fi="${fi}" data-bi="${bi}">
        <span class="block-type-badge">${block.type}</span>
        <div class="block-config">
            ${renderSurveyBlockConfig(block, fi, bi)}
        </div>
        <button type="button" class="block-remove-btn" data-action="remove-block" data-fi="${fi}" data-bi="${bi}" title="Remove block">×</button>
    </div>`;
    return base;
}

function renderSurveyBlockConfig(block, fi, bi) {
    const f = (cls, val, attrs = '') =>
        `<input type="text" class="${cls}" data-fi="${fi}" data-bi="${bi}" ${attrs} value="${escapeHtml(val || '')}">`;
    const ta = (cls, val, attrs = '') =>
        `<textarea class="${cls}" data-fi="${fi}" data-bi="${bi}" ${attrs}>${escapeHtml(val || '')}</textarea>`;

    if (block.type === 'heading' || block.type === 'paragraph') {
        return ta('block-content-textarea', block.content, `rows="2" placeholder="${block.type} text…"`);
    }

    if (block.type === 'text' || block.type === 'textarea') {
        return `
            ${f('block-label-input', block.label, 'placeholder="Label (required)"')}
            ${f('block-placeholder-input', block.placeholder, 'placeholder="Placeholder (optional)"')}
            <label class="block-required-toggle">
                <input type="checkbox" class="block-required-cb" data-fi="${fi}" data-bi="${bi}" ${block.required ? 'checked' : ''}>
                Required
            </label>
        `;
    }

    if (block.type === 'select' || block.type === 'radio') {
        const optionsStr = (block.options || []).join('\n');
        return `
            ${f('block-label-input', block.label, 'placeholder="Label (required)"')}
            ${ta('block-options-textarea', optionsStr, 'rows="3" placeholder="One option per line…"')}
            <label class="block-required-toggle">
                <input type="checkbox" class="block-required-cb" data-fi="${fi}" data-bi="${bi}" ${block.required ? 'checked' : ''}>
                Required
            </label>
        `;
    }

    if (block.type === 'rating') {
        return `
            ${f('block-label-input', block.label, 'placeholder="Label (required)"')}
            <label class="block-required-toggle">
                <input type="checkbox" class="block-required-cb" data-fi="${fi}" data-bi="${bi}" ${block.required ? 'checked' : ''}>
                Required
            </label>
        `;
    }

    return '';
}

document.getElementById('addSurveyFieldBtn')?.addEventListener('click', () => {
    workingSurveyFields.push({ name: '', blocks: [], _expanded: true });
    renderSurveyFieldsEditor();
});

document.getElementById('surveyFieldsEditor')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const fi = parseInt(btn.dataset.fi, 10);
    if (isNaN(fi) || !workingSurveyFields[fi]) return;

    if (btn.dataset.action === 'toggle-field') {
        workingSurveyFields[fi]._expanded = workingSurveyFields[fi]._expanded === false;
        renderSurveyFieldsEditor();
    } else if (btn.dataset.action === 'remove-field') {
        if (!confirm('Remove this field and all its blocks?')) return;
        workingSurveyFields.splice(fi, 1);
        renderSurveyFieldsEditor();
    } else if (btn.dataset.action === 'add-block') {
        const type = btn.dataset.type;
        const newBlock = { type };
        if (type === 'heading' || type === 'paragraph') newBlock.content = '';
        if (type === 'text' || type === 'textarea') { newBlock.label = ''; newBlock.placeholder = ''; newBlock.required = false; }
        if (type === 'select' || type === 'radio') { newBlock.label = ''; newBlock.options = []; newBlock.required = false; }
        if (type === 'rating') { newBlock.label = ''; newBlock.required = false; }
        workingSurveyFields[fi].blocks.push(newBlock);
        renderSurveyFieldsEditor();
    } else if (btn.dataset.action === 'remove-block') {
        const bi = parseInt(btn.dataset.bi, 10);
        if (isNaN(bi) || !workingSurveyFields[fi].blocks[bi]) return;
        workingSurveyFields[fi].blocks.splice(bi, 1);
        renderSurveyFieldsEditor();
    }
});

document.getElementById('surveyFieldsEditor')?.addEventListener('input', (e) => {
    const t = e.target;
    const fi = parseInt(t.dataset.fi, 10);
    const bi = parseInt(t.dataset.bi, 10);
    if (isNaN(fi) || !workingSurveyFields[fi]) return;

    if (t.classList.contains('field-name')) {
        workingSurveyFields[fi].name = t.value;
        return;
    }
    if (isNaN(bi) || !workingSurveyFields[fi].blocks[bi]) return;
    const block = workingSurveyFields[fi].blocks[bi];

    if (t.classList.contains('block-content-textarea')) {
        block.content = t.value;
    } else if (t.classList.contains('block-label-input')) {
        block.label = t.value;
    } else if (t.classList.contains('block-placeholder-input')) {
        block.placeholder = t.value;
    } else if (t.classList.contains('block-options-textarea')) {
        block.options = t.value.split('\n').map(s => s.trim()).filter(Boolean);
    } else if (t.classList.contains('block-required-cb')) {
        block.required = t.checked;
    }
});

/* =========================================================
   44. MULTI-SURVEY HELPERS
   ========================================================= */
function getActiveSurvey() {
    if (!Array.isArray(contentData.surveys) || !contentData.surveys.length) return null;
    return contentData.surveys.find(s => s.active) || contentData.surveys[0];
}

function ensureSurveysArray() {
    if (!Array.isArray(contentData.surveys)) contentData.surveys = [];
    contentData.surveys.forEach(s => {
        if (!s.id) s.id = 's_' + Math.random().toString(36).slice(2, 10);
        if (typeof s.active !== 'boolean') s.active = false;
        if (!Array.isArray(s.fields)) s.fields = [];
    });
}

function serializeSurveyBlock(b) {
    const out = { type: b.type };
    if (b.type === 'heading' || b.type === 'paragraph') out.content = (b.content || '').trim();
    if (b.type === 'text' || b.type === 'textarea') {
        out.label = (b.label || '').trim();
        out.placeholder = (b.placeholder || '').trim();
        out.required = !!b.required;
    }
    if (b.type === 'select' || b.type === 'radio') {
        out.label = (b.label || '').trim();
        out.options = Array.isArray(b.options) ? b.options.slice() : [];
        out.required = !!b.required;
    }
    if (b.type === 'rating') {
        out.label = (b.label || '').trim();
        out.required = !!b.required;
    }
    return out;
}

/* =========================================================
   45. POST REPLY / CONTINUATION
   ========================================================= */
function populateReplyToSelect(excludeId) {
    const sel = document.getElementById('adminReplyTo');
    if (!sel) return;

    const tabLabels = { home: 'Home', profile: 'Profile', education: 'Education', experience: 'Experience', skills: 'Skills', survey: 'Survey' };
    const grouped = {};
    thoughtsPosts.forEach(p => {
        if (p.id === excludeId) return;
        const tab = getPostTab(p);
        if (!grouped[tab]) grouped[tab] = [];
        grouped[tab].push(p);
    });

    let html = '<option value="">— Not a reply —</option>';
    Object.keys(grouped).sort().forEach(tab => {
        html += `<optgroup label="${escapeHtml(tabLabels[tab] || tab)}">`;
        grouped[tab]
            .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
            .forEach(p => {
                html += `<option value="${p.id}">${escapeHtml(getPostTitle(p))}</option>`;
            });
        html += '</optgroup>';
    });
    sel.innerHTML = html;
}

function renderReplyToBanner(post) {
    if (!post || !post.replyTo) return '';
    const parent = thoughtsPosts.find(p => p.id === post.replyTo);
    if (!parent) return '';
    const comment = (post.replyComment || 'continued').trim();
    return `
        <div class="post-continuation-banner post-continuation-top">
            <span class="post-continuation-icon">↩</span>
            <span class="post-continuation-text">
                ${escapeHtml(comment)} from
                <button class="post-continuation-link" data-open-post="${parent.id}" type="button">${escapeHtml(getPostTitle(parent))}</button>
            </span>
        </div>
    `;
}

function renderReplyFromBanner(post) {
    if (!post || !post.id) return '';
    const children = thoughtsPosts.filter(p => p.replyTo === post.id);
    if (!children.length) return '';
    return `
        <div class="post-continuation-banner post-continuation-bottom">
            <span class="post-continuation-icon">↪</span>
            <span class="post-continuation-text">Continues in:</span>
            <div class="post-continuation-links">
                ${children.map(c => {
                    const comment = (c.replyComment || 'continued').trim();
                    return `<button class="post-continuation-link" data-open-post="${c.id}" type="button">${escapeHtml(getPostTitle(c))} <em>(${escapeHtml(comment)})</em></button>`;
                }).join('')}
            </div>
        </div>
    `;
}

/* =========================================================
   46. CONTINUATION LINK CLICK + ?post= URL PARAM
   ========================================================= */
document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-open-post]');
    if (!link) return;
    e.preventDefault();
    const postId = link.dataset.openPost;
    const post = thoughtsPosts.find(p => p.id === postId);
    if (!post) return;

    // Close any open reading/hero mode first
    if (document.body.classList.contains('post-focused')) closePostReading();
    if (document.body.classList.contains('hero-focused')) closeHeroReading();

    // Try local card
    const card = document.querySelector(`.post-card[data-post-id="${postId}"]`);
    if (card) {
        openPostReading(card);
        return;
    }

    // Not on this page — navigate to Home and open there
    window.location.href = `index.html?post=${encodeURIComponent(postId)}`;
});

/* Extend URL param handling — append ?post= support */
(function handlePostParam() {
    if (!document.getElementById('postList')) return;
    const params = new URLSearchParams(location.search);
    const postParam = params.get('post');
    if (!postParam) return;

    setTimeout(() => {
        const card = document.querySelector(`.post-card[data-post-id="${postParam}"]`);
        if (card && typeof openPostReading === 'function') openPostReading(card);
    }, 350);

    history.replaceState({}, '', location.pathname);
})();


/* =========================================================
   46b. SITE SETTINGS, FEATURED NOTE & DATA TOOLS
   ========================================================= */
function populateSiteForm() {
    const site = contentData.site || {};
    const nameEl = document.getElementById('siteProjectName');
    if (nameEl) nameEl.value = site.projectName || 'PORTFOLIO';
    const themeEl = document.getElementById('siteTheme');
    if (themeEl) {
        const theme = site.theme === 'neobrutalism' ? 'retro-bold' : (site.theme || 'retro');
        themeEl.value = theme === 'retro-bold' ? 'retro-bold' : 'retro';
    }
}

function renderHeroSelects() {
    const host = document.getElementById('heroSelects');
    if (!host) return;

    const current = (contentData.site && contentData.site.heroPostIds && contentData.site.heroPostIds.home) || '';
    const homePosts = thoughtsPosts
        .filter(p => getPostTab(p) === 'home')
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    host.innerHTML = `
        <div class="admin-field">
            <label for="heroSelectHome">Home hero</label>
            <select id="heroSelectHome" data-hero-tab="home">
                <option value="">Profile copy (default)</option>
                ${homePosts.map(p =>
                    `<option value="${escapeHtml(p.id)}" ${p.id === current ? 'selected' : ''}>${escapeHtml(getPostTitle(p))} — ${escapeHtml(p.date || '')}</option>`
                ).join('')}
            </select>
            <small class="admin-hint-inline">A featured note replaces the profile hero on the home page and is hidden from the notes list.</small>
        </div>`;
}

function setHeroForTab(tab, postId) {
    if (!contentData.site) contentData.site = { projectName: 'PORTFOLIO', theme: 'retro' };
    if (!contentData.site.heroPostIds) contentData.site.heroPostIds = {};

    contentData.site.heroPostIds[tab] = postId || null;

    saveContent();
    if (document.getElementById('heroText')) renderHeroForTab('home');
    if (document.getElementById('postList')) renderPosts();
    renderAdminList();
    renderHeroSelects();
    showAdminToast(postId ? 'Featured note updated' : 'Using profile copy');
}

/* --- Site form --- */
document.getElementById('siteForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!contentData.site) contentData.site = { projectName: 'PORTFOLIO', theme: 'retro' };
    contentData.site.projectName = (document.getElementById('siteProjectName')?.value || '').trim() || 'PORTFOLIO';
    contentData.site.theme = document.getElementById('siteTheme')?.value || 'retro';
    saveContent();
    renderTheme();
    updateHeaderName();
    showAdminToast('Site settings saved');
});

document.getElementById('heroSelects')?.addEventListener('change', (e) => {
    const select = e.target.closest('select[data-hero-tab]');
    if (!select) return;
    setHeroForTab(select.dataset.heroTab, select.value || null);
});

/* --- Notes toolbar --- */
function populateAdminPostTabSelect() {
    const select = document.getElementById('adminPostTab');
    if (!select) return;
    select.value = currentPostTab;
    if (select.dataset.bound === 'true') return;
    select.dataset.bound = 'true';
    select.addEventListener('change', () => {
        currentPostTab = select.value;
        resetAdminForm();
        renderAdminList();
    });
}

(function bindAdminPostSearch() {
    const search = document.getElementById('adminPostSearch');
    if (!search) return;
    let timer;
    search.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(renderAdminList, 120);
    });
})();

/* --- Local draft tools --- */
function formatBytes(bytes) {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function localStorageBytes() {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        total += (key.length + (localStorage.getItem(key) || '').length) * 2;
    }
    return total;
}

function updateStorageMeter() {
    const bar = document.getElementById('storageBar');
    const label = document.getElementById('storageUsage');
    if (!bar && !label) return;

    const contentBytes = new Blob([JSON.stringify(contentData)]).size;
    const used = localStorageBytes();
    const budget = 5 * 1024 * 1024;
    const pct = Math.min(100, (used / budget) * 100);

    if (bar) bar.style.width = Math.max(2, pct).toFixed(1) + '%';
    if (label) {
        label.textContent = `${formatBytes(contentBytes)} of content · ${formatBytes(used)} in this browser (${pct.toFixed(2)}% of a typical 5 MB budget).`;
    }
}

function validateContent() {
    const issues = [];
    const p = contentData.profile || {};

    if (!p.name) issues.push('Profile name is empty.');
    if (!p.email) issues.push('No contact email — header and footer links fall back to the survey.');
    if (!p.bio) issues.push('Profile bio is empty; the home hero will feel thin.');

    if (!Array.isArray(contentData.posts) || contentData.posts.length === 0) {
        issues.push('No notes yet.');
    } else {
        const seen = new Set();
        contentData.posts.forEach((post, i) => {
            const label = `Note ${i + 1}`;
            if (!post.id) issues.push(`${label} has no id.`);
            else if (seen.has(post.id)) issues.push(`${label} has a duplicate id (${post.id}).`);
            seen.add(post.id);
            if (!post.date) issues.push(`${label} has no date.`);
            if (!Array.isArray(post.fields) || !post.fields.length) issues.push(`${label} has no content fields.`);
        });
    }

    const heroId = contentData.site?.heroPostIds?.home;
    if (heroId && !contentData.posts.some(post => post.id === heroId)) {
        issues.push('The featured home note points at a note that no longer exists.');
    }

    if (!Array.isArray(contentData.education) || !contentData.education.length) {
        issues.push('Education is empty.');
    }
    if (!Array.isArray(contentData.experience) || !contentData.experience.length) {
        issues.push('Experience is empty.');
    }

    const activeSurveys = (contentData.surveys || []).filter(s => s.active);
    if (!activeSurveys.length) issues.push('No active survey — the survey page will show an empty state.');
    if (activeSurveys.length > 1) issues.push('More than one survey is active; only the first is shown.');

    return issues;
}

document.getElementById('adminValidateBtn')?.addEventListener('click', () => {
    const box = document.getElementById('dataValidation');
    if (!box) return;
    const issues = validateContent();
    box.hidden = false;
    box.classList.toggle('has-errors', issues.length > 0);
    if (issues.length) {
        box.innerHTML = `<strong>${issues.length} thing${issues.length === 1 ? '' : 's'} to look at</strong><br>` +
            issues.map(i => '• ' + escapeHtml(i)).join('<br>');
    } else {
        box.textContent = 'Content looks good: every note, entry and survey has what it needs.';
    }
});

function downloadJson(filename) {
    const blob = new Blob([JSON.stringify(contentData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

document.getElementById('adminBackupBtn')?.addEventListener('click', () => {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadJson(`portfolio-backup-${stamp}.json`);
    showAdminToast('Backup downloaded');
});

document.getElementById('adminCopyBtn')?.addEventListener('click', async () => {
    const text = JSON.stringify(contentData, null, 2);
    try {
        await navigator.clipboard.writeText(text);
        showAdminToast('JSON copied to clipboard');
    } catch (err) {
        const area = document.createElement('textarea');
        area.value = text;
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        area.remove();
        showAdminToast('JSON copied');
    }
});

/* Open the editor when the page was loaded with ?admin=1 */
if (isAdmin) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (adminBackdrop && adminBackdrop.hidden) openAdmin();
        }, 250);
    });
}

