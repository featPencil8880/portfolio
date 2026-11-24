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

function safeHref(value, allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:']) {
    const href = String(value || '').trim();
    if (!href || href.startsWith('//') || href.startsWith('\\\\')) return '';

    try {
        const url = new URL(href, document.baseURI);
        return allowedProtocols.includes(url.protocol) ? href : '';
    } catch {
        return '';
    }
}

function safeWebHref(value) {
    const href = String(value || '').trim();
    const normalized = /^[a-z][a-z\d+.-]*:/i.test(href) ? href : `https://${href}`;
    return safeHref(normalized, ['http:', 'https:']);
}

function slugify(text, maxLength = 40) {
    return String(text || '')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, maxLength)
        .replace(/^-|-$/g, '');
}

function migratePost(post) {
    if (!post || typeof post !== 'object') return null;
    if (Array.isArray(post.fields)) {
        // Already new format — ensure required props
        if (!post.id) post.id = genPostId();
        if (!post.tab) post.tab = 'home';
        if (!Array.isArray(post.photos)) post.photos = [];
        if (!post.slug) post.slug = makePostSlug(post);
        return post;
    }
    // Old format (title + excerpt + image)
    const blocks = [];
    if (post.title)   blocks.push({ type: 'title',     content: post.title });
    if (post.excerpt) blocks.push({ type: 'paragraph', content: post.excerpt });
    const fields = blocks.length ? [{ name: 'Content', blocks }] : [];
    const photos = post.image ? [{ image: post.image, position: 'top' }] : [];
    const migrated = {
        id: post.id || genPostId(),
        date: post.date || '',
        tab: post.tab || 'home',
        label: post.label || 'general',
        author: post.author || 'Me',
        photos,
        fields
    };
    migrated.slug = makePostSlug(migrated);
    return migrated;
}

function makePostSlug(post, titleOverride) {
    const base = slugify(titleOverride || getPostTitle(post), 64) || 'note';
    const id = String(post && post.id || '').replace(/[^a-z0-9]/gi, '');
    const suffix = id.slice(-4).toLowerCase();
    return suffix ? `${base}-${suffix}` : base;
}

function getPostUrl(post) {
    if (!post) return 'notes.html';
    const slug = post.slug || makePostSlug(post);
    return `notes/${slug}/`;
}

function getNoteBySlug(slug) {
    if (!slug) return null;
    return thoughtsPosts.find(post => (post.slug || makePostSlug(post)) === slug)
        || thoughtsPosts.find(post => post.id === slug)
        || null;
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

