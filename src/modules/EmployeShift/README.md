# Employee Shift Management Module

This module handles the assignment and management of shifts to employees, supporting both FIXED_WEEKLY and ROTATING shift types.

## Features

- Assign shifts to employees (individual and bulk)
- Unassign shifts from employees
- Get employees assigned to a specific shift (with rotation support)
- Track shift assignments and schedules
- Support for both FIXED_WEEKLY and ROTATING shift types

## API Endpoints

### Get Employees by Shift ID (Enhanced)

**Endpoint:** `GET /employee-shifts/shift/employees/:shiftId?scheduleId=<scheduleId>`

This endpoint returns employees assigned to a specific shift, with different behavior based on the shift type:

#### For FIXED_WEEKLY Shifts:
- Fetches data from the `EmployeeShift` model
- Returns employees with their basic shift assignment information
- `scheduleId` parameter is ignored (not applicable to FIXED_WEEKLY shifts)

#### For ROTATING Shifts:
- Fetches data from the `EmployeeShiftAssignment` model
- Returns employees with detailed rotation data including:
  - Daily shift assignments
  - Shift type information (DAY/NIGHT/OFF)
  - Assignment history
  - Statistics (total days, active days, off days)
- `scheduleId` parameter is used to filter assignments by schedule

#### Response Format:

**FIXED_WEEKLY Response:**
```json
{
  "success": true,
  "message": "Employees assigned to shift retrieved successfully",
  "data": {
    "shiftId": "uuid",
    "shiftType": "FIXED_WEEKLY",
    "scheduleId": null,
    "totalEmployees": 5,
    "employees": [
      {
        "id": "uuid",
        "name": "John Doe",
        "username": "john.doe",
        "phoneNumber": "+1234567890",
        "deviceUserId": "EMP001",
        "employeeIdNumber": "E001",
        "gender": "MALE",
        "currentPosition": {
          "id": "uuid",
          "positionName": "Security Guard"
        },
        "currentGrade": {
          "id": "uuid",
          "name": "Grade A"
        },
        "shiftAssignment": {
          "startDate": "2025-01-01T00:00:00.000Z",
          "endDate": null,
          "isActive": true,
          "shift": {
            "id": "uuid",
            "name": "Regular Shift",
            "shiftType": "FIXED_WEEKLY",
            "patternDays": [...]
          }
        }
      }
    ]
  }
}
```

**ROTATING Response:**
```json
{
  "success": true,
  "message": "Employees assigned to shift retrieved successfully",
  "data": {
    "shiftId": "uuid",
    "shiftType": "ROTATING",
    "scheduleId": "uuid",
    "totalEmployees": 3,
    "totalAssignments": 21,
    "employees": [
      {
        "id": "uuid",
        "name": "Jane Smith",
        "username": "jane.smith",
        "phoneNumber": "+1234567891",
        "deviceUserId": "EMP002",
        "employeeIdNumber": "E002",
        "gender": "FEMALE",
        "currentPosition": {
          "id": "uuid",
          "positionName": "Security Supervisor"
        },
        "currentGrade": {
          "id": "uuid",
          "name": "Grade B"
        },
        "rotationData": {
          "totalDays": 7,
          "activeDays": 5,
          "offDays": 2,
          "recentAssignments": [
            {
              "id": "uuid",
              "date": "2025-01-15T00:00:00.000Z",
              "hours": 12,
              "shiftType": {
                "id": "uuid",
                "name": "DAY",
                "startTime": "06:00",
                "endTime": "18:00",
                "duration": 12
              },
              "isApproved": true,
              "schedule": {
                "id": "uuid",
                "name": "January 2025 Schedule",
                "startDate": "2025-01-01T00:00:00.000Z",
                "endDate": "2025-01-31T00:00:00.000Z"
              }
            }
          ],
          "allAssignments": [...]
        }
      }
    ]
  }
}
```

#### Query Parameters:
- `scheduleId` (optional): For ROTATING shifts, filters assignments by schedule. Ignored for FIXED_WEEKLY shifts.

#### Usage Examples:

1. **Get all employees for a FIXED_WEEKLY shift:**
   ```
   GET /employee-shifts/shift/employees/shift-uuid
   ```

2. **Get employees for a ROTATING shift with specific schedule:**
   ```
   GET /employee-shifts/shift/employees/shift-uuid?scheduleId=schedule-uuid
   ```

3. **Get all employees for a ROTATING shift (all schedules):**
   ```
   GET /employee-shifts/shift/employees/shift-uuid
   ```

## Models Used

### EmployeeShift (for FIXED_WEEKLY shifts)
- Direct assignment of employees to shifts
- Simple start/end date tracking
- Used for traditional weekly shift patterns

### EmployeeShiftAssignment (for ROTATING shifts)
- Detailed daily assignments
- Links to specific shift types (DAY/NIGHT/OFF)
- Associated with schedules for grouping
- Supports approval workflow

### Related Models
- `Shift`: Main shift definition
- `RotatingShiftType`: Defines specific shift types for rotation
- `ShiftSchedule`: Groups assignments over date ranges
- `Employee`: Employee information with position and grade history

## Error Handling

The endpoint automatically detects the shift type and routes to the appropriate data source. If a `scheduleId` is provided for a FIXED_WEEKLY shift, a warning is logged but the request continues without the schedule filter.

Common errors:
- **Shift not found**: Returns error if the provided shiftId doesn't exist
- **Invalid scheduleId**: Validation error for malformed UUID
- **No assignments found**: Returns empty employees array with appropriate metadata

## Notes

- The endpoint is backward compatible with existing FIXED_WEEKLY shift usage
- ROTATING shift data includes comprehensive assignment history
- Position and grade information is fetched from the most recent (active) records
- Assignments are ordered by date (most recent first) for ROTATING shifts
- Employees are ordered by name for FIXED_WEEKLY shifts 