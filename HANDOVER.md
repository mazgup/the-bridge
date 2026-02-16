# CV Builder — Agent Handover Document

> **Project**: The Bridge (Naomi)
> **Module**: AI CV Builder
> **Date**: 16 February 2026
> **Status**: Functional, in active iteration

---

## 1. Project Overview

The Bridge is a web application with multiple career-support tools. The **AI CV Builder** is a core module that uses Google's Gemini API to guide users through building a professional CV via a conversational AI agent, with a live PDF preview.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React + TypeScript (Vite) |
| State | Zustand |
| PDF | `@react-pdf/renderer` |
| AI | `@google/generative-ai` (Gemini 2.5 Flash) |
| Styling | Vanilla CSS + Tailwind-style utility classes |
| Env | `VITE_GEMINI_API_KEY` |

### Architecture

```
User Input → CVChatAgent.tsx → geminiService.ts (Gemini API)
                                      ↓
                              parseAIResponse() extracts json_cv_update
                                      ↓
                              cvStore.ts (Zustand) mergeFromAI()
                                      ↓
                              UnifiedBuilder.tsx re-renders
                                      ↓
                    OxfordStrictPDF.tsx / ModernImpactPDF.tsx
```

---

## 2. File Map — What Each File Does

### Core Files

| File | Purpose |
|------|---------|
| `components/cv/CVTypes.ts` | Master TypeScript schema for all CV data (`CVData`, `CVMeta`, `CVContent`, etc.). Single source of truth. Also contains backward-compat `CVProfile` alias for older pages. |
| `stores/cvStore.ts` | Zustand store. Holds `cvData`, `editingSection`, `isScreeningComplete`. Key action: `mergeFromAI()` deep-merges AI JSON into state. Also exports `getPhases()` and `CVPhase` types for the phase progress bar. |
| `services/geminiService.ts` | Gemini API integration. Contains system prompt (`getSystemPrompt()`), streaming conversation function, response parser, and stub functions for non-CV features. |

### UI Components

| File | Purpose |
|------|---------|
| `components/cv/builder/UnifiedBuilder.tsx` | Main page. Shows landing page → builder mode. Builder has: top toolbar, phase bar, 50/50 split (chat or editor on left, PDF preview on right). |
| `components/cv/builder/CVChatAgent.tsx` | Chat UI. Streaming messages, `**bold**` markdown rendering, strategy pill, loading states. Calls `streamCVConversation()` and `mergeFromAI()`. |
| `components/cv/builder/CVPhaseBar.tsx` | Horizontal progress stepper: Contact → Experience → Education → Skills → Summary → Review. Auto-computes status from store data. Clicking a phase opens the section editor. |
| `components/cv/builder/CVSectionEditor.tsx` | Manual form editors for each CV section. Pre-populated from store. Supports add/remove of entries, inline bullet editing. Changes go directly to store → PDF re-renders. |

### PDF Templates

| File | Purpose |
|------|---------|
| `components/cv/pdf/OxfordStrictPDF.tsx` | Finance/Law template. Times-Roman, black & white, uppercase headers, 1pt borders. |
| `components/cv/pdf/ModernImpactPDF.tsx` | Tech/Startup template. Helvetica, navy accent (#2C3E50), 2-column skills grid with tag badges. |
| `components/cv/pdf/elasticLayout.ts` | Deterministic layout engine. Counts words → calculates density (loose/normal/tight/ultra-tight) → returns `StyleConfig` with font sizes, margins, spacing. No AI. |

---

## 3. Key Decisions & Rationale

### 3.1 Model Choice: `gemini-2.5-flash`

**Decision**: Switched from `gemini-3-flash-preview` to `gemini-2.5-flash`.
**Why**: The preview model was rate-limited and causing frequent **503 errors** with multi-second delays. The GA model is stable and fast.
**Location**: `geminiService.ts` line 13, `MODEL_NAME` constant.

### 3.2 Dynamic Date Injection

**Decision**: System prompt is now a **function** (`getSystemPrompt()`) that injects today's date dynamically.
**Why**: Gemini's training data cutoff caused it to think recent dates (e.g., "January 2025") were "in the future" and it would question them. By injecting `**TODAY'S DATE: 16 February 2026**` into the prompt, the model knows what's current.
**Location**: `geminiService.ts` lines 34-170.

### 3.3 Advisor Role vs LLM Safety

**Decision**: The AI is instructed to **challenge obvious mistakes** (typos like "2029" instead of "2019"), **embellish descriptions** to sound professional, and **advise improvements** — but **never invent new facts** (companies, qualifications, specific numbers not mentioned by the user).
**Why**: Early version had overly restrictive rules that told the AI to "NEVER question" anything, which defeated the purpose of having a career advisor. The nuanced rules balance helpful challenging with preventing hallucination.
**Location**: `geminiService.ts`, "YOUR ROLE AS AN ADVISOR" section in the system prompt.

### 3.4 Mandatory JSON Output

**Decision**: The system prompt **mandates** a `json_cv_update` block at the end of every AI response that contains new user data.
**Why**: Previously the AI would draft CV content conversationally but never output the structured JSON needed to update the store and PDF preview. Making it mandatory with explicit examples (contact, experience with bullets, meta decisions) fixed the sync issue.
**Location**: `geminiService.ts`, "MANDATORY JSON OUTPUT" section with examples.

### 3.5 Fallback JSON Parser

**Decision**: If no `` `json_cv_update` `` block is found, the parser falls back to extracting any generic `` `json` `` code block that contains `content` or `meta` keys.
**Why**: Despite the mandatory instruction, the AI occasionally uses `` `json` `` instead of `` `json_cv_update` `` as the code block language. The fallback catches these cases.
**Location**: `geminiService.ts`, `parseAIResponse()` function.

### 3.6 Deep Merge in `mergeFromAI()`

**Decision**: The `personal` object is deep-merged using nullish coalescing (`??`) instead of shallow spread.
**Why**: When the AI sends `{ personal: { name: "Mayur" } }`, a shallow spread would wipe `contact` and `links` to `undefined`. Deep merge preserves existing data when the AI only updates one field.
**Location**: `cvStore.ts`, `mergeFromAI` action.

### 3.7 Condensed PDF Spacing

**Decision**: All elastic layout density levels and both PDF templates were significantly tightened.
**Why**: User compared output to Rezi.ai and found excessive whitespace. Margins reduced from 72pt→40pt (loose) / 36pt→28pt (ultra-tight). Section spacing, bullet spacing, entry spacing, font sizes, and line heights all reduced proportionally.
**Location**: `elasticLayout.ts` (`getStyleConfig()`), `OxfordStrictPDF.tsx`, `ModernImpactPDF.tsx`.

### 3.8 Phase Progress Bar

**Decision**: Added a horizontal stepper above both panels showing Contact → Experience → Education → Skills → Summary → Review.
**Why**: Users had no visibility into where they were in the process or how long it would take. The bar auto-advances based on what data exists in the store (e.g., once `personal.name` is set → Contact is "done").
**Location**: `CVPhaseBar.tsx`, phase computation in `cvStore.ts` (`getPhases()`, `computeActivePhase()`).

### 3.9 Manual Section Editing

**Decision**: Clicking a completed or active phase pill opens a form editor in the left panel (replacing the chat).
**Why**: Users couldn't directly fix dates, wording, or details without asking the AI. The form editors support add/remove of entries, inline bullet editing, and changes go directly to the store so the PDF updates in real-time.
**Location**: `CVSectionEditor.tsx`, `editingSection` state in `cvStore.ts`.

### 3.10 Bold Key Phrases in AI Questions

**Decision**: The AI is instructed to bold the most important part of each question.
**Why**: Users found the AI's questions long and overwhelming. Bolding the core ask (e.g., "What's **your email address** and **which city** are you based in?") makes it scannable.
**Location**: `geminiService.ts`, rule #5 in system prompt. Rendering handled by `renderText()` in `CVChatAgent.tsx` (splits on `**...**` regex).

---

## 4. Data Flow — End to End

### 4.1 User sends a message

1. `CVChatAgent.handleSend()` snapshots chat history
2. Calls `streamCVConversation(history, cvData, userMessage, onChunk)`
3. `streamCVConversation()` in `geminiService.ts`:
   - Calls `getSystemPrompt()` to get system prompt with today's date
   - Sanitizes chat history (Gemini requires alternating user/model, starting with user)
   - Builds context message: `User says: "..." + Current CV State: {JSON}`
   - Streams response via `chat.sendMessageStream()`
   - `onChunk` callback strips `json_cv_update` blocks from visible text during streaming
4. After stream completes, `parseAIResponse(fullText, currentCV)`:
   - Extracts `[STRATEGY]` blocks → `explanation`
   - Extracts `json_cv_update` block → `cvUpdate` (with fallback to generic `json` block)
   - Strips both from visible `message`
5. Back in `CVChatAgent`:
   - Sets final message text
   - If `response.cvUpdate` exists → calls `mergeFromAI(response.cvUpdate)`
   - `mergeFromAI` deep-merges into Zustand store
   - Store update triggers React re-render → `UnifiedBuilder` memoized `PDFDocument` re-creates → `PDFViewer` shows updated preview

### 4.2 User manually edits via section editor

1. User clicks a phase pill in `CVPhaseBar`
2. Sets `editingSection` in store (e.g., `'experience'`)
3. `UnifiedBuilder` conditionally renders `CVSectionEditor` instead of `CVChatAgent`
4. Form changes call `updateContent()` directly on the store
5. Store update → PDF re-render (same path as AI updates)

---

## 5. Known Issues & Gotchas

### 5.1 AI Doesn't Always Output JSON

Despite the mandatory instruction, the AI occasionally forgets the `json_cv_update` block, especially during purely conversational turns (e.g., "That's great!"). The fallback parser helps but doesn't solve cases where the AI outputs no code block at all. **Potential fix**: Post-process each response — if the AI message references new data but no JSON was parsed, prompt the AI to re-emit the block.

### 5.2 Chat History Sanitization

Gemini requires chat history to start with a `user` message and alternate strictly. The sanitizer in `streamCVConversation()` handles this but it's fragile — consecutive same-role messages cause issues. Current fix: skip messages until we find the first `user` message, then alternate.

### 5.3 The `CVProfile` Legacy Type

`CVTypes.ts` contains both the new `CVData` type (used by the builder) and the old `CVProfile` type (used by Dashboard, ReturnHub, NegotiationCenter, etc.). These are **not interchangeable**. The old type uses different field names (`personal_info` vs `personal`, `school` vs `institution`, etc.). Any new code should use `CVData` exclusively.

### 5.4 PDF Template Null Safety

Both PDF templates defensively default all arrays with `|| []` at the top of the component. This was added because the AI sends partial data during conversation (e.g., just a name with no experience yet), which caused `TypeError` crashes in `elasticLayout.ts` when iterating arrays.

### 5.5 Context Message Size

The full CV state is always sent with every message (`JSON.stringify(currentCV, null, 2)`). For large CVs this could approach token limits. Not an issue currently but worth monitoring.

---

## 6. Current State

### What Works

- ✅ AI conversational flow with streaming responses
- ✅ Bold formatting in AI questions
- ✅ JSON parsing and CV store updates
- ✅ Live PDF preview (both Oxford and Modern templates)
- ✅ Phase progress bar with auto-advancement
- ✅ Manual section editing (all 5 sections + review)
- ✅ Template switching (Oxford ↔ Modern)
- ✅ PDF export/download
- ✅ Dynamic date awareness (today's date injected)
- ✅ Condensed PDF layout matching professional tools
- ✅ TypeScript build: zero errors

### What Needs Testing

- 🔶 Full end-to-end flow: new conversation → complete CV → export
- 🔶 2-page CV layout (target_pages=2 in meta)
- 🔶 Phase bar accuracy across edge cases (e.g., user jumps back to edit contact after skills)
- 🔶 Manual edits persisting correctly when switching back to chat mode
- 🔶 AI response quality with the refined advisor prompt

### What's Not Built Yet

- ❌ Import Resume feature (button exists, shows "coming soon" alert)
- ❌ LinkedIn sync integration (component exists at `components/cv/LinkedInSync.tsx` but not wired in)
- ❌ Multi-page PDF rendering (single `<Page>` component, content may overflow)
- ❌ Undo/redo for manual edits
- ❌ Chat history persistence (lost on page refresh)
- ❌ Mobile responsive layout (min-width 400px on chat panel)

---

## 7. Environment Setup

```bash
# Install dependencies
cd the-bridge
npm install

# Set Gemini API key
# Create .env file with:
VITE_GEMINI_API_KEY=your_key_here

# Run dev server
npm run dev

# Type check
npx tsc --noEmit
```

---

## 8. File Modification Log (This Session)

| File | Change | Lines |
|------|--------|-------|
| `services/geminiService.ts` | Switched model to `gemini-2.5-flash`, made JSON output mandatory with examples, added bold formatting rule, forgiving regex, fallback JSON parser, dynamic date injection, nuanced advisor rules, dev logging | Multiple |
| `stores/cvStore.ts` | Added `editingSection` state, `CVPhase` types, `getPhases()` computation, `setEditingSection` action, dev logging in `mergeFromAI`, deep merge for personal object | Full rewrite |
| `components/cv/builder/CVPhaseBar.tsx` | **NEW** — Horizontal progress stepper | 95 lines |
| `components/cv/builder/CVSectionEditor.tsx` | **NEW** — Form editors (Contact, Experience, Education, Skills, Summary, Review) | ~280 lines |
| `components/cv/builder/UnifiedBuilder.tsx` | Added phase bar, conditional editor/chat rendering | Full rewrite |
| `components/cv/builder/CVChatAgent.tsx` | Updated model label in header | Line 142 |
| `components/cv/pdf/elasticLayout.ts` | Condensed all 4 density levels (margins, fonts, spacing) | Full rewrite |
| `components/cv/pdf/OxfordStrictPDF.tsx` | Tightened all spacing values | Full rewrite |
| `components/cv/pdf/ModernImpactPDF.tsx` | Tightened all spacing values | Full rewrite |
