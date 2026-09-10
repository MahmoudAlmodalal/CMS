import test from "node:test";
import assert from "node:assert/strict";
import {
  // Primitives & Enums
  trimmedString,
  optionalTrimmedString,
  safeUrlSchema,
  emailSchema,
  phoneSchema,
  slugSchema,
  dateStringSchema,
  isoDateTimeSchema,
  uuidSchema,
  positiveInt,
  ARTIST_CATEGORIES,
  RELEASE_TYPES,
  EVENT_CATEGORIES,
  EVENT_STATUSES,
  ARTICLE_CATEGORIES,
  BOOKING_EVENT_TYPES,
  BOOKING_STATUSES,
  NEWSLETTER_STATUSES,
  STORAGE_BUCKETS,
  // Media
  IMAGE_MAX_BYTES,
  AUDIO_MAX_BYTES,
  BUCKET_BYTE_LIMITS,
  BUCKET_ALLOWED_MIMES,
  fileUploadMetadataSchema,
  trackMediaSchema,
  releaseMediaSchema,
  // Public submissions
  publicBookingSubmissionSchema,
  publicNewsletterSubmissionSchema,
  // CMS entities
  siteSettingsSchema,
  artistSchema,
  trackSchema,
  releaseSchema,
  eventSchema,
  academyCourseSchema,
  articleSchema,
  testimonialSchema,
  // Security & guards
  validateUserRole,
  checkDuplicateSlug,
  checkDuplicateEmail,
  SubmissionDeduplicator,
  safeValidate,
} from "../src/lib/validations/index.ts";

// ============================================================================
// 1. Empty Fields & Whitespace Handling
// ============================================================================

test("Server-Side Validation — 1. Empty Fields & Whitespace Rejection", () => {
  const nameSchema = trimmedString(2, 150, "الاسم");

  // Missing or non-string
  assert.equal(nameSchema.safeParse(undefined).success, false);
  assert.equal(nameSchema.safeParse(null).success, false);

  // Empty string
  assert.equal(nameSchema.safeParse("").success, false);

  // Whitespace-only string
  assert.equal(nameSchema.safeParse("   ").success, false);
  assert.equal(nameSchema.safeParse("\t\n  ").success, false);

  // Valid non-empty trimmed string
  const valid = nameSchema.safeParse("  طارق العود  ");
  assert.equal(valid.success, true);
  if (valid.success) {
    assert.equal(valid.data, "طارق العود");
  }

  // Booking inquiry empty fields
  const emptyBooking = publicBookingSubmissionSchema.safeParse({
    full_name: "   ",
    email: "",
    event_type: "concert",
    event_date: "2026-12-01",
    message: " ",
  });
  assert.equal(emptyBooking.success, false);
});

// ============================================================================
// 2. Malformed Input (Emails, Phones, Numbers, Enums)
// ============================================================================

test("Server-Side Validation — 2. Malformed Input Rejection", () => {
  // Malformed emails
  assert.equal(emailSchema.safeParse("not-an-email").success, false);
  assert.equal(emailSchema.safeParse("user@").success, false);
  assert.equal(emailSchema.safeParse("@domain.com").success, false);
  assert.equal(emailSchema.safeParse("user @domain.com").success, false);
  assert.equal(emailSchema.safeParse("user@domain").success, false);

  // Valid email (normalized to lowercase)
  const validEmail = emailSchema.safeParse("  Hello@Andalusia.ART  ");
  assert.equal(validEmail.success, true);
  if (validEmail.success) {
    assert.equal(validEmail.data, "hello@andalusia.art");
  }

  // Malformed phone values
  assert.equal(phoneSchema.safeParse("12345").success, false); // too short (<7 digits)
  assert.equal(phoneSchema.safeParse("abc-def-ghij").success, false); // letters
  assert.equal(phoneSchema.safeParse("+961 1 234 567; DROP TABLE;").success, false); // SQL injection

  // Valid phone numbers
  assert.equal(phoneSchema.safeParse("+961 1 987 654").success, true);
  assert.equal(phoneSchema.safeParse("+966-50-1234567").success, true);
  assert.equal(phoneSchema.safeParse("00212612345678").success, true);

  // Malformed enums
  const invalidArtist = artistSchema.safeParse({
    name: "فنان تجريبي",
    slug: "experimental-artist",
    category: "jazz", // Not in approved ARTIST_CATEGORIES
    genre_tag: "جاز",
    city: "بيروت",
    quote: "الموسيقى حياة",
    short_bio: "نبذة قصيرة",
    full_bio: "سيرة ذاتية",
    specialties: "عزف",
    portrait_image_url: "https://example.com/portrait.webp",
  });
  assert.equal(invalidArtist.success, false);

  // Non-numeric or negative numbers
  assert.equal(positiveInt(100).safeParse(-5).success, false);
  assert.equal(positiveInt(100).safeParse(0).success, false);
  assert.equal(positiveInt(100).safeParse("ten").success, false);
  assert.equal(positiveInt(100).safeParse(12.5).success, false); // float rejected for int
});

// ============================================================================
// 3. Unexpected Fields (Mass Assignment / Injection Prevention)
// ============================================================================

test("Server-Side Validation — 3. Unexpected Fields & Strict Mode Enforcement", () => {
  // Public booking submission attempting privilege escalation / parameter injection
  const maliciousBookingAttempt = {
    full_name: "مروان خوري",
    email: "marwan@example.com",
    event_type: "wedding",
    event_date: "2026-11-20",
    message: "طلب حفل زفاف خاص مع الفرقة الكاملة",
    // Injected fields that must be REJECTED
    status: "confirmed",
    admin_notes: "خصم خاص 50% معتمد",
    id: "00000000-0000-0000-0000-000000000000",
    created_at: "2020-01-01T00:00:00Z",
  };

  const bookingResult = publicBookingSubmissionSchema.safeParse(maliciousBookingAttempt);
  assert.equal(bookingResult.success, false, "Strict schema must reject unexpected administrative fields");

  // Public newsletter submission attempting privilege escalation
  const maliciousNewsletterAttempt = {
    email: "reader@example.com",
    status: "vip_admin",
    id: "hack-id",
  };

  const newsletterResult = publicNewsletterSubmissionSchema.safeParse(maliciousNewsletterAttempt);
  assert.equal(newsletterResult.success, false, "Newsletter schema must reject unexpected fields");
});

// ============================================================================
// 4. Very Long Values (Buffer / VARCHAR Constraint Enforcements)
// ============================================================================

test("Server-Side Validation — 4. Very Long Values Bound Verification", () => {
  const slugTest = slugSchema(150);

  // 151 character slug (exceeds VARCHAR(150))
  const tooLongSlug = "a".repeat(151);
  assert.equal(slugTest.safeParse(tooLongSlug).success, false);

  // Exactly 150 character slug
  const validLengthSlug = "a".repeat(150);
  assert.equal(slugTest.safeParse(validLengthSlug).success, true);

  // Email > 255 chars
  const longDomain = "a".repeat(250) + "@example.com";
  assert.equal(emailSchema.safeParse(longDomain).success, false);

  // Phone > 50 chars
  const longPhone = "+1" + "0".repeat(50);
  assert.equal(phoneSchema.safeParse(longPhone).success, false);

  // URL > 500 chars
  const longUrl = "https://example.com/" + "x".repeat(500);
  assert.equal(safeUrlSchema(500).safeParse(longUrl).success, false);
});

// ============================================================================
// 5. Invalid URLs & Dangerous Protocol Rejection
// ============================================================================

test("Server-Side Validation — 5. URL Safety & Protocol Enforcement", () => {
  const urlValidator = safeUrlSchema(500);

  // XSS & Pseudo-protocols
  assert.equal(urlValidator.safeParse("javascript:alert('pwned')").success, false);
  assert.equal(urlValidator.safeParse("data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==").success, false);
  assert.equal(urlValidator.safeParse("vbscript:msgbox(1)").success, false);

  // Disallowed schemes
  assert.equal(urlValidator.safeParse("ftp://ftp.example.com/audio.mp3").success, false);
  assert.equal(urlValidator.safeParse("file:///etc/passwd").success, false);

  // Malformed URLs
  assert.equal(urlValidator.safeParse("not a url").success, false);
  assert.equal(urlValidator.safeParse("https://").success, false);

  // Valid HTTPS and HTTP URLs
  assert.equal(urlValidator.safeParse("https://supabase.co/storage/v1/object/public/site/hero.webp").success, true);
  assert.equal(urlValidator.safeParse("http://localhost:3000/assets/logo.svg").success, true);
});

// ============================================================================
// 6. Duplicate Slugs & Duplicate Emails Detection
// ============================================================================

test("Server-Side Validation — 6. Duplicate Slugs & Duplicate Emails Prevention", () => {
  const existingSlugs = [
    { id: "1", slug: "tariq-oud" },
    { id: "2", slug: "sarah-voice" },
    { id: "3", slug: "andalusia-night" },
  ];

  // Case-insensitive duplicate collision
  const collision = checkDuplicateSlug("TARIQ-OUD", existingSlugs);
  assert.equal(collision.isDuplicate, true);
  assert.ok(collision.error?.includes("مستخدم بالفعل"));

  // Updating same item (same currentId) is NOT a collision
  const selfUpdate = checkDuplicateSlug("tariq-oud", existingSlugs, "1");
  assert.equal(selfUpdate.isDuplicate, false);

  // Distinct new slug is NOT a collision
  const newSlug = checkDuplicateSlug("ahmed-percussion", existingSlugs);
  assert.equal(newSlug.isDuplicate, false);

  // Duplicate email check
  const existingSubscribers = [
    { id: "s1", email: "subscriber@andalusia.art" },
    { id: "s2", email: "info@andalusia.art" },
  ];

  const emailDup = checkDuplicateEmail("SUBSCRIBER@andalusia.art", existingSubscribers);
  assert.equal(emailDup.isDuplicate, true);

  const emailUnique = checkDuplicateEmail("new-fan@andalusia.art", existingSubscribers);
  assert.equal(emailUnique.isDuplicate, false);
});

// ============================================================================
// 7. Malformed Dates & Calendar Validity
// ============================================================================

test("Server-Side Validation — 7. Malformed Dates & Calendar Strictness", () => {
  // Calendar anomalies that JS Date silently rolls over
  assert.equal(dateStringSchema.safeParse("2026-02-31").success, false, "Feb 31 must be rejected");
  assert.equal(dateStringSchema.safeParse("2026-04-31").success, false, "April 31 must be rejected");
  assert.equal(dateStringSchema.safeParse("2026-02-29").success, false, "Feb 29 in non-leap year 2026 must be rejected");
  assert.equal(dateStringSchema.safeParse("2024-02-29").success, true, "Feb 29 in leap year 2024 must pass");

  // Non-date strings
  assert.equal(dateStringSchema.safeParse("tomorrow").success, false);
  assert.equal(dateStringSchema.safeParse("2026-13-01").success, false);
  assert.equal(dateStringSchema.safeParse("2026/05/15").success, false);

  // ISO DateTime validation
  assert.equal(isoDateTimeSchema.safeParse("2026-09-15T18:00:00Z").success, true);
  assert.equal(isoDateTimeSchema.safeParse("2026-09-15T18:00:00+03:00").success, true);
  assert.equal(isoDateTimeSchema.safeParse("2026-02-31T18:00:00Z").success, false);

  // Booking event date in the past must be rejected
  const pastBooking = publicBookingSubmissionSchema.safeParse({
    full_name: "سامر حسن",
    email: "samer@example.com",
    event_type: "hotel",
    event_date: "2020-01-01", // Past date
    message: "حجز فعالية قديمة",
  });
  assert.equal(pastBooking.success, false, "Past event dates must be rejected for bookings");
});

// ============================================================================
// 8. Unauthorized Requests & RBAC Roles
// ============================================================================

test("Server-Side Validation — 8. Unauthorized Requests & Role Authorization", () => {
  // Anonymous visitor
  const anonCheck = validateUserRole("anonymous");
  assert.equal(anonCheck.authorized, false);
  assert.ok(anonCheck.error?.includes("غير مصرح"));

  // Null or missing session
  const nullCheck = validateUserRole(null);
  assert.equal(nullCheck.authorized, false);

  // Standard authenticated user without admin role
  const authUserCheck = validateUserRole("authenticated");
  assert.equal(authUserCheck.authorized, false);

  // Authorized admin
  const adminCheck = validateUserRole("admin");
  assert.equal(adminCheck.authorized, true);
  assert.equal(adminCheck.role, "admin");

  // Authorized service_role
  const serviceCheck = validateUserRole("service_role");
  assert.equal(serviceCheck.authorized, true);
});

// ============================================================================
// 9. Repeated Submissions & Anti-Replay Guard
// ============================================================================

test("Server-Side Validation — 9. Repeated Submissions & Deduplication Guard", () => {
  SubmissionDeduplicator.reset();

  const payload = {
    email: "fan@andalusia.art",
    form: "newsletter",
  };
  const key = SubmissionDeduplicator.createFingerprint("newsletter", payload);

  // Initial submission: not repeated
  assert.equal(SubmissionDeduplicator.isRepeated(key, 5000), false);

  // Record the submission
  SubmissionDeduplicator.record(key);

  // Immediate repeated attempt within cooldown: detected as repeated
  assert.equal(SubmissionDeduplicator.isRepeated(key, 5000), true);

  // Different payload: not repeated
  const differentPayload = {
    email: "other@andalusia.art",
    form: "newsletter",
  };
  const diffKey = SubmissionDeduplicator.createFingerprint("newsletter", differentPayload);
  assert.equal(SubmissionDeduplicator.isRepeated(diffKey, 5000), false);

  // Clean up
  SubmissionDeduplicator.reset();
  assert.equal(SubmissionDeduplicator.isRepeated(key, 5000), false);
});

// ============================================================================
// 10. Storage & Media Metadata Validation
// ============================================================================

test("Server-Side Validation — 10. Storage & Media Metadata Policy", () => {
  // 7 canonical buckets
  assert.equal(STORAGE_BUCKETS.length, 7);
  assert.equal(IMAGE_MAX_BYTES, 5 * 1024 * 1024);
  assert.equal(AUDIO_MAX_BYTES, 30 * 1024 * 1024);

  // Valid image upload to 'artists' bucket
  const validImageUpload = fileUploadMetadataSchema.safeParse({
    bucket: "artists",
    fileName: "portraits/tariq.webp",
    mimeType: "image/webp",
    fileSizeBytes: 2 * 1024 * 1024,
  });
  assert.equal(validImageUpload.success, true);

  // Oversized image in 'artists' bucket (> 5MB)
  const oversizedImage = fileUploadMetadataSchema.safeParse({
    bucket: "artists",
    fileName: "portraits/huge.png",
    mimeType: "image/png",
    fileSizeBytes: 6 * 1024 * 1024,
  });
  assert.equal(oversizedImage.success, false);

  // Valid 25MB audio upload to 'audio' bucket
  const validAudioUpload = fileUploadMetadataSchema.safeParse({
    bucket: "audio",
    fileName: "tracks/taqsim.mp3",
    mimeType: "audio/mpeg",
    fileSizeBytes: 25 * 1024 * 1024,
  });
  assert.equal(validAudioUpload.success, true);

  // Audio exceeding 30MB (> 31,457,280 bytes)
  const oversizedAudio = fileUploadMetadataSchema.safeParse({
    bucket: "audio",
    fileName: "tracks/giant-recording.wav",
    mimeType: "audio/wav",
    fileSizeBytes: 32 * 1024 * 1024,
  });
  assert.equal(oversizedAudio.success, false);

  // Audio mime uploaded to image bucket
  const audioInImageBucket = fileUploadMetadataSchema.safeParse({
    bucket: "releases",
    fileName: "covers/track.mp3",
    mimeType: "audio/mpeg",
    fileSizeBytes: 1 * 1024 * 1024,
  });
  assert.equal(audioInImageBucket.success, false);

  // Spoofed file extension (exe disguised as mp3)
  const spoofedFile = fileUploadMetadataSchema.safeParse({
    bucket: "audio",
    fileName: "tracks/virus.exe",
    mimeType: "audio/mpeg",
    fileSizeBytes: 1024,
  });
  assert.equal(spoofedFile.success, false);

  // Path traversal attempt
  const pathTraversal = fileUploadMetadataSchema.safeParse({
    bucket: "site",
    fileName: "../../../etc/shadow.jpg",
    mimeType: "image/jpeg",
    fileSizeBytes: 1024,
  });
  assert.equal(pathTraversal.success, false);
});

// ============================================================================
// 11. End-to-End CMS Domain Models Validation
// ============================================================================

test("Server-Side Validation — 11. CMS Domain Models Validation", () => {
  // Site Settings singleton
  const validSettings = siteSettingsSchema.safeParse({
    id: "default",
    hero_headline: "منصتك الأولى لاكتشاف ودعم الموسيقى العربية الأصيلة",
    hero_subheadline: "نحتفي برواد التراث والأندلسيات المعاصرة",
    hero_image_url: "https://example.com/site/hero.webp",
    about_headline: "نكتشف · نصل · نحتفي",
    about_body: "تأسست فرقة أندلسيا لإحياء وتطوير الموسيقى العربية التراثية بأسلوب معاصر.",
    about_image_url: "https://example.com/site/about.webp",
    booking_banner_title: "مناسبتك تستحق لحناً فريداً",
    booking_banner_body: "تواصل معنا لحجز حفلات خاصة ومهرجانات موسيقية.",
    contact_email: "hello@andalusia.art",
    contact_phone: "+961 1 234 567",
    social_links: {
      instagram: "https://instagram.com/andalusia",
      tiktok: "https://tiktok.com/@andalusia",
    },
    operational_regions: "لبنان · المغرب · الخليج",
    footer_mission: "أندلسيا منصة ثقافية موسيقية تسعى لتمكين الفنانين وصون التراث.",
    copyright_text: "© أندلسيا ٢٠٢٥ — جميع الحقوق محفوظة",
  });
  assert.equal(validSettings.success, true);

  // Artist record
  const validArtist = artistSchema.safeParse({
    name: "طارق العود",
    slug: "tariq-oud",
    category: "oud",
    genre_tag: "عزف العود",
    city: "بيروت",
    quote: "الموسيقى هي الجسر بين الماضي والمستقبل.",
    short_bio: "عازف ومؤلف موسيقي لبناني.",
    full_bio: "بدأ طارق العود مسيرته الموسيقية في سن مبكرة في المعهد الوطني العالي للموسيقى.",
    specialties: "عزف العود • المقامات • التأليف الموسيقي",
    portrait_image_url: "https://example.com/artists/tariq.webp",
    is_featured: true,
    is_published: true,
    display_order: 1,
  });
  assert.equal(validArtist.success, true);

  // Event record
  const validEvent = eventSchema.safeParse({
    title: "ليلة الطرب الأندلسي",
    slug: "andalusian-tarab-night",
    category: "concert",
    event_date: "2026-10-15T20:00:00Z",
    location: "قصر الثقافة — بيروت",
    city: "بيروت",
    performer_name: "فرقة أندلسيا الموسيقية",
    description: "أمسية طربية تستحضر موشحات الأندلس والمقامات الكلاسيكية.",
    image_url: "https://example.com/events/poster.webp",
    ticket_url: "https://tickets.example.com/andalusia",
    is_featured: true,
    status: "upcoming",
    is_published: true,
    display_order: 1,
  });
  assert.equal(validEvent.success, true);

  // Academy course record
  const validCourse = academyCourseSchema.safeParse({
    title: "مدرسة العود",
    slug: "oud-school",
    track_category: "مدرسة التراث",
    description: "برنامج تدريبي مكثف على أصول العزف والانتقال بين المقامات الموسيقية.",
    instructor_name: "طارق العود",
    display_order: 1,
    is_published: true,
  });
  assert.equal(validCourse.success, true);

  // Article record
  const validArticle = articleSchema.safeParse({
    title: "رحلة الموشح الأندلسي عبر العصور",
    slug: "journey-of-andalusian-muwashah",
    category: "culture",
    excerpt: "كيف حافظت الموسيقى الأندلسية على روحها عبر القرون وانتقلت إلى بلاد الشام والمغرب العربي.",
    content: "# رحلة الموشح\n\nتعد الموشحات من أرقى الفنون الشعرية والموسيقية...",
    cover_image_url: "https://example.com/articles/muwashah.webp",
    author_name: "هيئة التحرير",
    published_at: "2026-09-01T10:00:00Z",
    is_featured: true,
    is_published: true,
  });
  assert.equal(validArticle.success, true);

  // Helper safeValidate test
  const wrapped = safeValidate(artistSchema, {
    name: "فنان بدون تصنيف صالح",
    slug: "invalid-artist",
    category: "not-a-category",
  });
  assert.equal(wrapped.success, false);
  if (!wrapped.success) {
    assert.ok(Object.keys(wrapped.errors).length > 0);
  }
});
