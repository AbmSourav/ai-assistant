import express from 'express';

import storeController from './controllers/storeController.js';

const indexRouter = express.Router();

indexRouter.post('/store', storeController);

export default indexRouter;
