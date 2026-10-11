# GameForge Creator — Modern Starter

This ZIP contains a modern, responsive **static front-end starter** for GameForge Creator.

## Files
- `index.html` — dashboard structure
- `styles.css` — responsive dark/purple design
- `app.js` — demo interactions and browser-local project list

## Important
This is a front-end starter, not a complete online game engine. Projects created here are stored only in the current browser. User accounts, real game generation/editing, cloud storage, and real payments are not connected.

## Update your existing GitHub repository from an Android phone
1. Download and extract this ZIP on your phone.
2. Open your existing repository on GitHub.
3. Use **Add file → Upload files**.
4. Upload `index.html`, `styles.css`, and `app.js` to the repository's **top/root level** (not inside an extra nested folder).
5. If GitHub asks whether to replace `index.html`, review the change and commit it. Keep existing backend/server files unless you know they are unused.
6. In Netlify, open your existing site's **Deploys** page and check that a new production deploy starts from the GitHub commit. If the site is manually deployed rather than connected to GitHub, a GitHub upload alone may not update Netlify; the site must be linked to the repository or deployed through its normal build flow.

## Netlify for this static starter
If this is deployed as a static site without a build step:
- Base directory: leave blank
- Build command: leave blank
- Publish directory: `.` (the repository root)

Do not apply these settings blindly if your repository uses a framework or server build. This starter uses plain HTML, CSS, and JavaScript and does not need `npm install`.
