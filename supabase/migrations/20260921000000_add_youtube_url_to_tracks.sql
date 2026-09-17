-- Music tracks use YouTube as their remote audio source. No media file is stored.
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS youtube_url VARCHAR(500) NULL;
