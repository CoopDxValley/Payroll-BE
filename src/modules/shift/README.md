# Shift Module

This module handles shift management for the payroll system. It supports two types of shifts:

## Shift Types

### 1. FIXED_WEEKLY
- Always 7 days (Monday-Sunday)
- Requires `patternDays` array with specific configurations for each day
- Each day can be FULL_DAY, HALF_DAY, or REST_DAY
- Suitable for regular weekly schedules

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
      "startTime": "2024-01-01T08:00:00Z",
      "endTime": "2024-01-01T17:00:00Z",
      "breakTime": 60,
      "gracePeriod": 15
    },
    {
      "dayNumber": 2,
      "dayType": "FULL_DAY",
      "startTime": "2024-01-02T08:00:00Z",
      "endTime": "2024-01-02T17:00:00Z",
      "breakTime": 60,
      "gracePeriod": 15
    }
    // ... continue for all 7 days
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
- `startTime`: Start time for the day
- `endTime`: End time for the day
- `breakTime`: Break time in minutes
- `gracePeriod`: Grace period in minutes

## Validation Rules

- Shift name must be at least 3 characters
- For FIXED_WEEKLY shifts, patternDays are required
- Day numbers must be between 1 and 7
- Break time and grace period must be non-negative
- Start and end times must be valid datetime strings

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
      startTime: new Date("2024-01-01T09:00:00Z"),
      endTime: new Date("2024-01-01T17:00:00Z"),
      breakTime: 60,
      gracePeriod: 15
    },
    // Tuesday
    {
      dayNumber: 2,
      dayType: "FULL_DAY",
      startTime: new Date("2024-01-02T09:00:00Z"),
      endTime: new Date("2024-01-02T17:00:00Z"),
      breakTime: 60,
      gracePeriod: 15
    },
    // ... continue for all weekdays
    // Saturday
    {
      dayNumber: 6,
      dayType: "REST_DAY",
      startTime: new Date("2024-01-06T00:00:00Z"),
      endTime: new Date("2024-01-06T00:00:00Z"),
      breakTime: 0,
      gracePeriod: 0
    },
    // Sunday
    {
      dayNumber: 7,
      dayType: "REST_DAY",
      startTime: new Date("2024-01-07T00:00:00Z"),
      endTime: new Date("2024-01-07T00:00:00Z"),
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