import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Aevora Backend Server is running smoothly!',
    timestamp: new Date().toISOString()
  });
});

// Sample API Route for testing
app.get('/api/info', (req, res) => {
  res.status(200).json({
    app: 'Aevora Website Backend',
    version: '1.0.0',
    features: ['Authentication Ready', 'RESTful API Architecture', 'CORS Enabled']
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is listening on http://localhost:${PORT}`);
});
