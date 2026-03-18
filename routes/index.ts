import { Router } from 'express';
import { analyzeRouter } from './analyze.js';
import { generateRouter } from './generate.js';
import { historyRouter } from './history.js';
import { momentsRouter } from './moments.js';
import { uploadsRouter } from './uploads.js';

const apiRouter = Router();
apiRouter.use(analyzeRouter);
apiRouter.use(generateRouter);
apiRouter.use(historyRouter);
apiRouter.use(momentsRouter);
apiRouter.use(uploadsRouter);

export { apiRouter };
