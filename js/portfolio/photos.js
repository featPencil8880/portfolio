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
const photoAlt         = document.getElementById('photoAlt');
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
        alt:    photoAlt.value.trim(),
        image:  photoImage.value.trim(),
        labels: labels
    };
    if (!photo.date || !photo.image || !photo.alt) {
        alert('Date, image path, and alternative text are required.');
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
        photoAlt.value   = photo.alt || '';
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
        const altText = photo.alt || '';
        const photoKey = String(photo.image || '').replace(/^\/+/, '');
        const variants = window.PORTFOLIO_CONFIG?.photoVariants?.[photoKey];
        const imageHtml = photo.image
            ? `<picture>
                ${variants?.avif ? `<source type="image/avif" srcset="${escapeHtml(variants.avif)}" sizes="(max-width: 720px) 90vw, 560px">` : ''}
                ${variants?.webp ? `<source type="image/webp" srcset="${escapeHtml(variants.webp)}" sizes="(max-width: 720px) 90vw, 560px">` : ''}
                <img src="${escapeHtml(photo.image)}" alt="${escapeHtml(altText)}" loading="lazy" decoding="async">
            </picture>`
            : '<div class="photos-stack-placeholder">No image</div>';
        return `
            <div class="photos-stack-card" data-position="${position}">
                <div class="photos-stack-image">
                    ${imageHtml}
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

