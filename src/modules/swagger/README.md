# Swagger Documentation Module

This module provides complete API documentation for the Payroll Management System, with special focus on the ZKTeck SpeedH5 attendance integration.

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install swagger-jsdoc swagger-ui-express @types/swagger-jsdoc @types/swagger-ui-express
```

### 2. Setup in Your App
```typescript
// In your main app file (app.ts or server.ts)
import { setupSwagger } from './src/modules/swagger';

const app = express();

// Setup swagger documentation
setupSwagger(app);

// Your other middleware and routes...
```

### 3. Access Documentation
- **Swagger UI**: `http://localhost:3000/api-docs`
- **OpenAPI JSON**: `http://localhost:3000/api-docs.json`

## 📁 Module Structure

```
src/modules/swagger/
├── README.md                 # This file
├── index.ts                  # Module exports
├── swagger.config.ts         # Main swagger configuration
├── attendance.swagger.ts     # Attendance API schemas
└── attendance.paths.ts       # Attendance API endpoints
```

## 📋 Documented APIs

### Attendance Module
- ✅ Manual attendance creation
- ✅ ZKTeck SpeedH5 device data processing
- ✅ Bulk operations
- ✅ Date-based queries
- ✅ Daily summaries with hours calculation
- ✅ Individual record retrieval

## 🔧 Features

### 🎯 **Comprehensive Documentation**
- All endpoints with request/response schemas
- Device integration examples
- Error handling documentation
- Authentication requirements

### 🎨 **Enhanced UI**
- Custom styling for better readability
- Persistent authorization
- Request duration display
- Interactive "Try it out" functionality

### 🔍 **Developer Friendly**
- Real device data examples
- Clear parameter descriptions
- Response schema validation
- Searchable and filterable endpoints

## 📝 Usage Examples

### ZKTeck SpeedH5 Device Integration

#### Process Raw Device Text
```bash
curl -X POST http://localhost:3000/api/attendance/device/process-text \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceDataText": "Today'\''s attendance records:\n<Attendance>: 220692 : 2025-07-25 07:17:57 (15, 0)\n<Attendance>: 240163 : 2025-07-25 06:54:21 (15, 0)"
  }'
```

#### Process Structured Data
```bash
curl -X POST http://localhost:3000/api/attendance/device/process \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "attendanceRecords": [
      {
        "deviceUserId": "220692",
        "checkTime": "2025-07-25T07:17:57.000Z",
        "verifyMode": 15,
        "workCode": 0
      }
    ]
  }'
```

#### Manual Attendance
```bash
curl -X POST http://localhost:3000/api/attendance \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "checkTime": "2025-01-20T08:00:00.000Z",
    "checkType": "IN",
    "verifyMode": 1,
    "workCode": 0
  }'
```

#### Get Daily Summary
```bash
curl -X GET "http://localhost:3000/api/attendance/summary?date=2025-01-20" \
  -H "Authorization: Bearer <token>"
```

## 🎛️ Configuration

### Environment Variables
```env
NODE_ENV=development # or production
PORT=3000
```

### Custom Swagger Options
The module supports customization through `swagger.config.ts`:
- Server URLs
- Authentication schemes
- UI customization
- API grouping with tags

## 🔐 Security

All endpoints require Bearer token authentication:
```typescript
// In request headers
Authorization: Bearer <your-jwt-token>
```

## 📊 API Categories

### 🟢 **Attendance**
Basic attendance operations like manual check-in/out

### 🔵 **Attendance - Device Integration**
ZKTeck SpeedH5 device data processing endpoints

### 🟡 **Attendance - Bulk Operations**
Bulk attendance creation and processing

### 🟣 **Attendance - Queries**
Data retrieval, filtering, and reporting endpoints

## 🛠️ Development

### Adding New Documentation
1. Create schema definitions in `.swagger.ts` files
2. Add endpoint documentation in `.paths.ts` files
3. Update tags in `swagger.config.ts`
4. Import in `index.ts`

### Schema Structure
```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     YourSchema:
 *       type: object
 *       properties:
 *         field:
 *           type: string
 */
```

### Endpoint Documentation
```typescript
/**
 * @swagger
 * paths:
 *   /api/your-endpoint:
 *     post:
 *       tags: [YourTag]
 *       summary: Brief description
 *       responses:
 *         200:
 *           description: Success response
 */
```

## 🎉 Benefits

- **📚 Complete API Reference**: All endpoints documented with examples
- **🔧 Interactive Testing**: Test APIs directly from the documentation
- **👥 Team Collaboration**: Shared understanding of API contracts
- **🚀 Frontend Integration**: Clear request/response formats
- **🐛 Debugging**: Easy API exploration and troubleshooting

---

**Need Help?** Check the Swagger UI at `/api-docs` for interactive documentation and testing! 