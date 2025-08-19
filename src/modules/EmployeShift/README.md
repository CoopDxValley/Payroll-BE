# EmployeeShift Module

This module handles the assignment and management of shifts to employees. It has been updated to work with the new shift model that supports both `FIXED_WEEKLY` and `ROTATING` shift types.

## Features

- **Assign shifts to employees**: Link employees to specific shifts with start/end dates
- **Unassign shifts**: Remove shift assignments from employees
- **View employee shifts**: Get all shift assignments for employees
- **Shift details**: Get detailed information about shifts including pattern days
- **Working hours calculation**: Calculate working hours for FIXED_WEEKLY shifts
- **Shift history**: Track all shift assignments for an employee

## API Endpoints

### 1. Assign Shift to Employee
```
POST /employee-shifts/assign
```

**Request Body:**
```json
{
  "employeeId": "uuid",
  "shiftId": "uuid",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-12-31T23:59:59Z" // Optional
}
```

**Response:**
```json
{
  "message": "Shift assigned to employee successfully",
  "data": {
    "id": "uuid",
    "employeeId": "uuid",
    "shiftId": "uuid",
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-12-31T23:59:59Z",
    "isActive": true,
    "employee": { ... },
    "shift": {
      "id": "uuid",
      "name": "Morning Shift",
      "shiftType": "FIXED_WEEKLY",
      "patternDays": [ ... ]
    }
  }
}
```

### 2. Unassign Shift from Employee
```
POST /employee-shifts/unassign?employeeId=uuid&shiftId=uuid
```

**Response:**
```json
{
  "message": "Shift unassigned from employee successfully",
  "data": { ... }
}
```

### 3. Get All Employee Shifts
```
GET /employee-shifts?employeeId=uuid // Optional filter
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "employeeId": "uuid",
      "shiftId": "uuid",
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": null,
      "isActive": true,
      "employee": { ... },
      "shift": { ... }
    }
  ],
  "count": 1
}
```

### 4. Get Employee Shift by ID
```
GET /employee-shifts/:id
```

### 5. Get Active Shift for Employee
```
GET /employee-shifts/active/:employeeId
```

### 6. Get Employee Shift History
```
GET /employee-shifts/history/:employeeId
```

### 7. Get Shift Details
```
GET /employee-shifts/shift/:shiftId
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "name": "Morning Shift",
    "shiftType": "FIXED_WEEKLY",
    "companyId": "uuid",
    "isActive": true,
    "patternDays": [
      {
        "id": "uuid",
        "dayNumber": 1,
        "dayType": "FULL_DAY",
        "startTime": "2024-01-01T08:00:00Z",
        "endTime": "2024-01-01T17:00:00Z",
        "breakTime": 60,
        "gracePeriod": 15
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 8. Calculate Working Hours
```
GET /employee-shifts/:employeeId/working-hours?startDate=2024-01-01T00:00:00Z&endDate=2024-01-31T23:59:59Z
```

**Response for FIXED_WEEKLY shifts:**
```json
{
  "data": {
    "shiftType": "FIXED_WEEKLY",
    "totalWorkingHours": 40,
    "workingDays": 5,
    "patternDays": [ ... ]
  }
}
```

**Response for ROTATING shifts:**
```json
{
  "data": {
    "shiftType": "ROTATING",
    "message": "Working hours calculation not available for rotating shifts"
  }
}
```

## Data Models

### EmployeeShift
- `id`: Unique identifier
- `employeeId`: Reference to employee
- `shiftId`: Reference to shift
- `startDate`: When the shift assignment begins
- `endDate`: When the shift assignment ends (null for ongoing)
- `isActive`: Whether the assignment is currently active

### Shift (Updated)
- `id`: Unique identifier
- `name`: Shift name
- `shiftType`: Either "FIXED_WEEKLY" or "ROTATING"
- `patternDays`: Array of ShiftDay objects (for FIXED_WEEKLY)
- `companyId`: Company identifier
- `isActive`: Whether the shift is active

### ShiftDay
- `id`: Unique identifier
- `dayNumber`: Day number (1-7, Monday-Sunday)
- `dayType`: Type of day (FULL_DAY, HALF_DAY, REST_DAY)
- `startTime`: Start time for the day
- `endTime`: End time for the day
- `breakTime`: Break time in minutes
- `gracePeriod`: Grace period in minutes

## Business Logic

### Shift Assignment Rules
1. **One active shift per employee**: An employee can only have one active shift assignment at a time
2. **Company validation**: All operations verify that employees and shifts belong to the same company
3. **Shift availability**: Only active shifts can be assigned to employees

### Working Hours Calculation
- **FIXED_WEEKLY shifts**: Calculate total working hours based on pattern days
  - FULL_DAY: Count full hours between start and end time
  - HALF_DAY: Count half of the hours between start and end time
  - REST_DAY: No hours counted
- **ROTATING shifts**: Working hours calculation not available (requires manual input)

### Shift Pattern Support
- **FIXED_WEEKLY**: Always 7 days with specific configurations for each day
- **ROTATING**: Variable pattern without fixed weekly structure

## Usage Examples

### Assigning a FIXED_WEEKLY Shift
```typescript
const assignment = await employeeShiftService.assignShiftToEmployee({
  employeeId: "employee-uuid",
  shiftId: "shift-uuid",
  startDate: new Date("2024-01-01"),
  companyId: "company-uuid"
});
```

### Calculating Working Hours
```typescript
const workingHours = await employeeShiftService.calculateWorkingHours(
  "employee-uuid",
  new Date("2024-01-01"),
  new Date("2024-01-31")
);
```

### Getting Shift Details
```typescript
const shiftDetails = await employeeShiftService.getShiftDetails(
  "shift-uuid",
  "company-uuid"
);
```

## Validation

All endpoints include proper validation:
- UUID validation for IDs
- Date format validation
- Required field validation
- Business logic validation (e.g., one active shift per employee)

## Error Handling

The module provides comprehensive error handling:
- **400 Bad Request**: Missing or invalid required fields
- **404 Not Found**: Employee, shift, or assignment not found
- **409 Conflict**: Employee already has an active shift assignment
- **500 Internal Server Error**: Database or system errors 