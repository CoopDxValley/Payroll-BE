# Updated Attendance Module

A modern attendance system that replaces the traditional punch-in/punch-out model with WorkSessions and OvertimeTable for better tracking and management.

## 🏗️ **Architecture Overview**

### **Core Models**

#### **1. WorkSession**

- **Purpose**: Represents a complete work day for an employee
- **Key Features**:
  - Single record per employee per day
  - Tracks punch-in and punch-out times
  - Calculates work duration automatically
  - Links to shift information
  - Tracks early/late minutes

#### **2. OvertimeTable**

- **Purpose**: Manages all overtime scenarios
- **Key Features**:
  - Multiple overtime types (EARLY_ARRIVAL, LATE_DEPARTURE, etc.)
  - Status management (PENDING, APPROVED, REJECTED)
  - Links to WorkSession when applicable
  - Automatic duration calculation

## 📊 **Data Models**

### **WorkSession Schema**

```typescript
{
  id: string (cuid)
  deviceUserId: string
  date: Date
  punchIn: DateTime?
  punchInSource: string (default: "manual")
  punchOut: DateTime?
  punchOutSource: string (default: "manual")
  duration: Int?
  shiftId: String?
  earlyMinutes: Int (default: 0)
  lateMinutes: Int (default: 0)
  timestamps
}
```

### **OvertimeTable Schema**

```typescript
{
  id: string (cuid)
  workSessionId: String?
  deviceUserId: String
  date: Date
  punchIn: DateTime
  punchInSource: String (default: "manual")
  punchOut: DateTime
  punchOutSource: String (default: "manual")
  duration: Int
  type: OvertimeType
  status: OvertimeStatus (default: PENDING)
  timestamps
}
```

## 🎯 **Overtime Types**

| Type             | Description                         | Auto-Creation |
| ---------------- | ----------------------------------- | ------------- |
| `EARLY_ARRIVAL`  | Employee arrives before shift start | ✅ Automatic  |
| `LATE_DEPARTURE` | Employee leaves after shift end     | ✅ Automatic  |
| `HOLIDAY_WORK`   | Work on company holidays            | ✅ Automatic  |
| `REST_DAY_WORK`  | Work on scheduled rest days         | ✅ Automatic  |
| `EXTENDED_SHIFT` | Work beyond normal shift hours      | ✅ Automatic  |
| `UNSCHEDULED`    | Work without assigned shift         | ✅ Automatic  |

## 🚀 **API Endpoints**

### **WorkSession Management**

#### **Create WorkSession**

```http
POST /api/updated-attendance/work-sessions
```

**Body:**

```json
{
  "deviceUserId": "EMP001",
  "date": "2025-08-17",
  "punchIn": "2025-08-17T07:30:00Z",
  "punchInSource": "device",
  "punchOut": "2025-08-17T17:30:00Z",
  "punchOutSource": "device",
  "shiftId": "shift-123"
}
```

#### **Get WorkSessions**

```http
GET /api/updated-attendance/work-sessions?deviceUserId=EMP001&date=2025-08-17
```

#### **Get WorkSession by ID**

```http
GET /api/updated-attendance/work-sessions/:id
```

#### **Update WorkSession**

```http
PATCH /api/updated-attendance/work-sessions/:id
```

#### **Delete WorkSession**

```http
DELETE /api/updated-attendance/work-sessions/:id
```

### **Punch Operations**

#### **Punch In**

```http
POST /api/updated-attendance/punch-in
```

**Body:**

```json
{
  "deviceUserId": "EMP001",
  "date": "2025-08-17",
  "source": "device"
}
```

#### **Punch Out**

```http
POST /api/updated-attendance/punch-out
```

**Body:**

```json
{
  "deviceUserId": "EMP001",
  "date": "2025-08-17",
  "source": "device"
}
```

### **Overtime Management**

#### **Create Overtime Record**

```http
POST /api/updated-attendance/overtime
```

**Body:**

```json
{
  "deviceUserId": "EMP001",
  "date": "2025-08-17",
  "punchIn": "2025-08-17T06:00:00Z",
  "punchOut": "2025-08-17T07:30:00Z",
  "type": "EARLY_ARRIVAL",
  "workSessionId": "session-123"
}
```

#### **Get Overtime Records**

```http
GET /api/updated-attendance/overtime?type=EARLY_ARRIVAL&status=PENDING
```

#### **Update Overtime Status**

```http
PATCH /api/updated-attendance/overtime/:id/status
```

**Body:**

```json
{
  "status": "APPROVED"
}
```

## 🔄 **Business Logic**

### **Automatic Overtime Creation**

#### **FIXED_WEEKLY Shifts**

1. **Early Arrival**: If punch-in < shift start time (minus grace period)
2. **Late Departure**: If punch-out > shift end time (plus grace period)
3. **REST_DAY Work**: Automatically creates REST_DAY_WORK overtime

#### **ROTATION Shifts**

1. **Early Arrival**: If punch-in < assigned shift start time
2. **Late Departure**: If punch-out > assigned shift end time
3. **Overnight Handling**: Automatically handles shifts crossing midnight

### **Grace Period Logic**

- **Company Level**: `overtimeGracePeriod` from company settings
- **Shift Level**: Individual `gracePeriod` from `ShiftDay`
- **Time Adjustment**: Within grace period, times are adjusted to shift boundaries
- **Overtime Calculation**: Uses original punch times vs. shift boundaries

### **REST_DAY Handling**

- **No Regular Attendance**: REST_DAY punches don't create WorkSession records
- **Direct Overtime**: Automatically creates REST_DAY_WORK overtime
- **Auto-Approval**: REST_DAY work is automatically approved

## 📋 **Usage Examples**

### **1. Complete Work Day**

```typescript
// Create a complete work session
const workSession = await updatedAttendanceService.createWorkSession({
  deviceUserId: "EMP001",
  date: "2025-08-17",
  punchIn: "2025-08-17T07:30:00Z",
  punchOut: "2025-08-17T17:30:00Z",
  shiftId: "shift-123",
});

// System automatically:
// - Creates WorkSession record
// - Calculates duration (10 hours)
// - Creates EARLY_ARRIVAL overtime if applicable
// - Creates LATE_DEPARTURE overtime if applicable
```

### **2. Punch In/Out Separately**

```typescript
// Morning punch-in
await updatedAttendanceService.punchIn("EMP001", "2025-08-17", "device");

// Evening punch-out
await updatedAttendanceService.punchOut("EMP001", "2025-08-17", "device");

// System automatically:
// - Links punch-in and punch-out
// - Calculates duration
// - Creates overtime records if needed
```

### **3. REST_DAY Work**

```typescript
// Employee works on Sunday (REST_DAY)
await updatedAttendanceService.punchIn("EMP001", "2025-08-17", "manual");
await updatedAttendanceService.punchOut("EMP001", "2025-08-17", "manual");

// System automatically:
// - Detects REST_DAY from ShiftDay
// - Creates REST_DAY_WORK overtime
// - Sets status to APPROVED
// - No WorkSession record created
```

## 🔧 **Configuration**

### **Company Settings**

```typescript
// Overtime grace period (minutes)
overtimeGracePeriod: {
  gracePeriodMinutes: 10,
  isActive: true
}
```

### **Shift Configuration**

```typescript
// FIXED_WEEKLY shift with grace period
ShiftDay: {
  dayNumber: 1, // Monday
  startTime: "08:00:00",
  endTime: "17:00:00",
  gracePeriod: 15, // 15 minutes grace
  dayType: "WORKING_DAY"
}
```

## 📈 **Benefits Over Traditional System**

### **✅ Advantages**

1. **Cleaner Data**: One WorkSession per day vs. multiple punch records
2. **Better Overtime Tracking**: Dedicated OvertimeTable with types and status
3. **Shift Awareness**: Automatic overtime calculation based on shift schedules
4. **Flexible Sources**: Track manual vs. device punches
5. **REST_DAY Handling**: Special logic for rest days and holidays
6. **Audit Trail**: Complete history of time adjustments and overtime

### **🔄 Migration Path**

- **Phase 1**: Deploy new system alongside existing
- **Phase 2**: Migrate existing data to new structure
- **Phase 3**: Switch to new system completely
- **Phase 4**: Deprecate old attendance system

## 🚨 **Error Handling**

### **Common Scenarios**

1. **Duplicate WorkSession**: Employee already has session for the date
2. **Invalid Punch Sequence**: Punch-out before punch-in
3. **Missing Employee**: Device user ID not found
4. **Shift Not Found**: Referenced shift doesn't exist
5. **Invalid Overtime Type**: Unsupported overtime category

### **Validation Rules**

- ✅ `punchOut` must be after `punchIn`
- ✅ `deviceUserId` must exist in Employee table
- ✅ `shiftId` must exist in Shift table (if provided)
- ✅ Date format: ISO date (YYYY-MM-DD) or ISO datetime
- ✅ Time format: ISO datetime or HH:MM:SS

## 🔮 **Future Enhancements**

1. **Bulk Operations**: Process multiple employees at once
2. **Advanced Reporting**: Overtime analytics and trends
3. **Integration**: Connect with payroll and HR systems
4. **Mobile App**: Employee self-service punch-in/out
5. **Geolocation**: Track punch location for security
6. **Biometric**: Fingerprint/face recognition support

---

**This module provides a modern, flexible, and robust attendance system that handles all the complexities of modern workforce management while maintaining clean, organized data structures.**
