import express from 'express';
import apiRouter from './routes/index.ts';
import { errorHandler } from './middleware/error.ts';
import { connectDB } from './config/db.ts';

// Connect to MongoDB Atlas (or fallback to resilient in-memory mode)
connectDB();

const app = express();

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// CORS configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// API Routes
app.use('/api', apiRouter);

// Centralized error handler
app.use(errorHandler);

export default app;
