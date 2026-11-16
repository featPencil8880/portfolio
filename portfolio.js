// portfolio.js

/* =========================================================
   SHARED CHROME
   Header, rail, desk widget, footer and overlays are injected by
   chrome.js so every page shares one canonical copy.
   ========================================================= */

/* =========================================================
   SETTINGS & AUDIO ENGINE
   ========================================================= */
let settings = {
    reduceMotion: false,
    soundEffects: false,
    soundProfile: 'classic',
    fontSize: 'normal',
    clockMode: 'digital' // 'digital' | 'digital24' | 'analog'
};

function loadSettings() {
    try {
        const stored = localStorage.getItem('portfolioSettings');
        if (stored) settings = { ...settings, ...JSON.parse(stored) };
    } catch (e) { console.warn('Could not load settings'); }
}

function saveSettings() {
    try { localStorage.setItem('portfolioSettings', JSON.stringify(settings)); } catch (e) {}
}

// --- Web Audio API (Chiptune Generator) ---
let audioCtx;
function playSound(type) {
    if (!settings.soundEffects) return;
    
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    const profile = settings.soundProfile || 'classic';

    if (type === 'roll') {
        const rollFreq = profile === 'soft' ? 500 : profile === 'typewriter' ? 1000 : profile === 'chime' ? 700 : 800;
        const rollWave = profile === 'soft' ? 'sine' : profile === 'chime' ? 'triangle' : 'square';
        osc.type = rollWave;
        osc.frequency.setValueAtTime(rollFreq, now);
        gainNode.gain.setValueAtTime(0.025, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.start(now); osc.stop(now + 0.03);
        return;
    }

    if (profile === 'classic') {
        osc.type = 'square';
        if (type === 'hover') {
            osc.frequency.setValueAtTime(440, now);
            gainNode.gain.setValueAtTime(0.02, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            osc.start(now); osc.stop(now + 0.05);
        } else if (type === 'click') {
            osc.frequency.setValueAtTime(660, now);
            gainNode.gain.setValueAtTime(0.04, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            osc.start(now); osc.stop(now + 0.08);
        } else if (type === 'success') {
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(880, now + 0.1);
            gainNode.gain.setValueAtTime(0.05, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc.start(now); osc.stop(now + 0.3);
        }
    } 
    else if (profile === 'soft') {
        osc.type = 'sine';
        if (type === 'hover') {
            osc.frequency.setValueAtTime(330, now);
            gainNode.gain.setValueAtTime(0.015, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            osc.start(now); osc.stop(now + 0.08);
        } else if (type === 'click') {
            osc.frequency.setValueAtTime(440, now);
            gainNode.gain.setValueAtTime(0.02, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc.start(now); osc.stop(now + 0.1);
        } else if (type === 'success') {
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(660, now + 0.2);
            gainNode.gain.setValueAtTime(0.03, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            osc.start(now); osc.stop(now + 0.4);
        }
    }
    else if (profile === 'typewriter') {
        osc.type = 'sawtooth';
        // A very short, quiet click
        if (type === 'hover') {
            osc.frequency.setValueAtTime(800, now);
            gainNode.gain.setValueAtTime(0.01, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
            osc.start(now); osc.stop(now + 0.02);
        } else if (type === 'click') {
            osc.frequency.setValueAtTime(900, now);
            gainNode.gain.setValueAtTime(0.03, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
            osc.start(now); osc.stop(now + 0.04);
        } else if (type === 'success') {
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.setValueAtTime(800, now + 0.08);
            osc.frequency.setValueAtTime(1000, now + 0.16);
            gainNode.gain.setValueAtTime(0.03, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
            osc.start(now); osc.stop(now + 0.25);
        }
    }
    else if (profile === 'chime') {
        osc.type = 'triangle';
        if (type === 'hover') {
            osc.frequency.setValueAtTime(660, now);
            gainNode.gain.setValueAtTime(0.02, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            osc.start(now); osc.stop(now + 0.15);
        } else if (type === 'click') {
            osc.frequency.setValueAtTime(880, now);
            gainNode.gain.setValueAtTime(0.03, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            osc.start(now); osc.stop(now + 0.2);
        } else if (type === 'success') {
            osc.frequency.setValueAtTime(523, now); // C5
            osc.frequency.setValueAtTime(659, now + 0.1); // E5
            osc.frequency.setValueAtTime(783, now + 0.2); // G5
            gainNode.gain.setValueAtTime(0.03, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
            osc.start(now); osc.stop(now + 0.5);
        }
    }
}

// --- Apply Settings to the DOM ---
function applySettings() {
    document.body.classList.toggle('reduce-motion', settings.reduceMotion);

    document.documentElement.classList.remove('font-small', 'font-large');
    if (settings.fontSize === 'small') document.documentElement.classList.add('font-small');
    if (settings.fontSize === 'large') document.documentElement.classList.add('font-large');
    
    const reduceToggle = document.getElementById('settingReduceMotion');
    if (reduceToggle) reduceToggle.checked = settings.reduceMotion;
    
    const soundToggle = document.getElementById('settingSoundEffects');
    if (soundToggle) soundToggle.checked = settings.soundEffects;

    // ADD THIS: Show/Hide and sync Sound Profile
    const soundProfileRow = document.getElementById('soundProfileRow');
    const soundProfileSelect = document.getElementById('settingSoundProfile');
    if (soundProfileRow && soundProfileSelect) {
        soundProfileRow.style.display = settings.soundEffects ? 'flex' : 'none';
        soundProfileSelect.value = settings.soundProfile;
    }

    const fontBtns = document.querySelectorAll('#fontSizeGroup button');
    fontBtns.forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.value === settings.fontSize);
    });

    const clockSelect = document.getElementById('settingClockMode');
    if (clockSelect) clockSelect.value = settings.clockMode;
}

loadSettings();
applySettings();

/* =========================================================
   0. DOM REFERENCES & PAGE STATE
   ========================================================= */
const navBtn    = document.getElementById('navBtn');
const leftPanel = document.getElementById('leftPanel');
const navLinks  = document.querySelectorAll('.left-panel-btn');

/* =========================================================
   2. MENU / RAIL TOGGLE
   ========================================================= */
if (navBtn) {
    const setRail = (open) => {
        if (!leftPanel) return;
        leftPanel.classList.toggle('is-open', open);
        document.body.classList.toggle('rail-open', open);
        navBtn.setAttribute('aria-expanded', String(open));
    };

    navBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z"/></svg>';
    navBtn.setAttribute('aria-label', 'Toggle navigation');
    navBtn.addEventListener('click', () => setRail(!leftPanel.classList.contains('is-open')));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && leftPanel.classList.contains('is-open')) {
            setRail(false);
            navBtn.focus();
        }
    });

    // Close the mobile drawer after choosing a section
    navLinks.forEach(link => link.addEventListener('click', () => {
        if (window.innerWidth <= 640) setRail(false);
    }));
}

/* =========================================================
   3. HIGHLIGHT CURRENT PAGE
   ========================================================= */
const currentPage = location.pathname.split('/').pop() || 'index.html';
navLinks.forEach(link => {
    const target = link.getAttribute('href').split('/').pop();
    if (target === currentPage) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
    }
});

/* =========================================================
   4. ARROW-KEY NAVIGATION
   ========================================================= */
if (navLinks.length) {
    document.getElementById('menuList')?.addEventListener('keydown', (e) => {
        const i = [...navLinks].indexOf(document.activeElement);
        if (i === -1) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            navLinks[(i + 1) % navLinks.length].focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            navLinks[(i - 1 + navLinks.length) % navLinks.length].focus();
        }
    });
}

/* =========================================================
   5. CANVAS TOGGLE
   ========================================================= */
const canvasBtn = document.getElementById('canvasBtn');
if (canvasBtn) {
    canvasBtn.addEventListener('click', () => {
        const isCanvas = document.body.classList.toggle('canvas-mode');
        canvasBtn.setAttribute('aria-pressed', String(isCanvas));
    });
}

/* =========================================================
   6. CONTENT DATA — all editable content lives here
   ========================================================= */
const contentData = {
    profile: {
        name:       "MY NAME",
        pronouns:   "",
        greeting:   "Hello, I'm",
        title:      "Psychology Graduate & Educator",
        tagline:    "",
        bio:        "I am a University of Manitoba graduate with a passion for human behavior, child development, and research. With hands-on experience mentoring children through the YMCA-YWCA of Winnipeg, I bring a supportive, analytical, and empathetic approach to everything I do.",
        about:      "",
        location:   "Winnipeg, MB",
        email:      "",
        linkedin:   "",
        actions: [
            { label: "Explore My Profile", href: "profile.html", style: "primary" },
            { label: "Leave Feedback",     href: "survey.html", style: "secondary" }
        ]
    },
    education: [
        {
            institution: "University of Manitoba",
            degree:      "Bachelor of Arts, Psychology",
            years:       "20XX–20XX",
            sortYear:    2023,
            location:    "Winnipeg, MB",
            description: "Edit this entry in the editor to fill in your actual details.",
            highlights: [
                "Research Methods",
                "Abnormal Psychology",
                "Child & Adolescent Psychology",
                "Brain and Behavior",
                "Gender Studies",
                "Sports Psychology"
            ]
        }
    ],
    experience: [
        {
            position:     "Youth Mentor / Educator",
            organization: "YMCA-YWCA of Winnipeg",
            years:        "20XX–20XX",
            sortYear:     2023,
            location:     "Winnipeg, MB",
            description:  "Worked with children in elementary schools to support their academic, social, and emotional development. Designed and led activities that fostered curiosity, cooperation, and confidence.",
            highlights: [
                "Child development",
                "Mentorship & tutoring",
                "Behavioral support",
                "Curriculum design",
                "Group facilitation"
            ],
            documents:    []
        }
    ],
    skills: [
        "Qualitative research",
        "Survey design",
        "Data coding",
        "SPSS",
        "Active listening",
        "Behavioral observation",
        "Mentorship",
        "Group facilitation"
    ],
    hobbies: [
        "Reading",
        "Writing",
        "Photography",
        "Hiking",
        "Cooking"
    ],
    posts: [
        {
            id: "p_about_default",
            date: "2024-01-01",
            tab: "home",
            label: "introspection",
            author: "Me",
            photos: [],
            hideFromList: true,
            fields: [
                {
                    name: "About Me",
                    blocks: [
                        { type: "title", content: "MY NAME" },
                        { type: "subtitle", content: "Psychology Graduate & Educator" },
                        { type: "paragraph", content: "I am a University of Manitoba graduate with a passion for human behavior, child development, and research. With hands-on experience mentoring children through the YMCA-YWCA of Winnipeg, I bring a supportive, analytical, and empathetic approach to everything I do." },
                        { type: "actions", content: "Explore My Profile | profile.html | primary\nLeave Feedback | survey.html | secondary" }
                    ]
                }
            ]
        },
        {
            id: "p_demo1",
            date: "2024-11-20",
            tab: "home",
            label: "cognitive",
            author: "Me",
            photos: [],
            fields: [
                {
                    name: "Opening",
                    blocks: [
                        { type: "title", content: "Why Child Psychology Fascinates Me" },
                        { type: "paragraph", content: "The moment I realized children aren't just 'small adults' — their minds work in completely different ways. This changed everything about how I approach mentorship." }
                    ]
                }
            ]
        },
        {
            id: "p_demo2",
            date: "2024-11-15",
            tab: "home",
            label: "memory",
            author: "Me",
            photos: [],
            fields: [
                {
                    name: "Opening",
                    blocks: [
                        { type: "title", content: "First Week at the YMCA" },
                        { type: "paragraph", content: "The energy in the room was infectious. Some reflections on what I learned from the kids in my very first week." }
                    ]
                }
            ]
        },
        {
            id: "p_demo3",
            date: "2024-11-10",
            tab: "home",
            label: "introspection",
            author: "Me",
            photos: [],
            fields: [
                {
                    name: "Opening",
                    blocks: [
                        { type: "title", content: "On Research Methods" },
                        { type: "paragraph", content: "Data doesn't speak for itself — it speaks through the questions we ask. A note on why I love qualitative work." }
                    ]
                }
            ]
        }
    ],
    photos: [],
    labels: {
        birthday:           { color: "#FFB3C6" },
        task:               { color: "#FFCE80" },
        event:              { color: "#FFE566" },
        memory:             { color: "#B5E8A0" },
        cognitive:          { color: "#80D9DE" },
        belief:             { color: "#9CC0FF" },
        curiosity:          { color: "#C7A8FF" },
        hope:               { color: "#FFA8E6" },
        ambition:           { color: "#FFA8A8" },
        inspiration:        { color: "#FFC080" },
        "opinion & advice": { color: "#D4A8FF" },
        introspection:      { color: "#A8C9E8" }
    },
    site: {
        projectName: "PORTFOLIO",
        theme:       "retro",
        heroPostIds: {
            home: "p_about_default",
            profile: null,
            education: null,
            experience: null,
            skills: null,
            survey: null
        }
    },
    surveys: [
        {
            id: "s_default",
            title: "Portfolio Feedback",
            active: true,
            introTitle: "Share your thoughts",
            introText: "Thanks for taking a look. I'd love to hear what you think — what stood out, what could be better, or just a hello.",
            thankYouTitle: "Thank you!",
            thankYouMessage: "Your message means a lot. I read every submission and try to reply within a few days.",
            fields: [
                {
                    name: "Basic Info",
                    blocks: [
                        { type: "heading",   content: "About you" },
                        { type: "text",      label: "Your name", required: true, placeholder: "Who's this?" },
                        { type: "text",      label: "Your email", required: false, placeholder: "So I can reply" },
                        { type: "radio",     label: "How do you know me?", required: false, options: ["Recruiter", "Friend", "Family", "Colleague", "Just visiting"] }
                    ]
                },
                {
                    name: "Feedback",
                    blocks: [
                        { type: "heading",   content: "Your thoughts" },
                        { type: "textarea",  label: "What stood out? What could be better?", required: true, placeholder: "A thoughtful note, a suggestion, or just a hello…" },
                        { type: "rating",    label: "Rate this site", required: false }
                    ]
                }
            ]
        }
    ]
};

/* Aliases — existing code reads these, no changes needed below */
const thoughtsPosts = contentData.posts;
/* Ensure defaults are in new format */
for (let i = 0; i < thoughtsPosts.length; i++) {
    thoughtsPosts[i] = migratePost(thoughtsPosts[i]);
}

/* Snapshot of defaults for the Reset button */
const DEFAULT_CONTENT = JSON.parse(JSON.stringify(contentData));

/* =========================================================
   8. LABEL PALETTE & HELPERS
   ========================================================= */
   /* Edit this list as family members join */
const AUTHORS = ["Me"];

/* Alias to contentData.labels — always the same object reference.
   Mutations to contentData.labels stay visible here. */
const postLabels = contentData.labels;
const defaultLabel = { color: "#E0E0E0" };
function getLabel(key) { return postLabels[key] || defaultLabel; }
function formatLabelName(key) {
    if (!key) return "General";
    return key.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

const LABEL_ICON_SVG = `<svg class="post-label-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4,20q-0.82,0-1.41-0.59T2,18V6Q2,5.18 2.59,4.59T4,4H15q0.48,0 0.9,0.21T16.6,4.8L22,12l-5.4,7.2q-0.28,0.38-0.7,0.59T15,20H4Zm0-2H15l4.5-6L15,6H4V18Zm5.5-6Z"/></svg>`;

/* =========================================================
   POST HELPERS & MIGRATION
   ========================================================= */
function genPostId() {
    return 'p_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

function escapeHtml(s) {
    return String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function migratePost(post) {
    if (!post || typeof post !== 'object') return null;
    if (Array.isArray(post.fields)) {
        // Already new format — ensure required props
        if (!post.id) post.id = genPostId();
        if (!post.tab) post.tab = 'home';
        if (!Array.isArray(post.photos)) post.photos = [];
        return post;
    }
    // Old format (title + excerpt + image)
    const blocks = [];
    if (post.title)   blocks.push({ type: 'title',     content: post.title });
    if (post.excerpt) blocks.push({ type: 'paragraph', content: post.excerpt });
    const fields = blocks.length ? [{ name: 'Content', blocks }] : [];
    const photos = post.image ? [{ image: post.image, position: 'top' }] : [];
    return {
        id: post.id || genPostId(),
        date: post.date || '',
        tab: post.tab || 'home',
        label: post.label || 'general',
        author: post.author || 'Me',
        photos,
        fields
    };
}

function getPostTitle(post) {
    if (!post || !Array.isArray(post.fields) || !post.fields.length) return '(untitled)';
    for (const field of post.fields) {
        if (!Array.isArray(field.blocks)) continue;
        const tb = field.blocks.find(b => b.type === 'title' && b.content);
        if (tb) return tb.content;
    }
    return post.fields[0].name || '(untitled)';
}

function getPostPreview(post) {
    const empty = { title: '(untitled)', subtitle: '', excerpt: '' };
    if (!post || !Array.isArray(post.fields) || !post.fields.length) return empty;
    let title = '', subtitle = '', excerpt = '';
    for (const field of post.fields) {
        if (!Array.isArray(field.blocks)) continue;
        for (const b of field.blocks) {
            if (b.type === 'title' && !title) title = b.content || '';
            else if (b.type === 'subtitle' && !subtitle) subtitle = b.content || '';
            else if (b.type === 'paragraph' && !excerpt) excerpt = b.content || '';
        }
    }
    if (!title) title = post.fields[0].name || '(untitled)';
    if (excerpt.length > 200) excerpt = excerpt.slice(0, 200) + '…';
    return { title, subtitle, excerpt };
}

function getPostTab(post) {
    return (post && post.tab) || 'home';
}

function migrateHeroes() {
    if (!contentData.site) contentData.site = { projectName: 'PORTFOLIO', theme: 'retro' };
    if (!contentData.site.heroPostIds) {
        contentData.site.heroPostIds = { home: null };
    }

    // Older versions generated a hidden "About" note from the profile and
    // promoted it to the home hero. The hero now falls back to the profile
    // directly, so remove those generated notes when we find them.
    const heroId = contentData.site.heroPostIds.home;
    if (heroId && String(heroId).startsWith('p_about_')) {
        contentData.site.heroPostIds.home = null;
    }
    for (let i = contentData.posts.length - 1; i >= 0; i--) {
        const post = contentData.posts[i];
        if (post && String(post.id || '').startsWith('p_about_')) {
            contentData.posts.splice(i, 1);
        }
    }

    // Validate that each hero id references an existing post.
    // Dangling references (from old exports) get reset to null.
    Object.keys(contentData.site.heroPostIds).forEach(tab => {
        const id = contentData.site.heroPostIds[tab];
        if (id && !contentData.posts.find(p => p.id === id)) {
            contentData.site.heroPostIds[tab] = null;
        }
    });
}

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
    localStorage.clear();
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

/* =========================================================
   25. PHOTOS MODAL — Phase A (empty state)
   ========================================================= */
const photosModal         = document.getElementById('photosModal');
const photosModalClose    = document.getElementById('photosModalClose');
const photosModalBackdrop = document.getElementById('photosModalBackdrop');

function openPhotosModal() {
    if (!photosModal) return;
    currentPhotoIndex = 0;
    renderPhotosModal();
    photosModal.hidden = false;
    document.body.style.overflow = 'hidden';
    playSound('click');
}

function closePhotosModal() {
    if (!photosModal) return;
    photosModal.hidden = true;
    document.body.style.overflow = '';
}

document.getElementById('photosBtn')?.addEventListener('click', openPhotosModal);
photosModalClose?.addEventListener('click', closePhotosModal);
photosModalBackdrop?.addEventListener('click', closePhotosModal);
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && photosModal && !photosModal.hidden) closePhotosModal();
});

/* =========================================================
   26. PHOTOS — ADMIN + MODAL RENDER
   ========================================================= */
const adminPhotoListEl = document.getElementById('adminPhotoList');
const photoForm        = document.getElementById('photoForm');
const photoEditIndex   = document.getElementById('photoEditIndex');
const photoDate        = document.getElementById('photoDate');
const photoMemo        = document.getElementById('photoMemo');
const photoImage       = document.getElementById('photoImage');
const photoLabelPicker = document.getElementById('photoLabelPicker');
const photoFormTitle   = document.getElementById('photoFormTitle');

let currentPhotoIndex = 0;
let activePhotoFilter = null;

function getFilteredPhotos() {
    if (!activePhotoFilter) return contentData.photos;
    return contentData.photos.filter(p => (p.labels || []).includes(activePhotoFilter));
}

function populatePhotoLabelPicker() {
    if (!photoLabelPicker) return;
    photoLabelPicker.innerHTML = Object.keys(postLabels).map(k => {
        const raw = getLabel(k).color;
        const color = /^#[0-9a-f]{3,8}$/i.test(raw || '') ? raw : '#d6cebf';
        return `
        <button class="post-filter-chip" data-label="${escapeHtml(k)}" style="--chip-color: ${color};" type="button">
            <span>${escapeHtml(formatLabelName(k))}</span>
        </button>`;
    }).join('');
}

photoLabelPicker?.addEventListener('click', (e) => {
    const chip = e.target.closest('.post-filter-chip');
    if (!chip) return;
    chip.classList.toggle('is-active');
});

function resetPhotoForm() {
    if (!photoForm) return;
    photoForm.reset();
    photoEditIndex.value = '';
    photoFormTitle.textContent = 'Add photo';
    photoDate.value = new Date().toISOString().slice(0, 10);
    photoLabelPicker?.querySelectorAll('.post-filter-chip').forEach(c => c.classList.remove('is-active'));
}

document.getElementById('photoTodayBtn')?.addEventListener('click', () => {
    if (photoDate) photoDate.value = new Date().toISOString().slice(0, 10);
});

document.getElementById('photoCancelBtn')?.addEventListener('click', resetPhotoForm);

photoForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const labels = [...photoLabelPicker.querySelectorAll('.post-filter-chip.is-active')].map(c => c.dataset.label);

    const photo = {
        date:   photoDate.value,
        memo:   photoMemo.value.trim(),
        image:  photoImage.value.trim(),
        labels: labels
    };
    if (!photo.date || !photo.image) {
        alert('Date and image path are required.');
        return;
    }

    const idx = photoEditIndex.value;
    if (idx === '') {
        contentData.photos.push(photo);
    } else {
        contentData.photos[parseInt(idx, 10)] = photo;
    }
    saveContent();
    renderAdminPhotoList();
    resetPhotoForm();
    renderPhotosModal();
    playSound('success');
});

function renderAdminPhotoList() {
    if (!adminPhotoListEl) return;
    if (contentData.photos.length === 0) {
        adminPhotoListEl.innerHTML = '<p class="admin-empty">No photos yet. Add one above.</p>';
        return;
    }
    const sorted = contentData.photos
        .map((p, i) => ({ p, i }))
        .sort((a, b) => b.p.date.localeCompare(a.p.date));

    adminPhotoListEl.innerHTML = sorted.map(({ p, i }) => {
        const memoShort = (p.memo || '(no memo)').slice(0, 60);
        const labelsText = (p.labels || []).map(l => formatLabelName(l)).join(', ') || 'No labels';
        return `
            <div class="admin-item">
                <div class="admin-item-info">
                    <strong>${escapeHtml(memoShort)}</strong>
                    <span>${escapeHtml(p.date || '')} / ${escapeHtml(labelsText)}</span>
                </div>
                <div class="admin-item-actions">
                    <button data-action="edit" data-index="${i}" type="button">Edit</button>
                    <button data-action="delete" data-index="${i}" type="button">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

adminPhotoListEl?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const idx = parseInt(btn.dataset.index, 10);
    const photo = contentData.photos[idx];
    if (!photo) return;

    if (btn.dataset.action === 'edit') {
        photoEditIndex.value = idx;
        photoDate.value  = photo.date || '';
        photoMemo.value  = photo.memo || '';
        photoImage.value = photo.image || '';
        photoFormTitle.textContent = 'Edit Photo';
        photoLabelPicker.querySelectorAll('.post-filter-chip').forEach(c => {
            c.classList.toggle('is-active', (photo.labels || []).includes(c.dataset.label));
        });
        photoForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (btn.dataset.action === 'delete') {
        if (!confirm('Delete this photo?')) return;
        contentData.photos.splice(idx, 1);
        saveContent();
        renderAdminPhotoList();
        resetPhotoForm();
        renderPhotosModal();
    }
});

function renderPhotosModal() {
    const body = document.getElementById('photosModalBody');
    if (!body) return;

    if (contentData.photos.length === 0) {
        body.innerHTML = '<p class="photos-empty">No photos yet. Add them in the editor.</p>';
        const sidebar = document.getElementById('photosSidebar');
        if (sidebar) sidebar.innerHTML = '';
        return;
    }

    // Validate active filter still exists
    if (activePhotoFilter) {
        const stillExists = contentData.photos.some(p => (p.labels || []).includes(activePhotoFilter));
        if (!stillExists) activePhotoFilter = null;
    }

    renderPhotosSidebar();

    const filtered = getFilteredPhotos();
    const total = filtered.length;

    if (total === 0) {
        body.innerHTML = `<p class="photos-empty">No photos labeled "${formatLabelName(activePhotoFilter)}".</p>`;
        return;
    }

    if (currentPhotoIndex >= total) currentPhotoIndex = 0;

    const visible = [];
    for (let offset = 0; offset < Math.min(3, total); offset++) {
        visible.push({
            photo: filtered[(currentPhotoIndex + offset) % total],
            position: offset // 0 = front, 1 = middle, 2 = back
        });
    }

    const cards = visible.map(({ photo, position }) => {
        const labelDots = (photo.labels || []).map(l =>
            `<span class="photos-label-dot" style="--chip-color:${/^#[0-9a-f]{3,8}$/i.test(getLabel(l).color || '') ? getLabel(l).color : '#d6cebf'}" title="${escapeHtml(formatLabelName(l))}"></span>`
        ).join('');
        const altText = photo.memo || `Polaroid from ${photo.date || 'the archive'}`;
        return `
            <div class="photos-stack-card" data-position="${position}">
                <div class="photos-stack-image">
                    ${photo.image ? `<img src="${escapeHtml(photo.image)}" alt="${escapeHtml(altText)}" loading="lazy">` : '<div class="photos-stack-placeholder">No image</div>'}
                </div>
                <div class="photos-stack-memo">${escapeHtml(photo.memo || '')}</div>
                <div class="photos-stack-meta">
                    <span class="photos-stack-date">${escapeHtml(formatPostDate(photo.date))}</span>
                    <div class="photos-stack-labels">${labelDots}</div>
                </div>
            </div>
        `;
    }).join('');

    const showArrows = total > 1;
    body.innerHTML = `
        <div class="photos-viewer">
            ${showArrows ? `<button class="photos-nav-btn photos-nav-prev" type="button" aria-label="Previous photo">&#8249;</button>` : ''}
            <div class="photos-stack">${cards}</div>
            ${showArrows ? `<button class="photos-nav-btn photos-nav-next" type="button" aria-label="Next photo">&#8250;</button>` : ''}
        </div>
        <div class="photos-counter">${currentPhotoIndex + 1}/${total}</div>
    `;
}

/* --- Arrow navigation with Phase D animation --- */
let photoNavLocked = false;

function navigatePhotos(direction) {
    if (photoNavLocked) return;
    const total = getFilteredPhotos().length;
    if (total < 2) return;

    // Special case: 2 photos — the "wrap" behavior would look like the
    // same photo fading out and immediately fading in as back. Snap instead.
    if (total === 2) {
        currentPhotoIndex = (currentPhotoIndex + (direction === 'next' ? 1 : -1) + total) % total;
        renderPhotosModal();
        return;
    }

    const stack = document.querySelector('.photos-stack');
    if (!stack) return;

    photoNavLocked = true;
    const cards = [...stack.querySelectorAll('.photos-stack-card')];

    if (direction === 'next') {
        const frontCard = cards.find(c => c.dataset.position === '0');
        if (frontCard) frontCard.classList.add('is-exiting-front');

        cards.forEach(card => {
            const pos = parseInt(card.dataset.position, 10);
            if (pos === 1) card.dataset.position = '0';
            if (pos === 2) card.dataset.position = '1';
        });

        setTimeout(() => {
            currentPhotoIndex = (currentPhotoIndex + 1) % total;
            renderPhotosModal();
            const newStack = document.querySelector('.photos-stack');
            const newBack = newStack?.querySelector('[data-position="2"]');
            if (newBack) newBack.classList.add('is-entering-back');
            photoNavLocked = false;
        }, 420);
    } else if (direction === 'prev') {
        const backCard = cards.find(c => c.dataset.position === '2');
        if (backCard) backCard.classList.add('is-exiting-back');

        cards.forEach(card => {
            const pos = parseInt(card.dataset.position, 10);
            if (pos === 0) card.dataset.position = '1';
            if (pos === 1) card.dataset.position = '2';
        });

        setTimeout(() => {
            currentPhotoIndex = (currentPhotoIndex - 1 + total) % total;
            renderPhotosModal();
            const newStack = document.querySelector('.photos-stack');
            const newFront = newStack?.querySelector('[data-position="0"]');
            if (newFront) newFront.classList.add('is-entering-front');
            photoNavLocked = false;
        }, 420);
    }
}

document.getElementById('photosModalBody')?.addEventListener('click', (e) => {
    if (e.target.closest('.photos-nav-prev')) {
        navigatePhotos('prev');
        playSound('click');
    } else if (e.target.closest('.photos-nav-next')) {
        navigatePhotos('next');
        playSound('click');
    }
});

/* --- Phase E: sidebar rendering + click --- */
function renderPhotosSidebar() {
    const sidebar = document.getElementById('photosSidebar');
    if (!sidebar) return;

    const counts = {};
    contentData.photos.forEach(p => {
        (p.labels || []).forEach(l => {
            counts[l] = (counts[l] || 0) + 1;
        });
    });

    const allCount = contentData.photos.length;
    const sortedLabels = Object.keys(counts).sort();

    const allItem = `
        <button class="photos-sidebar-item${!activePhotoFilter ? ' is-active' : ''}" data-filter="" type="button">
            <span class="photos-sidebar-dot" style="background:#000"></span>
            <span>All</span>
            <span class="photos-sidebar-count">${allCount}</span>
        </button>
    `;

    const labelItems = sortedLabels.map(key => {
        const isActive = activePhotoFilter === key;
        return `
            <button class="photos-sidebar-item${isActive ? ' is-active' : ''}" data-filter="${key}" type="button">
                <span class="photos-sidebar-dot" style="background:${getLabel(key).color}"></span>
                <span>${formatLabelName(key)}</span>
                <span class="photos-sidebar-count">${counts[key]}</span>
            </button>
        `;
    }).join('');

    sidebar.innerHTML = allItem + labelItems;
}

document.getElementById('photosSidebar')?.addEventListener('click', (e) => {
    const item = e.target.closest('.photos-sidebar-item');
    if (!item) return;
    const filter = item.dataset.filter || null;
    if (filter === activePhotoFilter) return;
    activePhotoFilter = filter;
    currentPhotoIndex = 0;
    photoNavLocked = false;
    renderPhotosModal();
    playSound('click');
});

/* =========================================================
   27. PHOTO FILE PICKER
   ========================================================= */
const photoChooseFileBtn = document.getElementById('photoChooseFileBtn');
const photoFileInput     = document.getElementById('photoFileInput');

let savedFolderHandle = null; // cached for session after first folder pick

photoChooseFileBtn?.addEventListener('click', () => photoFileInput?.click());

photoFileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
            // Resize to max 800px on longest side
            const maxSize = 800;
            let w = img.width, h = img.height;
            if (w >= h && w > maxSize)      { h = Math.round(h * maxSize / w); w = maxSize; }
            else if (h > w && h > maxSize)  { w = Math.round(w * maxSize / h); h = maxSize; }

            const canvas = document.createElement('canvas');
            canvas.width  = w;
            canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);

            canvas.toBlob(async (blob) => {
                if (!blob) { showAdminToast('Could not process image.'); return; }
                const filename = generatePhotoFilename();
                const saved = await savePhotoBlob(blob, filename);
                if (saved && photoImage) {
                    photoImage.value = `photos/polaroid/${filename}`;
                }
            }, 'image/jpeg', 0.85);
        };
        img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
});

function slugify(text) {
    return (text || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 40)
        .replace(/^-|-$/g, '');
}

function generatePhotoFilename() {
    const date = (photoDate && photoDate.value) || new Date().toISOString().slice(0, 10);
    const slug = slugify(photoMemo && photoMemo.value) || 'photo';
    const rand = Math.random().toString(36).slice(2, 6);
    return `${date}-${slug}-${rand}.jpg`;
}

async function savePhotoBlob(blob, filename) {
    if (window.showDirectoryPicker) {
        try {
            if (!savedFolderHandle) {
                savedFolderHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
                if (savedFolderHandle.name !== 'polaroid') {
                    showAdminToast(`⚠ Folder "${savedFolderHandle.name}" selected — expected "polaroid". Refresh to reset.`);
                }
            }
            const fileHandle = await savedFolderHandle.getFileHandle(filename, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
            showAdminToast(`Saved: ${filename}`);
            return true;
        } catch (err) {
            if (err.name === 'AbortError') return false;
            console.warn('Directory save failed, falling back to download.', err);
            savedFolderHandle = null;
        }
    }

    // Fallback: download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showAdminToast(`Downloaded: ${filename} → move to photos/polaroid/`);
    return true;
}

function showAdminToast(message) {
    let toast = document.getElementById('adminToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'adminToast';
        toast.className = 'admin-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.classList.add('is-visible');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('is-visible');
    }, 3500);
}

/* =========================================================
   28. EDUCATION — ADMIN + PAGE RENDERER
   ========================================================= */

function deriveSortYear(yearsStr) {
    if (!yearsStr) return 0;
    const matches = String(yearsStr).match(/\d{4}/g);
    if (!matches || matches.length === 0) return new Date().getFullYear();
    return parseInt(matches[matches.length - 1], 10);
}

const adminEducationListEl = document.getElementById('adminEducationList');
const educationForm        = document.getElementById('educationForm');
const educationEditIndex   = document.getElementById('educationEditIndex');
const eduInstitution       = document.getElementById('eduInstitution');
const eduDegree            = document.getElementById('eduDegree');
const eduYears             = document.getElementById('eduYears');
const eduLocation          = document.getElementById('eduLocation');
const eduDescription       = document.getElementById('eduDescription');
const eduHighlights        = document.getElementById('eduHighlights');
const educationFormTitle   = document.getElementById('educationFormTitle');

function resetEducationForm() {
    if (!educationForm) return;
    educationForm.reset();
    educationEditIndex.value = '';
    educationFormTitle.textContent = 'Add education entry';
}

document.getElementById('educationCancelBtn')?.addEventListener('click', resetEducationForm);

educationForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const highlightsRaw = (eduHighlights.value || '').trim();
    const highlights = highlightsRaw
        ? highlightsRaw.split('\n').map(s => s.trim()).filter(Boolean)
        : [];

    const entry = {
        institution: eduInstitution.value.trim(),
        degree:      eduDegree.value.trim(),
        years:       eduYears.value.trim(),
        sortYear:    deriveSortYear(eduYears.value.trim()),
        location:    eduLocation.value.trim(),
        description: eduDescription.value.trim(),
        highlights:  highlights
    };

    if (!entry.institution || !entry.degree || !entry.years) {
        alert('Institution, degree, and years are required.');
        return;
    }

    const idx = educationEditIndex.value;
    if (idx === '') {
        contentData.education.push(entry);
    } else {
        contentData.education[parseInt(idx, 10)] = entry;
    }
    saveContent();
    renderAdminEducationList();
    resetEducationForm();
    if (document.getElementById('educationTimeline')) renderEducationPage();
    showAdminToast('Education saved');
    playSound('success');
});

function renderAdminEducationList() {
    if (!adminEducationListEl) return;
    if (contentData.education.length === 0) {
        adminEducationListEl.innerHTML = '<p class="admin-empty">No education entries yet. Add one above.</p>';
        return;
    }
    const sorted = contentData.education
        .map((p, i) => ({ p, i }))
        .sort((a, b) => (b.p.sortYear || 0) - (a.p.sortYear || 0));

    adminEducationListEl.innerHTML = sorted.map(({ p, i }) => `
        <div class="admin-item">
            <div class="admin-item-info">
                <strong>${escapeHtml(p.institution || '')}</strong>
                <span>${escapeHtml(p.degree || '')} / ${escapeHtml(p.years || '')}</span>
            </div>
            <div class="admin-item-actions">
                <button data-action="edit" data-index="${i}" type="button">Edit</button>
                <button data-action="delete" data-index="${i}" type="button">Delete</button>
            </div>
        </div>
    `).join('');
}

adminEducationListEl?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const idx = parseInt(btn.dataset.index, 10);
    const entry = contentData.education[idx];
    if (!entry) return;

    if (btn.dataset.action === 'edit') {
        educationEditIndex.value = idx;
        eduInstitution.value = entry.institution || '';
        eduDegree.value      = entry.degree || '';
        eduYears.value       = entry.years || '';
        eduLocation.value    = entry.location || '';
        eduDescription.value = entry.description || '';
        eduHighlights.value  = (entry.highlights || []).join('\n');
        educationFormTitle.textContent = 'Edit education entry';
        educationForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (btn.dataset.action === 'delete') {
        if (!confirm('Delete this education entry?')) return;
        contentData.education.splice(idx, 1);
        saveContent();
        renderAdminEducationList();
        resetEducationForm();
        if (document.getElementById('educationTimeline')) renderEducationPage();
    }
});

function renderEducationPage() {
    const timeline = document.getElementById('educationTimeline');
    if (!timeline) return;

    const entries = Array.isArray(contentData.education) ? contentData.education : [];

    if (entries.length === 0) {
        timeline.innerHTML = '<p class="education-empty">No education entries yet. Add the first one in the editor.</p>';
        return;
    }

    const sorted = [...entries].sort((a, b) => (b.sortYear || 0) - (a.sortYear || 0));

    const heroMeta = document.getElementById('educationHeroMeta');
    if (heroMeta) {
        const latest = sorted[0];
        heroMeta.innerHTML = [
            latest.institution,
            latest.degree,
            latest.years,
            latest.location
        ].filter(Boolean).map(value => `<span>${escapeHtml(value)}</span>`).join('');
    }

    timeline.innerHTML = sorted.map(entry => {
        const highlightsHtml = (entry.highlights && entry.highlights.length)
            ? `<div class="education-highlights">${entry.highlights.map(h =>
                `<span class="education-chip">${escapeHtml(h)}</span>`
              ).join('')}</div>`
            : '';

        return `
            <article class="education-card">
                <div class="education-card-icon card-icon card-icon--edu" aria-hidden="true"></div>
                <div class="education-card-body">
                    <h3 class="education-institution">${escapeHtml(entry.institution || '')}</h3>
                    <p class="education-degree">${escapeHtml(entry.degree || '')}</p>
                    <div class="education-meta">
                        <span class="education-years">${escapeHtml(entry.years || '')}</span>
                        ${entry.location ? `<span class="education-loc-sep">/</span><span class="education-location">${escapeHtml(entry.location)}</span>` : ''}
                    </div>
                    ${entry.description ? `<p class="education-description">${escapeHtml(entry.description)}</p>` : ''}
                    ${highlightsHtml}
                </div>
            </article>
        `;
    }).join('');
}

/* =========================================================
   29. EXPERIENCE — ADMIN + PAGE RENDERER
   ========================================================= */

function deriveExpSortYear(yearsStr) {
    if (!yearsStr) return 0;
    const matches = String(yearsStr).match(/\d{4}/g);
    if (!matches || matches.length === 0) return new Date().getFullYear();
    return parseInt(matches[matches.length - 1], 10);
}

function getDocIcon(path) {
    const lower = (path || '').toLowerCase();
    if (lower.endsWith('.pdf')) return '📄';
    if (/\.(jpg|jpeg|png|gif|webp|svg)$/.test(lower)) return '🖼️';
    if (/\.(doc|docx)$/.test(lower)) return '📝';
    if (/\.(xls|xlsx|csv)$/.test(lower)) return '📊';
    if (lower.endsWith('.txt')) return '📃';
    return '📎';
}

const adminExperienceListEl = document.getElementById('adminExperienceList');
const experienceForm        = document.getElementById('experienceForm');
const experienceEditIndex   = document.getElementById('experienceEditIndex');
const expPosition           = document.getElementById('expPosition');
const expOrganization       = document.getElementById('expOrganization');
const expYears              = document.getElementById('expYears');
const expLocation           = document.getElementById('expLocation');
const expDescription        = document.getElementById('expDescription');
const expHighlights         = document.getElementById('expHighlights');
const expDocuments          = document.getElementById('expDocuments');
const experienceFormTitle   = document.getElementById('experienceFormTitle');

function resetExperienceForm() {
    if (!experienceForm) return;
    experienceForm.reset();
    experienceEditIndex.value = '';
    experienceFormTitle.textContent = 'Add experience entry';
}

document.getElementById('experienceCancelBtn')?.addEventListener('click', resetExperienceForm);

experienceForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const highlightsRaw = (expHighlights.value || '').trim();
    const highlights = highlightsRaw
        ? highlightsRaw.split('\n').map(s => s.trim()).filter(Boolean)
        : [];

    const docsRaw = (expDocuments.value || '').trim();
    const documents = docsRaw
        ? docsRaw.split('\n').map(line => {
              const parts = line.split('|').map(s => s.trim());
              if (parts.length >= 2 && parts[0] && parts[1]) {
                  return { title: parts[0], path: parts[1] };
              }
              return null;
          }).filter(Boolean)
        : [];

    const entry = {
        position:     expPosition.value.trim(),
        organization: expOrganization.value.trim(),
        years:        expYears.value.trim(),
        sortYear:     deriveExpSortYear(expYears.value.trim()),
        location:     expLocation.value.trim(),
        description:  expDescription.value.trim(),
        highlights:   highlights,
        documents:    documents
    };

    if (!entry.position || !entry.organization || !entry.years) {
        alert('Position, organization, and years are required.');
        return;
    }

    const idx = experienceEditIndex.value;
    if (idx === '') {
        contentData.experience.push(entry);
    } else {
        contentData.experience[parseInt(idx, 10)] = entry;
    }
    saveContent();
    renderAdminExperienceList();
    resetExperienceForm();
    if (document.getElementById('experienceTimeline')) renderExperiencePage();
    showAdminToast('Experience saved');
    playSound('success');
});

function renderAdminExperienceList() {
    if (!adminExperienceListEl) return;
    if (!contentData.experience || contentData.experience.length === 0) {
        adminExperienceListEl.innerHTML = '<p class="admin-empty">No experience entries yet. Add one above.</p>';
        return;
    }
    const sorted = contentData.experience
        .map((p, i) => ({ p, i }))
        .sort((a, b) => (b.p.sortYear || 0) - (a.p.sortYear || 0));

    adminExperienceListEl.innerHTML = sorted.map(({ p, i }) => `
        <div class="admin-item">
            <div class="admin-item-info">
                <strong>${escapeHtml(p.position || '')}</strong>
                <span>${escapeHtml(p.organization || '')} / ${escapeHtml(p.years || '')}</span>
            </div>
            <div class="admin-item-actions">
                <button data-action="edit" data-index="${i}" type="button">Edit</button>
                <button data-action="delete" data-index="${i}" type="button">Delete</button>
            </div>
        </div>
    `).join('');
}

adminExperienceListEl?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const idx = parseInt(btn.dataset.index, 10);
    const entry = contentData.experience[idx];
    if (!entry) return;

    if (btn.dataset.action === 'edit') {
        experienceEditIndex.value = idx;
        expPosition.value     = entry.position || '';
        expOrganization.value = entry.organization || '';
        expYears.value        = entry.years || '';
        expLocation.value     = entry.location || '';
        expDescription.value  = entry.description || '';
        expHighlights.value   = (entry.highlights || []).join('\n');
        expDocuments.value    = (entry.documents || []).map(d => `${d.title} | ${d.path}`).join('\n');
        experienceFormTitle.textContent = 'Edit experience entry';
        experienceForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (btn.dataset.action === 'delete') {
        if (!confirm('Delete this experience entry?')) return;
        contentData.experience.splice(idx, 1);
        saveContent();
        renderAdminExperienceList();
        resetExperienceForm();
        if (document.getElementById('experienceTimeline')) renderExperiencePage();
    }
});

function renderExperiencePage() {
    const timeline = document.getElementById('experienceTimeline');
    if (!timeline) return;

    const entries = Array.isArray(contentData.experience) ? contentData.experience : [];

    if (entries.length === 0) {
        timeline.innerHTML = '<p class="experience-empty">No experience entries yet. Add the first one in the editor.</p>';
        return;
    }

    const sorted = [...entries].sort((a, b) => (b.sortYear || 0) - (a.sortYear || 0));

    const heroMeta = document.getElementById('experienceHeroMeta');
    if (heroMeta) {
        const latest = sorted[0];
        heroMeta.innerHTML = [
            latest.position,
            latest.organization,
            latest.years,
            latest.location
        ].filter(Boolean).map(value => `<span>${escapeHtml(value)}</span>`).join('');
    }

    timeline.innerHTML = sorted.map(entry => {
        const highlightsHtml = (entry.highlights && entry.highlights.length)
            ? `<div class="experience-highlights">${entry.highlights.map(h =>
                `<span class="experience-chip">${escapeHtml(h)}</span>`
              ).join('')}</div>`
            : '';

        const docsHtml = (entry.documents && entry.documents.length)
            ? `
                <div class="experience-docs">
                    <div class="experience-docs-label">Attached documents</div>
                    <div class="experience-docs-list">
                        ${entry.documents.map(d => `
                            <a class="experience-doc-link" href="${escapeHtml(d.path || '#')}" target="_blank" rel="noopener">
                                <span class="experience-doc-icon">${getDocIcon(d.path)}</span>
                                <span>${escapeHtml(d.title || 'Document')}</span>
                            </a>
                        `).join('')}
                    </div>
                </div>
              `
            : '';

        return `
            <article class="experience-card">
                <div class="experience-card-icon card-icon card-icon--exp" aria-hidden="true"></div>
                <div class="experience-card-body">
                    <h3 class="experience-position">${escapeHtml(entry.position || '')}</h3>
                    <p class="experience-organization">${escapeHtml(entry.organization || '')}</p>
                    <div class="experience-meta">
                        <span class="experience-years">${escapeHtml(entry.years || '')}</span>
                        ${entry.location ? `<span class="experience-loc-sep">/</span><span class="experience-location">${escapeHtml(entry.location)}</span>` : ''}
                    </div>
                    ${entry.description ? `<p class="experience-description">${escapeHtml(entry.description)}</p>` : ''}
                    ${highlightsHtml}
                    ${docsHtml}
                </div>
            </article>
        `;
    }).join('');
}

/* =========================================================
   30. PROFILE PAGE RENDERER
   ========================================================= */
function renderProfilePage() {
    const nameEl     = document.getElementById('profileName');
    const greetingEl = document.getElementById('profileGreeting');
    const titleEl    = document.getElementById('profileTitle');
    const taglineEl  = document.getElementById('profileTagline');
    const metaEl     = document.getElementById('profileMeta');
    const bioEl      = document.getElementById('profileBio');
    const aboutEl    = document.getElementById('profileAbout');
    const actionsEl  = document.getElementById('profileActions');

    if (!nameEl) return;

    const p = contentData.profile || {};

    if (greetingEl) {
        greetingEl.textContent = p.greeting || '';
        greetingEl.style.display = p.greeting ? '' : 'none';
    }

    nameEl.innerHTML = `${escapeHtml(p.name || 'IAN')}${p.pronouns ? ` <span class="profile-hero-pronouns">(${escapeHtml(p.pronouns)})</span>` : ''}`;

    if (titleEl) {
        titleEl.textContent = p.title || '';
        titleEl.style.display = p.title ? '' : 'none';
    }

    if (taglineEl) {
        taglineEl.textContent = p.tagline || '';
        taglineEl.style.display = p.tagline ? '' : 'none';
    }

    if (actionsEl) {
        const pageFile = location.pathname.split('/').pop() || 'index.html';
        const visibleActions = (p.actions || []).filter(a => (a.href || '') !== pageFile);
        if (p.email && !visibleActions.some(a => String(a.href || '').startsWith('mailto:'))) {
            visibleActions.push({ label: 'Email', href: `mailto:${p.email}`, style: 'secondary' });
        }
        const actionHtml = visibleActions.map(a =>
            `<a href="${escapeHtml(a.href || '#')}" class="${actionClass(a.style)}">${escapeHtml(a.label || '')}</a>`
        ).join('');
        actionsEl.innerHTML = actionHtml;
        actionsEl.style.display = actionHtml ? '' : 'none';
    }

    if (metaEl) {
        const parts = [];
        if (p.location) parts.push(`<span class="profile-meta-item">⌖ ${escapeHtml(p.location)}</span>`);
        if (p.email) parts.push(`<span class="profile-meta-item"><a href="mailto:${escapeHtml(p.email)}">✉ Email</a></span>`);
        if (p.linkedin) {
            const url = p.linkedin.startsWith('http') ? p.linkedin : `https://${p.linkedin}`;
            parts.push(`<span class="profile-meta-item"><a href="${escapeHtml(url)}" target="_blank" rel="noopener">↗ LinkedIn</a></span>`);
        }
        if (parts.length) {
            metaEl.innerHTML = parts.join('<span class="meta-sep">/</span>');
            metaEl.style.display = '';
        } else {
            metaEl.innerHTML = '';
            metaEl.style.display = 'none';
        }
    }

    if (bioEl) {
        bioEl.textContent = p.bio || '';
        bioEl.style.display = p.bio ? '' : 'none';
    }

    if (aboutEl) {
        if (p.about && p.about.trim()) {
            const paragraphs = p.about.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
            aboutEl.innerHTML = paragraphs.map(par => `<p>${escapeHtml(par)}</p>`).join('');
            aboutEl.style.display = '';
        } else {
            aboutEl.innerHTML = '';
            aboutEl.style.display = 'none';
        }
    }
}

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
                <input type="text" data-key="${key}" value="${escapeHtml(existing)}" placeholder="${escapeHtml(block.placeholder || '')}">
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

function submitSurvey() {
    const toEmail = (contentData.profile && contentData.profile.email || '').trim();
    if (!toEmail) {
        showAdminToast('No contact email is configured for survey submissions.');
        return;
    }

    const active = getActiveSurvey();
    if (!active) { alert('No active survey.'); return; }
    const fields = active.fields || [];

    // Find a name-like value for the subject line
    let nameVal = '';
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
    window.location.href = mailto;

    surveySubmitted = true;
    renderSurveyPage();
    playSound('success');
}

document.getElementById('surveyResetBtn')?.addEventListener('click', () => {
    surveyPage = 0;
    surveyAnswers = {};
    surveySubmitted = false;
    renderSurveyPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

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
        return `<div class="post-field-actions">${actions.map(a =>
            `<a href="${escapeHtml(a.href)}" class="btn btn-${escapeHtml(a.style)}">${escapeHtml(a.label)}</a>`
        ).join('')}</div>`;
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

/* =========================================================
   47. BOOT
   Rendering starts only after the whole module has evaluated so
   every state variable exists, then the published content replaces
   the hard-coded defaults.
   ========================================================= */
loadContent();