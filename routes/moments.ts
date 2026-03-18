import { Router } from 'express';
import { getMoments } from '../functions/moments.js';

export const momentsRouter = Router();
momentsRouter.get('/moments', (req, res, next) => {
  void getMoments(req, res).catch(next);
});
