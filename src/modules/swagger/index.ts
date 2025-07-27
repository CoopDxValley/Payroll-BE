// Import all swagger documentation components
import './attendance.swagger';
import './attendance.paths';

// Export main swagger setup (will need dependencies installed)
export * from './swagger.config';

// Export individual documentation modules
export { attendanceSwaggerSchemas } from './attendance.swagger';
export { attendanceSwaggerPaths } from './attendance.paths';

// Usage instructions:
// 1. Install required packages: npm install swagger-jsdoc swagger-ui-express @types/swagger-jsdoc @types/swagger-ui-express
// 2. Import and setup in your main app file:
//    import { setupSwagger } from './src/modules/swagger';
//    setupSwagger(app);
// 3. Access documentation at: http://localhost:3000/api-docs

export default {
  attendanceSwaggerSchemas: () => import('./attendance.swagger'),
  attendanceSwaggerPaths: () => import('./attendance.paths'),
  swaggerConfig: () => import('./swagger.config'),
}; 