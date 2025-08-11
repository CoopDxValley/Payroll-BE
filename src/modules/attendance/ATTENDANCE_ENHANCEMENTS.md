# Attendance Service Enhancements

## Overview
The `createAttendance` function has been enhanced to automatically handle holiday checks, shift range overtime, and shift coverage handling. All overtime records are created atomically with attendance records using Prisma transactions.

## New Features Implemented

### Enhanced Functions

#### 1. createAttendance Function
- **Holiday Check**: Automatically creates overtime for holiday work
- **Shift Range Overtime**: Creates overtime for work outside scheduled shifts
- **Shift Coverage Handling**: Manages overtime for shift coverage scenarios
- **Atomic Operations**: All operations wrapped in database transactions

#### 2. bulkDeviceRegistration Function
- **Same Overtime Logic**: Applies identical holiday, shift range, and coverage logic
- **Bulk Processing**: Processes multiple attendance records efficiently
- **Transaction Safety**: All records processed within a single transaction
- **Error Handling**: Individual record errors don't fail the entire batch
- **Overtime Tracking**: Returns count of overtime records created
- **Performance**: Optimized for large batch processing

### 1. Holiday Check
- **Query**: Checks `WorkingCalendar` for the employee's company and date
- **Condition**: If `dayType = HOLIDAY` and `isActive = true`
- **Action**: Creates overtime record with:
  - `reason = HOLIDAY_WORK`
  - `status = APPROVED`
  - `startTime/endTime` from punch times (or current punch if only one exists)
- **Duplicate Prevention**: Checks for existing overtime with same employee/date/reason

### 2. Shift Range Overtime
- **Query**: Gets active `EmployeeShift` for the date and finds matching `ShiftDay` using shift's `cycleDays`
- **Logic**: Compares punch time with shift start/end ± `gracePeriod`
- **Conditions**:
  - **Before shift start**: Creates overtime with `reason = UNSCHEDULED_WORK`
  - **After shift end**: Creates overtime with `reason = EXTENDED_SHIFT`
- **Status**: `PENDING` (requires approval)
- **Duplicate Prevention**: Checks for existing overtime entries

### 3. Shift Coverage Handling
- **Query**: Checks for `ShiftCoverage` records for the employee and date
- **Scenarios**:
  - **Employee is covering**: Always logs attendance, creates overtime with `reason = COVERAGE` if outside normal shift range
  - **Employee is original**: Logs unusual attendance (configurable behavior)
- **Holiday + Coverage**: Applies both holiday and coverage overtime logic

## Helper Functions Added

### `checkExistingOvertime(employeeId, date, reason)`
- Prevents duplicate overtime records for same employee/date/reason combination

### `createOvertimeRecord(employeeId, date, startTime, endTime, reason, status)`
- Creates overtime records with calculated duration
- Handles automatic approval for certain reasons

### `getEmployeeWithDetails(deviceUserId)`
- Fetches employee with company and active shift information
- Includes shift pattern days for cycle calculation

### `checkHoliday(companyId, date)`
- Queries WorkingCalendar for holiday status

### `getShiftDayForDate(shiftId, date, cycleDays)`
- Calculates which day in the shift cycle the date represents
- Returns corresponding ShiftDay configuration

### `getShiftCoverage(employeeId, date)`
- Finds approved shift coverage records for the employee

### `getPairedPunches(deviceUserId, date)`
- Retrieves punch-in and punch-out records for overtime calculation

### `processOvertimeLogic(tx, deviceUserId, checkTimeDate, dateOnly, isAbsent)`
- Processes overtime logic for a single attendance record within a transaction
- Used by both `createAttendance` and `bulkDeviceRegistration`
- Handles all overtime scenarios: holiday, shift range, and coverage
- Uses transaction context for database operations

## Implementation Rules Followed

✅ **Atomic Operations**: All DB writes wrapped in `prisma.$transaction`
✅ **Duplicate Prevention**: Always checks for existing overtime before inserting
✅ **Existing Logic**: Maintains existing PUNCHIN/PUNCHOUT determination
✅ **Efficient Queries**: Uses Prisma relations for minimal database calls
✅ **Error Handling**: Graceful handling when employee not found

## Overtime Reasons Supported

- `HOLIDAY_WORK`: Work performed on holidays (auto-approved)
- `UNSCHEDULED_WORK`: Work before scheduled shift start
- `EXTENDED_SHIFT`: Work after scheduled shift end
- `COVERAGE`: Work outside normal shift when covering for others (auto-approved)

## Configuration Options

The system supports configurable behavior for:
- Automatic vs. pending overtime approval
- Handling of unusual attendance when coverage exists
- Half-day holiday treatment (currently treats as full holiday)

## Usage Examples

### Single Attendance Record
```typescript
const attendance = await createAttendance({
  deviceUserId: "EMP001",
  checkTime: "2024-01-15T08:30:00Z",
  // Other optional fields...
});

// This will automatically:
// 1. Create attendance record
// 2. Check for holiday and create overtime if needed
// 3. Check shift range and create overtime if outside bounds
// 4. Handle shift coverage scenarios
// 5. All operations are atomic
```

### Bulk Device Registration
```typescript
const bulkResult = await bulkDeviceRegistration([
  {
    user_id: "EMP001",
    timestamp: "2024-01-15T08:30:00Z",
    status: 1,
    punch: 1,
    uid: "SENSOR001",
    device_ip: "192.168.1.100"
  },
  {
    user_id: "EMP002", 
    timestamp: "2024-01-15T17:45:00Z",
    status: 1,
    punch: 2,
    uid: "SENSOR001",
    device_ip: "192.168.1.100"
  }
]);

// Returns:
// {
//   success: true,
//   totalRecords: 2,
//   processedRecords: 2,
//   overtimeRecordsCreated: 1, // Number of overtime records created
//   skippedDuplicates: 0,
//   skippedComplete: 0,
//   errors: undefined,
//   data: [/* processed attendance records */]
// }
```

## Database Schema Requirements

The implementation requires the following Prisma models and relations:
- `Employee` with `companyId`, `deviceUserId`
- `Company` relation from Employee
- `WorkingCalendar` with `dayType`, `isActive`
- `EmployeeShift` with active shift information
- `Shift` with `cycleDays` and `patternDays`
- `ShiftDay` with `startTime`, `endTime`, `gracePeriod`
- `ShiftCoverage` with approval status
- `Overtime` with all required fields and enums 