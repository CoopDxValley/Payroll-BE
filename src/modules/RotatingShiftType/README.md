# Rotating Shift Type Module

This module provides comprehensive management of rotating shift types for companies. It allows companies to define custom shift types with specific start times, end times, and durations instead of using hardcoded enums.

## Overview

The Rotating Shift Type system replaces the static enum approach with dynamic, company-specific shift type definitions. Each company can create their own shift types like "DAY", "NIGHT", "MORNING", "EVENING", etc., with custom time ranges and durations.

## Features

- **Dynamic Shift Types**: Create custom shift types per company
- **Flexible Time Ranges**: Define start and end times in HH:mm:ss format
- **Custom Durations**: Set specific hour durations for each shift type
- **Company Isolation**: Each company manages their own shift types
- **Active/Inactive Management**: Enable/disable shift types as needed
- **Usage Tracking**: Monitor how many assignments use each shift type

## Data Model

### RotatingShiftType
```typescript
{
  id: string;
  companyId: string;
  name: string;           // "DAY", "NIGHT", "MORNING", "EVENING"
  startTime: string;      // "06:00:00", "18:00:00", "07:00:00"
  endTime: string;        // "18:00:00", "06:00:00", "15:00:00"
  duration: number;       // 12, 8, 10 (hours)
  isActive: boolean;      // Whether the shift type is active
  createdAt: Date;
  updatedAt: Date;
}
```

## API Endpoints

Base URL: `/rotating-shift-types`

### 1. Create Rotating Shift Type
```http
POST /rotating-shift-types
```

**Request Body:**
```json
{
  "name": "DAY",
  "startTime": "06:00:00",
  "endTime": "18:00:00"
}
```

**Response:**
```json
{
  "message": "Rotating shift type created successfully",
  "data": {
    "id": "uuid",
    "name": "DAY",
    "startTime": "06:00:00",
    "endTime": "18:00:00",
    "duration": 12,
    "isActive": true,
    "company": {
      "id": "uuid",
      "companyCode": "COMP001"
    }
  }
}
```

### 2. Get All Rotating Shift Types
```http
GET /rotating-shift-types?isActive=true&name=DAY
```

**Query Parameters:**
- `isActive`: Filter by active status (true/false)
- `name`: Filter by name (case-insensitive search)

### 3. Get Rotating Shift Type by ID
```http
GET /rotating-shift-types/:id
```

### 4. Update Rotating Shift Type
```http
PATCH /rotating-shift-types/:id
```

**Request Body:**
```json
{
  "name": "MORNING",
  "startTime": "07:00:00",
  "endTime": "15:00:00"
}
```

### 5. Delete Rotating Shift Type
```http
DELETE /rotating-shift-types/:id
```

**Note:** Only shift types not used in assignments can be deleted.

### 6. Deactivate Rotating Shift Type
```http
POST /rotating-shift-types/:id/deactivate
```

### 7. Activate Rotating Shift Type
```http
POST /rotating-shift-types/:id/activate
```

## Time Format Requirements

### **Format: HH:mm:ss**
- **HH**: Hours (00-23)
- **mm**: Minutes (00-59)
- **ss**: Seconds (00-59)

### **Valid Examples:**
- `"06:00:00"` - 6:00 AM
- `"18:00:00"` - 6:00 PM
- `"07:30:00"` - 7:30 AM
- `"23:45:00"` - 11:45 PM

### **Invalid Examples:**
- `"6:00"` - Missing seconds
- `"06:00"` - Missing seconds
- `"25:00:00"` - Invalid hour (25)
- `"06:60:00"` - Invalid minute (60)

## Business Rules

### 1. **Time Validation**
- Start time and end time must be different
- Time format must be HH:mm:ss
- Duration is automatically calculated from start and end times

### 2. **Automatic Duration Calculation**
- Duration is calculated automatically when creating or updating shift types
- Handles overnight shifts (e.g., 18:00:00 to 06:00:00 = 12 hours)
- Duration is stored with 2 decimal places for precision
- No need to manually specify duration in requests

### 3. **Company Isolation**
- Each company can only manage their own shift types
- Shift type names are unique per company (case-insensitive)

### 4. **Deletion Rules**
- Cannot delete shift types used in assignments
- Use deactivation instead for shift types in use

### 5. **Naming Conventions**
- Names are case-insensitive
- Common names: "DAY", "NIGHT", "MORNING", "EVENING", "GRAVEYARD"
- Custom names allowed: "EARLY_SHIFT", "LATE_SHIFT", "SPLIT_SHIFT"

## Usage Examples

### **Standard 12-Hour Shifts**
```json
// Day Shift
{
  "name": "DAY",
  "startTime": "06:00:00",
  "endTime": "18:00:00"
}

// Night Shift
{
  "name": "NIGHT",
  "startTime": "18:00:00",
  "endTime": "06:00:00"
}
```

### **8-Hour Shifts**
```json
// Morning Shift
{
  "name": "MORNING",
  "startTime": "07:00:00",
  "endTime": "15:00:00"
}

// Afternoon Shift
{
  "name": "AFTERNOON",
  "startTime": "15:00:00",
  "endTime": "23:00:00"
}

// Night Shift
{
  "name": "NIGHT",
  "startTime": "23:00:00",
  "endTime": "07:00:00"
}
```

### **Custom Shifts**
```json
// Split Shift
{
  "name": "SPLIT",
  "startTime": "08:00:00",
  "endTime": "12:00:00"
}

// Evening Shift
{
  "name": "EVENING",
  "startTime": "16:00:00",
  "endTime": "00:00:00"
}
```

## Integration with Employee Assignments

### **Before (Static Enum)**
```typescript
enum RotatingShiftType {
  DAY,   // Fixed: 06:00-18:00
  NIGHT, // Fixed: 18:00-06:00
  OFF
}
```

### **After (Dynamic Shift Types)**
```typescript
// Employee assignment now references shift type
model EmployeeShiftAssignment {
  id: string;
  employeeId: string;
  date: Date;
  shiftTypeId: string;  // Reference to RotatingShiftType
  hours: number;        // Calculated from shift type duration
  // ... other fields
}
```

## Migration Strategy

### **Phase 1: Create Shift Types**
1. Create shift types for your company
2. Define time ranges and durations
3. Test with sample assignments

### **Phase 2: Update Assignments**
1. Modify EmployeeShiftAssignment model
2. Add shiftTypeId field
3. Update assignment creation logic

### **Phase 3: Remove Old Enum**
1. Remove RotatingShiftType enum
2. Update all references
3. Clean up old code

## Error Handling

The module provides comprehensive error handling for:

- **Validation Errors**: Invalid time format, missing fields
- **Business Rule Violations**: Duplicate names, conflicting times
- **State Errors**: Deleting used shift types
- **Permission Errors**: Company context missing

## Performance Considerations

- **Indexed Queries**: Database indexes on companyId and name
- **Efficient Filtering**: Optimized queries with filters
- **Selective Loading**: Only load necessary related data

## Security Features

- **Company Isolation**: All operations are company-scoped
- **Authentication Required**: All endpoints require valid JWT token
- **Input Validation**: Comprehensive validation using Zod schemas
- **SQL Injection Protection**: Uses Prisma ORM with parameterized queries

## Testing Examples

### **Create Multiple Shift Types**
```bash
# Day Shift
curl -X POST /rotating-shift-types \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "DAY",
    "startTime": "06:00:00",
    "endTime": "18:00:00",
    "duration": 12
  }'

# Night Shift
curl -X POST /rotating-shift-types \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "NIGHT",
    "startTime": "18:00:00",
    "endTime": "06:00:00",
    "duration": 12
  }'

# Morning Shift
curl -X POST /rotating-shift-types \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MORNING",
    "startTime": "07:00:00",
    "endTime": "15:00:00",
    "duration": 8
  }'
```

## Support

The module is fully documented with:
- Comprehensive API documentation
- TypeScript type definitions
- Input validation schemas
- Error handling patterns
- Business rule documentation

All code follows your existing patterns and integrates seamlessly with your current system architecture.

---

**The Rotating Shift Type Module is now ready for use!** 🎉

You can start creating custom shift types for your company with flexible time ranges and durations, replacing the static enum approach with a dynamic, scalable solution. 