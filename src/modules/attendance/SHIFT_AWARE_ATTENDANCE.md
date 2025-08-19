# Shift-Aware Attendance System

## Overview

The enhanced attendance system now considers both **FIXED_WEEKLY** and **ROTATION** shift types when calculating overtime and attendance records. This system automatically detects shift types and applies appropriate overtime rules based on the employee's assigned shift.

## Features

### 1. **Dual Shift Type Support**
- **FIXED_WEEKLY**: Uses `ShiftDay` model with pattern days (1-7 cycle)
- **ROTATION**: Uses `EmployeeShiftAssignment` with `RotatingShiftType`

### 2. **Flexible Time Input**
- **ISO Format**: `"2025-01-15T08:30:00"`
- **Space Separated**: `"2025-01-15 08:30:00"`
- **Time Only**: `"08:30:00"` (combines with current date or provided date)

### 3. **Automatic Overtime Calculation**
- **Early Punch-in**: Before shift start (with grace period)
- **Late Punch-out**: After shift end (with grace period)
- **Holiday Work**: Automatic overtime for holiday attendance

## API Endpoints

### Enhanced Single Attendance
```http
POST /attendance/enhanced
```

**Request Body:**
```json
{
  "deviceUserId": "employee-device-id",
  "checkTime": "08:30:00",  // HH:MM:SS format
  "date": "2025-01-15",     // Optional, defaults to current date
  "checkType": "PUNCHIN",    // Optional, auto-detected if missing
  "verifyMode": 1,
  "workCode": 100,
  "sensorId": "sensor-001",
  "deviceIp": "192.168.1.100",
  "isAbsent": false
}
```

### Enhanced Bulk Attendance
```http
POST /attendance/enhanced/bulk
```

**Request Body:**
```json
{
  "records": [
    {
      "deviceUserId": "emp-001",
      "checkTime": "08:30:00",
      "date": "2025-01-15"
    },
    {
      "deviceUserId": "emp-002",
      "checkTime": "17:45:00",
      "date": "2025-01-15"
    }
  ]
}
```

## How It Works

### 1. **FIXED_WEEKLY Shift Processing**

For employees with `FIXED_WEEKLY` shifts:

1. **Shift Day Calculation**: 
   - Determines current cycle day based on date
   - Retrieves `ShiftDay` pattern for that day
   - Uses `startTime`, `endTime`, and `gracePeriod` from pattern

2. **Overtime Detection**:
   - **Early Punch-in**: Before `startTime - gracePeriod`
   - **Late Punch-out**: After `endTime + gracePeriod`
   - **Grace Period**: Individual per shift day

3. **Example**:
   ```typescript
   // Shift: 09:00 - 17:00, Grace: 15 minutes
   // Early threshold: 08:45
   // Late threshold: 17:15
   
   // Punch-in at 08:30 → UNSCHEDULED_WORK overtime
   // Punch-out at 17:30 → EXTENDED_SHIFT overtime
   ```

### 2. **ROTATION Shift Processing**

For employees with `ROTATION` shifts:

1. **Shift Assignment Lookup**:
   - Finds `EmployeeShiftAssignment` for specific date
   - Retrieves `RotatingShiftType` details
   - Handles overnight shifts (end time next day)

2. **Overtime Detection**:
   - **Early Punch-in**: Before `startTime - companyGracePeriod`
   - **Late Punch-out**: After `endTime + companyGracePeriod`
   - **Company Grace Period**: Global setting per company

3. **Example**:
   ```typescript
   // Rotating Shift: DAY (06:00 - 18:00)
   // Company Grace: 10 minutes
   // Early threshold: 05:50
   // Late threshold: 18:10
   
   // Punch-in at 05:45 → UNSCHEDULED_WORK overtime
   // Punch-out at 18:15 → EXTENDED_SHIFT overtime
   ```

## Database Models Used

### Core Models
```prisma
model Employee {
  id          String   @id @default(uuid())
  deviceUserId String  @unique
  companyId   String
  employeeShifts EmployeeShift[]
  // ... other fields
}

model Shift {
  id          String   @id @default(uuid())
  shiftType   String   // "FIXED_WEEKLY" or "ROTATION"
  cycleDays   Int?     // For FIXED_WEEKLY shifts
  patternDays ShiftDay[]
  // ... other fields
}

model ShiftDay {
  id           String   @id @default(uuid())
  shiftId      String
  dayNumber    Int      // 1-7 for weekly cycle
  startTime    DateTime
  endTime      DateTime
  gracePeriod  Int      // Minutes
  // ... other fields
}

model RotatingShiftType {
  id          String   @id @default(uuid())
  name        String   // "DAY", "NIGHT", etc.
  startTime   String   // "06:00:00"
  endTime     String   // "18:00:00"
  duration    Int      // Hours
  // ... other fields
}

model EmployeeShiftAssignment {
  id          String   @id @default(uuid())
  employeeId  String
  date        DateTime @db.Date
  shiftTypeId String?
  hours       Int      // 12 for work, 0 for OFF
  isApproved  Boolean
  // ... other fields
}
```

## Overtime Types

### 1. **UNSCHEDULED_WORK**
- **Trigger**: Early punch-in before shift start
- **Status**: PENDING (requires approval)
- **Duration**: From punch-in to shift start

### 2. **EXTENDED_SHIFT**
- **Trigger**: Late punch-out after shift end
- **Status**: PENDING (requires approval)
- **Duration**: From shift end to punch-out

### 3. **HOLIDAY_WORK**
- **Trigger**: Any work on holiday
- **Status**: APPROVED (automatic)
- **Duration**: Full work period

## Configuration

### Company Grace Period
```typescript
// Set in overtimeGracePeriod table
{
  companyId: "company-uuid",
  gracePeriodMinutes: 15,
  isActive: true
}
```

### Shift Day Grace Period
```typescript
// Set per shift day in ShiftDay table
{
  shiftId: "shift-uuid",
  dayNumber: 1,
  gracePeriod: 10, // 10 minutes
  startTime: "09:00:00",
  endTime: "17:00:00"
}
```

## Usage Examples

### Example 1: FIXED_WEEKLY Shift
```typescript
// Employee has FIXED_WEEKLY shift with Monday 09:00-17:00
// Grace period: 15 minutes

const attendance = await createEnhancedAttendance({
  deviceUserId: "emp-001",
  checkTime: "08:30:00",  // 30 minutes early
  date: "2025-01-13"      // Monday
});

// Result: Creates UNSCHEDULED_WORK overtime (08:30 - 09:00)
```

### Example 2: ROTATION Shift
```typescript
// Employee has rotating DAY shift (06:00-18:00)
// Company grace period: 10 minutes

const attendance = await createEnhancedAttendance({
  deviceUserId: "emp-002",
  checkTime: "18:15:00",  // 15 minutes late
  date: "2025-01-15"
});

// Result: Creates EXTENDED_SHIFT overtime (18:00 - 18:15)
```

### Example 3: Holiday Work
```typescript
// Employee works on holiday
const attendance = await createEnhancedAttendance({
  deviceUserId: "emp-003",
  checkTime: "09:00:00",
  date: "2025-01-01"  // Holiday
});

// Result: Creates HOLIDAY_WORK overtime (automatic approval)
```

## Error Handling

### Common Errors
1. **Invalid Time Format**: Must be HH:MM:SS or ISO format
2. **Missing Employee**: Device user ID not found
3. **No Active Shift**: Employee not assigned to any shift
4. **Duplicate Overtime**: Overtime record already exists for same reason/date

### Validation Rules
- Maximum 2 punches per day per employee
- Automatic punch type detection (PUNCHIN/PUNCHOUT)
- Date validation and parsing
- Shift assignment verification

## Migration from Old System

### 1. **Update Existing Routes**
```typescript
// Old
POST /attendance

// New (enhanced)
POST /attendance/enhanced
```

### 2. **Update Request Format**
```typescript
// Old: Only ISO format
checkTime: "2025-01-15T08:30:00Z"

// New: Multiple formats supported
checkTime: "08:30:00"  // HH:MM:SS
checkTime: "2025-01-15 08:30:00"  // Space separated
checkTime: "2025-01-15T08:30:00"  // ISO format
```

### 3. **Enhanced Overtime Logic**
- Automatic shift type detection
- Shift-aware overtime calculation
- Grace period handling
- Holiday overtime support

## Benefits

1. **Accurate Overtime**: Considers actual shift schedules
2. **Flexible Input**: Multiple time format support
3. **Automatic Processing**: No manual overtime entry needed
4. **Shift Type Aware**: Handles both weekly and rotating patterns
5. **Grace Period Support**: Configurable tolerance levels
6. **Holiday Handling**: Automatic holiday overtime approval

## Future Enhancements

1. **Break Time Tracking**: Consider break periods in overtime calculation
2. **Shift Overlap**: Handle overlapping shifts
3. **Multi-Shift Support**: Employees with multiple shifts per day
4. **Overtime Rules**: Company-specific overtime policies
5. **Notification System**: Alert managers of overtime occurrences 