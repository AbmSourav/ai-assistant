import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

import indexRouter from './app/index/routes.js';
import retrievalRouter from './app/retrieval/routes.js';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', retrievalRouter);
app.use('/api/index', indexRouter);

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ error: 'Internal server error' });
});

// app.get('/api', function(req, res) {
//   res.json({"data": "Hello"})
// })

// Start server
const PORT = 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

export default app;
