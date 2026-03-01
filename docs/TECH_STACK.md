# Technical Stack & Dependencies

> **Updated:** 28 February 2026

## 1. Core Framework

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | `^19.2.4` | UI framework |
| TypeScript | `~5.8.2` | Type safety |
| Vite | `^6.2.0` | Build tool & dev server |
| Zustand | `^5.0.11` | Global state management |

**Routing:** Custom SPA routing via `activePath` state in `App.tsx`. No `react-router`.

## 2. AI Integration

| Technology | Version | Purpose |
|-----------|---------|---------|
| `@google/generative-ai` | `^0.24.1` | **Primary** Gemini API SDK used in `geminiService.ts` |
| `@google/genai` | `^1.40.0` | Newer SDK version (installed, not currently used in main flow) |

**Model:** `gemini-2.5-flash` for low-latency streaming.
**Usage:** CV Builder conversational agent. All other service functions are stubs.

## 3. Backend & Auth

| Technology | Version | Purpose |
|-----------|---------|---------|
| Firebase | `^12.9.0` | Auth + Firestore + Hosting |

**Auth:** Firebase Auth — Google Sign-In via popup. Invite-only registration.
**Database:** Firestore — `allowedUsers`, `invites`, `feedback` collections.
**Hosting:** Firebase Hosting — static SPA deployment.
**Rules:** `firestore.rules` enforces collection-level access control.

## 4. PDF & Document Rendering

| Technology | Version | Purpose |
|-----------|---------|---------|
| `@react-pdf/renderer` | `^4.3.2` | CV PDF generation (Oxford Strict + Modern Impact templates) |
| `pdfjs-dist` | `^5.4.624` | PDF rendering in browser viewer |

## 5. UI & Icons

| Technology | Version | Purpose |
|-----------|---------|---------|
| `lucide-react` | `^0.563.0` | Icon library |

**Styling:** Vanilla CSS with custom design tokens in `index.css`. No Tailwind in production (utility class names are Tailwind-style but rendered via custom CSS variables).
**Fonts:** Playfair Display (serif) + Outfit (sans-serif) from Google Fonts, loaded in `index.html`.

## 6. Dev & Testing

| Technology | Version | Purpose |
|-----------|---------|---------|
| Vitest | `^4.0.18` | Unit test runner |
| `@testing-library/react` | `^16.3.2` | React component testing |
| `@testing-library/jest-dom` | `^6.9.1` | Custom matchers |
| `jsdom` | `^28.0.0` | DOM simulation for tests |
| `firebase-tools` | `^15.5.1` | Firebase CLI for deployment |

## 7. Project Structure

```
the-bridge/
├── App.tsx                   # Root component, SPA router
├── index.css                 # Global styles & design tokens
├── index.html                # HTML entry point
├── constants.ts              # Navigation items, feature flags
├── types.ts                  # Shared TypeScript types
├── firestore.rules           # Firestore security rules
├── firebase.json             # Firebase Hosting config
│
├── components/
│   ├── cv/
│   │   ├── builder/
│   │   │   ├── UnifiedBuilder.tsx  # Gallery + Builder mode container
│   │   │   ├── CVChatAgent.tsx     # Chat UI
│   │   │   └── DocRenderer.tsx     # PDF viewer wrapper
│   │   ├── pdf/
│   │   │   ├── OxfordStrictPDF.tsx # Classic template
│   │   │   ├── ModernImpactPDF.tsx # Modern template
│   │   │   └── elasticLayout.ts    # Layout engine
│   │   ├── CVTypes.ts              # Master TypeScript schema
│   │   └── LinkedInSync.tsx        # LinkedIn content generator (stub)
│   ├── admin/
│   │   ├── AdminDashboard.tsx
│   │   └── InviteGenerator.tsx
│   ├── radar/                # Opportunity Radar (scaffolded)
│   ├── simulation/           # Interview Lab (scaffolded)
│   ├── return/               # Re:Turn Hub (scaffolded)
│   ├── cheatsheets/          # (scaffolded)
│   ├── knowledge/            # (scaffolded)
│   ├── upskill/              # (scaffolded)
│   ├── first90/              # (scaffolded)
│   ├── jargon/               # (scaffolded)
│   ├── Dashboard.tsx
│   ├── Sidebar.tsx
│   ├── InviteLanding.tsx
│   ├── FeedbackButton.tsx
│   ├── GlassCard.tsx
│   └── AccessDenied.tsx
│
├── context/
│   └── AuthContext.tsx        # Firebase Auth + invite redemption
│
├── services/
│   ├── geminiService.ts       # AI layer (4-path system, streaming)
│   └── firebase.ts            # Firebase app init
│
├── stores/
│   └── cvStore.ts             # Zustand store (multi-CV, AI merge, auto-save)
│
├── docs/                      # Documentation (this folder)
├── functions/                 # Firebase Cloud Functions (reserved)
├── public/                    # Static assets
└── dist/                      # Production build output
```
