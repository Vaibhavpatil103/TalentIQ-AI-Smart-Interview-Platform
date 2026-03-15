# 🧠 Talent IQ — Smart Interview Platform

Talent IQ is an advanced, real-time technical interview platform designed to streamline the coding interview process. It provides a collaborative environment for interviewers and candidates with live code editing, video/audio calls, an interactive whiteboard, AI-powered practice interviews, and intelligent performance reviews.

---

## 🚀 Features & Architecture

### 1. Collaborative Interview Experience
- **Real-time Collaborative Code Editor** — Powered by Monaco Editor and Yjs (CRDTs). The backend WebSocket server dynamically synchronizes `Uint8Array` state vectors via `MonacoBinding`, providing conflict-free merging with zero latency.
- **Integrated Video & Audio Calls** — Built on Stream Video SDK (`@stream-io/video-react-sdk`) with high-definition WebRTC video, screen sharing, and mute controls inside the interview session.
- **Live Whiteboard** — Integrated collaborative drawing via `tldraw` for seamless system design and architecture discussions.
- **In-Session Text Chat** — Real-time messaging using Stream Chat (`stream-chat-react`).

### 2. Session Access Control & Security
- **Join Code Authentication** — Sessions generate a unique 6-character join code and invite link. Candidates must enter the correct code or use the link to access sessions — similar to Google Meet.
- **Waiting Room** — When a candidate enters a valid join code, they are placed in a waiting room. The interviewer receives a real-time notification and can **Allow** or **Reject** the participant before they enter the session.
- **Session Isolation** — Active sessions are only visible to their host and participants. Unauthorized users cannot browse or join sessions.
- **Anti-Cheat Mechanics** — Built-in tab violation detection (`useTabDetection.js`) logs how many times a candidate switches tabs during the session. Real-time violation alerts are sent to the interviewer via Socket.io.

### 3. Interview Management & Workflow
- **Code Execution Environment** — Run candidate code securely against multiple languages (JavaScript, Python, Java, C++) directly in the browser via Piston API. Supports passing hidden test cases.
- **Scheduling System** — Native scheduling interface (`ScheduleModal.jsx`) with candidate email input. Dispatches automated invite emails with join code, date/time, and join link.
- **Time Enforcement** — Scheduled sessions block access until 2 minutes before start time. Countdown timer displayed to users. Sessions auto-expire after 15 minutes if no participant joins.
- **Background Job Queues** — Reliable asynchronous task queues powered by Inngest.
- **Automated Email Notifications** — Powered by Nodemailer + Gmail SMTP:
  - **Invite Email** — Sent on session creation with date/time, join code, and join link
  - **Reminder Email** — Sent 30 minutes before session via Inngest cron job
  - **Confirmation Email** — Sent when session ends with duration summary
- **AI Code Review** — Upon session completion, Anthropic's Claude evaluates candidate code on Correctness, Efficiency, and Readability, adding objective AI feedback to the dashboard.
- **Problem Push** — Interviewers can dynamically push coding problems into a live session via `ProblemSelectorPanel`.

### 4. AI Practice Interview Module
- **AI-Powered Practice Interviews** — Candidates can practice mock interviews with an AI interviewer powered by Claude/Gemini.
- **Configurable Sessions** — Choose interview type (Technical, Behavioral, System Design), set question limits and timer durations.
- **Resume Analysis** — Upload a resume (PDF) to extract skills and tailor interview questions.
- **Voice Input** — Voice-to-text support for answering questions hands-free.
- **Practice History** — Full session history with score trends, topic performance breakdown, and downloadable reports.

### 5. Inbox & Communication System
- **Centralized Inbox** — Applicants receive feedback, offer letters, appointment letters, rejection messages, and other official communications.
- **Structured Messaging** — Email-like interface with read/unread status, reply functionality, and real-time updates via Socket.io.
- **Feedback Delivery** — Post-interview feedback is delivered directly to the applicant's inbox.

### 6. Gamification System
- **XP & Leveling** — Earn experience points for completing sessions, practice interviews, and daily challenges.
- **Badges & Achievements** — Unlock badges for milestones (first interview, streaks, perfect scores).
- **Leaderboard** — Compete with other users on the platform.
- **Daily Challenges** — Solve a daily coding problem for bonus XP.

### 7. Comprehensive Dashboards & Tooling
- **Role-Based Access Control** — Admin, Interviewer, Candidate, and Recruiter views with enforced API permissions (`protectRoute.js`).
- **Join Meeting / Create Session** — Dashboard prominently displays both options for instant access.
- **Candidate Pipeline** — Interactive Kanban-style drag-and-drop board built with `@dnd-kit/core` and `@dnd-kit/sortable`.
- **Problem Library** — Curated coding challenges with difficulty tags, markdown descriptions, examples, constraints, and company tracks.
- **Post-Interview Feedback** — Unified scorecards (1-5 scale), interviewer private notes, and final candidate decisions (Hire/No-Hire/Maybe).

---

## 🛠 Complete Tech Stack

### Frontend Architecture (Client)
| Category | Technologies |
|---|---|
| **Framework** | React 19, Vite 7.x |
| **Styling** | Tailwind CSS v4, DaisyUI v5, Lucide React Icons, `canvas-confetti` |
| **State & Data** | React Query (`@tanstack/react-query`), Axios |
| **Authentication** | Clerk React SDK (`@clerk/clerk-react`) |
| **Real-time Collab** | Monaco Editor (`@monaco-editor/react`), Yjs CRDTs (`y-monaco`, `y-websocket`), tldraw Whiteboard |
| **Communication** | Stream Video SDK, Stream Chat, Socket.io Client |
| **Drag & Drop** | dnd-kit (`@dnd-kit/core`, `@dnd-kit/sortable`) |
| **Routing** | React Router v7 |

### Backend Architecture (API & WebSockets)
| Category | Technologies |
|---|---|
| **Runtime** | Node.js v18+, Express 5.x |
| **Database** | MongoDB via Mongoose |
| **Authentication** | Clerk Express Middleware (`@clerk/express`) |
| **Validation** | Zod schema validation |
| **WebSockets** | `ws` (Yjs sync), Socket.io (real-time events) |
| **Background Jobs** | Inngest (`inngest/express`) |
| **Email** | Nodemailer + Gmail SMTP |
| **AI Providers** | Anthropic Claude, Google Gemini, Groq, DeepSeek, NVIDIA Qwen |
| **Video/Chat** | Stream Node SDK (`@stream-io/node-sdk`) |

---

## 📂 Project Structure

```text
talent-IQ-master/
├── backend/
│   ├── .env
│   ├── package.json
│   ├── data/
│   │   └── questions.xlsx
│   └── src/
│       ├── server.js                          # Express + Socket.io + Yjs entry point
│       ├── controllers/
│       │   ├── aiPracticeController.js         # AI practice interview logic
│       │   ├── chatController.js               # Stream chat token
│       │   ├── feedbackController.js           # Interview feedback CRUD
│       │   ├── gamificationController.js       # XP, badges, leaderboard
│       │   ├── inboxController.js              # Inbox messages & replies
│       │   ├── problemController.js            # Problem CRUD + import
│       │   ├── sessionController.js            # Session lifecycle + access control
│       │   └── userController.js               # User profile & roles
│       ├── models/
│       │   ├── AIPracticeSession.js
│       │   ├── Feedback.js
│       │   ├── Message.js
│       │   ├── Problem.js
│       │   ├── Session.js                      # Includes pendingParticipants, joinCode
│       │   ├── User.js
│       │   └── UserProgress.js
│       ├── routes/
│       │   ├── aiPracticeRoutes.js
│       │   ├── chatRoutes.js
│       │   ├── executeRoute.js                 # Piston code execution
│       │   ├── feedbackRoutes.js
│       │   ├── gamificationRoutes.js
│       │   ├── inboxRoutes.js
│       │   ├── problemRoutes.js
│       │   ├── sessionRoute.js                 # Includes approve/reject endpoints
│       │   └── userRoutes.js
│       ├── lib/
│       │   ├── claude.js
│       │   ├── db.js
│       │   ├── deepseek.js
│       │   ├── email.js                        # Nodemailer + Gmail SMTP
│       │   ├── env.js
│       │   ├── gemini.js
│       │   ├── groq.js
│       │   ├── inngest.js
│       │   ├── inngestClient.js
│       │   ├── pdfHelper.cjs
│       │   ├── qwen.js
│       │   └── stream.js
│       ├── middleware/
│       │   ├── protectRoute.js
│       │   ├── upload.js
│       │   ├── uploadResume.js
│       │   └── validateRequest.js
│       ├── jobs/
│       │   ├── aiCodeReview.js
│       │   └── sessionReminder.js
│       └── scripts/
│           ├── cleanupProblems.js
│           ├── importProblems.js               # Excel → GFG scraper → DB
│           └── seedProblems.js
│
└── frontend/
    ├── .env
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── pages/
        │   ├── HomePage.jsx
        │   ├── DashboardPage.jsx
        │   ├── SessionPage.jsx                 # Interview room + access gate + waiting room
        │   ├── SchedulePage.jsx
        │   ├── JoinPage.jsx                    # Join via code
        │   ├── ProblemsPage.jsx
        │   ├── ProblemPage.jsx
        │   ├── InboxPage.jsx
        │   ├── FeedbackPage.jsx
        │   ├── ProfilePage.jsx
        │   ├── AdminPage.jsx
        │   ├── AIPracticePage.jsx
        │   ├── AIPracticeHistoryPage.jsx
        │   ├── DailyChallengePage.jsx
        │   ├── CompanyTracksPage.jsx
        │   └── PipelinePage.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── WelcomeSection.jsx              # Create + Join Meeting buttons
        │   ├── ActiveSessions.jsx
        │   ├── RecentSessions.jsx
        │   ├── CreateSessionModal.jsx
        │   ├── ScheduleModal.jsx               # With candidate email & name
        │   ├── JoinCodeModal.jsx               # Copy code + link sharing
        │   ├── FeedbackModal.jsx
        │   ├── CodeEditorPanel.jsx             # Monaco + Yjs
        │   ├── OutputPanel.jsx
        │   ├── VideoCallUI.jsx
        │   ├── WhiteboardPanel.jsx
        │   ├── ProblemDescription.jsx
        │   ├── ProblemSelectorPanel.jsx
        │   ├── ProblemFilters.jsx
        │   ├── InterviewerNotes.jsx
        │   ├── TabViolationAlert.jsx
        │   ├── ViolationsBanner.jsx
        │   ├── AIChatInterface.jsx
        │   ├── AIFeedbackCard.jsx
        │   ├── SessionHistoryCard.jsx
        │   ├── CandidatePipeline.jsx
        │   ├── CompanyTrackCard.jsx
        │   ├── StatsCards.jsx
        │   ├── BadgeGrid.jsx
        │   ├── XPProgressBar.jsx
        │   ├── QuestionTimer.jsx
        │   └── VoiceInputButton.jsx
        ├── hooks/
        │   ├── useSessions.js                  # Includes approve/reject hooks
        │   ├── useSchedule.js
        │   ├── useProblems.js
        │   ├── useStreamClient.js
        │   ├── useTabDetection.js
        │   ├── useAIPractice.js
        │   └── useAIFeedback.js
        ├── api/
        │   └── sessions.js
        └── lib/
            ├── axios.js
            ├── piston.js
            ├── stream.js
            └── utils.js
```

---

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB connection URI
- API Keys for: **Clerk**, **Stream**, **Inngest**, **Anthropic**, **Google Gemini**
- Gmail App Password (for email notifications)

### Environment Variables

#### Backend (`.env`)
```env
PORT=3000
DB_URL=your_mongodb_uri
CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
STREAM_API_KEY=your_stream_key
STREAM_API_SECRET=your_stream_secret
INNGEST_EVENT_KEY=your_inngest_key
INNGEST_SIGNING_KEY=your_inngest_signing_key
CLAUDE_API_KEY=sk-ant-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=your_gemini_key
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
CLIENT_URL=http://localhost:5173
```

#### Frontend (`.env`)
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_...
VITE_STREAM_API_KEY=your_stream_key
VITE_API_URL=http://localhost:3000/api
```

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

The application will be available at **http://localhost:5173**

---

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sessions` | Create a new session |
| GET | `/api/sessions/active` | Get user's active sessions |
| GET | `/api/sessions/:id` | Get session by ID |
| POST | `/api/sessions/:id/join` | Join session (requires joinCode) |
| POST | `/api/sessions/:id/approve` | Approve waiting participant |
| POST | `/api/sessions/:id/reject` | Reject waiting participant |
| POST | `/api/sessions/:id/end` | End session |
| POST | `/api/sessions/join` | Resolve join code to session ID |
| GET | `/api/sessions/scheduled` | Get scheduled sessions |
| PATCH | `/api/sessions/:id/problem` | Push problem to session |
| GET/POST | `/api/problems` | Problem library CRUD |
| POST | `/api/feedback` | Submit interview feedback |
| GET/POST | `/api/inbox` | Inbox messages |
| POST | `/api/ai-practice` | AI practice sessions |
| GET | `/api/gamification` | XP, badges, leaderboard |
| POST | `/api/execute` | Code execution via Piston |
| GET | `/api/chat/token` | Stream chat token |

---

## 🔒 Security Features

- **Clerk Authentication** — All API routes are protected via Clerk middleware
- **Join Code Enforcement** — Sessions require a valid `sessionId + joinCode` combination
- **Waiting Room** — Host must explicitly approve participants via Socket.io real-time notifications
- **Session Isolation** — `getActiveSessions` only returns sessions where user is host or participant
- **Rate Limiting** — Join-by-code endpoint is rate-limited to 10 requests per minute per IP
- **Tab Violation Detection** — Candidate tab switches are logged and alerted to the interviewer
- **Role-Based Access** — Admin, Interviewer, Candidate, and Recruiter roles with enforced permissions

---

## 📧 Email System

Powered by **Nodemailer + Gmail SMTP** with dark-themed HTML templates:

| Email Type | Trigger | Content |
|---|---|---|
| **Session Invite** | Session scheduled | Date/time, join code, join link |
| **Reminder** | 30 min before session | Reminder with join link |
| **Confirmation** | Session ends | Duration summary, feedback notice |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the ISC License.
