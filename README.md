# Dipan Bartaula — Portfolio (Next.js)

An interactive research/engineering portfolio, structured like a manuscript
(Abstract → Log → Research → Repository Index → Stack → Results → Off the
Clock) but built as a real Next.js app: scroll-linked reveals, a section
dot-nav, a command palette (`/` or `⌘K`), a filterable/sortable repo table,
and a click-to-zoom lightbox on the research figures.

## 1. Install prerequisites (one-time)

This machine didn't have Node.js installed, so start here:

1. Install **Node.js 20 LTS** from https://nodejs.org (the installer includes npm).
2. Verify it worked — open a new terminal and run:
   ```
   node -v
   npm -v
   ```

## 2. Install & run locally

From this folder (`dipan-portfolio/`):

```
npm install
npm run dev
```

Open **http://localhost:3000** — that's your local dev server. Edit any file
under `components/`, `app/`, or `lib/content.ts` and it hot-reloads.

## 3. Add the missing images

Five images referenced in `lib/content.ts` aren't in the repo yet because I
could only see them inline in our chat, not save them to disk myself. Export
each one as a PNG/JPG and drop it into `public/images/` with these **exact**
filenames:

| File to add                                   | What it is                                                        |
| ---------------------------------------------- | ------------------------------------------------------------------ |
| `public/images/curvton-pipeline.png`           | Cloth/Person stream + editing pipeline diagram (CURVTON-205K)      |
| `public/images/curvton-samples-grid.png`       | 3×3 grid of garment/person sample outputs                          |
| `public/images/curvton-samples-umbrella.png`   | Umbrella outfit → kimono → result triple                           |
| `public/images/dreamcloth-pipeline.png`        | DreamCloth overview diagram (in place)                             |
| `public/images/dreamcloth-stage1.png`          | DreamCloth Stage-1 detail (in place)                               |
| `public/images/cert-ieee.png`                  | **Still needed** — IEEEXtreme 18.0 certificate (save your image here) |
| `public/images/cert-samsung.png`               | Samsung Innovation Campus certificate (in place, rendered from PDF) |
| `public/images/logo-naamii.svg` / `logo-ailab.png` / `logo-ank.png` / `logo-freelance.svg` | Company logos (in place; replace any to override) |

`public/images/headshot.jpg` is already in place (your cropped photo).

Until you add them, those spots will show a broken-image icon — everything
else on the page works fine without them.

## 4. Deploy to Vercel

Once it looks right locally:

**Easiest path (no CLI):**
1. Push this folder to a GitHub repo.
2. Go to https://vercel.com/new, import that repo.
3. Vercel auto-detects Next.js — click **Deploy**. No config needed.
4. Every push to `main` redeploys automatically; you get a `*.vercel.app` URL immediately and can attach a custom domain later.

**Or via CLI:**
```
npm install -g vercel
vercel login
vercel        # first deploy, follow the prompts
vercel --prod # promote to production
```

## Project structure

```
app/            Next.js App Router entry (layout, page, global CSS)
components/     One component per section + shared bits (nav, palette, lightbox, reveal animation)
lib/content.ts  All the actual content (experience, research, repos, stack, results, education) — edit this file to change text without touching components
public/images/  Static images (headshot + the 5 figures above)
```

## Notes

- Theme (light/dark/auto) is a real toggle in the top bar, backed by `next-themes`; "Auto" follows the OS setting.
- The hero background is an animated canvas mesh (a stylized nod to the Material Point Method grids used in the cloth-simulation research) — it responds gently to mouse movement and respects `prefers-reduced-motion`.
- Research, Log, Projects, Skills, Achievements, and Education content is sourced strictly from your CV (`dipan_bartaula_latest.pdf`) and your public GitHub repos — edit `lib/content.ts` if either changes.
