import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

import express, { Application } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { logger, morganMiddleware, requestIdMiddleware } from './middleware/logger';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { apiLimiter } from './middleware/rate-limiter';
import { performanceMonitor, setupMemoryMonitoring } from './middleware/performance';
import { swaggerSpec } from './config/swagger';
import healthRoutes from './routes/health.routes';
import eventsRoutes from './routes/events.routes';
import searchRoutes from './routes/search.routes';

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging and ID
app.use(requestIdMiddleware);
app.use(morganMiddleware);

// Performance monitoring
app.use(performanceMonitor);

// Rate limiting
app.use('/api', apiLimiter);

// API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Sporaclet API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
}));

// Swagger JSON endpoint
app.get('/api/docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/search', searchRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 API Base URL: http://localhost:${PORT}/api`);
  
  // Setup memory monitoring (every 5 minutes in production, 1 minute in dev)
  const monitoringInterval = process.env.NODE_ENV === 'production' ? 300000 : 60000;
  setupMemoryMonitoring(monitoringInterval);
  logger.info(`📊 Performance monitoring enabled`);
});

// Graceful shutdown
const gracefulShutdown = async (): Promise<void> => {
  logger.info('🛑 Received shutdown signal');
  
  server.close(async () => {
    logger.info('✅ HTTP server closed');
    
    try {
      // Close database connection
      const db = await import('./lib/db');
      await db.default.disconnect();
      logger.info('✅ Database connection closed');
      
      // Close cache connection
      const cacheService = await import('./services/cache.service');
      await cacheService.default.disconnect();
      logger.info('✅ Cache connection closed');
      
      process.exit(0);
    } catch (error) {
      logger.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('⚠️  Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;
