import { Router } from 'express';
import { postGenerate } from '../functions/generate.js';

export const generateRouter = Router();
generateRouter.post('/generate', (req, res, next) => {
  void postGenerate(req, res).catch(next);
});
