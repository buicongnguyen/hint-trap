# Hint Trap

## Status

Hint Trap is implemented as an original browser puzzle game inspired by Braindom-style misdirection. The playable build currently has 26 stages, a reusable engine, local progress saving, and level data separated from runtime code.

The key implementation decision is that normal expansion happens in `levels.js`, not `script.js`. New puzzles should be authored as data unless they need a completely new interaction mechanic.

## Reference Research

This rebuild was guided by web research into Braindom's published store descriptions and walkthrough patterns.

What the research contributed:

- The App Store description emphasizes tricky mind puzzles, real-life logic, and focusing on details. Source: https://apps.apple.com/us/app/braindom-brain-games-test-out/id1513009813
- The Google Play listing frames the genre around tricky puzzles, mystery solving, and varied brain tests. Source: https://play.google.com/store/apps/details/?id=com.braindom
- Word Cheats shows a common trick pattern: the correct answer may be an object on the screen or a literal word in the clue. Source: https://www.wordcheats.com/braindom-answers
- Pocket Tactics summarizes the tone well: simple-looking questions often punish first assumptions. Source: https://www.pockettactics.com/braindom/guide
- Pro Game Guides examples informed reusable puzzle structures such as top-most object, prompt-word dragging, hidden-object reveals, and touch gestures. Source: https://progameguides.com/braindom/braindom-answers-guide/

## Game Design

The game asks the player to read a clue, notice the misleading assumption, and interact with the page literally. A prompt like "find the biggest animal" can mean the biggest animal drawn on the screen, not the biggest animal in real life.

Core design goals:

1. Keep every stage on one screen.
2. Make the clue itself the main source of misdirection.
3. Mix taps, drags, reveals, counting, ordering, and holding.
4. Support desktop and mobile browsers with plain HTML, CSS, and JavaScript.
5. Make level expansion data-first so the stage count can grow quickly.

## Core Loop

Every stage follows the same loop:

1. Read the clue.
2. Guess the obvious answer.
3. Re-read the exact wording.
4. Interact with the clue, HUD, or board object.
5. Get immediate right or wrong feedback.
6. Unlock the next stage after solving.

The player can use a hint once per stage. Attempts and hints are shown in the HUD, while solved stage ids and the highest unlocked stage are persisted in local storage.

## Architecture

The project is intentionally small and static:

- `index.html` owns the document shell, HUD, modal surfaces, board container, and script loading order.
- `styles.css` owns visual direction, responsive layout, board item shapes, feedback states, drag affordances, and mobile behavior.
- `levels.js` owns level helper functions and the `window.HINT_TRAP_STAGES` array.
- `script.js` owns rendering, input handling, solution checking, progress persistence, drag logic, hold logic, and stage navigation.

`levels.js` must load before `script.js`:

```html
<script src="levels.js"></script>
<script src="script.js"></script>
```

`script.js` reads `globalThis.HINT_TRAP_STAGES`. If that array is missing or empty, the engine throws a clear load-order error.

## GitHub Pages Target

The game is designed to publish from the repository root on GitHub Pages with no build step. Keep `index.html`, `styles.css`, `levels.js`, and `script.js` at the root unless the deployment strategy changes.

Deployment support files:

- `README.md`: local run commands, GitHub Pages setup, mobile notes, and validation commands.
- `.nojekyll`: tells GitHub Pages to serve the static files directly instead of processing them as a Jekyll project.
- `favicon.svg`: browser tab and home-screen icon source.
- `site.webmanifest`: mobile install metadata using relative paths so project-page URLs work.
- `assets/images/items/`: project-local board-item art used by image-enabled levels.

The recommended GitHub Pages setup is `Deploy from a branch`, default branch, `/ (root)` folder. GitHub's current docs say branch publishing can use the root folder and will publish changes pushed to that source. Source: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

GitHub's Jekyll docs also note that `.nojekyll` can bypass Jekyll processing for direct static serving. Source: https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/about-github-pages-and-jekyll

## Mobile Target

Mobile browser support is a first-class target:

- `index.html` uses `viewport-fit=cover`, mobile web app metadata, a theme color, and a manifest link.
- `styles.css` uses safe-area padding so iPhone-style notches and gesture bars do not crowd the UI.
- The board uses responsive viewport height instead of a desktop-only fixed height.
- Small screens get reduced board-item text, compact panels, a denser stage grid, and sticky action buttons.
- Touch, mouse, and pen share pointer-event interactions in `script.js`.

Do not add hover-only mechanics. Every puzzle must be solvable with tap, drag, or hold on a phone.

## Level Data Contract

Each stage in `levels.js` is an object in `window.HINT_TRAP_STAGES`.

Required stage fields:

- `id`: Stable unique string used for save data.
- `title`: Short stage title.
- `subtitle`: Flavor copy under the title.
- `tag`: Small category label in the HUD.
- `mechanic`: Short label for the current interaction type.
- `theme`: Board theme key used by CSS.
- `promptHtml`: Prompt text, optionally including tappable or draggable words.
- `hint`: One hint string.
- `success`: Feedback shown when solved.
- `wrong`: Feedback shown after an incorrect attempt.
- `items`: Board item array.
- `solution`: Solution object with a supported `kind`.

Example stage:

```js
{
  id: "biggest-animal",
  title: "Scale Lie",
  subtitle: "The clue is honest. Your assumptions are the problem.",
  tag: "Size Trick",
  mechanic: "Tap",
  theme: "meadow",
  promptHtml: "Find the biggest animal.",
  hint: "Look at the size on the screen, not real life.",
  success: "Correct. That mouse is drawn biggest.",
  wrong: "Not that one. The page is asking about this screen.",
  items: [
    card("elephant", "E", "Elephant", 12, 36, 18, 22),
    card("mouse", "M", "Mouse", 48, 22, 34, 36, { tone: "sun" })
  ],
  solution: { kind: "tap", target: "mouse" }
}
```

## Board Items

Board items are absolute-positioned by percentages inside the board:

- `x`: Left position as a percentage.
- `y`: Top position as a percentage.
- `w`: Width as a percentage.
- `h`: Height as a percentage.

Common item fields:

- `id`: Unique within the stage.
- `icon`: Emoji or short symbol.
- `image`: Optional project-relative image path such as `assets/images/items/mouse.svg`.
- `imageAlt`: Human-readable image description used as a fallback label source.
- `ariaLabel`: Optional accessible name override for unusual board items.
- `imageSize`: Optional CSS size override for unusually large or wide images.
- `text`: Visible label.
- `shape`: Visual type such as `card`, `pill`, `circle`, `choice`, `zone`, `text`, or `cover`.
- `tone`: Color tone such as `slate`, `sun`, `leaf`, `sky`, `rose`, or similar CSS-supported token.
- `interactive`: Whether the item can be clicked.
- `draggable`: Whether the item can be dragged.
- `acceptWord`: Word token this item accepts for prompt-word drag puzzles.
- `acceptItem`: Item id this item accepts for item-drag puzzles.
- `hiddenUntilReveal`: Hide this item until a reveal action succeeds.
- `hideAfterReveal`: Hide this item after a reveal action succeeds.
- `revealThreshold`: Pixel distance a cover must move to reveal hidden content.
- `fontSize`: Optional CSS font size override.

Helper functions in `levels.js` keep level data compact:

- `itemImage(source, alt, extra)`: points a board item at `assets/images/items/<source>.svg` by default, or accepts a filename/path that already includes an extension.
- `card(id, icon, text, x, y, w, h, extra)`
- `pill(id, icon, text, x, y, w, h, extra)`
- `bubble(id, icon, text, x, y, w, h, extra)`
- `choice(id, text, x, y, w, h, extra)`
- `zone(id, text, x, y, w, h, extra)`
- `textTag(id, text, x, y, w, h, extra)`
- `cover(id, icon, text, x, y, w, h, extra)`

## Image Asset Workflow

The engine supports board-item images without removing the old emoji/text fallback. When `item.image` is present, `script.js` renders an `<img>` before the board text. If `item.image` is missing, the item renders the existing `icon` span.

Current starter assets live in `assets/images/items/` as SVG files. They cover the first small art pass for animals, prompt-key objects, fruit, the cactus sunlight scene, and the hidden phone scene.

Recommended workflow for future generated assets:

1. Generate or create the asset with a transparent background.
2. Save the selected final into `assets/images/items/`.
3. Prefer lowercase kebab-case filenames, for example `big-mouse.webp`.
4. Keep each asset small enough for mobile. SVG is fine for simple art; use optimized PNG or WebP for raster art.
5. Add `image: "assets/images/items/<file>"` or use `itemImage("<name-or-file>", "<alt>")` in `levels.js`.
6. Keep `text` on the board item so the puzzle remains understandable if an image fails to load.
7. Run the validation commands before publishing.

Use the built-in image-generation tool for final raster art when the game needs richer illustrated assets. Use the sprite-pipeline workflow only if an asset needs consistent multi-frame animation.

## Prompt Helpers

Prompt text can contain interactive words:

```js
promptHtml: `Tap the ${tapWord("key")} word.`
```

```js
promptHtml: `Put the ${dragWord("green")} word into the empty circle.`
```

Use `tapWord` for `promptTap` solutions and `dragWord` for `dragPromptWord` solutions. Prompt-word controls are rendered as buttons so they work with keyboard, mouse, touch, and assistive technology.

## Supported Solution Kinds

Use these existing mechanics before adding new engine code:

- `tap`: Player clicks one board item. Shape: `{ kind: "tap", target: "mouse" }`
- `tapAny`: Player clicks any valid board item. Shape: `{ kind: "tapAny", targets: ["spot-a", "spot-b"] }`
- `promptTap`: Player taps a word in the prompt. Shape: `{ kind: "promptTap", word: "key" }`
- `metaTap`: Player taps a non-board UI target. Shape: `{ kind: "metaTap", target: "stage-chip" }`
- `dragItem`: Player drags a board item onto another board item. Shape: `{ kind: "dragItem", item: "sun", target: "cactus" }`
- `dragPromptWord`: Player drags or arms a prompt word and applies it to a board item. Shape: `{ kind: "dragPromptWord", word: "green", target: "empty-circle" }`
- `revealTap`: Player drags a cover away, then taps the revealed item. Shape: `{ kind: "revealTap", target: "phone" }`
- `multi`: Player finds all listed targets in any order. Shape: `{ kind: "multi", targets: ["a", "b", "c"] }`
- `sequence`: Player taps targets in order. Shape: `{ kind: "sequence", order: ["bottom", "middle", "top"] }`
- `hold`: Player holds a target for a duration. Shape: `{ kind: "hold", target: "cat", duration: 1400, scale: 1.8 }`

## Expansion Workflow

To add more levels:

1. Open `levels.js`.
2. Append a new stage object to `window.HINT_TRAP_STAGES`.
3. Choose a unique stable `id`.
4. Pick one existing `solution.kind`.
5. Add board items with ids that exactly match the solution fields.
6. Prefer helper functions instead of raw item objects unless a stage needs unusual fields.
7. Run the validation commands below.
8. Play the new level with mouse and touch-style dragging if possible.

Do not edit `script.js` for ordinary new stages. Only edit the engine when adding a brand-new mechanic that cannot be represented by the supported solution kinds.

Keep stage ids stable after release because progress is saved by `id`. Reordering stages is safer than renaming ids, but reordering can change unlock flow, so test the progression after moving levels.

## Validation Commands

From PowerShell:

```powershell
cd "C:\Users\n\Documents\Codex\2026-04-20-game-studio-plugin-game-studio-openai"
node --check .\levels.js
node --check .\script.js
node -e "global.window=globalThis; require('./levels.js'); const s=global.HINT_TRAP_STAGES; const ids=new Set(s.map(x=>x.id)); console.log(s.length + ' levels, ' + ids.size + ' unique ids'); if (s.length !== ids.size) process.exit(1);"
Start-Process .\index.html
```

Expected data validation output for the current build:

```text
26 levels, 26 unique ids
```

## QA Checklist

Before considering a new level ready:

- The clue has one clear literal interpretation.
- The wrong obvious answer is tempting but fair.
- The correct target is visible or revealable without hidden pixel hunting.
- The stage can be solved on desktop and mobile-sized screens.
- The hint points toward the trick without fully replacing the puzzle.
- The level uses an existing mechanic unless a new mechanic is worth the engine cost.
- The stage id is unique and all solution target ids exist in `items`.

## Current Stage Coverage

The 26-stage build covers these puzzle families:

- Screen-position tricks.
- On-screen size tricks.
- Prompt-word taps.
- Prompt-word drags.
- Hidden-object reveals.
- Count traps.
- Ordered click sequences.
- Multi-select hunts.
- Hold-to-grow interaction.
- Meta UI tapping.

This gives the game enough variety for an initial prototype while keeping the codebase ready for a larger level pack.
