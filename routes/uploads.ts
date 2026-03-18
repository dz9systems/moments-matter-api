import { Router } from 'express';
import { getUploadDetail } from '../functions/uploadDetail.js';

export const uploadsRouter = Router();
uploadsRouter.get('/uploads/:id', (req, res, next) => {
  void getUploadDetail(req, res).catch(next);
});
