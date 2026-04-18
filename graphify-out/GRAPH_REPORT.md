# Graph Report - /home/raviraj/Prajyot/pranya/Shubhangii-Kedar-Portfolio  (2026-04-18)

## Corpus Check
- 65 files · ~3,613,438 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 251 nodes · 324 edges · 54 communities detected
- Extraction: 81% EXTRACTED · 19% INFERRED · 0% AMBIGUOUS · INFERRED: 61 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]

## God Nodes (most connected - your core abstractions)
1. `updateSection()` - 23 edges
2. `fetchSection()` - 13 edges
3. `uploadImage()` - 11 edges
4. `handleResponse()` - 10 edges
5. `addItem()` - 10 edges
6. `deleteItem()` - 10 edges
7. `loadItems()` - 8 edges
8. `loadReleases()` - 7 edges
9. `loadItems()` - 7 edges
10. `getAuthHeaders()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `handleMoveUp()` --calls--> `updateSection()`  [INFERRED]
  /home/raviraj/Prajyot/pranya/Shubhangii-Kedar-Portfolio/src/admin/pages/sections/SongListManager.tsx → /home/raviraj/Prajyot/pranya/Shubhangii-Kedar-Portfolio/src/admin/api/client.ts
- `handleMoveDown()` --calls--> `updateSection()`  [INFERRED]
  /home/raviraj/Prajyot/pranya/Shubhangii-Kedar-Portfolio/src/admin/pages/sections/SongListManager.tsx → /home/raviraj/Prajyot/pranya/Shubhangii-Kedar-Portfolio/src/admin/api/client.ts
- `handleThumbnailUpload()` --calls--> `uploadImage()`  [INFERRED]
  /home/raviraj/Prajyot/pranya/Shubhangii-Kedar-Portfolio/src/admin/pages/sections/SongListManager.tsx → /home/raviraj/Prajyot/pranya/Shubhangii-Kedar-Portfolio/src/admin/api/client.ts
- `handleSavePageHeader()` --calls--> `updateSection()`  [INFERRED]
  /home/raviraj/Prajyot/pranya/Shubhangii-Kedar-Portfolio/src/admin/pages/sections/JourneyManager.tsx → /home/raviraj/Prajyot/pranya/Shubhangii-Kedar-Portfolio/src/admin/api/client.ts
- `handleSaveSteps()` --calls--> `updateSection()`  [INFERRED]
  /home/raviraj/Prajyot/pranya/Shubhangii-Kedar-Portfolio/src/admin/pages/sections/JourneyManager.tsx → /home/raviraj/Prajyot/pranya/Shubhangii-Kedar-Portfolio/src/admin/api/client.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.11
Nodes (11): handleImageUpload(), handleShowImageUpload(), handleSubmit(), uploadImage(), handleImageUpload(), handleImageUpload(), handleImageUpload(), handleImageUpload() (+3 more)

### Community 1 - "Community 1"
Cohesion: 0.22
Nodes (14): updateSection(), confirmDelete(), handleAdd(), handleDelete(), handleMoveDown(), handleMoveUp(), handleUpdate(), loadItems() (+6 more)

### Community 2 - "Community 2"
Cohesion: 0.27
Nodes (12): loadStats(), addItem(), deleteImage(), deleteItem(), fetchContent(), getAuthHeaders(), handleResponse(), listImages() (+4 more)

### Community 3 - "Community 3"
Cohesion: 0.21
Nodes (7): handleAdd(), handleDelete(), handleMoveDown(), handleMoveUp(), handleThumbnailUpload(), handleUpdate(), loadItems()

### Community 4 - "Community 4"
Cohesion: 0.21
Nodes (6): handleAddMilestone(), handleDeleteMilestone(), handleSaveEditMilestone(), handleSavePageHeader(), handleSaveSteps(), loadContent()

### Community 5 - "Community 5"
Cohesion: 0.21
Nodes (9): loadContent(), fetchSection(), handleSubmit(), loadContent(), handleAdd(), handleDelete(), handleUpdate(), loadEvents() (+1 more)

### Community 6 - "Community 6"
Cohesion: 0.36
Nodes (9): addItem(), deleteItem(), getHeaders(), initializeContent(), readContent(), updateItem(), updateSection(), writeContent() (+1 more)

### Community 7 - "Community 7"
Cohesion: 0.29
Nodes (9): clamp(), onPointerMove(), onPointerUp(), onResize(), onScroll(), smoothScrollTo(), snapToNearest(), startInertia() (+1 more)

### Community 8 - "Community 8"
Cohesion: 0.29
Nodes (6): encode(), handleSubmit(), base64UrlEncode(), beginLogin(), createCodeVerifier(), sha256()

### Community 9 - "Community 9"
Cohesion: 0.31
Nodes (5): ContentFetchError, fetchContent(), fetchSection(), readPersistentCache(), writePersistentCache()

### Community 10 - "Community 10"
Cohesion: 0.39
Nodes (4): goToSlide(), nextSlide(), onTouchEnd(), prevSlide()

### Community 11 - "Community 11"
Cohesion: 0.29
Nodes (3): handleImageUpload(), handleSlideChange(), handleSubmit()

### Community 12 - "Community 12"
Cohesion: 0.43
Nodes (6): handleAdd(), handleDelete(), handleMoveDown(), handleMoveUp(), handleUpdate(), loadItems()

### Community 13 - "Community 13"
Cohesion: 0.29
Nodes (0): 

### Community 14 - "Community 14"
Cohesion: 0.29
Nodes (3): useAdminAuth(), AdminLayout(), AdminSidebar()

### Community 15 - "Community 15"
Cohesion: 0.53
Nodes (4): getDeviceInfo(), getQualitySettings(), isLowEndDevice(), shouldDisableHeavyEffects()

### Community 16 - "Community 16"
Cohesion: 0.4
Nodes (2): useContentContext(), JourneyPage()

### Community 17 - "Community 17"
Cohesion: 0.83
Nodes (3): sanitizeInput(), sanitizeObject(), sanitizeString()

### Community 18 - "Community 18"
Cohesion: 0.5
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 0.67
Nodes (2): getInstagramPostId(), InstagramTestimonialEmbed()

### Community 20 - "Community 20"
Cohesion: 0.5
Nodes (0): 

### Community 21 - "Community 21"
Cohesion: 0.5
Nodes (0): 

### Community 22 - "Community 22"
Cohesion: 0.67
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 0.67
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 0.67
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 0.67
Nodes (0): 

### Community 26 - "Community 26"
Cohesion: 0.67
Nodes (0): 

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Community 32"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Community 33"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Community 35"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Community 36"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "Community 37"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (0): 

### Community 39 - "Community 39"
Cohesion: 1.0
Nodes (0): 

### Community 40 - "Community 40"
Cohesion: 1.0
Nodes (0): 

### Community 41 - "Community 41"
Cohesion: 1.0
Nodes (0): 

### Community 42 - "Community 42"
Cohesion: 1.0
Nodes (0): 

### Community 43 - "Community 43"
Cohesion: 1.0
Nodes (0): 

### Community 44 - "Community 44"
Cohesion: 1.0
Nodes (0): 

### Community 45 - "Community 45"
Cohesion: 1.0
Nodes (0): 

### Community 46 - "Community 46"
Cohesion: 1.0
Nodes (0): 

### Community 47 - "Community 47"
Cohesion: 1.0
Nodes (0): 

### Community 48 - "Community 48"
Cohesion: 1.0
Nodes (0): 

### Community 49 - "Community 49"
Cohesion: 1.0
Nodes (0): 

### Community 50 - "Community 50"
Cohesion: 1.0
Nodes (0): 

### Community 51 - "Community 51"
Cohesion: 1.0
Nodes (0): 

### Community 52 - "Community 52"
Cohesion: 1.0
Nodes (0): 

### Community 53 - "Community 53"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 27`** (2 nodes): `initializePassword()`, `auth.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (2 nodes): `errorHandler()`, `errorHandler.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (2 nodes): `useScrollReveal.ts`, `useScrollReveal()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (2 nodes): `FeatureBar()`, `FeatureBar.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (2 nodes): `JourneyAurora.tsx`, `CameraRail()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (2 nodes): `handleSubmit()`, `Contact.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (2 nodes): `Newsletter.tsx`, `handleSubmit()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (2 nodes): `VinylScrollPage.tsx`, `handleScroll()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (2 nodes): `JourneyTimeline.tsx`, `handleScroll()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (2 nodes): `RichTextField.tsx`, `handleChange()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (2 nodes): `handleSubmit()`, `AdminLogin.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (1 nodes): `vite.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (1 nodes): `eslint.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (1 nodes): `index.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (1 nodes): `content.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (1 nodes): `upload.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (1 nodes): `index.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (1 nodes): `rateLimit.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (1 nodes): `StatsShowcase.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (1 nodes): `Footer.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (1 nodes): `CountUp.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (1 nodes): `Icon.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (1 nodes): `Events.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (1 nodes): `About.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (1 nodes): `Journey.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (1 nodes): `TheShow.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (1 nodes): `content.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `updateSection()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 11`, `Community 12`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Why does `fetchSection()` connect `Community 5` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 12`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `uploadImage()` connect `Community 0` to `Community 11`, `Community 2`, `Community 3`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Are the 20 inferred relationships involving `updateSection()` (e.g. with `handleUpdate()` and `handleMoveUp()`) actually correct?**
  _`updateSection()` has 20 INFERRED edges - model-reasoned connections that need verification._
- **Are the 11 inferred relationships involving `fetchSection()` (e.g. with `loadItems()` and `loadContent()`) actually correct?**
  _`fetchSection()` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 9 inferred relationships involving `uploadImage()` (e.g. with `handleThumbnailUpload()` and `handleImageUpload()`) actually correct?**
  _`uploadImage()` has 9 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `addItem()` (e.g. with `handleAdd()` and `handleAddMilestone()`) actually correct?**
  _`addItem()` has 7 INFERRED edges - model-reasoned connections that need verification._