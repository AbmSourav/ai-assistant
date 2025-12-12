import express from 'express';

import storeController from './controllers/storeController.js';
import reStoreController from './controllers/reStoreController.js';
import deleteController from './controllers/deleteController.js';

const indexRouter = express.Router();

indexRouter.post('/store', storeController);
indexRouter.post('/re-store', reStoreController);
indexRouter.post('/delete', deleteController);

export default indexRouter;
