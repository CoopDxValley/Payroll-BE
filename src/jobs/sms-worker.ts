// import { Worker, Job } from "bullmq";
// import logger from "../config/logger";
// import redisClient from "../queues/redis-client";
// import { sendSMS } from "../services/sms-services";

// interface SmsJobData {
//   phoneNumber: string;
//   message: string;
//   jobId: string;
//   type: "forgotPassword" | "notification" | "confirmation" | "createAccount";
// }

// const smsWorker = new Worker<SmsJobData>(
//   "sms-queue",
//   async (job: Job<SmsJobData>) => {
//     const { phoneNumber, message, jobId, type } = job.data;

//     try {
//       if (!/^\+?[1-9]\d{1,14}$/.test(phoneNumber)) {
//         throw new Error("Invalid phone number format");
//       }

//       if (message.length > 160) {
//         throw new Error("Message exceeds 160 characters");
//       }

//       await sendSMS(phoneNumber, message);

//       logger.info(
//         `SMS job ${jobId} ${type} sent successfully to ${phoneNumber}`
//       );
//     } catch (error: any) {
//       logger.error(`SMS job ${jobId} ${type} failed for ${phoneNumber}`, {
//         error: error,
//         retryCount: job.attemptsMade + 1,
//       });
//       throw error;
//     }
//   },
//   {
//     connection: redisClient,
//     concurrency: 10,
//     limiter: {
//       max: 100,
//       duration: 1000,
//     },
//   }
// );

// smsWorker.on("ready", () => {
//   console.log("SMS Worker started!");
// });

// // smsWorker.on("failed", (job, err) => {
// //   if (job) {
// //     logger.error(`SMS job ${job.id} (${job.data.type}) failed`, {
// //       phoneNumber: job.data.phoneNumber,
// //       error: err.message,
// //     });
// //   }
// // });

// // smsWorker.on("error", (err) => {
// //   logger.error("SMS worker error", { error: err.message });
// // });

// process.on("SIGTERM", async () => {
//   await smsWorker.close();
//   logger.info("SMS worker closed gracefully");
//   process.exit(0);
// });

// export { smsWorker };
