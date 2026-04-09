# 🧠 Talent IQ — Smart Interview Platform

**Talent IQ** is a production-hardened, real-time technical interview platform designed to modernize the tech hiring process. It provides a collaborative zero-latency environment for interviewers and candidates, featuring live code editing, WebRTC video/audio calls, interactive whiteboarding, AI-powered practice interviews, intelligent performance reviews, and robust zero-trust security architecture.

---

## ✨ What's New? (Recent Production Updates)
- **Zero-Trust Session Data Sanitization**: Implemented secure payload stripping for unauthenticated users, preventing the leakage of PII and private `joinCode` combinations while preserving smooth Pre-Join "Access Gate" functionality.
- **Cross-Role Session Access**: Redesigned authorization workflows to natively allow cross-role collaboration (e.g., Recruiters hosting sessions for Developer candidates) without hitting restrictive API access barriers. 
- **Production UI/UX Modernization**: Completely refactored the design system utilizing **Framer Motion** for premium micro-interactions, cohesive dark mode color mapping, and animated live-interview hero mockups.
- **Deterministic Email Delivery**: Refactored the Nodemailer/Gmail SMTP engine to leverage lazy-loaded instance initialization, guaranteeing that environment variables are strictly populated upon the first outgoing email (Invite/Reminder/Confirmation).
- **Zod-Based Pagination & API Hardening**: Secured the monolithic server backend against mass data extraction and unbound memory processing by introducing rigorous Zod request validations and native infinite-scroll pagination standardizations.
- **Strict Interviewer Control**: Restructured session websockets so that **only the designated host** maintains the core privilege to instantly push new coding problems into the active environment, eliminating candidate bypasses.

---

## 🚀 Core Features & Architecture

### 1. Collaborative Interview Experience
- **Real-time Collaborative Code Editor** — Powered by Monaco Editor and Yjs (CRDTs). The backend WebSocket server dynamically synchronizes `Uint8Array` state vectors via `MonacoBinding`, providing conflict-free merging with zero latency.
- **Integrated Video & Audio Calls** — Built on Stream Video SDK (`@stream-io/video-react-sdk`) with high-definition WebRTC video, screen sharing, and mute controls embedded seamlessly into the interview session.
- **Live Whiteboard** — Integrated collaborative drawing via `tldraw` for seamless system design and architecture discussions.
- **In-Session Text Chat** — Real-time messaging using Stream Chat (`stream-chat-react`).

### 2. Session Access Control & Strict Security
- **Join Code Authentication & Zero-Trust Metadata** — Candidates interact with an "Access Gate" before entering securely-isolated interviews. Session details are rigorously stripped of sensitive codes and emails until the candidate verifies themselves by inputting a valid 6-character hex code or is pre-verified. 
- **Waiting Room** — When a candidate enters a valid join code, they are placed in a waiting room. The interviewer receives a real-time notification and can **Allow** or **Reject** the participant before they enter the session.
- **Session Isolation** — Active sessions are perfectly restricted. A `403 Forbidden` API barrier (shielded by ObjectId authorization) controls access dynamically. 
- **Anti-Cheat Mechanics** — Built-in tab violation detection (`useTabDetection.js`) logs how many times a candidate switches tabs during the session. Real-time violation alerts are broadcasted simultaneously to the interviewer via Socket.io.

### 3. Interview Management & Workflow
- **Code Execution Environment** — Run candidate code securely against multiple languages (JavaScript, Python, Java, C++) directly in the browser via Piston API. Supports compiling and parsing hidden test cases against user code variations.
- **Scheduling System** — Native scheduling interface (`ScheduleModal.jsx`) handling robust asynchronous calendar creation.
- **Background Job Queues** — Reliable asynchronous task queues powered by **Inngest**.
- **Automated SMTP Email Notifications** — Lazy-loaded **Nodemailer + Gmail SMTP** pipelines:
  - **Invite Email**: Dispatched on session creation with date/time, localized timezones, and join links.
  - **Reminder Email**: Sent automatically 30 minutes before the session via an Inngest cron function.
  - **Confirmation Email**: Sent upon interview finalization with duration metrics appended.
- **AI Code Review** — Upon session completion, Anthropic's Claude/Gemini heavily evaluates candidate code on Correctness/Efficiency/Readability dimensions to automatically draft objective AI feedback reports.

### 4. AI Practice Interview Module
- **AI-Powered Mock Interviews** — Candidates practice against configurable AI profiles.
- **Configurable Contexts** — Choose from Technical, Behavioral, and System Design patterns with rigorous question limits and countdown configurations.
- **Resume-Driven Context** — Candidates upload resumes (PDF parsing), which prompts AI logic models to immediately adapt technical questions toward candidate experiences.
- **Voice-to-Text Support** — Hands-free verbal interactions powering a real-life human conversation mechanism.
- **Score Analytics** — Aggregated metric tracking parsing historical trends across performance metrics.

### 5. Job Configuration & Centralized Pipelines
- **Dynamic Candidate Pipeline** — Kanban-style drag-and-drop board directly manipulating candidate statuses. Powered by optimized `@dnd-kit/core` constraints.
- **Inbox & Communication System** — Asynchronous direct messages delivering interview feedback, offer/rejection templates, and read/unread acknowledgement.

### 6. Gamification System
- **XP & Leveling Ecosystem** — Progressive scoring model measuring candidate consistency over technical challenges.
- **Badges & Achievements** — Achievement grids recognizing unique coding milestones and optimal efficiencies.
- **Leaderboard Rankings** — Fostering competitive improvements globally.

---

## 🛠 Complete Tech Stack

### Frontend Architecture (Client)
| Category | Technologies |
|---|---|
| **Framework & Build Tools** | React 19, Vite 7.x |
| **Styling** | Tailwind CSS v4, DaisyUI v5, ShadCN UI elements, Lucide React Icons |
| **Animations** | Framer Motion (premium micro-interactions), `canvas-confetti` |
| **State & Data Mutating** | React Query (`@tanstack/react-query`), Axios |
| **Authentication** | Clerk React SDK (`@clerk/clerk-react`) |
| **Real-time Collab** | Monaco Editor (`@monaco-editor/react`), Yjs CRDTs (`y-monaco`, `y-websocket`), tldraw |
| **Communication / Video** | Stream Video SDK, Stream Chat, Socket.io Client |
| **Drag & Drop Pipelines** | dnd-kit (`@dnd-kit/core`, `@dnd-kit/sortable`) |
| **Routing** | React Router v7 |

### Backend Architecture (API & WebSockets)
| Category | Technologies |
|---|---|
| **Runtime & Framework** | Node.js v18+, Express 5.x |
| **Database** | MongoDB via Mongoose (with advanced indexing & pagination) |
| **Data Validation** | Zod (Rigorous payload & schema validation) |
| **Authentication** | Clerk Express Middleware (`@clerk/express`) |
| **Real-time WebSockets** | `ws` (Yjs peer syncing array buffers), Socket.io (real-time signaling events) |
| **Background Jobs/Cron** | Inngest (`inngest/express`) |
| **Transactional Email** | Nodemailer (Lazy-loaded transport initialization) |
| **External AI Integration** | Anthropic Claude SDK, Google Gemini SDK, Groq SDK |
| **RCE (Remote Code Exec)** | Piston standard environments |

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
│       │   ├── sessionController.js            # Hardened session lifecycle + zero-trust gate
│       │   ├── jobController.js                # Job postings controller
│       │   ├── applicationController.js        # Kanban job application logic
│       │   └── userController.js               # User profile & roles
│       ├── models/
│       │   ├── AIPracticeSession.js
│       │   ├── Feedback.js
│       │   ├── Application.js
│       │   ├── Job.js
│       │   ├── Message.js
│       │   ├── Problem.js
│       │   ├── Session.js                      # Includes pendingParticipants, joinCode
│       │   ├── User.js
│       │   └── UserProgress.js
│       ├── routes/                             # Full modular express routing system 
│       ├── lib/
│       │   ├── claude.js, gemini.js, groq.js   # Encapsulated AI provider integrations
│       │   ├── email.js                        # Nodemailer configurations
│       │   ├── env.js                          # Zod-validated server `.env` parsing
│       │   ├── inngest.js
│       │   └── stream.js
│       ├── middleware/
│       │   ├── protectRoute.js                 # Role-based API interceptors
│       │   └── validateRequest.js              # Express Zod validation hooks
│       ├── jobs/
│       │   ├── aiCodeReview.js                 # Invoked asynchronously via Inngest
│       │   └── sessionReminder.js
│       └── scripts/
│           └── importProblems.js               # Excel → GFG scraper → DB Seed script
│
└── frontend/
    ├── .env
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── index.css
        ├── pages/                              # Screen views (Dashboards, Interview Grid, Pipelines)
        ├── components/                         # Granular components (Modals, Editors, Selectors)
        ├── hooks/                              # Customized React-Query Mutators & Sockets
        ├── api/                                # Typed Axios API definitions
        └── lib/                                # Utility abstractions (Piston logic)
```

---

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js (v18+)
- Local or Cloud MongoDB Connection URI
- Developer API Keys for: **Clerk**, **Stream**, **Inngest**, **Anthropic/Gemini**
- Active Gmail Application Password (if testing SMTP features natively)

### Environment Variables

#### Backend (`.env`)
```env
PORT=3000
NODE_ENV=development
DB_URL=your_mongodb_uri
CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
STREAM_API_KEY=your_stream_key
STREAM_API_SECRET=your_stream_secret
INNGEST_EVENT_KEY=your_inngest_key
INNGEST_SIGNING_KEY=your_inngest_signing_key
CLAUDE_API_KEY=sk-ant-...
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

### Setup & Local Launch
```bash
# 1. Start the API/WebSocket Server
cd backend
npm install
npm run dev

# 2. Launch the Client Application 
cd frontend
npm install
npm run dev
```
The client is automatically served at **http://localhost:5173**.

---

## 🔒 Security Principles Employed

- **Zod Data Sanitization**: Every single API POST/PATCH request natively parses payload integrity across exact character limits to protect internal memory structures from massive payload flooding.
- **Zero-Trust Entity Validation**: Unauthenticated endpoints utilizing dynamic queries explicitly return sanitized DTOs (Data Transfer Objects), systematically removing private references to Database IDs, Clerk Identifiers, and internal network parameters.
- **Encapsulated Clerk Interceptors**: Deeply integrated token verification across HTTP endpoints and active Socket.io communication channels.
- **Advanced Pagination**: Native offset and subset limiters incorporated across dynamic Mongo retrieval calls reducing time-to-first-byte metrics dramatically during load intervals.

---

## 🤝 Contributing & Licensing

You are highly encouraged to Fork the repository! 
**Workflow**: `Fork Platform -> feature/my-cool-idea -> Commit -> Submit rigorous Pull Request`. 

This project is licensed under the **ISC License**.
