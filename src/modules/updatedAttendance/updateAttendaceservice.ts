// const updateWorkSession = async (
//   id: string,
//   data: UpdateWorkSessionRequest
// ): Promise<IWorkSessionWithRelations> => {
//   const workSession = await getWorkSessionById(id);

//   const updateData: any = {};

//   // Handle time-only strings for punchIn (same as create logic)
//   if (data.punchIn !== undefined) {
//     if (data.punchIn === null || data.punchIn === "") {
//       updateData.punchIn = null;
//     } else if (
//       typeof data.punchIn === "string" &&
//       data.punchIn.match(/^\d{2}:\d{2}:\d{2}$/)
//     ) {
//       console.log(
//         `Converting update punchIn time-only string: ${data.punchIn}`
//       );
//       const workSessionDateStr = workSession.date.toISOString().split("T")[0];
//       const punchInDateTime = createStableDateTime(
//         workSessionDateStr,
//         data.punchIn
//       );
//       updateData.punchIn = punchInDateTime;
//       console.log(`Converted update punchIn: ${punchInDateTime.toISOString()}`);
//     } else {
//       updateData.punchIn = parseDateTime(data.punchIn);
//     }
//   }

//   // Handle time-only strings for punchOut (same as create logic)
//   if (data.punchOut !== undefined) {
//     if (data.punchOut === null || data.punchOut === "") {
//       updateData.punchOut = null;
//     } else if (
//       typeof data.punchOut === "string" &&
//       data.punchOut.match(/^\d{2}:\d{2}:\d{2}$/)
//     ) {
//       console.log(
//         `Converting update punchOut time-only string: ${data.punchOut}`
//       );
//       const workSessionDateStr = workSession.date.toISOString().split("T")[0];
//       const punchOutDateTime = createStableDateTime(
//         workSessionDateStr,
//         data.punchOut
//       );
//       updateData.punchOut = punchOutDateTime;
//       console.log(
//         `Converted update punchOut: ${punchOutDateTime.toISOString()}`
//       );
//     } else {
//       updateData.punchOut = parseDateTime(data.punchOut);
//     }
//   }

//   if (data.punchInSource !== undefined) {
//     updateData.punchInSource = data.punchInSource;
//   }

//   if (data.punchOutSource !== undefined) {
//     updateData.punchOutSource = data.punchOutSource;
//   }

//   if (data.shiftId !== undefined) {
//     updateData.shiftId = data.shiftId;
//   }

//   // Recalculate duration and early/late minutes
//   if (updateData.punchIn || updateData.punchOut) {
//     const punchIn = updateData.punchIn || workSession.punchIn;
//     const punchOut = updateData.punchOut || workSession.punchOut;

//     if (punchIn && punchOut) {
//       updateData.duration = calculateDuration(punchIn, punchOut);

//       // Recalculate overtime if shift is assigned
//       if (workSession.shiftId || data.shiftId) {
//         const shiftId = data.shiftId || workSession.shiftId;
//         if (shiftId) {
//           const shift = await getShiftInfo(shiftId, workSession.date);
//           if (shift && shift.patternDays.length > 0) {
//             const shiftDay = shift.patternDays[0];
//             const shiftStartTime = new Date(shiftDay.startTime);
//             const shiftEndTime = new Date(shiftDay.endTime);

//             updateData.earlyMinutes = 0;
//             updateData.lateMinutes = 0;

//             if (punchIn < shiftStartTime) {
//               updateData.earlyMinutes = Math.round(
//                 (shiftStartTime.getTime() - punchIn.getTime()) / (1000 * 60)
//               );
//             }
//             if (punchOut > shiftEndTime) {
//               updateData.lateMinutes = Math.round(
//                 (punchOut.getTime() - shiftEndTime.getTime()) / (1000 * 60)
//               );
//             }
//           }
//         }
//       }
//     }
//   }

//   // Normalize punch times for display (if both punch times are being updated)
//   if (updateData.punchIn || updateData.punchOut) {
//     const finalPunchIn = updateData.punchIn || workSession.punchIn;
//     const finalPunchOut = updateData.punchOut || workSession.punchOut;
//     const finalShiftId = updateData.shiftId || workSession.shiftId;

//     if (finalShiftId && (finalPunchIn || finalPunchOut)) {
//       console.log("Normalizing updated punch times to shift schedule");
//       const normalizationResult = await normalizePunchTimesToShift(
//         finalPunchIn,
//         finalPunchOut,
//         finalShiftId,
//         workSession.date,
//         prisma
//       );

//       // Update with normalized times
//       if (updateData.punchIn !== undefined) {
//         updateData.punchIn = normalizationResult.normalizedPunchIn;
//       }
//       if (updateData.punchOut !== undefined) {
//         updateData.punchOut = normalizationResult.normalizedPunchOut;
//       }
//     }
//   }

//   // Store ACTUAL punch times BEFORE normalization for overtime and deductible calculations
//   let actualPunchInForCalculations = null;
//   let actualPunchOutForCalculations = null;

//   if (updateData.punchIn !== undefined || updateData.punchOut !== undefined) {
//     // Get the ACTUAL times (before any normalization) - these are the parsed times from the input
//     if (data.punchIn !== undefined) {
//       if (data.punchIn === null || data.punchIn === "") {
//         actualPunchInForCalculations = null;
//       } else if (typeof data.punchIn === "string" && data.punchIn.match(/^\d{2}:\d{2}:\d{2}$/)) {
//         const workSessionDateStr = workSession.date.toISOString().split("T")[0];
//         actualPunchInForCalculations = createStableDateTime(workSessionDateStr, data.punchIn);
//       } else {
//         actualPunchInForCalculations = parseDateTime(data.punchIn);
//       }
//     } else {
//       actualPunchInForCalculations = workSession.punchIn;
//     }

//     if (data.punchOut !== undefined) {
//       if (data.punchOut === null || data.punchOut === "") {
//         actualPunchOutForCalculations = null;
//       } else if (typeof data.punchOut === "string" && data.punchOut.match(/^\d{2}:\d{2}:\d{2}$/)) {
//         const workSessionDateStr = workSession.date.toISOString().split("T")[0];
//         actualPunchOutForCalculations = createStableDateTime(workSessionDateStr, data.punchOut);
//       } else {
//         actualPunchOutForCalculations = parseDateTime(data.punchOut);
//       }
//     } else {
//       actualPunchOutForCalculations = workSession.punchOut;
//     }

//     console.log("=== ACTUAL Times for Calculations ===");
//     console.log("Actual punch in for calculations:", formatTime(actualPunchInForCalculations));
//     console.log("Actual punch out for calculations:", formatTime(actualPunchOutForCalculations));
//   }

//   // Calculate deducted minutes and process overtime BEFORE database update
//   if (actualPunchInForCalculations || actualPunchOutForCalculations) {
//     const finalShiftId = updateData.shiftId || workSession.shiftId;

//     if (
//       actualPunchInForCalculations &&
//       actualPunchOutForCalculations &&
//       finalShiftId
//     ) {
//       // Get employee shift info
//       const employee = await prisma.employee.findFirst({
//         where: { deviceUserId: workSession.deviceUserId },
//         include: {
//           employeeShifts: {
//             where: { isActive: true },
//             include: {
//               shift: {
//                 select: {
//                   id: true,
//                   shiftType: true,
//                 },
//               },
//             },
//             take: 1,
//           },
//         },
//       });

//       if (employee && employee.employeeShifts.length > 0) {
//         const activeShift = employee.employeeShifts[0];

//         // Get shift day info for deductible calculations
//         const dateObj = new Date(workSession.date);
//         const jsDay = dateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.
//         const dayNumber = jsDay === 0 ? 7 : jsDay; // Convert to 1-7 format (1 = Monday, 7 = Sunday)

//         const shiftDay = await prisma.shiftDay.findFirst({
//           where: {
//             shiftId: finalShiftId,
//             dayNumber: dayNumber,
//           },
//         });

//         if (shiftDay) {
//           // Start with break time
//           let dedutedMinutes = shiftDay.breakTime || 0;

//           // For FIXED_WEEKLY shifts, add attendance penalties (late arrival + early departure)
//           if (activeShift.shift.shiftType === "FIXED_WEEKLY") {
//             const gracePeriodMinutes = shiftDay.gracePeriod || 0;

//             // Extract time strings from shift DateTime objects and create them on the work date
//             const shiftStartTimeStr = formatTime(new Date(shiftDay.startTime));
//             const shiftEndTimeStr = formatTime(new Date(shiftDay.endTime));

//             if (shiftStartTimeStr && shiftEndTimeStr) {
//               const workDateStr = workSession.date.toISOString().split("T")[0]; // Use the work date string (YYYY-MM-DD format)
//               const shiftStartTime = createStableDateTime(
//                 workDateStr,
//                 shiftStartTimeStr
//               );
//               const shiftEndTime = createStableDateTime(
//                 workDateStr,
//                 shiftEndTimeStr
//               );

//               // Calculate late arrival penalty (beyond grace period)
//               if (actualPunchInForCalculations > shiftStartTime) {
//                 const lateArrivalMinutes = Math.round(
//                   (actualPunchInForCalculations.getTime() -
//                     shiftStartTime.getTime()) /
//                     (1000 * 60)
//                 );
//                 // Only count as deductible if beyond grace period
//                 if (lateArrivalMinutes > gracePeriodMinutes) {
//                   dedutedMinutes += lateArrivalMinutes - gracePeriodMinutes;
//                 }
//               }

//               // Calculate early departure penalty (beyond grace period)
//               if (actualPunchOutForCalculations < shiftEndTime) {
//                 const earlyDepartureMinutes = Math.round(
//                   (shiftEndTime.getTime() -
//                     actualPunchOutForCalculations.getTime()) /
//                     (1000 * 60)
//                 );
//                 // Only count as deductible if beyond grace period
//                 if (earlyDepartureMinutes > gracePeriodMinutes) {
//                   dedutedMinutes += earlyDepartureMinutes - gracePeriodMinutes;
//                 }
//               }

//               console.log(
//                 "=== Update Deductible Minutes Calculation (FIXED_WEEKLY) ==="
//               );
//               console.log("Break time:", shiftDay.breakTime || 0);
//               console.log("Grace period:", gracePeriodMinutes);
//               console.log("Shift start:", formatTime(shiftStartTime));
//               console.log("Shift end:", formatTime(shiftEndTime));
//               console.log(
//                 "Actual punch in:",
//                 formatTime(actualPunchInForCalculations)
//               );
//               console.log(
//                 "Actual punch out:",
//                 formatTime(actualPunchOutForCalculations)
//               );
//               console.log("Total deductible minutes:", dedutedMinutes);
//             }
//           }

//           updateData.dedutedMinutes = dedutedMinutes;
//         }

//         // Process overtime BEFORE database update (following createWorkSession pattern)
//         console.log(
//           "=== Processing Overtime for Update (Before DB Update) ==="
//         );

//         // Delete existing overtime records for this session
//         await (prisma as any).overtimeTable.deleteMany({
//           where: { workSessionId: id },
//         });

//         // Process overtime using ACTUAL punch times (before normalization)
//         if (activeShift.shift.shiftType === "ROTATING") {
//           console.log("🔄 Processing ROTATION shift overtime");
//           await processRotationOvertime(
//             id,
//             workSession.deviceUserId,
//             workSession.date,
//             actualPunchInForCalculations,
//             actualPunchOutForCalculations
//           );
//         } else {
//           console.log("📅 Processing FIXED_WEEKLY shift overtime");
//           await processOvertimeLogic(
//             id,
//             workSession.deviceUserId,
//             workSession.date,
//             actualPunchInForCalculations,
//             actualPunchOutForCalculations,
//             finalShiftId
//           );
//         }
//       }
//     }
//   }

//   const updated = await (prisma as any).workSession.update({
//     where: { id },
//     data: updateData,
//     include: {
//       shift: {
//         select: {
//           id: true,
//           name: true,
//           shiftType: true,
//         },
//       },
//       OvertimeTable: true,
//     },
//   });

//   // return await getWorkSessionById(id);
//   // Use the properly converted times from updateData (which handles time-only strings correctly)
//   const actualPunchIn =
//     updateData.punchIn !== undefined ? updateData.punchIn : workSession.punchIn;
//   const actualPunchOut =
//     updateData.punchOut !== undefined
//       ? updateData.punchOut
//       : workSession.punchOut;

//   console.log("=== Overtime Reprocessing for Update ===");
//   console.log(
//     `Actual punch-in (for overtime): ${
//       actualPunchIn ? formatTime(actualPunchIn) : "unchanged"
//     }`
//   );
//   console.log(
//     `Actual punch-out (for overtime): ${
//       actualPunchOut ? formatTime(actualPunchOut) : "unchanged"
//     }`
//   );

//   // Use normalized times for session record, but actual times for overtime
//   const punchIn = updateData.punchIn || workSession.punchIn;
//   const punchOut = updateData.punchOut || workSession.punchOut;

//   // Handle overtime reprocessing differently for ROTATION vs FIXED_WEEKLY shifts
//   if (workSession.shift && workSession.shift.shiftType === "ROTATING") {
//     console.log("🔄 Reprocessing ROTATION shift overtime");

//     if (actualPunchIn && actualPunchOut) {
//       // Complete session - use session-level overtime processing (which deletes and recreates all)
//       console.log("Complete ROTATION session - reprocessing all overtime");
//       await (prisma as any).overtimeTable.deleteMany({
//         where: { workSessionId: id },
//       });

//       await processRotationOvertime(
//         id,
//         workSession.deviceUserId,
//         workSession.date,
//         actualPunchIn,
//         actualPunchOut
//       );
//     } else if (data.punchIn && !data.punchOut) {
//       // Only punch-in was updated - process single punch-in overtime
//       console.log(
//         "ROTATION punch-in updated - processing single punch overtime"
//       );

//       // Delete only early arrival overtime records (if any)
//       await (prisma as any).overtimeTable.deleteMany({
//         where: {
//           workSessionId: id,
//           type: { in: ["EARLY_ARRIVAL", "UNSCHEDULED"] },
//         },
//       });

//       const assignment = await getRotatingShiftAssignment(
//         (
//           await prisma.employee.findFirst({
//             where: { deviceUserId: workSession.deviceUserId },
//           })
//         )?.id || "",
//         workSession.date
//       );

//       if (assignment) {
//         await processRotationSinglePunchOvertime(
//           id,
//           workSession.deviceUserId,
//           workSession.date,
//           actualPunchIn,
//           assignment,
//           true // isPunchIn
//         );
//       }
//     } else if (data.punchOut && !data.punchIn) {
//       // Only punch-out was updated - process single punch-out overtime
//       console.log(
//         "ROTATION punch-out updated - processing single punch overtime"
//       );

//       // Delete only late departure overtime records (if any)
//       await (prisma as any).overtimeTable.deleteMany({
//         where: {
//           workSessionId: id,
//           type: { in: ["LATE_DEPARTURE", "EXTENDED_SHIFT"] },
//         },
//       });

//       const assignment = await getRotatingShiftAssignment(
//         (
//           await prisma.employee.findFirst({
//             where: { deviceUserId: workSession.deviceUserId },
//           })
//         )?.id || "",
//         workSession.date
//       );

//       if (assignment) {
//         await processRotationSinglePunchOvertime(
//           id,
//           workSession.deviceUserId,
//           workSession.date,
//           actualPunchOut,
//           assignment,
//           false // isPunchIn
//         );
//       }
//     } else {
//       console.log("No ROTATION overtime changes needed");
//     }
//   } else {
//     // FIXED_WEEKLY shift - delete all and recreate (existing logic)
//     console.log("📅 Reprocessing FIXED_WEEKLY shift overtime");
//     await (prisma as any).overtimeTable.deleteMany({
//       where: { workSessionId: id },
//     });

//     // FIXED_WEEKLY shift - use existing logic
//     console.log("📅 Reprocessing FIXED_WEEKLY shift overtime");
//     if (actualPunchIn && actualPunchOut) {
//       // Both actual punch times exist - use traditional logic
//       console.log("Reprocessing overtime with both actual punch times");
//       await processOvertimeLogic(
//         id,
//         workSession.deviceUserId,
//         workSession.date,
//         actualPunchIn, // Use actual punch-in time for overtime
//         actualPunchOut, // Use actual punch-out time for overtime
//         workSession.shiftId || undefined
//       );
//     } else if (actualPunchIn) {
//       // Only actual punch in exists - process single punch overtime
//       console.log("Reprocessing overtime with actual punch-in only");
//       await processSinglePunchOvertime(
//         id,
//         workSession.deviceUserId,
//         workSession.date,
//         actualPunchIn, // Use actual punch-in time for overtime
//         true, // isPunchIn
//         workSession.shiftId || undefined
//       );
//     } else if (actualPunchOut) {
//       // Only actual punch out exists - process single punch overtime
//       console.log("Reprocessing overtime with actual punch-out only");
//       await processSinglePunchOvertime(
//         id,
//         workSession.deviceUserId,
//         workSession.date,
//         actualPunchOut, // Use actual punch-out time for overtime
//         false, // isPunchIn
//         workSession.shiftId || undefined
//       );
//     }
//   }

//   return await getWorkSessionById(id);
// };
