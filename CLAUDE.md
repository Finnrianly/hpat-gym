# HPAT Gym

An installable iPhone web app (PWA) for HPAT-Ireland Section 1 practice. It's built for one user, Emily. Plain HTML, CSS and JS with no build step and no backend.

## Files
- `index.html`: shell, bottom tab bar, iOS home-screen meta tags
- `styles.css`: design tokens on `:root` (light) plus a dark-mode override, and self-hosted fonts in `fonts/`
- `app.js`: all logic and views. It renders with template strings into `#app`, and handles every click through one delegated listener on `[data-act]` (see the `A` actions object)
- `questions.js`: `window.QBANK`, the question bank
- `lessons.js`: `window.LESSONS`, the method cards on the Learn tab
- `sw.js`: offline cache. **Bump `VERSION` on every deploy**, or phones keep the old files
- `manifest.webmanifest`, `icons/`: install metadata

## Data
- Everything is saved in `localStorage` under the key `hpat-gym`. There's no server.
- Backup and restore is a JSON export/import in Settings (it uses the iOS share sheet).
- State shape: see `blank()` in `app.js`. When you add fields, give them a default in `blank()`. `load()` merges saved data over the defaults, so old saves keep working.
- On iOS, Safari and the home-screen app keep **separate** storage, so tell her to always use the home-screen app.

## Question format
```js
{id:"d20", t:"logic"|"data"|"number"|"argument", q:"stem\n(with line breaks)",
 table:{head:[...],rows:[[...]]}?, qx:"question line shown under the table"?,
 o:["A text","B text","C text","D text"], a:<index of the correct option in o>,
 h:["hint 1","hint 2","hint 3"],   // exactly 3, each one more specific
 s:"worked solution" }
```
- Options are **shuffled on screen**. Inside `s`, never write option letters directly. Use `{0}`..`{3}` (the index in `o`), which become the letter that option is shown under. Plain letters used as names (Pump A, School B) are fine.
- Options starting with "Cannot be determined" or "They are all the same" stay last.
- IDs must be unique. Never reuse or renumber an existing ID, because saved progress is keyed by ID.
- All questions must be original. Don't copy official ACER/HPAT items.

## Rules of the app
- Exam pace: 42 questions in 60 minutes (`PACE = 85` seconds). No negative marking.
- Spaced review: a wrong answer comes back in 3 days. A right answer while it's due pushes it to 7 days. Two right answers while due clear it.
- The daily set mixes about 40% due reviews with weak types first, and caps how many of one type appear.
- Mocks: `half` (21q / 30 min) and `full` (42q / 60 min). The countdown keeps running while paused, and a mock auto-submits when time runs out, including on the next app open.

## Style
- Never use em dashes in UI copy.
- Copy is plain, short and encouraging. Never mock wrong answers.

## Testing
`python3 -m http.server 8765`, then open http://localhost:8765 at iPhone size. The service worker only runs over http(s), not `file://`.

## Deploying
This is a static site, so any static host works (Netlify, GitHub Pages, Vercel). It needs HTTPS for Add to Home Screen and offline mode.
