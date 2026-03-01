# Handover Notes & Current Status

**Status:** ✅ Production (AI CV Builder deployed and live)
**Date:** 28 February 2026
**Deployed:** Firebase Hosting

> **⚠️ NOTE:** This file is a supplementary handover note. The primary handover document is [/HANDOVER.md](../HANDOVER.md). Always refer to that file first — it is the most complete and up-to-date source.

---

## 1. Current State of Development

The platform is **past the prototype phase**. The Firebase backend is fully integrated and the app is deployed.

### What is Working ✅
-   **Auth**: Invite-only Google Sign-In. Admin role detection via hardcoded ADMIN_EMAILS in `AuthContext.tsx`.
-   **AI CV Builder**: Conversational agent with Gemini 2.5 Flash. 4-Path Archetype system fully implemented. Streaming, JSON parsing, and normalisation all working.
-   **Multi-CV Gallery**: Create, load, save, delete. Auto-save to `localStorage`.
-   **PDF Export**: Oxford Strict and Modern Impact templates both production-ready.
-   **Admin Dashboard**: Invite generation/deletion, user list, user CV inspection (read-only).
-   **Feedback System**: Global feedback button writes to Firestore.

### What is Mocked / Not Yet Implemented 🚧
-   **CV data not in Firestore**: CV data only persists in `localStorage`. If the user clears their browser or moves to another device, data is lost. This is the **#1 next priority**.
-   **All other modules**: Opportunity Radar, Simulation Lab, LinkedIn Sync, Re:Turn Hub, Cheat Sheets, Knowledge Base, Upskill, First 90 Days, Jargon Buster — all scaffolded but not implemented. All `geminiService.ts` exports beyond `streamCVConversation` are stubs.
-   **Opportunity Radar**: Job data is hardcoded mock data. Needs real API.

---

## 2. Immediate Next Steps for the Next Agent

### A. Persist CV Data to Firestore (Priority #1)
-   **Goal:** Ensure user CV data survives across sessions, devices, and browsers.
-   **Approach:** Write `cvData` and `messages` to `users/{uid}/cvs/{cvId}` in Firestore on every save.
-   **Modify:** `cvStore.ts` — update `saveCurrentToIndex` to write to Firestore in addition to `localStorage`.
-   **Load:** On `loadCV`, first check `localStorage`, fall back to Firestore if not present.

### B. Complete a Second Module
The next logical module to wire up is likely **LinkedIn Sync** (simplest: single AI call generating content from CV data) or **Opportunity Radar** (requires a job API key integration).

### C. Implement AI-Powered Persona Survey (PRD Dependency)
Per the PLATFORM_OVERVIEW, a "Survey & Persona DNA" module was being planned. This would involve a pre-CV onboarding survey to classify users before the builder starts. The 4-Path Archetype in `geminiService.ts` already does this via conversation; the survey would pre-populate the classification.

---

## 3. Known Issues / Refinements

| Issue | Notes |
|-------|-------|
| CV data not in Firestore | Priority #1. Currently localStorage only. |
| Mobile PDF preview | Hidden on small screens. Add a "Preview" tab. |
| Error boundaries | API failures show basic errors. Needs user-friendly error boundaries. |
| Accessibility | Glass UI contrast ratios need auditing. |
| Performance | Glassmorphism blur can be heavy on older devices. |

---

## 4. Vision & Scope (Unchanged)
-   **Tone:** Encouraging, Authoritative, Calm.
-   **Target:** £25k–£75k professionals & Returners.
-   **Key Differentiator:** Reframes narratives using AI, not just grammar-checks.
