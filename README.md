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
   - `CORS_ALLOW_MAGIC_PATTERNS` — any host under `*.magicpatterns.app` is allowed **by default** (project + preview URLs). Set to `0` or `false` to turn that off.
   - `PORT` (optional) — default 3000

2. Install and run:

   ```bash
   npm install
   npm run dev
   ```

   API runs at `http://localhost:3000` (or your `PORT`).

   **Browser demo (analyze → generate → packet UI):** open **`http://localhost:3000/`** — same data shape as a `CreativePacketView` React component expects from **generate**, not from analyze alone.

## API Routes

- **POST /api/analyze** — `multipart/form-data` with field `text` or `file`. Returns `uploadId`, `transcript`, `moments` (no creative packet yet).
- **POST /api/generate** — JSON `{ "momentId": "...", "goal": "..." }`. Returns `packet` with Firestore fields plus **`short_form_ideas`**, **`posting_recommendation`**, **`scripts`**, **`captions`**, optional **`carousel_slides`** (arrays of strings). `packet.content` is JSON storage of those fields.
- **GET /api/history** — Returns uploads for the shared dev user (newest first).
- **GET /api/moments** — `{ "moments": [...] }` for the shared user, newest first. Query **`?uploadId=`** to only return moments from one analysis. Fields: **`title`**, **`description`**, **`timestamp`**, **`uploadId`**, **`id`** (map `title` → headline, `description` → “why it matters”).
- **GET /api/uploads/:id** — One upload with `moments` and `creativePackets`.

## Firestore Collections

- `uploads` — userId, transcript, storagePath, createdAt
- `moments` — uploadId, userId, title, description, timestamp, createdAt
- `creativePackets` — momentId, uploadId, userId, goal, content, createdAt

Create a composite index on `uploads`: `userId` (Ascending), `createdAt` (Descending). Firebase will prompt with a link when needed.
