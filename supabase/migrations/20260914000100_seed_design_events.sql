-- Seed the events shown in the events-page design.
INSERT INTO public.events (
  title, slug, category, event_date, location, city, performer_name,
  description, image_url, is_featured, status, is_published, display_order
)
VALUES
  ('ليلة الطرب الأندلسي', 'laylat-al-tarab-al-andalusi', 'concert', '2026-03-15T20:00:00+02:00', 'بيروت — لبنان', 'بيروت', 'أحمد العود', 'أمسية من الطرب الأندلسي والموشحات.', '/assets/events/event-1.png', true, 'upcoming', true, 1),
  ('أمسية العود والكلمة', 'oud-and-word-evening', 'evening', '2026-04-05T20:00:00+02:00', 'القاهرة — مصر', 'القاهرة', 'سارة الصوت', 'أمسية تجمع العود بالكلمة والغناء.', '/assets/events/event-2.png', false, 'upcoming', true, 2),
  ('مهرجان الربيع الموسيقي', 'spring-music-festival', 'festival', '2026-03-28T18:00:00+02:00', 'الدار البيضاء — المغرب', 'الدار البيضاء', 'فرقة أندلسيا', 'مهرجان موسيقي يحتفي بالمواهب الأندلسية.', '/assets/events/event-3.png', false, 'upcoming', true, 3),
  ('ورشة الإيقاع الشرقي', 'eastern-rhythm-workshop', 'workshop', '2026-03-28T16:00:00+02:00', 'عمان — الأردن', 'عمان', 'يوسف الإيقاع', 'ورشة عملية في الإيقاعات الشرقية.', '/assets/events/event-4.png', false, 'upcoming', true, 4),
  ('حفل الذكرى الخامسة', 'fifth-anniversary-concert', 'concert', '2026-04-20T20:00:00+04:00', 'دبي — الإمارات', 'دبي', 'فرقة أندلسيا', 'حفل خاص بمناسبة الذكرى الخامسة.', '/assets/events/event-5.png', false, 'upcoming', true, 5)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  event_date = EXCLUDED.event_date,
  location = EXCLUDED.location,
  city = EXCLUDED.city,
  performer_name = EXCLUDED.performer_name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  is_featured = EXCLUDED.is_featured,
  status = EXCLUDED.status,
  is_published = EXCLUDED.is_published,
  display_order = EXCLUDED.display_order,
  updated_at = now();
