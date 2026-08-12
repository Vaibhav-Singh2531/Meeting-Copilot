import 'dotenv/config';
import express from 'express';
import http from 'http';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './src/services/auth/authRoutes.js';
import meetingRoutes from './src/services/meeting/meetingRoutes.js';
import analyticsRoutes from './src/services/analytics/analyticsRoutes.js';
import { initSocket } from './src/socket/index.js';
import './src/jobs/postMeetingJob.js';

const app = express();
const PORT = 5000;

const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Initialize WebSockets
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
