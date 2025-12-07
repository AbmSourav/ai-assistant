import express from 'express';

import getPointsController from './controllers/getPointsController.js';

const indexRouter = express.Router();

indexRouter.get('/points', getPointsController);

export default indexRouter;
