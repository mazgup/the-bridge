# System Architecture & Component Interaction

> **Updated:** 28 February 2026

## 1. High-Level Flow

The application is a **Single Page Application (SPA)** built with React 19 + Vite 6.

`App.tsx` is the central router, managing `activePath` state to determine which module to render. The entire app is wrapped in `AuthProvider` from `context/AuthContext.tsx`.

```
AuthProvider (context/AuthContext.tsx)
└── AppContent (App.tsx)
    ├── InviteLanding  ← /invite/:id (pre-auth route)
    ├── SignInPage     ← unauthenticated state
    ├── AccessDenied   ← authenticated but not in allowedUsers
    └── [Authenticated Layout]
        ├── Sidebar (left)
        ├── Main Content (right) ← module rendered by activePath
        └── FeedbackButton (floating global)
```

## 2. Component Hierarchy

### Root: `App.tsx`
-   State: `activePath`, `sidebarOpen`, `sidebarCollapsed`, `cvData` (legacy — use Zustand store instead).
-   Layout: `Sidebar` (left) + `main` (right).
-   Routes: `/` → Dashboard, `/cv-builder` → UnifiedBuilder, `/linkedin-sync` → LinkedInSync, `/radar` → OpportunityRadar, `/admin` → AdminDashboard (admin only).

### Feature: CV Builder (`components/cv/builder/`)
1.  **`UnifiedBuilder.tsx`**: Controls Gallery Mode vs Builder Mode via `isBuilderActive` in Zustand store.
    -   **Gallery Mode**: Shows `savedCvs` list; allows create/load/delete.
    -   **Builder Mode**: Shows `CVChatAgent` (left) + `DocRenderer` → PDF (right).
2.  **`CVChatAgent.tsx`**: Chat UI. Manages streaming AI responses, renders markdown, shows strategy hints and phase progress bar. Calls `streamCVConversation` from `geminiService.ts`.
3.  **`DocRenderer.tsx`**: PDF viewer wrapper. Chooses `OxfordStrictPDF` or `ModernImpactPDF` based on `cvData.meta.template`.

### Feature: Auth (`context/AuthContext.tsx`)
-   Listens to Firebase Auth state changes via `onAuthStateChanged`.
-   On sign-in, calls `checkAuthorization(user)`:
    1. Checks `allowedUsers/{email}` in Firestore.
    2. If not found, checks `sessionStorage` for `pendingInviteId` and redeems it.
    3. Admin emails always self-register.
-   Exposes: `user`, `loading`, `isAuthorized`, `isAdmin`, `accessDenied`, `signInWithGoogle`, `logout`, `devLogin`.

### Feature: Admin (`components/admin/`)
-   **`AdminDashboard.tsx`**: Tabbed view (Users / Invites / Feedback). User View renders a read-only replica of the builder.
-   **`InviteGenerator.tsx`**: Creates invites in Firestore with expiry date. Lists/deletes existing invites.

## 3. Data Flow

### CV Data (Primary Flow)
```
User types in CVChatAgent
→ streamCVConversation (geminiService.ts)
→ AI streams response token-by-token
→ parseAIResponse extracts json_cv_update block
→ cvStore.mergeFromAI normalises and merges data
→ cvData in Zustand updates
→ DocRenderer re-renders PDF live
→ Auto-save subscriber: saves to localStorage after 1s debounce
```

### Auth Flow
```
User visits /invite/:id
→ InviteLanding validates invite in Firestore
→ sessionStorage.setItem('pendingInviteId', id)
→ User clicks "Sign In with Google"
→ Firebase Auth popup
→ onAuthStateChanged fires
→ AuthContext.checkAuthorization redeems invite
→ User created in allowedUsers collection
→ Invite marked used: true
→ isAuthorized = true → redirect to /
```

## 4. State Management (Zustand `cvStore.ts`)

| State Key | Type | Description |
|-----------|------|-------------|
| `activeCvId` | `string \| null` | UUID of the CV being edited |
| `cvData` | `CVData` | Full CV data object |
| `messages` | `ChatMessage[]` | AI chat history |
| `isBuilderActive` | `boolean` | Gallery vs Builder mode |
| `savedCvs` | `CVSummary[]` | Index of all CVs (persisted to localStorage) |
| `editingSection` | `CVPhase \| null` | Active conversation phase |
| `uploadedCVText` | `string \| null` | Raw text from uploaded CV file |

**LocalStorage keys:**
- `cv-saved-list`: JSON array of `CVSummary` (the gallery index).
- `cv-active-session`: JSON of `{ id, cvData, messages }` for the active session.

## 5. Firestore Collections

| Collection | Access | Purpose |
|------------|--------|---------|
| `allowedUsers/{email}` | User: own record. Admin: all. | User registry (role, uid, lastActive) |
| `invites/{inviteId}` | Anyone: read. Admin: create/delete. Auth: update (mark used). | Invite links |
| `feedback/{id}` | Auth: create. Admin: read. | User feedback |
| `users/{uid}` | Owner: read/write. Admin: read. | Reserved for future user data (currently unused) |

## 6. Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **No `react-router`** | Keeps bundle lean; transitions are tightly controlled via `activePath` state. |
| **Zustand over Context/Redux** | Simpler API, less boilerplate, easy selector pattern. |
| **localStorage for CV data** | Rapid iteration. Next step: migrate to Firestore for cross-device sync. |
| **Gemini 2.5 Flash** | Low latency critical for real-time streaming feel in chat. |
| **Invite-only access** | Controlled rollout; maintains quality of user base during beta. |
| **Hardcoded admin emails** | Avoids a separate admin invite flow; acceptable for current scale. |
