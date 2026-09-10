import { z } from "zod";

// ============================================================================
// Admin Subscriber Update Schema (Task 49)
// ============================================================================

export const adminSubscriberUpdateSchema = z
  .object({
    status: z.enum(["subscribed", "unsubscribed"], {
      message: "حالة الاشتراك غير صالحة",
    }),
  })
  .strict();

export type AdminSubscriberUpdate = z.infer<typeof adminSubscriberUpdateSchema>;
