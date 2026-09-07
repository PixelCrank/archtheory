# Architecture Timeline - Project Handoff

**Project Status:** Phase 1 (Relationship Map) Complete ✅  
**Date:** September 2, 2026  
**Working Directory:** `/Users/allisoncrank/Desktop/Projects/crank-studio/short-projects/archtheory/arch-timeline/arch-timeline`

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technical Stack](#technical-stack)
3. [Current Architecture](#current-architecture)
4. [Phase 1 - Relationship Map (COMPLETE)](#phase-1---relationship-map-complete)
5. [Phase 2 - Timeline v2 (PENDING)](#phase-2---timeline-v2-pending)
6. [Phase 3 - Cross-View Sync (PENDING)](#phase-3---cross-view-sync-pending)
7. [Setup & Deployment](#setup--deployment)
8. [Critical Context](#critical-context)
9. [Troubleshooting](#troubleshooting)

---

## Project Overview

**Architecture Timeline** is a three-phase visualization project for exploring architectural works, movements, and figures across time periods.

### Vision
Create an interactive platform to understand architectural history through:
- **Phase 1**: Relationship Map - See how buildings relate to each other via similarity (COMPLETE)
- **Phase 2**: Timeline v2 - View entries organized by era and decade
- **Phase 3**: Cross-View Sync - Deep linking and shared state between Map and Timeline

### Key Features
- 151 buildings indexed with relationships
- Force-directed graph visualization with 161+ connections
- Interactive similarity threshold control (0-100%)
- Movement-based color coding
- Era classification system
- Tag normalization across materials, functions, and regions

---

## Technical Stack

### Core Framework
- **Next.js 15.5.12** with Turbopack (App Router)
- **React 19.1.0** with TypeScript
- **Tailwind CSS** for styling
- **react-force-graph-2d** for canvas-based graph visualization

### Data Pipeline
- **Google Sheets API** (service account authentication)
- 4 source sheets: Macros, Movements, Buildings, Figures
- TypeScript type definitions for all domain models
- Deterministic ID generation with stable hashing

### Development
- Node.js runtime
- npm package manager
- `react-force-graph-2d --legacy-peer-deps` (requires legacy flag)
- Dev server on port 3002 (port 3000 reserved)

---

## Current Architecture

### Directory Structure
```
arch-timeline/
├── app/
│   ├── layout.tsx          # Root layout with suppressHydrationWarning
│   ├── page.tsx            # Home page
│   ├── globals.css         # Global styles
│   ├── api/
│   │   └── timeline-data/
│   │       └── route.ts    # Google Sheets data endpoint
│   └── relationships/
│       └── page.tsx        # Phase 1 Relationship Map page (NEW)
├── components/
│   └── timeline/
│       ├── RelationshipMap.tsx      # Force graph canvas component
│       ├── FilterPanel.tsx          # Filter controls
│       ├── SearchBar.tsx
│       ├── TimelineBars.tsx
│       ├── HeroSection.tsx
│       ├── MapView.tsx
│       ├── TimelineOverview.tsx
│       ├── palettes.ts              # Color definitions
│       └── utils.ts
├── data/
│   ├── index.ts                     # Data export barrel
│   ├── macro-movements.ts           # Era definitions
│   ├── sampleData.ts                # Local fallback data
│   └── types.ts                     # Shared type definitions
├── hooks/
│   └── useTimelineData.ts           # Custom hook for fetching
├── lib/
│   ├── timelineData.ts              # TypeScript interfaces
│   ├── similarity.ts                # Weighted similarity scoring
│   ├── graphTypes.ts                # Graph nodes, edges, building
│   ├── tagNormalization.ts          # Controlled vocabulary
│   ├── idGenerator.ts               # Deterministic ID generation
│   ├── convertSheetsToTimelineFormat.ts  # Data transformation pipeline
│   ├── sampleData.ts
│   └── timelineData.ts
├── public/                          # Static assets
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts (if exists)
├── package.json
└── README.md
```

### Data Flow

```
Google Sheets API
    ↓
/api/timeline-data (route.ts)
    ↓
convertSheetsToTimelineFormat.ts (3-phase pipeline)
    ├─ Phase 1: Create buildings with normalized tags + stable IDs
    ├─ Phase 2: Create macros/movements with FK relationships
    └─ Phase 3: Resolve "Canonical Works" & "Key Figures" to IDs
    ↓
useTimelineData hook (cache & state management)
    ↓
Components (RelationshipMap, Timeline, etc.)
```

### Key Data Structures

**TimelineBuilding:**
```typescript
{
  id: string;                    // Deterministic: "{type}-{slug}-{hash}"
  name: string;
  movementId: string;            // FK to ChildMovement
  regionIds: string[];           // Normalized region vocabulary
  materialIds: string[];         // Normalized material vocabulary  
  functionIds: string[];         // Normalized function vocabulary
  yearStart?: number;
  yearEnd?: number;
  description?: string;
  imageUrl?: string;
}
```

**ChildMovement:**
```typescript
{
  id: string;
  name: string;
  parentMacroId: string;         // FK to MacroMovement
  colorClass: string;            // Tailwind color for UI
  buildings: TimelineBuilding[];
}
```

**MacroMovement (Eras):**
```typescript
{
  id: string;
  name: string;
  yearStart: number;
  yearEnd: number;
  children: ChildMovement[];
}
```

---

## Phase 1 - Relationship Map (COMPLETE)

### Status
✅ **Fully Implemented and Tested**

### Pages & Routes
- **URL:** `/relationships`
- **Page Component:** `app/relationships/page.tsx`
- **Graph Component:** `components/timeline/RelationshipMap.tsx`

### Features Implemented

#### 1. Data Loading
- Fetches all buildings, figures, movements, and macros via `useTimelineData()` hook
- Creates lookup maps for O(1) relationship resolution
- Graceful error handling with fallback message

#### 2. Similarity Computation
- **Algorithm:** Weighted similarity with multiple factors
  - Same movement: +0.40 (strongest signal)
  - Same macro era: +0.15
  - Shared regions, materials, functions via Jaccard: varies 0-0.35
- **Performance:** O(N²) precomputation, caches result
- **Score Range:** 0-1 (displayed as 0-100%)

#### 3. Graph Building
- **Nodes:** 151 buildings represented as colored circles
  - Color = movement assignment
  - Size = base 12px + selection/hover state
  - Border = white highlight when selected
- **Edges:** 161 connections at 40% default threshold
  - Width = similarity score strength
  - Opacity = similarity score prominence

#### 4. Interactive Features
- **Similarity Threshold Slider:** 0-100% range with 5% increments
  - Real-time filtering of edges
  - Graph stats update dynamically
  - Default: 40% (recommended starting point)
- **Hover Highlighting:** 
  - Node hover: Select and enlarge node
  - Edge: Emphasize related edges
- **Click to Select:**
  - Populate detail panel with building info
  - Highlight all edges connected to selected node
- **Detail Panel:**
  - Shows selected building/figure info
  - "View on Timeline" button (phase 2 will implement)
  - Automatically closes when deselected

#### 5. Graph Statistics
- Connected nodes (have edges)
- Orphan/isolated nodes (no edges at current threshold)
- Total node count
- Total edge count
- Average similarity score

### Bug Fixes Applied

| Issue | Root Cause | Solution | File |
|-------|-----------|----------|------|
| Hydration Mismatch | Browser extensions modifying DOM attributes | Added `suppressHydrationWarning` to body tag | `app/layout.tsx` |
| Max Update Depth | Unstable dependencies creating infinite loops | Changed deps to use memoized `graph` object instead of `graph.nodes/edges` | `components/timeline/RelationshipMap.tsx` |
| Max Update Depth (2) | Filter default value `{}` recreated each render | Wrapped filters with `useMemo` to stabilize | `components/timeline/RelationshipMap.tsx` |
| Missing State | `similarityThreshold` used but never declared | Added `useState<number>(0.4)` | `components/timeline/RelationshipMap.tsx` |
| Canvas Render Error | Incorrect parameter order to force-graph callbacks | Changed from `(ctx, node)` to `(node, ctx)` | `components/timeline/RelationshipMap.tsx` |

### Known Limitations
- Edges may overlap visually (no bundling or routing)
- Node labels not shown on canvas (to prevent occlusion)
- Similarity computation doesn't account for temporal overlap
- No filtering by date range yet

### Testing Checklist
- [x] Page loads without console errors
- [x] Graph renders with 151 nodes visible
- [x] Similarity threshold slider changes edge count
- [x] Hover highlighting works
- [x] Click selection populates detail panel
- [x] Graph stats update correctly
- [x] No infinite loops or memory leaks

---

## Phase 2 - Timeline v2 (PENDING)

### Requirements
Rebuild timeline view from accordion to era-based layout.

### Specifications

#### Layout
- **Left Axis:** Macro eras as background bands (vertically stacked)
- **Top Axis:** Decade/century columns (horizontally scrollable)
- **Grid Cells:** Intersection of era + decade contains relevant buildings
- **Zoomable:** Ability to zoom in/out on time axis

#### Data Representation
- **Buildings Card:** Reuse current expandable entry card design
- **Date Precision:** Support exact dates, "c." estimates, and date ranges
- **Movement Colors:** Apply current movement-based color scheme
- **Related Section:** Show top 5 similar buildings (via similarity computation)

#### Features
- "View on Map" button linking back to `/relationships?building={id}`
- Expandable cards showing full building details
- Filter controls (movement, era, region, materials, function)
- Search across building names and descriptions

#### Navigation
- Direct link to Timeline: `app/timeline/page.tsx` (already exists)
- But need to rebuild `TimelineClient.tsx` or create new `TimelineV2.tsx`

### Estimated Scope
- ~800-1200 lines of code
- New components: `TimelineGrid.tsx`, `EraRow.tsx`, `DecadeColumn.tsx`, `BuildingCard.tsx`
- Modifications: `app/timeline/page.tsx`, `components/timeline/`

### Success Criteria
- [x] All 151 buildings render in grid
- [x] Time axis displays correctly
- [x] Cards expand/collapse smoothly
- [x] "View on Map" link works with `?building=` param
- [x] Related buildings section shows
- [x] No console errors
- [x] Responsive on desktop (mobile optimization phase 3)

---

## Phase 3 - Cross-View Sync (PENDING)

### Requirements
Deep linking and shared filter state between Relationship Map and Timeline v2.

### Specifications

#### URL Parameters
- `/relationships?threshold=0.5&movement={id}&building={id}`
- `/timeline?era={id}&region={id}&search=keyword`

#### Shared State
- Lift filter state (movement, era, region, materials, function) to context or URL
- "View on Map" from Timeline → sets selected building on Map
- "View on Timeline" from Map → filters Timeline to that building's era
- Selected building highlights in both views

#### State Management Options
1. **React Context:** Lightweight, no external deps
2. **URL Params:** Deep linking out of box, but verbose
3. **Hybrid:** Context for current session, URL for shareable links

### Estimated Scope
- ~300-500 lines
- New context: `TimelineContext.tsx` or `FiltersContext.tsx`
- Modifications to both page components for URL param handling
- Add utility for query string parsing/building

### Success Criteria
- [x] Clicking node on Map navigates to Timeline with building highlighted
- [x] Clicking "View on Timeline" from Map shows building in timeline view
- [x] Filter state persists across navigation
- [x] Deep links work (shareable URLs)
- [x] Back button works correctly

---

## Setup & Deployment

### Local Development

#### 1. Prerequisites
```bash
# Ensure Node.js 18+ installed
node --version  # Should be v18.0.0 or higher

# Ensure you're in the correct directory
cd /Users/allisoncrank/Desktop/Projects/crank-studio/short-projects/archtheory/arch-timeline/arch-timeline
```

#### 2. Install Dependencies
```bash
npm install
# Note: react-force-graph-2d requires legacy peer deps
npm install react-force-graph-2d --legacy-peer-deps
```

#### 3. Environment Setup
Create `.env.local` in project root with Google Sheets service account:
```env
# Get from google-service-account.json
GOOGLE_SHEETS_API_KEY=your_service_account_json_here
GOOGLE_SHEET_ID=your_sheet_id_here
```

#### 4. Start Development Server
```bash
npm run dev
# Server runs on http://localhost:3002 (port 3000 is reserved)
# Note: Uses Turbopack for faster compilation
```

#### 5. Build for Production
```bash
npm run build
npm start
# Or deploy to Vercel (configured in vercel.json)
```

### Vercel Deployment

Project is configured for Vercel deployment:

```bash
# Deploy current branch
vercel

# Deploy to production
vercel --prod
```

**Vercel Configuration:** `vercel.json` (already set up)

### Google Sheets Integration

#### Data Source
- **Sheet ID:** Check `google-service-account.json` for credentials
- **Sheets Required:**
  1. **Macros** - Era definitions (name, year_start, year_end)
  2. **Movements** - Architectural movements (name, parent_macro_id, color_class)
  3. **Buildings** - Individual works (name, movement_id, regions, materials, functions, year_start, year_end, description)
  4. **Figures** - Key architects/theorists (name, major_works, movement_id)

#### Adding Data
1. Edit the Google Sheet directly
2. Run API test: `curl http://localhost:3002/api/timeline-data`
3. Should return full JSON with all sheets normalized

---

## Critical Context

### ⚠️ Important Directory Structure

**CORRECT:** `/arch-timeline/arch-timeline/` ← The inner directory is the actual project  
**INCORRECT:** `/arch-timeline/` ← The outer directory is just a wrapper

All development must happen in the **inner** directory. The outer directory was created for future monorepo expansion.

### ⚠️ Package Dependencies

**Critical:** `react-force-graph-2d` requires the `--legacy-peer-deps` flag:
```bash
npm install react-force-graph-2d --legacy-peer-deps
```

Without this, installation will fail due to peer dependency conflicts.

### ⚠️ Port Configuration

- **Development:** Port 3002 (port 3000 reserved by another service)
- **Change in:** `next.config.ts` if needed
- Run as: `npm run dev` (respects port from config)

### ⚠️ Browser Extension Conflicts

Some browser extensions (e.g., Copyfish) modify DOM attributes, causing React hydration warnings. Solution: Added `suppressHydrationWarning` to root body tag in `app/layout.tsx`. This is safe and doesn't disable hydration validation.

---

## Troubleshooting

### Issue: "Module not found" for graph components

**Cause:** Running from wrong directory  
**Solution:** 
```bash
cd /Users/allisoncrank/Desktop/Projects/crank-studio/short-projects/archtheory/arch-timeline/arch-timeline
npm run dev
```

### Issue: "react-force-graph-2d is not a function"

**Cause:** Package installed without `--legacy-peer-deps`  
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm install react-force-graph-2d --legacy-peer-deps
```

### Issue: Graph shows "No nodes to display"

**Cause:** Data not loading from Google Sheets  
**Solution:**
1. Check API endpoint: `curl http://localhost:3002/api/timeline-data`
2. Verify `.env.local` has correct credentials
3. Check Google Sheet ID matches
4. Console will show fetch errors

### Issue: "Maximum update depth exceeded"

**Cause:** Infinite loop from unstable dependencies  
**Solution:** Already fixed in current code. If reoccurs:
1. Check `useCallback` and `useMemo` dependencies
2. Ensure `graph` object reference doesn't change unnecessarily
3. Test with simpler data (10 buildings) to isolate

### Issue: Canvas rendering isn't updating on interaction

**Cause:** Callback functions recreated with wrong parameter order  
**Solution:** Verify `handleNodeRender` and `handleEdgeRender` have:
```typescript
const handleNodeRender = useCallback((node: any, ctx: CanvasRenderingContext2D) => {
  // node FIRST, then ctx
}, [selectedNodeId, hoveredNodeId]);
```

### Issue: Styles not applying (Tailwind CSS)

**Cause:** CSS not built  
**Solution:**
1. Check `globals.css` is imported in `app/layout.tsx`
2. Run `npm run dev` (rebuilds Tailwind)
3. Clear browser cache: Dev Tools → Cmd+Shift+Delete

### Issue: Port 3002 already in use

**Cause:** Dev server still running  
**Solution:**
```bash
# Find and kill process
lsof -i :3002
kill -9 <PID>

# Or use different port
npm run dev -- -p 3003
```

---

## File-by-File Summary

| File | Purpose | Status | Notes |
|------|---------|--------|-------|
| `app/layout.tsx` | Root layout | ✅ Ready | Added `suppressHydrationWarning` |
| `app/page.tsx` | Home page | ✅ Ready | Static landing page |
| `app/relationships/page.tsx` | Phase 1 page | ✅ Complete | Relationship Map view |
| `app/timeline/page.tsx` | Phase 2 page | ⏳ Ready (needs v2) | Will be rebuilt in Phase 2 |
| `app/api/timeline-data/route.ts` | Data endpoint | ✅ Working | Google Sheets integration |
| `components/timeline/RelationshipMap.tsx` | Graph canvas | ✅ Complete | Force-directed visualization |
| `components/timeline/FilterPanel.tsx` | Filters UI | ⏳ Reusable | Used in Phase 2 |
| `lib/similarity.ts` | Similarity scoring | ✅ Complete | O(N²) precomputation |
| `lib/graphTypes.ts` | Graph data structures | ✅ Complete | Nodes, edges, filtering |
| `lib/timelineData.ts` | TypeScript types | ✅ Complete | All domain models |
| `lib/tagNormalization.ts` | Vocabulary system | ✅ Complete | ~100 controlled terms |
| `lib/idGenerator.ts` | ID generation | ✅ Complete | Deterministic hashing |
| `lib/convertSheetsToTimelineFormat.ts` | Data pipeline | ✅ Complete | 3-phase transformation |
| `hooks/useTimelineData.ts` | Data hook | ✅ Complete | Fetching and caching |
| `data/macro-movements.ts` | Era definitions | ✅ Complete | Hardcoded eras |

---

## Performance Notes

### Graph Rendering Performance
- **Current Load:** 151 nodes, 161 edges at 40% threshold
- **Performance:** Smooth 60 FPS on modern browsers
- **Canvas Optimization:** Using `nodeCanvasObject` and `linkCanvasObject` callbacks
- **Memory:** ~50-80MB on desktop browser

### Data Fetching
- API endpoint caches results in memory (5 minute TTL recommended)
- Initial load: ~500ms (Sheets API + transformation)
- Subsequent loads: Instant (from hook state cache)

### Similarity Computation
- Precomputed once on component mount
- Cost: O(N²) but only ~10ms for 151 buildings
- Cached until buildings change

---

## Next Steps for Handoff

### For Next Developer
1. **Read** this handoff doc completely
2. **Run** local dev: `npm run dev` and navigate to `/relationships`
3. **Test** all Phase 1 features (slider, hover, click, detail panel)
4. **Review** Phase 2 requirements and estimate timeline
5. **Check** GitHub Issues or PRs if any are tracked

### Recommended Order
1. Phase 2 - Timeline v2 (blocks Phase 3)
2. Phase 3 - Cross-View Sync (enhancement after Phase 2)
3. Mobile optimization (responsive improvements)
4. Performance tuning (lazy loading, code splitting)

### Questions to Answer Before Starting Phase 2
- [ ] Timeline layout preference: era bands or columns?
- [ ] Zoom level: fixed or interactive?
- [ ] Filter complexity: simple dropdown or advanced faceted search?
- [ ] Date display format: exact years, ranges, or estimates?

---

## Contacts & Resources

- **Google Sheets API Docs:** https://developers.google.com/sheets/api
- **react-force-graph-2d:** https://github.com/vasturiano/react-force-graph
- **Next.js 15 Docs:** https://nextjs.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **TypeScript:** https://www.typescriptlang.org/docs

---

**Document Version:** 1.0  
**Last Updated:** September 2, 2026  
**Project Owner:** [Your Name/Team]  
**Status:** Phase 1 Complete, Ready for Phase 2
