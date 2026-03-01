# The Bridge — Project Overview

> **Updated:** 28 February 2026 | **Status:** Production

## 1. Project Concept & Identity
**The Bridge** is a premium, invite-only career acceleration platform for professionals earning **£25,000 – £75,000**. It acts as a "Professional Sanctuary," using AI to reframe skills and experience for maximum career impact.

### Target Audience
-   **Core:** Professionals seeking career progression (£25k–£75k).
-   **Re:Turn Hub:** Professionals returning to the workforce (post-maternity, sabbatical, pivot).

### Visual Language
-   **Theme:** "Professional Sanctuary" — Glassmorphic, calm.
-   **Palette:** Deep Slate (`#1a1a2e`), Soft Sage, Lilac.
-   **Typography:** Playfair Display (serif/authority), Outfit (sans-serif/clarity).

---

## 2. Core Feature Modules

### A. AI CV Builder ✅ Production
-   **Invite-Only Auth:** Firebase Auth (Google Sign-In) + Firestore-managed user registry.
-   **4-Path AI Archetype:** Gemini classifies users as Bridge Builder / Coach / Strategist / Headhunter and adapts persona, strategy, and format accordingly.
-   **Multi-CV Gallery:** Create, manage, and switch between multiple CV versions.
-   **Conversational Builder:** Chat-based interface with structured phases (Contact → Experience → Education → Skills → Summary → Review).
-   **Live PDF Preview:** Split-view editor with real-time rendering.
-   **Templates:** Oxford Strict (Classic) & Modern Impact. Both production-ready.
-   **Elastic Layout:** Smart algorithm to fit content on A4.
-   **Auto-Save:** CV data + chat history auto-saved to `localStorage`.

### B. Admin Dashboard ✅ Production
-   **Invite Management:** Create, delete, and track one-time invite links.
-   **User Inspection:** Read-only view of any user's builder interface.
-   **Feedback:** Aggregated user feedback from Firestore.

### C. Other Modules 🚧 Scaffolded / Not Implemented
-   **Opportunity Radar:** Job market visualization. Currently uses mock data.
-   **Simulation Lab:** Interview practice via AI. AI functions are stubs.
-   **LinkedIn Sync:** Generates LinkedIn content from CV. Stubs.
-   **Re:Turn Hub:** Returner-specific tools (Flex Negotiator, 90-Day Roadmap). Stubs.
-   **Cheat Sheets, Knowledge Base, Upskill, First 90 Days, Jargon Buster:** Scaffolded only.

---

## 3. Project Status & Architecture

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript (Vite 6) |
| State | Zustand 5 |
| AI | Google Gemini 2.5 Flash |
| Backend | Firebase (Auth, Firestore, Hosting) |
| PDF | `@react-pdf/renderer` |
| Auth | Invite-only Google Sign-In |

**Data Persistence:** CV data currently uses `localStorage`. A key next step is migrating CV storage to Firestore for cross-device access.

---

## 4. Evolution from Prototype (For Context)
Previous prototype was frontend-only with no auth and no backend. The current production build replaced this with:
-   Firebase Auth + Firestore backend
-   Invite-only registration system
-   Zustand state management
-   Multi-CV gallery with auto-save
-   Deployed to Firebase Hosting
