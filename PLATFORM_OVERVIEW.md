# The Bridge — Platform Functionality Overview

> **Updated:** 28 February 2026
> This document provides a comprehensive breakdown of every current **production** functionality within **The Bridge** platform.

## 1. Core Philosophy & Design System
The Bridge is a "Professional Sanctuary."
-   **Aesthetic**: "Glassmorphic Sanctuary" — backdrop filters, blurs, and organic shapes to reduce career-related anxiety.
-   **Design Tokens**: Custom palette (Bridge Slate `#1a1a2e`, Bridge Sage, Bridge Lilac) with Playfair Display (serif authority) + Outfit (sans clarity).
-   **Global Components**:
    -   **GlassCard**: Reusable glassmorphic UI container with backdrop filters.
    -   **Feedback System**: Omnipresent floating "Feedback" button allowing users to report issues from any page. Writes to Firestore `feedback` collection.
    -   **Auth & Protection**: Invite-only registration via Firebase Auth + Firestore. Session managed by `AuthContext` and enforced by `firestore.rules`.
    -   **Sidebar Navigation**: Collapsible sidebar with module links. Mobile hamburger menu with slide-in drawer.

---

## 2. Module: AI CV Builder ✅ Production

The primary engine of the platform. Transforms fragmented user experience into a high-impact professional narrative.

### 2.1 Invite-Only Auth & Onboarding
-   **Google Sign-In**: Firebase Auth via Google OAuth. Only users with valid invite links can register.
-   **Invite Link Flow**: Admins create one-time links → user visits `/invite/:id` → `InviteLanding` validates in Firestore → user signs in → `AuthContext` redeems invite → user registered in `allowedUsers` collection.
-   **Roles**: `user` (standard access) and `admin` (admin dashboard + invite management). Admin emails are hardcoded in `AuthContext.tsx`.

### 2.2 Multi-CV Gallery (`UnifiedBuilder` — Gallery Mode)
-   Users land on a **Gallery** showing all their saved CVs with metadata (title, completion %, last updated, target role, status).
-   Can **create new CVs**, **load existing ones**, or **delete** them.
-   CV index persisted to `localStorage` (`cv-saved-list`).

### 2.3 Conversational AI Agent (`CVChatAgent`)
-   **4-Path Career Archetype System**: On first interaction, Gemini classifies the user and adopts a distinct persona and strategy:
    -   **Path A — Bridge Builder**: Returners, no experience, manual workers. Warm, empathetic. Uses "Mirror & Elevate" strategy — translates informal language into professional terms.
    -   **Path B — The Coach**: Students, graduates. "Academic Miner" — treats degrees like jobs, expands modules/projects.
    -   **Path C — The Strategist**: 4–7 year professionals. "Branding Expert" — focuses on differentiation, not lists.
    -   **Path D — The Headhunter**: 7+ year executives. Ruthless, metric-obsessed "Exacting Boss" — demands revenue figures, team sizes, budget ranges.
-   **Structured Conversation Phases**: Contact → Experience → Education → Skills → Summary → Review. Phase progress shown in the UI.
-   **Streaming**: AI responses stream token-by-token to the chat interface.
-   **Real-time JSON Merging**: Every AI response includes a `json_cv_update` block. `cvStore.mergeFromAI` normalises and merges this into the live CV data.
-   **Strategy Hints**: AI can include `[STRATEGY]` blocks which are surfaced as contextual hints in the chat UI.
-   **Session Persistence**: Chat history and CV data auto-saved to `localStorage` every 1 second after changes.

### 2.4 Template System & PDF Rendering (`DocRenderer`)
-   **Oxford Strict** (`OxfordStrictPDF.tsx`): Times-Roman, 12pt, formal layout. Explicit `fontStyle: 'normal'` to prevent italic contact info.
-   **Modern Impact** (`ModernImpactPDF.tsx`): Roboto/Helvetica, 12pt, navy accent headers. 20pt gap between name and contact block.
-   **Elastic Layout Engine** (`elasticLayout.ts`): Deterministic algorithm — adjusts font sizes, line heights, and section margins to fit all content on A4, regardless of volume.
-   **Live Preview**: PDF renders in real-time in the right panel of the split-view builder.

### 2.5 Unified Builder Interface
-   **Split-View**: Chat Agent (left) + Live PDF Preview (right), synchronized in real-time.
-   **Gallery Mode ↔ Builder Mode**: `isBuilderActive` state in Zustand controls which view is shown.
-   **Auto-Save**: Zustand subscriber saves to `localStorage` 1 second after any change, passing a state snapshot to avoid race conditions.

---

## 3. Module: Admin Infrastructure ✅ Production

### 3.1 Invite Management (`InviteGenerator`)
-   Admins create one-time-use invite links with configurable expiry.
-   Table shows invite status (used/unused), usage details (who used it, when), and creation date.
-   Admins can **delete** unredeemed invites.
-   Stored in Firestore `invites` collection.

### 3.2 User Management
-   List of all registered users pulled from `allowedUsers` Firestore collection.
-   **User View**: Read-only replica of the builder interface — admin can see any user's CV and chat history (loaded from admin view of their data).

### 3.3 Feedback Aggregation
-   Centralized dashboard for reviewing all user-submitted feedback.
-   Feedback written to Firestore `feedback` collection by the global `FeedbackButton`.

---

## 4. Modules: Planned / Stubbed 🚧

These modules exist in the navigation and component structure but rely on stub functions in `geminiService.ts` returning static data:

-   **Opportunity Radar** (`components/radar/`): UI scaffolded; job data is mocked. Needs real job API integration (Adzuna, Reed).
-   **Simulation Lab** (`components/simulation/`): Interview simulation UI scaffolded; AI functions are stubs.
-   **LinkedIn Sync** (`components/cv/LinkedInSync.tsx`): UI exists; AI generation functions are stubs.
-   **Re:Turn Hub** (`components/return/`): Flex Negotiator and 90-Day Roadmap UI scaffolded; AI stubs.
-   **Cheat Sheets** (`components/cheatsheets/`), **Knowledge Base** (`components/knowledge/`), **Upskill** (`components/upskill/`), **First 90 Days** (`components/first90/`), **Jargon Buster** (`components/jargon/`): All scaffolded, not yet implemented.

---

## 5. Technical Infrastructure

-   **State Management**: Zustand (`cvStore.ts`) is the single source of truth for all CV builder state. Multi-CV gallery + active session are separately persisted to `localStorage`.
-   **Backend**: Firebase (Firestore, Auth, Hosting, Cloud Functions). Serverless, scalable.
-   **AI Layer**: Firebase Cloud Functions proxy (`functions/src/index.ts`) securely manages the Gemini API key. Uses Server-Sent Events (SSE) to stream responses. Frontend service (`geminiService.ts`) handles prompt engineering with date injection, the 4-path system prompt, 3-strategy JSON parsing, and 503 retry formatting over fetch.
-   **Routing**: Custom SPA routing via `activePath` state in `App.tsx`. No `react-router`.
-   **Security**: Firestore security rules enforce: users can only read/write their own data; only admins can manage invites and view all users; feedback is write-only for users, read-only for admins. The Gemini API key is securely stored via Firebase Secrets Manager, never exposed to the client.
