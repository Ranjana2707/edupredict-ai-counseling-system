# EduPredict: AI-Driven Student Dropout Prediction & Counseling System

An enterprise-grade, high-fidelity full-stack predictive analytics platform designed to identify students at academic risk, explain risk indicators using Explainable AI (SHAP), and coordinate proactive counseling intervention workflows. Built with React 18+, Vite, Tailwind CSS, Material 3, Express, and Google Gemini AI.

---

## 📖 Table of Contents
1. [System Architecture Overview](#-system-architecture-overview)
2. [Folder Structure](#-folder-structure)
3. [Key Feature Implementations](#-key-feature-implementations)
4. [Technology Stack](#-technology-stack)
5. [Installation & Development Guide](#-installation--development-guide)
6. [Environment Variables Guide](#-environment-variables-guide)
7. [Axios & API Interceptor Strategy](#-axios--api-interceptor-strategy)
8. [TanStack Query Caching & Mutations](#-tanstack-query-caching--mutations)
9. [Deployment Preparation (Docker, Vercel, Cloud Run)](#-deployment-preparation-docker-vercel-cloud-run)
10. [Final QA & Review Report](#-final-qa--review-report)
    - [Security Summary](#security-summary)
    - [Performance Summary](#performance-summary)
    - [Accessibility & Responsiveness Summary](#accessibility--responsiveness-summary)

---

## 🏗️ System Architecture Overview

EduPredict is structured as a robust, single-repository full-stack architecture running a React Single Page Application (SPA) on the client side, powered by an integrated server-side Express backend.

```
┌────────────────────────────────────────────────────────┐
│                      Client Web App                    │
│    (React 18, Vite, Tailwind CSS, Recharts, Motion)   │
└───────────────────────────┬────────────────────────────┘
                            │
                  HTTPS JSON REST APIs
                            │
┌───────────────────────────▼────────────────────────────┐
│                  Express Node Server                   │
│        (TypeScript, tsx, esbuild, CJS Bundle)         │
└───────────────────────────┬────────────────────────────┘
                            │
               ┌────────────┴────────────┐
               ▼                         ▼
      Google Gemini AI           Local JSON Database
  (Explainable AI Insights)        (Durable State Store)
```

1. **Client Tier**: Built on React 18 and Vite. Features a dark-mode responsive dashboard mimicking Google Material 3 design tokens. Data fetching, synchronization, and state management are controlled by TanStack Query (`@tanstack/react-query`).
2. **Backend Tier**: Express server built in TypeScript, transpiled dynamically via `tsx` in development and bundled using `esbuild` to a self-contained CommonJS target (`dist/server.cjs`) for low cold-starts and maximum production compatibility.
3. **Database Tier**: File-backed JSON database located at `/data/db.json`. It provides reliable read/write persistent state tracking across application restarts without complex relational setup, making it ideal for standard lightweight runtime environments.
4. **AI Reasoning Engine**: Integrates server-side with the `@google/genai` SDK using `gemini-3.5-flash` to analyze student academic telemetry and output structured counselor remediation blueprints dynamically.

---

## 📂 Folder Structure

The project code is divided into modular, highly cohesive directories:

```
├── data/
│   └── db.json               # Persistent state storage
├── src/
│   ├── components/           # Reusable UI elements
│   │   ├── common/           # Route guards, skeletons, layout boundaries
│   │   ├── faculty/          # Student CSV bulk upload and marking managers
│   │   └── layout/           # Sidebar, high-contrast shell components
│   ├── constants/            # Application routes, access tokens, and roles
│   ├── contexts/             # Global security context (Auth) & UI context (Theme)
│   ├── hooks/                # High-fidelity TanStack query state hooks
│   ├── layouts/              # Core page scaffolding structures
│   ├── lib/                  # Centralized QueryClient config
│   ├── pages/                # High-level route pages (Analytics, Prediction, Settings)
│   │   └── student/          # Dedicated Student personal profile pages
│   ├── routes/               # Strict RBAC Router guards
│   ├── services/             # Axios REST client endpoints
│   ├── types/                # Strict TypeScript declaration types
│   ├── utils/                # Date formatting and document exportation rules
│   ├── App.tsx               # Main application wrapper
│   ├── index.css             # Tailwinds directive imports and Material 3 design tokens
│   └── main.tsx              # Browser DOM renderer mount
├── tsconfig.json             # TypeScript rules definition
├── vite.config.ts            # Vite asset optimization rules
├── package.json              # Build, clean, lint, and start commands
└── server.ts                 # Express full-stack entrance point
```

---

## 🚀 Key Feature Implementations

### 1. Robust Role-Based Access Control (RBAC)
Four fully distinct operational roles are supported with strict client and server-side authorization enforcement:
* **Student Dashboard**: Real-time risk scoring, attendance status heatmap, overdue homework tracker, personalized recommendation cards, and dynamic counselor session bookings.
* **Faculty Console**: Comprehensive cohort lists, internal exam marking, real-time subject attendance updates, and assignment creation panels.
* **Counselor Terminal**: Intake status overview, session scheduler (Confirmed/Completed status), case notes recorder, and follow-up trackers.
* **Admin Control Panel**: Real-time system hardware health monitors (CPU/Memory telemetry), granular audit logs, and global model configuration tuners.

### 2. AI Prediction & Explainable AI (XAI)
* **Risk Engine Equation**: Employs a mathematical model incorporating historical class attendance, GPA, active course backlogs, assignment submission compliance rates, and behavioral reviews.
* **SHAP Telemetry (SHapley Additive exPlanations)**: Translates model outputs into clear visual contribution bars. This lets counselors identify exactly whether *Attendance Rates* or *Internal Grades* are pushing a student into higher risk categories.
* **Gemini AI Strategy Blueprints**: Dynamically calls `gemini-3.5-flash` via server-side secure routes. This returns structured markdown describing concrete, tailored action plans for identified high-risk profiles.

---

## 💻 Technology Stack

* **Client**: React 18, Vite, Tailwind CSS, Recharts, Motion, Lucide React icons.
* **Backend**: Express, TypeScript, tsx, esbuild.
* **AI Engine**: `@google/genai` (Google Gemini 3.5 Flash).
* **State Management**: TanStack Query (React Query v4) with `@tanstack/react-query`.
* **Notifications**: Sonner (Aesthetic high-fidelity dynamic notifications).
* **Persistence**: Lightweight file-backed durable JSON state store.

---

## ⚙️ Installation & Development Guide

### Prerequisites
* **Node.js** v18 or newer.
* **npm** v9 or newer.

### Installation Steps
1. Clone the repository into your environment.
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Development Environment
To launch both the Node.js Express server and the Vite development asset compiler simultaneously, execute:
```bash
npm run dev
```
The application will boot up at `http://localhost:3000`. Hot Module Replacement (HMR) is coordinated automatically behind our sandboxed reverse proxy layer.

### Building for Production
To bundle assets and compile the TypeScript Express server, run:
```bash
npm run build
```
The output directory will contain:
* `dist/`: Static HTML, optimized JS bundles, and pre-built CSS.
* `dist/server.cjs`: A compiled, self-contained, high-performance Node.js server.

### Running in Production
```bash
npm run start
```

---

## 🔑 Environment Variables Guide

Define variables in a `.env` file in the root directory. To guarantee secure production deployments, never commit real secrets to source control.

Refer to `.env.example` as a template:
```env
# Server Ingress Port configuration (defaults to 3000)
PORT=3000

# Base API endpoint for the React Client (matches server address)
VITE_API_URL=http://localhost:3000/

# Production Node target environment
NODE_ENV=production

# Server-Side Google Gemini API secret key. Must remain secure.
# DO NOT prefix this with VITE_ to prevent browser leakage.
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 📡 Axios & API Interceptor Strategy

All network transactions pass through a centralized Axios client inside `/src/services/api.ts` configured with resilient enterprise failure patterns:

1. **Bearer Token Injection**: Automatically injects JWT keys stored in secure browser local storage onto every request header.
2. **Double-Queue Token Refresh**: If a `401 Unauthorized` token expiry occurs mid-session, the client halts subsequent requests, enters a `isRefreshing` lock, resolves a fresh access token from `/api/auth/refresh`, and drains the pending request queue smoothly without interrupting the user.
3. **Exponential Backoff Retry Strategy**: If a network failure occurs on `GET` requests, the interceptor executes up to 3 automated retries with randomized exponential delay offsets.
4. **Unified Error Toasting**: Captures and displays clean visual notifications for common status errors (`403 Forbidden`, `500 Internal Server Error`, `ECONNABORTED`).

---

## 🔄 TanStack Query Caching & Mutations

We use TanStack Query to maintain clean server-synchronized states, completely bypassing manual `useEffect` fetching bugs:

* **Query Caching**: Query keys are strictly parameterized (e.g., `['student', 'profile']`, `['faculty', 'students']`). This enables instant tab switching and lightning-fast loading times.
* **Stale-While-Revalidate (SWR)**: Keeps screens immediately responsive using cached datasets while quietly validating fresh updates in the background.
* **Mutations & Invalidation**: Action updates (e.g., posting a new counseling session or saving system settings) invoke `.mutateAsync()`, which automatically invalidates related query keys to trigger fresh updates.

---

## 🐳 Deployment Preparation

### Dockerizing the Platform
Create a `Dockerfile` in the root of the project to create light-weight production-ready containers:

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data

EXPOSE 3000
CMD ["node", "dist/server.cjs"]
```

To build and run the container locally:
```bash
docker build -t edupredict:latest .
docker run -p 3000:3000 --env-file .env edupredict:latest
```

### Serverless Deployments (Vercel & Netlify)
For serverless single-command hosting providers, compile the React SPA to static assets. Set the directory path `dist/` as your web publishing directory and point environment keys securely in the provider console.

---

## 📋 Final QA & Review Report

As part of our commitment to high Google Engineering Standards, we have audited the client and server surfaces of EduPredict.

### Security Summary
* **No Secret Leakage**: The Google Gemini API key remains strictly server-side. The browser is never exposed to private authentication keys or system environmental setups.
* **Route Guards**: Client-side protected route boundaries (`ProtectedRoute.tsx`) strictly reject unauthorized navigations. Attempting to access `/analytics` or `/settings` as a student redirects to `/unauthorized`.
* **Session Lifecycle**: Integrates automatic inactivity timeout listeners that clear tokens and return users to the login screen after a period of non-interaction.

### Performance Summary
* **Type Stripping & Bundling**: Our CJS server build completely bypasses ES Module runtime overheads.
* **Render Loop Safety**: Components are structured to prevent infinite re-renders. State transformations are handled outside component rendering cycles.
* **Dynamic Skeletons**: Lazy routing is implemented with clean Suspense-driven skeleton components, giving users an immediate visual response during transitions.

### Accessibility & Responsiveness Summary
* **ARIA-Enforced Typography**: Buttons, form inputs, dialog overlays, and charts include descriptive ARIA tags to support screen readers.
* **High Contrast Elements**: The dark slate Material 3 theme complies with strict contrast guidelines. Text elements are placed on highly visible surface backgrounds.
* **Fluid Layout Grid**: Fully responsive layout components adapt smoothly across all screen widths—from narrow mobile screens in portrait mode to ultra-wide desktop monitors.
