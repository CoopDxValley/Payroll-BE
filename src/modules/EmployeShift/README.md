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
**POST** `/api/v1/employee-shifts/assign`

Assigns a specific shift to an employee.

**Request Body:**
```json
{
  "employeeId": "uuid",
  "shiftId": "uuid",
  "startDate": "2025-01-01T00:00:00Z", // Optional
  "endDate": "2025-12-31T23:59:59Z"    // Optional
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
    "startDate": "2025-01-01T00:00:00Z",
    "endDate": null,
    "isActive": true,
    "companyId": "uuid",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

### 2. Unassign Shift from Employee
**POST** `/api/v1/employee-shifts/unassign`

Unassigns a shift from an employee.

**Query Parameters:**
- `employeeId`: Employee ID
- `shiftId`: Shift ID

**Response:**
```json
{
  "message": "Shift unassigned from employee successfully",
  "data": {
    "id": "uuid",
    "employeeId": "uuid",
    "shiftId": "uuid",
    "startDate": "2025-01-01T00:00:00Z",
    "endDate": "2025-01-01T00:00:00Z",
    "isActive": false,
    "companyId": "uuid",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

### 3. Bulk Assign Shift to Multiple Employees
**POST** `/api/v1/employee-shifts/bulk/assign`

Assigns a shift to multiple employees at once.

**Request Body:**
```json
{
  "shiftId": "uuid",
  "employeeIds": ["uuid1", "uuid2", "uuid3"],
  "startDate": "2025-01-01T00:00:00Z", // Optional - defaults to today
  "endDate": "2025-12-31T23:59:59Z"    // Optional - not used in bulk operations
}
```

**Response:**
```json
{
  "message": "3 employees assigned to shift successfully",
  "data": {
    "message": "3 employees assigned to shift successfully",
    "count": 3,
    "shiftName": "Morning Shift",
    "employees": [
      { "id": "uuid1", "name": "John Doe" },
      { "id": "uuid2", "name": "Jane Smith" },
      { "id": "uuid3", "name": "Bob Johnson" }
    ]
  }
}
```

### 4. Bulk Unassign Shift from Multiple Employees
**POST** `/api/v1/employee-shifts/bulk/unassign`

Unassigns a shift from multiple employees at once.

**Request Body:**
```json
{
  "shiftId": "uuid",
  "employeeIds": ["uuid1", "uuid2", "uuid3"]
}
```

**Response:**
```json
{
  "message": "3 employees unassigned from shift successfully",
  "data": {
    "message": "3 employees unassigned from shift successfully",
    "count": 3,
    "shiftName": "Morning Shift",
    "unassignedEmployees": [
      { "id": "uuid1", "name": "John Doe" },
      { "id": "uuid2", "name": "Jane Smith" },
      { "id": "uuid3", "name": "Bob Johnson" }
    ]
  }
}
```

### 5. Get All Employee Shifts
**GET** `/api/v1/employee-shifts`

Retrieves all employee shift assignments with optional filtering.

**Query Parameters:**
- `employeeId`: Filter by specific employee (optional)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "employeeId": "uuid",
      "shiftId": "uuid",
      "startDate": "2025-01-01T00:00:00Z",
      "endDate": null,
      "isActive": true,
      "companyId": "uuid",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

### 6. Get Employee Shift by ID
**GET** `/api/v1/employee-shifts/:id`

Retrieves a specific employee shift assignment by ID.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "employeeId": "uuid",
    "shiftId": "uuid",
    "startDate": "2025-01-01T00:00:00Z",
    "endDate": null,
    "isActive": true,
    "companyId": "uuid",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

### 7. Get Active Employee Shift
**GET** `/api/v1/employee-shifts/active/:employeeId`

Retrieves the currently active shift assignment for a specific employee.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "employeeId": "uuid",
    "shiftId": "uuid",
    "startDate": "2025-01-01T00:00:00Z",
    "endDate": null,
    "isActive": true,
    "companyId": "uuid",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

### 8. Get Employee Shift History
**GET** `/api/v1/employee-shifts/history/:employeeId`

Retrieves the complete shift assignment history for a specific employee.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "employeeId": "uuid",
      "shiftId": "uuid",
      "startDate": "2025-01-01T00:00:00Z",
      "endDate": "2025-06-30T23:59:59Z",
      "isActive": false,
      "companyId": "uuid",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-06-30T23:59:59Z"
    }
  ],
  "count": 1
}
```

### 9. Get Shift Details
**GET** `/api/v1/employee-shifts/shift/:shiftId`

Retrieves detailed information about a specific shift including pattern days.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "name": "Morning Shift",
    "shiftType": "FIXED_WEEKLY",
    "patternDays": [
      {
        "id": "uuid",
        "dayNumber": 1,
        "dayType": "FULL_DAY",
        "startTime": "2025-01-01T08:00:00Z",
        "endTime": "2025-01-01T17:00:00Z"
      }
    ]
  }
}
```

### 10. Calculate Working Hours
**GET** `/api/v1/employee-shifts/:employeeId/working-hours`

Calculates working hours for an employee within a specific date range.

**Query Parameters:**
- `startDate`: Start date for calculation
- `endDate`: End date for calculation

**Response:**
```json
{
  "data": {
    "shiftType": "FIXED_WEEKLY",
    "totalWorkingHours": 40,
    "workingDays": 5,
    "patternDays": [...]
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

### 🔒 **Business Rules Enforced**

- **Employee Validation**: All employees must exist and belong to company
- **Shift Validation**: Shift must exist and be active
- **Conflict Prevention**: Employees cannot have multiple active assignments
- **Bulk Limits**: Maximum 100 employees per operation
- **Company Isolation**: All operations are company-scoped
- **Date Logic**: startDate defaults to today, endDate is not set (null)
- **Active Status**: All bulk assignments are created as active 