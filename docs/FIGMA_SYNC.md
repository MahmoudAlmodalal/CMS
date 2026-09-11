# سحب التصميم من فيجما

مصدر الحقيقة الوحيد للتصميم هو ملف فيجما `xcKbTxQQhUVOFJerTrkrw2` («موقع ويب لفرقة موسيقية»).
كل القياسات والألوان والنصوص والصور تُسحب آلياً؛ لا تُكتب قيمة تصميم يدوياً في الكود.

## المتطلبات

1. **توكن فيجما** في متغيّر البيئة `FIGMA_TOKEN` (Personal Access Token بصلاحية قراءة الملف).
   لا يُكتب التوكن في أي ملف داخل الريبو.
2. **وصول شبكي إلى `api.figma.com`.** في بيئات Claude Code السحابية يجب أن يكون المضيف ضمن قائمة
   السماح في إعدادات البيئة، وإلا يرد الوكيل `403 CONNECT`.
   مضيف تنزيل الصور `figma-alpha-api.s3.us-west-2.amazonaws.com` مفتوح افتراضياً.

تحقّق سريع:

```bash
curl -sS -o /dev/null -w '%{http_code}\n' \
  -H "X-Figma-Token: $FIGMA_TOKEN" https://api.figma.com/v1/me   # يجب أن يرجع 200
```

## التشغيل

```bash
export FIGMA_TOKEN=figd_...
npm run figma:sync     # يسحب كل شيء
npm run figma:spec     # يحوّل الشجرة إلى مواصفات قابلة للقراءة
```

لسحب جزء واحد فقط:

```bash
npm run figma:sync -- --only=images       # الصور المرجعية فقط
npm run figma:sync -- --only=nodes,fills  # الشجرة والصور الأصلية
```

الخطوات المتاحة: `file`, `frames`, `nodes`, `images`, `fills`, `svg`, `styles`.

## المخرجات

| المسار | المحتوى |
|---|---|
| `docs/figma/file.json` | شجرة المستند كاملة |
| `docs/figma/frames.json` | الشاشات الـ28 مربوطة بمساراتها |
| `docs/figma/nodes/*.json` | شجرة كل إطار خاماً من REST |
| `docs/figma/spec/*.json` | مواصفة مسطّحة: هندسة نسبية + ألوان hex + خطوط + نصوص |
| `docs/figma/spec/*.txt` | نفس المواصفة كمخطط شجري للقراءة بجانب الصورة |
| `docs/figma/image-fills.json` | خريطة `imageRef` → ملف محلي → الطبقات المستخدِمة |
| `docs/figma-reference/*.png` | صورة مرجعية لكل إطار (scale 2) |
| `public/assets/figma/*` | الصور الأصلية المستخدمة في التصميم |
| `public/assets/icons/*.svg` | طبقات الفيكتور (أيقونات وزخارف) |

## الإطارات الغامضة

ثلاثة إطارات موبايل في فيجما تحمل جميعها اسم «الفنانين» بارتفاعات مختلفة
(2889 / 3434 / 3037) — أي أن اسم الطبقة غير موثوق لتحديد الشاشة. يطبع `figma:sync` قائمة
بالإطارات غير المحسومة، فتُفتح صورتها المصدَّرة ثم يُضاف الربط يدوياً في
`docs/figma/frame-overrides.json`:

```json
{
  "141:15629": "news",
  "141:15199": "booking"
}
```

ثم يُعاد تشغيل `npm run figma:sync -- --only=nodes,images`.

## ما لا يمكن سحبه

**ملفات الخطوط.** فيجما لا تتيح تنزيل الخطوط عبر الـAPI إطلاقاً. خط العناوين
`Qahwa Arabic` يجب الحصول عليه من المصمّم ووضعه في `public/assets/fonts/qahwa-arabic.woff2`
(الـ`@font-face` معرّف أصلاً في `src/app/globals.css`). بدونه تسقط كل العناوين على Cairo
ولن تطابق التصميم.
