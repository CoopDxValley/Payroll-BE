// Example: How to integrate Swagger documentation in your main app

import express from 'express';
import cors from 'cors';
// import { setupSwagger, validateSpecs } from './modules/swagger'; // Uncomment after installing dependencies

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Setup swagger documentation (uncomment after installing dependencies)
/*
try {
  setupSwagger(app);
  
  // Validate swagger specs on startup
  if (validateSpecs()) {
    console.log('✅ Swagger documentation initialized successfully');
  } else {
    console.warn('⚠️ Swagger specs validation failed');
  }
} catch (error) {
  console.error('❌ Failed to setup Swagger:', error);
}
*/

// Your existing routes
app.use('/api/attendance', /* your attendance routes */);
app.use('/api/auth', /* your auth routes */);
app.use('/api/employees', /* your employee routes */);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    documentation: '/api-docs',
    endpoints: {
      swagger: '/api-docs',
      openapi: '/api-docs.json',
      health: '/health',
    },
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🔍 OpenAPI Spec: http://localhost:${PORT}/api-docs.json`);
  console.log(`❤️ Health Check: http://localhost:${PORT}/health`);
});

export default app;

// Alternative setup for existing applications:
/*
// If you already have an app setup, just add these lines:

import { setupSwagger } from './src/modules/swagger';

// After your middleware but before routes
setupSwagger(app);

// That's it! Your API documentation will be available at /api-docs
*/ 