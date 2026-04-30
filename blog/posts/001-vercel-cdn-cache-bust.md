---
title: "The Images Were Fine Yesterday. Then We Deployed."
description: "A real debugging story: how a routine Vercel push silently killed browser caching for a live portfolio site and three small fixes that brought it back."
tags: ["webperf", "vercel", "debugging", "react"]
cover_image: ""
canonical_url: ""
published: true
series: "Dev Diary"
---

You know that specific kind of dread. Client messages you saying the site feels slow today and you have absolutely no idea why, because you didn't touch the images. You didn't touch anything visible. You just pushed a config fix yesterday.

That's exactly where this story starts.

---

## The Setup

A singer's portfolio site. Full-bleed hero images, a gallery grid, a journey timeline with milestone photos. The kind of site where visual impact *is* the product. Images aren't decoration — they're the first thing every visitor sees.

Stack: React plus Vite, deployed on Vercel. Backend is a lightweight Express CMS on the same Vercel org. Images range from portrait shots to concert stage photography, the kind that starts life as a RAW export and ends up, if you're lucky, under 3MB after setting up `vite-plugin-image-optimizer`.

The site had been loading well. Fast enough that nobody complained.

Then we pushed four commits in two days: a CORS fix, a favicon update, a new SVG logo, Google OAuth. Routine stuff.

And then: *"images are taking a couple of seconds to load now."*

---

**TLDR 1:** Every Vercel deployment invalidates its CDN edge cache. If your images have no Cache-Control headers, users re-download them cold on every visit after a deploy.

---

## The Investigation

First instinct: did someone accidentally revert the image optimizer config? Opened `vite.config.ts`. Still there. Running `du -sh dist/assets/*.png` confirmed it was working:

```
3.6M  PWP09949-D0L-SZu5.png   (was 14MB in src)
2.4M  1-DKgdkZL1.png           (was 9.7MB)
2.2M  consert1-BEXDj7Pa.png    (was 7.5MB)
```

Optimizer fine. Images compressed. So why slow?

Listed the dist folder more carefully and noticed something odd:

```
2.4M  1.png
2.4M  1-DKgdkZL1.png
940K  2.png
940K  2-CVmU2-CG.png
```

The same images were being served twice. One copy with a Vite-generated content hash (from `import img from '../assets/1.png'` in code), and one copy without a hash from `public/assets/`, used by the CMS via hardcoded paths like `/assets/1.png` in `content.json`.

That's when I opened `vercel.json`.

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Just a SPA rewrite. No headers. Nothing.

---

## The Root Cause

Here's how Vercel handles caching for static assets:

Files with content hashes in their name like `1-DKgdkZL1.png` get `Cache-Control: public, max-age=31536000, immutable` set automatically by Vercel. Once a user downloads it, their browser keeps it for a year.

Files without hashes like `1.png` from `public/` get Vercel's default: `Cache-Control: public, max-age=0, must-revalidate`. Browser never caches them. Re-downloaded on every single visit.

The non-hashed images were the journey timeline photos. Six milestone images totalling roughly 11MB that every visitor was downloading fresh on every visit.

But why was it fast before?

Because Vercel runs a CDN edge network. Even without browser cache headers, Vercel's own edge nodes cache responses close to the user. That edge cache is fast.

When you push a new deployment, Vercel invalidates the entire edge cache. The site has to be re-warmed. On a low-traffic portfolio site, that warm-up period is extended. Every visitor is that first visitor.

We had pushed four commits in two days. Four cache invalidations. The edge had never fully warmed up.

---

**TLDR 2:** Hashed assets get browser plus CDN cache and are safe forever. Non-hashed public/ assets get CDN cache only, wiped on every deploy. No headers configured means users always download from origin.

---

## The Bonus Bug

While tracing image paths I found something worse hiding in `content.json`. The gallery section had image paths like:

```json
{ "image": "/src/assets/backofthelatestR.png" }
{ "image": "/src/assets/consert1.png" }
```

`/src/assets/` does not exist in a Vite production build. The `src/` directory is never deployed. These images were silently 404-ing in production. The gallery tiles were showing broken images and nobody had noticed because the Cloudinary-hosted photos around them still looked fine.

This had been like this across multiple deploys. A good reminder that broken images fail silently unless you're actively watching the Network tab.

---

## The Three Fixes

**Fix 1: Cache headers in vercel.json**

```json
{
  "headers": [
    {
      "source": "/assets/(.*\\.(?:png|jpg|jpeg|webp|gif|svg|ico|woff|woff2|otf|ttf))",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=2592000, stale-while-revalidate=86400"
        }
      ]
    }
  ],
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

30-day browser cache for all static assets from the public/ folder. `stale-while-revalidate=86400` means browsers serve the cached version instantly while revalidating in the background.

**Fix 2: fetchPriority on the hero image**

```tsx
<img
  src={slide.image}
  loading={index === 0 ? 'eager' : 'lazy'}
  decoding={index === 0 ? 'sync' : 'async'}
  fetchPriority={index === 0 ? 'high' : 'auto'}
/>
```

The first hero slide was already eager plus sync but without `fetchPriority="high"` the browser still competes it against CSS, fonts, and JS at startup. This bumps it into the browser's critical fetch queue.

**Fix 3: The broken gallery paths**

Copied the missing images to `public/assets/` and updated all `/src/assets/` references in `content.json` to `/assets/`. Eight gallery entries fixed, all silently broken in production.

---

## What This Actually Taught Me

Always configure Cache-Control headers on Vercel for non-Next.js projects. Next.js handles this automatically for `/_next/static/`. For Vite or anything else on Vercel you're on your own. Add it to every project's `vercel.json` from day one.

Treat deployments as cache invalidation events. When your site suddenly gets slow after a deploy, check caching before checking code. The code almost certainly didn't change performance. The deploy nuked the warm CDN state.

`public/` assets and `src/assets/` play by different rules. Vite-imported assets get hashed and get long-term caching automatically. Public folder assets keep their original names and get none. Know which is which before your CMS starts mixing them.

Check your Network tab with cache disabled regularly. The broken `/src/assets/` gallery paths had been silently failing for multiple deploys. A 30-second check in DevTools with "Disable cache" on would have caught it immediately.

---

**Final TLDR:** Open `vercel.json` now. If there's no headers block, add one for `/assets/(.*)` with `max-age=2592000`. Add `fetchPriority="high"` to your hero image. Check your CMS content for any `/src/assets/` paths, they 404 in production. Deploy once. Users cache for 30 days.

---

*Dev Diary: real bugs from real projects, documented as they happen.*
