# Technical Stack & Architecture

## 1. Core Framework (Frontend Only - Temporary)
**Current Status:** This is a frontend-only prototype for rapid iteration. A backend is required for production.
-   **Frontend:** [React](https://react.dev/) (v18.2)
-   **Language:** [TypeScript](https://www.typescriptlang.org/) (v5.2)
-   **Build Tool:** [Vite](https://vitejs.dev/) (v5.2)
-   **Routing:** Custom state-based SPA navigation (simple, no `react-router-dom`).

## 2. UI & Styling
-   **Framework:** [Tailwind CSS](https://tailwindcss.com/) (v3.4)
-   **Theme:** Custom `tailwind.config.js` with brand colors (`bridge-slate`, `bridge-sage`, `bridge-lilac`) and animations (`fade-in`, `slide-up`, `slide-down`).
-   **Icons:** [Lucide React](https://lucide.dev/) (v0.344)
-   **Fonts:** `Outfit` (Sans-serif) and `Playfair Display` (Serif).

## 3. Data & State Management (Temporary)
-   **Current:** Local component state (React `useState`). No persistence.
-   **Required:** A backend (Node/Express, Python, or Supabase) to manage users, CVs, and history.

## 4. AI Integration (The Core)
-   **Provider:** [Google Gemini](https://ai.google.dev/) (via `@google/genai` SDK).
-   **Model:** `gemini-2.0-flash` (optimized for speed/cost).
-   **Service Layer:** `services/geminiService.ts` handles all AI interactions.
    -   **Functions:**
        -   `getDailyInspiration()`
        -   `analyzeJobMatch()`
        -   `findOpportunities()` (currently mocked for demo)
        -   `generateBattleCard()`
        -   `startCVChat()` / `continueCVChat()` / `generateCVFromChat()`
        -   `generateSkillsBasedCV()`
        -   `enhanceExperience()` / `suggestGapStrategy()` / `auditConfidence()`
        -   `generateLinkedInContent()`
        -   `startInterviewSimulation()` / `analyzeInterviewAnswer()`
        -   `generateInterviewCheatSheet()`
        -   `evaluateFlexRequest()` / `getFlexSimulationStart()` / `generateReturnRoadmap()`

## 5. Deployment & Environment
-   **Environment Variables:** `.env` for `VITE_GEMINI_API_KEY`.
-   **Hosting:** Compatible with any static site host (Vercel, Netlify, GitHub Pages).

## 6. Project Structure
```
the-bridge/
├── src/
│   ├── components/         # React Components
│   │   ├── cv/             # CV Studio (Audit, Builder, Co-Pilot, LinkedIn Sync)
│   │   ├── radar/          # Opportunity Radar
│   │   ├── return/         # Re:Turn Hub (Flex Negotiator, Roadmap)
│   │   ├── simulation/     # Interview Simulation Lab
│   │   ├── knowledge/      # Knowledge Briefs (optional/future)
│   │   ├── Dashboard.tsx   # Main Dashboard
│   │   ├── Sidebar.tsx     # Navigation
│   │   ├── GlassCard.tsx   # Reusable UI Component
│   │   ├── TermsAndConditions.tsx
│   │   └── ...
│   ├── services/           # API Services
│   │   └── geminiService.ts # AI Logic (Frontend Proxy)
│   ├── App.tsx             # Main App Component & Routing
│   ├── constants.ts        # Global Config & Mock Data
│   ├── types.ts            # TypeScript Interfaces
│   ├── index.css           # Global Styles & Tailwind Directives
│   └── main.tsx            # Entry Point
├── public/                 # Static Assets
├── docs/                   # Documentation (Handover, Specs, Guides)
├── index.html              # HTML Template
├── package.json            # Dependencies
├── tailwind.config.js      # Theme Config
├── tsconfig.json           # TypeScript Config
└── vite.config.ts          # Vite Config
```
