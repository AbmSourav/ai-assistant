import express from 'express';

import getPointsController from './controllers/getPointsController.js';
import retrievalController from './controllers/retrievalController.js';

const retrievalRouter = express.Router();

retrievalRouter.get('/points', getPointsController);
retrievalRouter.post('/retrieval', retrievalController);

export default retrievalRouter;
