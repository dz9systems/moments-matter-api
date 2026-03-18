import { Router } from 'express';
import multer from 'multer';
import { postAnalyze } from '../functions/analyze.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
});

export const analyzeRouter = Router();
// any() accepts any file field name (file, audio, recording, etc.)
analyzeRouter.post(
  '/analyze',
  upload.any(),
  (req, res, next) => {
    void postAnalyze(req, res).catch(next);
  },
);
