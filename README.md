# The Bridge — AI Career Architect

The Bridge is a next-generation career support platform featuring **AI CV Architect**, a conversational agent that builds industry-standard resumes in real-time.

## 🚀 Features

### AI CV Builder
- **Conversational Interface**: Chat with an AI strategist to build your CV section by section.
- **Live PDF Preview**: See your CV evolve in real-time as you chat.
- **ATS-Optimized Templates**:
  - **Oxford Strict**: Classic, text-heavy design for Finance/Law.
  - **Modern Impact**: Clean, accent-colored design for Tech/Creative.
- **Smart Layout Engine**: "Elastic Layout" automatically adjusts spacing and density to fit content perfectly on A4 pages.

### Admin Dashboard
- **Invite Management**: Generate, track, and delete exclusive invite links.
- **User Insights**: View registered users and inspect their CV progress (Read-Only Admin View).
- **Feedback Loop**: Monitor user feedback directly.

## 🛠️ Usage

### Prerequisites
- Node.js (v24+ recommended)
- Firebase Project

### Quick Start
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up environment:
   - Copy `.env.local.example` to `.env.local`
   - Add your `VITE_GEMINI_API_KEY`
3. Run locally:
   ```bash
   npm run dev
   ```

### Deployment
Deployed via Firebase Hosting:
```bash
npm run build
npx firebase deploy --only hosting
```

## 📘 Documentation
For a deep dive into the architecture, state management, and design decisions, please refer to [HANDOVER.md](./HANDOVER.md).
