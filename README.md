# MomentsMatter API

Plain **Node.js + Express + TypeScript** API (no Next.js). The frontend is a separate React + TypeScript app with react-router-dom. Uses Firebase (Auth, Firestore, Storage) and OpenAI.

## Setup

1. Copy `.env.example` to `.env` and set:
   - **Local:** `GOOGLE_APPLICATION_CREDENTIALS` — path to your Firebase service account JSON (file is gitignored; never commit it).
   - **Render / production:** `FIREBASE_SERVICE_ACCOUNT_JSON` — the **entire** service account JSON as a single-line string (Dashboard → Environment). Do not commit.
   - `FIREBASE_PROJECT_ID` — your Firebase project ID
   - `FIREBASE_STORAGE_BUCKET` — e.g. `your-project-id.firebasestorage.app`
   - `OPENAI_API_KEY` — your OpenAI API key
   - `CORS_ORIGIN` — comma-separated allowed origins, e.g. `http://localhost:5173,https://your-app.vercel.app`. Use `*` only for local dev.
   - `CORS_ALLOW_MAGIC_PATTERNS` — set to `1` or `true` to allow Magic Patterns preview URLs (`*-render.magicpatterns.app`), since the subdomain UUID changes each preview.
   - `PORT` (optional) — default 3000

2. Install and run:

   ```bash
   npm install
   npm run dev
   ```

   API runs at `http://localhost:3000` (or your `PORT`).

## API Routes

- **POST /api/analyze** — `multipart/form-data` with field `text` or `file`. Returns `uploadId`, `transcript`, `moments`. Header: `Authorization: Bearer <Firebase ID token>`.
- **POST /api/generate** — JSON body `{ "momentId": "...", "goal": "..." }`. Returns `{ packet }`. Auth required.
- **GET /api/history** — Returns current user's uploads (newest first). Auth required.
- **GET /api/uploads/:id** — Returns one upload with `moments` and `creativePackets`. Auth and ownership required.

## Firestore Collections

- `uploads` — userId, transcript, storagePath, createdAt
- `moments` — uploadId, userId, title, description, timestamp, createdAt
- `creativePackets` — momentId, uploadId, userId, goal, content, createdAt

Create a composite index on `uploads`: `userId` (Ascending), `createdAt` (Descending). Firebase will prompt with a link when needed.
