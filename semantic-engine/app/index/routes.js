import express from 'express';

import storeController from './controllers/storeController.js';
import updateController from './controllers/updateController.js';

const indexRouter = express.Router();

indexRouter.post('/store', storeController);
indexRouter.post('/update', updateController);

export default indexRouter;
