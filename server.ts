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

/**
 * Magic Patterns hosts (preview + project apps), e.g.:
 * - https://project-moments-matter-mvp-457.magicpatterns.app
 * - https://<uuid>-render.magicpatterns.app
 */
function isMagicPatternsAppOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);
    return (
      hostname === 'magicpatterns.app' ||
      hostname.endsWith('.magicpatterns.app')
    );
  } catch {
    return false;
  }
}

function corsOptions(): CorsOptions {
  /** Default on — covers project + preview hosts under *.magicpatterns.app. Set to 0/false to disable. */
  const allowMagicPatterns =
    process.env.CORS_ALLOW_MAGIC_PATTERNS !== '0' &&
    process.env.CORS_ALLOW_MAGIC_PATTERNS !== 'false';
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
      if (allowMagicPatterns && isMagicPatternsAppOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
  };
}

app.use(
  cors({
    ...corsOptions(),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  }),
);

app.use(express.json());
app.use(express.static('public'));
app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`MomentsMatter API running at http://localhost:${PORT}`);
});
