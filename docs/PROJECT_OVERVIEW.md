# The Bridge - Project Overview

## 1. Project Concept & Identity
**The Bridge** is a premium, subscription-based career acceleration platform designed to support professionals earning **£25,000 - £75,000** in reaching their career goals. It serves as a "Professional Sanctuary," reframing skills and experience to maximize candidate suitability.

### Target Audience
-   **Core:** Professionals earning £25k - £75k seeking progression.
-   **Re:Turn Hub:** Professionals returning to the workforce (post-maternity, sabbaticals, industry pivots).

### Visual Language
-   **Theme:** "Professional Sanctuary" - Calm, Glassmorphic UI.
-   **Palette:** Deep Slate, Soft Sage, Lilac.
-   **Typography:** Playfair Display (Serif/Authority), Outfit (Sans-serif/Clarity).

## 2. Core Feature Modules

### A. Dashboard (The Landing)
-   **Readiness Gauge:** Gamified circular progress meter ("Day-One Ready" score).
-   **Logic:** Score calculated based on CV completion (40%), Interview Prep (35%), and Briefings (25%).
-   **Quick Stats:** Visual breakdown of readiness.
-   **Navigation:** Glass Card grid system.

### B. CV Studio (Builder & Audit)
-   **CV Builder:**
    -   **Chat Mode:** AI Recruiter chat interface to extract achievements.
    -   **Skills-Based Mode:** Step-by-step builder focusing on skills, experience, and target role.
-   **CV Audit:**
    -   **Input/Preview:** Split-screen editor with real-time ATS-friendly preview.
    -   **Templates:** Classic Professional, Modern Minimal, Skills-First, Executive Summary.
    -   **Co-Pilot:** Impact Score, Confidence Auditor ("weak" vs "strong" language), Upgrade Phrasing (GenAI), Keyword Heatmap (vs Job Description).
    -   **LinkedIn Sync:** Generates optimized Headlines, Summaries, and Experience descriptions for LinkedIn based on the CV.

### C. Interview Simulation Lab
-   **Simulation:** High-stakes interview practice with AI (Text-based, adaptable to Voice).
-   **Features:** User uploads CV + Job Description. AI acts as interviewer. Real-time "Authority Score" feedback.
-   **Cheat Sheets:** "Toolkit" function to generate one-page briefing documents (talking points, hidden agenda, buzzwords) for specific roles.

### D. Opportunity Radar
-   **Visual Search:** Quadrant chart visualization (Tech, Finance, Public, Creative) instead of list views.
-   **Scope:** Targeted at the £25k - £70k salary band.
-   **Logic:** Matches CV skills/role to market opportunities.
-   **Status:** Currently uses mock data. Needs API integration (e.g., Adzuna, Reed).

### E. Re:Turn Hub (The Sanctuary)
-   **Specialized Dashboard:** For returning professionals.
-   **Flow:**
    1.  **CV Audit:** Review current CV (reuses CV Studio logic).
    2.  **Flex Negotiator:** Simulation with "HR" or "Line Manager" personas to practice flexible working requests. Includes pre-simulation evaluation of request likelihood.
    3.  **90-Day Roadmap:** Tactical plan (Weeks 1-12) for returners, focused on visibility and integration.

### F. Global/Support
-   **Terms & Conditions:** Legal framework page.
-   **Navigation:** Sidebar and Mobile Menu.

## 3. Project Status & Architecture
**⚠️ IMPORTANT:**
The current build is a **Frontend-Only Prototype**.
-   **Persistence:** None. Reloading the page resets user data.
-   **Next Step:** Implement a full backend (Node/Python/Supabase) to handle user accounts, data storage, and session management.
-   **Stability:** Everything is "Work in Progress" and subject to change.

## 4. Evolution & Refinements
-   **Scope Adjustment:** Removed standalone "Salary Negotiation" and general "Flexible Working" modules; folded Flex logic into Re:Turn Hub.
-   **Renaming:** "Simulation Lab" -> "Interview Simulation Lab".
-   **Additions:** Added "Cheat Sheets", "LinkedIn Sync", "Terms & Conditions".
-   **Refinement:** Dashboard gauge logic simplified to CV/Interview/Briefings. Toolkit order optimized.
