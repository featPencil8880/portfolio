/* =========================================================
   18. ADMIN POST EDITOR
   ========================================================= */
const adminBackdrop  = document.getElementById('adminBackdrop');
const adminListEl    = document.getElementById('adminList');
const adminForm      = document.getElementById('adminForm');
const adminEditIndex = document.getElementById('adminEditIndex');
const adminDate      = document.getElementById('adminDate');
const adminLabelSel  = document.getElementById('adminLabel');
const adminFormTitle = document.getElementById('adminFormTitle');
const adminAuthorSel = document.getElementById('adminAuthor');

function populateAuthorSelect() {
    if (!adminAuthorSel) return;
    adminAuthorSel.innerHTML = AUTHORS
        .map(a => `<option value="${a}">${a}</option>`)
        .join('');
}

let lastFocusedEl = null;

function openAdmin() {
    if (!adminBackdrop) return;
    lastFocusedEl = document.activeElement;

    currentPostTab = 'home';
    const search = document.getElementById('adminPostSearch');
    if (search) search.value = '';

    populateLabelSelect();
    populateAuthorSelect();
    populateProfileForm();
    populateSiteForm();
    populateAdminPostTabSelect();
    renderHeroSelects();
    populatePhotoLabelPicker();
    resetAdminForm();
    resetPhotoForm();
    resetEducationForm();
    resetExperienceForm();
    populateSkillsForm();
    populateSurveyAdminForm();
    resetLabelsForm();
    renderAdminLabelsList();
    renderAdminPhotoList();
    renderAdminEducationList();
    renderAdminExperienceList();
    updateStorageMeter();

    adminBackdrop.hidden = false;
    document.body.style.overflow = 'hidden';
    activateAdminTab('posts');

    const panel = adminBackdrop.querySelector('.admin-panel');
    if (panel) panel.focus({ preventScroll: true });
}

function closeAdmin() {
    if (!adminBackdrop) return;
    adminBackdrop.hidden = true;
    document.body.style.overflow = '';
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
        lastFocusedEl.focus({ preventScroll: true });
    }
}

function populateLabelSelect() {
    if (!adminLabelSel) return;
    adminLabelSel.innerHTML = Object.keys(postLabels)
        .map(k => `<option value="${k}">${formatLabelName(k)}</option>`)
        .join('');
}

function resetAdminForm() {
    if (!adminForm) return;
    adminForm.reset();
    adminEditIndex.value = '';
    adminDate.value = new Date().toISOString().slice(0, 10);
    const replySel = document.getElementById('adminReplyTo');
    if (replySel) replySel.value = '';
    const replyComment = document.getElementById('adminReplyComment');
    if (replyComment) replyComment.value = '';
    resetPostsFieldsEditor();
    updateAdminFormTitle();
    populateReplyToSelect(null);
}
function persistPosts() {
    saveContent();
}
function refreshMainViews() {
    renderLabelChips();
    renderPosts();
    if (typeof currentViewDate !== 'undefined' && document.getElementById('calendarGrid')) {
        renderCalendar(currentViewDate);
    }
    if (document.getElementById('heroText')) renderHeroForTab('home');
    if (document.getElementById('profileName')) renderProfilePage();
    updateHeaderName();
}

function renderAdminList() {
    if (!adminListEl) return;

    const query = (document.getElementById('adminPostSearch')?.value || '').trim().toLowerCase();

    const tabFiltered = thoughtsPosts
        .map((p, i) => ({ p, i }))
        .filter(({ p }) => getPostTab(p) === currentPostTab)
        .filter(({ p }) => {
            if (!query) return true;
            const haystack = [
                getPostTitle(p), p.date, p.label, p.author, getPostPreview(p).excerpt
            ].join(' ').toLowerCase();
            return haystack.includes(query);
        });

    if (tabFiltered.length === 0) {
        const label = currentPostTab === 'home' ? '' : currentPostTab + ' ';
        adminListEl.innerHTML = `<p class="admin-empty">No ${label}notes${query ? ' match that search' : ' yet'}.</p>`;
        return;
    }

    const currentHeroId = contentData.site && contentData.site.heroPostIds
        ? contentData.site.heroPostIds[currentPostTab] : null;

    const sorted = tabFiltered.sort((a, b) => b.p.date.localeCompare(a.p.date));
    adminListEl.innerHTML = sorted.map(({ p, i }) => {
        const isHero = p.id === currentHeroId;
        const heroBtn = currentPostTab === 'home'
            ? `<button data-action="hero" data-index="${i}" type="button" title="Promote to the Home hero">${isHero ? '★ Featured' : '☆ Feature'}</button>`
            : '';
        return `
            <div class="admin-item">
                <div class="admin-item-info">
                    <strong>${escapeHtml(getPostTitle(p))}${isHero ? ' ★' : ''}</strong>
                    <span>${escapeHtml(p.date)} / ${escapeHtml(formatLabelName(p.label))}${p.author ? ` / ${escapeHtml(p.author)}` : ''}</span>
                </div>
                <div class="admin-item-actions">
                    <button data-action="edit" data-index="${i}" type="button">Edit</button>
                    <button data-action="duplicate" data-index="${i}" type="button">Duplicate</button>
                    ${heroBtn}
                    <button data-action="delete" data-index="${i}" type="button">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

/* --- Editor access ---
   `?admin=1` unlocks the editor for this page view. The content never
   leaves the browser until it is exported, so this is a convenience
   gate rather than a security boundary. */
const isAdmin = new URLSearchParams(location.search).get('admin') === '1';
document.body.classList.toggle('is-admin', isAdmin);

if (isAdmin) {
    document.getElementById('thoughtBtn')?.addEventListener('click', openAdmin);
}

document.getElementById('adminCloseBtn')?.addEventListener('click', closeAdmin);
adminBackdrop?.addEventListener('click', (e) => {
    if (e.target === adminBackdrop) closeAdmin();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && adminBackdrop && !adminBackdrop.hidden) closeAdmin();
});

// Keep keyboard focus inside whatever dialog is open
document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const dialog = [adminBackdrop, settingsBackdrop, photosModal]
        .find(el => el && !el.hidden);
    if (!dialog) return;
    const focusables = dialog.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
    }
});

/* --- Save (add or edit) --- */
adminForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate
    if (!adminDate.value) { alert('Date is required.'); return; }

    if (!workingFields.length) {
        alert('Add at least one field before saving.');
        return;
    }
    for (let i = 0; i < workingFields.length; i++) {
        const f = workingFields[i];
        if (!f.name || !f.name.trim()) {
            alert(`Field ${i + 1} needs a name.`);
            return;
        }
        if (!f.blocks || !f.blocks.length) {
            alert(`Field "${f.name}" is empty — add at least one block.`);
            return;
        }
        for (const b of f.blocks) {
            if (!b.content || !b.content.trim()) {
                alert(`Field "${f.name}" has an empty ${b.type} block.`);
                return;
            }
        }
    }

    const replyToEl = document.getElementById('adminReplyTo');
    const replyCommentEl = document.getElementById('adminReplyComment');
    const replyTo = replyToEl ? replyToEl.value.trim() : '';
    const replyComment = replyCommentEl ? replyCommentEl.value.trim() : '';

    const post = {
        id:      adminEditIndex.value === '' ? genPostId() : (thoughtsPosts[parseInt(adminEditIndex.value, 10)] || {}).id || genPostId(),
        date:    adminDate.value,
        tab:     currentPostTab,
        label:   adminLabelSel.value,
        author:  adminAuthorSel.value,
        photos:  (adminEditIndex.value !== '' && thoughtsPosts[parseInt(adminEditIndex.value, 10)]?.photos) || [],
        fields:  workingFields.map(f => ({
            name:   f.name.trim(),
            blocks: f.blocks.map(b => ({ type: b.type, content: b.content.trim() }))
        }))
    };
    if (replyTo) post.replyTo = replyTo;
    if (replyTo && replyComment) post.replyComment = replyComment;

    const idx = adminEditIndex.value;
    if (idx === '') {
        thoughtsPosts.push(post);
    } else {
        thoughtsPosts[parseInt(idx, 10)] = post;
    }
    persistPosts();
    refreshMainViews();
    renderAdminList();
    resetAdminForm();
    playSound('success');
});

/* --- Edit / Delete from list --- */
adminListEl?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const idx = parseInt(btn.dataset.index, 10);
    const post = thoughtsPosts[idx];
    if (!post) return;

    if (btn.dataset.action === 'hero') {
        if (!contentData.site.heroPostIds) contentData.site.heroPostIds = {};
        const currentHero = contentData.site.heroPostIds[currentPostTab];
        contentData.site.heroPostIds[currentPostTab] = currentHero === post.id ? null : post.id;
        saveContent();
        renderAdminList();
        renderHeroForTab(currentPostTab);
        if (document.getElementById('postList')) renderPosts();
        playSound('success');
    } else if (btn.dataset.action === 'edit') {
        adminEditIndex.value = idx;
        adminDate.value = post.date;
        adminLabelSel.value = post.label;
        if (post.author && adminAuthorSel) adminAuthorSel.value = post.author;
        currentPostTab = getPostTab(post);
        workingFields = JSON.parse(JSON.stringify(post.fields || [])).map(f => ({ ...f, _expanded: false }));
        renderFieldsEditor();

        populateReplyToSelect(post.id);
        const replySel = document.getElementById('adminReplyTo');
        if (replySel && post.replyTo) replySel.value = post.replyTo;
        const replyComment = document.getElementById('adminReplyComment');
        if (replyComment) replyComment.value = post.replyComment || '';

        updateAdminFormTitle();
        adminForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (btn.dataset.action === 'duplicate') {
        const copy = JSON.parse(JSON.stringify(post));
        copy.id = genPostId();
        copy.hideFromList = false;
        copy.date = new Date().toISOString().slice(0, 10);
        if (copy.fields && copy.fields[0] && Array.isArray(copy.fields[0].blocks)) {
            const titleBlock = copy.fields[0].blocks.find(b => b.type === 'title');
            if (titleBlock) titleBlock.content = (titleBlock.content || 'Untitled') + ' (copy)';
        }
        thoughtsPosts.push(copy);
        persistPosts();
        refreshMainViews();
        renderAdminList();
        showAdminToast('Note duplicated');
    } else if (btn.dataset.action === 'delete') {
        if (!confirm('Delete this post?')) return;
        thoughtsPosts.splice(idx, 1);
        persistPosts();
        refreshMainViews();
        renderAdminList();
        resetAdminForm();
    }
});

document.getElementById('adminCancelBtn')?.addEventListener('click', resetAdminForm);

document.getElementById('adminTodayBtn')?.addEventListener('click', () => {
    const dateInput = document.getElementById('adminDate');
    if (dateInput) dateInput.value = new Date().toISOString().slice(0, 10);
});

/* --- Profile form: populate --- */
function populateProfileForm() {
    const p = contentData.profile || {};
    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val || '';
    };
    setVal('pfName', p.name);
    setVal('pfPronouns', p.pronouns);
    setVal('pfGreeting', p.greeting);
    setVal('pfTitle', p.title);
    setVal('pfTagline', p.tagline);
    setVal('pfBio', p.bio);
    setVal('pfAbout', p.about);
    setVal('pfLocation', p.location);
    setVal('pfEmail', p.email);
    setVal('pfLinkedin', p.linkedin);
    setVal('pfActions', (p.actions || [])
        .map(a => [a.label || '', a.href || '', a.style || 'primary'].join(' | '))
        .join('\n'));
}

/* --- Profile form: save --- */
function saveProfileForm() {
    const g = (id) => (document.getElementById(id)?.value || '').trim();

    if (!contentData.profile) contentData.profile = {};
    const p = contentData.profile;

    p.name     = g('pfName') || 'IAN';
    p.pronouns = g('pfPronouns');
    p.greeting = g('pfGreeting');
    p.title    = g('pfTitle');
    p.tagline  = g('pfTagline');
    p.bio      = g('pfBio');
    p.about    = g('pfAbout');
    p.location = g('pfLocation');
    p.email    = g('pfEmail');
    p.linkedin = g('pfLinkedin');
    p.actions  = g('pfActions').split('\n').map(line => {
        const [label, href, style] = line.split('|').map(s => (s || '').trim());
        return label && href ? { label, href, style: style || 'primary' } : null;
    }).filter(Boolean);

    saveContent();
    updateHeaderName();
    if (document.getElementById('heroText')) renderHeroForTab('home');
    if (document.getElementById('profileName')) renderProfilePage();
    if (document.getElementById('postList')) renderPosts();
    showAdminToast('Profile saved');
    playSound('success');
}

/* --- Profile form: submit + reset --- */
document.getElementById('profileForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    saveProfileForm();
});
document.getElementById('profileCancelBtn')?.addEventListener('click', populateProfileForm);

/* --- Export --- */
document.getElementById('adminExportBtn')?.addEventListener('click', () => {
    downloadJson('content.json');
    showAdminToast('content.json exported');
});

/* --- Import --- */
const importInput = document.getElementById('adminImportInput');
document.getElementById('adminImportBtn')?.addEventListener('click', () => importInput?.click());
importInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const parsed = JSON.parse(ev.target.result);

            if (Array.isArray(parsed)) {
                // Legacy: array of posts
                parsed.forEach((p, i) => {
                    if (!p.date || !p.title || !p.excerpt) {
                        throw new Error(`Post #${i + 1} is missing date, title or excerpt.`);
                    }
                });
                applyContent({ posts: parsed });
                saveContent();
                showAdminToast(`Imported ${parsed.length} legacy note${parsed.length === 1 ? '' : 's'}`);
            } else if (parsed && typeof parsed === 'object') {
                applyContent(parsed);
                saveContent();
                const postCount = Array.isArray(parsed.posts) ? parsed.posts.length : 0;
                const eduCount  = Array.isArray(parsed.education) ? parsed.education.length : 0;
                showAdminToast(`Imported ${postCount} note${postCount === 1 ? '' : 's'}, ${eduCount} education entr${eduCount === 1 ? 'y' : 'ies'}`);
            } else {
                throw new Error('The file must contain a content object or a posts array.');
            }

            if (document.getElementById('adminList')) renderAdminList();
            resetAdminForm();
            populateProfileForm();
            populateSiteForm();
            renderHeroSelects();
            updateStorageMeter();
        } catch (err) {
            alert('Import failed: ' + err.message);
        }
    };
    reader.readAsText(file);
    e.target.value = '';
});

/* --- Reset to defaults --- */
document.getElementById('adminResetBtn')?.addEventListener('click', async () => {
    if (!confirm('Discard local draft and reload from content.json (or hardcoded defaults)?')) return;
    localStorage.removeItem('portfolioContent');
    localStorage.removeItem('thoughtsPosts'); // legacy cleanup

    let source = null;

    // Try content.json first
    try {
        const res = await fetch('content.json', { cache: 'no-cache' });
        if (res.ok) {
            const data = await res.json();
            if (data && typeof data === 'object' && !Array.isArray(data)) {
                source = data;
            }
        }
    } catch (e) { /* ignore */ }

    // Fall back to legacy posts.json
    if (!source) {
        try {
            const res = await fetch('posts.json', { cache: 'no-cache' });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    source = { posts: data };
                }
            }
        } catch (e) { /* ignore */ }
    }

    // Final fallback: hardcoded defaults
    if (!source) {
        source = JSON.parse(JSON.stringify(DEFAULT_CONTENT));
    }

    applyContent(source);
    if (document.getElementById('adminList')) renderAdminList();
    resetAdminForm();
    populateProfileForm();
    populateSiteForm();
    renderHeroSelects();
    renderAdminEducationList();
    renderAdminExperienceList();
    renderAdminPhotoList();
    renderAdminLabelsList();
    populateSurveyAdminForm();
    updateStorageMeter();
    showAdminToast('Local draft reset');
});

/* =========================================================
   19. SETTINGS DRAWER LOGIC
   ========================================================= */
const settingsBtn        = document.getElementById('settingsBtn');
const settingsBackdrop   = document.getElementById('settingsBackdrop');
const settingsCloseBtn   = document.getElementById('settingsCloseBtn');
const settingReduceMotion = document.getElementById('settingReduceMotion');
const settingSoundEffects = document.getElementById('settingSoundEffects');
const settingClockMode   = document.getElementById('settingClockMode');
const fontSizeGroup      = document.getElementById('fontSizeGroup');
const settingsClearDataBtn = document.getElementById('settingsClearDataBtn');

function openSettings() {
    if (!settingsBackdrop) return;
    applySettings();
    settingsBackdrop.hidden = false;
    document.body.style.overflow = 'hidden';
    const panel = settingsBackdrop.querySelector('.settings-panel');
    if (panel) panel.focus({ preventScroll: true });
}

function closeSettings() {
    if (!settingsBackdrop) return;
    settingsBackdrop.classList.remove('is-open');
    settingsBackdrop.hidden = true;
    document.body.style.overflow = '';
    settingsBtn?.focus({ preventScroll: true });
}

// Wire up the gear icon
settingsBtn?.addEventListener('click', openSettings);
settingsCloseBtn?.addEventListener('click', closeSettings);
settingsBackdrop?.addEventListener('click', (e) => {
    if (e.target === settingsBackdrop) closeSettings();
});

// Escape key closes settings
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && settingsBackdrop && !settingsBackdrop.hidden) closeSettings();
});

// Toggles
settingReduceMotion?.addEventListener('change', (e) => {
    settings.reduceMotion = e.target.checked;
    saveSettings();
    applySettings();
});

settingSoundEffects?.addEventListener('change', (e) => {
    settings.soundEffects = e.target.checked;
    saveSettings();
    applySettings();
    if (settings.soundEffects) playSound('success'); // Confirmation blip
});

document.getElementById('settingSoundProfile')?.addEventListener('change', (e) => {
    settings.soundProfile = e.target.value;
    saveSettings();
    playSound('click'); // Play a preview of the new sound
});

// Font Size
fontSizeGroup?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-value]');
    if (!btn) return;
    settings.fontSize = btn.dataset.value;
    saveSettings();
    applySettings();
    playSound('click');
});

// Clock Mode Dropdown
settingClockMode?.addEventListener('change', (e) => {
    setClockMode(e.target.value);
    playSound('click');
});

// Clear Local Data
settingsClearDataBtn?.addEventListener('click', () => {
    if (!confirm('This clears the local draft, reading preferences and any photo handles stored in this browser. Published files are untouched.')) return;
    for (const key of ['portfolioContent', 'thoughtsPosts', 'portfolioSettings']) {
        localStorage.removeItem(key);
    }
    location.reload();
});

/* =========================================================
   20. GLOBAL SOUND EFFECTS ATTACHMENT
   ========================================================= */
// Add subtle hover sounds to all interactive elements (FIXED to only trigger once per element)
let lastHoveredElement = null;
document.addEventListener('mouseover', (e) => {
    const interactive = e.target.closest('button, a, .left-panel-btn, .post-card, .calendar-day:not(.empty):not(.header)');
    
    // If we are hovering over a new interactive element, play the sound
    if (interactive !== lastHoveredElement) {
        lastHoveredElement = interactive;
        if (interactive) playSound('hover');
    }
});

// Add click sounds to all interactive elements
document.addEventListener('click', (e) => {
    if (e.target.closest('button, a, .left-panel-btn, .post-card, .calendar-day:not(.empty):not(.header)')) {
        playSound('click');
    }
});

/* =========================================================
   21. LABEL FILTER CHIPS
   ========================================================= */
function renderLabelChips() {
    const container = document.getElementById('postFilterChips');
    if (!container) return;

    const currentTab = getCurrentTab();

    // Count posts per label on this page only
    const counts = {};
    thoughtsPosts.forEach(p => {
        if (p.hideFromList) return;
        if (currentTab && currentTab !== 'home' && getPostTab(p) !== currentTab) return;
        const key = p.label || 'general';
        counts[key] = (counts[key] || 0) + 1;
    });

    // If the active label no longer exists, reset the filter
    if (activeLabelFilter && !counts[activeLabelFilter]) {
        activeLabelFilter = null;
        renderPosts();
    }

    const sortedLabels = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);

    if (sortedLabels.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = sortedLabels.map(key => {
        const raw = getLabel(key).color;
        const color = /^#[0-9a-f]{3,8}$/i.test(raw || '') ? raw : '#d6cebf';
        const isActive = key === activeLabelFilter;
        return `
            <button class="post-filter-chip${isActive ? ' is-active' : ''}"
                    data-label="${key}"
                    style="--chip-color: ${color};"
                    type="button">
                <span>${formatLabelName(key)}</span>
                <span class="chip-count">${counts[key]}</span>
            </button>
        `;
    }).join('');
}

document.getElementById('postFilterChips')?.addEventListener('click', (e) => {
    const chip = e.target.closest('.post-filter-chip');
    if (!chip) return;
    const label = chip.dataset.label;
    activeLabelFilter = (activeLabelFilter === label) ? null : label;
    renderLabelChips();
    renderPosts();
});

/* =========================================================
   22. RANDOM POST DICE
   ========================================================= */
let lastRandomIndex = -1;
let diceAnimating = false;

function openPostByReference(post) {
    const card = document.querySelector(`.post-card[data-post-id="${post.id}"]`);
    if (card) {
        openPostReading(card);
        return;
    }
    // The note may live on another page
    const tab = getPostTab(post);
    if (tab && tab !== 'home') {
        window.location.href = `${tab}.html?post=${encodeURIComponent(post.id)}`;
    }
}

function rollDice() {
    if (diceAnimating) return;
    if (thoughtsPosts.length === 0) return;

    diceAnimating = true;

    // Reset any filters so the target post is guaranteed in the DOM
    currentDateFilter = null;
    activeLabelFilter = null;
    renderLabelChips();
    if (typeof currentViewDate !== 'undefined') renderCalendar(currentViewDate);
    renderPosts();

    // Pick a random post (avoid repeat when >1 available)
    let idx;
    if (thoughtsPosts.length === 1) {
        idx = 0;
    } else {
        do {
            idx = Math.floor(Math.random() * thoughtsPosts.length);
        } while (idx === lastRandomIndex);
    }
    lastRandomIndex = idx;
    const chosenPost = thoughtsPosts[idx];

    const overlay = document.getElementById('diceOverlay');
    if (!overlay) { diceAnimating = false; return; }
    const flickerText = document.getElementById('diceFlickerText'); // optional — may be null

    overlay.hidden = false;

    // Respect Reduce Motion — skip the spin and flicker
    if (settings.reduceMotion) {
        if (flickerText) flickerText.textContent = getPostTitle(chosenPost);
        playSound('success');
        setTimeout(() => {
            overlay.hidden = true;
            diceAnimating = false;
            openPostByReference(chosenPost);
        }, 200);
        return;
    }

    // Normal path: flicker titles + roll sounds
    if (flickerText) flickerText.textContent = getPostTitle(chosenPost);

    const flickerInterval = flickerText ? setInterval(() => {
        const rand = thoughtsPosts[Math.floor(Math.random() * thoughtsPosts.length)];
        flickerText.textContent = getPostTitle(rand);
    }, 90) : null;

    const rollInterval = setInterval(() => {
        playSound('roll');
    }, 70);

    // Lock in at 800ms
    setTimeout(() => {
        if (flickerInterval) clearInterval(flickerInterval);
        clearInterval(rollInterval);
        if (flickerText) flickerText.textContent = getPostTitle(chosenPost);
        playSound('success');
    }, 800);

    // Close and open at 1100ms
    setTimeout(() => {
        overlay.hidden = true;
        diceAnimating = false;
        openPostByReference(chosenPost);
    }, 1100);
}

document.getElementById('diceBtn')?.addEventListener('click', () => {
    if (getCurrentTab() === 'home') {
        rollDice();
    } else {
        window.location.href = 'index.html?roll=1';
    }
});

/* =========================================================
   23. CALENDAR "BACK TO TODAY" BUTTON
   ========================================================= */
document.getElementById('calendarTodayBtn')?.addEventListener('click', () => {
    currentViewDate = new Date();
    currentDateFilter = null;
    renderCalendar(currentViewDate);
    renderPosts();
});

/* =========================================================
   24. ADMIN TABS
   ========================================================= */
document.querySelector('.admin-tabs')?.addEventListener('click', (e) => {
    const tab = e.target.closest('.admin-tab');
    if (!tab) return;
    activateAdminTab(tab.dataset.tab);
});

function activateAdminTab(target) {
    if (!target) return;
    document.querySelectorAll('.admin-tab').forEach(t => {
        const active = t.dataset.tab === target;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', String(active));
    });

    document.querySelectorAll('.admin-tab-panel').forEach(p => {
        const panelName = 'adminPanel' + target.charAt(0).toUpperCase() + target.slice(1);
        p.classList.toggle('is-active', p.id === panelName);
    });

    if (target === 'posts') renderAdminList();
    if (target === 'data') updateStorageMeter();
    if (target === 'site') {
        populateSiteForm();
        renderHeroSelects();
    }
    if (target === 'profile') populateProfileForm();
    if (target === 'skills') populateSkillsForm();
    if (target === 'photos') renderAdminPhotoList();
    if (target === 'education') renderAdminEducationList();
    if (target === 'experience') renderAdminExperienceList();
    if (target === 'labels') renderAdminLabelsList();
    if (target === 'survey') populateSurveyAdminForm();

    const body = document.querySelector('.admin-body');
    if (body) body.scrollTop = 0;
}

