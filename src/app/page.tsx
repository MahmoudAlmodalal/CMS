"use client";

import React, { useState } from "react";
import { Navigation, Breadcrumbs } from "@/components/ui/Navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardBadge } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { FormField, Label, Input, Select, Textarea, Checkbox, Radio, PhoneInput, UrlInput, FormHelperText } from "@/components/ui/Form";
import { Drawer } from "@/components/ui/Drawer";
import {
  Bdi,
  LocalizedNumber,
  LocalizedPrice,
  LocalizedDate,
  PhoneNumber,
  UrlDisplay,
  MixedText,
} from "@/components/ui/Bidi";
import {
  ArrowStartIcon,
  ArrowEndIcon,
  ChevronStartIcon,
  ChevronEndIcon,
  UndoIcon,
  RedoIcon,
  SearchIcon,
  PhoneIcon,
  MailIcon,
  CalendarIcon,
  ClockIcon,
  PlayIcon,
  MusicIcon,
  CheckIcon,
  GlobeIcon,
} from "@/components/ui/Icons";
import { useDirection } from "@/lib/direction";

export default function FoundationPage() {
  const { direction, isRTL, toggleDirection } = useDirection();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [numVariant, setNumVariant] = useState<"western" | "eastern">("eastern");

  // Form state
  const [formData, setFormData] = useState({
    name: "طارق بن زياد الأندلسي",
    phone: "50 876 5432",
    email: "tariq@andalusia-music.org",
    url: "https://andalusia-band.com/tracks/nawba-hijaz",
    category: "singing",
    notes: "نود حجز ليلة طرب أندلسية مع موشحات زرياب ومقام الحجاز",
    subscribe: true,
    eventType: "public",
  });

  const sampleDate = "2026-09-10T12:00:00Z";

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream text-brand-espresso">
      {/* 1. Master RTL Navigation */}
      <Navigation />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "فرقة أندلسيا", href: "#" },
            { label: "البنية التأسيسية", href: "#" },
            { label: "نظام الاتجاه RTL الأول والتوافقية اللغوية" },
          ]}
        />

        {/* Hero Section / Architecture Banner */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 border border-brand-surface shadow-xs text-start relative overflow-hidden">
          <div className="max-w-3xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-tint text-brand-primary text-xs font-bold">
              <span>المهمة ٢٣: الأساس التوجيهي العربي أولاً (RTL Foundation)</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold font-calligraphic text-brand-espresso leading-tight">
              الأساس البرمجي لفرقة أندلسيا الموسيقية
            </h1>

            <p className="text-base sm:text-lg text-brand-espresso/80 leading-relaxed">
              تطبيق بنية تحتية برمجية تعتمد كلياً على الخصائص المنطقية (<code className="font-mono text-xs bg-brand-surface/60 px-1.5 py-0.5 rounded">Logical CSS</code>)
              وعزل النصوص ثنائية الاتجاه (<code className="font-mono text-xs bg-brand-surface/60 px-1.5 py-0.5 rounded">Bidi Isolation</code>).
              صُمم النظام ليكون عربياً أولاً بطبيعته دون استخدام أي حيل عكس عشوائية، ومُهيّأ تماماً لتبديل الواجهة مستقبلاً للإنجليزية دون إعادة كتابة المكونات.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={toggleDirection}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-espresso text-brand-cream font-bold hover:bg-brand-espresso/90 transition-all cursor-pointer shadow-xs"
              >
                <GlobeIcon size={18} className="text-brand-gold" />
                <span>
                  {isRTL ? "اختبر مرونة المعمارية بالتبديل إلى LTR" : "العودة إلى النمط العربي الأساسي RTL"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-brand-primary text-brand-primary font-bold hover:bg-brand-tint transition-all cursor-pointer"
              >
                <span>اختبار القائمة الجانبية (Drawer)</span>
                <ChevronEndIcon size={18} />
              </button>
            </div>
          </div>

          <div className="absolute top-0 end-0 -mt-10 -me-10 w-80 h-80 bg-brand-tint/50 rounded-full blur-3xl pointer-events-none" />
        </section>

        {/* 2. Mandatory Test Suite Section */}
        <section id="test-cases" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-surface pb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-calligraphic text-brand-espresso">
                اختبارات التوافق التوجيهي واللغوي المعتمدة
              </h2>
              <p className="text-sm text-brand-espresso/70 mt-1">
                التحقق الحصري من: الحروف العربية، الأرقام، التواريخ، النصوص المختلطة، الروابط، وأرقام الهواتف.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 p-1.5 bg-white border border-brand-surface rounded-xl">
              <span className="text-xs font-semibold px-2 text-brand-espresso/70">نمط الأرقام:</span>
              <button
                type="button"
                onClick={() => setNumVariant("eastern")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  numVariant === "eastern"
                    ? "bg-brand-primary text-white"
                    : "text-brand-espresso hover:bg-brand-surface/50"
                }`}
              >
                مشرقية (٠-٩)
              </button>
              <button
                type="button"
                onClick={() => setNumVariant("western")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  numVariant === "western"
                    ? "bg-brand-primary text-white"
                    : "text-brand-espresso hover:bg-brand-surface/50"
                }`}
              >
                مغربية/غربية (0-9)
              </button>
            </div>
          </div>

          {/* Grid of 6 Specific Verification Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Test 1: Arabic Characters & Typography */}
            <Card variant="default">
              <CardBadge position="end">اختبار ١</CardBadge>
              <CardHeader>
                <CardTitle>الحروف والخطوط العربية</CardTitle>
                <CardDescription>التحقق من تشبيك الحروف، التشكيل، وعناوين الرقعة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="font-calligraphic text-xl text-brand-primary">
                  «جَادَكَ الغَيْثُ إِذَا الغَيْثُ هَمَى يَا زَمَانَ الوَصْلِ بِالأَنْدَلُسِ»
                </p>
                <p className="text-sm leading-relaxed text-brand-espresso/90">
                  تعتمد المنصة خط <strong>Cairo</strong> للنصوص اليومية وخط <strong>Aref Ruqaa</strong> للمقطوعات والعناوين التراثية بدون تشوه في الروابط الحرفية (مثل: لا، لإ، لأ، لآ).
                </p>
                <div className="p-3 bg-brand-surface/30 rounded-xl text-xs font-mono">
                  نموذج الحروف المركبة: لا - لأ - لإ - لآ - لله - محمد
                </div>
              </CardContent>
            </Card>

            {/* Test 2: Numbers */}
            <Card variant="default">
              <CardBadge position="end">اختبار ٢</CardBadge>
              <CardHeader>
                <CardTitle>الأرقام والمقادير الحسابية</CardTitle>
                <CardDescription>تنسيق الأرقام، المحاذاة العمودية، وثبات الأسعار</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-brand-surface/30 rounded-xl">
                  <span className="text-sm">سعر التذكرة الماسية:</span>
                  <LocalizedPrice amount={250} variant={numVariant} />
                </div>
                <div className="flex items-center justify-between p-3 bg-brand-surface/30 rounded-xl">
                  <span className="text-sm">إجمالي الحضور المؤكد:</span>
                  <span className="text-base font-bold text-brand-primary">
                    <LocalizedNumber value={1420} variant={numVariant} /> زائر
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-brand-surface/30 rounded-xl">
                  <span className="text-sm">نسبة إشغال المسرح:</span>
                  <span className="font-mono font-bold">
                    <LocalizedNumber value={98.5} variant={numVariant} />%
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Test 3: Dates */}
            <Card variant="default">
              <CardBadge position="end">اختبار ٣</CardBadge>
              <CardHeader>
                <CardTitle>التواريخ الهجرية والميلادية</CardTitle>
                <CardDescription>منع انقلاب الترتيب الزمني (يوم/شهر/سنة)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-brand-espresso/70">التاريخ الميلادي بالعربية:</span>
                  <div className="p-2.5 bg-brand-surface/30 rounded-xl text-sm font-bold text-brand-primary">
                    <LocalizedDate date={sampleDate} calendar="gregorian" format="long" />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-brand-espresso/70">التاريخ الهجري المعتمد:</span>
                  <div className="p-2.5 bg-brand-surface/30 rounded-xl text-sm font-bold text-brand-espresso">
                    <LocalizedDate date={sampleDate} calendar="hijri" format="long" />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-brand-espresso/70">صيغة رقمية آمنة (Bidi-safe):</span>
                  <div className="p-2.5 bg-brand-surface/30 rounded-xl text-sm font-mono">
                    <LocalizedDate date={sampleDate} format="numeric" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test 4: Mixed Arabic/English */}
            <Card variant="default">
              <CardBadge position="end">اختبار ٤</CardBadge>
              <CardHeader>
                <CardTitle>النصوص المختلطة (عربي / إنجليزي)</CardTitle>
                <CardDescription>عزل النصوص لمنع قفز علامات الترقيم والأقواس</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-brand-surface/30 rounded-xl text-sm leading-relaxed">
                  <MixedText
                    arabicLead="أقامت فرقة"
                    latinPhrase="Andalusia Ensemble"
                    arabicTrail="حفلاً موسيقياً في قصر الحمراء عام (2026)."
                  />
                </div>
                <p className="text-xs text-brand-espresso/70 leading-relaxed">
                  تم عزل العبارة اللاتينية بواسطة وسام <code className="font-mono text-brand-primary">&lt;bdi dir=&quot;ltr&quot;&gt;</code> حتى لا تقفز الأقواس <bdi dir="ltr">(2026)</bdi> أو النقطة الختامية إلى بداية السطر.
                </p>
                <div className="p-2.5 bg-brand-tint rounded-xl text-xs">
                  اختبار الحواشي والأقواس: <Bdi dir="ltr">[Andalusia Master-Recording #42]</Bdi> متاح للتحميل.
                </div>
              </CardContent>
            </Card>

            {/* Test 5: URLs */}
            <Card variant="default">
              <CardBadge position="end">اختبار ٥</CardBadge>
              <CardHeader>
                <CardTitle>عناوين الروابط الإلكترونية (URLs)</CardTitle>
                <CardDescription>عرض الروابط بسياق LTR دون تشويه التدفق العربي</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <span className="text-xs text-brand-espresso/70">رابط الحفل الموسيقي:</span>
                  <div className="p-3 bg-brand-surface/30 rounded-xl overflow-hidden">
                    <UrlDisplay
                      url="https://andalusia-band.com/ar/concerts/granada-night-2026?token=vip#booking"
                      showIcon
                    />
                  </div>
                </div>
                <p className="text-xs text-brand-espresso/70">
                  يمكن قراءة مسار الرابط وعلامات الاستفهام والهاشتاج بنمط <code className="font-mono">LTR</code> سليم دون انكسار الفواصل المائلة (<code className="font-mono">/</code>).
                </p>
              </CardContent>
            </Card>

            {/* Test 6: Phone Numbers */}
            <Card variant="default">
              <CardBadge position="end">اختبار ٦</CardBadge>
              <CardHeader>
                <CardTitle>أرقام الهواتف والاتصال</CardTitle>
                <CardDescription>تثبيت علامة الزائد (+) ومفتاح الدولة في موضعها الصحيح</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-brand-surface/30 rounded-xl">
                  <span className="text-sm">حجوزات الأردن:</span>
                  <PhoneNumber phone="+962 7 9123 4567" href="tel:+962791234567" />
                </div>
                <div className="flex items-center justify-between p-3 bg-brand-surface/30 rounded-xl">
                  <span className="text-sm">حجوزات الخليج:</span>
                  <PhoneNumber phone="+966 50 123 4567" href="tel:+966501234567" />
                </div>
                <div className="flex items-center justify-between p-3 bg-brand-surface/30 rounded-xl">
                  <span className="text-sm">الخط الساخن:</span>
                  <PhoneNumber phone="+971 4 800 2632" />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 3. Directional Icons vs Universal Icons Showcase */}
        <section id="icons" className="space-y-6">
          <div className="border-b border-brand-surface pb-4">
            <h2 className="text-2xl sm:text-3xl font-bold font-calligraphic text-brand-espresso">
              منظومة الأيقونات: ما يعكس اتجاهه وما لا يعكس
            </h2>
            <p className="text-sm text-brand-espresso/70 mt-1">
              قاعدة ذهبية في RTL: تنعكس الأيقونات المرتبطة بالزمن والاتجاه والملاحة، بينما تبقى الأيقونات المجردة أو المرتبطة بأدوات فيزيائية ثابتة.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Directional Icons (Mirror in RTL) */}
            <div className="bg-white rounded-2xl p-6 border border-brand-surface shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                  <ArrowEndIcon size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-brand-espresso text-base">
                    أيقونات تعكس اتجاهها تلقائياً (Directional Icons)
                  </h3>
                  <p className="text-xs text-brand-espresso/60">تنعكس أفقياً عند تفعيل RTL لأنها تشير للمسار التالي/السابق</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-brand-surface/20 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-semibold">التالي (End):</span>
                  <ArrowEndIcon size={20} className="text-brand-primary" />
                </div>
                <div className="p-3.5 bg-brand-surface/20 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-semibold">السابق (Start):</span>
                  <ArrowStartIcon size={20} className="text-brand-primary" />
                </div>
                <div className="p-3.5 bg-brand-surface/20 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-semibold">المؤشر التالي:</span>
                  <ChevronEndIcon size={20} className="text-brand-primary" />
                </div>
                <div className="p-3.5 bg-brand-surface/20 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-semibold">المؤشر السابق:</span>
                  <ChevronStartIcon size={20} className="text-brand-primary" />
                </div>
                <div className="p-3.5 bg-brand-surface/20 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-semibold">تراجع (Undo):</span>
                  <UndoIcon size={20} className="text-brand-primary" />
                </div>
                <div className="p-3.5 bg-brand-surface/20 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-semibold">إعادة (Redo):</span>
                  <RedoIcon size={20} className="text-brand-primary" />
                </div>
              </div>
            </div>

            {/* Universal Icons (Never mirror) */}
            <div className="bg-white rounded-2xl p-6 border border-brand-surface shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-espresso/10 text-brand-espresso flex items-center justify-center">
                  <PlayIcon size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-brand-espresso text-base">
                    أيقونات ثابتة لا تعكس اتجاهها (Universal Icons)
                  </h3>
                  <p className="text-xs text-brand-espresso/60">أجهزة ومفاهيم فيزيائية موحدة عالمياً (مشغل الموسيقى، الهاتف، الساعة)</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-brand-surface/20 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-semibold">مشغل الموسيقى:</span>
                  <PlayIcon size={20} className="text-brand-espresso" />
                </div>
                <div className="p-3.5 bg-brand-surface/20 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-semibold">البحث:</span>
                  <SearchIcon size={20} className="text-brand-espresso" />
                </div>
                <div className="p-3.5 bg-brand-surface/20 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-semibold">الهاتف:</span>
                  <PhoneIcon size={20} className="text-brand-espresso" />
                </div>
                <div className="p-3.5 bg-brand-surface/20 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-semibold">التقويم:</span>
                  <CalendarIcon size={20} className="text-brand-espresso" />
                </div>
                <div className="p-3.5 bg-brand-surface/20 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-semibold">الساعة:</span>
                  <ClockIcon size={20} className="text-brand-espresso" />
                </div>
                <div className="p-3.5 bg-brand-surface/20 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-semibold">النوتة:</span>
                  <MusicIcon size={20} className="text-brand-espresso" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. RTL-Aware Data Tables */}
        <section id="tables" className="space-y-6">
          <div className="border-b border-brand-surface pb-4">
            <h2 className="text-2xl sm:text-3xl font-bold font-calligraphic text-brand-espresso">
              جداول البيانات المنطقية (RTL-Aware Tables)
            </h2>
            <p className="text-sm text-brand-espresso/70 mt-1">
              تدفق الأعمدة يبدأ من اليمين في RTL، مع محاذاة البيانات النصية إلى البداية (<code className="font-mono">text-start</code>) والأرقام إلى النهاية (<code className="font-mono">text-end</code>).
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم الموشح / المقطوعة</TableHead>
                <TableHead>المقام الموسيقي</TableHead>
                <TableHead>تاريخ العرض القادم</TableHead>
                <TableHead align="end">عدد الاستماعات</TableHead>
                <TableHead align="end">سعر التذكرة</TableHead>
                <TableHead align="end">الإجراء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-bold text-brand-espresso">
                  لما بدا يتثنى
                </TableCell>
                <TableCell>مقام نهاوند</TableCell>
                <TableCell>
                  <LocalizedDate date="2026-09-18" format="short" />
                </TableCell>
                <TableCell align="end">
                  <LocalizedNumber value={124800} variant={numVariant} />
                </TableCell>
                <TableCell align="end">
                  <LocalizedPrice amount={45} variant={numVariant} />
                </TableCell>
                <TableCell align="end">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary/90 transition-colors cursor-pointer"
                  >
                    <span>استماع</span>
                    <PlayIcon size={12} />
                  </button>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-bold text-brand-espresso">
                  جادك الغيث
                </TableCell>
                <TableCell>مقام بياتي</TableCell>
                <TableCell>
                  <LocalizedDate date="2026-09-25" format="short" />
                </TableCell>
                <TableCell align="end">
                  <LocalizedNumber value={98230} variant={numVariant} />
                </TableCell>
                <TableCell align="end">
                  <LocalizedPrice amount={60} variant={numVariant} />
                </TableCell>
                <TableCell align="end">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary/90 transition-colors cursor-pointer"
                  >
                    <span>استماع</span>
                    <PlayIcon size={12} />
                  </button>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-bold text-brand-espresso">
                  يا شادي الألحان
                </TableCell>
                <TableCell>مقام راست</TableCell>
                <TableCell>
                  <LocalizedDate date="2026-10-02" format="short" />
                </TableCell>
                <TableCell align="end">
                  <LocalizedNumber value={74500} variant={numVariant} />
                </TableCell>
                <TableCell align="end">
                  <LocalizedPrice amount={35} variant={numVariant} />
                </TableCell>
                <TableCell align="end">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary/90 transition-colors cursor-pointer"
                  >
                    <span>استماع</span>
                    <PlayIcon size={12} />
                  </button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </section>

        {/* 5. RTL Form Components */}
        <section id="forms" className="space-y-6">
          <div className="border-b border-brand-surface pb-4">
            <h2 className="text-2xl sm:text-3xl font-bold font-calligraphic text-brand-espresso">
              استمارات الإدخال المتوافقة مع RTL (RTL Forms)
            </h2>
            <p className="text-sm text-brand-espresso/70 mt-1">
              حقول إدخال تدعم الأيقونات في البداية والنهاية منطقياً (<code className="font-mono">ps-10 / pe-10</code>)، مع عزل أرقام الهواتف والروابط في حاويات <code className="font-mono">LTR</code> متخصصة.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-surface shadow-xs">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("تم استلام النموذج بنجاح!");
              }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              {/* Name */}
              <FormField>
                <Label htmlFor="name" required>الاسم الكامل</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="أدخل اسمك الكريم"
                />
              </FormField>

              {/* Email */}
              <FormField>
                <Label htmlFor="email" required>البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  dir="ltr"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  startIcon={<MailIcon size={18} />}
                />
              </FormField>

              {/* Phone Input */}
              <FormField>
                <Label htmlFor="phone" required>رقم الهاتف (Bidi-Isolated)</Label>
                <PhoneInput
                  id="phone"
                  prefix="+962"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="7 9123 4567"
                />
                <FormHelperText>مفتاح الدولة معزول في البداية تلقائياً دون انقلاب</FormHelperText>
              </FormField>

              {/* URL Input */}
              <FormField>
                <Label htmlFor="url">رابط العمل الفني أو الموقع الشخصي</Label>
                <UrlInput
                  id="url"
                  protocol="https://"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="andalusia-band.com/portfolio"
                />
              </FormField>

              {/* Select Category */}
              <FormField>
                <Label htmlFor="category">الفئة الفنية المطلوبة</Label>
                <Select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="singing">غناء موشحات وأدوار</option>
                  <option value="oud">عزف وتقاسيم العود</option>
                  <option value="percussion">الإيقاعات الأندلسية والشرقية</option>
                  <option value="academy">التسجيل في أكاديمية التراث</option>
                </Select>
              </FormField>

              {/* Event Type Radio */}
              <FormField>
                <Label>نوع الفعالية</Label>
                <div className="flex items-center gap-6 pt-2">
                  <Radio
                    name="eventType"
                    value="public"
                    label="أمسية عامة"
                    checked={formData.eventType === "public"}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  />
                  <Radio
                    name="eventType"
                    value="private"
                    label="حفل خاص"
                    checked={formData.eventType === "private"}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  />
                </div>
              </FormField>

              {/* Textarea */}
              <FormField className="sm:col-span-2">
                <Label htmlFor="notes">تفاصيل إضافية والطلبات الخاصة</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="أدخل أي ملاحظات فنية أو تفضيلات مقاماتية..."
                  rows={3}
                />
              </FormField>

              {/* Checkbox */}
              <div className="sm:col-span-2">
                <Checkbox
                  id="subscribe"
                  checked={formData.subscribe}
                  onChange={(e) => setFormData({ ...formData, subscribe: e.target.checked })}
                  label="أوافق على استلام جدول الأمسيات والحفلات الأندلسية القادمة عبر الرسائل القصيرة"
                />
              </div>

              {/* Submit CTA */}
              <div className="sm:col-span-2 flex items-center justify-end gap-3 pt-4 border-t border-brand-surface">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-brand-primary text-white font-bold hover:bg-brand-primary/90 transition-all cursor-pointer shadow-sm"
                >
                  <span>إرسال طلب الحجز</span>
                  <ArrowEndIcon size={18} />
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* 6. RTL Card Architecture Showcase */}
        <section id="cards" className="space-y-6">
          <div className="border-b border-brand-surface pb-4">
            <h2 className="text-2xl sm:text-3xl font-bold font-calligraphic text-brand-espresso">
              بطاقات المحتوى والعروض (RTL Cards)
            </h2>
            <p className="text-sm text-brand-espresso/70 mt-1">
              توزيع بطاقات متجاوب عبر شبكة <code className="font-mono">Grid</code> مع استخدام الخصائص المنطقية للوسوم والحواف.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <Card variant="default">
              <CardBadge position="start">حفل قادم</CardBadge>
              <div className="h-44 bg-brand-surface/40 flex items-center justify-center text-brand-espresso/40">
                <MusicIcon size={48} />
              </div>
              <CardHeader>
                <CardTitle>أمسية غرناطة في عمان</CardTitle>
                <CardDescription>
                  قصر الثقافة — <LocalizedDate date="2026-10-15" format="long" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-brand-espresso/80">
                  مختارات من نوبات الآلة الأندلسية وموشحات لسان الدين بن الخطيب بأداء أوركسترالي تراثي متكامل.
                </p>
              </CardContent>
              <CardFooter>
                <LocalizedPrice amount={35} variant={numVariant} />
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary/90 transition-colors cursor-pointer"
                >
                  <span>حجز تذكرة</span>
                  <ArrowEndIcon size={14} />
                </button>
              </CardFooter>
            </Card>

            {/* Card 2 */}
            <Card variant="surface">
              <CardBadge position="start">أكاديمية الموسيقى</CardBadge>
              <div className="h-44 bg-brand-primary/10 flex items-center justify-center text-brand-primary/60">
                <PlayIcon size={48} />
              </div>
              <CardHeader>
                <CardTitle>مختبر تقاسيم العود والارتجال</CardTitle>
                <CardDescription>
                  إشراف الأستاذ زرياب المعاصر — <LocalizedNumber value={12} variant={numVariant} /> حصة تدريبية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-brand-espresso/80">
                  دراسة تفصيلية للمقامات المركبة وفنون الانتقال المقامي الأندلسي مع تطبيقات عملية أسبوعية.
                </p>
              </CardContent>
              <CardFooter>
                <LocalizedPrice amount={180} variant={numVariant} />
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-espresso text-white text-xs font-bold hover:bg-brand-espresso/90 transition-colors cursor-pointer"
                >
                  <span>التسجيل الآن</span>
                  <ArrowEndIcon size={14} />
                </button>
              </CardFooter>
            </Card>

            {/* Card 3 */}
            <Card variant="primary-border">
              <CardBadge position="start">إصدار صوتي</CardBadge>
              <div className="h-44 bg-brand-tint/60 flex items-center justify-center text-brand-primary">
                <MusicIcon size={48} />
              </div>
              <CardHeader>
                <CardTitle>ألبوم: ريحانة الأندلس (2026)</CardTitle>
                <CardDescription>تسجيل حي نقي بنظام الاستريو العالي الدقة</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-brand-espresso/80">
                  يضم الألبوم ٨ مقطوعات مستعادة من تراث إشبيلية وقرطبة مع كتيب توثيقي للنصوص الشعرية.
                </p>
              </CardContent>
              <CardFooter>
                <span className="text-xs font-mono font-bold text-brand-primary">CD + Lossless FLAC</span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary/90 transition-colors cursor-pointer"
                >
                  <span>شراء الألبوم</span>
                  <ArrowEndIcon size={14} />
                </button>
              </CardFooter>
            </Card>
          </div>
        </section>
      </main>

      {/* Interactive Testing Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        side="start"
        title="لوحة اختبار القائمة الجانبية (Drawer)"
      >
        <div className="space-y-6">
          <div className="p-4 bg-brand-tint rounded-2xl">
            <h4 className="font-bold text-brand-espresso text-sm mb-1">
              سلوك القائمة المنطقي
            </h4>
            <p className="text-xs text-brand-espresso/70 leading-relaxed">
              تفتح هذه القائمة من جهة البداية المنطقية (<code className="font-mono">start-0</code>)، أي من اليمين في الوضع العربي <code className="font-mono">RTL</code>، ومن اليسار إذا تم تفعيل وضع <code className="font-mono">LTR</code>، دون أي كود مخصص لكل لغة.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <a
              href="#test-cases"
              onClick={() => setDrawerOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl bg-white border border-brand-surface text-sm font-semibold hover:border-brand-primary transition-colors"
            >
              <span>اختبارات التوافق الستة</span>
              <ChevronEndIcon size={16} />
            </a>

            <a
              href="#icons"
              onClick={() => setDrawerOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl bg-white border border-brand-surface text-sm font-semibold hover:border-brand-primary transition-colors"
            >
              <span>منظومة الأيقونات الاتجاهية</span>
              <ChevronEndIcon size={16} />
            </a>

            <a
              href="#tables"
              onClick={() => setDrawerOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl bg-white border border-brand-surface text-sm font-semibold hover:border-brand-primary transition-colors"
            >
              <span>جداول البيانات المقاماتية</span>
              <ChevronEndIcon size={16} />
            </a>

            <a
              href="#forms"
              onClick={() => setDrawerOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl bg-white border border-brand-surface text-sm font-semibold hover:border-brand-primary transition-colors"
            >
              <span>استمارة الحجز والاتصال</span>
              <ChevronEndIcon size={16} />
            </a>
          </div>

          <div className="pt-4 border-t border-brand-surface space-y-3">
            <div className="text-xs text-brand-espresso/60">
              رقم التواصل المباشر مع إدارة الفرقة:
            </div>
            <PhoneNumber phone="+962 7 9123 4567" href="tel:+962791234567" className="text-sm font-bold text-brand-primary" />
          </div>
        </div>
      </Drawer>

      {/* Global RTL Footer */}
      <footer className="mt-16 border-t border-brand-surface bg-white py-12 text-start">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-primary text-white flex items-center justify-center">
              <MusicIcon size={18} />
            </div>
            <div>
              <span className="font-calligraphic font-bold text-lg text-brand-espresso">فرقة أندلسيا الموسيقية</span>
              <p className="text-xs text-brand-espresso/60">جميع الحقوق محفوظة © <LocalizedNumber value={2026} variant={numVariant} /> فرقة أندلسيا</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-brand-espresso/70">
            <a href="#test-cases" className="hover:text-brand-primary transition-colors">حالات الاختبار</a>
            <a href="#tables" className="hover:text-brand-primary transition-colors">الجداول</a>
            <a href="#forms" className="hover:text-brand-primary transition-colors">الاستمارات</a>
            <a href="#icons" className="hover:text-brand-primary transition-colors">الأيقونات</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
