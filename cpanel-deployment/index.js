import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import cors from 'cors';
import config from './config.js';

// Import routes and middleware
import { routes } from './src/routes.js';
import { setupAuth } from './src/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://yourdomain.com']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(session({
  secret: config.session.secret,
  resave: config.session.resave,
  saveUninitialized: config.session.saveUninitialized,
  cookie: config.session.cookie,
  name: 'medsgo.sid'
}));

// Setup authentication
setupAuth(app);

// API routes
app.use('/api', routes);

// Serve uploaded files
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files (built frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all handler for frontend routing
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
const PORT = config.server.port;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Meds-Go Medical Marketplace running on port ${PORT}`);
  console.log(`📊 Environment: ${config.server.env}`);
  console.log(`🗄️  Database: ${config.database.host}:${config.database.port}/${config.database.database}`);
});

export default app;