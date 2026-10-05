# Hamzah Naufal Zuhdi — Portfolio

A personal portfolio for **Hamzah Naufal Zuhdi**, an Information Systems graduate
working across data, technology, business process and digital solutions.

Built as a **homepage plus real detail pages**: the landing page sells the work in
one screen, and each section links through to a full page.

---

## Stack

| Piece | Choice | Why |
| --- | --- | --- |
| Framework | **Astro 7** (`output: 'static'`) | Every page is pre-rendered HTML. No server needed. |
| Types | **TypeScript** (strict) | Content is typed; a missing field fails the build. |
| Styles | **Tailwind CSS v4** + design tokens | One token file drives the whole visual system. |
| Validation | **Zod** | Content files are parsed at load, so gaps fail loudly. |
| Islands | **React** — exactly one | Only the project filter needs client state. The homepage adds ~600 B of inline JS for the hero's pointer drift. |
| Icons | **simple-icons** + local fallbacks | Official marks where redistributable. |
| Images | **sharp** via `scripts/build-assets.mjs` | 344 MB of source → 7.7 MB of WebP. |
| Fonts | `@fontsource-variable` (self-hosted) | No external requests, no layout shift. |

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:4321
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run check` | Type + template diagnostics (`astro check`) |
| `npm run verify` | Asserts the built HTML: links, images, SEO, no phone leak |
| `npm run contrast` | WCAG AA contrast audit in both themes (needs a running server) |
| `npm run assets` | Re-optimise images from `konten/` into `public/images/` |
| `npm run og` | Regenerate the social share card from the profile + palette |
| `npm run favicon` | Regenerate `public/favicon.svg` from the monogram + tokens |
| `npm test` | Project-filter behaviour test |
| `npm run measure` | Layout/a11y probe in a real browser (overflow, contrast, structure) |

---

## Architecture — data vs. presentation

**Data lives in `src/data/`. Components render it. Components never contain a
personal fact.** That is the rule the whole structure is built around.

```
src/
├── data/                    ← EVERY fact lives here
│   ├── profile.ts           identity, About narrative, contact links
│   ├── projects.ts          project case studies
│   ├── experience.ts        professional roles
│   ├── organizations.ts     student-body / committee roles
│   ├── education.ts
│   ├── skills.ts            skill groups + icon keys
│   ├── skill-icons.ts       icon key → SVG
│   ├── publications.ts
│   ├── certifications.ts
│   ├── achievements.ts
│   ├── gallery.ts           personal/activity photographs
│   ├── journal.ts           dated record entries
│   ├── monogram.ts          the identity mark — one definition, drawn everywhere
│   ├── schemas.ts           Zod validation for all of the above
│   ├── image-dims.ts        accessor for real pixel sizes
│   └── asset-dims.generated.ts   ← GENERATED, do not edit
│
├── components/
│   ├── layout/              Navbar, Footer, ThemeToggle
│   ├── ui/                  reusable primitives (cards, collage, lightbox…)
│   ├── sections/            homepage preview sections
│   └── islands/             the React filter — the only bundled client JS
│
├── pages/                   one file per route
│   ├── index.astro          homepage — 6 curated previews only
│   ├── about.astro           full background + education + organisations
│   ├── projects/             index (filterable) + [id] case studies
│   ├── experience.astro      professional roles + organisations
│   ├── skills.astro          all skill groups
│   ├── publications.astro
│   ├── certifications.astro  credential showcases
│   ├── achievements.astro    awards / competitions / funding
│   ├── gallery.astro         all photographs
│   ├── journal.astro         dated record
│   └── contact.astro
├── layouts/BaseLayout.astro <head>, theme bootstrap, nav, footer, lightbox
├── styles/                  global.css + tokens.css (the design system)
├── types/content.ts         the shapes of the data
└── utils/                   site config, navigation model
```

### Adding content

Every one of these is **one object appended to one array** — no component edits:

| To add… | Edit |
| --- | --- |
| A project | `src/data/projects.ts` — its card, gallery and `/projects/<id>` page generate automatically |
| A role | `src/data/experience.ts` |
| A certificate | `src/data/certifications.ts` + drop the scan in `public/images/certificates/` |
| A paper | `src/data/publications.ts` |
| A skill | `src/data/skills.ts` (add an icon key in `skill-icons.ts` if you want a logo) |
| An achievement | `src/data/achievements.ts` |
| A gallery photo | `src/data/gallery.ts` + the file in `public/images/gallery/` |
| A nav destination | `src/utils/navigation.ts` — navbar, mobile panel, footer and sitemap all follow |

Counts shown on the site ("15 certificates", "18 photos") are **derived from the
data**, never hardcoded, so they update themselves.

### Adding images

Drop the original into `konten/`, add one line to the `RECIPES` array in
`scripts/build-assets.mjs`, then:

```bash
npm run assets     # writes optimised WebP + refreshes the generated dimension map
```

Real pixel dimensions are emitted to `src/data/asset-dims.generated.ts`, which is
what lets cards reserve the correct space and avoid layout shift.

### Vector marks

An employer mark that arrives as a flat image carries that image's edge at every
size it is drawn — stair-steps, plus a compression halo once it has been through a
JPEG. The AirNav roundel is therefore **traced to paths** instead of sampled:

```bash
python scripts/airnav-logo.py   # konten/Logo AirNav.jfif -> konten/_rendered/airnav-roundel.svg
npm run assets                  # -> public/images/logos/airnav.svg (+ .webp fallback)
```

The trace is a build step, not a one-off asset: the script rebuilds the disc as an
exact circle (taken from the ink's bounding box, because the JPEG's own boundary
is not a usable edge) and traces the ribbon, swooshes and lettering from colour
masks. **Nothing is redrawn by hand** — the geometry is the supplied artwork's own.

The pipeline then writes two files: the minified `airnav.svg`, which the page
renders, and `airnav.webp`, a raster fallback. Which one a component uses comes
from the data layer, not from a naming convention: a `MediaAsset` may carry an
optional `srcVector`, and the components prefer it when present. Adding a second
traced mark is a two-line change (`VECTOR_MARKS` in `scripts/build-assets.mjs` plus
`srcVector` on that entry in `src/data/`).

Requires `pillow`, `numpy` and `potrace` (`pip install potracer`) for the trace;
`svgo` is a dev dependency and does the SVG minification.

---

## Design system

Everything visual is a token in `src/styles/tokens.css`. Components reference
`var(--x)` and never a raw colour, so the whole site re-skins from one file.

**One system, two designed themes** — not two inversions of each other:

| | Dark | Light |
| --- | --- | --- |
| canvas | near-black, warm (`#0d0c0b`) | warm ivory (`#f7f3ec`) |
| surfaces | charcoal, 3 elevation steps | soft beige → white-ish |
| type | warm ivory | charcoal |
| accent | muted burgundy | muted burgundy |

- Neither theme uses pure `#000` or `#fff`.
- **Elevation** is tokenised (`--surface`, `--surface-2`, `--surface-3`) so a
  panel can lift without a hard border; `--band` is the full-width section tint
  that separates homepage sections instead of a rule.
- **Vertical rhythm** is three named steps (`--space-section`, `--space-band`,
  `--space-block`) — sections never invent their own padding.
- **One measure** (`--measure`) governs every page, so sections align.
- Typography: Playfair Display (display serif), Inter (body), JetBrains Mono
  (metadata). Fluid `clamp()` scale, no per-breakpoint font sizes.
- Corners stay near-square (`2–8px`).

### Theme transition

Switching theme crossfades rather than snapping: the toggle adds a
`.theme-switching` guard for ~340ms which transitions background, border, colour,
fill and shadow together, then removes itself. Keeping it on a temporary class
means first paint and hovers stay instant. `prefers-reduced-motion` disables it.

---

## Verification

```bash
npm run build && npm run verify
```

`verify-build.mjs` asserts against the **built HTML**, not the source:

- no phone number anywhere in rendered output
- no broken internal links or missing image files
- every page has title, meta description, canonical, OG tags, one `<h1>`, landmarks, a skip link
- every `<img>` carries an `alt` attribute
- sitemap, robots.txt and favicon exist

`contrast.mjs` drives a real browser (CDP) to measure every text element in both
themes against WCAG AA. It reloads per theme so colours resolve from scratch, and
skips gradient-backed captions it cannot measure honestly.

---

## Content rules (important)

This site is **strictly factual**. The two source documents are:

- `Profile.pdf` — authoritative for **dates** and current status
- `PORTOFOLIO HAMZAH (3).pdf` — authoritative for **descriptions, projects, skills, certificates**

Rules that were followed throughout, and must keep being followed:

1. **Never invent** experience, projects, metrics, dates, technologies, clients,
   testimonials or URLs.
2. Where a fact is genuinely unknown, it is **absent** — never a plausible
   guess. Every entry that once carried a visible note has since been confirmed
   by the author, so the site ships with no unresolved placeholders.
3. **No proficiency percentages** for skills; the sources state none.
4. **The phone number is never published.** `CONTACT_PHONE_ENABLED` in
   `src/data/profile.ts` is `false`; contact links are read from
   `activeContactLinks`, which filters disabled entries so one cannot leak.
5. **Positioning**: the site leads with *Information Systems Graduate*. AirNav
   Indonesia appears only inside Experience, labelled as an internship — it is
   not the site's identity.
6. **Personal photographs are not attributed to an employer** unless the image
   itself proves it. Ambiguous photos live in the Gallery.

### Skill marks that are near-black

Several official brand colours are near-black — Java (`#000000`), GitHub
(`#181717`), OBS Studio (`#302E31`). Painted literally they vanish on the dark
canvas. `src/data/skill-icons.ts` drops any brand colour below a luminance
threshold to `null`, which renders as `currentColor` and inherits the theme
foreground. Add new marks through the same `brand()` helper.

### Certificate corrections made from the source text layer

Three credential IDs previously transcribed from a rendered image were wrong.
The PDF text layer is authoritative:

| Certificate | Correct ID |
| --- | --- |
| Google Looker Studio | `MS-6/5/2025-sHCYqF5VgVDWEZRcHThr` |
| Basic Data | `MS-26/1/2024-TnKfD2HxnGX2FbdOf8QT` |
| Meniti Karier | `MRZM820DRZYQ` |

Also corrected: the Olimpiade Numerasi Nasional Silver Medal is **2020** (not
2022), and B2B Sales is **28 May 2025**.

---

## Deploying

The build is fully static — deploy `dist/` anywhere.

This repository deploys to **GitHub Pages as a project site**, so the origin is
`https://naufalhamzah.github.io` and the site is served under `/naufalhamzah/`.
`.github/workflows/deploy.yml` builds and publishes on every push to `main`.

The path prefix is derived in `astro.config.mjs` from `GITHUB_ACTIONS`, so the
same source builds correctly in both places: with the prefix in CI, without it in
`npm run dev`. **Do not hardcode it** — see the comment on `BASE_PATH` for why the
two states cannot be allowed to disagree.

---

## Known open items

No content placeholders remain. Two facts are deliberately shown as what the
sources support rather than expanded:

- **AirNav Indonesia** lists the role, scope and tools but no metric or outcome —
  nothing beyond what is documented.
- **No graduation month** is documented, so only the year is shown.
