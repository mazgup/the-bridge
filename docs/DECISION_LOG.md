# Decision Log

## Phase 1: Initial Concept
-   **Decision:** Focus on "Professional Sanctuary" aesthetic.
-   **Reason:** Career platforms are usually sterile or chaotic. We wanted "Calm Authority."
-   **Implementation:** Used Glassmorphism, specific color palette (Slate/Sage/Lilac).

## Phase 2: Core Modules
-   **Decision:** Split "CV Building" from "CV Auditing".
-   **Reason:** Users are in two states: "I have nothing" (Builder) or "I have a draft" (Audit).
-   **Decision:** Use a "Radar" for jobs instead of a list.
-   **Reason:** Lists are overwhelming. Radar visualizes "fit" and "sector" instantly.

## Phase 3: AI Integration
-   **Decision:** Use JSON Schema enforcement for AI responses.
-   **Reason:** Unstructured text breaks UI components. We enforce strictly typed JSON return values from Gemini to populate charts, lists, and scores reliably.
-   **Decision:** Implement "Co-Pilot" sidebar.
-   **Reason:** Users shouldn't leave the editor to get feedback. It should be contextual and immediate.

## Phase 4: Refinement (Current State)
-   **Decision:** Fold "Salary Negotiation" and "Flexible Working" tools into **Re:Turn Hub**.
-   **Reason:** These features are most critical for the "Returner" persona. Standalone tools cluttered the dashboard.
-   **Decision:** Rename "Simulation Lab" to "Interview Simulation Lab".
-   **Reason:** Clarity. Users didn't know what "Simulation" meant.
-   **Decision:** Add "Cheat Sheets".
-   **Reason:** Users need a tangible takeaway from prep sessions. A printable one-pager is high value.
-   **Decision:** Add "LinkedIn Sync".
-   **Reason:** The CV is only half the battle. Your public profile must match. AI is perfect for rewriting formal CV text into social-ready text.
-   **Decision:** Update Opportunity Radar for £25k-£70k band.
-   **Reason:** Aligns with target demographic (Mid-Senior professionals, not C-Suite yet).

## Phase 5: Technical
-   **Decision:** Client-side AI calls.
-   **Reason:** rapid prototyping without managing a Node/Python backend.
-   **Constraint:** Data persistence is currently ephemeral (session-based). Future update should add LocalStorage or Firebase.
