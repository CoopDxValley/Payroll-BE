export interface TimeFormatOptions {
  includeSeconds?: boolean;
  use24Hour?: boolean;
  includeDate?: boolean;
}

// Convert Date to readable time format (HH:MM:SS or HH:MM)
export const formatTime = (date: Date | null, options: TimeFormatOptions = {}): string | null => {
  if (!date) return null;
  
  const {
    includeSeconds = true,
    use24Hour = true,
    includeDate = false
  } = options;

  try {
    if (includeDate) {
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      const timeStr = formatTime(date, { includeSeconds, use24Hour });
      return `${dateStr} ${timeStr}`;
    }

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    if (use24Hour) {
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      return includeSeconds ? `${timeStr}:${seconds.toString().padStart(2, '0')}` : timeStr;
    } else {
      const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const timeStr = `${hour12}:${minutes.toString().padStart(2, '0')}`;
      const timeWithSeconds = includeSeconds ? `${timeStr}:${seconds.toString().padStart(2, '0')}` : timeStr;
      return `${timeWithSeconds} ${ampm}`;
    }
  } catch (error) {
    console.error('Error formatting time:', error);
    return null;
  }
};

// Convert Date to readable date format (YYYY-MM-DD)
export const formatDate = (date: Date | null): string | null => {
  if (!date) return null;
  
  try {
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', error);
    return null;
  }
};

// Convert Date to readable datetime format (YYYY-MM-DD HH:MM:SS)
export const formatDateTime = (date: Date | null, options: TimeFormatOptions = {}): string | null => {
  if (!date) return null;
  
  return formatTime(date, { ...options, includeDate: true });
};

// Parse time string (HH:MM:SS or HH:MM) and combine with a date (LOCAL TIME)
export const parseTimeWithDate = (timeStr: string, date: Date): Date => {
  const timeParts = timeStr.split(':');
  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);
  const seconds = timeParts[2] ? parseInt(timeParts[2], 10) : 0;

  const result = new Date(date);
  result.setHours(hours, minutes, seconds, 0);
  return result;
};

// Create a local datetime from date string and time string (avoiding timezone conversion)
export const createLocalDateTime = (dateStr: string, timeStr: string): Date => {
  // Parse date components
  const dateParts = dateStr.split('-');
  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed
  const day = parseInt(dateParts[2], 10);
  
  // Parse time components
  const timeParts = timeStr.split(':');
  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);
  const seconds = timeParts[2] ? parseInt(timeParts[2], 10) : 0;
  
  // Create date using local timezone
  const result = new Date(year, month, day, hours, minutes, seconds, 0);
  
  console.log(`createLocalDateTime: ${dateStr} + ${timeStr} = ${result.toLocaleString()} (Local) = ${result.toISOString()} (UTC)`);
  
  return result;
};

// Create a timezone-stable datetime that preserves the exact time intended
export const createStableDateTime = (dateStr: string, timeStr: string): Date => {
  console.log(`Creating stable datetime for: ${dateStr} ${timeStr}`);
  
  // Parse date components
  const dateParts = dateStr.split('-');
  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed
  const day = parseInt(dateParts[2], 10);
  
  // Parse time components
  const timeParts = timeStr.split(':');
  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);
  const seconds = timeParts[2] ? parseInt(timeParts[2], 10) : 0;
  
  // Create date object ensuring it represents exactly what we want
  const result = new Date();
  result.setFullYear(year, month, day);
  result.setHours(hours, minutes, seconds, 0);
  
  console.log(`createStableDateTime: Input: ${dateStr} ${timeStr}`);
  console.log(`createStableDateTime: Result: ${result.toLocaleString()} (Local)`);
  console.log(`createStableDateTime: UTC: ${result.toISOString()}`);
  console.log(`createStableDateTime: Expected time check: ${result.getHours()}:${result.getMinutes().toString().padStart(2, '0')}:${result.getSeconds().toString().padStart(2, '0')}`);
  
  return result;
};

// Create a date for database storage that preserves the local date (no timezone shift)
export const createLocalDateForStorage = (dateStr: string): Date => {

  console.log("dkdkddfkdfkjdjkfkjdkjkjdfkj");
  const dateParts = dateStr.split('-');
  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed
  const day = parseInt(dateParts[2], 10);
  
  // Create at noon local time to avoid any potential timezone date shifting
  const result = new Date(year, month, day, 12, 0, 0, 0);
  
  console.log(`createLocalDateForStorage: ${dateStr} -> ${result.toDateString()} -> ${result.toISOString()}`);
  
  return result;
};

// Calculate duration in minutes between two times
export const calculateDurationMinutes = (startTime: Date, endTime: Date): number => {
  const diffMs = endTime.getTime() - startTime.getTime();
  return Math.round(diffMs / (1000 * 60));
};

// Format duration in minutes to readable format (e.g., "2h 30m" or "150 minutes")
export const formatDuration = (durationMinutes: number, format: 'short' | 'long' = 'short'): string => {
  if (durationMinutes === 0) return format === 'short' ? '0m' : '0 minutes';
  
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  
  if (format === 'short') {
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  } else {
    if (hours > 0 && minutes > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  }
};

// Check if time is within grace period
export const isWithinGracePeriod = (actualTime: Date, scheduledTime: Date, gracePeriodMinutes: number): boolean => {
  const diffMinutes = Math.abs(calculateDurationMinutes(actualTime, scheduledTime));
  return diffMinutes <= gracePeriodMinutes;
};

// Add grace period to a time
export const addGracePeriod = (time: Date, gracePeriodMinutes: number): Date => {
  return new Date(time.getTime() + (gracePeriodMinutes * 60 * 1000));
};

// Subtract grace period from a time
export const subtractGracePeriod = (time: Date, gracePeriodMinutes: number): Date => {
  return new Date(time.getTime() - (gracePeriodMinutes * 60 * 1000));
};

// Transform work session data to include readable time formats
export const transformWorkSessionForResponse = (workSession: any) => {
  return {
    ...workSession,
    // Add readable time formats while keeping original ISO dates
    punchInTime: formatTime(workSession.punchIn),
    punchOutTime: formatTime(workSession.punchOut),
    dateFormatted: formatDate(workSession.date),
    durationFormatted: workSession.duration ? formatDuration(workSession.duration) : null,
    
    // Transform overtime records
    OvertimeTable: workSession.OvertimeTable?.map((overtime: any) => ({
      ...overtime,
      punchInTime: formatTime(overtime.punchIn),
      punchOutTime: formatTime(overtime.punchOut),
      durationFormatted: formatDuration(overtime.duration),
    })) || [],
  };
};

// Get company grace period (if exists)
export const getCompanyGracePeriod = async (companyId: string, prisma: any): Promise<number> => {
  try {
    const gracePeriod = await prisma.overtimeGracePeriod.findFirst({
      where: {
        companyId,
        isActive: true,
      },
      select: {
        gracePeriodMinutes: true,
      },
    });
    
    return gracePeriod ? gracePeriod.gracePeriodMinutes : 0;
  } catch (error) {
    console.log('Error fetching company grace period:', error);
    return 0;
  }
};

// Normalize punch times to shift schedule (for work session display)
export const normalizePunchTimesToShift = async (
  actualPunchIn: Date | null,
  actualPunchOut: Date | null,
  shiftId: string,
  date: Date,
  prisma: any
): Promise<{ normalizedPunchIn: Date | null; normalizedPunchOut: Date | null }> => {
  console.log("=== Normalizing Punch Times to Shift Schedule ===");
  console.log(`Actual punch in: ${actualPunchIn ? formatTime(actualPunchIn) : 'null'}`);
  console.log(`Actual punch out: ${actualPunchOut ? formatTime(actualPunchOut) : 'null'}`);
  
  if (!actualPunchIn && !actualPunchOut) {
    return { normalizedPunchIn: null, normalizedPunchOut: null };
  }
  
  try {
    // Get shift day information
    const dayNumber = date.getDay() === 0 ? 7 : date.getDay(); // Convert Sunday (0) to 7
    const shiftDay = await prisma.shiftDay.findFirst({
      where: {
        shiftId,
        dayNumber,
      },
    });
    
    if (!shiftDay || shiftDay.dayType === "REST_DAY") {
      console.log("No shift day found or REST_DAY - returning actual times");
      return { normalizedPunchIn: actualPunchIn, normalizedPunchOut: actualPunchOut };
    }
    
    // Parse shift times and combine with the request date
    const dateStr = date.toISOString().split('T')[0];
    const dateParts = dateStr.split('-');
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
    
    const shiftStartTime = new Date(year, month, day, 0, 0, 0, 0);
    const shiftEndTime = new Date(year, month, day, 0, 0, 0, 0);
    
    // Handle both string and Date types for shift times
    const startTimeStr = shiftDay.startTime instanceof Date 
      ? shiftDay.startTime.toTimeString().split(' ')[0] 
      : shiftDay.startTime;
    const endTimeStr = shiftDay.endTime instanceof Date 
      ? shiftDay.endTime.toTimeString().split(' ')[0] 
      : shiftDay.endTime;
    
    const [startHours, startMinutes, startSeconds = 0] = startTimeStr.split(':').map(Number);
    const [endHours, endMinutes, endSeconds = 0] = endTimeStr.split(':').map(Number);
    
    shiftStartTime.setHours(startHours, startMinutes, startSeconds, 0);
    shiftEndTime.setHours(endHours, endMinutes, endSeconds, 0);
    
    console.log(`Shift schedule: ${formatTime(shiftStartTime)} - ${formatTime(shiftEndTime)}`);
    
    // Normalize punch times
    let normalizedPunchIn = actualPunchIn;
    let normalizedPunchOut = actualPunchOut;
    
    // Normalize punch-in: if early, use shift start time
    if (actualPunchIn && actualPunchIn < shiftStartTime) {
      normalizedPunchIn = shiftStartTime;
      console.log(`Punch-in normalized: ${formatTime(actualPunchIn)} → ${formatTime(normalizedPunchIn)} (early arrival, showing shift start)`);
    }
    
    // Normalize punch-out: if late, use shift end time  
    if (actualPunchOut && actualPunchOut > shiftEndTime) {
      normalizedPunchOut = shiftEndTime;
      console.log(`Punch-out normalized: ${formatTime(actualPunchOut)} → ${formatTime(normalizedPunchOut)} (late departure, showing shift end)`);
    }
    
    console.log(`Final normalized times: ${normalizedPunchIn ? formatTime(normalizedPunchIn) : 'null'} - ${normalizedPunchOut ? formatTime(normalizedPunchOut) : 'null'}`);
    
    return { normalizedPunchIn, normalizedPunchOut };
    
  } catch (error) {
    console.log('Error normalizing punch times:', error);
    return { normalizedPunchIn: actualPunchIn, normalizedPunchOut: actualPunchOut };
  }
}; 