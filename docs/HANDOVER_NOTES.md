# Handover Notes & Current Status

**Status:** 🚧 Work in Progress (Alpha)
**Date:** February 2026
**Priority:** High - Transitioning from Prototype to MVP

## ⚠️ Important Context
**Everything is up for challenge.**
The current codebase represents a high-fidelity functional prototype. **Nothing is cemented.** The design, user flows, feature sets, and especially the technical architecture are all open to iteration and improvement. The goal so far has been to visualize the "Professional Sanctuary" concept and test the AI interactions.

## 1. Current State of Development
We have built a **Frontend-Only Prototype** using React + Vite.

### What is Working ✅
-   **UI/UX:** The "Glassmorphic" aesthetic, navigation, and responsive layout are implemented.
-   **AI Integration:** The `geminiService.ts` layer successfully connects to Google Gemini to generate:
    -   CV rewrites & audits.
    -   Interview questions & feedback.
    -   Career roadmaps.
    -   Job match analysis (mock data).
-   **Core Modules:**
    -   **Dashboard:** Readiness gauge logic is functional (though based on local state).
    -   **CV Studio:** Both "Builder" (Chat) and "Audit" (Form) modes work with AI.
    -   **Interview Lab:** Chat interface works, provides real-time feedback.
    -   **Re:Turn Hub:** Flex Negotiator and Roadmap generation are functional.

### What is Mocked / Temporary 🚧
-   **No Backend:** **CRITICAL.** The current app has **zero** persistence. Reloading the page wipes all user data (CV, chat history, settings).
    -   *Decision:* This was a temporary measure for rapid prototyping.
    -   *Next Step:* A full backend (Node/Express, Python/FastAPI, or Supabase/Firebase) **MUST** be implemented to save user profiles, CV versions, and history.
-   **Opportunity Radar:** The job data is currently hardcoded mock data (`MOCK_JOBS`). The "Search" function simulates an API call but returns the same static list.
-   **Authentication:** There is no login system. The user is hardcoded as "Alex".

## 2. Immediate Next Steps for the Next Agent

### A. Backend Implementation (Priority #1)
-   **Goal:** Persist user data.
-   **Tasks:**
    1.  Select a backend provider (Supabase is recommended for speed/auth).
    2.  Set up Authentication (Email/Password, LinkedIn OAuth).
    3.  Create Database Schema:
        -   `Users` (Profile, Subscription Status)
        -   `CVs` (Versions, Parsed Data)
        -   `Simulations` (History, Scores)
        -   `Jobs` (Saved Opportunities)
    4.  Migrate `geminiService.ts` calls to a backend proxy to secure the API Key (currently exposed in frontend code/env).

### B. Feature Completion
-   **Opportunity Radar:** Connect to a real Job Search API (e.g., Adzuna, Reed, or Google Jobs) to replace mock data.
-   **Voice Mode:** The Interview Simulation currently only supports text. Implement Speech-to-Text (STT) and Text-to-Speech (TTS) for a real voice interview experience.
-   **Payment Gateway:** Integration with Stripe for subscription management.

### C. Testing Required
-   **AI Hallucination:** Test the "Cheat Sheet" and "Battle Card" generation with edge-case Job Descriptions to ensure accuracy.
-   **Mobile Responsiveness:** The "Glass Card" grids and complex forms need thorough testing on smaller screens.
-   **State Management:** As the app grows, `useState` passing will become unmanageable. Consider Context API or Redux/Zustand.

## 3. Known Issues / Refinements Needed
-   **Performance:** The "Glassmorphism" effect (blur) can be performance-heavy on older devices.
-   **Accessibility:** Contrast ratios on the "Glass" UI need auditing.
-   **Error Handling:** API failures (Gemini quotas, network issues) currently show basic alerts or console logs. Needs user-friendly error boundaries.

## 4. Vision & Scope
The goal is to build a "Sanctuary".
-   **Tone:** Encouraging, Authoritative, Calm.
-   **Target:** £25k-£75k professionals & Returners.
-   **Key Differentiator:** We don't just "fix grammar"; we "reframe narratives" using AI.

**Handover Complete.** Good luck!
