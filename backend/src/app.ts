import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import templateRoutes from './routes/template.routes';
import generateRoutes from './routes/generate.routes';
import downloadRoutes from './routes/download.routes';
import { GENERATED_DIR, TEMPLATES_DIR } from './utils/paths';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static generated/templates directories for direct access if needed
app.use('/files/generated', express.static(GENERATED_DIR));
app.use('/files/templates', express.static(TEMPLATES_DIR));

// API Routes
app.use('/api/templates', templateRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/download', downloadRoutes);
app.get('/', (_req: Request, res: Response) => { res.send('Word PDF Generator Backend is running!'); });

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
  });
});

export default app;
