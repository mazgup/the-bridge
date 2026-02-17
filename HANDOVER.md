# CV Builder — Agent Handover Document

> **Project**: The Bridge (Naomi)
> **Module**: AI CV Builder
> **Date**: 17 February 2026
> **Status**: Production Ready (Deployed)

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
| Hosting | Firebase Hosting + Firestore |

---

## 2. File Map — What Each File Does

### Core Files

| File | Purpose |
|------|---------|
| `components/cv/CVTypes.ts` | Master TypeScript schema for all CV data (`CVData`, `CVMeta`, `CVContent`). |
| `stores/cvStore.ts` | Zustand store. Manages CV state, multi-CV gallery, and AI merging logic (`mergeFromAI`). |
| `services/geminiService.ts` | Gemini API integration. handles streaming conversation and JSON parsing. |

### UI Components

| File | Purpose |
|------|---------|
| `components/cv/builder/UnifiedBuilder.tsx` | Main Builder Page. Handles "Gallery Mode" (list of CVs) and "Builder Mode" (Chat + PDF). |
| `components/cv/builder/CVChatAgent.tsx` | Chat UI. Handles AI interaction, markdown rendering, and strategy hints. |
| `components/cv/builder/DocRenderer.tsx` | Wrapper for the PDF Viewer. |

### Admin & Auth

| File | Purpose |
|------|---------|
| `components/admin/AdminDashboard.tsx` | Admin Portal. Tabs: Users, Invites, Feedback. **User View** mirrors the Builder UI for read-only inspection. |
| `components/admin/InviteGenerator.tsx` | Invite management. Admins can create, delete, and track invite status. |
| `context/AuthContext.tsx` | Authentication logic. Handles invite redemption and session management. |

### PDF Templates

| File | Purpose |
|------|---------|
| `components/cv/pdf/OxfordStrictPDF.tsx` | **Classic**. Times-Roman, 12pt font, formal layout. Forced non-italic contact info. |
| `components/cv/pdf/ModernImpactPDF.tsx` | **Modern**. Roboto/Helvetica, 12pt font, accent headers. Consistent spacing with Classic. |
| `components/cv/pdf/elasticLayout.ts` | **Layout Engine**. Deterministic algorithm to adjust spacing/density based on content length. |

---

## 3. Latest Updates (Session 2)

### 3.1 Admin Dashboard Enhancements
- **Invite Integrity**: Fixed scrolling issues and added "Delete" functionality for unredeemed invites.
- **User Inspection**: Redesigned the "View User" mode to be a **pixel-perfect replica** of the `UnifiedBuilder` interface (Glassmorphic header, Split View), but in read-only mode.

### 3.2 CV Template Refinements
- **Typography**: Standardized body font size to **12pt** across both templates for better readability.
- **Spacing**: Enforced a consistent **20pt gap** between Name and Contact Info in both templates.
- **Style Overrides**: explicit `fontStyle: 'normal'` added to Classic template to prevent unwanted italics.

### 3.3 Deployment
- **Permissions**: Firestore rules updated to allow admin deletions.
- **Live**: Fully deployed to Firebase Hosting.

---

## 4. Known Issues & Future Work
- **Mobile View**: The PDF preview is hidden on small screens; consider adding a "Preview" tab for mobile.
- **Export**: Currently only PDF export is supported. Word export could be added in the future.
