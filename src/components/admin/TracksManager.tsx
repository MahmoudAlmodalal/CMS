"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createTrackAction,
  deleteTrackAction,
  setPublishStatusAction,
  updateTrackAction,
} from "@/actions/cms";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Field, Notice, StatusBadge } from "@/components/admin/ManagerKit";
import { AUDIO_MAX_BYTES, BUCKET_ALLOWED_MIMES } from "@/lib/storage";
import type { AdminTrack, ArtistOption } from "@/lib/types/admin-tracks";
import type { TrackInput } from "@/lib/validations";

type TrackFormValues = Omit<TrackInput, "id">;

interface TracksManagerProps {
  initialTracks: AdminTrack[];
  artists: ArtistOption[];
}

const AUDIO_MAX_MB = AUDIO_MAX_BYTES / (1024 * 1024);
const AUDIO_MIME_LIST = BUCKET_ALLOWED_MIMES.audio.join(", ");

function emptyTrack(defaultArtistId: string): TrackFormValues {
  return {
    artist_id: defaultArtistId,
    title: "",
    audio_file_url: "",
    duration_seconds: 0,
    cover_image_url: "",
    display_order: 0,
    is_published: false,
  };
}

function trackToForm(track: AdminTrack): TrackFormValues {
  return {
    artist_id: track.artist_id,
    title: track.title,
    audio_file_url: track.audio_file_url,
    duration_seconds: track.duration_seconds,
    cover_image_url: track.cover_image_url ?? "",
    display_order: track.display_order,
    is_published: track.is_published,
  };
}

export function TracksManager({ initialTracks, artists }: TracksManagerProps) {
  const router = useRouter();
  const [tracks, setTracks] = useState(initialTracks);
  const [values, setValues] = useState<TrackFormValues>(() => emptyTrack(artists[0]?.id ?? ""));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [audioWarning, setAudioWarning] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setTracks(initialTracks);
  }, [initialTracks]);

  const openCreate = () => {
    setEditingId(null);
    setValues(emptyTrack(artists[0]?.id ?? ""));
    setAudioWarning(null);
    setNotice(null);
    setFormOpen(true);
  };

  const openEdit = (track: AdminTrack) => {
    setEditingId(track.id);
    setValues(trackToForm(track));
    setAudioWarning(null);
    setNotice(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (pending) return;
    setFormOpen(false);
    setEditingId(null);
  };

  const setField = <K extends keyof TrackFormValues>(field: K, value: TrackFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    setNotice(null);
  };

  const handleAudioFile = (file: File | undefined) => {
    if (!file) return;
    if (file.size > AUDIO_MAX_BYTES) {
      setAudioWarning(`حجم الملف (${(file.size / (1024 * 1024)).toFixed(1)} م.ب) يتجاوز الحد المسموح ${AUDIO_MAX_MB} م.ب.`);
      return;
    }
    if (!BUCKET_ALLOWED_MIMES.audio.includes(file.type)) {
      setAudioWarning(`نوع الملف "${file.type || "غير معروف"}" غير مدعوم. الأنواع المسموحة: ${AUDIO_MIME_LIST}.`);
      return;
    }
    setAudioWarning(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    const input: TrackInput = { ...values };
    startTransition(async () => {
      try {
        const result = editingId
          ? await updateTrackAction(editingId, input)
          : await createTrackAction(input);

        if (!result.ok) {
          setNotice({ type: "error", text: result.error ?? "تعذر حفظ بيانات المقطع الصوتي" });
          return;
        }

        if (editingId) {
          setTracks((current) => current.map((track) => (
            track.id === editingId ? { ...track, ...input } : track
          )));
        }
        setNotice({ type: "success", text: editingId ? "تم تحديث المقطع الصوتي" : "تمت إضافة المقطع الصوتي" });
        setFormOpen(false);
        setEditingId(null);
        setValues(emptyTrack(artists[0]?.id ?? ""));
        router.refresh();
      } catch {
        setNotice({ type: "error", text: "تعذر حفظ البيانات حالياً. يرجى المحاولة مرة أخرى." });
      }
    });
  };

  const togglePublish = (track: AdminTrack) => {
    if (pending) return;
    startTransition(async () => {
      try {
        const nextPublished = !track.is_published;
        const result = await setPublishStatusAction("tracks", track.id, nextPublished);
        if (!result.ok) {
          setNotice({ type: "error", text: result.error ?? "تعذر تغيير حالة النشر" });
          return;
        }
        setTracks((current) => current.map((item) => item.id === track.id ? { ...item, is_published: nextPublished } : item));
        setNotice({ type: "success", text: nextPublished ? "تم نشر المقطع الصوتي" : "تم تحويل المقطع إلى مسودة" });
        router.refresh();
      } catch {
        setNotice({ type: "error", text: "تعذر تغيير حالة النشر حالياً." });
      }
    });
  };

  const removeTrack = (track: AdminTrack) => {
    if (pending || !window.confirm(`سيتم حذف «${track.title}» نهائياً. هل تريد المتابعة؟`)) return;
    startTransition(async () => {
      try {
        const result = await deleteTrackAction(track.id);
        if (!result.ok) {
          setNotice({ type: "error", text: result.error ?? "تعذر حذف المقطع الصوتي" });
          return;
        }
        setTracks((current) => current.filter((item) => item.id !== track.id));
        setNotice({ type: "success", text: "تم حذف المقطع الصوتي" });
        router.refresh();
      } catch {
        setNotice({ type: "error", text: "تعذر حذف المقطع الصوتي حالياً." });
      }
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-brand-primary">المحتوى الفني</p>
          <h1 className="mt-1 text-2xl font-bold font-sans text-brand-espresso">إدارة المقطوعات والأعمال الموسيقية</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gradscale-400">
            أدِر المقطوعات الصوتية المرتبطة بالفنانين، ترتيب الظهور، وحالات النشر.
          </p>
        </div>
        <Button type="button" onClick={openCreate} disabled={pending || artists.length === 0}>
          + إضافة مقطع صوتي
        </Button>
      </div>

      <Notice notice={notice} />

      {artists.length === 0 && (
        <Notice notice={{ type: "error", text: "لا يوجد فنانون منشورون حالياً. يجب نشر فنان واحد على الأقل قبل إضافة مقطوعات." }} />
      )}

      <Card>
        <CardHeader>
          <CardTitle>قائمة المقطوعات</CardTitle>
          <CardDescription>تظهر المسودات هنا ولا تظهر للزوار حتى يتم نشرها.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {tracks.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-lg font-bold text-brand-espresso">لا توجد مقطوعات بعد</p>
              <p className="mt-2 text-sm text-gradscale-400">ابدأ بإضافة أول مقطع صوتي إلى الموقع.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>العنوان</TableHead>
                  <TableHead>الفنان</TableHead>
                  <TableHead>المدة</TableHead>
                  <TableHead>الترتيب</TableHead>
                  <TableHead>النشر</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tracks.map((track) => (
                  <TableRow key={track.id}>
                    <TableCell>
                      <p className="truncate font-bold text-brand-espresso">{track.title}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gradscale-400">{track.artist_name ?? "—"}</p>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm" dir="ltr">{track.duration_seconds}s</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm" dir="ltr">{track.display_order}</span>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => togglePublish(track)}
                        disabled={pending}
                        aria-pressed={track.is_published}
                        className="inline-flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                        title={track.is_published ? "تحويل إلى مسودة" : "نشر المقطع"}
                      >
                        <StatusBadge published={track.is_published} />
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(track)} disabled={pending}>تعديل</Button>
                        <button
                          type="button"
                          onClick={() => removeTrack(track)}
                          disabled={pending}
                          className="rounded-button px-3 py-2 text-xs font-bold text-alert-error hover:bg-alert-error/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alert-error"
                        >
                          حذف
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {formOpen && (
        <Card variant="primary-border" id="track-form">
          <CardHeader>
            <CardTitle>{editingId ? "تعديل المقطع الصوتي" : "إضافة مقطع صوتي جديد"}</CardTitle>
            <CardDescription>الحقول المعلّمة بنجمة مطلوبة، ويمكن حفظ المقطع كمسودة قبل نشره.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit} aria-label={editingId ? "نموذج تعديل مقطع صوتي" : "نموذج إضافة مقطع صوتي"}>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <Field id="track-artist" label="الفنان">
                <select
                  id="track-artist"
                  value={values.artist_id}
                  onChange={(event) => setField("artist_id", event.target.value)}
                  className="h-[48px] w-full rounded-input border border-brand-espresso-subtle bg-white px-4 text-sm text-gradscale-900 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
                  required
                >
                  <option value="" disabled>اختر فناناً</option>
                  {artists.map((artist) => (
                    <option key={artist.id} value={artist.id}>{artist.name}</option>
                  ))}
                </select>
              </Field>
              <Field id="track-title" label="عنوان المقطع">
                <Input id="track-title" value={values.title} onChange={(event) => setField("title", event.target.value)} required />
              </Field>
              <Field
                id="track-audio-url"
                label="رابط الملف الصوتي"
                help={`حد أقصى ${AUDIO_MAX_MB} م.ب. الأنواع المسموحة: ${AUDIO_MIME_LIST}.`}
              >
                <Input id="track-audio-url" type="url" dir="ltr" value={values.audio_file_url} onChange={(event) => setField("audio_file_url", event.target.value)} required />
              </Field>
              <Field id="track-audio-file" label="فحص ملف صوتي محلي (اختياري)" required={false} help="فحص أولي فقط في المتصفح؛ التحقق النهائي يتم على الخادم.">
                <input
                  id="track-audio-file"
                  type="file"
                  accept="audio/*"
                  onChange={(event) => handleAudioFile(event.target.files?.[0])}
                  className="block w-full text-sm text-gradscale-900 file:me-3 file:rounded-button file:border-0 file:bg-brand-primary/10 file:px-3 file:py-2 file:text-sm file:font-bold file:text-brand-primary"
                />
              </Field>
              {audioWarning && (
                <p role="alert" className="md:col-span-2 text-sm font-medium text-alert-error">{audioWarning}</p>
              )}
              <Field id="track-duration" label="المدة بالثواني">
                <Input id="track-duration" type="number" min="1" dir="ltr" value={values.duration_seconds} onChange={(event) => setField("duration_seconds", Number(event.target.value))} required />
              </Field>
              <Field id="track-cover" label="رابط صورة الغلاف" required={false}>
                <Input id="track-cover" type="url" dir="ltr" value={values.cover_image_url ?? ""} onChange={(event) => setField("cover_image_url", event.target.value)} />
              </Field>
              <Field id="track-order" label="ترتيب الظهور" help="الأرقام الأصغر تظهر أولاً.">
                <Input id="track-order" type="number" min="0" dir="ltr" value={values.display_order} onChange={(event) => setField("display_order", Number(event.target.value))} required />
              </Field>
              <div className="flex flex-wrap items-center gap-5 md:col-span-2">
                <label className="inline-flex items-center gap-2 text-sm font-bold text-brand-espresso">
                  <input type="checkbox" checked={values.is_published} onChange={(event) => setField("is_published", event.target.checked)} className="h-4 w-4 accent-brand-primary" />
                  نشر المقطع فوراً
                </label>
              </div>
            </CardContent>
            <CardFooter className="justify-start">
              <Button type="submit" isLoading={pending}>{editingId ? "حفظ التعديلات" : "حفظ المقطع"}</Button>
              <Button type="button" variant="outline" onClick={closeForm} disabled={pending}>إلغاء</Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
}
