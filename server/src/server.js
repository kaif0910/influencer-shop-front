import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './routes/auth.js';
import postsRoutes from './routes/posts.js';
import usersRoutes from './routes/users.js';
import wishlistRoutes from './routes/wishlist.js';
import influencersRoutes from './routes/influencers.js';
import recommendationsRoutes from './routes/recommendations.js';
import searchRoutes from './routes/search.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:8080',
      'http://localhost:8080',
      'https://localhost:8080',
      'http://127.0.0.1:8080',
      'https://127.0.0.1:8080',
      'https://funny-sprinkles-57505f.netlify.app',
      // Add WebContainer URL pattern
      /.*\.local-credentialless\.webcontainer-api\.io$/
    ];
    
    // Check if the origin is in the allowed list or matches a pattern
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(helmet());
app.use(compression());
app.use(limiter);
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'InfluStyle Backend API' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/influencers', influencersRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/search', searchRoutes);

// Error handling middleware (should be last)
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
});

export default app;