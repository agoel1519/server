import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import treatmentRoutes from './routes/treatmentRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import pageRoutes from './routes/pageRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB Atlas
connectDB();
  
// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || process.env.CLIENT_URL === '*' || allowedOrigins.includes(origin) || origin.endsWith('.onrender.com')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check & Database Status Route
app.get('/api/health', (req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const stateIndex = mongoose.connection.readyState;
  res.status(200).json({
    status: 'success',
    server: 'healthy',
    database: {
      status: dbStates[stateIndex] || 'unknown',
      connected: stateIndex === 1,
      name: mongoose.connection.name || 'aevora',
      host: mongoose.connection.host || 'MongoDB Atlas'
    },
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/treatments', treatmentRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/media', mediaRoutes);

// General Info Route
app.get('/api/info', (req, res) => {
  res.status(200).json({
    app: 'Aevora Aesthetics & Longevity API',
    version: '1.1.0',
    database: 'MongoDB Atlas',
    features: ['Treatments Management', 'Lead Capturing', 'Admin CMS Backend']
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Aevora Server running on http://localhost:${PORT}`);
});
