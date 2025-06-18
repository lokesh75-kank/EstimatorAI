import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import projectRoutes from './routes/project.routes';
import estimateRoutes from './routes/estimate.routes';
import analysisRoutes from './routes/analysis.routes';
import documentRoutes from './routes/document.routes';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/estimates', estimateRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/documents', documentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 