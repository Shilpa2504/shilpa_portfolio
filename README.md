# Shilpa Gupta — engineering portfolio

A standalone React + TypeScript + Vite website, built around Shilpa's supplied career and project information. Dark charcoal surfaces, violet/magenta highlights, self-hosted DM Sans and Manrope, layered Motion transitions, and a genuine Three.js orbital hero. Ambient animation can be paused and respects reduced-motion preferences; WebGL stops offscreen and while the document is hidden.

Section order: **Hero → About Me → Experience → Projects → Skills → Education → Certifications → Recognition & Awards → Contact**. The personal introduction focuses on software engineering, not an AI specialization. C# and .NET are included in the skills; provider-specific claims have been removed. Original project names/screenshots remain unchanged. The stats strip, About principles footer, project-comparison panel, and expanded NewsApp story panel were removed at the owner's request.

**This project is independent of the StudyMate backend and frontend. Neither application needs to run for the portfolio to work.**

## Run locally

Use Node.js 22 LTS and npm. In this portfolio folder:

1. Run `npm ci` to install the locked dependencies.
2. Run `npm run dev` and open http://localhost:5173.
3. Stop the server with Ctrl+C.

On Windows PowerShell, use `npm.cmd` instead of `npm` if PowerShell blocks script execution. A VS Code task named **Portfolio: development server** is included.

## Production build

- `npm run build` type-checks and creates the static production output in `dist`.
- `npm run preview` serves that build locally.
- No application backend or database is required to browse the portfolio. Direct email sending uses the optional serverless configuration below; without it, the message dialog clearly offers an email-app draft instead.

## Deploy

### Vercel (simplest)

1. Commit this portfolio folder to its own Git repository and import it into Vercel.
2. Select **Vite**. Build command: `npm run build`. Output directory: `dist`.
3. Set the public environment variable `VITE_SITE_URL` to the final HTTPS origin assigned to the site, then build/redeploy.
4. Vercel configuration is already supplied in [vercel.json](vercel.json).

### Netlify

Import the repository, use `npm run build` and publish `dist`. [netlify.toml](netlify.toml) supplies these settings. Set `VITE_SITE_URL` to the final HTTPS origin and redeploy.

This serves the portfolio only. The direct email endpoint supplied here targets Vercel; it must be ported to a Netlify Function before enabling direct sending on Netlify.

### Firebase Hosting

1. Create or choose a **new, appropriate Firebase project**. The old Firebase portfolio was a visual reference only; do not overwrite it inadvertently.
2. Install Firebase CLI with `npm install -g firebase-tools`, then run `firebase login`.
3. Set `VITE_SITE_URL` for the selected hosting domain, then run `npm run build`.
4. Run `firebase deploy --only hosting --project YOUR_FIREBASE_PROJECT_ID`, replacing the project ID with the one you selected.

[firebase.json](firebase.json) already points Hosting at `dist`. No default Firebase project is bound. Deployment requires the owner's hosting credentials and has **not** been performed automatically.

Firebase static hosting alone does not run the supplied Vercel email endpoint. The dialog still supports composing an email-app draft; direct delivery would require a separately configured server function.

## Recruiter message dialog and HTML email template

The **Talk to me** button opens a keyboard-accessible native dialog with name, email, optional company, message, consent, and a Send button. It is a message composer, not a chatbot. [server/email-template.mjs](server/email-template.mjs) defines the HTML email template and plain-text fallback. HTML alone cannot deliver an email.

### Enable direct sending on Vercel

1. Configure a Resend account with a verified sender domain. Create a send-only API key restricted to that domain.
2. Create a Cloudflare Turnstile widget restricted to the deployed portfolio hostname.
3. In **Vercel project settings → Environment Variables**, add the server-only values listed in [.env.example](.env.example):
	- `CONTACT_ORIGIN`: exact HTTPS site origin, with no trailing slash. Preview deployments need their own exact origin and Turnstile hostname.
	- `CONTACT_FROM`: a verified sender email address, without a display name.
	- `RESEND_API_KEY`: the restricted email service key.
	- `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`: the widget keys.
4. Redeploy. [api/contact.mjs](api/contact.mjs) runs as a serverless function; all messages go to **shilpakalwar25@gmail.com**. The visitor's email is used only as Reply-To, never as the sender or destination.
5. Configure a hosting firewall rate limit for `POST /api/contact` (for example, five requests per minute per IP), monitor mail quotas, and test a single real enquiry with consent. Check the email provider's delivery status and the inbox/spam folder.

The public settings response exposes only availability and the public widget key. Secrets must **never** have a `VITE_` prefix, be committed, or be placed in frontend code. The endpoint validates length/types, exact origin, consent, a honeypot, and a server-verified single-use Turnstile token including hostname/action. HTML is escaped, the inbox/subject are fixed, provider requests time out, and repeated retries use an idempotency key. The app does not store or log message bodies. Resend processes submitted contact details; Cloudflare provides spam protection, disclosed beside the form.

**Current limitation:** no service credentials or verified sender were supplied and no public deployment was performed. Direct inbox delivery has therefore not been activated or tested live. On the normal Vite development server, the form shows an explicit setup notice and disables direct Send. Its separate **Open email app instead** action prepares a draft; the recruiter must send it manually. It never reports that a draft was delivered. Server/client delivery contracts are tested using mocks, without emailing anyone.

When enabled, the success message means the provider **accepted the email for delivery**, not proof that it reached an inbox. Errors retain the visitor's draft. Closing the dialog discards its local contents; no local-storage copy is kept.

### Domain-aware SEO

Copy [.env.example](.env.example) to `.env.local` for local production builds, or configure `VITE_SITE_URL` in the hosting dashboard. Use the actual origin without a subdirectory. At build time, a configured domain generates:

- Absolute Open Graph and Twitter image URLs.
- Canonical URL and `og:url`.
- A sitemap and robots file referencing the final domain.

Without a final domain, the site builds normally with local social-image paths and no invented canonical URL. The PNG social image, semantic metadata, Person structured data, and page description are included. This site uses section anchors and modal case studies, so no SPA wildcard rewrite is needed.

## Supplied screenshots and portrait

The original images are integrated from [public/assets](public/assets), without renaming or rewriting them:

- **StudyMate.AI:** eight screenshots, including both light and dark dashboards, document assistance, document lists, quizzes, and history.
- **AI-Powered Pizzeria:** ten screenshots showing the assistant, home, menu, Meal Builder, and authentication.
- **Portrait:** the supplied outdoor photograph is used in the hero.
- **NewsApp:** no original screenshot was supplied. Its interactive **concept preview** is explicitly labelled, with illustrative content, search, categories, and bookmarks. It is not a live news service; demo bookmarks reset when the case study closes.

[scripts/supplied-assets.mjs](scripts/supplied-assets.mjs) maps the visually inspected originals to factual captions and meaningful alt text. [scripts/media-manifest.mjs](scripts/media-manifest.mjs) supplies those mappings to [src/data.ts](src/data.ts). The first image becomes each project-card preview; all images appear in the thumbnail-accessible case-study gallery. Development watches both asset folders; production builds detect the files afresh.

For optional future replacements, see [public/uploads/README.md](public/uploads/README.md). No additional uploads or renaming are needed for the current portfolio.

Images are displayed unchanged with `object-fit: contain`, meaningful alt text, asynchronous decoding, and lazy loading on cards. No crop, filter, or product UI redesign is applied to supplied screenshots. Preserve aspect ratio when creating optional optimized WebP versions.

## Resume

Both resume actions use the actual supplied [public/assets/shilpa_Gupta.pdf](public/assets/shilpa_Gupta.pdf). The original is served unchanged, not reconstructed or generated from portfolio text. Review public documents before deployment.

`npm run generate:assets` regenerates **only the social-preview PNG** and never overwrites the supplied resume. Asset generation needs a Playwright-compatible browser; ordinary builds/deployments do not require browser installation.

## Validation

- `npm test`: content, factual data, URLs, screenshot mappings, metadata, contact validation, escaped email templates, bot verification, and provider failure checks. No real email is sent.
- `npm run test:e2e`: navigation, section order, removed panels, modal focus, concept interactions, contact success/error/unconfigured states, WebGL/pause/reduced motion, original assets, mobile overflow, and axe WCAG A/AA scans.
- First-time browser setup: `npx playwright install chromium`.
- If the browser download is blocked, use installed Chrome or Edge. In PowerShell: `$env:PLAYWRIGHT_CHANNEL='chrome'` (or `'msedge'`), then run the browser tests or asset generator.

Automated accessibility checks supplement, rather than replace, keyboard and screen-reader review. Tests don't log into external demos or validate their backend functionality.

## Content and components

| File | Purpose |
| --- | --- |
| [src/data.ts](src/data.ts) | Career facts, links, screenshots, case-study content |
| [src/App.tsx](src/App.tsx) | Portfolio sections, navigation, contact interactions |
| [src/components/Visuals.tsx](src/components/Visuals.tsx) | Architecture illustrations and labelled NewsApp concept |
| [src/components/CaseStudy.tsx](src/components/CaseStudy.tsx) | Lazy-loaded native dialogs, galleries, technical flows |
| [src/styles.css](src/styles.css) | Design system, responsive layouts, reduced-motion rules |
| [src/dark.css](src/dark.css) | Current dark visual system, project showcases, and animated workflows |
| [src/refinements.css](src/refinements.css) | Updated layouts, additional motion, and chat-style contact form |
| [src/components/PageMotion.tsx](src/components/PageMotion.tsx) | Scroll progress and event-driven pointer highlights |
| [src/components/ContactDialog.tsx](src/components/ContactDialog.tsx) | Lazy native recruiter message dialog |
| [server/email-template.mjs](server/email-template.mjs) | Escaped HTML and plain-text email templates |
| [api/contact.mjs](api/contact.mjs) | Fixed-recipient, server-only email delivery |
| [src/components/HeroPortrait.tsx](src/components/HeroPortrait.tsx) | Actual portrait and floating technology labels |
| [src/components/EngineeringScene.tsx](src/components/EngineeringScene.tsx) | Lazy Three.js scene with pause, fallback, and resource cleanup |
| [scripts/supplied-assets.mjs](scripts/supplied-assets.mjs) | Original screenshot, portrait, and resume mappings |
| [public/assets/shilpa_Gupta.pdf](public/assets/shilpa_Gupta.pdf) | Supplied original resume |
| [vite.config.ts](vite.config.ts) | Build and domain-aware SEO |

StudyMate and Pizzeria GitHub links were verified on the supplied GitHub account. No NewsApp live/source link is inferred: the older reference portfolio describes a different React implementation, while this portfolio follows the user's supplied Angular project brief.

No invented metrics, testimonials, clients, employers, or achievements. Fonts are self-hosted; there are no analytics trackers or frontend secret keys. The only optional external widget is Turnstile, loaded when a configured contact dialog opens.