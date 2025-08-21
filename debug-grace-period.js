// Debug script for grace period calculation
console.log("=== Grace Period Debug Analysis ===");

// Your test scenario
const shiftStartTime = "07:30:00";
const gracePeriodMinutes = 15;
const yourPunchTime = "07:10:00";

console.log(`Shift starts: ${shiftStartTime}`);
console.log(`Grace period: ${gracePeriodMinutes} minutes`);
console.log(`Your punch: ${yourPunchTime}`);

// Calculate early threshold (grace boundary)
const parseTime = (timeStr) => {
  const [hours, minutes, seconds = 0] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, seconds, 0);
  return date;
};

const shiftStart = parseTime(shiftStartTime);
const earlyThreshold = new Date(shiftStart.getTime() - (gracePeriodMinutes * 60 * 1000));
const yourPunch = parseTime(yourPunchTime);

console.log(`\nCalculations:`);
console.log(`Shift start time: ${shiftStart.toTimeString()}`);
console.log(`Early threshold (grace boundary): ${earlyThreshold.toTimeString()}`);
console.log(`Your punch time: ${yourPunch.toTimeString()}`);

// Check if overtime should be created
const shouldCreateOvertime = yourPunch < earlyThreshold;
const minutesBeforeThreshold = Math.round((earlyThreshold.getTime() - yourPunch.getTime()) / (1000 * 60));
const minutesBeforeShift = Math.round((shiftStart.getTime() - yourPunch.getTime()) / (1000 * 60));

console.log(`\nAnalysis:`);
console.log(`Is punch before grace boundary? ${shouldCreateOvertime}`);
console.log(`Minutes before grace boundary: ${minutesBeforeThreshold}`);
console.log(`Minutes before shift start: ${minutesBeforeShift}`);

if (shouldCreateOvertime) {
  console.log(`\n✅ OVERTIME SHOULD BE CREATED`);
  console.log(`Duration: ${minutesBeforeShift} minutes (from ${yourPunchTime} to ${shiftStartTime})`);
  console.log(`This is correct behavior because you punched ${minutesBeforeThreshold} minutes before the grace boundary.`);
} else {
  console.log(`\n❌ NO OVERTIME SHOULD BE CREATED`);
  console.log(`You're within the grace period.`);
}

console.log(`\n=== Scenarios ===`);

const testScenarios = [
  { punch: "07:20:00", desc: "5 min early (within grace)" },
  { punch: "07:15:00", desc: "15 min early (at grace boundary)" },
  { punch: "07:14:00", desc: "16 min early (1 min beyond grace)" },
  { punch: "07:10:00", desc: "20 min early (5 min beyond grace)" },
  { punch: "07:00:00", desc: "30 min early (15 min beyond grace)" }
];

testScenarios.forEach(scenario => {
  const punchTime = parseTime(scenario.punch);
  const shouldCreate = punchTime < earlyThreshold;
  const minsBeforeThreshold = Math.round((earlyThreshold.getTime() - punchTime.getTime()) / (1000 * 60));
  const minsBeforeShift = Math.round((shiftStart.getTime() - punchTime.getTime()) / (1000 * 60));
  
  console.log(`${scenario.punch} (${scenario.desc}): ${shouldCreate ? 'CREATE' : 'NO'} overtime`);
  if (shouldCreate) {
    console.log(`  → ${minsBeforeShift} minutes overtime (${scenario.punch} to ${shiftStartTime})`);
  }
});

console.log(`\nConclusion: Your punch at 07:10:00 SHOULD create 20 minutes of overtime because it's 5 minutes before the grace boundary (07:15:00).`); 