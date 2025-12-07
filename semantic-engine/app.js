import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

import indexRouter from './app/index/routes.js';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/index', indexRouter);

// app.get('/', (req, res) => {
//   res.json({ message: 'Welcome to Semantic Engine API...' });
// });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
