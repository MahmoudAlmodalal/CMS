"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createArtistAction,
  deleteArtistAction,
  setPublishStatusAction,
  updateArtistAction,
} from "@/actions/cms";
import { BilingualField, ModalShell, Notice, ModalActions } from "@/components/admin/ManagerKit";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { FormHelperText, FormLabel } from "@/components/ui/FormElements";
import { Input } from "@/components/ui/Input";
import { MediaPickerField } from "@/components/admin/media/MediaPickerField";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { ARTIST_CATEGORIES, getCategoryLabel, type Artist } from "@/lib/types/artists";
import type { ArtistInput } from "@/lib/validations/cms";
import { SafeImage } from "@/components/ui/SafeImage";

type ArtistFormValues = Omit<ArtistInput, "id">;
type StatusFilter = "all" | "published" | "draft";

interface ArtistsManagerProps {
  initialArtists: Artist[];
}

function emptyArtist(): ArtistFormValues {
  return {
    name: "",
    name_en: null,
    slug: "",
    category: "singing",
    genre_tag: "",
    genre_tag_en: null,
    city: "",
    city_en: null,
    quote: "",
    quote_en: null,
    spotlight_quote: "",
    spotlight_quote_en: null,
    short_bio: "",
    short_bio_en: null,
    full_bio: "",
    full_bio_en: null,
    specialties: "",
    specialties_en: null,
    portrait_image_url: "",
    is_featured: false,
    is_published: false,
    display_order: 0,
  };
}

function artistToForm(artist: Artist): ArtistFormValues {
  return {
    name: artist.name,
    name_en: artist.name_en ?? null,
    slug: artist.slug,
    category: artist.category as ArtistFormValues["category"],
    genre_tag: artist.genre_tag,
    genre_tag_en: artist.genre_tag_en ?? null,
    city: artist.city,
    city_en: artist.city_en ?? null,
    quote: artist.quote,
    quote_en: artist.quote_en ?? null,
    spotlight_quote: artist.spotlight_quote ?? "",
    spotlight_quote_en: artist.spotlight_quote_en ?? null,
    short_bio: artist.short_bio,
    short_bio_en: artist.short_bio_en ?? null,
    full_bio: artist.full_bio,
    full_bio_en: artist.full_bio_en ?? null,
    specialties: artist.specialties,
    specialties_en: artist.specialties_en ?? null,
    portrait_image_url: artist.portrait_image_url,
    is_featured: artist.is_featured,
    is_published: artist.is_published,
    display_order: artist.display_order,
  };
}

function Field({
  id,
  label,
  required = true,
  help,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2 text-start">
      <FormLabel htmlFor={id} required={required}>{label}</FormLabel>
      {children}
      {help && <FormHelperText>{help}</FormHelperText>}
    </div>
  );
}

function StatusBadge({ published }: { published: boolean }) {
  return (
    <Badge variant={published ? "active" : "surface"} size="sm">
      {published ? "منشور" : "مسودة"}
    </Badge>
  );
}

export function ArtistsManager({ initialArtists }: ArtistsManagerProps) {
  const router = useRouter();
  const [artists, setArtists] = useState(initialArtists);
  const [values, setValues] = useState<ArtistFormValues>(() => emptyArtist());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setArtists(initialArtists);
  }, [initialArtists]);

  const visibleArtists = artists.filter((artist) => {
    const matchesStatus = filter === "all" || (filter === "published" ? artist.is_published : !artist.is_published);
    const term = search.trim().toLocaleLowerCase();
    const matchesSearch = !term || `${artist.name} ${artist.slug} ${artist.city} ${artist.genre_tag}`.toLocaleLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  const openCreate = () => {
    setEditingId(null);
    setValues(emptyArtist());
    setNotice(null);
    setFormOpen(true);
  };

  const openEdit = (artist: Artist) => {
    setEditingId(artist.id);
    setValues(artistToForm(artist));
    setNotice(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (pending) return;
    setFormOpen(false);
    setEditingId(null);
  };

  const setField = <K extends keyof ArtistFormValues>(field: K, value: ArtistFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    setNotice(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    if (!values.portrait_image_url.trim()) {
      setNotice({ type: "error", text: "يرجى رفع الصورة الشخصية أو إدخال رابطها" });
      return;
    }

    const input: ArtistInput = { ...values };
    startTransition(async () => {
      try {
        const result = editingId
          ? await updateArtistAction(editingId, input)
          : await createArtistAction(input);

        if (!result.ok) {
          setNotice({ type: "error", text: result.error ?? "تعذر حفظ بيانات الفنان" });
          return;
        }

        if (editingId) {
          setArtists((current) => current.map((artist) => (
            artist.id === editingId ? { ...artist, ...input } : artist
          )));
        }
        setNotice({ type: "success", text: editingId ? "تم تحديث بيانات الفنان" : "تمت إضافة الفنان" });
        setFormOpen(false);
        setEditingId(null);
        setValues(emptyArtist());
        router.refresh();
      } catch {
        setNotice({ type: "error", text: "تعذر حفظ البيانات حالياً. يرجى المحاولة مرة أخرى." });
      }
    });
  };

  const togglePublish = (artist: Artist) => {
    if (pending) return;
    startTransition(async () => {
      try {
        const nextPublished = !artist.is_published;
        const result = await setPublishStatusAction("artists", artist.id, nextPublished);
        if (!result.ok) {
          setNotice({ type: "error", text: result.error ?? "تعذر تغيير حالة النشر" });
          return;
        }
        setArtists((current) => current.map((item) => item.id === artist.id ? { ...item, is_published: nextPublished } : item));
        setNotice({ type: "success", text: nextPublished ? "تم نشر الفنان" : "تم تحويل الفنان إلى مسودة" });
        router.refresh();
      } catch {
        setNotice({ type: "error", text: "تعذر تغيير حالة النشر حالياً." });
      }
    });
  };

  const toggleFeatured = (artist: Artist) => {
    if (pending) return;
    startTransition(async () => {
      try {
        const nextFeatured = !artist.is_featured;
        const result = await updateArtistAction(artist.id, { is_featured: nextFeatured });
        if (!result.ok) {
          setNotice({ type: "error", text: result.error ?? "تعذر تغيير حالة التمييز" });
          return;
        }
        setArtists((current) => current.map((item) => item.id === artist.id ? { ...item, is_featured: nextFeatured } : item));
        setNotice({ type: "success", text: nextFeatured ? "تم تمييز الفنان" : "تم إلغاء تمييز الفنان" });
        router.refresh();
      } catch {
        setNotice({ type: "error", text: "تعذر تغيير حالة التمييز حالياً." });
      }
    });
  };

  const removeArtist = (artist: Artist) => {
    if (pending || !window.confirm(`سيتم حذف «${artist.name}» نهائياً. هل تريد المتابعة؟`)) return;
    startTransition(async () => {
      try {
        const result = await deleteArtistAction(artist.id);
        if (!result.ok) {
          setNotice({ type: "error", text: result.error ?? "تعذر حذف الفنان" });
          return;
        }
        setArtists((current) => current.filter((item) => item.id !== artist.id));
        setNotice({ type: "success", text: "تم حذف الفنان" });
        router.refresh();
      } catch {
        setNotice({ type: "error", text: "تعذر حذف الفنان حالياً." });
      }
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-brand-primary">المحتوى الفني</p>
          <h1 className="mt-1 text-2xl font-bold font-sans text-brand-espresso">إدارة الفنانين</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gradscale-400">
            أدِر الملفات الفنية، ترتيب الظهور، وحالات النشر من مساحة واحدة.
          </p>
        </div>
        <Button type="button" onClick={openCreate} disabled={pending}>
          + إضافة فنان
        </Button>
      </div>

      {notice && (
        <div
          role={notice.type === "error" ? "alert" : "status"}
          className={notice.type === "error"
            ? "rounded-xl border border-alert-error/30 bg-alert-error/10 px-4 py-3 text-sm font-medium text-alert-error"
            : "rounded-xl border border-brand-primary/20 bg-brand-primary/10 px-4 py-3 text-sm font-medium text-brand-primary"}
        >
          {notice.text}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["إجمالي الفنانين", artists.length, "bg-white"],
          ["المنشورون", artists.filter((artist) => artist.is_published).length, "bg-brand-primary/10"],
          ["المميزون", artists.filter((artist) => artist.is_featured).length, "bg-brand-secondary/30"],
        ].map(([label, value, className]) => (
          <Card key={String(label)} className={String(className)}>
            <CardContent className="p-5">
              <p className="text-xs font-bold text-gradscale-400">{label}</p>
              <p className="mt-2 text-3xl font-bold text-brand-espresso">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle>قائمة الفنانين</CardTitle>
            <CardDescription>تظهر المسودات هنا ولا تظهر للزوار حتى يتم نشرها.</CardDescription>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="sr-only" htmlFor="artist-search">البحث في الفنانين</label>
            <Input
              id="artist-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ابحث بالاسم أو المدينة..."
              className="sm:w-56"
            />
            <label className="sr-only" htmlFor="artist-status-filter">تصفية حالة النشر</label>
            <select
              id="artist-status-filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value as StatusFilter)}
              className="h-[48px] rounded-input border border-brand-espresso-subtle bg-white px-3 text-sm text-gradscale-900 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
            >
              <option value="all">كل الحالات</option>
              <option value="published">المنشور فقط</option>
              <option value="draft">المسودات فقط</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {visibleArtists.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-lg font-bold text-brand-espresso">{artists.length === 0 ? "لا يوجد فنانون بعد" : "لا توجد نتائج مطابقة"}</p>
              <p className="mt-2 text-sm text-gradscale-400">
                {artists.length === 0 ? "ابدأ بإضافة أول ملف فني إلى الموقع." : "غيّر البحث أو مرشح الحالة لرؤية عناصر أخرى."}
              </p>
              {artists.length === 0 && <Button type="button" size="sm" className="mt-5" onClick={openCreate}>إضافة أول فنان</Button>}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الفنان</TableHead>
                  <TableHead>التصنيف / المدينة</TableHead>
                  <TableHead>الترتيب</TableHead>
                  <TableHead>النشر</TableHead>
                  <TableHead>الواجهة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleArtists.map((artist) => (
                  <TableRow key={artist.id}>
                    <TableCell>
                      <div className="flex min-w-[220px] items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-brand-surface">
                          {/* SafeImage, so a portrait whose object is missing from
                              storage shows the branded plate instead of the
                              browser's broken-image icon in the admin table. */}
                          <SafeImage
                            src={artist.portrait_image_url}
                            bucket="artists"
                            alt=""
                            fill
                            sizes="48px"
                            fallbackText={artist.name}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-bold text-brand-espresso">{artist.name}</p>
                          <p className="truncate text-xs text-gradscale-400" dir="ltr">/{artist.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-brand-espresso">{getCategoryLabel(artist.category)}</p>
                      <p className="mt-1 text-xs text-gradscale-400">{artist.city} · {artist.genre_tag}</p>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm" dir="ltr">{artist.display_order}</span>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => togglePublish(artist)}
                        disabled={pending}
                        aria-pressed={artist.is_published}
                        className="inline-flex min-h-[44px] items-center gap-2 px-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                        title={artist.is_published ? "تحويل إلى مسودة" : "نشر الفنان"}
                      >
                        <StatusBadge published={artist.is_published} />
                      </button>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => toggleFeatured(artist)}
                        disabled={pending}
                        aria-pressed={artist.is_featured}
                        className={artist.is_featured
                          ? "rounded-lg min-h-[44px] inline-flex items-center px-2.5 py-1 text-sm font-bold text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                          : "rounded-lg min-h-[44px] inline-flex items-center px-2.5 py-1 text-sm font-bold text-gradscale-400 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"}
                      >
                        {artist.is_featured ? "★ مميز" : "☆ تمييز"}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(artist)} disabled={pending} className="min-h-[44px]">تعديل</Button>
                        <button
                          type="button"
                          onClick={() => removeArtist(artist)}
                          disabled={pending}
                          className="rounded-button min-h-[44px] inline-flex items-center px-3 py-2 text-xs font-bold text-alert-error hover:bg-alert-error/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alert-error"
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
        <ModalShell
          id="artist-form"
          title={editingId ? "تعديل ملف الفنان" : "إضافة فنان جديد"}
          description="الحقول المعلّمة بنجمة مطلوبة، ويمكن حفظ الملف كمسودة قبل نشره."
          onClose={closeForm}
          notice={<Notice notice={notice} />}
        >
          <form onSubmit={handleSubmit} aria-label={editingId ? "نموذج تعديل فنان" : "نموذج إضافة فنان"} className="contents">
            <BilingualField
              id="artist-name"
              label="اسم الفنان"
              help="الاسم كما يظهر في بطاقة الفنان وعنوان صفحته."
              value={values.name}
              onChange={(value) => setField("name", value)}
              valueEn={values.name_en}
              onChangeEn={(value) => setField("name_en", value)}
            />
            <Field id="artist-slug" label="المعرّف المختصر" help="يُستخدم في رابط الصفحة ‎/artists/…‎ — أحرف لاتينية صغيرة وأرقام وشرطات فقط. تغييره بعد النشر يكسر الروابط القديمة.">
              <Input id="artist-slug" dir="ltr" value={values.slug} onChange={(event) => setField("slug", event.target.value)} required />
            </Field>
            <Field id="artist-category" label="التصنيف" help="يحدد ضمن أي مرشّح يظهر الفنان في صفحة «الفنانين».">
              <select
                id="artist-category"
                value={values.category}
                onChange={(event) => setField("category", event.target.value as ArtistFormValues["category"])}
                className="h-[48px] w-full rounded-input border border-brand-espresso-subtle bg-white px-4 text-sm text-gradscale-900 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
                required
              >
                {ARTIST_CATEGORIES.filter((category) => category.id !== "all").map((category) => (
                  <option key={category.id} value={category.id}>{category.label}</option>
                ))}
              </select>
            </Field>
            <BilingualField
              id="artist-genre"
              label="وسم النمط الموسيقي"
              help="كلمتان أو ثلاث تظهر فوق الاسم في البطاقة، مثل: طرب أصيل، موشحات أندلسية."
              value={values.genre_tag}
              onChange={(value) => setField("genre_tag", value)}
              valueEn={values.genre_tag_en}
              onChangeEn={(value) => setField("genre_tag_en", value)}
            />
            <BilingualField
              id="artist-city"
              label="المدينة"
              help="تظهر أسفل الاسم في البطاقة، مثل: بيروت — لبنان."
              value={values.city}
              onChange={(value) => setField("city", value)}
              valueEn={values.city_en}
              onChangeEn={(value) => setField("city_en", value)}
            />
            <Field id="artist-order" label="ترتيب الظهور" help="الأرقام الأصغر تظهر أولاً في صفحة «الفنانين».">
              <Input id="artist-order" type="number" min="0" dir="ltr" value={values.display_order} onChange={(event) => setField("display_order", Number(event.target.value))} required />
            </Field>
            <Field id="artist-portrait" label="الصورة الشخصية" help="الصورة الرسمية للفنان في بطاقته وصفحته. ارفعها أو اخترها من المكتبة أو الصق رابطاً مباشراً.">
              <MediaPickerField
                id="artist-portrait"
                value={values.portrait_image_url}
                onChange={(url) => setField("portrait_image_url", url)}
                bucket="artists"
                folder="portraits"
                required
                disabled={pending}
              />
            </Field>
            <BilingualField
              id="artist-specialties"
              label="التخصصات"
              help="قائمة مختصرة مفصولة بفواصل، تظهر في بطاقة التعريف داخل صفحة الفنان."
              value={values.specialties}
              onChange={(value) => setField("specialties", value)}
              valueEn={values.specialties_en}
              onChangeEn={(value) => setField("specialties_en", value)}
            />
            {/* Two quote fields, deliberately named apart: their old labels
                («الاقتباس الفني» / «اقتباس الواجهة») read as the same field twice. */}
            <BilingualField
              id="artist-quote"
              label="اقتباس تحت الاسم"
              help="جملة على لسان الفنان، تظهر تحت اسمه مباشرةً في أعلى صفحته."
              multiline
              rows={3}
              className="min-h-[112px]"
              value={values.quote}
              onChange={(value) => setField("quote", value)}
              valueEn={values.quote_en}
              onChangeEn={(value) => setField("quote_en", value)}
            />
            <BilingualField
              id="artist-spotlight-quote"
              label="اقتباس بطاقة الواجهة"
              required={false}
              help="اختياري. الاقتباس الكبير في منتصف الصفحة. إن تُرك فارغاً يُعاد استخدام «اقتباس تحت الاسم»."
              multiline
              rows={3}
              className="min-h-[112px]"
              value={values.spotlight_quote ?? ""}
              onChange={(value) => setField("spotlight_quote", value)}
              valueEn={values.spotlight_quote_en}
              onChangeEn={(value) => setField("spotlight_quote_en", value)}
            />
            <BilingualField
              id="artist-short-bio"
              label="نبذة مختصرة"
              help="سطران إلى ثلاثة. تُستخدم أيضاً في وصف الصفحة لمحركات البحث ومعاينات المشاركة."
              multiline
              rows={4}
              value={values.short_bio}
              onChange={(value) => setField("short_bio", value)}
              valueEn={values.short_bio_en}
              onChangeEn={(value) => setField("short_bio_en", value)}
            />
            <BilingualField
              id="artist-full-bio"
              label="السيرة الذاتية الكاملة"
              help="النص الكامل الذي يظهر في بطاقة التعريف داخل صفحة الفنان."
              multiline
              rows={7}
              value={values.full_bio}
              onChange={(value) => setField("full_bio", value)}
              valueEn={values.full_bio_en}
              onChangeEn={(value) => setField("full_bio_en", value)}
            />
            <div className="flex flex-wrap items-center gap-5 md:col-span-2">
              <label className="inline-flex items-center gap-2 text-sm font-bold text-brand-espresso">
                <input type="checkbox" checked={values.is_published} onChange={(event) => setField("is_published", event.target.checked)} className="h-4 w-4 accent-brand-primary" />
                نشر الفنان فوراً
              </label>
              <label className="inline-flex items-center gap-2 text-sm font-bold text-brand-espresso">
                <input type="checkbox" checked={values.is_featured} onChange={(event) => setField("is_featured", event.target.checked)} className="h-4 w-4 accent-brand-primary" />
                عرض ضمن الفنانين المميزين
              </label>
            </div>
            <ModalActions>
              <Button type="submit" isLoading={pending} className="min-h-[44px]">{editingId ? "حفظ التعديلات" : "حفظ الفنان"}</Button>
              <Button type="button" variant="outline" onClick={closeForm} disabled={pending} className="min-h-[44px]">إلغاء</Button>
            </ModalActions>
          </form>
        </ModalShell>
      )}
    </div>
  );
}
