import { z } from "zod";

export const paymentJobSchema = z.object({
  debitAccount: z.string().min(1, "Debit account is required"),
  totalAmount: z.number().positive("Total amount must be positive"),
  bulkId: z.string().min(1, "Bulk ID is required"),
  participantId: z.string().min(1, "Participant ID is required"),
  creditTransactions: z
    .array(
      z.object({
        orderId: z.string().min(1, "Order ID is required"),
        creditAccount: z.string().min(1, "Credit account is required"),
        amount: z.number().positive("Amount must be positive"),
      })
    )
    .min(1, "At least one credit transaction is required"),
});

export type PaymentJobData = z.infer<typeof paymentJobSchema>;
