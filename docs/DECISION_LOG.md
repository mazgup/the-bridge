# Decision Log

> **Updated:** 28 February 2026

## Phase 1: Initial Concept
-   **Decision:** Focus on "Professional Sanctuary" aesthetic.
-   **Reason:** Career platforms are sterile or chaotic. We wanted Calm Authority.
-   **Implementation:** Glassmorphism, custom palette (Slate/Sage/Lilac), serif typography.

## Phase 2: Core Modules
-   **Decision:** Single "CV Builder" mode (conversational AI) rather than split Builder/Audit.
-   **Reason:** The AI is capable enough to handle all CV scenarios. Separate modes added cognitive overhead.
-   **Decision:** Use a "Radar" visualization for job search rather than a list.
-   **Reason:** Lists are overwhelming. Radar visualizes "fit" and "sector" at a glance.

## Phase 3: AI Archetype System
-   **Decision:** Implement 4-Path Career Archetype classification (Bridge Builder / Coach / Strategist / Headhunter).
-   **Reason:** A single prompt cannot serve a warehouse worker and a Director equally well. The AI must adapt its entire persona, not just its tone.
-   **Implementation:** System prompt in `getSystemPrompt()` defines 4 paths. AI outputs archetype in JSON `meta.archetype` field.

## Phase 4: Backend & Auth
-   **Decision:** Use Firebase (Auth + Firestore + Hosting) as the backend.
-   **Reason:** Serverless, scales automatically, integrates cleanly with the existing Vite/React frontend.
-   **Decision:** Invite-only registration.
-   **Reason:** Controlled rollout. Maintains quality and allows personalized onboarding. No open sign-up.
-   **Decision:** Hardcode admin emails in `AuthContext.tsx` rather than a separate admin invite flow.
-   **Reason:** Simple and safe at current scale. Revisit when admin team grows.
-   **Decision:** No `react-router`. Custom `activePath` state routing.
-   **Reason:** Keeps bundle lean; transitions (animations) stay tightly controlled.

## Phase 5: State Management
-   **Decision:** Zustand over React Context/Redux for CV state.
-   **Reason:** Simpler API, less boilerplate, strong selector patterns, and easy to subscribe for side effects (auto-save).
-   **Decision:** CV data stored in `localStorage` (not Firestore) for now.
-   **Reason:** Faster to implement; avoids complex Firestore security rules for CV data. **Known trade-off:** data is per-device.
-   **Next:** Migrate CV data to `users/{uid}/cvs/{id}` in Firestore.

## Phase 6: PDF Templates
-   **Decision:** Standardise both templates to 12pt body font and 20pt name/contact gap.
-   **Reason:** Feedback indicated smaller text was hard to read. Consistency reduces maintenance.
-   **Decision:** Add `fontStyle: 'normal'` explicitly to Classic template contact section.
-   **Reason:** `@react-pdf/renderer` inherited italic styles from parent elements unexpectedly.

## Phase 7: AI Response Robustness
-   **Decision:** Implement 3-strategy JSON parsing fallback in `parseAIResponse`.
-   **Reason:** Gemini sometimes wraps JSON in different block markers or returns raw JSON. All variants must be handled.
-   **Decision:** Implement normalisation helpers (`normaliseSkills`, `normaliseExperience`, etc.) in `cvStore.ts`.
-   **Reason:** Gemini returns different JSON shapes for the same data across calls. Normalisation at merge time is more reliable than prompt-only enforcement.
-   **Decision:** AI "amnesia" safeguard — only overwrite lists if new list is non-empty.
-   **Reason:** AI sometimes returns an empty array for a section it didn't touch, which would wipe existing data.
-   **Decision:** 503 retry logic (3 attempts, exponential backoff) in `streamCVConversation`.
-   **Reason:** Gemini 503 errors occur under load. Retrying handles transient failures gracefully.
