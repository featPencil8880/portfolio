// chrome.js — shared site shell (header, rail, desk widget, footer, overlays)
// Loaded before portfolio.js. Injects one canonical copy of the chrome into
// lightweight page skeletons so the markup never drifts between pages.

(function () {
  'use strict';

  /* ---------------------------------------------------------
     ICONS
     --------------------------------------------------------- */
  const svg = (paths, extra = '') =>
    `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" ${extra}>${paths}</svg>`;

  const ICON = {
    menu: svg('<path d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z"/>'),
    eye: svg('<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>'),
    gear: svg('<path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7.03 7.03 0 0 0-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84a.48.48 0 0 0-.48.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 0 0-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z"/>'),
    dice: svg('<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7.5 18c-.83 0-1.5-.67-1.5-1.5S6.67 15 7.5 15s1.5.67 1.5 1.5S8.33 18 7.5 18zm0-9C6.67 9 6 8.33 6 7.5S6.67 6 7.5 6 9 6.67 9 7.5 8.33 9 7.5 9zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm0-9c-.83 0-1.5-.67-1.5-1.5S15.67 6 16.5 6s1.5.67 1.5 1.5S17.33 9 16.5 9z"/>'),
    camera: svg('<path d="M9 3 7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-3.17L15 3H9zm3 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/>'),
    bulb: svg('<path d="M10.59 21.41Q10 20.83 10 20h4q0 .82-.59 1.41T12 22t-1.41-.59ZM8 19v-2h8v2H8Zm.25-3q-1.72-1.03-2.74-2.75Q4.5 11.52 4.5 9.5q0-3.13 2.19-5.31T12 2t5.31 2.19T19.5 9.5q0 2.02-1.01 3.75T15.75 16h-7.5Z"/>'),
    clock: svg('<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>'),
    close: svg('<path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.7 2.88 18.3 9.17 12 2.88 5.71 4.3 4.29l6.29 6.3 6.3-6.3z"/>'),
  };

  /* ---------------------------------------------------------
     NAVIGATION DATA — single source of truth
     --------------------------------------------------------- */
  const NAV = [
    { id: 'home',       label: 'Home',       href: 'index.html',      icon: 'home',       num: '00' },
    { id: 'profile',    label: 'Profile',    href: 'profile.html',    icon: 'profile',    num: '01' },
    { id: 'education',  label: 'Education',  href: 'education.html',  icon: 'brain',      num: '02' },
    { id: 'experience', label: 'Experience', href: 'experience.html', icon: 'experience', num: '03' },
    { id: 'skills',     label: 'Skills',     href: 'skills.html',     icon: 'handyman',   num: '04' },
    { id: 'survey',     label: 'Survey',     href: 'survey.html',     icon: 'survey',     num: '05' },
    { id: 'games',      label: 'Games',      href: 'games.html',      icon: 'chess',      num: '06' },
  ];

  const HEADER = `
  <div class="header-inner">
    <button class="icon-btn nav-toggle" id="navBtn" type="button" aria-label="Menu" aria-expanded="false" aria-controls="menuList">${ICON.menu}</button>
    <a class="wordmark" href="index.html" aria-label="Home">
      <span class="wordmark__stamp" data-monogram aria-hidden="true">I</span>
      <span class="wordmark__text">
        <span class="wordmark__name" data-profile-name>IAN</span>
        <span class="wordmark__role" data-profile-role>Psychology graduate &amp; educator</span>
      </span>
    </a>
    <div class="header-actions">
      <a class="header-link" href="survey.html">Leave a note <span aria-hidden="true">→</span></a>
      <button class="icon-btn" id="canvasBtn" type="button" aria-pressed="false" aria-label="Focus mode" title="Focus mode — hide the furniture">${ICON.eye}</button>
      <button class="icon-btn" id="settingsBtn" type="button" aria-label="Settings" title="Reading preferences">${ICON.gear}</button>
    </div>
  </div>`;

  const RAIL = `
  <nav class="rail-nav" id="menuList" aria-label="Sections">
    ${NAV.map(item => `
      <a class="left-panel-btn rail-link" id="${item.id}Btn" href="${item.href}" data-nav="${item.id}">
        <span class="nav-icon rail-icon rail-icon--${item.icon}" aria-hidden="true"></span>
        <span class="nav-text"><span class="nav-num">${item.num}</span>${item.label}</span>
      </a>`).join('')}
  </nav>
  <div class="rail-foot">
    <a class="rail-link rail-mail" href="mailto:" data-contact-email aria-label="Email">
      <span class="nav-icon rail-icon rail-icon--mail" aria-hidden="true"></span>
      <span class="nav-text">Email</span>
    </a>
  </div>`;

  const WIDGET = `
  <aside class="widget-panel" aria-label="Desk">
    <div class="widget-head">
      <p class="widget-eyebrow">On the desk</p>
      <div class="widget-actions">
        <button class="icon-btn icon-btn--sm" id="diceBtn" type="button" aria-label="Surprise me" title="Open a random note">${ICON.dice}</button>
        <button class="icon-btn icon-btn--sm" id="photosBtn" type="button" aria-label="Photo gallery" title="Photo gallery">${ICON.camera}</button>
        <button class="icon-btn icon-btn--sm" id="clockToggleBtn" type="button" aria-label="Toggle clock style" title="Toggle clock style">
          <svg id="digitalIcon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.63 13.9h.6V10.1H6.8L5.68 10.9 6 11.38l.63-.45v2.97Zm1.43.03h2.5V13.35H8.9v-.05l.97-1q.3-.3.45-.6t.15-.6q0-.5-.34-.8T9.28 10q-.45 0-.78.23-.32.22-.45.63l.53.24q.1-.25.27-.38.18-.12.43-.12.28 0 .44.14.16.14.16.39 0 .3-.42.77l-1.4 1.45v.57Zm3.85-.15q.13-.13.13-.32t-.13-.33-.32-.13-.33.13-.13.32.13.32.33.13.32-.13Zm0-2.02q.13-.13.13-.33 0-.2-.13-.32t-.32-.13-.33.13-.13.32q0 .2.13.33t.33.13.32-.13ZM13.88 14q.58 0 .93-.33t.35-.82q0-.35-.17-.59T14.5 11.9v-.02q.25-.13.39-.34t.14-.49q0-.42-.35-.74t-.85-.31q-.43 0-.74.21-.31.21-.46.59l.55.22q.1-.22.26-.34t.39-.11q.28 0 .42.14t.15.34q0 .25-.19.41-.19.16-.46.16h-.3v.52h.32q.35 0 .54.14.19.14.19.41 0 .27-.2.46t-.47.19q-.28 0-.44-.15t-.27-.48l-.57.23q.15.47.5.74t.87.27ZM17 14q.55 0 .94-.38t.39-.93q0-.5-.32-.86-.32-.36-.82-.36-.05 0-.4.1l-.03-.03.88-1.2-.51-.34-.97 1.4q-.3.43-.4.7t-.1.53q0 .57.39.97T17 14Zm-.54-.79q-.21-.21-.21-.51t.21-.51.51-.21.51.21.21.51-.21.51q-.21.21-.51.21t-.51-.21ZM12 22q-2.07 0-3.9-.79-1.82-.79-3.17-2.14Q3.58 17.73 2.79 15.9T2 12q0-2.08.79-3.9.79-1.83 2.14-3.17Q6.28 3.57 8.1 2.79 9.93 2 12 2t3.9.79 3.17 2.14q1.35 1.34 2.14 3.17Q22 9.92 22 12t-.79 3.9-2.14 3.17q-1.35 1.35-3.17 2.14T12 22Zm0-10Zm0 8q3.33 0 5.66-2.34T20 12q0-3.33-2.34-5.66T12 4 6.34 6.34 4 12t2.34 5.66T12 20Z"/></svg>
          <svg id="analogIcon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="display:none"><path d="M11 6V4h2v2h-2Zm7 7v-2h2v2h-2Zm-7 7v-2h2v2h-2Zm-7-7v-2h2v2H4Zm8 9q-2.07 0-3.9-.79-1.82-.79-3.17-2.14Q3.58 17.73 2.79 15.9T2 12q0-2.08.79-3.9.79-1.83 2.14-3.17Q6.28 3.57 8.1 2.79 9.93 2 12 2t3.9.79 3.17 2.14q1.35 1.34 2.14 3.17Q22 9.92 22 12t-.79 3.9-2.14 3.17q-1.35 1.35-3.17 2.14T12 22Zm0-2q3.35 0 5.68-2.32T20 12q0-3.35-2.32-5.68T12 4 6.33 6.32 4 12t2.33 5.68T12 20Zm2.55-3.45L11 13V8h2v4.17l2.95 2.95-1.4 1.43Z"/></svg>
        </button>
        <button class="icon-btn icon-btn--sm" id="thoughtBtn" type="button" aria-label="Manage posts" title="Manage posts">${ICON.bulb}</button>
      </div>
    </div>

    <div class="widget-clock">
      <div id="digitalClock" class="clock-digital">00:00:00</div>
      <div id="analogClock" class="clock-analog" style="display:none" aria-hidden="true">
        <div class="clock-center"></div>
        <div class="hand hour-hand" id="hourHand"></div>
        <div class="hand min-hand" id="minHand"></div>
        <div class="hand sec-hand" id="secHand"></div>
      </div>
      <p class="clock-note">Winnipeg, MB</p>
    </div>

    <div class="widget-calendar">
      <div class="calendar-header">
        <div class="calendar-nav">
          <button class="calendar-btn" id="prevYear" type="button" aria-label="Previous year">&laquo;</button>
          <button class="calendar-btn" id="prevMonth" type="button" aria-label="Previous month">&lsaquo;</button>
        </div>
        <span id="calendarMonthYear" class="calendar-title">Loading…</span>
        <div class="calendar-nav">
          <button class="calendar-btn" id="nextMonth" type="button" aria-label="Next month">&rsaquo;</button>
          <button class="calendar-btn" id="nextYear" type="button" aria-label="Next year">&raquo;</button>
        </div>
      </div>
      <div class="calendar-grid" id="calendarGrid"></div>
      <div class="calendar-worded-date" id="wordedDate"></div>
      <button class="calendar-today-btn" id="calendarTodayBtn" type="button" style="display:none">Back to today</button>
    </div>
  </aside>`;

  const FOOTER = `
  <div class="footer-inner">
    <div class="footer-brand">
      <span class="wordmark__stamp footer-stamp" data-monogram aria-hidden="true">I</span>
      <p class="footer-note">
        Field notes &amp; portfolio of <span data-profile-name>IAN</span>.<br>
        <span class="footer-meta">Psychology · Winnipeg, MB</span>
      </p>
    </div>
    <nav class="footer-links" aria-label="Footer">
      <a href="mailto:" data-contact-email>Email</a>
      <a href="survey.html">Feedback</a>
      <a href="index.html?admin=1" class="admin-entry" data-admin-link>Admin</a>
      <a class="footer-mascot" href="games.html" aria-label="Games" title="Games"><span class="mascot" aria-hidden="true"></span></a>
    </nav>
  </div>
  <p class="footer-legal">© <span data-year>2026</span> · Paper, ink &amp; a little JavaScript.</p>`;

  /* ---------------------------------------------------------
     SETTINGS DRAWER — visitor preferences only
     --------------------------------------------------------- */
  const SETTINGS = `
  <div class="settings-backdrop" id="settingsBackdrop" hidden>
    <div class="settings-panel" role="dialog" aria-modal="true" aria-labelledby="settingsTitle" tabindex="-1">
      <div class="settings-header">
        <div>
          <p class="admin-eyebrow">Reading preferences</p>
          <h2 id="settingsTitle">Settings</h2>
        </div>
        <button class="admin-close" id="settingsCloseBtn" type="button" aria-label="Close settings">${ICON.close}</button>
      </div>

      <div class="settings-body">
        <div class="settings-row">
          <div class="settings-info">
            <label for="settingReduceMotion">Reduce motion</label>
            <small>Turn off fades, slides and the dice spin.</small>
          </div>
          <label class="retro-toggle">
            <input type="checkbox" id="settingReduceMotion">
            <span class="retro-slider"></span>
          </label>
        </div>

        <div class="settings-row">
          <div class="settings-info">
            <label for="settingSoundEffects">Sound effects</label>
            <small>Quiet chiptune blips on hover and click.</small>
          </div>
          <label class="retro-toggle">
            <input type="checkbox" id="settingSoundEffects">
            <span class="retro-slider"></span>
          </label>
        </div>

        <div class="settings-row" id="soundProfileRow" style="display:none">
          <div class="settings-info"><label for="settingSoundProfile">Sound profile</label></div>
          <select id="settingSoundProfile" class="settings-select">
            <option value="classic">Classic</option>
            <option value="soft">Soft</option>
            <option value="typewriter">Typewriter</option>
            <option value="chime">Chime</option>
          </select>
        </div>

        <div class="settings-row">
          <div class="settings-info"><label>Text size</label></div>
          <div class="settings-btn-group" id="fontSizeGroup">
            <button type="button" data-value="small" title="Small">A−</button>
            <button type="button" data-value="normal" class="is-active" title="Normal">A</button>
            <button type="button" data-value="large" title="Large">A+</button>
          </div>
        </div>

        <div class="settings-row">
          <div class="settings-info">
            <label for="settingClockMode">Clock</label>
            <small>Shown in the desk panel.</small>
          </div>
          <select id="settingClockMode" class="settings-select">
            <option value="digital">Digital (12h)</option>
            <option value="digital24">Digital (24h)</option>
            <option value="analog">Analog</option>
          </select>
        </div>

        <hr class="settings-divider">

        <button id="settingsClearDataBtn" class="settings-danger-btn" type="button">Clear local data</button>
        <small class="settings-hint">Removes the local draft and reading preferences from this browser. The published site is untouched.</small>
      </div>
    </div>
  </div>`;

  /* ---------------------------------------------------------
     ADMIN — editor's desk
     --------------------------------------------------------- */
  const HERO_TABS = ['home']; // hero notes are a home-page feature
  const ADMIN_TABS = [
    ['posts', 'Notes'], ['profile', 'Profile'], ['education', 'Education'],
    ['experience', 'Experience'], ['skills', 'Skills'], ['photos', 'Photos'],
    ['survey', 'Survey'], ['labels', 'Labels'], ['site', 'Site'], ['data', 'Data'],
  ];

  const ADMIN = `
  <div class="admin-backdrop" id="adminBackdrop" hidden>
    <div class="admin-panel" role="dialog" aria-modal="true" aria-labelledby="adminTitle" tabindex="-1">
      <header class="admin-header">
        <div class="admin-title-wrap">
          <p class="admin-eyebrow">Editor's desk</p>
          <h2 id="adminTitle">Manage content</h2>
          <p class="admin-status">Draft saved locally · <span id="adminSaveTime">not yet</span></p>
        </div>
        <div class="admin-actions">
          <a class="btn btn--ghost btn--sm" href="index.html" target="_blank" rel="noopener">Preview ↗</a>
          <button id="adminExportBtn" class="btn btn--sm" type="button">Export JSON</button>
          <button id="adminImportBtn" class="btn btn--sm" type="button">Import</button>
          <button id="adminResetBtn" class="btn btn--sm btn--danger" type="button">Reset</button>
          <input type="file" id="adminImportInput" accept="application/json,.json" hidden>
          <button class="admin-close" id="adminCloseBtn" type="button" aria-label="Close editor">${ICON.close}</button>
        </div>
      </header>

      <div class="admin-tabs" role="tablist" aria-label="Content sections">
        ${ADMIN_TABS.map(([id, label], i) => `<button class="admin-tab${i === 0 ? ' is-active' : ''}" data-tab="${id}" role="tab" type="button" aria-selected="${i === 0}">${label}</button>`).join('')}
      </div>

      <div class="admin-body">
        <!-- NOTES -->
        <section class="admin-tab-panel is-active" id="adminPanelPosts" role="tabpanel">
          <div class="admin-toolbar">
            <label class="admin-toolbar__field">Page
              <select id="adminPostTab">
                <option value="home">Home</option>
                <option value="profile">Profile</option>
                <option value="education">Education</option>
                <option value="experience">Experience</option>
                <option value="skills">Skills</option>
                <option value="survey">Survey</option>
              </select>
            </label>
            <label class="admin-toolbar__field admin-toolbar__search">Search
              <input id="adminPostSearch" type="search" placeholder="Title, label or date…" autocomplete="off">
            </label>
            <p class="admin-toolbar__hint">Notes appear as cards; the featured one becomes the hero.</p>
          </div>

          <form id="adminForm" class="admin-form">
            <h3 id="adminFormTitle">Add new Home note</h3>
            <input type="hidden" id="adminEditIndex" value="">
            <div class="admin-grid">
              <div class="admin-field">
                <label for="adminDate">Date</label>
                <div class="admin-date-row">
                  <input type="date" id="adminDate" required>
                  <button type="button" id="adminTodayBtn" class="btn btn--sm">Today</button>
                </div>
              </div>
              <div class="admin-field">
                <label for="adminLabel">Label</label>
                <select id="adminLabel"></select>
              </div>
              <div class="admin-field">
                <label for="adminAuthor">Author</label>
                <select id="adminAuthor"></select>
              </div>
            </div>

            <div class="admin-grid">
              <div class="admin-field">
                <label for="adminReplyTo">Continues from (optional)</label>
                <select id="adminReplyTo"><option value="">— Not a reply —</option></select>
              </div>
              <div class="admin-field">
                <label for="adminReplyComment">Continuation label</label>
                <input type="text" id="adminReplyComment" maxlength="60" placeholder="continued">
              </div>
            </div>

            <div class="admin-field">
              <label>Content fields</label>
              <div class="fields-editor" id="fieldsEditor"></div>
              <button type="button" class="btn btn--sm add-block-btn" id="addFieldBtn">+ Add field</button>
              <small class="admin-hint-inline">Each field is one page in the reader. Add title, subtitle, paragraph or action blocks inside.</small>
            </div>

            <div class="admin-form-actions">
              <button type="submit" class="btn admin-primary">Save note</button>
              <button type="button" id="adminCancelBtn" class="btn btn--ghost">Cancel edit</button>
            </div>
          </form>

          <div class="admin-list" id="adminList"></div>
        </section>

        <!-- PROFILE -->
        <section class="admin-tab-panel" id="adminPanelProfile" role="tabpanel">
          <form id="profileForm" class="admin-form">
            <h3>Profile &amp; hero</h3>
            <div class="admin-grid">
              <div class="admin-field"><label for="pfName">Name</label><input id="pfName" maxlength="40"></div>
              <div class="admin-field"><label for="pfPronouns">Pronouns</label><input id="pfPronouns" maxlength="24" placeholder="she/her"></div>
              <div class="admin-field"><label for="pfGreeting">Greeting</label><input id="pfGreeting" maxlength="60" placeholder="Hello, I'm"></div>
              <div class="admin-field"><label for="pfTitle">Role / title</label><input id="pfTitle" maxlength="80"></div>
            </div>
            <div class="admin-field"><label for="pfTagline">Tagline</label><input id="pfTagline" maxlength="120"></div>
            <div class="admin-field"><label for="pfBio">Short bio</label><textarea id="pfBio" rows="4" maxlength="600"></textarea></div>
            <div class="admin-field"><label for="pfAbout">About (blank line between paragraphs)</label><textarea id="pfAbout" rows="6" maxlength="2000"></textarea></div>
            <div class="admin-grid">
              <div class="admin-field"><label for="pfLocation">Location</label><input id="pfLocation" maxlength="60"></div>
              <div class="admin-field"><label for="pfEmail">Email</label><input id="pfEmail" type="email" maxlength="80"></div>
              <div class="admin-field"><label for="pfLinkedin">LinkedIn URL</label><input id="pfLinkedin" maxlength="120" placeholder="linkedin.com/in/…"></div>
            </div>
            <div class="admin-field">
              <label for="pfActions">Hero buttons (one per line: Label | href | primary/secondary)</label>
              <textarea id="pfActions" rows="3" placeholder="Explore my profile | profile.html | primary"></textarea>
            </div>
            <div class="admin-form-actions">
              <button type="submit" class="btn admin-primary">Save profile</button>
              <button type="button" id="profileCancelBtn" class="btn btn--ghost">Reset</button>
            </div>
          </form>
        </section>

        <!-- EDUCATION -->
        <section class="admin-tab-panel" id="adminPanelEducation" role="tabpanel">
          <form id="educationForm" class="admin-form">
            <h3 id="educationFormTitle">Add education entry</h3>
            <input type="hidden" id="educationEditIndex" value="">
            <div class="admin-grid">
              <div class="admin-field"><label for="eduInstitution">Institution</label><input id="eduInstitution" required></div>
              <div class="admin-field"><label for="eduDegree">Degree / program</label><input id="eduDegree" required></div>
              <div class="admin-field"><label for="eduYears">Years</label><input id="eduYears" placeholder="2020–2026" required></div>
              <div class="admin-field"><label for="eduLocation">Location</label><input id="eduLocation"></div>
            </div>
            <div class="admin-field"><label for="eduDescription">Description</label><textarea id="eduDescription" rows="3"></textarea></div>
            <div class="admin-field">
              <label for="eduHighlights">Highlights (one per line)</label>
              <textarea id="eduHighlights" rows="5"></textarea>
            </div>
            <div class="admin-form-actions">
              <button type="submit" class="btn admin-primary">Save education</button>
              <button type="button" id="educationCancelBtn" class="btn btn--ghost">Cancel edit</button>
            </div>
          </form>
          <div class="admin-list" id="adminEducationList"></div>
        </section>

        <!-- EXPERIENCE -->
        <section class="admin-tab-panel" id="adminPanelExperience" role="tabpanel">
          <form id="experienceForm" class="admin-form">
            <h3 id="experienceFormTitle">Add experience entry</h3>
            <input type="hidden" id="experienceEditIndex" value="">
            <div class="admin-grid">
              <div class="admin-field"><label for="expPosition">Position</label><input id="expPosition" required></div>
              <div class="admin-field"><label for="expOrganization">Organization</label><input id="expOrganization" required></div>
              <div class="admin-field"><label for="expYears">Years</label><input id="expYears" placeholder="2022–2024" required></div>
              <div class="admin-field"><label for="expLocation">Location</label><input id="expLocation"></div>
            </div>
            <div class="admin-field"><label for="expDescription">Description</label><textarea id="expDescription" rows="3"></textarea></div>
            <div class="admin-field"><label for="expHighlights">Highlights (one per line)</label><textarea id="expHighlights" rows="5"></textarea></div>
            <div class="admin-field">
              <label for="expDocuments">Documents (one per line: Title | path/to/file.pdf)</label>
              <textarea id="expDocuments" rows="3" placeholder="Transcript | documents/transcript.pdf"></textarea>
            </div>
            <div class="admin-form-actions">
              <button type="submit" class="btn admin-primary">Save experience</button>
              <button type="button" id="experienceCancelBtn" class="btn btn--ghost">Cancel edit</button>
            </div>
          </form>
          <div class="admin-list" id="adminExperienceList"></div>
        </section>

        <!-- SKILLS -->
        <section class="admin-tab-panel" id="adminPanelSkills" role="tabpanel">
          <form id="skillsForm" class="admin-form">
            <h3>Skills &amp; hobbies</h3>
            <div class="admin-grid">
              <div class="admin-field">
                <label for="skillsList">Skills (one per line)</label>
                <textarea id="skillsList" rows="10"></textarea>
              </div>
              <div class="admin-field">
                <label for="hobbiesList">Hobbies (one per line)</label>
                <textarea id="hobbiesList" rows="10"></textarea>
              </div>
            </div>
            <div class="admin-form-actions">
              <button type="submit" class="btn admin-primary">Save lists</button>
            </div>
          </form>
        </section>

        <!-- PHOTOS -->
        <section class="admin-tab-panel" id="adminPanelPhotos" role="tabpanel">
          <form id="photoForm" class="admin-form">
            <h3 id="photoFormTitle">Add photo</h3>
            <input type="hidden" id="photoEditIndex" value="">
            <div class="admin-grid">
              <div class="admin-field">
                <label for="photoDate">Date</label>
                <div class="admin-date-row">
                  <input type="date" id="photoDate" required>
                  <button type="button" id="photoTodayBtn" class="btn btn--sm">Today</button>
                </div>
              </div>
              <div class="admin-field"><label for="photoImage">Image path</label>
                <div class="photo-file-row">
                  <input type="text" id="photoImage" placeholder="photos/polaroid/2024-11-20-beach.jpg">
                  <button type="button" id="photoChooseFileBtn" class="btn btn--sm">Choose file</button>
                </div>
                <input type="file" id="photoFileInput" accept="image/*" hidden>
              </div>
            </div>
            <div class="admin-field"><label for="photoMemo">Handwritten caption</label><textarea id="photoMemo" rows="3" maxlength="200"></textarea></div>
            <div class="admin-field"><label>Labels</label><div class="photo-label-picker" id="photoLabelPicker"></div></div>
            <div class="admin-form-actions">
              <button type="submit" class="btn admin-primary">Save photo</button>
              <button type="button" id="photoCancelBtn" class="btn btn--ghost">Cancel edit</button>
            </div>
          </form>
          <div class="admin-list" id="adminPhotoList"></div>
        </section>

        <!-- SURVEY -->
        <section class="admin-tab-panel" id="adminPanelSurvey" role="tabpanel">
          <div class="admin-field">
            <label for="surveyContactEmail">Contact email for submissions</label>
            <input type="email" id="surveyContactEmail" maxlength="80" placeholder="you@example.com">
          </div>
          <form id="surveyForm" class="admin-form">
            <h3 id="surveyFormTitle">Add survey</h3>
            <input type="hidden" id="surveyEditId" value="">
            <div class="admin-grid">
              <div class="admin-field"><label for="surveyTitle">Title</label><input id="surveyTitle" maxlength="120" required></div>
              <div class="admin-field admin-field--check">
                <label class="block-required-toggle"><input type="checkbox" id="surveyActive"><span>Active — shown publicly</span></label>
              </div>
            </div>
            <div class="admin-grid">
              <div class="admin-field"><label for="surveyIntroTitle">Intro heading</label><input id="surveyIntroTitle" maxlength="120"></div>
              <div class="admin-field"><label for="surveyIntroText">Intro text</label><textarea id="surveyIntroText" rows="2" maxlength="800"></textarea></div>
            </div>
            <div class="admin-grid">
              <div class="admin-field"><label for="surveyThankYouTitle">Thank-you heading</label><input id="surveyThankYouTitle" maxlength="120"></div>
              <div class="admin-field"><label for="surveyThankYouMessage">Thank-you message</label><textarea id="surveyThankYouMessage" rows="3" maxlength="1000"></textarea></div>
            </div>
            <div class="admin-field">
              <label>Form fields</label>
              <div class="fields-editor" id="surveyFieldsEditor"></div>
              <button type="button" class="btn btn--sm add-block-btn" id="addSurveyFieldBtn">+ Add field</button>
              <small class="admin-hint-inline">Each field is one page. Inside, add headings, text, textareas, selects, radios or ratings.</small>
            </div>
            <div class="admin-form-actions">
              <button type="submit" class="btn admin-primary">Save survey</button>
              <button type="button" id="surveyCancelBtn" class="btn btn--ghost">Cancel edit</button>
            </div>
          </form>
          <div class="admin-list" id="adminSurveyList"></div>
        </section>

        <!-- LABELS -->
        <section class="admin-tab-panel" id="adminPanelLabels" role="tabpanel">
          <form id="labelsForm" class="admin-form">
            <h3>Labels</h3>
            <input type="hidden" id="labelEditKey" value="">
            <div class="admin-grid">
              <div class="admin-field"><label for="labelKeyInput">Label name</label><input id="labelKeyInput" maxlength="40" required placeholder="e.g. nostalgia"></div>
              <div class="admin-field">
                <label>Colour</label>
                <div class="label-color-row">
                  <input type="color" id="labelColor" value="#B5E8A0">
                  <span class="label-preview" id="labelPreview">Preview</span>
                </div>
              </div>
            </div>
            <div class="label-color-swatches">
              <button type="button" class="label-swatch" data-color="#FFB3C6" style="background:#FFB3C6" aria-label="Pink"></button>
              <button type="button" class="label-swatch" data-color="#FFCE80" style="background:#FFCE80" aria-label="Peach"></button>
              <button type="button" class="label-swatch" data-color="#FFE566" style="background:#FFE566" aria-label="Yellow"></button>
              <button type="button" class="label-swatch" data-color="#B5E8A0" style="background:#B5E8A0" aria-label="Green"></button>
              <button type="button" class="label-swatch" data-color="#80D9DE" style="background:#80D9DE" aria-label="Teal"></button>
              <button type="button" class="label-swatch" data-color="#9CC0FF" style="background:#9CC0FF" aria-label="Blue"></button>
              <button type="button" class="label-swatch" data-color="#C7A8FF" style="background:#C7A8FF" aria-label="Purple"></button>
              <button type="button" class="label-swatch" data-color="#FFA8E6" style="background:#FFA8E6" aria-label="Pink purple"></button>
            </div>
            <div class="admin-form-actions">
              <button type="submit" class="btn admin-primary">Save label</button>
              <button type="button" id="labelsCancelBtn" class="btn btn--ghost">Cancel edit</button>
            </div>
          </form>
          <div class="admin-list" id="adminLabelsList"></div>
        </section>

        <!-- SITE -->
        <section class="admin-tab-panel" id="adminPanelSite" role="tabpanel">
          <form id="siteForm" class="admin-form">
            <h3>Site &amp; appearance</h3>
            <div class="admin-grid">
              <div class="admin-field"><label for="siteProjectName">Site title</label><input id="siteProjectName" maxlength="40"></div>
              <div class="admin-field"><label for="siteTheme">Theme</label>
                <select id="siteTheme">
                  <option value="retro">Retro paper</option>
                  <option value="retro-bold">Retro bold</option>
                </select>
              </div>
            </div>
            <fieldset class="admin-fieldset">
              <legend>Featured note</legend>
              <p class="admin-hint-inline">Pick a note to promote into the Home hero. Leave empty to use the profile copy.</p>
              <div id="heroSelects" class="admin-grid"></div>
            </fieldset>
            <div class="admin-form-actions">
              <button type="submit" class="btn admin-primary">Save site settings</button>
            </div>
          </form>
        </section>

        <!-- DATA -->
        <section class="admin-tab-panel" id="adminPanelData" role="tabpanel">
          <div class="admin-form">
            <h3>Local draft</h3>
            <p class="admin-hint-inline">Edits live in this browser until you export <code>content.json</code> and commit it to the site.</p>
            <div class="storage-meter" role="img" aria-label="Local storage usage"><span id="storageBar"></span></div>
            <p class="admin-hint-inline" id="storageUsage">Measuring…</p>
            <div class="admin-actions">
              <button type="button" class="btn btn--sm" id="adminBackupBtn">Download backup</button>
              <button type="button" class="btn btn--sm" id="adminCopyBtn">Copy JSON</button>
              <button type="button" class="btn btn--sm" id="adminValidateBtn">Validate</button>
            </div>
            <div id="dataValidation" class="admin-validation" hidden></div>
            <details class="admin-details">
              <summary>Publish checklist</summary>
              <ol class="admin-checklist">
                <li>Export <strong>content.json</strong>.</li>
                <li>Replace the file in the project folder.</li>
                <li>Commit and push (or upload to your host).</li>
                <li>Reload the live site, then press <strong>Reset</strong> here to re-sync this browser.</li>
              </ol>
            </details>
          </div>
        </section>
      </div>
    </div>
  </div>`;

  /* ---------------------------------------------------------
     OVERLAYS — dice + photo gallery
     --------------------------------------------------------- */
  const MODALS = `
  <button class="reading-close" id="readingClose" type="button" aria-label="Close reading view">Close ✕</button>

  <div class="dice-overlay" id="diceOverlay" hidden>
    <div class="dice-overlay-backdrop"></div>
    <div class="dice-overlay-content" role="status" aria-live="polite">
      <div class="dice-display">${ICON.dice}</div>
      <div class="dice-flicker-text" id="diceFlickerText">Rolling…</div>
    </div>
  </div>

  <div class="photos-modal" id="photosModal" hidden>
    <div class="photos-modal-backdrop" id="photosModalBackdrop"></div>
    <div class="photos-modal-panel" role="dialog" aria-modal="true" aria-labelledby="photosTitle" tabindex="-1">
      <div class="photos-modal-header">
        <div>
          <p class="admin-eyebrow">Polaroids</p>
          <h2 id="photosTitle">Photo gallery</h2>
        </div>
        <button class="admin-close" id="photosModalClose" type="button" aria-label="Close gallery">${ICON.close}</button>
      </div>
      <div class="photos-modal-layout">
        <aside class="photos-sidebar" id="photosSidebar"></aside>
        <div class="photos-modal-body" id="photosModalBody">
          <p class="photos-empty">No photos yet. Add them in the editor.</p>        </div>
      </div>
    </div>
  </div>`;

  /* ---------------------------------------------------------
     MOUNT
     --------------------------------------------------------- */
  const setHTML = (selector, html) => {
    const el = document.querySelector(selector);
    if (el) el.innerHTML = html;
    return el;
  };

  setHTML('#site-header', HEADER);
  setHTML('#site-rail', RAIL);
  setHTML('#site-footer', FOOTER);
  setHTML('#site-overlays', SETTINGS + ADMIN + MODALS);

  const widgetHost = document.getElementById('site-widget');
  if (widgetHost) widgetHost.outerHTML = WIDGET;

  // First paint helpers
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  const pageId = document.body.dataset.page || 'home';
  document.querySelectorAll('.rail-link[data-nav]').forEach(link => {
    link.classList.toggle('is-active', link.dataset.nav === pageId);
    if (link.dataset.nav === pageId) link.setAttribute('aria-current', 'page');
  });

  // Expose nav metadata so portfolio.js can title pages without duplicating it
  window.SITE_NAV = NAV;
})();
