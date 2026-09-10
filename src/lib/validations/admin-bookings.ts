import { z } from "zod";
import { optionalTrimmedString } from "./primitives.ts";

// ============================================================================
// Admin Booking Update Schema (Task 49)
// Status values match booking_requests DB constraint:
// pending | contacted | confirmed | archived
// ============================================================================

export const adminBookingUpdateSchema = z
  .object({
    status: z.enum(["pending", "contacted", "confirmed", "archived"], {
      message: "حالة الحجز غير صالحة",
    }),
    admin_notes: optionalTrimmedString(2000).optional().nullable(),
  })
  .strict();

export type AdminBookingUpdate = z.infer<typeof adminBookingUpdateSchema>;
