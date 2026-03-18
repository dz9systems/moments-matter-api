import { Router } from 'express';
import { getHistory } from '../functions/history.js';

export const historyRouter = Router();
historyRouter.get('/history', (req, res, next) => {
  void getHistory(req, res).catch(next);
});
