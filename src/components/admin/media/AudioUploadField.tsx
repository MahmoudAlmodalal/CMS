"use client";

import { AUDIO_MAX_BYTES, BUCKET_ALLOWED_MIMES, MIME_CANONICAL_EXT } from "@/lib/storage";
import { Input } from "@/components/ui/Input";

interface AudioUploadFieldProps {
  id: string;
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

const AUDIO_BUCKET = "audio" as const;

/** The formats a previously-uploaded track may be hosted in, for the hint copy. */
const HOSTED_FORMATS = Array.from(
  new Set(
    BUCKET_ALLOWED_MIMES[AUDIO_BUCKET]
      .map((mime) => MIME_CANONICAL_EXT[mime])
      .filter((ext): ext is string => Boolean(ext)),
  ),
)
  .map((ext) => ext.toUpperCase())
  .join("/");

const HOSTED_LIMIT_MB = AUDIO_MAX_BYTES / (1024 * 1024);

/**
 * Audio reference field — a pasted link, no file picker.
 *
 * Uploading audio through a Server Action was removed deliberately: the action
 * body limit killed every track over 1 MB, and the decision is that works are
 * published as YouTube videos instead. Tracks already stored in the `audio`
 * bucket keep working — their public URL still pastes in here and still plays
 * in the preview below.
 */
export function AudioUploadField({ id, value, onChange, disabled = false }: AudioUploadFieldProps) {
  return (
    <div className="space-y-3">
      {value ? (
        <div className="space-y-2">
          <audio controls src={value} className="w-full" preload="metadata" />
          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 flex-1 truncate text-xs text-gradscale-400" dir="ltr">
              {value}
            </p>
            <button
              type="button"
              onClick={() => onChange("")}
              disabled={disabled}
              className="shrink-0 text-xs font-bold text-alert-error hover:underline disabled:opacity-50"
            >
              إزالة الملف
            </button>
          </div>
        </div>
      ) : null}

      <div>
        <label htmlFor={`${id}-url`} className="mb-1 block text-xs font-bold text-gradscale-400">
          الصق رابط الملف الصوتي
        </label>
        <Input
          id={`${id}-url`}
          type="url"
          dir="ltr"
          placeholder="https://..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      </div>

      <p className="text-xs leading-relaxed text-gradscale-400">
        الصق رابطاً مباشراً لملف صوتي ({HOSTED_FORMATS} حتى {HOSTED_LIMIT_MB}MB على الاستضافة).
        لعرض عمل فني للجمهور استخدم صفحة «الأعمال» وأضفه كفيديو يوتيوب.
      </p>
    </div>
  );
}
