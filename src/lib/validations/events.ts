// Task 46 — Events CMS Validation Schema
// NOTE: Events link to /booking?event_id=... not /events/[slug].
// There are no public event detail pages.

import { z } from "zod";
import {
  trimmedString,
  optionalTrimmedString,
  safeUrlSchema,
  slugSchema,
  isoDateTimeSchema,
  uuidSchema,
  eventCategorySchema,
  eventStatusSchema,
} from "./primitives.ts";

/**
 * Zod schema for validating admin event form submissions.
 * Maps to the events table in Supabase (title, location, city, performer_name, etc.)
 */
export const eventSchema = z
  .object({
    id: uuidSchema.optional(),
    title: trimmedString(2, 200, "عنوان الفعالية"),
    slug: slugSchema(200),
    category: eventCategorySchema,
    event_date: isoDateTimeSchema,
    location: trimmedString(2, 200, "مكان الفعالية"),
    city: trimmedString(2, 100, "مدينة الفعالية"),
    performer_name: trimmedString(1, 150, "اسم المؤدي أو الفرقة"),
    artist_id: uuidSchema.optional().nullable(),
    description: optionalTrimmedString(5000).optional().nullable(),
    image_url: z.union([z.literal(""), safeUrlSchema(500)]).optional(),
    ticket_url: safeUrlSchema(500).optional().nullable(),
    is_featured: z.boolean().default(false),
    status: eventStatusSchema.default("upcoming"),
    is_published: z.boolean().default(false),
    display_order: z.number().int().min(0).default(0),
  })
  .strict();

export type EventFormInput = z.infer<typeof eventSchema>;

/**
 * Partial schema for update operations (all fields optional except id).
 */
export const eventUpdateSchema = eventSchema.omit({ id: true }).partial();

export type EventUpdateInput = z.infer<typeof eventUpdateSchema>;
