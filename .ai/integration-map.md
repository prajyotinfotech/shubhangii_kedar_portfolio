# Integration Map

## Practical Facts
- App stack: React, Vite, Express API, React Router
- Auth: Google OAuth admin login, JWT session, password fallback
- Data: GitHub Gist content.json as CMS database
- Services: Cloudinary media uploads, Spotify links/API, Web3Forms booking/contact, GitHub API
- Hosting: Vercel-ready
- Admin: admin panel, section-based CMS editing, image upload workflow

## Architecture Notes
Most connected parts: updateSection(), fetchSection(), uploadImage(), addItem().

## Reusable Areas
- Admin/CMS editing patterns
- Auth/session flow, with careful token and cookie review
- Media upload and asset delivery workflow
- Data model and migration/source-of-truth decisions

## Integration Questions
- Which exact feature should be reused or connected?
- Which project owns the source of truth after integration?
- Is this a UI reuse, API reuse, auth reuse, data migration, or live service integration?
- Which graphify god nodes or admin/API modules are involved?
