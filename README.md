# My Portfolio

A personal portfolio and interactive journal built with vanilla HTML, CSS, and JavaScript. 

## 🚀 How to Run Locally
This project uses `fetch()` to load posts, which means it **cannot** be opened by double-clicking `index.html`. You must use a local server.
1. Open the project in VS Code.
2. Install the **Live Server** extension.
3. Right-click `index.html` and select **"Open with Live Server"**.

## 🔐 Admin & Publishing Workflow
The site is public, but the admin panel is hidden behind a soft gate.

**To access the admin panel:**
- Add `?admin=1` to the end of your URL (e.g., `http://127.0.0.1:5500/index.html?admin=1`).
- Click the lightbulb icon in the widget panel.

**How to publish a new post:**
1. Open the admin panel and add/edit your posts.
2. Click **Export JSON**. This downloads a file named `posts.json`.
3. Move that `posts.json` into your project folder (overwrite the old one).
4. Commit and push to your live server (Netlify, GitHub Pages, etc.).
5. **Crucial Step:** In your admin panel, click **Reset to Defaults**. This wipes your local browser draft and forces your site to load the new published `posts.json`.

*Why Step 5?* Because drafts saved in your browser (`localStorage`) will always override the published `posts.json`. You must clear the draft to see your published changes.

## 🖼️ Adding Images to Posts
1. Resize your image to roughly 800px wide.
2. Save it in the `photos/posts/` folder. Name it clearly (e.g., `2024-11-20-child-psychology.jpg`).
3. In the Admin panel, paste the exact path into the **Image path** field: `photos/posts/2024-11-20-child-psychology.jpg`.

## 📂 File Structure
- `index.html` / `profile.html` / etc. — The pages.
- `style.css` — All styling, including the retro aesthetic and themes.
- `portfolio.js` — All logic (Admin panel, clock, calendar, sounds, settings).
- `posts.json` — The published data for your journal posts.
- `photos/posts/` — Where post images live.

## ⚠️ Known Quirks
- **Local Drafts:** Editing a post in admin saves it to *your* browser only. Visitors will not see it until you export, replace `posts.json`, and push.
- **Viewer Preview:** If you want to see exactly what a visitor sees (without your local drafts), append `?viewer=1` to the URL.
- **Clear Local Data:** If the site gets stuck in a weird state, go to Settings (gear icon) and click "Clear Local Data".