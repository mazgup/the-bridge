# The Bridge — AI Career Architect

The Bridge is a **production, invite-only** career support platform featuring **AI CV Architect**, a conversational agent that builds industry-standard resumes in real-time using Google Gemini.

## 🚀 Features

### AI CV Builder (Production)
- **4-Path AI Archetype**: AI classifies each user on first message (Bridge Builder / The Coach / The Strategist / The Headhunter) and adapts its entire persona and strategy accordingly.
- **Conversational Interface**: Chat with an AI career strategist to build your CV section-by-section with structured conversation phases.
- **Live PDF Preview**: See your CV evolve in real-time as you chat, with streaming AI responses.
- **Multi-CV Gallery**: Manage multiple CV iterations; create, load, rename, and delete CVs.
- **Auto-Save**: CV data and chat history are automatically saved to `localStorage` on every change.
- **ATS-Optimized Templates**:
  - **Oxford Strict**: Classic, Times-Roman design for Finance/Law.
  - **Modern Impact**: Clean, Roboto/navy-accent design for Tech/Creative.
- **Elastic Layout Engine**: Automatically adjusts spacing and density to fit content on A4.

### Admin Dashboard
- **Invite Management**: Generate, copy, and delete one-time-use invite links (stored in Firestore).
- **User Insights**: View registered users and inspect their CV progress in a read-only builder replica.
- **Feedback Loop**: Monitor user feedback submitted via the global feedback button.

### Auth & Access
- **Invite-Only**: Users must have a valid, unexpired invite link to register.
- **Google Sign-In**: Firebase Auth via Google OAuth.
- **Role-Based**: `user` and `admin` roles stored in Firestore `allowedUsers` collection.

## 🛠️ Usage

### Prerequisites
- Node.js (v24+ recommended)
- Firebase Project (Auth + Firestore + Hosting enabled)

### Quick Start
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up environment — create `.env.local` with:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
   *(Note: The Gemini API key is no longer stored in the frontend environment. It must be provided to Firebase Secrets Manager during backend deployment).*

3. Run locally:
   ```bash
   npm run dev
   ```

### Deployment
To deploy both the frontend application and the secure Server-Sent Events (SSE) Cloud Functions backend:
```bash
# Set your secure Gemini API key in Google Cloud Secret Manager
npx firebase functions:secrets:set GEMINI_API_KEY

# Build the frontend bundle
npm run build

# Deploy Hosting, Firestore Rules/Indexes, and Cloud Functions
npx firebase deploy
```

## 📘 Documentation
For full architecture, AI system design, auth flows, state management, and known issues, see [HANDOVER.md](./HANDOVER.md).
