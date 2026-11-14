# Portfolio

A personal portfolio built with vanilla HTML, CSS, and JavaScript. Features a journal system with calendar filtering, a photo gallery, resume pages, and small psychology-inspired games.

## Table of Contents

- [Running Locally](#running-locally)
- [Admin Access](#admin-access)
- [Editing Content](#editing-content)
- [Publishing Changes](#publishing-changes)
- [Adding Photos](#adding-photos)
- [Adding Documents](#adding-documents)
- [Adding Labels](#adding-labels)
- [File Structure](#file-structure)
- [Known Quirks](#known-quirks)
- [Deployment](#deployment)

---

## Running Locally

The site uses `fetch()` to load `content.json`, which browsers block on `file://` URLs. You **must** run it through a local server, not by double-clicking `index.html`.

### With VS Code (recommended)

1. Install the **Live Server** extension
2. Right-click `index.html` → **Open with Live Server**
3. Your browser opens to something like `http://127.0.0.1:5500/index.html`

### With Python (if you have Python installed)

```bash
cd path/to/project
python -m http.server 8000
