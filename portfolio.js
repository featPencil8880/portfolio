// portfolio.js

/* =========================================================
   WIDGET INJECTION — subpages get the widget via JS
   (Home already has it inline, so this is a no-op there)
   ========================================================= */
const WIDGET_HTML = `
<div class="widget-panel">
    <div class="widget-header">
        <button class="widget-btn" id="diceBtn" title="Surprise me with a random post" type="button">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7.5 18c-.83 0-1.5-.67-1.5-1.5S6.67 15 7.5 15s1.5.67 1.5 1.5S8.33 18 7.5 18zm0-9C6.67 9 6 8.33 6 7.5S6.67 6 7.5 6 9 6.67 9 7.5 8.33 9 7.5 9zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm0-9c-.83 0-1.5-.67-1.5-1.5S15.67 6 16.5 6s1.5.67 1.5 1.5S17.33 9 16.5 9z"/></svg>
        </button>
        <button class="widget-btn" id="photosBtn" title="View photo gallery" type="button">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12,17.27L18.18,21l-1.64-7.03L22,9.24l-7.19-0.61L12,2L9.19,8.63L2,9.24l5.46,4.73L5.82,21L12,17.27z"/></svg>
        </button>
        <button class="widget-btn" id="thoughtBtn" title="Manage Posts" type="button">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M10.59,21.41Q10,20.83 10,20h4q0,0.82-0.59,1.41T12,22t-1.41-0.59ZM8,19V17h8v2H8Zm0.25-3q-1.72-1.03-2.74-2.75Q4.5,11.52 4.5,9.5q0-3.13 2.19-5.31T12,2t5.31,2.19T19.5,9.5q0,2.02-1.01,3.75T15.75,16H8.25Zm0.6-2h6.3q1.13-0.8 1.74-1.98T17.5,9.5q0-2.3-1.6-3.9T12,4T8.1,5.6T6.5,9.5q0,1.35 0.61,2.52T8.85,14ZM12,14Z"/></svg>
        </button>
        <button class="widget-btn widget-btn-small" id="clockToggleBtn" title="Toggle Clock Type" type="button">
            <svg id="digitalIcon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.63,13.9h0.6V10.1H6.8L5.68,10.9L6,11.38l0.63-0.45V13.9Zm1.43,0.03h2.5V13.35H8.9V13.3l0.97-1q0.3-0.3 0.45-0.6t0.15-0.6q0-0.5-0.34-0.8T9.28,10Q8.83,10 8.5,10.23q-0.32,0.22-0.45,0.63L8.58,11.1q0.1-0.25 0.27-0.38Q9.03,10.6 9.28,10.6q0.28,0 0.44,0.14q0.16,0.14 0.16,0.39q0,0.3-0.42,0.77l-1.4,1.45v0.57Zm3.85-0.15q0.13-0.13 0.13-0.32T11.9,13.13T11.58,13t-0.33,0.13t-0.13,0.32t0.13,0.32t0.33,0.13t0.32-0.13Zm0-2.02q0.13-0.13 0.13-0.33q0-0.2-0.13-0.32t-0.32-0.13T11.25,11.1t-0.13,0.32q0,0.2 0.13,0.33t0.33,0.13t0.32-0.13ZM13.88,14q0.58,0 0.93-0.33t0.35-0.82q0-0.35-0.17-0.59T14.5,11.9V11.88q0.25-0.13 0.39-0.34t0.14-0.49q0-0.42-0.35-0.74T13.83,10q-0.43,0-0.74,0.21q-0.31,0.21-0.46,0.59l0.55,0.22q0.1-0.22 0.26-0.34t0.39-0.11q0.28,0 0.42,0.14t0.15,0.34q0,0.25-0.19,0.41q-0.19,0.16-0.46,0.16h-0.3V12.2h0.32q0.35,0 0.54,0.14q0.19,0.14 0.19,0.41q0,0.27-0.2,0.46T13.8,13.4q-0.28,0-0.44-0.15T13.1,12.77L12.53,13q0.15,0.47 0.5,0.74T13.88,14ZM17,14q0.55,0 0.94-0.38t0.39-0.93q0-0.5-0.32-0.86q-0.32-0.36-0.82-0.36q-0.05,0-0.4,0.1l-0.03-0.03l0.88-1.2L17.13,10l-0.97,1.4q-0.3,0.43-0.4,0.7t-0.1,0.53q0,0.57 0.39,0.97T17,14Zm-0.54-0.79Q16.25,13 16.25,12.7t0.21-0.51t0.51-0.21t0.51,0.21T17.7,12.7t-0.21,0.51q-0.21,0.21-0.51,0.21t-0.51-0.21ZM12,22q-2.07,0-3.9-0.79q-1.82-0.79-3.17-2.14Q3.58,17.73 2.79,15.9T2,12Q2,9.92 2.79,8.1Q3.58,6.27 4.93,4.93Q6.28,3.57 8.1,2.79Q9.93,2 12,2t3.9,0.79t3.17,2.14q1.35,1.35 2.14,3.17Q22,9.92 22,12t-0.79,3.9t-2.14,3.17q-1.35,1.35-3.17,2.14T12,22Zm0-10Zm0,8q3.33,0 5.66-2.34T20,12q0-3.33-2.34-5.66T12,4Q8.68,4 6.34,6.34T4,12t2.34,5.66T12,20Z"/></svg>
            <svg id="analogIcon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="display: none;"><path d="M14.55,16.55L11,13V8h2v4.17l2.95,2.95l-1.4,1.43ZM11,6V4h2V6H11Zm7,7V11h2v2H18Zm-7,7V18h2v2H11ZM4,13V11H6v2H4Zm8,9q-2.07,0-3.9-0.79q-1.82-0.79-3.17-2.14Q3.58,17.73 2.79,15.9T2,12Q2,9.92 2.79,8.1Q3.58,6.27 4.93,4.93Q6.28,3.57 8.1,2.79Q9.93,2 12,2t3.9,0.79t3.17,2.14q1.35,1.35 2.14,3.17Q22,9.92 22,12t-0.79,3.9t-2.14,3.17q-1.35,1.35-3.17,2.14T12,22Zm0-2q3.35,0 5.68-2.32T20,12T17.68,6.32T12,4T6.33,6.32T4,12t2.33,5.68T12,20Zm0-8Z"/></svg>
        </button>
        <button class="widget-btn" id="settingsBtn" title="Settings" type="button">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9.25,22l-0.4-3.2q-0.32-0.13-0.61-0.3T7.68,18.13L4.7,19.38L1.95,14.63l2.58-1.95Q4.5,12.5 4.5,12.34q0-0.16 0-0.34t0-0.34t0.03-0.34L1.95,9.38L4.7,4.63L7.68,5.88Q7.95,5.68 8.25,5.5t0.6-0.3L9.25,2h5.5l0.4,3.2q0.33,0.13 0.61,0.3t0.56,0.38L19.3,4.63l2.75,4.75l-2.57,1.95q0.02,0.18 0.02,0.34t0,0.34t0,0.34t-0.05,0.34l2.57,1.95l-2.75,4.75l-2.95-1.25q-0.27,0.2-0.57,0.38t-0.6,0.3L14.75,22H9.25ZM11,20h1.98l0.35-2.65q0.78-0.2 1.44-0.59t1.21-0.94l2.47,1.03l0.98-1.7l-2.15-1.63q0.13-0.35 0.17-0.74T17.5,12t-0.05-0.79q-0.05-0.39-0.17-0.74l2.15-1.63l-0.98-1.7L15.98,8.2q-0.55-0.57-1.21-0.96T13.33,6.65L13,4H11.03L10.68,6.65Q9.9,6.85 9.24,7.24T8.03,8.17L5.55,7.15L4.58,8.85l2.15,1.6Q6.6,10.83 6.55,11.2T6.5,12q0,0.4 0.05,0.77t0.17,0.75L4.58,15.15l0.98,1.7L8.03,15.8q0.55,0.58 1.21,0.96t1.44,0.59L11,20Zm1.05-4.5q1.45,0 2.47-1.03T15.55,12T14.53,9.52T12.05,8.5q-1.47,0-2.49,1.02T8.55,12t1.01,2.47t2.49,1.03ZM12,12Z"/></svg>
        </button>
    </div>
    <div class="widget-body">
        <div class="widget-clock-container">
            <div id="digitalClock" class="clock-digital">00:00:00</div>
            <div id="analogClock" class="clock-analog" style="display: none;">
                <div class="clock-center"></div>
                <div class="hand hour-hand" id="hourHand"></div>
                <div class="hand min-hand" id="minHand"></div>
                <div class="hand sec-hand" id="secHand"></div>
            </div>
        </div>
        <div class="widget-calendar">
            <div class="calendar-header">
                <div class="calendar-nav">
                    <button class="calendar-btn" id="prevYear" title="Previous Year" type="button">&laquo;</button>
                    <button class="calendar-btn" id="prevMonth" title="Previous Month" type="button">&lsaquo;</button>
                </div>
                <span id="calendarMonthYear" class="calendar-title">Loading...</span>
                <div class="calendar-nav">
                    <button class="calendar-btn" id="nextMonth" title="Next Month" type="button">&rsaquo;</button>
                    <button class="calendar-btn" id="nextYear" title="Next Year" type="button">&raquo;</button>
                </div>
            </div>
            <div class="calendar-grid" id="calendarGrid"></div>
            <div class="calendar-worded-date" id="wordedDate"></div>
            <button class="calendar-today-btn" id="calendarTodayBtn" type="button" style="display: none;">Back to Today</button>
        </div>
    </div>
</div>
`;

(function injectWidgetIfMissing() {
    if (document.querySelector('.widget-panel')) return;
    const content = document.querySelector('.content');
    if (!content) return;
    const template = document.createElement('template');
    template.innerHTML = WIDGET_HTML.trim();
    content.appendChild(template.content.firstChild);
})();

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
const isHome    = document.body.classList.contains('page-home');

/* =========================================================
   1. RESET TO HOME ON REFRESH
   ========================================================= */
const navEntries = performance.getEntriesByType("navigation");
if (navEntries.length > 0 && navEntries[0].type === "reload") {
    if (!isHome) window.location.href = 'index.html';
}

/* =========================================================
   2. MENU vs BACK BUTTON
   ========================================================= */
if (navBtn) {
    if (isHome) {
        navBtn.innerHTML = 'MENU';
        navBtn.setAttribute('aria-expanded', 'false');
        navBtn.addEventListener('click', () => {
            const isOpen = leftPanel.classList.toggle('is-open');
            navBtn.setAttribute('aria-expanded', String(isOpen));
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && leftPanel.classList.contains('is-open')) {
                leftPanel.classList.remove('is-open');
                navBtn.setAttribute('aria-expanded', 'false');
                navBtn.focus();
            }
        });
    } else {
        const backIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12,16l1.4-1.4L11.8,13H16V11H11.8l1.6-1.6L12,8L8,12l4,4Zm0,6q-2.07,0-3.9-0.79q-1.82-0.79-3.17-2.14Q3.58,17.73 2.79,15.9T2,12Q2,9.92 2.79,8.1Q3.58,6.27 4.93,4.93Q6.28,3.57 8.1,2.79Q9.93,2 12,2t3.9,0.79t3.17,2.14q1.35,1.35 2.14,3.17Q22,9.92 22,12t-0.79,3.9t-2.14,3.17q-1.35,1.35-3.17,2.14T12,22Zm0-2q3.35,0 5.68-2.32T20,12T17.68,6.32T12,4T6.33,6.32T4,12t2.33,5.68T12,20Zm0-8Z"/></svg>`;
        navBtn.innerHTML = backIcon;
        navBtn.title = "Go Back";
        navBtn.addEventListener('click', () => window.history.back());
    }
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
            description: "Edit this entry in the admin panel to fill in your actual details.",
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
            date: "2024-11-20",
            title: "Why Child Psychology Fascinates Me",
            excerpt: "The moment I realized children aren't just 'small adults' — their minds work in completely different ways. This changed everything about how I approach mentorship.",
            label: "cognitive",
            author: "Me",
            image: ""
        },
        {
            date: "2024-11-15",
            title: "First Week at the YMCA",
            excerpt: "The energy in the room was infectious. Some reflections on what I learned from the kids in my very first week.",
            label: "memory",
            author: "Me",
            image: ""
        },
        {
            date: "2024-11-10",
            title: "On Research Methods",
            excerpt: "Data doesn't speak for itself — it speaks through the questions we ask. A note on why I love qualitative work.",
            label: "introspection",
            author: "Me",
            image: ""
        }
    ],
    photos: []
};

/* Aliases — existing code reads these, no changes needed below */
const heroData      = contentData.profile;
const thoughtsPosts = contentData.posts;

/* Snapshot of defaults for the Reset button */
const DEFAULT_CONTENT = JSON.parse(JSON.stringify(contentData));

/* =========================================================
   8. LABEL PALETTE & HELPERS
   ========================================================= */
   /* Edit this list as family members join */
const AUTHORS = ["Me"];

const postLabels = {
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
};
const defaultLabel = { color: "#E0E0E0" };
function getLabel(key) { return postLabels[key] || defaultLabel; }
function formatLabelName(key) {
    if (!key) return "General";
    return key.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

const LABEL_ICON_SVG = `<svg class="post-label-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4,20q-0.82,0-1.41-0.59T2,18V6Q2,5.18 2.59,4.59T4,4H15q0.48,0 0.9,0.21T16.6,4.8L22,12l-5.4,7.2q-0.28,0.38-0.7,0.59T15,20H4Zm0-2H15l4.5-6L15,6H4V18Zm5.5-6Z"/></svg>`;

/* =========================================================
   9. HERO RENDERING
   ========================================================= */
function renderProfileMeta(p) {
    const parts = [];
    if (p.location) parts.push(`<span class="profile-meta-item">📍 ${p.location}</span>`);
    if (p.email) {
        parts.push(`<span class="profile-meta-item"><a href="mailto:${p.email}">✉️ ${p.email}</a></span>`);
    }
    if (p.linkedin) {
        const url = p.linkedin.startsWith('http') ? p.linkedin : `https://${p.linkedin}`;
        parts.push(`<span class="profile-meta-item"><a href="${url}" target="_blank" rel="noopener">🔗 LinkedIn</a></span>`);
    }
    if (parts.length === 0) return '';
    return `<div class="hero-meta">${parts.join('<span class="meta-sep">·</span>')}</div>`;
}

function renderHero() {
    const el = document.getElementById('heroText');
    if (!el) return;
    el.innerHTML = `
        ${heroData.greeting ? `<p class="greeting">${heroData.greeting}</p>` : ''}
        <h1 class="hero-name">
            ${heroData.name || ''}
            ${heroData.pronouns ? `<span class="hero-pronouns">(${heroData.pronouns})</span>` : ''}
        </h1>
        ${heroData.title ? `<h2 class="hero-title">${heroData.title}</h2>` : ''}
        ${heroData.tagline ? `<p class="hero-tagline">${heroData.tagline}</p>` : ''}
        ${heroData.bio ? `<p class="hero-bio">${heroData.bio}</p>` : ''}
        ${renderProfileMeta(heroData)}
        ${heroData.actions && heroData.actions.length ? `
            <div class="hero-actions">
                ${heroData.actions.map(a =>
                    `<a href="${a.href}" class="btn btn-${a.style}">${a.label}</a>`
                ).join('')}
            </div>
        ` : ''}
    `;
}

/* =========================================================
   10. POSTS RENDERING
   ========================================================= */
let currentDateFilter = null;
let activeLabelFilter = null;

function formatPostDate(dateStr) {
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

    let filtered = [...thoughtsPosts];

    if (currentDateFilter) {
        const key = `${currentDateFilter.getFullYear()}-${String(currentDateFilter.getMonth() + 1).padStart(2, '0')}-${String(currentDateFilter.getDate()).padStart(2, '0')}`;
        filtered = filtered.filter(p => p.date === key);
    }

    if (activeLabelFilter) {
        filtered = filtered.filter(p => (p.label || 'general') === activeLabelFilter);
    }

    filtered.sort((a, b) => b.date.localeCompare(a.date));

    if (filtered.length === 0) {
        let message = 'No thoughts for this day yet. Check back later!';
        if (currentDateFilter && activeLabelFilter) {
            message = `No posts labeled "${formatLabelName(activeLabelFilter)}" on this date.`;
        } else if (activeLabelFilter) {
            message = `No posts labeled "${formatLabelName(activeLabelFilter)}" yet.`;
        }
        postList.innerHTML = `<p class="no-posts">${message}</p>`;
    } else {
            postList.innerHTML = filtered.map(post => {
            const label = getLabel(post.label);
            const postKey = `${post.date}|${post.title}`;
            return `
                <article class="post-card" data-post-key="${postKey}" style="--label-color: ${label.color};">
                    <div class="post-label">
                        ${LABEL_ICON_SVG}
                        <span class="post-label-text">${formatLabelName(post.label)}</span>
                    </div>
                    <div class="post-card-date">
                      ${formatPostDate(post.date)}${post.author ? ` · ${post.author}` : ''}
                    </div>
                    <h4 class="post-card-title">${post.title}</h4>
                    ${post.image ? `<img src="${post.image}" alt="" class="post-card-image">` : ''}
                    <p class="post-card-excerpt">${post.excerpt}</p>
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
            if (document.getElementById('postList')) {
                currentDateFilter = new Date(year, month, day);
                renderCalendar(currentViewDate);
                renderPosts();
            } else {
                const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                window.location.href = `index.html?date=${key}`;
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
    const card = e.target.closest('.post-card');
    if (!card) return;
    if (document.body.classList.contains('post-focused')) return;

    card.classList.add('is-expanded');
    document.body.classList.add('post-focused');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* =========================================================
   14. BOOK TOGGLE (close reading mode)
   ========================================================= */
document.getElementById('bookToggle')?.addEventListener('click', () => {
    if (document.body.classList.contains('post-focused')) {
        document.querySelectorAll('.post-card.is-expanded').forEach(c => c.classList.remove('is-expanded'));
        document.body.classList.remove('post-focused');
    }
});

/* =========================================================
   15. PAGE INITS
   ========================================================= */
if (document.getElementById('heroText')) {
    renderHero();
}

if (document.getElementById('educationTimeline')) {
    renderEducationPage();
}

if (document.getElementById('experienceTimeline')) {
    renderExperiencePage();
}

if (document.getElementById('profileName')) {
    renderProfilePage();
}

if (document.getElementById('skillsCard')) {
    renderSkillsPage();
}

if (document.getElementById('postList')) {
    renderLabelChips();
    renderPosts();
    document.getElementById('clearPostFilter')?.addEventListener('click', () => {
        currentDateFilter = null;
        activeLabelFilter = null;
        renderCalendar(currentViewDate);
        renderPosts();
        renderLabelChips();
    });
}

/* =========================================================
   16. SCROLL COLLAPSE (Desktop Only)
   ========================================================= */
const contentArea = document.querySelector('.content');
const widgetPanel = document.querySelector('.widget-panel');

if (contentArea && widgetPanel) {
    contentArea.addEventListener('scroll', () => {
        if (window.innerWidth <= 1000) return;
        widgetPanel.classList.toggle('is-collapsed', contentArea.scrollTop > 50);
    });
}

/* =========================================================
   17. HERO PHOTO UPLOAD
   ========================================================= */
const heroUploadBtn  = document.getElementById('heroUploadBtn');
const heroPhotoInput = document.getElementById('heroPhotoInput');
const polaroidImg    = document.getElementById('polaroidImg');

if (heroUploadBtn && heroPhotoInput && polaroidImg) {
    // Restore previously saved photo
    const savedPhoto = localStorage.getItem('heroPhoto');
    if (savedPhoto) polaroidImg.src = savedPhoto;

    // Click the + button → open file picker
    heroUploadBtn.addEventListener('click', () => heroPhotoInput.click());

    // When a file is picked → resize → apply → save
    heroPhotoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                // Resize so the longest side is 400px (keeps file small for storage)
                const maxSize = 400;
                let w = img.width, h = img.height;
                if (w >= h && w > maxSize)      { h = Math.round(h * maxSize / w); w = maxSize; }
                else if (h > w && h > maxSize)  { w = Math.round(w * maxSize / h); h = maxSize; }

                const canvas = document.createElement('canvas');
                canvas.width  = w;
                canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);

                const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                polaroidImg.src = dataUrl;

                try {
                    localStorage.setItem('heroPhoto', dataUrl);
                } catch (err) {
                    console.warn('Photo too large to save locally — will reset on refresh.', err);
                }
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    });
}

/* =========================================================
   4-tier loader: portfolioContent > legacy thoughtsPosts key > content.json > legacy posts.json > defaults
   ========================================================= */
(async function loadContent() {
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
})();

function applyContent(parsed) {
    if (parsed.profile && typeof parsed.profile === 'object') {
        Object.assign(contentData.profile, parsed.profile);
    }
    if (Array.isArray(parsed.posts) && parsed.posts.length > 0) {
        thoughtsPosts.length = 0;
        thoughtsPosts.push(...parsed.posts);
    }
    if (Array.isArray(parsed.education)) {
        contentData.education.length = 0;
        contentData.education.push(...parsed.education);
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

    if (document.getElementById('heroText')) renderHero();
    updateHeaderName();
    if (document.getElementById('postList')) {
        renderLabelChips();
        renderPosts();
    }
    if (typeof currentViewDate !== 'undefined') renderCalendar(currentViewDate);
    if (typeof populateProfileForm === 'function') populateProfileForm();
    if (typeof populateSkillsForm === 'function') populateSkillsForm();
    if (document.getElementById('educationTimeline')) renderEducationPage();
    if (document.getElementById('experienceTimeline')) renderExperiencePage();
    if (document.getElementById('profileName')) renderProfilePage();
    if (document.getElementById('skillsCard')) renderSkillsPage();
}

function saveContent() {
    try {
        localStorage.setItem('portfolioContent', JSON.stringify(contentData));
    } catch (e) {
        alert('Could not save locally — storage may be full or blocked.');
    }
}

function updateHeaderName() {
    const nameEl = document.querySelector('.name');
    if (nameEl) nameEl.textContent = contentData.profile.name;
}

/* Run immediately so every page has the current name even before loader finishes */
updateHeaderName();

/* =========================================================
   18. ADMIN POST EDITOR
   ========================================================= */
const adminBackdrop  = document.getElementById('adminBackdrop');
const adminListEl    = document.getElementById('adminList');
const adminForm      = document.getElementById('adminForm');
const adminEditIndex = document.getElementById('adminEditIndex');
const adminDate      = document.getElementById('adminDate');
const adminTitleIn   = document.getElementById('adminTitleInput');
const adminExcerpt   = document.getElementById('adminExcerpt');
const adminLabelSel  = document.getElementById('adminLabel');
const adminFormTitle = document.getElementById('adminFormTitle');
const adminAuthorSel = document.getElementById('adminAuthor');
const adminImage = document.getElementById('adminImage');

function populateAuthorSelect() {
    if (!adminAuthorSel) return;
    adminAuthorSel.innerHTML = AUTHORS
        .map(a => `<option value="${a}">${a}</option>`)
        .join('');
}

function openAdmin() {
    if (!adminBackdrop) return;
    populateLabelSelect();
    populateAuthorSelect();
    populateProfileForm();
    populatePhotoLabelPicker();
    resetAdminForm();
    resetPhotoForm();
    resetEducationForm();
    resetExperienceForm();
    populateSkillsForm();
    renderAdminList();
    renderAdminPhotoList();
    renderAdminEducationList();
    renderAdminExperienceList();
    adminBackdrop.hidden = false;
    document.body.style.overflow = 'hidden';

    const banner = document.getElementById('adminMigrationBanner');
    if (banner) banner.style.display = window.__legacyMigration ? 'block' : 'none';
}
function closeAdmin() {
    if (!adminBackdrop) return;
    adminBackdrop.hidden = true;
    document.body.style.overflow = '';
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
    adminFormTitle.textContent = 'Add New Post';
    adminDate.value = new Date().toISOString().slice(0, 10);
}
function persistPosts() {
    saveContent();
}
function refreshMainViews() {
    renderLabelChips();
    renderPosts();
    if (typeof currentViewDate !== 'undefined') renderCalendar(currentViewDate);
}
function renderAdminList() {
    if (!adminListEl) return;
    if (thoughtsPosts.length === 0) {
        adminListEl.innerHTML = '<p class="admin-empty">No posts yet. Add one above.</p>';
        return;
    }
    const sorted = thoughtsPosts
        .map((p, i) => ({ p, i }))
        .sort((a, b) => b.p.date.localeCompare(a.p.date));
    adminListEl.innerHTML = sorted.map(({ p, i }) => `
        <div class="admin-item">
            <div class="admin-item-info">
                <strong>${p.title}</strong>
                <span>${p.date} · ${formatLabelName(p.label)}${p.author ? ` · ${p.author}` : ''}</span>
            </div>
            <div class="admin-item-actions">
                <button data-action="edit" data-index="${i}" type="button">Edit</button>
                <button data-action="delete" data-index="${i}" type="button">Delete</button>
            </div>
        </div>
    `).join('');
}

/* --- Wire settings button --- */
const isAdmin = new URLSearchParams(location.search).get('admin') === '1';
if (isAdmin) {
    document.getElementById('thoughtBtn')?.addEventListener('click', openAdmin);
} else {
    document.getElementById('thoughtBtn')?.addEventListener('click', () => {
        alert('Thought of the Day — coming soon!');
    });
}
document.getElementById('adminCloseBtn')?.addEventListener('click', closeAdmin);
adminBackdrop?.addEventListener('click', (e) => {
    if (e.target === adminBackdrop) closeAdmin();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && adminBackdrop && !adminBackdrop.hidden) closeAdmin();
});

/* --- Save (add or edit) --- */
adminForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const post = {
        date:    adminDate.value,
        title:   adminTitleIn.value.trim(),
        excerpt: adminExcerpt.value.trim(),
        label:   adminLabelSel.value,
        author: adminAuthorSel.value,
        image: adminImage.value.trim() || undefined
    };
    if (!post.date || !post.title || !post.excerpt) return;

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
});

/* --- Edit / Delete from list --- */
adminListEl?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const idx = parseInt(btn.dataset.index, 10);
    const post = thoughtsPosts[idx];
    if (!post) return;

    if (btn.dataset.action === 'edit') {
        adminEditIndex.value = idx;
        adminDate.value = post.date;
        adminTitleIn.value = post.title;
        adminExcerpt.value = post.excerpt;
        adminLabelSel.value = post.label;
        if (post.author && adminAuthorSel) adminAuthorSel.value = post.author;
        if (adminImage) adminImage.value = post.image || '';
        adminFormTitle.textContent = 'Edit Post';
        adminForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    setVal('profileName',     p.name);
    setVal('profilePronouns', p.pronouns);
    setVal('profileGreeting', p.greeting);
    setVal('profileTitle',    p.title);
    setVal('profileTagline',  p.tagline);
    setVal('profileBio',      p.bio);
    setVal('profileAbout',    p.about);
    setVal('profileLocation', p.location);
    setVal('profileEmail',    p.email);
    setVal('profileLinkedin', p.linkedin);

    const a0 = (p.actions && p.actions[0]) || {};
    const a1 = (p.actions && p.actions[1]) || {};
    setVal('profileAction1Label', a0.label);
    setVal('profileAction1Href',  a0.href);
    const a1Style = document.getElementById('profileAction1Style');
    if (a1Style) a1Style.value = a0.style || 'primary';

    setVal('profileAction2Label', a1.label);
    setVal('profileAction2Href',  a1.href);
    const a2Style = document.getElementById('profileAction2Style');
    if (a2Style) a2Style.value = a1.style || 'secondary';
}

/* --- Profile form: save --- */
function saveProfileForm() {
    const g = (id) => (document.getElementById(id)?.value || '').trim();

    contentData.profile.name     = g('profileName');
    contentData.profile.pronouns = g('profilePronouns');
    contentData.profile.greeting = g('profileGreeting');
    contentData.profile.title    = g('profileTitle');
    contentData.profile.tagline  = g('profileTagline');
    contentData.profile.bio      = g('profileBio');
    contentData.profile.about    = g('profileAbout');
    contentData.profile.location = g('profileLocation');
    contentData.profile.email    = g('profileEmail');
    contentData.profile.linkedin = g('profileLinkedin');

    const newActions = [];
    const l1 = g('profileAction1Label'), h1 = g('profileAction1Href');
    if (l1 && h1) {
        newActions.push({
            label: l1,
            href:  h1,
            style: document.getElementById('profileAction1Style')?.value || 'primary'
        });
    }
    const l2 = g('profileAction2Label'), h2 = g('profileAction2Href');
    if (l2 && h2) {
        newActions.push({
            label: l2,
            href:  h2,
            style: document.getElementById('profileAction2Style')?.value || 'secondary'
        });
    }
    contentData.profile.actions = newActions;

    saveContent();
    updateHeaderName();
    if (document.getElementById('heroText')) renderHero();
    playSound('success');
}

/* --- Profile form: submit handler --- */
document.getElementById('profileForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    saveProfileForm();
});

/* --- Export --- */
document.getElementById('adminExportBtn')?.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(contentData, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = 'content.json';
    a.click();
    URL.revokeObjectURL(url);
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
                        throw new Error(`Post #${i + 1} missing required fields.`);
                    }
                });
                applyContent({ posts: parsed });
                saveContent();
                alert(`Imported ${parsed.length} post(s) (legacy format — consider exporting as content.json).`);
            } else if (parsed && typeof parsed === 'object') {
                // New: full content bundle
                applyContent(parsed);
                saveContent();
                const postCount = Array.isArray(parsed.posts) ? parsed.posts.length : 0;
                const eduCount  = Array.isArray(parsed.education) ? parsed.education.length : 0;
                alert(`Imported content bundle: ${postCount} post(s), ${eduCount} education entr${eduCount === 1 ? 'y' : 'ies'}.`);
            } else {
                throw new Error('File must contain a content object or a posts array.');
            }

            refreshMainViews();
            renderAdminList();
            resetAdminForm();
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
    refreshMainViews();
    renderAdminList();
    resetAdminForm();
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
    applySettings(); // Sync UI with current state
    settingsBackdrop.hidden = false;
    // Slight delay to trigger CSS transition
    setTimeout(() => settingsBackdrop.classList.add('is-open'), 10);
    document.body.style.overflow = 'hidden';
}

function closeSettings() {
    if (!settingsBackdrop) return;
    settingsBackdrop.classList.remove('is-open');
    setTimeout(() => {
        settingsBackdrop.hidden = true;
        document.body.style.overflow = '';
    }, 300); // Wait for animation
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
    if (!confirm('Are you sure? This will wipe your drafts, photo, and preferences. This cannot be undone.')) return;
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

    // Count posts per label
    const counts = {};
    thoughtsPosts.forEach(p => {
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
        const color = getLabel(key).color;
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
    const targetKey = `${post.date}|${post.title}`;
    const cards = document.querySelectorAll('.post-card');
    for (const card of cards) {
        if (card.dataset.postKey === targetKey) {
            card.classList.add('is-expanded');
            document.body.classList.add('post-focused');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
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
        if (flickerText) flickerText.textContent = chosenPost.title;
        playSound('success');
        setTimeout(() => {
            overlay.hidden = true;
            diceAnimating = false;
            openPostByReference(chosenPost);
        }, 200);
        return;
    }

    // Normal path: flicker titles + roll sounds
    if (flickerText) flickerText.textContent = chosenPost.title;

    const flickerInterval = flickerText ? setInterval(() => {
        const rand = thoughtsPosts[Math.floor(Math.random() * thoughtsPosts.length)];
        flickerText.textContent = rand.title;
    }, 90) : null;

    const rollInterval = setInterval(() => {
        playSound('roll');
    }, 70);

    // Lock in at 800ms
    setTimeout(() => {
        if (flickerInterval) clearInterval(flickerInterval);
        clearInterval(rollInterval);
        if (flickerText) flickerText.textContent = chosenPost.title;
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
    if (document.getElementById('postList')) {
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
    const target = tab.dataset.tab;

    document.querySelectorAll('.admin-tab').forEach(t => {
        t.classList.toggle('is-active', t.dataset.tab === target);
    });
    document.querySelectorAll('.admin-tab-panel').forEach(p => {
        const panelName = 'adminPanel' + target.charAt(0).toUpperCase() + target.slice(1);
        p.classList.toggle('is-active', p.id === panelName);
    });
});

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
    photoLabelPicker.innerHTML = Object.keys(postLabels).map(k => `
        <button class="post-filter-chip" data-label="${k}" style="--chip-color: ${getLabel(k).color};" type="button">
            <span>${formatLabelName(k)}</span>
        </button>
    `).join('');
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
    photoFormTitle.textContent = 'Add New Photo';
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
                    <strong>${memoShort}</strong>
                    <span>${p.date} · ${labelsText}</span>
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
        body.innerHTML = '<p class="photos-empty">No photos yet. Add them in the admin panel.</p>';
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
            `<span class="photos-label-dot" style="background:${getLabel(l).color}" title="${formatLabelName(l)}"></span>`
        ).join('');
        return `
            <div class="photos-stack-card" data-position="${position}">
                <div class="photos-stack-image">
                    ${photo.image ? `<img src="${photo.image}" alt="">` : '<div class="photos-stack-placeholder">No image</div>'}
                </div>
                <div class="photos-stack-memo">${photo.memo || ''}</div>
                <div class="photos-stack-meta">
                    <span class="photos-stack-date">${formatPostDate(photo.date)}</span>
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
    educationFormTitle.textContent = 'Add New Education Entry';
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
                <strong>${p.institution}</strong>
                <span>${p.degree} · ${p.years}</span>
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
        educationFormTitle.textContent = 'Edit Education Entry';
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

    if (contentData.education.length === 0) {
        timeline.innerHTML = '<p class="education-empty">No education entries yet.</p>';
        return;
    }

    const sorted = [...contentData.education].sort((a, b) => (b.sortYear || 0) - (a.sortYear || 0));

    timeline.innerHTML = sorted.map(entry => {
        const highlightsHtml = (entry.highlights && entry.highlights.length)
            ? `<div class="education-highlights">${entry.highlights.map(h =>
                `<span class="education-chip">${h}</span>`
              ).join('')}</div>`
            : '';

        return `
            <article class="education-card">
                <div class="education-card-icon">🎓</div>
                <div class="education-card-body">
                    <h3 class="education-institution">${entry.institution}</h3>
                    <h4 class="education-degree">${entry.degree}</h4>
                    <div class="education-meta">
                        <span class="education-years">${entry.years}</span>
                        ${entry.location ? `<span class="education-loc-sep">·</span><span class="education-location">${entry.location}</span>` : ''}
                    </div>
                    ${entry.description ? `<p class="education-description">${entry.description}</p>` : ''}
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
    experienceFormTitle.textContent = 'Add New Experience Entry';
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
                <strong>${p.position}</strong>
                <span>${p.organization} · ${p.years}</span>
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
        experienceFormTitle.textContent = 'Edit Experience Entry';
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

    if (!contentData.experience || contentData.experience.length === 0) {
        timeline.innerHTML = '<p class="experience-empty">No experience entries yet.</p>';
        return;
    }

    const sorted = [...contentData.experience].sort((a, b) => (b.sortYear || 0) - (a.sortYear || 0));

    timeline.innerHTML = sorted.map(entry => {
        const highlightsHtml = (entry.highlights && entry.highlights.length)
            ? `<div class="experience-highlights">${entry.highlights.map(h =>
                `<span class="experience-chip">${h}</span>`
              ).join('')}</div>`
            : '';

        const docsHtml = (entry.documents && entry.documents.length)
            ? `
                <div class="experience-docs">
                    <div class="experience-docs-label">📎 Attached Documents</div>
                    <div class="experience-docs-list">
                        ${entry.documents.map(d => `
                            <a class="experience-doc-link" href="${d.path}" target="_blank" rel="noopener">
                                <span class="experience-doc-icon">${getDocIcon(d.path)}</span>
                                <span>${d.title}</span>
                            </a>
                        `).join('')}
                    </div>
                </div>
              `
            : '';

        return `
            <article class="experience-card">
                <div class="experience-card-icon">💼</div>
                <div class="experience-card-body">
                    <h3 class="experience-position">${entry.position}</h3>
                    <h4 class="experience-organization">${entry.organization}</h4>
                    <div class="experience-meta">
                        <span class="experience-years">${entry.years}</span>
                        ${entry.location ? `<span class="experience-loc-sep">·</span><span class="experience-location">${entry.location}</span>` : ''}
                    </div>
                    ${entry.description ? `<p class="experience-description">${entry.description}</p>` : ''}
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
    const nameEl    = document.getElementById('profileName');
    const greetingEl = document.getElementById('profileGreeting');
    const titleEl   = document.getElementById('profileTitle');
    const taglineEl = document.getElementById('profileTagline');
    const metaEl    = document.getElementById('profileMeta');
    const bioEl     = document.getElementById('profileBio');
    const aboutEl   = document.getElementById('profileAbout');
    const actionsEl = document.getElementById('profileActions');

    if (!nameEl) return;

    const p = contentData.profile;

    if (greetingEl) {
        greetingEl.textContent = p.greeting || '';
        greetingEl.style.display = p.greeting ? '' : 'none';
    }

    nameEl.innerHTML = `${p.name || ''}${p.pronouns ? `<span class="profile-hero-pronouns">(${p.pronouns})</span>` : ''}`;

    if (titleEl) {
        titleEl.textContent = p.title || '';
        titleEl.style.display = p.title ? '' : 'none';
    }

    if (taglineEl) {
        taglineEl.textContent = p.tagline || '';
        taglineEl.style.display = p.tagline ? '' : 'none';
    }

    if (actionsEl) {
        if (p.actions && p.actions.length) {
            actionsEl.innerHTML = p.actions.map(a =>
                `<a href="${a.href}" class="btn btn-${a.style}">${a.label}</a>`
            ).join('');
            actionsEl.style.display = '';
        } else {
            actionsEl.innerHTML = '';
            actionsEl.style.display = 'none';
        }
    }

    if (metaEl) {
        const parts = [];
        if (p.location) parts.push(`<span class="profile-meta-item">📍 ${p.location}</span>`);
        if (p.email) parts.push(`<span class="profile-meta-item"><a href="mailto:${p.email}">✉️ ${p.email}</a></span>`);
        if (p.linkedin) {
            const url = p.linkedin.startsWith('http') ? p.linkedin : `https://${p.linkedin}`;
            parts.push(`<span class="profile-meta-item"><a href="${url}" target="_blank" rel="noopener">🔗 LinkedIn</a></span>`);
        }
        if (parts.length) {
            metaEl.innerHTML = parts.join('<span class="meta-sep">·</span>');
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
            // Split by blank lines into paragraphs
            const paragraphs = p.about.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
            aboutEl.innerHTML = paragraphs.map(par => `<p>${par}</p>`).join('');
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
    playSound('success');
});

function renderSkillsPage() {
    const skillsCard  = document.getElementById('skillsCard');
    const hobbiesCard = document.getElementById('hobbiesCard');
    if (!skillsCard && !hobbiesCard) return;

    if (skillsCard) {
        const skills = (contentData.skills || []).slice().sort((a, b) => a.localeCompare(b));
        if (skills.length) {
            skillsCard.innerHTML = `
                <h2 class="skills-card-title">Skills</h2>
                <div class="skills-chips">
                    ${skills.map(s => `<span class="skills-chip">${s}</span>`).join('')}
                </div>
            `;
            skillsCard.style.display = '';
        } else {
            skillsCard.innerHTML = '';
            skillsCard.style.display = 'none';
        }
    }

    if (hobbiesCard) {
        const hobbies = (contentData.hobbies || []).slice().sort((a, b) => a.localeCompare(b));
        if (hobbies.length) {
            hobbiesCard.innerHTML = `
                <h2 class="skills-card-title">Hobbies</h2>
                <div class="skills-chips">
                    ${hobbies.map(h => `<span class="skills-chip">${h}</span>`).join('')}
                </div>
            `;
            hobbiesCard.style.display = '';
        } else {
            hobbiesCard.innerHTML = '';
            hobbiesCard.style.display = 'none';
        }
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

if (rollParam === '1') {
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