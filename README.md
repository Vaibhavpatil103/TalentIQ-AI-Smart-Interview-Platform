# 🧠 Talent IQ (Technical Interview Platform)

Talent IQ is an advanced, real-time technical interview platform designed to streamline the coding interview process. It provides a collaborative environment for interviewers and candidates with live code editing, video/audio calls, an interactive whiteboard, and AI-assisted performance reviews.

---

## 🚀 Features & Architecture

### 1. Collaborative Interview Experience
- **Real-time Collaborative Code Editor**: Powered by Monaco Editor and Yjs (CRDTs). The backend WebSocket server dynamically synchronizes `Uint8Array` state vectors via the `MonacoBinding`, meaning text merges perfectly even if conflicts happen with zero latency.
- **Integrated Video & Audio Calls**: Built on top of Stream Video SDK (`@stream-io/video-react-sdk`). Provides isolated, high-definition WebRTC video, screen sharing, and mute controls inside the interview session.
- **Live Whiteboard**: Integrated collaborative drawing via `tldraw` for seamless system design and architecture discussions.
- **In-Session Text Chat**: Real-time messaging using Stream Chat (`stream-chat-react`).

### 2. Interview Management & Workflow
- **Code Execution Environment**: Run candidate code securely against multiple languages (JavaScript, Python, Java, C++) directly in the browser via Piston API endpoints. Supports passing hidden test cases.
- **Scheduling System**: Native scheduling interface (`ScheduleModal.jsx`) that dispatches automated calendar email invites.
- **Background Jobs queues**: Reliable asynchronous task queues powered by Inngest. 
- **Automated Reminders**: Sends 30-minute reminder emails via Resend triggered by `session-reminder` Inngest cron jobs.
- **AI Code Review**: Upon session completion, Anthropic's Claude 3.5 Sonnet evaluates candidate code based on Correctness, Efficiency, and Readability, adding objective AI feedback to the interviewer's dashboard.

### 3. Comprehensive Dashboards & Tooling
- **Role-Based Access Control**: Enforced Admin, Interviewer, Candidate, and Recruiter views and API permissions (`protectRoute.js` middlewares).
- **Candidate Pipeline**: Interactive Kanban-style drag-and-drop board for candidate tracking built entirely from scratch with `@dnd-kit/core` and `@dnd-kit/sortable`.
- **Problem Library**: Curated coding challenges with difficulty tags, markdown descriptions, constraints, and test cases.
- **Anti-Cheat Mechanics**: Built-in tab violation detection (`useTabDetection.js`) logs how many times a candidate switches tabs during the session.
- **Post-Interview Feedback System**: Dedicated portals to submit unified scorecards (1-5 scale), interviewer private notes, and final candidate decisions (Hire/No-Hire/Maybe).

---

## 🛠 Complete Tech Stack

### Frontend Architecture (Client)
- **Framework**: React 18, Vite 5.x
- **Styling**: Tailwind CSS v4, DaisyUI v5, Lucide React (Icons), `canvas-confetti` (for feedback success views)
- **State Management & Data Fetching**: React Query (`@tanstack/react-query`), Axios (`axios`)
- **Authentication**: Clerk React SDK (`@clerk/clerk-react`)
- **Real-time Collab**: Monaco Editor (`@monaco-editor/react`), CRDT Engine (`yjs`), Bindings (`y-monaco`, `y-websocket`), Whiteboard (`@tldraw/tldraw`)
- **Communication Pipelines**: Stream Video SDK (`@stream-io/video-react-sdk`), Stream Chat (`stream-chat-react`)
- **Drag & Drop**: dnd-kit (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`)
- **Routing**: React Router v7 (`react-router`)

### Backend Architecture (API & WebSockets)
- **Runtime & Framework**: Node.js v18+, Express 5.x
- **Database & ORM**: MongoDB via Mongoose (`mongoose`)
- **Authentication Gateway**: Clerk Express Middleware (`@clerk/express`)
- **Data Integrity & Validation**: Zod schema validation (`zod`)
- **WebSockets**: Native `ws` library routing ad-hoc Yjs Documents bytes synchronization.
- **Background Processing Engine**: Inngest (`inngest/express`) 
- **3rd Party Integrations**: 
  - Anthropic SDK (`@anthropic-ai/sdk`)
  - Resend (`resend`)
  - Stream Node SDK (`@stream-io/node-sdk`)

---

## 📂 Detailed Project Structure

```text
talent-IQ-master/
├── backend/                  # Express/Node API Server
│   ├── .env                  # Backend Environment variables
│   ├── package.json          # Node dependencies
│   └── src/
│       ├── controllers/      # Business logic handlers
│       │   ├── chatController.js      # Stream JWT token generation
│       │   ├── feedbackController.js  # Scorecard logic
│       │   ├── problemController.js   # Problem library CRUD
│       │   ├── sessionController.js   # Live interview room logic
│       │   └── userController.js      # Profiles and history
│       ├── jobs/             # Inngest Background Queue Jobs
│       │   ├── aiCodeReview.js        # Claude AST analysis trigger
│       │   └── sessionReminder.js     # Scheduled email dispatches
│       ├── lib/              # Core Integrations & Singleton clients
│       │   ├── db.js             # MongoDB connector
│       │   ├── email.js          # Resend templates configuration
│       │   ├── env.js            # Dotenv config
│       │   ├── inngest.js        # Inngest function registries
│       │   ├── inngestClient.js  # Client instance
│       │   └── stream.js         # Stream Chat & Video config
│       ├── middleware/       # Express middlewares
│       │   ├── protectRoute.js   # RBAC & Clerk token parsers
│       │   └── validateRequest.js# Zod body validators
│       ├── models/           # Mongoose Database Schemas
│       │   ├── Feedback.js
│       │   ├── Problem.js
│       │   ├── Session.js
│       │   └── User.js
│       ├── routes/           # Express Route definitions
│       │   ├── chatRoutes.js
│       │   ├── feedbackRoutes.js
│       │   ├── problemRoutes.js
│       │   ├── sessionRoute.js
│       │   └── userRoutes.js
│       └── server.js         # Backend Entry point & WebSocket server
│
└── frontend/                 # React/Vite Application
    ├── .env                  # Frontend Environment variables
    ├── index.html            # Entry HTML document
    ├── package.json          # React dependencies
    └── src/
        ├── App.jsx           # Root layout & routing config
        ├── index.css         # Global Tailwind styles
        ├── main.jsx          # React DOM entry
        ├── components/       # Reusable UI React components
        │   ├── AIFeedbackCard.jsx
        │   ├── ActiveSessions.jsx
        │   ├── CandidatePipeline.jsx  # Kanban board logic
        │   ├── CodeEditorPanel.jsx    # Monaco Yjs integration
        │   ├── CreateSessionModal.jsx
        │   ├── FeedbackModal.jsx
        │   ├── InterviewerNotes.jsx
        │   ├── Navbar.jsx
        │   ├── OutputPanel.jsx        # Piston compilation stdout
        │   ├── ProblemDescription.jsx
        │   ├── ProblemFilters.jsx
        │   ├── RecentSessions.jsx
        │   ├── ScheduleModal.jsx
        │   ├── StatsCards.jsx
        │   ├── TabViolationAlert.jsx  # Cheat detection UI
        │   ├── VideoCallUI.jsx        # WebRTC container
        │   ├── WelcomeSection.jsx
        │   └── WhiteboardPanel.jsx    # tldraw container
        ├── hooks/            # Custom React Query & Functional hooks
        │   ├── useAIFeedback.js
        │   ├── useProblems.js
        │   ├── useSchedule.js
        │   ├── useSessions.js
        │   ├── useStreamClient.js
        │   └── useTabDetection.js
        ├── lib/              # Frontend utilities and API clients
        │   ├── axios.js          # REST Client config
        │   ├── piston.js         # Evaluation sandbox client
        │   ├── stream.js         # Call integration
        │   └── utils.js          
        └── pages/            # Application routes & Views
            ├── AdminPage.jsx
            ├── DashboardPage.jsx
            ├── FeedbackPage.jsx
            ├── HomePage.jsx
            ├── PipelinePage.jsx
            ├── ProblemPage.jsx
            ├── ProblemsPage.jsx
            ├── ProfilePage.jsx
            ├── SchedulePage.jsx
            └── SessionPage.jsx
```

---

## 🏃‍♂️ Getting Started 

### Prerequisites
- Node.js (v18+)
- MongoDB connection URI
- API Keys for Clerk, Stream, Inngest, Resend, and Anthropic.

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
