/* =========================================================
   9. HERO RENDERING
   ========================================================= */
function renderProfileMeta(p) {
    const parts = [];
    if (p.location) parts.push(`<span class="profile-meta-item">⌖ ${escapeHtml(p.location)}</span>`);
    if (p.email) {
        parts.push(`<span class="profile-meta-item"><a href="mailto:${escapeHtml(p.email)}">✉ Email</a></span>`);
    }
    if (p.linkedin) {
        const url = p.linkedin.startsWith('http') ? p.linkedin : `https://${p.linkedin}`;
        parts.push(`<span class="profile-meta-item"><a href="${escapeHtml(url)}" target="_blank" rel="noopener">↗ LinkedIn</a></span>`);
    }
    if (parts.length === 0) return '';
    return `<div class="hero-meta">${parts.join('<span class="meta-sep">/</span>')}</div>`;
}

function actionClass(style) {
    if (style === 'primary') return 'btn btn--primary';
    if (style === 'secondary') return 'btn btn--ghost';
    return 'btn btn--ghost';
}

function renderActions(actions, className = 'hero-actions') {
    if (!Array.isArray(actions) || !actions.length) return '';
    return `<div class="${className}">
        ${actions.map(a =>
            `<a href="${escapeHtml(a.href || '#')}" class="${actionClass(a.style)}">${escapeHtml(a.label || '')}</a>`
        ).join('')}
    </div>`;
}

function renderHero() {
    const el = document.getElementById('heroText');
    if (!el) return;
    const p = contentData.profile || {};
    const name = (p.name || 'IAN').trim() || 'IAN';

    el.innerHTML = `
        <p class="eyebrow"><span class="eyebrow-dot" aria-hidden="true"></span>Portfolio${p.location ? ' · ' + escapeHtml(p.location) : ''}</p>
        <h1 class="hero-name" id="heroName">${escapeHtml(name)}${p.pronouns ? ` <span class="hero-pronouns">(${escapeHtml(p.pronouns)})</span>` : ''}</h1>
        ${p.title ? `<p class="hero-role">${escapeHtml(p.title)}</p>` : ''}
        ${p.tagline ? `<p class="hero-tagline">${escapeHtml(p.tagline)}</p>` : ''}
        ${p.bio ? `<p class="hero-bio">${escapeHtml(p.bio)}</p>` : ''}
        ${renderActions(p.actions)}
        ${renderProfileMeta(p)}
    `;
}

/* =========================================================
   10. POSTS RENDERING
   ========================================================= */
let currentDateFilter = null;
let activeLabelFilter = null;

function formatPostDate(dateStr) {
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr || 'Undated';
    const [y, m, d] = dateStr.split('-');
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric'
    });
}

function renderPosts() {
    const postList = document.getElementById('postList');
    const clearBtn = document.getElementById('clearPostFilter');
    if (!postList) return;

    document.body.classList.remove('post-focused');

    const currentTab = getCurrentTab();
    let filtered = [...thoughtsPosts];

    // Tab filter — Home shows all, subpages show only their tab
    if (currentTab && currentTab !== 'home') {
        filtered = filtered.filter(p => getPostTab(p) === currentTab);
    }

    if (currentDateFilter) {
        const key = `${currentDateFilter.getFullYear()}-${String(currentDateFilter.getMonth() + 1).padStart(2, '0')}-${String(currentDateFilter.getDate()).padStart(2, '0')}`;
        filtered = filtered.filter(p => p.date === key);
    }

    if (activeLabelFilter) {
        filtered = filtered.filter(p => (p.label || 'general') === activeLabelFilter);
    }

    filtered.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    const visible = filtered.filter(p => !p.hideFromList);

    if (visible.length === 0) {
        const tabLabel = currentTab && currentTab !== 'home'
            ? (currentTab.charAt(0).toUpperCase() + currentTab.slice(1) + ' ')
            : '';
        let message = tabLabel ? `No ${tabLabel}notes yet.` : 'No notes for this day yet.';
        if (currentDateFilter && activeLabelFilter) {
            message = `No ${tabLabel}notes labelled “${formatLabelName(activeLabelFilter)}” on this date.`;
        } else if (activeLabelFilter) {
            message = `No ${tabLabel}notes labelled “${formatLabelName(activeLabelFilter)}” yet.`;
        } else if (currentDateFilter) {
            message = `No ${tabLabel}notes on this date.`;
        }
        postList.innerHTML = `<p class="no-posts">${escapeHtml(message)}</p>`;
    } else {
        postList.innerHTML = visible.map(post => {
            const label = getLabel(post.label);
            const safeColor = /^#[0-9a-f]{3,8}$/i.test(label.color || '') ? label.color : '#d6cebf';
            const preview = getPostPreview(post);
            return `
                <article class="post-card" data-post-id="${escapeHtml(post.id)}" style="--label-color: ${safeColor};" tabindex="0" role="button" aria-label="Read ${escapeHtml(preview.title)}">
                    <a class="post-card-permalink" href="${escapeHtml(getPostUrl(post))}" title="Permalink" aria-label="Permalink to ${escapeHtml(preview.title)}">↗</a>
                    <div class="post-label">
                        ${LABEL_ICON_SVG}
                        <span class="post-label-text">${escapeHtml(formatLabelName(post.label))}</span>
                    </div>
                    <div class="post-card-date">
                      ${escapeHtml(formatPostDate(post.date))}${post.author ? ` · ${escapeHtml(post.author)}` : ''}
                    </div>
                    <h4 class="post-card-title">${escapeHtml(preview.title)}</h4>
                    ${preview.subtitle ? `<p class="post-card-subtitle">${escapeHtml(preview.subtitle)}</p>` : ''}
                    ${preview.excerpt ? `<p class="post-card-excerpt">${escapeHtml(preview.excerpt)}</p>` : ''}
                    <div class="post-reading-view"></div>
                </article>
            `;
        }).join('');
    }

    const showClear = currentDateFilter || activeLabelFilter;
    if (clearBtn) clearBtn.style.display = showClear ? 'inline-block' : 'none';
}

/* =========================================================
   11. CLOCK
   ========================================================= */
const digitalClock   = document.getElementById('digitalClock');
const analogClock    = document.getElementById('analogClock');
const clockToggleBtn = document.getElementById('clockToggleBtn');
const digitalIcon    = document.getElementById('digitalIcon');
const analogIcon     = document.getElementById('analogIcon');
const hourHand       = document.getElementById('hourHand');
const minHand        = document.getElementById('minHand');
const secHand        = document.getElementById('secHand');

function setClockMode(mode) {
    settings.clockMode = mode;
    saveSettings();

    const clockSelect = document.getElementById('settingClockMode');
    if (clockSelect) clockSelect.value = mode;

    if (mode === 'analog') {
        if (digitalClock) digitalClock.style.display = 'none';
        if (analogClock) analogClock.style.display = 'block';
        if (digitalIcon) digitalIcon.style.display = 'none';
        if (analogIcon) analogIcon.style.display = 'block';
    } else {
        if (digitalClock) digitalClock.style.display = 'block';
        if (analogClock) analogClock.style.display = 'none';
        if (digitalIcon) digitalIcon.style.display = 'block';
        if (analogIcon) analogIcon.style.display = 'none';
    }
    updateClock();
}

if (clockToggleBtn) {
    clockToggleBtn.addEventListener('click', () => {
        // Cycle through the 3 modes
        if (settings.clockMode === 'digital') setClockMode('digital24');
        else if (settings.clockMode === 'digital24') setClockMode('analog');
        else setClockMode('digital');
    });
}

function updateClock() {
    const now = new Date();
    
    // 12h or 24h Digital
    if (settings.clockMode !== 'analog' && digitalClock) {
        const h24 = String(now.getHours()).padStart(2, '0');
        let h12 = now.getHours() % 12 || 12;
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
        
        if (settings.clockMode === 'digital24') {
            digitalClock.textContent = `${h24}:${m}:${s}`;
        } else {
            digitalClock.textContent = `${h12}:${m}:${s} ${ampm}`;
        }
    }

    // Analog
    if (secHand && minHand && hourHand) {
        const secDeg = now.getSeconds() * 6;
        const minDeg = now.getMinutes() * 6 + now.getSeconds() * 0.1;
        const hrDeg  = (now.getHours() % 12) * 30 + now.getMinutes() * 0.5;
        secHand.style.transform  = `translateX(-50%) rotate(${secDeg}deg)`;
        minHand.style.transform  = `translateX(-50%) rotate(${minDeg}deg)`;
        hourHand.style.transform = `translateX(-50%) rotate(${hrDeg}deg)`;
    }
}

if (digitalClock) {
    setClockMode(settings.clockMode); // Initialize based on saved setting
    setInterval(updateClock, 1000);
}

/* =========================================================
   12. CALENDAR
   ========================================================= */
let currentViewDate = new Date();

function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
}

function updateCalendarTodayBtn() {
    const btn = document.getElementById('calendarTodayBtn');
    if (!btn) return;
    const now = new Date();
    const sameMonth = currentViewDate.getMonth() === now.getMonth() &&
                      currentViewDate.getFullYear() === now.getFullYear();
    const hasFilter = currentDateFilter !== null;
    btn.style.display = (!sameMonth || hasFilter) ? 'block' : 'none';
}

function renderCalendar(date) {
    const year  = date.getFullYear();
    const month = date.getMonth();
    const today = new Date();

    const monthNames = ["January","February","March","April","May","June",
                        "July","August","September","October","November","December"];
    const monthYearDisplay = document.getElementById('calendarMonthYear');
    if (monthYearDisplay) monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

    const wordedDateDisplay = document.getElementById('wordedDate');
    if (wordedDateDisplay) {
        const displayDate = currentDateFilter || today;
        wordedDateDisplay.textContent = displayDate.toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    const grid = document.getElementById('calendarGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const postDateMap = {};
    thoughtsPosts.forEach(p => {
        if (!postDateMap[p.date]) postDateMap[p.date] = [];
        postDateMap[p.date].push(p.label);
    });

    // Week starts on Saturday (+1 from Sunday)
    const dayHeaders = ['Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr'];
    dayHeaders.forEach(day => {
        const cell = document.createElement('div');
        cell.className = 'calendar-day header';
        cell.textContent = day;
        grid.appendChild(cell);
    });

    const firstDay    = (new Date(year, month, 1).getDay() + 1) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day empty';
        grid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day';

        const numSpan = document.createElement('span');
        numSpan.className = 'calendar-num';
        numSpan.textContent = day;
        cell.appendChild(numSpan);

        if (day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()) {
            cell.classList.add('today');
        }

        const cellDate = new Date(year, month, day);
        if (currentDateFilter && isSameDay(cellDate, currentDateFilter)) {
            cell.classList.add('selected');
        }

        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const labelsForDay = postDateMap[dateKey];
        if (labelsForDay && labelsForDay.length) {
            const dotsWrap = document.createElement('div');
            dotsWrap.className = 'calendar-dots';
            labelsForDay.slice(0, 3).forEach(labelKey => {
                const dot = document.createElement('span');
                dot.className = 'calendar-dot';
                dot.style.setProperty('--dot-color', getLabel(labelKey).color);
                dotsWrap.appendChild(dot);
            });
            cell.appendChild(dotsWrap);
        }

        cell.addEventListener('click', () => {
            currentDateFilter = new Date(year, month, day);
            renderCalendar(currentViewDate);
            renderPosts();
        });

        // Make the calendar usable without a mouse
        cell.tabIndex = 0;
        cell.setAttribute('role', 'button');
        cell.setAttribute('aria-label', `${monthNames[month]} ${day}, ${year}`);
        cell.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                cell.click();
            }
        });

        grid.appendChild(cell);
    }

    updateCalendarTodayBtn();
}

const prevYearBtn  = document.getElementById('prevYear');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const nextYearBtn  = document.getElementById('nextYear');

if (prevYearBtn) {
    prevYearBtn.addEventListener('click',  () => { currentViewDate.setFullYear(currentViewDate.getFullYear() - 1); renderCalendar(currentViewDate); });
    prevMonthBtn.addEventListener('click', () => { currentViewDate.setMonth(currentViewDate.getMonth() - 1);      renderCalendar(currentViewDate); });
    nextMonthBtn.addEventListener('click', () => { currentViewDate.setMonth(currentViewDate.getMonth() + 1);      renderCalendar(currentViewDate); });
    nextYearBtn.addEventListener('click',  () => { currentViewDate.setFullYear(currentViewDate.getFullYear() + 1); renderCalendar(currentViewDate); });
    renderCalendar(currentViewDate);
}

/* =========================================================
   13. POST CLICK → READING MODE
   ========================================================= */
document.getElementById('postList')?.addEventListener('click', (e) => {
    // Handle pagination clicks first
    if (e.target.closest('.page-prev')) { handlePostPage(-1); return; }
    if (e.target.closest('.page-next')) { handlePostPage(1); return; }

    const card = e.target.closest('.post-card');
    if (!card) return;
    if (e.target.closest('a')) return;
    if (document.body.classList.contains('post-focused')) return;

    openPostReading(card);
});

document.getElementById('postList')?.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.post-card');
    if (!card) return;
    e.preventDefault();
    openPostReading(card);
});

function openPostReading(card) {
    const postId = card.dataset.postId;
    const post = thoughtsPosts.find(p => p.id === postId);
    if (!post) return;
    activeReadingPostId = postId;
    postReadingPage = 0;
    card.classList.add('is-expanded');
    card.removeAttribute('role');
    card.removeAttribute('tabindex');
    document.body.classList.add('post-focused');
    document.body.classList.remove('hero-focused');
    renderPostReadingContent(post, card);
    const heading = card.querySelector('.post-field-title');
    if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderPostReadingContent(post, card) {
    const container = card.querySelector('.post-reading-view');
    if (!container) return;
    container.innerHTML = renderPaginatedFields(post, postReadingPage);
}

function closePostReading() {
    const expanded = document.querySelector('.post-card.is-expanded');
    document.body.classList.remove('post-focused');
    document.querySelectorAll('.post-card.is-expanded').forEach(c => {
        c.classList.remove('is-expanded');
        c.setAttribute('role', 'button');
        c.setAttribute('tabindex', '0');
        const rv = c.querySelector('.post-reading-view');
        if (rv) rv.innerHTML = '';
    });
    activeReadingPostId = null;
    postReadingPage = 0;
    if (expanded) expanded.focus({ preventScroll: true });
}

document.getElementById('readingClose')?.addEventListener('click', closePostReading);
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('post-focused')) closePostReading();
});

function handlePostPage(delta) {
    if (!activeReadingPostId) return;
    const post = thoughtsPosts.find(p => p.id === activeReadingPostId);
    if (!post) return;
    const card = document.querySelector(`.post-card[data-post-id="${activeReadingPostId}"]`);
    if (!card) return;
    const total = (post.fields || []).length;
    const newPage = Math.max(0, Math.min(postReadingPage + delta, total - 1));
    if (newPage === postReadingPage) return;
    postReadingPage = newPage;
    renderPostReadingContent(post, card);
}

/* =========================================================
   14. BOOK TOGGLE (close reading mode)
   ========================================================= */
document.addEventListener('click', (e) => {
    const btn = e.target.closest('#bookToggle, .hero-expand-btn');
    if (!btn) return;
    e.preventDefault();

    if (document.body.classList.contains('post-focused')) {
        closePostReading();
    } else if (document.body.classList.contains('hero-focused')) {
        closeHeroReading();
    } else {
        const tab = btn.dataset.tab || getCurrentTab();
        if (tab) openHeroReading(tab);
    }
});

/* =========================================================
   15. PAGE INITS
   ========================================================= */
function renderAllViews() {
    updateHeaderName();
    renderTheme();

    if (document.getElementById('heroText')) renderHeroForTab('home');
    if (document.getElementById('educationTimeline')) renderEducationPage();
    if (document.getElementById('experienceTimeline')) renderExperiencePage();
    if (document.getElementById('profileName')) renderProfilePage();
    if (document.getElementById('skillsCard')) renderSkillsPage();
    if (document.getElementById('surveyFormCard')) renderSurveyPage();
    if (document.getElementById('postList')) {
        renderLabelChips();
        renderPosts();
    }
    if (typeof currentViewDate !== 'undefined' && document.getElementById('calendarGrid')) {
        renderCalendar(currentViewDate);
    }
    if (document.getElementById('notesIndex')) renderNotesIndex();
    if (document.getElementById('noteArticle')) renderNotePage();
    document.body.dataset.rendered = 'true';
}

window.renderAllViews = renderAllViews;

if (document.getElementById('clearPostFilter')) {
    document.getElementById('clearPostFilter').addEventListener('click', () => {
        currentDateFilter = null;
        activeLabelFilter = null;
        renderCalendar(currentViewDate);
        renderPosts();
        renderLabelChips();
    });
}

/* =========================================================
   16. DESK PANEL
   The panel is sticky on desktop and stacks under the content on
   small screens; there is no collapse state to manage any more.
   ========================================================= */

/* =========================================================
   4-tier loader: portfolioContent > legacy thoughtsPosts key > content.json > legacy posts.json > defaults
   ========================================================= */
async function loadContent() {
    // Tier 1: portfolioContent in localStorage
    try {
        const stored = localStorage.getItem('portfolioContent');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                applyContent(parsed);
                return;
            }
        }
    } catch (e) { console.warn('Could not restore portfolioContent.', e); }

    // Tier 1.5: migrate legacy thoughtsPosts key
    try {
        const oldPosts = localStorage.getItem('thoughtsPosts');
        if (oldPosts) {
            const parsed = JSON.parse(oldPosts);
            if (Array.isArray(parsed) && parsed.length > 0) {
                applyContent({ posts: parsed });
                localStorage.removeItem('thoughtsPosts');
                saveContent();
                return;
            }
        }
    } catch (e) { console.warn('Could not migrate legacy posts.', e); }

    // Tier 2: content.json (new canonical source)
    try {
        const res = await fetch('content.json', { cache: 'no-cache' });
        if (res.ok) {
            const data = await res.json();
            if (data && typeof data === 'object' && !Array.isArray(data)) {
                applyContent(data);
                return;
            }
        }
    } catch (e) { /* content.json not found, fall through */ }

    // Tier 3: legacy posts.json (auto-migrate)
    try {
        const res = await fetch('posts.json', { cache: 'no-cache' });
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                applyContent({ posts: data });
                window.__legacyMigration = true;
            }
        }
    } catch (e) { /* posts.json not found, use hardcoded defaults */ }

    // Nothing loaded: render the built-in defaults
    renderAllViews();
}

function applyContent(parsed) {
    if (Array.isArray(parsed.posts)) {
        parsed.posts = parsed.posts.map(migratePost).filter(Boolean);
        thoughtsPosts.length = 0;
        thoughtsPosts.push(...parsed.posts);
    }
    if (parsed.profile && typeof parsed.profile === 'object') {
        Object.assign(contentData.profile, parsed.profile);
    }
    if (Array.isArray(parsed.education)) {
        contentData.education.length = 0;
        contentData.education.push(...parsed.education);
    }
    if (Array.isArray(parsed.experience)) {
        contentData.experience.length = 0;
        contentData.experience.push(...parsed.experience);
    }
    if (Array.isArray(parsed.photos)) {
        contentData.photos.length = 0;
        contentData.photos.push(...parsed.photos);
    }
    if (Array.isArray(parsed.skills)) {
        contentData.skills.length = 0;
        contentData.skills.push(...parsed.skills);
    }
    if (Array.isArray(parsed.hobbies)) {
        contentData.hobbies.length = 0;
        contentData.hobbies.push(...parsed.hobbies);
    }
    if (parsed.labels && typeof parsed.labels === 'object' && !Array.isArray(parsed.labels)) {
        // Mutate in place to preserve postLabels alias
        Object.keys(contentData.labels).forEach(k => delete contentData.labels[k]);
        Object.assign(contentData.labels, parsed.labels);
    }
    if (parsed.site && typeof parsed.site === 'object') {
        if (!contentData.site) contentData.site = { projectName: 'PORTFOLIO', theme: 'retro' };
        Object.assign(contentData.site, parsed.site);
        if (!contentData.site.heroPostIds) {
            contentData.site.heroPostIds = { home: null };
        }
    }
    if (Array.isArray(parsed.surveys)) {
        contentData.surveys = parsed.surveys.slice();
    } else if (parsed.survey && typeof parsed.survey === 'object') {
        // Legacy: single survey → wrap in array, keeping usable default fields
        const fallbackFields = (DEFAULT_CONTENT.surveys && DEFAULT_CONTENT.surveys[0] && DEFAULT_CONTENT.surveys[0].fields) || [];
        contentData.surveys = [{
            id: 's_' + Math.random().toString(36).slice(2, 10),
            title: 'Portfolio Feedback',
            active: true,
            introTitle: parsed.survey.introTitle || '',
            introText: parsed.survey.introText || '',
            thankYouTitle: parsed.survey.thankYouTitle || '',
            thankYouMessage: parsed.survey.thankYouMessage || '',
            fields: (Array.isArray(parsed.survey.fields) && parsed.survey.fields.length)
                ? parsed.survey.fields
                : JSON.parse(JSON.stringify(fallbackFields))
        }];
    }
    ensureSurveysArray();
    migrateHeroes();

    renderAllViews();

    if (typeof populateProfileForm === 'function' && document.getElementById('pfName')) populateProfileForm();
    if (typeof populateSkillsForm === 'function' && document.getElementById('skillsList')) populateSkillsForm();
    if (typeof populateSiteForm === 'function' && document.getElementById('siteForm')) populateSiteForm();
    if (document.getElementById('adminList')) renderAdminList();
    if (document.getElementById('heroSelects')) renderHeroSelects();
}

function saveContent() {
    try {
        localStorage.setItem('portfolioContent', JSON.stringify(contentData));
        markDraftSaved();
    } catch (e) {
        alert('Could not save locally — storage may be full or blocked.');
    }
}

function markDraftSaved() {
    const stamp = document.getElementById('adminSaveTime');
    if (stamp) {
        stamp.textContent = new Date().toLocaleString('en-CA', {
            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
        });
    }
    if (document.getElementById('storageUsage')) updateStorageMeter();
}

function updateHeaderName() {
    const p = contentData.profile || {};
    const name = (p.name || 'IAN').trim() || 'IAN';
    const monogram = (name.replace(/[^A-Za-z0-9]/g, '').charAt(0) || 'I').toUpperCase();

    document.querySelectorAll('[data-profile-name]').forEach(el => { el.textContent = name; });
    document.querySelectorAll('[data-profile-role]').forEach(el => { el.textContent = p.title || ''; });
    document.querySelectorAll('[data-monogram]').forEach(el => { el.textContent = monogram; });

    const email = (p.email || '').trim();
    document.querySelectorAll('[data-contact-email]').forEach(el => {
        el.setAttribute('href', email ? 'mailto:' + email : 'survey.html');
    });

    const pageTitle = document.body.dataset.pageTitle || 'Portfolio';
    const siteTitle = ((contentData.site && contentData.site.projectName) || '').trim();
    document.title = (pageTitle === 'Portfolio' && siteTitle)
        ? siteTitle
        : `${name} — ${pageTitle}`;

    const footerMeta = document.querySelector('.footer-meta');
    if (footerMeta) {
        footerMeta.textContent = [p.title, p.location].filter(Boolean).join(' · ');
    }

    updateHeroCard();
}

function updateHeroCard() {
    const set = (key, value) => {
        const el = document.querySelector(`[data-fact="${key}"]`);
        if (el && value) el.textContent = value;
    };
    const p = contentData.profile || {};
    const edu = (contentData.education || [])[0];
    const skills = (contentData.skills || []).slice(0, 3);
    const hobbies = (contentData.hobbies || []).slice(0, 3);

    set('location', p.location);
    if (edu) set('studied', [edu.degree, edu.institution].filter(Boolean).join(', '));
    if (skills.length) set('focus', skills.join(', '));
    if (hobbies.length) set('offclock', hobbies.join(', '));
}

function renderTheme() {
    const raw = (contentData.site && contentData.site.theme) || 'retro';
    // Backward compat: older content.json may have 'neobrutalism'
    const theme = raw === 'neobrutalism' ? 'retro-bold' : raw;
    ['retro', 'retro-bold'].forEach(t => {
        document.body.classList.toggle('site-theme-' + t, t === theme);
    });
    document.body.dataset.theme = theme;
}

