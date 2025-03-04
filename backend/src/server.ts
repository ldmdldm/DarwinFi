import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import path from 'path';
import fs from 'fs';

// Import config (assuming we have a config file)
import config from './config';

// Load environment variables
dotenv.config();

// Import routes
import apiRoutes from './routes/api';

// Initialize express app
const app = express();
const server = createServer(app);

// Define port
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet()); // Set security headers

// Configure CORS based on environment
const corsOptions = {
origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://darwinfi.io']
    : '*',
methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
allowedHeaders: ['Content-Type', 'Authorization'],
credentials: true,
maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Apply rate limiting to prevent abuse
const limiter = rateLimit({
windowMs: 15 * 60 * 1000, // 15 minutes
max: 100, // 100 requests per IP
standardHeaders: true,
legacyHeaders: false,
message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Apply rate limiter to API routes
app.use('/api', limiter);

// Additional middleware
app.use(compression()); // Compress responses
app.use(express.json({ limit: '10mb' })); // Parse JSON request bodies with size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded request bodies

// Configure logging based on environment
if (process.env.NODE_ENV === 'production') {
app.use(morgan('combined'));
} else {
app.use(morgan('dev')); // More verbose for development
}

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
});
});

// API Routes
app.use('/api', apiRoutes);

// Root route
app.get('/', (req: Request, res: Response) => {
res.json({ 
    message: 'Welcome to DarwinFi API',
    documentation: '/api/docs',
    health: '/health'
});
});

// Service documentation endpoint
app.get('/api/docs', (req: Request, res: Response) => {
res.json({
    version: process.env.npm_package_version || '1.0.0',
    description: 'DarwinFi API for evolutionary trading strategies on Injective Protocol',
    endpoints: {
    '/api/strategies': 'Trading strategy management',
    '/api/market-data': 'Market data and price feeds',
    '/api/injective': 'Injective Protocol interactions',
    '/health': 'API health status'
    }
});
});

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// 404 handler
app.use((req: Request, res: Response) => {
res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
console.error(`[ERROR] ${req.method} ${req.url}:`, err.stack);

res.status(statusCode).json({
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
});
});

// Graceful shutdown handling
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown() {
console.log('Received shutdown signal, closing server...');
server.close(() => {
    console.log('Server closed successfully');
    process.exit(0);
});

// Force close after 10 seconds if server hasn't closed gracefully
setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
}, 10000);
}

// Start server
const startServer = () => {
server.listen(PORT, () => {
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Server running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`API Documentation: http://localhost:${PORT}/api/docs`);
});
};

if (require.main === module) {
// Start server only if file is run directly (not imported)
startServer();
}

export default app;
