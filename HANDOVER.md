# CV Builder — Agent Handover Document

> **Project**: The Bridge (Naomi)
> **Module**: AI CV Builder
> **Date**: 28 February 2026
> **Status**: Production (Deployed to Firebase Hosting)

---

## 1. Project Overview

The Bridge is a web application with multiple career-support tools. The **AI CV Builder** is the core production module. It uses Google's Gemini API to guide users through building a professional CV via a conversational AI agent, with a live PDF preview and multi-CV gallery management.

The platform is **invite-only** and deployed on **Firebase Hosting** with **Firestore** as the backend database.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript (Vite 6) |
| State | Zustand 5 |
| PDF | `@react-pdf/renderer` 4 |
| AI | `@google/generative-ai` (Gemini 2.5 Flash) |
| Styling | Vanilla CSS (Glassmorphic "Professional Sanctuary" design) |
| Auth | Firebase Auth (Google Sign-In) |
| Database | Firebase Firestore |
| Hosting | Firebase Hosting |
| Env | `VITE_GEMINI_API_KEY` |

---

## 2. File Map — What Each File Does

### Core Data & State

| File | Purpose |
|------|---------|
| `components/cv/CVTypes.ts` | Master TypeScript schema for all CV data (`CVData`, `CVMeta`, `CVContent`, `CVSummary`). Source of truth for data shape. |
| `stores/cvStore.ts` | Zustand store. Manages the active CV, multi-CV gallery (`savedCvs`), AI merging logic (`mergeFromAI`), and localStorage persistence (auto-save subscriber). |
| `services/geminiService.ts` | Gemini API integration. Implements the **4-Path Career Archetype system**, streaming conversation, JSON parsing with 3-strategy fallback, and 503 retry logic. |
| `services/firebase.ts` | Firebase app initialisation and exports `auth` and `db`. |

### UI Components

| File | Purpose |
|------|---------|
| `components/cv/builder/UnifiedBuilder.tsx` | Main Builder page. Controls **Gallery Mode** (list of CVs) vs **Builder Mode** (Chat + PDF split view). |
| `components/cv/builder/CVChatAgent.tsx` | Chat interface. Handles AI streaming, markdown rendering, strategy hint display, and phase progress bar. |
| `components/cv/builder/DocRenderer.tsx` | PDF viewer wrapper using `@react-pdf/renderer`. |
| `components/cv/pdf/OxfordStrictPDF.tsx` | **Classic** template. Times-Roman, 12pt, forced non-italic contact info, formal layout. |
| `components/cv/pdf/ModernImpactPDF.tsx` | **Modern** template. Roboto/Helvetica, 12pt, navy accent headers, clean layout. |
| `components/cv/pdf/elasticLayout.ts` | **Elastic Layout Engine**. Deterministic algorithm — adjusts font size, line height, and margins so content always fits on A4. |

### Auth & Admin

| File | Purpose |
|------|---------|
| `context/AuthContext.tsx` | Authentication logic. Manages Google Sign-In, invite redemption flow, and admin role check. Exposes `useAuth` hook. |
| `components/InviteLanding.tsx` | Invite link handler (`/invite/:id`). Validates invite in Firestore, stores `pendingInviteId` in `sessionStorage`, then triggers Google Sign-In. |
| `components/admin/AdminDashboard.tsx` | Admin portal. Tabs: **Users**, **Invites**, **Feedback**. User View is a read-only replica of the Builder UI. |
| `components/admin/InviteGenerator.tsx` | Invite management. Admins can create, copy, and delete invite links stored in Firestore. |
| `firestore.rules` | Security rules. Collections: `users`, `allowedUsers`, `invites`, `feedback`. |

### App Shell

| File | Purpose |
|------|---------|
| `App.tsx` | Root component. Acts as the custom SPA router (`activePath` state). Renders correct module based on path. Wraps everything in `AuthProvider`. |
| `components/Sidebar.tsx` | Navigation. Collapsible sidebar with module links. |
| `components/FeedbackButton.tsx` | Global floating feedback button. Writes feedback to Firestore. |
| `constants.ts` | Navigation items and initial feature flags. |

---

## 3. Architecture Deep-Dive

### 3.1 Authentication & Invite Flow

1. Unauthenticated user hits `/` → sees `SignInPage`.
2. User receives an invite link (**`/invite/:id`**) from an admin.
3. `InviteLanding` validates the invite in Firestore (`invites/{id}`).
4. User signs in with Google. The `pendingInviteId` stored in `sessionStorage` is consumed by `AuthContext.checkAuthorization`.
5. If invite is valid and not expired/used:
   - User document is created in `allowedUsers/{email}`.
   - Invite is marked `used: true` in Firestore.
   - User gains access.
6. Admin emails (`ADMIN_EMAILS` array in `AuthContext.tsx`) are hardcoded and always bypass invite requirement.

**Firestore collections used:**
- `invites/{inviteId}` — invite metadata (used, expiresAt, usedBy)
- `allowedUsers/{email}` — user registry (role: 'user' | 'admin', uid, lastActive)
- `feedback/{id}` — user feedback submissions

### 3.2 Multi-CV Gallery & State Management

`cvStore.ts` manages two layers:
- **Index** (`savedCvs`/`CVSummary[]`): lightweight list of all CVs with metadata, persisted to `localStorage` under `cv-saved-list`.
- **Active Session** (`cvData`/`CVData`): the full CV currently being edited, persisted to `localStorage` under `cv-active-session`.

An auto-save subscriber fires 1 second after any `cvData` or `messages` change, calling `saveCurrentToIndex` with a state snapshot to prevent race conditions when switching CVs.

On app boot, `cvStore` restores the last active session from `localStorage` but does **not** auto-activate the builder — the user sees the gallery first.

**Key Zustand store actions:**
- `createNewCV()` — generates a UUID, initialises fresh `CVData`, adds a summary to the index.
- `loadCV(id, data, msgs)` — switches to an existing CV.
- `mergeFromAI(partial)` — the core AI merge function. Uses normalisation helpers to handle all the inconsistent formats the AI can return (flat strings, object arrays, etc.). Includes safeguards: only overwrites lists if the new list is non-empty (prevents AI "amnesia").
- `returnToGallery()` — saves current state then sets `isBuilderActive: false`.
- `deleteCV(id)` — removes from index; if deleting the active CV, resets state.

### 3.3 Gemini AI System — The 4-Path Archetype

`geminiService.ts` implements a **career-level classification system** that dictates the AI's entire persona:

| Path | Archetype | Trigger | Format | Persona |
|------|-----------|---------|--------|---------|
| A | Bridge Builder | Returners, no experience, retail/warehouse | Modern 1-page | Warm, empathetic "Supportive Biographer" |
| B | The Coach | Students, graduates, interns | Modern 1-page | Helpful "Academic Miner" |
| C | The Strategist | 4–7 years, managers, team leads | 1–2 pages, user choice | Collaborative "Branding Expert" |
| D | The Headhunter | 7+ years, directors, VPs | Classic Oxford 2-page | Ruthless, metric-obsessed "Exacting Boss" |

**Output format:** The AI always outputs a `json_cv_update` fenced code block alongside its conversational response. The parser uses three fallback strategies:
1. Specific `json_cv_update` block
2. Generic `json` block scan
3. Deep scan / brute-force JSON extraction

**Streaming:** `streamCVConversation` uses the Gemini Chat API with history sanitisation (must start with `user`, must alternate roles, merges consecutive same-role messages). Includes 503 retry logic (3 attempts, exponential backoff).

---

## 4. Recent Work (Sessions 1–3)

### Session 1 — Project Foundation
- Full Firebase backend integration replacing prototype.
- Google Sign-In + invite-only access system.
- Zustand state management replacing local `useState`.

### Session 2 — CV Builder Polish
- **Admin Dashboard**: Invite deletion, read-only "pixel-perfect" User View mirroring the UnifiedBuilder.
- **PDF Templates**: Both templates standardised to 12pt body, 20pt gap between name and contact info, explicit `fontStyle: 'normal'` in Classic template.
- **Firestore Rules**: Admin delete permissions added for invites.

### Session 3 — AI Archetype System
- Rewrote the system prompt with the **4-Path Archetype** classification (Bridge Builder / The Coach / The Strategist / The Headhunter).
- Added conversation phase guardrails (Contact → Experience → Education → Skills → Summary → Review).
- Added `normaliseSkills`, `normaliseEducation`, `normaliseExperience`, `normaliseContact`, `normaliseLinks` helpers in `cvStore.ts` to handle all AI output format variants.
- Added AI "amnesia" safeguard: lists are only overwritten when new data is non-empty.
- Added 503 retry logic with exponential backoff to `streamCVConversation`.
- Upgraded model reference to `gemini-2.5-flash`.

---

## 5. Known Issues & Future Work

| Item | Priority | Notes |
|------|----------|-------|
| **CV data not synced to Firestore** | High | CV data only persists to `localStorage`. If user clears storage or switches device/browser, data is lost. Next step: write `cvData` to `users/{uid}/cvs/{id}` on save. |
| **Mobile PDF preview** | Medium | PDF preview is hidden on small screens. Consider a "Preview" tab for mobile. |
| **Word export** | Low | Only PDF export is supported. |
| **Opportunity Radar** | Medium | Job data is currently mocked. Needs API integration (Adzuna, Reed). |
| **Other modules** | Low | Simulation Lab, Re:Turn Hub, LinkedIn Sync are stubbed or partially implemented. All `geminiService.ts` exports beyond `streamCVConversation` are stubs returning static data. |

---

## 6. Running the App

```bash
# Install dependencies
npm install

# Run locally (Start frontend and emulator if configured)
npm run dev

# Deploy (Build frontend, output static bundle, and deploy Hosting/Functions/Firestore)
npm run build
npx firebase deploy
```

**Required env vars (`.env.local`):**
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

**Backend Secrets:**
The Gemini API key is securely stored in Firebase Secrets Manager and is injected into the Cloud Function at runtime. Set it via:
```bash
npx firebase functions:secrets:set GEMINI_API_KEY
```

> **Dev bypass:** In development, a `[DEV] Bypass Login` button on the sign-in page sets an in-memory mock user with admin rights. This only works in `DEV` mode and does not hit Firestore.
