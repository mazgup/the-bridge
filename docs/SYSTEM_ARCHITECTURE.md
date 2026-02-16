# System Architecture & Component Interaction

## 1. High-Level Flow
The application follows a simple Single Page Application (SPA) architecture. `App.tsx` serves as the central router, managing the `activePath` state to render the appropriate feature module.

## 2. Component Hierarchy

### Root
-   `App.tsx`
    -   State: `activePath`, `cvData`, `sidebarOpen`.
    -   Layout: `Sidebar` (Left) + `Main Content` (Right).

### Features
1.  **Dashboard (`Dashboard.tsx`)**
    -   Receives `user`, `features`, `cvData`.
    -   Calculates "Readiness Gauge" dynamically.
    -   Links to all other modules.

2.  **CV Studio (`components/cv/`)**
    -   **Shared State:** `CVData` object (Experience, Skills, Summary, etc.).
    -   **CVBuilder.tsx:** Two modes (Chat vs. Skills-Form). Outputs `CVData`.
    -   **CVAudit.tsx:** Editor interface.
        -   `CVStepForm`: Inputs.
        -   `CVPreview`: Renders `CVData` into templates.
        -   `CVCoPilot`: AI sidebar for analysis.
    -   **LinkedInSync.tsx:** Uses `CVData` to generate social content.

3.  **Interview Lab (`components/simulation/`)**
    -   **InterviewSimulationLab.tsx:**
        -   Inputs: User CV + Job Description.
        -   Process: AI generates questions -> User answers -> AI analyzes (feedback/score).
        -   Outputs: Cheat Sheet PDF (print view).

4.  **Opportunity Radar (`components/radar/`)**
    -   **OpportunityRadar.tsx:**
        -   Visualization: Canvas/HTML based 4-quadrant radar.
        -   Data: Currently mocks job data, filtered by Salary/Location.
        -   Interaction: Clicking dots opens Job Details.

5.  **Re:Turn Hub (`components/return/`)**
    -   **ReturnHub.tsx:** Sub-router for Returner features.
        -   Reuse: Wraps `CVAudit` for the CV portion.
        -   Flex Negotiator: Wizard form -> AI Evaluation -> Chat Simulation.
        -   Roadmap: Wizard form -> AI 90-Day Plan generation.

## 3. Data Flow
1.  **CV Data:** The `cvData` state in `App.tsx` acts as the "source of truth" for the user's profile. It is passed down to:
    -   `Dashboard` (for scoring)
    -   `CVBuilder` (to populate/edit)
    -   `CVAudit` (to view/refine)
    -   `LinkedInSync` (source for content)
    -   `OpportunityRadar` (source for matching - conceptual)
    -   `ReturnHub` (source for review)
    -   `InterviewSimulationLab` (source for interview context)

2.  **AI Requests:** Components call async functions in `geminiService.ts`.
    -   These are stateless requests (except for Chat History which is managed by the component and passed to the service).
    -   Responses are strictly typed (mostly JSON schemas) to ensure UI stability.

## 4. Key Decisions & Trade-offs
-   **No Backend:** To keep development rapid and focused on UX/AI, we use a client-side only architecture. **Trade-off:** API keys must be handled carefully (currently `.env` or direct input), and data doesn't persist across page reloads (browser storage could be added).
-   **Gemini Flash:** Selected `gemini-2.0-flash` for low latency. Critical for "real-time" feel in chat and simulations.
-   **Custom Routing:** Avoided `react-router` to keep the codebase lightweight and the transitions (animations) tightly controlled.
