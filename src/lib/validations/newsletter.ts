import { z } from "zod";
import { emailSchema, newsletterStatusSchema } from "./primitives.ts";

// ============================================================================
// Public Newsletter Subscription Schema (/academy)
// ============================================================================

/**
 * Validates public visitor newsletter subscription requests.
 * Uses .strict() to reject injected fields (status, id, created_at, etc.).
 */
export const publicNewsletterSubmissionSchema = z
  .object({
    email: emailSchema,
  })
  .strict();

export type PublicNewsletterSubmission = z.infer<
  typeof publicNewsletterSubmissionSchema
>;

// ============================================================================
// Admin Newsletter Subscriber Management Schema
// ============================================================================

export const adminNewsletterUpdateSchema = z
  .object({
    status: newsletterStatusSchema,
  })
  .strict();

export type AdminNewsletterUpdate = z.infer<typeof adminNewsletterUpdateSchema>;
