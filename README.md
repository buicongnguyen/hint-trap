# Hint Trap

Hint Trap is a static browser puzzle game inspired by tricky Braindom-style clue logic. It runs with plain `index.html`, `styles.css`, `levels.js`, and `script.js`, so it can be hosted on GitHub Pages without a build step.

## Play Locally

Open the game directly:

```powershell
Start-Process .\index.html
```

Or serve it locally, which is closer to how GitHub Pages works:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy To GitHub Pages

Recommended setup for this project:

1. Push these files to a GitHub repository.
2. On GitHub, open the repository settings.
3. Go to `Pages`.
4. Under `Build and deployment`, choose `Deploy from a branch`.
5. Select your default branch, usually `main`, and the `/ (root)` folder.
6. Save.

GitHub Pages supports publishing from a branch root, and this project keeps `index.html` at the root for that reason. The included `.nojekyll` file tells GitHub Pages to serve the static files directly instead of trying to process the project as a Jekyll site.

Official references:

- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/about-github-pages-and-jekyll

## Mobile Target

The game is designed to run on mobile browsers:

- The viewport uses `viewport-fit=cover` for modern phone screens.
- Controls have large tap targets.
- The board scales down on small screens while keeping percentage-based puzzle placement.
- Drag and hold interactions use pointer events, so they work with mouse, touch, and pen input.
- `site.webmanifest` and `favicon.svg` make the game friendlier when saved to a mobile home screen.

## Image Assets

Board items can now use project-local images through the optional `image` field in `levels.js`. The first starter pack lives in:

```text
assets/images/items/
```

The current renderer keeps text labels on every image-enabled item, so puzzles remain readable even if an image fails to load. Future generated PNG or WebP files can be added to the same folder and referenced from level data.

The first generated art pass is wired into Stage 1:

```text
assets/images/items/elephant-generated.png
assets/images/items/lion-generated.png
assets/images/items/mouse-generated.png
```

The original generated sheet is kept for reference in `assets/images/generated/hint-trap-animals-sheet.png`.

## Add More Levels

Add new stages in `levels.js`. The engine in `script.js` should only change when adding a brand-new mechanic. See `DESIGN.md` for the full level data contract.

Validate before publishing:

```powershell
node --check .\levels.js
node --check .\script.js
node -e "global.window=globalThis; require('./levels.js'); const s=global.HINT_TRAP_STAGES; const ids=new Set(s.map(x=>x.id)); console.log(s.length + ' levels, ' + ids.size + ' unique ids'); if (s.length !== ids.size) process.exit(1);"
```
