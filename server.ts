/**
 * MomentsMatter API server. Plain Express + TypeScript, no Next.js.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import type { CorsOptions } from 'cors';
import { apiRouter } from './routes/index.js';

const app = express();
const PORT = process.env.PORT ?? 3000;

/** Magic Patterns preview URLs: https://<uuid>-render.magicpatterns.app */
function isMagicPatternsRenderOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);
    return /^[a-z0-9-]+-render\.magicpatterns\.app$/i.test(hostname);
  } catch {
    return false;
  }
}

function corsOptions(): CorsOptions {
  const allowMagic =
    process.env.CORS_ALLOW_MAGIC_PATTERNS === 'true' ||
    process.env.CORS_ALLOW_MAGIC_PATTERNS === '1';
  const raw = (process.env.CORS_ORIGIN ?? '*').trim();
  const explicit = raw.split(',').map((s) => s.trim()).filter(Boolean);

  if (explicit.length === 0 || explicit.includes('*')) {
    return { origin: true };
  }

  return {
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (explicit.includes(origin)) {
        callback(null, true);
        return;
      }
      if (allowMagic && isMagicPatternsRenderOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
  };
}

app.use(cors(corsOptions()));

app.use(express.json());
app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`MomentsMatter API running at http://localhost:${PORT}`);
});
