# Rotation Shift Module

This module provides comprehensive management of rotating shift schedules and employee shift assignments. It handles the creation, management, and approval of shift schedules with DAY/NIGHT/OFF assignments for employees.

## Overview

The rotation shift system consists of two main components:

1. **ShiftSchedule** - Groups shifts over date ranges (weeks, months, etc.)
2. **EmployeeShiftAssignment** - Daily shift assignments (DAY/NIGHT/OFF) for specific employees

## Features

- **Shift Schedule Management**: Create, update, and manage shift schedules
- **Employee Assignments**: Assign DAY/NIGHT/OFF shifts to employees on specific dates
- **Bulk Operations**: Create multiple assignments at once
- **Approval Workflow**: Lock schedules and assignments once approved
- **Comprehensive Reporting**: Get rotation summaries and working hours
- **Validation**: Prevent overlapping schedules and duplicate assignments

## Data Models

### ShiftSchedule
```typescript
{
  id: string;
  companyId: string;
  shiftId: string;         // Required link to a ROTATING Shift
  name: string;            // e.g., "Security August 2025 Week 1"
  startDate: Date;         // Schedule start date
  endDate: Date;          // Schedule end date
  isActive: boolean;       // Whether schedule is active
  isApproved: boolean;     // Lock schedule once approved
  createdAt: Date;
  updatedAt: Date;
}
```

### EmployeeShiftAssignment
```typescript
{
  id: string;
  employeeId: string;
  scheduleId?: string;     // Link to ShiftSchedule for grouping
  date: Date;              // Assignment date
  shiftTypeId?: string;    // Link to RotatingShiftType (null = OFF day)
  hours: number;           // Calculated from shift type duration
  isApproved: boolean;     // Once approved, immutable
  createdAt: Date;
  updatedAt: Date;
}
```

### RotatingShiftType Model
**Note**: RotatingShiftType is now a dynamic model, not a static enum. Companies can define their own shift types with custom names, times, and durations.

**Example Shift Types:**
- **DAY**: 06:00:00 - 18:00:00 (12 hours)
- **NIGHT**: 18:00:00 - 06:00:00 (12 hours, crossing midnight)
- **MORNING**: 07:00:00 - 15:00:00 (8 hours)
- **EVENING**: 16:00:00 - 00:00:00 (8 hours)
- **OFF**: No shift assigned (0 hours) - represented by `shiftTypeId: null`

## API Endpoints

### Shift Schedule Management

#### 1. Create Shift Schedule
```http
POST /rotation-shifts/schedules
```

**Request Body:**
```json
{
  "shiftId": "uuid",           // Required - Must be ROTATING type
  "name": "Security August 2025 Week 1",
  "startDate": "2025-08-01T00:00:00Z",
  "endDate": "2025-08-07T23:59:59Z"
}
```

**Response:**
```json
{
  "message": "Shift schedule created successfully",
  "data": {
    "id": "uuid",
    "name": "Security August 2025 Week 1",
    "startDate": "2025-08-01T00:00:00Z",
    "endDate": "2025-08-07T23:59:59Z",
    "isActive": true,
    "isApproved": false,
    "company": { "id": "uuid", "name": "Company Name" },
    "shift": { "id": "uuid", "name": "Security Shift", "shiftType": "ROTATING" }
  }
}
```

#### 2. Get All Shift Schedules
```http
GET /rotation-shifts/schedules?isActive=true&isApproved=false&startDate=2025-08-01&endDate=2025-08-31
```

**Query Parameters:**
- `isActive`: Filter by active status
- `isApproved`: Filter by approval status
- `startDate`: Filter schedules starting from date
- `endDate`: Filter schedules ending before date

#### 3. Get Shift Schedule by ID
```http
GET /rotation-shifts/schedules/:id
```

#### 4. Update Shift Schedule
```http
PATCH /rotation-shifts/schedules/:id
```

**Request Body:**
```json
{
  "name": "Updated Schedule Name",
  "startDate": "2025-08-01T00:00:00Z",
  "endDate": "2025-08-07T23:59:59Z"
}
```

#### 5. Approve Shift Schedule
```http
POST /rotation-shifts/schedules/:id/approve
```

**Note:** Once approved, schedules cannot be modified or deleted.

#### 6. Delete Shift Schedule
```http
DELETE /rotation-shifts/schedules/:id
```

**Note:** Only unapproved schedules can be deleted.

### Employee Shift Assignment Management

#### 1. Create Employee Shift Assignment
```http
POST /rotation-shifts/assignments
```

**Request Body:**
```json
{
  "employeeId": "uuid",
  "scheduleId": "uuid",        // Optional
  "date": "2025-08-01",
  "shiftTypeId": "uuid"
}
```

**Response:**
```json
{
  "message": "Shift assignment created successfully",
  "data": {
    "id": "uuid",
    "employeeId": "uuid",
    "date": "2025-08-01",
    "shiftTypeId": "uuid",
    "hours": 12,
    "isApproved": false,
    "employee": { "id": "uuid", "name": "John Doe", "username": "john.doe" },
    "schedule": { "id": "uuid", "name": "Security August 2025 Week 1" }
  }
}
```

#### 2. Get Employee Shift Assignments
```http
GET /rotation-shifts/assignments?employeeId=uuid&scheduleId=uuid&startDate=2025-08-01&endDate=2025-08-31&shiftTypeId=uuid&isApproved=false
```

**Query Parameters:**
- `employeeId`: Filter by specific employee
- `scheduleId`: Filter by specific schedule
- `date`: Filter by specific date
- `startDate`: Filter assignments from date
- `endDate`: Filter assignments before date
- `shiftTypeId`: Filter by specific shift type ID
- `isApproved`: Filter by approval status

#### 3. Update Employee Shift Assignment
```http
PATCH /rotation-shifts/assignments/:id
```

**Request Body:**
```json
{
  "shiftTypeId": "uuid"
}
```

#### 4. Approve Employee Shift Assignment
```http
POST /rotation-shifts/assignments/:id/approve
```

#### 5. Delete Employee Shift Assignment
```http
DELETE /rotation-shifts/assignments/:id
```

### Bulk Operations

#### 1. Bulk Create Assignments
```http
POST /rotation-shifts/assignments/bulk
```

**Request Body:**
```json
{
  "scheduleId": "uuid",
  "assignments": [
    {
      "employeeId": "uuid1",
      "date": "2025-08-01T00:00:00Z",
      "shiftTypeId": "uuid1"
    },
    {
      "employeeId": "uuid1",
      "date": "2025-08-02",
      "shiftTypeId": "uuid2"
    },
    {
      "employeeId": "uuid1",
      "date": "2025-08-03",
      "shiftTypeId": null
    }
  ]
}
```

**Response:**
```json
{
  "message": "3 assignments created successfully",
  "data": {
    "count": 3
  }
}
```

### Reporting

#### 1. Get Employee Rotation Summary
```http
GET /rotation-shifts/employees/:employeeId/summary?startDate=2025-08-01&endDate=2025-08-31
```

**Response:**
```json
{
  "data": {
    "totalDays": 31,
    "dayShifts": 10,
    "nightShifts": 10,
    "offDays": 11,
    "totalHours": 240,
    "assignments": [
      {
        "date": "2025-08-01",
        "shiftType": "DAY",
        "hours": 12,
        "isApproved": true
      }
    ]
  }
}
```

## Business Rules

### Shift Schedule Rules
1. **Shift Required**: All schedules must be linked to a ROTATING shift
2. **ROTATING Shift Only**: Only shifts with shiftType "ROTATING" can be used
3. **No Overlapping Schedules**: Schedules cannot overlap in the same date range
4. **Approval Lock**: Once approved, schedules cannot be modified or deleted
5. **Date Validation**: Start date must be before end date
6. **Company Isolation**: All operations are company-scoped

### Employee Assignment Rules
1. **Employee Shift Type Validation**: Employee must have a shift type containing "ROTAT" (e.g., ROTATION, ROTATING) to be assigned rotating shifts
2. **Unique Daily Assignment**: One assignment per employee per day
3. **Schedule Validation**: Assignment dates must be within schedule range (if linked)
4. **Approval Lock**: Once approved, assignments cannot be modified or deleted
5. **Hours Calculation**: Hours calculated from shift type duration, OFF = 0 hours
6. **Dynamic Shift Types**: Uses RotatingShiftType model for flexible shift definitions
7. **Date Format**: All dates must be in YYYY-MM-DD format (e.g., "2025-08-01")

### Bulk Operation Rules
1. **Maximum Batch Size**: 100 assignments per bulk operation
2. **Validation**: All employees must belong to the same company
3. **Conflict Prevention**: No existing assignments for the same employee/date combination

## Usage Examples

### Creating a Weekly Rotation Schedule

```typescript
// 1. Create the schedule
const schedule = await rotationShiftService.createShiftSchedule({
  companyId: "company-uuid",
  shiftId: "rotating-shift-uuid",  // Required - must be ROTATING type
  name: "Security Week 1",
  startDate: new Date("2025-08-01"),
  endDate: new Date("2025-08-07"),
});

// 2. Create assignments for an employee
const assignments = [
  { employeeId: "emp1", date: "2025-08-01", shiftTypeId: "day-shift-uuid" },
  { employeeId: "emp1", date: "2025-08-02", shiftTypeId: "day-shift-uuid" },
  { employeeId: "emp1", date: "2025-08-03", shiftTypeId: "night-shift-uuid" },
  { employeeId: "emp1", date: "2025-08-04", shiftTypeId: "night-shift-uuid" },
  { employeeId: "emp1", date: "2025-08-05", shiftTypeId: null }, // OFF day
  { employeeId: "emp1", date: "2025-08-06", shiftTypeId: null }, // OFF day
  { employeeId: "emp1", date: "2025-08-07", shiftTypeId: "day-shift-uuid" },
];

// 3. Bulk create assignments
await rotationShiftService.bulkCreateAssignments({
  scheduleId: schedule.id,
  assignments,
  companyId: "company-uuid",
});

// 4. Approve the schedule
await rotationShiftService.approveShiftSchedule(schedule.id, "company-uuid");
```

### Getting Employee Rotation Summary

```typescript
const summary = await rotationShiftService.getEmployeeRotationSummary(
  "employee-uuid",
  "company-uuid",
  new Date("2025-08-01"),
  new Date("2025-08-31")
);

console.log(`Employee worked ${summary.totalHours} hours in August`);
console.log(`Day shifts: ${summary.dayShifts}, Night shifts: ${summary.nightShifts}`);
```

## Error Handling

The module provides comprehensive error handling for common scenarios:

- **Validation Errors**: Invalid data format, missing required fields
- **Business Rule Violations**: Overlapping schedules, duplicate assignments
- **Permission Errors**: Company context missing, access denied
- **State Errors**: Modifying approved schedules/assignments
- **Not Found Errors**: Invalid IDs, missing resources

## Integration with Existing Modules

This module integrates with:

- **Shift Module**: Links to existing shift definitions
- **RotatingShiftType Module**: Uses dynamic shift type definitions
- **Employee Module**: References company employees
- **Auth Module**: Company context and permissions
- **Validation Module**: Request validation and sanitization

## Performance Considerations

- **Indexed Queries**: Database indexes on companyId, dates, and employeeId
- **Batch Operations**: Bulk assignment creation for efficiency
- **Selective Loading**: Only load necessary related data
- **Pagination**: Support for large result sets (can be added as needed)

## Security Features

- **Company Isolation**: All operations are scoped to the authenticated user's company
- **Authentication Required**: All endpoints require valid authentication
- **Input Validation**: Comprehensive validation of all inputs
- **SQL Injection Protection**: Uses Prisma ORM with parameterized queries 