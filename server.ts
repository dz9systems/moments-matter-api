/**
 * MomentsMatter API server. Plain Express + TypeScript, no Next.js.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { apiRouter } from './routes/index.js';

const app = express();
const PORT = process.env.PORT ?? 3000;

const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: corsOrigin }));

app.use(express.json());
app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`MomentsMatter API running at http://localhost:${PORT}`);
});
