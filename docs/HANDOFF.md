# EAEF Website: session handoff

Everything a new Claude Code session needs to pick up this project. Written 2026-11-02.

## Who and what
- User: Abdallah (GitHub `A56-G`, abdallahelgezawy@gmail.com). Speaks Egyptian Arabic; reply in Arabic.
- Company: **Eastern Aluminum Extrusion Factory (EAEF)**, مصنع الشرقية لسحب الألمنيوم, Dammam, Saudi Arabia.
- Goal: new company website, to replace the current site at **https://easternextrusion.com**, hosted on **cPanel** (https://easternextrusion.com/cpanel). NOT Render.

## Repo
- https://github.com/A56-G/eaef-website (private), branch `main`. Everything is committed and pushed.
- Stack: Vite + vanilla JS, GSAP + ScrollTrigger, Lenis. Bilingual EN/AR with RTL.
  - `index.html`: page content (English text, each translatable element has `data-i18n="key"`)
  - `src/i18n/ar.js`: Arabic strings keyed the same
  - `src/main.js`: language switch, animations, quote/catalog form
  - `src/styles/main.css`: design (later sections at the bottom override earlier ones)
  - `public/img/plant/*.jpg` (34 real plant photos + `photos.json` with EN/AR alt text), `public/img/certs/*.jpg` (8 certificates), logos
  - `public/.htaccess`: HTTPS redirect, compression, caching (copied into `dist/` by the build)
  - `hero.html`: standalone version of the video hero (reference only)
- Build: `npm ci && npm run build` → `dist/`. `vite.config.js` uses `base: './'` so `dist/` works at the domain root.
- Preview link (Claude artifact, may lag behind): https://claude.ai/artifact/JUSNaBmZVGR2a2xw1aQ6kU

## NEXT STEP: deploy to cPanel (what the user wants now)
The user wants to do this together with you in their own Chrome (Claude in Chrome). They log in to cPanel themselves; never ask for or type their password.
1. Build locally: clone the repo, `npm ci && npm run build`, then zip the **contents** of `dist/` (including the hidden `.htaccess`) into `eaef-website-cpanel.zip`. The user may also already have that ZIP in Downloads from the previous session.
2. In cPanel → File Manager → `public_html`:
   - Settings → enable **Show Hidden Files**.
   - **Back up first**: select everything → Compress → `old-site-backup.zip` → download it to the PC.
   - Delete the old site files (keep `old-site-backup.zip`, `.well-known`, `cgi-bin`).
   - Upload `eaef-website-cpanel.zip`, then Extract into `public_html` itself (index.html must sit directly in public_html).
3. Open https://easternextrusion.com and check: hero video plays, Arabic switch works, no broken images.
4. Do not touch DNS, MX or email settings.
- Rollback: delete new files, extract `old-site-backup.zip`.

## Decisions already made (do not reopen)
- Capacity figure removed (sources conflicted: 40,000 vs 20,000 t). Stats show years, 4 presses, 450+ people, 250+ customers.
- Founded 2009. Street 111. Extrusion only (no fabrication/installation).
- **No anodizing at all.**
- Plant 1 (2nd Industrial City): head office, 1 × 8-inch press, **horizontal** powder coating (QUALICOAT).
- Plant 2 (3rd Industrial City): 2 × 6-inch + 1 × 10-inch press, **vertical** powder coating, **thermal break line**.
- 10-inch press (the fourth) started trial operation in **2026**.
- Arabic term for profiles is **قطاعات** everywhere (not مقاطع). English uses American spelling (aluminum, catalog, license).
- Hero: background video (CloudFront URL in index.html), headline "We came / to change / the world of / aluminum." / "جئنا لنغيّر عالم الألمنيوم."; whole site follows the hero's style (near-black, cream, condensed caps, centered axis, mirrored blocks).
- Thermal break visual is a hand-drawn bilingual SVG (the supplied photo was 244px and too blurry).
- Sales contact: **Fahad Al-Sanea · Sales & Marketing Manager**, fahad@easternextrusion.com (replaced Kifayat Kamruddin). Second sales contact Jaime John.

## Open items
- **WhatsApp button** still opens Kifayat's number (+966 59 273 5070). Waiting for the user to give Fahad's or the company WhatsApp number (`index.html`, the `.wa` link).
- **Quote/catalog form** posts to FormSubmit → info@easternextrusion.com. After going live, the first real submission sends an activation email to that inbox; someone must click "Activate Form".
- A Render static site was created by mistake (https://eaef-website.onrender.com). User should delete it from the Render dashboard (Settings → Delete Service); the Render MCP cannot delete.
- Missing content: client logos, year of the "How thermal break works" article (currently labelled "Guide").

## Source material
- `C:\Users\eaefa\OneDrive\Desktop\EAEF-Files` on the user's PC: 413 photos (`aluminium factory\2nd` = Plant 1, `\3rd` = Plant 2), company profile PDF/PPTX, 2025/2026 pre-qualification PDFs (2026 is the most current), certificates. IBAN/bank letters must never go on the site.
