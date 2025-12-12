import express from 'express';

import getPointsController from './controllers/getPointsController.js';
import retrievalController from './controllers/retrievalController.js';
import getDocumentController from './controllers/getDocumentController.js';

const retrievalRouter = express.Router();

retrievalRouter.get('/points', getPointsController);
retrievalRouter.get('/document', getDocumentController);
retrievalRouter.post('/retrieval', retrievalController);

export default retrievalRouter;
