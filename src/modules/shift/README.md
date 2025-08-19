# Shift Module

This module handles shift management for the payroll system. It supports two types of shifts:

## Shift Types

### 1. FIXED_WEEKLY
- Always 7 days (Monday-Sunday)
- **REQUIRES exactly 7 pattern days** covering all days 1-7 (Monday-Sunday)
- Each day can be FULL_DAY, HALF_DAY, or REST_DAY
- Suitable for regular weekly schedules
- **Validation**: Must have exactly 7 pattern days with no duplicates

### 2. ROTATING
- Variable pattern with DAY/NIGHT/OFF
- Does not require `patternDays`
- Suitable for rotating shift schedules

## API Endpoints

### Create Shift
```
POST /shifts
```

**Request Body:**
```json
{
  "name": "Morning Shift",
  "shiftType": "FIXED_WEEKLY",
  "patternDays": [
    {
      "dayNumber": 1,
      "dayType": "FULL_DAY",
      "startTime": "08:00:00",
      "endTime": "17:00:00",
      "breakTime": 60,
      "gracePeriod": 15
    },
    {
      "dayNumber": 2,
      "dayType": "FULL_DAY",
      "startTime": "08:00:00",
      "endTime": "17:00:00",
      "breakTime": 60,
      "gracePeriod": 15
    },
    {
      "dayNumber": 3,
      "dayType": "FULL_DAY",
      "startTime": "08:00:00",
      "endTime": "17:00:00",
      "breakTime": 60,
      "gracePeriod": 15
    },
    {
      "dayNumber": 4,
      "dayType": "FULL_DAY",
      "startTime": "08:00:00",
      "endTime": "17:00:00",
      "breakTime": 60,
      "gracePeriod": 15
    },
    {
      "dayNumber": 5,
      "dayType": "FULL_DAY",
      "startTime": "08:00:00",
      "endTime": "17:00:00",
      "breakTime": 60,
      "gracePeriod": 15
    },
    {
      "dayNumber": 6,
      "dayType": "REST_DAY",
      "startTime": "00:00:00",
      "endTime": "00:00:00",
      "breakTime": 0,
      "gracePeriod": 0
    },
    {
      "dayNumber": 7,
      "dayType": "REST_DAY",
      "startTime": "00:00:00",
      "endTime": "00:00:00",
      "breakTime": 0,
      "gracePeriod": 0
    }
  ]
}
```

**For ROTATING shifts:**
```json
{
  "name": "Night Rotation",
  "shiftType": "ROTATING"
}
```

### Get All Shifts
```
GET /shifts
```

### Get Shift by ID
```
GET /shifts/:id
```

### Update Shift
```
POST /shifts/:id
```

### Delete Shift
```
POST /shifts/delete/:id
```

## Data Models

### Shift
- `id`: Unique identifier
- `name`: Shift name
- `shiftType`: Either "FIXED_WEEKLY" or "ROTATING"
- `companyId`: Company identifier
- `isActive`: Whether the shift is active
- `patternDays`: Array of ShiftDay objects (for FIXED_WEEKLY)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### ShiftDay
- `id`: Unique identifier
- `shiftId`: Reference to parent shift
- `dayNumber`: Day number (1-7, representing Monday-Sunday)
- `dayType`: Type of day (FULL_DAY, HALF_DAY, REST_DAY)
- `startTime`: Start time for the day (format: "HH:MM:SS")
- `endTime`: End time for the day (format: "HH:MM:SS")
- `breakTime`: Break time in minutes
- `gracePeriod`: Grace period in minutes

## Validation Rules

- Shift name must be at least 3 characters
- **FIXED_WEEKLY shifts MUST have exactly 7 pattern days**
- **All day numbers 1-7 must be present (Monday-Sunday)**
- **No duplicate day numbers allowed**
- Day numbers must be between 1 and 7
- Break time and grace period must be non-negative
- Start and end times must be in "HH:MM:SS" format (24-hour)

## FIXED_WEEKLY Validation Requirements

### ✅ Valid Pattern Days:
```json
[
  {"dayNumber": 1, "dayType": "FULL_DAY", ...},  // Monday
  {"dayNumber": 2, "dayType": "FULL_DAY", ...},  // Tuesday
  {"dayNumber": 3, "dayType": "FULL_DAY", ...},  // Wednesday
  {"dayNumber": 4, "dayType": "FULL_DAY", ...},  // Thursday
  {"dayNumber": 5, "dayType": "FULL_DAY", ...},  // Friday
  {"dayNumber": 6, "dayType": "REST_DAY", ...},  // Saturday
  {"dayNumber": 7, "dayType": "REST_DAY", ...}   // Sunday
]
```

### ❌ Invalid Pattern Days:
```json
// Missing days (only 6 days)
[
  {"dayNumber": 1, ...}, {"dayNumber": 2, ...}, {"dayNumber": 3, ...},
  {"dayNumber": 4, ...}, {"dayNumber": 5, ...}, {"dayNumber": 6, ...}
]

// Duplicate day numbers
[
  {"dayNumber": 1, ...}, {"dayNumber": 1, ...}, {"dayNumber": 2, ...},
  {"dayNumber": 3, ...}, {"dayNumber": 4, ...}, {"dayNumber": 5, ...}, {"dayNumber": 6, ...}
]

// Wrong day numbers (missing 7)
[
  {"dayNumber": 1, ...}, {"dayNumber": 2, ...}, {"dayNumber": 3, ...},
  {"dayNumber": 4, ...}, {"dayNumber": 5, ...}, {"dayNumber": 6, ...}, {"dayNumber": 8, ...}
]
```

## Usage Examples

### Creating a Regular 9-5 Shift
```typescript
const shiftData = {
  name: "Regular 9-5",
  shiftType: "FIXED_WEEKLY",
  patternDays: [
    // Monday
    {
      dayNumber: 1,
      dayType: "FULL_DAY",
      startTime: "09:00:00",
      endTime: "17:00:00",
      breakTime: 60,
      gracePeriod: 15
    },
    // Tuesday
    {
      dayNumber: 2,
      dayType: "FULL_DAY",
      startTime: "09:00:00",
      endTime: "17:00:00",
      breakTime: 60,
      gracePeriod: 15
    },
    // ... continue for all weekdays
    // Saturday
    {
      dayNumber: 6,
      dayType: "REST_DAY",
      startTime: "00:00:00",
      endTime: "00:00:00",
      breakTime: 0,
      gracePeriod: 0
    },
    // Sunday
    {
      dayNumber: 7,
      dayType: "REST_DAY",
      startTime: "00:00:00",
      endTime: "00:00:00",
      breakTime: 0,
      gracePeriod: 0
    }
  ]
};
```

### Creating a Rotating Shift
```typescript
const rotatingShiftData = {
  name: "3-2-2 Rotation",
  shiftType: "ROTATING"
};
```

## Time Format

**Start and End Times use 24-hour format:**
- `"08:00:00"` = 8:00 AM
- `"17:00:00"` = 5:00 PM
- `"23:30:00"` = 11:30 PM
- `"00:00:00"` = 12:00 AM (midnight)

**Benefits of Time-Only Format:**
- ✅ More intuitive and readable
- ✅ Reusable across different dates
- ✅ Smaller data storage
- ✅ Easier validation
- ✅ Better for weekly repeating schedules

## Error Messages

### Common Validation Errors:

1. **"FIXED_WEEKLY shifts must have exactly 7 pattern days"**
   - Solution: Ensure you provide exactly 7 pattern days

2. **"FIXED_WEEKLY shifts must have pattern days covering all days 1-7 (Monday-Sunday)"**
   - Solution: Include all day numbers from 1 to 7

3. **"FIXED_WEEKLY shifts cannot have duplicate day numbers"**
   - Solution: Each day number should appear only once

4. **"Pattern days are required for FIXED_WEEKLY shifts"**
   - Solution: Add patternDays array for FIXED_WEEKLY shifts