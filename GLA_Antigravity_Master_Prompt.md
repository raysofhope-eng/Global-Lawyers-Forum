# GLA Website — Antigravity Master Build Prompt

> Paste everything below into Antigravity as the project brief. It is written to be built as-is: stack, design system, page/section spec, motion, performance and SEO are all specified. A working visual prototype already exists (`index.html`) — treat it as the design reference of record; this prompt is the production translation of it.

---

## 0. ROLE & OUTCOME

You are a senior front-end engineer + brand-minded designer. Build the **official website of the Global Lawyers Association (GLA)** — an international legal federation. The site must feel like a **chartered global institution**: authoritative, elegant, calm, and unmistakably premium. It must load fast, score high on Core Web Vitals, and be fully SEO-optimized. Ship a production-ready, responsive, accessible marketing site.

Do **not** clone any existing legal-association website. Reproduce the identity described here (Sovereign theme, gold-on-ink, Fraunces + Archivo, meridian motif). Copy is provided — use it verbatim unless told otherwise.

---

## 1. THE ORGANISATION (facts to encode)

- **Name:** Global Lawyers Association — abbreviate **GLA**.
- **Nature:** A federation/foundation of legal professionals spanning **five founding jurisdictions: United Kingdom, United States, Pakistan, United Arab Emirates, European Union.**
- **Founder & First President:** **Mian Muhammad Sohail Anjum** — always styled "Founder & First President." Give him a dedicated, dignified section. (No photo yet — use an elegant monogram medallion "SA" placeholder; make it easy to swap for a real portrait later.)
- **Seat:** London, UK. Chapter cities: London · New York · Islamabad · Dubai · Brussels.
- **Founded:** 2025.
- **Domain:** `gla.uk`.
- **Tagline / thesis:** **"Justice Without Borders."**
- **Mission pillars:** Uphold the Rule of Law · Enable Cross-Border Practice · Champion Human Rights · Advance Professional Excellence.
- **Tone:** formal, principled, confident, human. Never salesy. Think "supreme court gravitas meets modern global think-tank."

---

## 2. TECH STACK

- **Next.js (App Router, latest) + JavaScript (JSX, not TS unless you prefer TS).**
- **Framer Motion** for all animation.
- **Tailwind CSS** for styling, driven by CSS variables/design tokens (below). No component-library chrome — bespoke components only.
- **next/font** for self-hosted Google Fonts (Fraunces + Archivo) — no render-blocking external font requests.
- **next/image** for every raster image (AVIF/WebP, lazy, sized, `priority` only on the hero).
- Deploy target: static-friendly / edge (Vercel-style). Prefer **Server Components**; mark only interactive/animated pieces `"use client"`.
- No jQuery, no heavy UI kits, no unused deps. Keep the JS bundle lean.

---

## 3. DESIGN SYSTEM — "SOVEREIGN"

**Concept:** Five jurisdictions, one bar, threaded by a single **gold meridian** (a thin vertical/great-circle line of justice). Ink-dominant with a single bold gold note. Editorial serif display + sturdy grotesque body. Generous whitespace, hairline gold rules, no rounded-card clutter (2px radii max, mostly square).

### Color tokens (CSS variables; support light + dark)
```
--ink:#0A1723   --ink-2:#0F202E   --ink-3:#16303F
--gold:#C6A15B  --gold-bright:#D9BE84  --gold-deep:#A9843E
--bone:#F5F3EC  --bone-2:#ECE8DC
--slate:#93A1B0 --slate-deep:#5C6B79
```
- **Light theme (default `:root`):** ground `--bone`, surfaces `#FBFAF5`/`#F1EDE1`, text `#13202B`, accent `--gold-deep`, hairlines `rgba(19,32,43,.12)`.
- **Dark theme:** ground `--ink`, surfaces `--ink-2`/`#132535`, text `#F3F1E9`, accent `--gold`, hairlines `rgba(198,161,91,.18)`.
- Implement all three theme states: bare `:root` = full light palette; `@media (prefers-color-scheme:dark)` guarded as `:root:not([data-theme="light"])`; and `:root[data-theme="dark"]`. Provide a header theme-toggle that writes to `localStorage` (guard reads/writes in try/catch). `body` must paint an explicit token background.
- Gold is the **only** loud color. Never introduce a second accent hue.

### Typography (next/font)
- **Display / headings:** **Fraunces** (optical, weights 400/500/600; use italic for the emphasized word in headlines, e.g. *Borders.*, *global bar.*). `letter-spacing:-.01em`, `text-wrap:balance`.
- **Body / UI:** **Archivo** (400/500/600/700).
- **Eyebrows/labels:** Archivo, 12px, `600`, `letter-spacing:.24em`, uppercase, gold accent.
- Type scale: hero `clamp(3.1rem,7.2vw,6rem)`; section H2 `clamp(2.2rem,4.4vw,3.3rem)`; lede `1.18–1.24rem`; body 17px/1.65; keep running text ≤ ~65ch.

### Layout & motifs
- Max content width ~1200px, 28px gutters.
- **Meridian spine:** a faint vertical gold gradient line down the center of certain sections (`.spine`) — decorative, `pointer-events:none`, hidden on mobile.
- **Crest/logo:** inline SVG monogram — a ring + vertical beam + scales arc + "G", gold stroke. **Seal** variant (scales + globe ellipse, "EST. MMXXV · LONDON") for the founder/hero aside.
- Section rhythm: alternate ground / surface / ink backgrounds for cadence (Mission on ground, Founder on surface, "What We Do" on full ink, Membership on ink with gold radial glow).

---

## 4. PAGE / SECTION SPEC (single-page primary site + room for sub-routes)

Build the homepage as the hero deliverable. Structure content into routes where noted (`/about`, `/chapters`, `/leadership`, `/membership`, `/events`, `/contact`) but the homepage should present a full narrative with anchors.

1. **Sticky Header** — crest + "Global Lawyers Association" / "Justice Without Borders" sublabel; nav: Mission · Chapters · Leadership · Events · Membership; theme toggle; gold **"Join the Association"** CTA. Backdrop-blur, hairline bottom border. Mobile: hamburger → slide-in panel.

2. **Jurisdiction ticker strip** — slow marquee: United Kingdom · United States · Pakistan · United Arab Emirates · European Union (gold dot separators). Pause on `prefers-reduced-motion`.

3. **Hero** — full-bleed **ink** background with an **animated canvas globe**: a wireframe great-circle sphere (gold graticule) slowly rotating, with **five chapter nodes plotted at real lon/lat (London, New York, Islamabad, Dubai, Brussels)** connected by faint arcs — the literal "justice without borders" network. Overlay: eyebrow "Five Jurisdictions · One Global Bar", H1 **"Justice Without *Borders.*"**, lede, two CTAs (gold "Become a Member", ghost "Our Mission"). Right aside: the GLA **seal** + "Office of the Founding President" note + Mian Muhammad Sohail Anjum signature line. Canvas must be paused/replaced with a static SVG under reduced-motion, and be `aria-hidden`. `priority` for any hero raster.

4. **Stat band** (ink-2): 5 Founding Jurisdictions · 2025 Foundation · 40+ Practice Areas · 1 Unified Global Bar. Count-up on scroll (respect reduced-motion), tabular-nums.

5. **Mission / Charter** — eyebrow "Our Charter", H2, lede, then **4 pillars** in a 2×2 hairline grid (roman-numeral index, gold left-bar wipe on hover). Copy = the four pillars in §1, expanded (see prototype for full sentences).

6. **Founding President** (surface) — left: portrait plate (monogram "SA" medallion, gold ring, name + "Founder & First President" plate). Right: eyebrow, a large serif **pull-quote** ("The law does not stop at a border, and neither should the lawyers who serve it. GLA was founded so that principle could have an institution behind it."), attribution, a two-sentence bio, and a "Meet the Council" link. Dignified, editorial.

7. **Chapters** — eyebrow "The Federation", H2 "Five chapters, threaded by a single meridian of justice.", then **5 cards** (UK/USA/PAK/UAE/EU), each: jurisdiction code, country name, one-line description, chapter city with gold dot, and a gold underline that wipes in on hover + card lift. On desktop, plot them along/around the meridian.

8. **What Membership Delivers** (full **ink**) — eyebrow, H2 "The standing of an institution, the reach of a network.", **6 benefit tiles** with line-icons: Global Referral Network · Accredited Education · Recognition & Standing · Advocacy Platform · Summits & Convenings · Pro Bono & Impact.

9. **Governance / Leadership** — eyebrow "Governance", H2 "Led by a founding bench, governed by charter.", 3 cards: **Office of the President** (Founder & First President, Deputy President, Secretary-General, Treasurer & Registrar) · **Chapter Presidents** (one per jurisdiction) · **Council of Benchers** (Senior/King's Counsel, Human Rights, Legal Education, Ethics & Standards committees). Use role titles as placeholders; make names easy to add later.

10. **Events / Convenings** (surface) — editorial list rows (date block + title + blurb + location pill + arrow that slides on hover). Seed: Inaugural Global Legal Summit — London (14 Nov) · Cross-Border Arbitration Forum — Dubai (05 Feb) · Rule of Law Symposium — Brussels (22 Apr).

11. **Membership / Join** (ink + gold radial glow) — H2 "Take your place in the *global bar.*", 3 tiers (Associate / Full Member — featured / Chambers-Institutional) with checkmark feature lists, then CTAs "Apply for Membership" + "Speak to the Registrar". (Prices left as "/ annual" placeholders.)

12. **Footer** (surface-2) — crest + mission blurb; columns Association / Engage / Newsletter (email capture); bottom bar: © 2025–2026 GLA · **gla.uk** · London · New York · Islamabad · Dubai · Brussels.

---

## 5. MOTION (Framer Motion)

- **Page-load orchestration:** hero eyebrow → H1 (word "Borders." italic gold reveals last) → lede → CTAs, staggered (`staggerChildren` ~0.08s, ease `[0.2,0.7,0.2,1]`). Draw the meridian spine and the hero globe fade-in.
- **Scroll reveals:** `whileInView` fade-up (y:26→0, opacity), `viewport={{once:true, margin:"-8%"}}`, small per-item stagger. Use for pillars, chapters, benefits, gov cards, event rows, tiers.
- **Micro-interactions:** chapter/tier hover lift + gold underline/border; CTA hover translateY + gold glow shadow; event-row arrow slide + left-pad shift; nav-link gold underline grow.
- **Count-up** stats via a Framer/motion value or IntersectionObserver.
- **Reduced motion:** wrap everything so `useReducedMotion()` disables transforms, the marquee, the globe animation (swap a static SVG), and count-ups. This is mandatory.
- Keep it tasteful — orchestrated reveals over scattered effects. No parallax overload.

---

## 6. PERFORMANCE (target: LCP < 2.0s, CLS < 0.05, INP < 200ms, Lighthouse ≥ 95)

- Server Components by default; `"use client"` only on Header (toggle/menu), Hero canvas, count-up, and any Framer wrappers.
- `next/font` self-hosted, `display:swap`, subset latin. Preconnect not needed once self-hosted.
- `next/image` everywhere, explicit width/height (no CLS), AVIF/WebP, `priority` only hero.
- Lazy-load below-the-fold client components (`next/dynamic`, `ssr:false` for the canvas globe).
- Throttle/`requestAnimationFrame` the globe; cap DPR at 2; pause when tab hidden and when offscreen.
- No layout shift: reserve space for images, fonts (fallback metrics), and the sticky header.
- Minimize third-party scripts to zero if possible. Defer analytics.
- Ship compressed, tree-shaken, code-split. Static-generate all marketing routes.

---

## 7. SEO & METADATA

- Next.js **Metadata API**: unique `<title>` + meta description per route. Home title: "Global Lawyers Association — Justice Without Borders". Description: the one-liner from §1.
- **Open Graph + Twitter cards** (og:image = branded gold-on-ink card with crest + tagline). Generate via `next/og` (ImageResponse).
- **JSON-LD structured data:** `Organization` / `LegalService` / `NGO` schema — name "Global Lawyers Association", url `https://gla.uk`, `foundingDate` 2025, `founder` "Mian Muhammad Sohail Anjum", `areaServed` [GB, US, PK, AE, EU], `location` London. Add `BreadcrumbList` on sub-routes and `Event` schema on the events.
- Semantic HTML: one `<h1>`, ordered headings, `<nav>`, `<main>`, `<section aria-labelledby>`, `<footer>`. Descriptive alt text.
- `sitemap.xml` + `robots.txt` (App Router `sitemap.js` / `robots.js`). Canonical URLs. `lang="en-GB"`.
- Fast, mobile-first, accessible (WCAG AA): visible focus states, color contrast ≥ 4.5:1, `prefers-reduced-motion`, keyboard-navigable menu, skip-to-content link.

---

## 8. ACCESSIBILITY & QUALITY BAR

- Every interactive element keyboard-reachable with a visible gold focus ring.
- Decorative SVG/canvas `aria-hidden`; meaningful icons get labels.
- Forms (newsletter, membership) have real labels, error/success states in plain language.
- Test both themes for contrast; never define a color only inside a media/`[data-theme]` block.
- Cross-browser + mobile (375px → 1440px) verified. Body never scrolls horizontally.

---

## 9. DELIVERABLES

1. Next.js App-Router project, componentized (`Header`, `Hero`, `GlobeCanvas`, `StatBand`, `Mission`, `Founder`, `Chapters`, `Benefits`, `Governance`, `Events`, `Membership`, `Footer`, plus `ThemeToggle`).
2. Central `tokens.css` / Tailwind theme extension holding the Sovereign palette + font vars.
3. Content in a typed/plain data file (`site.config.js`) so chapters, leadership, events and copy are edit-in-one-place.
4. Metadata, JSON-LD, sitemap, robots, OG image route.
5. README with run/build/deploy steps and where to drop the founder photo + real names.

Build the homepage end-to-end first, pixel-faithful to the Sovereign identity, then scaffold the sub-routes. Prioritise polish on the hero, founder, and chapters sections.
