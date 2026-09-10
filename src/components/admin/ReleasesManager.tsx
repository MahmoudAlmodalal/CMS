"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createReleaseAction,
  deleteReleaseAction,
  setPublishStatusAction,
  updateReleaseAction,
} from "@/actions/cms";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Field, Notice, StatusBadge } from "@/components/admin/ManagerKit";
import type { AdminRelease, ArtistOption } from "@/lib/types/admin-tracks";
import type { ReleaseInput } from "@/lib/validations";

type ReleaseFormValues = Omit<ReleaseInput, "id">;

interface ReleasesManagerProps {
  initialReleases: AdminRelease[];
  artists: ArtistOption[];
}

const RELEASE_TYPE_LABELS: Record<ReleaseFormValues["release_type"], string> = {
  studio: "استوديو",
  live: "حفلة حية",
};

function emptyRelease(defaultArtistId: string): ReleaseFormValues {
  return {
    artist_id: defaultArtistId,
    title: "",
    release_type: "studio",
    track_count: 1,
    release_year: new Date().getFullYear(),
    cover_image_url: "",
    display_order: 0,
    is_published: false,
  };
}

function releaseToForm(release: AdminRelease): ReleaseFormValues {
  return {
    artist_id: release.artist_id,
    title: release.title,
    release_type: release.release_type as ReleaseFormValues["release_type"],
    track_count: release.track_count,
    release_year: release.release_year,
    cover_image_url: release.cover_image_url,
    display_order: release.display_order,
    is_published: release.is_published,
  };
}

export function ReleasesManager({ initialReleases, artists }: ReleasesManagerProps) {
  const router = useRouter();
  const [releases, setReleases] = useState(initialReleases);
  const [values, setValues] = useState<ReleaseFormValues>(() => emptyRelease(artists[0]?.id ?? ""));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setReleases(initialReleases);
  }, [initialReleases]);

  const openCreate = () => {
    setEditingId(null);
    setValues(emptyRelease(artists[0]?.id ?? ""));
    setNotice(null);
    setFormOpen(true);
  };

  const openEdit = (release: AdminRelease) => {
    setEditingId(release.id);
    setValues(releaseToForm(release));
    setNotice(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (pending) return;
    setFormOpen(false);
    setEditingId(null);
  };

  const setField = <K extends keyof ReleaseFormValues>(field: K, value: ReleaseFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    setNotice(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    const input: ReleaseInput = { ...values };
    startTransition(async () => {
      try {
        const result = editingId
          ? await updateReleaseAction(editingId, input)
          : await createReleaseAction(input);

        if (!result.ok) {
          setNotice({ type: "error", text: result.error ?? "تعذر حفظ بيانات الإصدار" });
          return;
        }

        if (editingId) {
          setReleases((current) => current.map((release) => (
            release.id === editingId ? { ...release, ...input } : release
          )));
        }
        setNotice({ type: "success", text: editingId ? "تم تحديث الإصدار" : "تمت إضافة الإصدار" });
        setFormOpen(false);
        setEditingId(null);
        setValues(emptyRelease(artists[0]?.id ?? ""));
        router.refresh();
      } catch {
        setNotice({ type: "error", text: "تعذر حفظ البيانات حالياً. يرجى المحاولة مرة أخرى." });
      }
    });
  };

  const togglePublish = (release: AdminRelease) => {
    if (pending) return;
    startTransition(async () => {
      try {
        const nextPublished = !release.is_published;
        const result = await setPublishStatusAction("releases", release.id, nextPublished);
        if (!result.ok) {
          setNotice({ type: "error", text: result.error ?? "تعذر تغيير حالة النشر" });
          return;
        }
        setReleases((current) => current.map((item) => item.id === release.id ? { ...item, is_published: nextPublished } : item));
        setNotice({ type: "success", text: nextPublished ? "تم نشر الإصدار" : "تم تحويل الإصدار إلى مسودة" });
        router.refresh();
      } catch {
        setNotice({ type: "error", text: "تعذر تغيير حالة النشر حالياً." });
      }
    });
  };

  const removeRelease = (release: AdminRelease) => {
    if (pending || !window.confirm(`سيتم حذف «${release.title}» نهائياً. هل تريد المتابعة؟`)) return;
    startTransition(async () => {
      try {
        const result = await deleteReleaseAction(release.id);
        if (!result.ok) {
          setNotice({ type: "error", text: result.error ?? "تعذر حذف الإصدار" });
          return;
        }
        setReleases((current) => current.filter((item) => item.id !== release.id));
        setNotice({ type: "success", text: "تم حذف الإصدار" });
        router.refresh();
      } catch {
        setNotice({ type: "error", text: "تعذر حذف الإصدار حالياً." });
      }
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-brand-primary">المحتوى الفني</p>
          <h1 className="mt-1 text-2xl font-bold font-sans text-brand-espresso">إدارة الإصدارات والألبومات</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gradscale-400">
            أدِر إصدارات الفنانين، سنة الإصدار، عدد المقطوعات، وحالات النشر.
          </p>
        </div>
        <Button type="button" onClick={openCreate} disabled={pending || artists.length === 0}>
          + إضافة إصدار
        </Button>
      </div>

      <Notice notice={notice} />

      {artists.length === 0 && (
        <Notice notice={{ type: "error", text: "لا يوجد فنانون منشورون حالياً. يجب نشر فنان واحد على الأقل قبل إضافة إصدارات." }} />
      )}

      <Card>
        <CardHeader>
          <CardTitle>قائمة الإصدارات</CardTitle>
          <CardDescription>تظهر المسودات هنا ولا تظهر للزوار حتى يتم نشرها.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {releases.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-lg font-bold text-brand-espresso">لا توجد إصدارات بعد</p>
              <p className="mt-2 text-sm text-gradscale-400">ابدأ بإضافة أول إصدار إلى الموقع.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>العنوان</TableHead>
                  <TableHead>الفنان</TableHead>
                  <TableHead>النوع / السنة</TableHead>
                  <TableHead>عدد المقطوعات</TableHead>
                  <TableHead>الترتيب</TableHead>
                  <TableHead>النشر</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {releases.map((release) => (
                  <TableRow key={release.id}>
                    <TableCell>
                      <p className="truncate font-bold text-brand-espresso">{release.title}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gradscale-400">{release.artist_name ?? "—"}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-brand-espresso">{RELEASE_TYPE_LABELS[release.release_type as ReleaseFormValues["release_type"]]}</p>
                      <p className="mt-1 text-xs text-gradscale-400" dir="ltr">{release.release_year}</p>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm" dir="ltr">{release.track_count}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm" dir="ltr">{release.display_order}</span>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => togglePublish(release)}
                        disabled={pending}
                        aria-pressed={release.is_published}
                        className="inline-flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                        title={release.is_published ? "تحويل إلى مسودة" : "نشر الإصدار"}
                      >
                        <StatusBadge published={release.is_published} />
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(release)} disabled={pending}>تعديل</Button>
                        <button
                          type="button"
                          onClick={() => removeRelease(release)}
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
        <Card variant="primary-border" id="release-form">
          <CardHeader>
            <CardTitle>{editingId ? "تعديل الإصدار" : "إضافة إصدار جديد"}</CardTitle>
            <CardDescription>الحقول المعلّمة بنجمة مطلوبة، ويمكن حفظ الإصدار كمسودة قبل نشره.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit} aria-label={editingId ? "نموذج تعديل إصدار" : "نموذج إضافة إصدار"}>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <Field id="release-artist" label="الفنان">
                <select
                  id="release-artist"
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
              <Field id="release-title" label="عنوان الإصدار">
                <Input id="release-title" value={values.title} onChange={(event) => setField("title", event.target.value)} required />
              </Field>
              <Field id="release-type" label="نوع الإصدار">
                <select
                  id="release-type"
                  value={values.release_type}
                  onChange={(event) => setField("release_type", event.target.value as ReleaseFormValues["release_type"])}
                  className="h-[48px] w-full rounded-input border border-brand-espresso-subtle bg-white px-4 text-sm text-gradscale-900 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
                  required
                >
                  {Object.entries(RELEASE_TYPE_LABELS).map(([id, label]) => (
                    <option key={id} value={id}>{label}</option>
                  ))}
                </select>
              </Field>
              <Field id="release-track-count" label="عدد المقطوعات">
                <Input id="release-track-count" type="number" min="1" dir="ltr" value={values.track_count} onChange={(event) => setField("track_count", Number(event.target.value))} required />
              </Field>
              <Field id="release-year" label="سنة الإصدار">
                <Input id="release-year" type="number" min="1900" max="2100" dir="ltr" value={values.release_year} onChange={(event) => setField("release_year", Number(event.target.value))} required />
              </Field>
              <Field id="release-cover" label="رابط صورة الغلاف">
                <Input id="release-cover" type="url" dir="ltr" value={values.cover_image_url} onChange={(event) => setField("cover_image_url", event.target.value)} required />
              </Field>
              <Field id="release-order" label="ترتيب الظهور" help="الأرقام الأصغر تظهر أولاً.">
                <Input id="release-order" type="number" min="0" dir="ltr" value={values.display_order} onChange={(event) => setField("display_order", Number(event.target.value))} required />
              </Field>
              <div className="flex flex-wrap items-center gap-5 md:col-span-2">
                <label className="inline-flex items-center gap-2 text-sm font-bold text-brand-espresso">
                  <input type="checkbox" checked={values.is_published} onChange={(event) => setField("is_published", event.target.checked)} className="h-4 w-4 accent-brand-primary" />
                  نشر الإصدار فوراً
                </label>
              </div>
            </CardContent>
            <CardFooter className="justify-start">
              <Button type="submit" isLoading={pending}>{editingId ? "حفظ التعديلات" : "حفظ الإصدار"}</Button>
              <Button type="button" variant="outline" onClick={closeForm} disabled={pending}>إلغاء</Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
}
