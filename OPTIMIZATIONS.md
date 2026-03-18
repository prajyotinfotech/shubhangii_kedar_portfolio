# Optimizations & Architecture

This document outlines the architecture, optimizations, and trade-offs in the Shubhangii Kedar Portfolio project.

---

## Architecture Overview

### The "Zero-Cost" Stack
The entire project runs for free:
- **Frontend**: Vite SPA → deployed to Vercel free tier (or GitHub Pages)
- **Backend**: Express.js → deployed as Vercel serverless function (free tier)
- **Database**: GitHub Gist (`content.json`) — read/write via GitHub API
- **Image CDN**: Cloudinary (free tier)
- **No traditional database, no paid hosting, no monthly costs.**

### Content Flow
```
[Admin Panel] → POST /api/content/:section (JWT auth)
  → Backend updates GitHub Gist via PATCH /gists/{id}
  → 30s server-side cache

[Public Site] → contentService.ts fetches Gist raw URL (?t=cache-buster)
  → 1-minute client-side cache
  → ContentContext provides data to all components
```

---

## 1. Backend Optimizations

### Rotating Backup System
**Location**: `backend/src/services/fileService.js`

- Creates timestamped backups before every content update
- Keeps last 5 versions in `backend/data/backups/`
- Prevents accidental content loss from admin edits

### Input Sanitization
**Location**: `backend/src/middleware/sanitize.js`

Strips dangerous content from all incoming requests:
- `<script>` / `<iframe>` tags
- `javascript:` URLs
- Inline event handlers (`onclick`, etc.)

### Rate Limiting
**Location**: `backend/src/middleware/rateLimit.js`

- 5 login attempts per 15-minute window
- Prevents brute-force attacks on admin credentials

### Caching
- 30-second in-memory cache on Gist reads to stay within GitHub API rate limits
- Cache invalidated on content updates

---

## 2. Frontend Optimizations

### Lazy Loading — Admin Panel
**Location**: `src/main.tsx`

All admin components (`/admin/*` routes) are lazy-loaded via `React.lazy()`. Regular visitors never download admin code.

**Impact**: ~40% reduction in initial bundle size.

### Error Boundaries
**Location**: `src/components/ErrorBoundary.tsx`

Wraps major sections to prevent a single component crash from taking down the whole page. Shows a user-friendly fallback instead of a white screen.

### Optimized Image Component
**Location**: `src/components/OptimizedImage.tsx`

- Native `loading="lazy"` for below-fold images
- Skeleton placeholder during load
- Fade-in animation on load complete
- Error fallback handling

### Device Detection
**Location**: `src/utils/deviceDetection.ts`

Detects device capabilities and adjusts rendering:
- Disables Three.js 3D effects on low-end devices
- Reduces animation complexity on mobile
- Adapts quality settings automatically

### React Compiler
Enabled via `babel-plugin-react-compiler` — automatic memoization of components and hooks without manual `useMemo`/`useCallback`.

---

## 3. Security

### Implemented
- **JWT Authentication** — 24h expiry, Bearer token for admin API
- **bcrypt** — Password hashing (salt rounds: 12)
- **Helmet.js** — Secure HTTP headers
- **CORS** — Restricted to `FRONTEND_URL` origin
- **Rate Limiting** — On auth endpoints
- **Input Sanitization** — XSS protection on all inputs

### Known Concerns
- `VITE_SPOTIFY_CLIENT_SECRET` is exposed in the frontend bundle — should be proxied through backend
- Default admin credentials in `.env` should be changed in production
- `VITE_ADMIN_PASSWORD` provides client-side-only validation (real auth is JWT/backend, but the value is visible in source)

---

## 4. Theme System
**Location**: Theme data stored in `content.json`, applied in `src/App.tsx`

The client can change via admin panel:
- Primary/secondary/accent colors
- Heading and body fonts
- Logo image and size

Colors are applied as CSS custom properties at runtime — no rebuild needed.

---

## 5. Key Technical Decisions

| Decision | Why |
|---|---|
| GitHub Gist as DB | Zero cost, built-in versioning, sufficient for a single-editor CMS |
| Admin panel in same SPA | No separate deployment, lazy-loaded so no cost to visitors |
| Vercel serverless backend | Free tier handles low-traffic admin operations well |
| Three.js for 3D mic | Client wanted premium visual feel; disabled on low-end devices |
| Dual animation libs (Framer Motion + GSAP) | Framer for React integration, GSAP for scroll-driven animations |
| Spotify integration | Artist wanted live music data (top tracks, playlists) on the site |

---

## 6. Update Log

### 2026-03-19 — Client Feedback Round

**Issues reported (from client call):**

1. Journey images visible locally but broken on deployed site
2. Journey milestones can only be deleted, not edited
3. Journey milestones need automatic year-wise sorting (earliest at top)
4. Admin credentials exposed in frontend code (`VITE_ADMIN_PASSWORD`)
5. Instagram reels won't play inline (redirect to Instagram); YouTube works fine
6. Instagram post embeds — image framing is off (half outside the frame)
7. Recent Releases not showing her actual songs
8. "Performed Across 25+ Cities" section needs to be editable and larger

**Changes made:**

| # | Issue | Fix | Files Changed |
|---|-------|-----|---------------|
| 2 | Milestones not editable | Added inline edit mode in admin with full field editing (title, year, description, side, color, image) using existing `PUT /api/content/:section/items/:itemId` backend endpoint | `src/admin/pages/sections/JourneyManager.tsx` |
| 3 | Milestones not sorted | Added ascending year sort in both admin (`loadContent`) and frontend (`VinylScrollPage.tsx` via `useMemo`) | `JourneyManager.tsx`, `VinylScrollPage.tsx` |
| 7 | Recent Releases empty | Music component now checks CMS `musicReleases` (from content.json/Gist) as a data source between Spotify API and static fallback. Priority: Spotify API > CMS content > static fallback | `src/components/Music.tsx` |
| Contact | Form was non-functional | Wired contact form to Web3Forms (free, no backend needed). Set `VITE_WEB3FORMS_KEY` in `.env`. Form now shows send status and resets on success | `src/components/Contact.tsx` |

**Still open / needs discussion:**

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| 1 | Journey images broken on deploy | Needs investigation | Static images use bundled imports (work). CMS images use URL strings — need to verify Cloudinary/upload URLs are accessible |
| 4 | Credentials in frontend | Open | `VITE_ADMIN_PASSWORD` in `.env` is visible in built JS. Options: (a) remove client-side check entirely and rely only on JWT, (b) move to backend-only validation |
| 5 | Instagram reels inline | Open | Instagram's oEmbed blocks autoplay in iframes. No clean workaround exists — Instagram intentionally redirects. Possible: show thumbnail + "Watch on Instagram" link instead |
| 6 | Instagram embed framing | Open | `react-social-media-embed` renders Instagram's native embed which has inconsistent sizing. May need custom CSS overrides or fixed-aspect-ratio container |
| 8 | Performance banner editable | Open | Needs admin UI for the `performanceBanner` section in content.json |

---

### Setup: Contact Form (Web3Forms)

1. Go to [web3forms.com](https://web3forms.com) and enter the destination email
2. They'll email an **access key**
3. Add to `.env`: `VITE_WEB3FORMS_KEY=your-access-key-here`
4. Redeploy — the contact form will now send emails to that address

---

## 7. Future Opportunities

- [ ] Move Spotify credentials to backend proxy
- [ ] Service worker for offline support
- [ ] Image compression pipeline before Cloudinary upload
- [ ] Optimize Three.js bundle (tree-shake unused modules)
- [ ] Consider SSG (e.g., Astro) for better SEO and faster initial load
- [ ] Add analytics (Plausible or similar, privacy-friendly)
- [ ] Make performance banner ("25+ Cities / 30,000+ Footfall") editable from admin
- [ ] Fix Instagram embed aspect ratio with fixed container

---

## 8. Testing

```bash
# Bundle analysis
npm run build && npx vite-bundle-visualizer

# Backend load test
npx autocannon -c 10 -d 30 http://localhost:3001/api/content

# Security audit
npm audit
```
