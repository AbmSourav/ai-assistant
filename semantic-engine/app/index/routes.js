import express from 'express';

const indexRouter = express.Router();

indexRouter.get('/', (req, res) => {
  res.status(200).json({ status: 'Data indexing in Vector Database' });
});

export default indexRouter;
