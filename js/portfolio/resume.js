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

