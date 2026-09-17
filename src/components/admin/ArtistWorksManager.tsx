"use client";

import { useEffect, useMemo, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createArtistWorkAction,
  deleteArtistWorkAction,
  setPublishStatusAction,
  updateArtistWorkAction,
} from "@/actions/cms";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { BilingualField, Field, ModalShell, Notice, StatusBadge } from "@/components/admin/ManagerKit";
import { parseYouTubeId, youTubeThumbnailUrl } from "@/lib/youtube";
import {
  WORK_TYPE_OPTIONS,
  getWorkTypeLabel,
  type AdminArtistWork,
  type ArtistOption,
} from "@/lib/types/artist-works";
import type { ArtistWorkInput } from "@/lib/validations";
import { SafeImage } from "@/components/ui/SafeImage";

type WorkFormValues = Omit<ArtistWorkInput, "id">;

interface ArtistWorksManagerProps {
  initialWorks: AdminArtistWork[];
  artists: ArtistOption[];
}

function emptyWork(defaultArtistId: string): WorkFormValues {
  return {
    artist_id: defaultArtistId,
    title: "",
    title_en: null,
    work_type: "song",
    youtube_url: "",
    description: null,
    description_en: null,
    thumbnail_image_url: null,
    display_order: 0,
    is_published: false,
  };
}

function workToForm(work: AdminArtistWork): WorkFormValues {
  return {
    artist_id: work.artist_id,
    title: work.title,
    title_en: work.title_en ?? null,
    work_type: work.work_type,
    youtube_url: work.youtube_url,
    description: work.description ?? null,
    description_en: work.description_en ?? null,
    thumbnail_image_url: work.thumbnail_image_url ?? null,
    display_order: work.display_order,
    is_published: work.is_published,
  };
}

export function ArtistWorksManager({ initialWorks, artists }: ArtistWorksManagerProps) {
  const router = useRouter();
  const [works, setWorks] = useState(initialWorks);
  const [values, setValues] = useState<WorkFormValues>(() => emptyWork(artists[0]?.id ?? ""));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setWorks(initialWorks);
  }, [initialWorks]);

  // The same parser the server validates with, so the preview below can never
  // disagree with what saving will accept.
  const previewVideoId = useMemo(() => parseYouTubeId(values.youtube_url), [values.youtube_url]);
  const linkTouched = values.youtube_url.trim().length > 0;

  const openCreate = () => {
    setEditingId(null);
    setValues(emptyWork(artists[0]?.id ?? ""));
    setNotice(null);
    setFormOpen(true);
  };

  const openEdit = (work: AdminArtistWork) => {
    setEditingId(work.id);
    setValues(workToForm(work));
    setNotice(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (pending) return;
    setFormOpen(false);
    setEditingId(null);
  };

  const setField = <K extends keyof WorkFormValues>(field: K, value: WorkFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    setNotice(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    if (!parseYouTubeId(values.youtube_url)) {
      setNotice({ type: "error", text: "رابط يوتيوب غير صالح. الصق رابط الفيديو من يوتيوب." });
      return;
    }

    const input: ArtistWorkInput = { ...values };
    startTransition(async () => {
      try {
        const result = editingId
          ? await updateArtistWorkAction(editingId, input)
          : await createArtistWorkAction(input);

        if (!result.ok) {
          setNotice({ type: "error", text: result.error ?? "تعذر حفظ بيانات العمل" });
          return;
        }

        if (editingId) {
          setWorks((current) => current.map((work) => (
            work.id === editingId ? { ...work, ...input } : work
          )));
        }
        setNotice({ type: "success", text: editingId ? "تم تحديث العمل" : "تمت إضافة العمل" });
        setFormOpen(false);
        setEditingId(null);
        setValues(emptyWork(artists[0]?.id ?? ""));
        router.refresh();
      } catch {
        setNotice({ type: "error", text: "تعذر حفظ البيانات حالياً. يرجى المحاولة مرة أخرى." });
      }
    });
  };

  const togglePublish = (work: AdminArtistWork) => {
    if (pending) return;
    startTransition(async () => {
      try {
        const nextPublished = !work.is_published;
        const result = await setPublishStatusAction("artist_works", work.id, nextPublished);
        if (!result.ok) {
          setNotice({ type: "error", text: result.error ?? "تعذر تغيير حالة النشر" });
          return;
        }
        setWorks((current) => current.map((item) => (
          item.id === work.id ? { ...item, is_published: nextPublished } : item
        )));
        setNotice({ type: "success", text: nextPublished ? "تم نشر العمل" : "تم تحويل العمل إلى مسودة" });
        router.refresh();
      } catch {
        setNotice({ type: "error", text: "تعذر تغيير حالة النشر حالياً." });
      }
    });
  };

  const removeWork = (work: AdminArtistWork) => {
    if (pending || !window.confirm(`سيتم حذف «${work.title}» نهائياً. هل تريد المتابعة؟`)) return;
    startTransition(async () => {
      try {
        const result = await deleteArtistWorkAction(work.id);
        if (!result.ok) {
          setNotice({ type: "error", text: result.error ?? "تعذر حذف العمل" });
          return;
        }
        setWorks((current) => current.filter((item) => item.id !== work.id));
        setNotice({ type: "success", text: "تم حذف العمل" });
        router.refresh();
      } catch {
        setNotice({ type: "error", text: "تعذر حذف العمل حالياً." });
      }
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-brand-primary">المحتوى الفني</p>
          <h1 className="mt-1 text-2xl font-bold font-sans text-brand-espresso">إدارة أعمال الفنانين</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gradscale-400">
            الأعمال تُضاف كروابط يوتيوب وتظهر في قسم «الأعمال» داخل صفحة الفنان.
          </p>
        </div>
        <Button type="button" onClick={openCreate} disabled={pending || artists.length === 0}>
          + إضافة عمل
        </Button>
      </div>

      <Notice notice={notice} />

      {artists.length === 0 && (
        <Notice notice={{ type: "error", text: "لا يوجد فنانون بعد. أضف فناناً واحداً على الأقل قبل إضافة الأعمال." }} />
      )}

      <Card>
        <CardHeader>
          <CardTitle>قائمة الأعمال</CardTitle>
          <CardDescription>تظهر المسودات هنا ولا تظهر للزوار حتى يتم نشرها.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {works.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-lg font-bold text-brand-espresso">لا توجد أعمال بعد</p>
              <p className="mt-2 text-sm text-gradscale-400">
                ابدأ بإضافة أول عمل — الصق رابط الفيديو من يوتيوب فقط.
              </p>
              {artists.length > 0 && (
                <Button type="button" size="sm" className="mt-5" onClick={openCreate}>إضافة أول عمل</Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>العمل</TableHead>
                  <TableHead>الفنان</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الترتيب</TableHead>
                  <TableHead>النشر</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {works.map((work) => {
                  const videoId = parseYouTubeId(work.youtube_url);
                  return (
                    <TableRow key={work.id}>
                      <TableCell>
                        <div className="flex min-w-[220px] items-center gap-3">
                          <div className="h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-brand-surface">
                            {videoId ? (
                              <SafeImage
                                src={work.thumbnail_image_url || youTubeThumbnailUrl(videoId)}
                                bucket="artists"
                                alt=""
                                fill
                                sizes="80px"
                                fallbackText={work.title}
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-bold text-brand-espresso">{work.title}</p>
                            <p className="truncate text-xs text-gradscale-400" dir="ltr">{work.youtube_url}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gradscale-400">{work.artist_name ?? "—"}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-brand-espresso">{getWorkTypeLabel(work.work_type)}</p>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm" dir="ltr">{work.display_order}</span>
                      </TableCell>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => togglePublish(work)}
                          disabled={pending}
                          aria-pressed={work.is_published}
                          className="inline-flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                          title={work.is_published ? "تحويل إلى مسودة" : "نشر العمل"}
                        >
                          <StatusBadge published={work.is_published} />
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(work)} disabled={pending}>تعديل</Button>
                          <button
                            type="button"
                            onClick={() => removeWork(work)}
                            disabled={pending}
                            className="rounded-button px-3 py-2 text-xs font-bold text-alert-error hover:bg-alert-error/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alert-error"
                          >
                            حذف
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {formOpen && (
        <ModalShell
          id="work-form"
          title={editingId ? "تعديل العمل" : "إضافة عمل جديد"}
          description="الحقول المعلّمة بنجمة مطلوبة، ويمكن حفظ العمل كمسودة قبل نشره."
          onClose={closeForm}
          notice={<Notice notice={notice} />}
        >
          <form onSubmit={handleSubmit} aria-label={editingId ? "نموذج تعديل عمل" : "نموذج إضافة عمل"} className="contents">
            <Field id="work-artist" label="الفنان" help="العمل يظهر في صفحة هذا الفنان فقط.">
              <select
                id="work-artist"
                value={values.artist_id}
                onChange={(event) => setField("artist_id", event.target.value)}
                className="h-[48px] w-full rounded-input border border-brand-espresso-subtle bg-white px-4 text-sm text-gradscale-900 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
                required
              >
                {artists.map((artist) => (
                  <option key={artist.id} value={artist.id}>{artist.name}</option>
                ))}
              </select>
            </Field>
            <Field id="work-type" label="نوع العمل" help="يظهر كشارة صغيرة فوق صورة العمل.">
              <select
                id="work-type"
                value={values.work_type}
                onChange={(event) => setField("work_type", event.target.value as WorkFormValues["work_type"])}
                className="h-[48px] w-full rounded-input border border-brand-espresso-subtle bg-white px-4 text-sm text-gradscale-900 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
                required
              >
                {WORK_TYPE_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </Field>

            <BilingualField
              id="work-title"
              label="عنوان العمل"
              help="الاسم الذي يظهر تحت الفيديو في صفحة الفنان."
              value={values.title}
              onChange={(value) => setField("title", value)}
              valueEn={values.title_en}
              onChangeEn={(value) => setField("title_en", value)}
            />

            <div className="md:col-span-2">
              <Field
                id="work-youtube"
                label="رابط يوتيوب"
                help="الصق رابط العمل الموسيقي من يوتيوب. لن يتم تنزيل أو تخزين أي ملف؛ الموقع يشغّل الصوت مباشرة من يوتيوب."
              >
                <Input
                  id="work-youtube"
                  type="url"
                  dir="ltr"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={values.youtube_url}
                  onChange={(event) => setField("youtube_url", event.target.value)}
                  required
                />
              </Field>
              {linkTouched && !previewVideoId && (
                <p role="alert" className="mt-2 text-xs font-medium text-alert-error">
                  هذا ليس رابط يوتيوب صالحاً.
                </p>
              )}
              {previewVideoId && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-[72px] w-32 shrink-0 overflow-hidden rounded-lg bg-brand-surface">
                    <SafeImage
                      src={youTubeThumbnailUrl(previewVideoId)}
                      alt=""
                      fill
                      sizes="128px"
                    />
                  </div>
                  <p className="text-xs text-gradscale-400">
                    تم التعرف على مصدر الصوت. <span dir="ltr">{previewVideoId}</span>
                  </p>
                </div>
              )}
            </div>

            <BilingualField
              id="work-description"
              label="وصف مختصر"
              required={false}
              multiline
              rows={3}
              className="min-h-[112px]"
              value={values.description ?? ""}
              onChange={(value) => setField("description", value || null)}
              valueEn={values.description_en}
              onChangeEn={(value) => setField("description_en", value)}
            />

            <input type="hidden" name="thumbnail_image_url" value="" />
            <p className="text-xs leading-6 text-gradscale-400 md:col-span-2">
              لا تحتاج لإضافة صورة أو ملف صوتي. ستُستخدم صورة يوتيوب تلقائياً للمعاينة، وسيبقى المصدر رابط يوتيوب فقط.
            </p>
            <Field id="work-order" label="ترتيب الظهور" help="الأرقام الأصغر تظهر أولاً داخل قسم الأعمال.">
              <Input id="work-order" type="number" min="0" dir="ltr" value={values.display_order} onChange={(event) => setField("display_order", Number(event.target.value))} required />
            </Field>

            <div className="flex flex-wrap items-center gap-5 md:col-span-2">
              <label className="inline-flex items-center gap-2 text-sm font-bold text-brand-espresso">
                <input type="checkbox" checked={values.is_published} onChange={(event) => setField("is_published", event.target.checked)} className="h-4 w-4 accent-brand-primary" />
                نشر العمل فوراً
              </label>
            </div>
            <div className="flex items-center gap-3 md:col-span-2">
              <Button type="submit" isLoading={pending}>{editingId ? "حفظ التعديلات" : "حفظ العمل"}</Button>
              <Button type="button" variant="outline" onClick={closeForm} disabled={pending}>إلغاء</Button>
            </div>
          </form>
        </ModalShell>
      )}
    </div>
  );
}
