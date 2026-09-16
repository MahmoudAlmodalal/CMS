-- Migration: 20260919000000_add_academy_detail_and_booking_cms_controls.sql
-- Purpose: Add CMS detail fields for Academy courses and Booking page controls.
-- Idempotent: ALTER TABLE ... ADD COLUMN IF NOT EXISTS.
-- Rollback: Safe nullable columns, no destructive operations.

-- 1. Academy Course Detail Fields
ALTER TABLE academy_courses
  ADD COLUMN IF NOT EXISTS price VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS price_en VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS duration VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS duration_en VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS group_size VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS group_size_en VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS certificate VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS certificate_en VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS language VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS language_en VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS offer_text TEXT NULL,
  ADD COLUMN IF NOT EXISTS offer_text_en TEXT NULL,
  ADD COLUMN IF NOT EXISTS philosophy_text TEXT NULL,
  ADD COLUMN IF NOT EXISTS philosophy_text_en TEXT NULL,
  ADD COLUMN IF NOT EXISTS practice_text TEXT NULL,
  ADD COLUMN IF NOT EXISTS practice_text_en TEXT NULL,
  ADD COLUMN IF NOT EXISTS curriculum_title VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS curriculum_title_en VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS curriculum_items JSONB NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN academy_courses.price IS 'Course price display string in Arabic';
COMMENT ON COLUMN academy_courses.price_en IS 'Course price display string in English';
COMMENT ON COLUMN academy_courses.duration IS 'Course duration display string in Arabic';
COMMENT ON COLUMN academy_courses.duration_en IS 'Course duration display string in English';
COMMENT ON COLUMN academy_courses.group_size IS 'Course group size display string in Arabic';
COMMENT ON COLUMN academy_courses.group_size_en IS 'Course group size display string in English';
COMMENT ON COLUMN academy_courses.certificate IS 'Course certificate display string in Arabic';
COMMENT ON COLUMN academy_courses.certificate_en IS 'Course certificate display string in English';
COMMENT ON COLUMN academy_courses.language IS 'Course teaching language display string in Arabic';
COMMENT ON COLUMN academy_courses.language_en IS 'Course teaching language display string in English';
COMMENT ON COLUMN academy_courses.offer_text IS 'Introductory dark callout banner text in Arabic';
COMMENT ON COLUMN academy_courses.offer_text_en IS 'Introductory dark callout banner text in English';
COMMENT ON COLUMN academy_courses.philosophy_text IS 'Philosophy / methodology paragraph in Arabic';
COMMENT ON COLUMN academy_courses.philosophy_text_en IS 'Philosophy / methodology paragraph in English';
COMMENT ON COLUMN academy_courses.practice_text IS 'Prerequisites / practice requirements paragraph in Arabic';
COMMENT ON COLUMN academy_courses.practice_text_en IS 'Prerequisites / practice requirements paragraph in English';
COMMENT ON COLUMN academy_courses.curriculum_title IS 'Title of the curriculum breakdown section in Arabic';
COMMENT ON COLUMN academy_courses.curriculum_title_en IS 'Title of the curriculum breakdown section in English';
COMMENT ON COLUMN academy_courses.curriculum_items IS 'Structured curriculum items: array of { number, title, title_en, body, body_en }';

-- 2. Booking Page & Form Controls in Site Settings
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS booking_hero_image_url VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS booking_group_personal VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS booking_group_personal_en VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS booking_group_occasion VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS booking_group_occasion_en VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS booking_consent_text TEXT NULL,
  ADD COLUMN IF NOT EXISTS booking_consent_text_en TEXT NULL,
  ADD COLUMN IF NOT EXISTS booking_submit_label VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS booking_submit_label_en VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS booking_loading_label VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS booking_loading_label_en VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS booking_success_title VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS booking_success_title_en VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS booking_success_body TEXT NULL,
  ADD COLUMN IF NOT EXISTS booking_success_body_en TEXT NULL,
  ADD COLUMN IF NOT EXISTS booking_success_note TEXT NULL,
  ADD COLUMN IF NOT EXISTS booking_success_note_en TEXT NULL;

COMMENT ON COLUMN site_settings.booking_hero_image_url IS 'Custom hero background image URL for /booking';
COMMENT ON COLUMN site_settings.booking_group_personal IS 'Personal info fieldset legend override in Arabic';
COMMENT ON COLUMN site_settings.booking_group_personal_en IS 'Personal info fieldset legend override in English';
COMMENT ON COLUMN site_settings.booking_group_occasion IS 'Occasion details fieldset legend override in Arabic';
COMMENT ON COLUMN site_settings.booking_group_occasion_en IS 'Occasion details fieldset legend override in English';
COMMENT ON COLUMN site_settings.booking_consent_text IS 'Booking legal terms notice override in Arabic';
COMMENT ON COLUMN site_settings.booking_consent_text_en IS 'Booking legal terms notice override in English';
COMMENT ON COLUMN site_settings.booking_submit_label IS 'Booking submit button label override in Arabic';
COMMENT ON COLUMN site_settings.booking_submit_label_en IS 'Booking submit button label override in English';
COMMENT ON COLUMN site_settings.booking_loading_label IS 'Booking submitting/loading text override in Arabic';
COMMENT ON COLUMN site_settings.booking_loading_label_en IS 'Booking submitting/loading text override in English';
COMMENT ON COLUMN site_settings.booking_success_title IS 'Booking success modal/screen title override in Arabic';
COMMENT ON COLUMN site_settings.booking_success_title_en IS 'Booking success modal/screen title override in English';
COMMENT ON COLUMN site_settings.booking_success_body IS 'Booking success modal/screen body override in Arabic';
COMMENT ON COLUMN site_settings.booking_success_body_en IS 'Booking success modal/screen body override in English';
COMMENT ON COLUMN site_settings.booking_success_note IS 'Booking success note override in Arabic';
COMMENT ON COLUMN site_settings.booking_success_note_en IS 'Booking success note override in English';
