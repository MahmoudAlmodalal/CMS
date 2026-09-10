"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createArticleAction,
  deleteArticleAction,
  setPublishStatusAction,
  updateArticleAction,
} from "@/actions/cms";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Textarea } from "@/components/ui/Textarea";
import { Field, ModalShell, Notice } from "@/components/admin/ManagerKit";
import { ARTICLE_CATEGORIES, type ArticleCategory } from "@/lib/validations/primitives";
import type { ArticleInput } from "@/lib/validations/cms";
import type { AdminArticle } from "@/lib/dal/admin-articles";
import { isArticleLive, isArticleScheduled } from "@/lib/article-status";

const CATEGORY_LABELS: Record<ArticleCategory, string> = {
  culture: "الأخبار الثقافية",
  artists: "قصص الفنانين",
  academy: "الأكاديمية",
  events: "الفعاليات",
};

type ArticleFormValues = Omit<ArticleInput, "id">;
type StatusFilter = "all" | "published" | "scheduled" | "draft";

interface ArticlesManagerProps {
  initialArticles: AdminArticle[];
}

function emptyArticle(): ArticleFormValues {
  return {
    title: "",
    slug: "",
    category: "culture",
    excerpt: "",
    content: "",
    cover_image_url: "",
    author_name: "",
    featured_artist_id: null,
    published_at: new Date().toISOString(),
    is_featured: false,
    is_published: false,
  };
}

function articleToForm(article: AdminArticle): ArticleFormValues {
  return {
    title: article.title,
    slug: article.slug,
    category: article.category,
    excerpt: article.excerpt,
    content: article.content,
    cover_image_url: article.cover_image_url,
    author_name: article.author_name,
    featured_artist_id: article.featured_artist_id,
    published_at: article.published_at,
    is_featured: article.is_featured,
    is_published: article.is_published,
  };
}

function ArticleStatusBadge({ article }: { article: Pick<AdminArticle, "is_published" | "published_at"> }) {
  if (isArticleLive(article)) return <Badge variant="active" size="sm">منشور</Badge>;
  if (isArticleScheduled(article)) return <Badge variant="outline" size="sm">مجدول</Badge>;
  return <Badge variant="surface" size="sm">مسودة</Badge>;
}

export function ArticlesManager({ initialArticles }: ArticlesManagerProps) {
  const router = useRouter();
  const [articles, setArticles] = useState(initialArticles);
  const [values, setValues] = useState<ArticleFormValues>(() => emptyArticle());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setArticles(initialArticles);
  }, [initialArticles]);

  const visibleArticles = articles.filter((article) => {
    const live = isArticleLive(article);
    const scheduled = isArticleScheduled(article);
    const matchesStatus =
      filter === "all" ||
      (filter === "published" ? live : filter === "scheduled" ? scheduled : !article.is_published);
    const term = search.trim().toLocaleLowerCase();
    const matchesSearch = !term || `${article.title} ${article.slug} ${article.author_name}`.toLocaleLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  const openCreate = () => {
    setEditingId(null);
    setValues(emptyArticle());
    setNotice(null);
    setFormOpen(true);
  };

  const openEdit = (article: AdminArticle) => {
    setEditingId(article.id);
    setValues(articleToForm(article));
    setNotice(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (pending) return;
    setFormOpen(false);
    setEditingId(null);
  };

  const setField = <K extends keyof ArticleFormValues>(field: K, value: ArticleFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    setNotice(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    const input: ArticleInput = { ...values };
    startTransition(async () => {
      try {
        const result = editingId
          ? await updateArticleAction(editingId, input)
          : await createArticleAction(input);

        if (!result.ok) {
          setNotice({ type: "error", text: result.error ?? "تعذر حفظ بيانات المقال" });
          return;
        }

        if (editingId) {
          setArticles((current) => current.map((article) => (
            article.id === editingId ? { ...article, ...input } : article
          )));
        }
        setNotice({ type: "success", text: editingId ? "تم تحديث المقال" : "تمت إضافة المقال" });
        setFormOpen(false);
        setEditingId(null);
        setValues(emptyArticle());
        router.refresh();
      } catch {
        setNotice({ type: "error", text: "تعذر حفظ البيانات حالياً. يرجى المحاولة مرة أخرى." });
      }
    });
  };

  const togglePublish = (article: AdminArticle) => {
    if (pending) return;
    startTransition(async () => {
      try {
        const nextPublished = !article.is_published;
        const result = await setPublishStatusAction("articles", article.id, nextPublished);
        if (!result.ok) {
          setNotice({ type: "error", text: result.error ?? "تعذر تغيير حالة النشر" });
          return;
        }
        setArticles((current) => current.map((item) => item.id === article.id ? { ...item, is_published: nextPublished } : item));
        setNotice({ type: "success", text: nextPublished ? "تم نشر المقال" : "تم تحويل المقال إلى مسودة" });
        router.refresh();
      } catch {
        setNotice({ type: "error", text: "تعذر تغيير حالة النشر حالياً." });
      }
    });
  };

  const removeArticle = (article: AdminArticle) => {
    if (pending || !window.confirm(`سيتم حذف «${article.title}» نهائياً. هل تريد المتابعة؟`)) return;
    startTransition(async () => {
      try {
        const result = await deleteArticleAction(article.id);
        if (!result.ok) {
          setNotice({ type: "error", text: result.error ?? "تعذر حذف المقال" });
          return;
        }
        setArticles((current) => current.filter((item) => item.id !== article.id));
        setNotice({ type: "success", text: "تم حذف المقال" });
        router.refresh();
      } catch {
        setNotice({ type: "error", text: "تعذر حذف المقال حالياً." });
      }
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-brand-primary">المحتوى التحريري</p>
          <h1 className="mt-1 text-2xl font-bold font-sans text-brand-espresso">إدارة الأخبار والمقالات</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gradscale-400">
            أدِر المقالات، جدولة النشر، وحالات الظهور من مساحة واحدة.
          </p>
        </div>
        <Button type="button" onClick={openCreate} disabled={pending}>
          + إضافة مقال
        </Button>
      </div>

      <Notice notice={notice} />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["إجمالي المقالات", articles.length, "bg-white"],
          ["المنشورة", articles.filter((article) => isArticleLive(article)).length, "bg-brand-primary/10"],
          ["المجدولة", articles.filter((article) => isArticleScheduled(article)).length, "bg-brand-secondary/30"],
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
            <CardTitle>قائمة المقالات</CardTitle>
            <CardDescription>مقال بجدول نشر مستقبلي يبقى «مجدولاً» حتى يحين موعده تلقائياً.</CardDescription>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="sr-only" htmlFor="article-search">البحث في المقالات</label>
            <Input
              id="article-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ابحث بالعنوان أو الكاتب..."
              className="sm:w-56"
            />
            <label className="sr-only" htmlFor="article-status-filter">تصفية حالة النشر</label>
            <select
              id="article-status-filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value as StatusFilter)}
              className="h-[48px] rounded-input border border-brand-espresso-subtle bg-white px-3 text-sm text-gradscale-900 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
            >
              <option value="all">كل الحالات</option>
              <option value="published">المنشور فقط</option>
              <option value="scheduled">المجدول فقط</option>
              <option value="draft">المسودات فقط</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {visibleArticles.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-lg font-bold text-brand-espresso">{articles.length === 0 ? "لا توجد مقالات بعد" : "لا توجد نتائج مطابقة"}</p>
              <p className="mt-2 text-sm text-gradscale-400">
                {articles.length === 0 ? "ابدأ بإضافة أول مقال إلى الموقع." : "غيّر البحث أو مرشح الحالة لرؤية عناصر أخرى."}
              </p>
              {articles.length === 0 && <Button type="button" size="sm" className="mt-5" onClick={openCreate}>إضافة أول مقال</Button>}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المقال</TableHead>
                  <TableHead>التصنيف / الكاتب</TableHead>
                  <TableHead>موعد النشر</TableHead>
                  <TableHead>النشر</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>
                      <div className="flex min-w-[220px] items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-brand-surface">
                          {/* eslint-disable-next-line @next/next/no-img-element -- media refs may use any approved public host. */}
                          <img src={article.cover_image_url} alt="" className="h-full w-full object-cover" loading="lazy" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-bold text-brand-espresso">{article.title}</p>
                          <p className="truncate text-xs text-gradscale-400" dir="ltr">/{article.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-brand-espresso">{CATEGORY_LABELS[article.category]}</p>
                      <p className="mt-1 text-xs text-gradscale-400">{article.author_name}</p>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs" dir="ltr">{new Date(article.published_at).toLocaleString("ar-EG")}</span>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => togglePublish(article)}
                        disabled={pending}
                        aria-pressed={article.is_published}
                        className="inline-flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                        title={article.is_published ? "تحويل إلى مسودة" : "نشر المقال"}
                      >
                        <ArticleStatusBadge article={article} />
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(article)} disabled={pending}>تعديل</Button>
                        <button
                          type="button"
                          onClick={() => removeArticle(article)}
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
        <ModalShell
          id="article-form"
          title={editingId ? "تعديل المقال" : "إضافة مقال جديد"}
          description="الحقول المعلّمة بنجمة مطلوبة. المقال بموعد نشر مستقبلي يظهر كمجدول حتى يحين موعده."
        >
          <form onSubmit={handleSubmit} aria-label={editingId ? "نموذج تعديل مقال" : "نموذج إضافة مقال"} className="contents">
            <Field id="article-title" label="عنوان المقال">
              <Input id="article-title" value={values.title} onChange={(event) => setField("title", event.target.value)} required />
            </Field>
            <Field id="article-slug" label="المعرّف المختصر" help="أحرف لاتينية صغيرة وأرقام وشرطات فقط.">
              <Input id="article-slug" dir="ltr" value={values.slug} onChange={(event) => setField("slug", event.target.value)} required />
            </Field>
            <Field id="article-category" label="التصنيف">
              <select
                id="article-category"
                value={values.category}
                onChange={(event) => setField("category", event.target.value as ArticleCategory)}
                className="h-[48px] w-full rounded-input border border-brand-espresso-subtle bg-white px-4 text-sm text-gradscale-900 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
                required
              >
                {ARTICLE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>{CATEGORY_LABELS[category]}</option>
                ))}
              </select>
            </Field>
            <Field id="article-author" label="اسم الكاتب أو هيئة التحرير">
              <Input id="article-author" value={values.author_name} onChange={(event) => setField("author_name", event.target.value)} required />
            </Field>
            <Field id="article-cover" label="رابط صورة الغلاف">
              <Input id="article-cover" type="url" dir="ltr" value={values.cover_image_url} onChange={(event) => setField("cover_image_url", event.target.value)} required />
            </Field>
            <Field id="article-published-at" label="موعد النشر" help="يمكن اختيار موعد مستقبلي لجدولة المقال.">
              <Input
                id="article-published-at"
                type="datetime-local"
                dir="ltr"
                value={values.published_at ? values.published_at.slice(0, 16) : ""}
                onChange={(event) => setField("published_at", event.target.value ? new Date(event.target.value).toISOString() : "")}
                required
              />
            </Field>
            <Field id="article-excerpt" label="المقتطف الصحفي">
              <Textarea id="article-excerpt" rows={3} value={values.excerpt} onChange={(event) => setField("excerpt", event.target.value)} required />
            </Field>
            <Field id="article-content" label="محتوى المقال الكامل">
              <Textarea id="article-content" rows={8} value={values.content} onChange={(event) => setField("content", event.target.value)} required />
            </Field>
            <div className="flex flex-wrap items-center gap-5 md:col-span-2">
              <label className="inline-flex items-center gap-2 text-sm font-bold text-brand-espresso">
                <input type="checkbox" checked={values.is_published} onChange={(event) => setField("is_published", event.target.checked)} className="h-4 w-4 accent-brand-primary" />
                نشر المقال (فوراً أو حسب موعد النشر)
              </label>
              <label className="inline-flex items-center gap-2 text-sm font-bold text-brand-espresso">
                <input type="checkbox" checked={values.is_featured} onChange={(event) => setField("is_featured", event.target.checked)} className="h-4 w-4 accent-brand-primary" />
                عرض ضمن المقالات المميزة
              </label>
            </div>
            <div className="flex items-center gap-3 md:col-span-2">
              <Button type="submit" isLoading={pending}>{editingId ? "حفظ التعديلات" : "حفظ المقال"}</Button>
              <Button type="button" variant="outline" onClick={closeForm} disabled={pending}>إلغاء</Button>
            </div>
          </form>
        </ModalShell>
      )}
    </div>
  );
}
