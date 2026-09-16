"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  BilingualPair,
  type SiteSettingsFormValues,
  type TextFieldName,
} from "./settingsFormKit";
import { Field } from "./settingsFormKit";
import { Input } from "@/components/ui/Input";

export interface BookingTabProps {
  values: SiteSettingsFormValues;
  setField: (field: TextFieldName, value: string) => void;
}

export function BookingTab({ values, setField }: BookingTabProps) {
  return (
    <div className="space-y-6">
      {/* 1. Booking Page Content Overrides */}
      <Card>
        <CardHeader>
          <CardTitle>واجهة صفحة الحجز (/booking)</CardTitle>
          <CardDescription>عنوان الصفحة والعنوان الفرعي. بيانات التواصل تُدار من إعدادات الموقع. اترك أي حقل فارغاً لاستخدام النص الافتراضي.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <BilingualPair
            id="booking_title"
            label="عنوان صفحة الحجز"
            values={values}
            onChange={setField}
            helpText="اتركه فارغاً لاستخدام النص الافتراضي. ضع *نجمتين* حول الكلمة لتلوينها."
          />
          <div className="md:col-span-2">
            <BilingualPair
              id="booking_subtitle"
              label="العنوان الفرعي لصفحة الحجز"
              multiline
              values={values}
              onChange={setField}
              helpText="اتركه فارغاً لاستخدام النص الافتراضي."
            />
          </div>
          <Field id="booking_hero_image_url" label="صورة هيرو صفحة الحجز" required={false} help="رابط الصورة. اتركه فارغاً للصورة الافتراضية.">
            <Input
              id="booking_hero_image_url"
              type="url"
              dir="ltr"
              value={values.booking_hero_image_url}
              onChange={(event) => setField("booking_hero_image_url", event.target.value)}
              placeholder="https://..."
            />
          </Field>
        </CardContent>
      </Card>

      {/* 2. Booking Form Copy Overrides */}
      <Card>
        <CardHeader>
          <CardTitle>نصوص نموذج الحجز</CardTitle>
          <CardDescription>تجاوز نصوص نموذج الحجز. اترك أي حقل فارغاً لاستخدام الترجمة الافتراضية.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <BilingualPair
            id="booking_group_personal"
            label="تصنيف: شخصي"
            values={values}
            onChange={setField}
            helpText="نص خيار 'مناسبة شخصية' في حقل نوع الحجز. فارغ = الترجمة الافتراضية."
          />
          <BilingualPair
            id="booking_group_occasion"
            label="تصنيف: مناسبة"
            values={values}
            onChange={setField}
            helpText="نص خيار 'مناسبة' في حقل نوع الحجز. فارغ = الترجمة الافتراضية."
          />
          <BilingualPair
            id="booking_consent_text"
            label="نص الموافقة"
            multiline
            values={values}
            onChange={setField}
            helpText="نص خانة الموافقة أسفل النموذج. فارغ = الترجمة الافتراضية."
          />
          <BilingualPair
            id="booking_submit_label"
            label="نص زر الإرسال"
            values={values}
            onChange={setField}
            helpText="نص زر الإرسال في نموذج الحجز. فارغ = الترجمة الافتراضية."
          />
          <BilingualPair
            id="booking_loading_label"
            label="نص حالة التحميل"
            values={values}
            onChange={setField}
            helpText="النص الذي يظهر أثناء إرسال النموذج. فارغ = الترجمة الافتراضية."
          />
        </CardContent>
      </Card>

      {/* 3. Booking Success Message Overrides */}
      <Card>
        <CardHeader>
          <CardTitle>رسالة نجاح الحجز</CardTitle>
          <CardDescription>تجاوز نصوص رسالة التأكيد التي تظهر بعد إرسال النموذج بنجاح.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <BilingualPair
            id="booking_success_title"
            label="عنوان رسالة النجاح"
            values={values}
            onChange={setField}
            helpText="العنوان الكبير في رسالة النجاح. فارغ = الترجمة الافتراضية."
          />
          <div className="md:col-span-2">
            <BilingualPair
              id="booking_success_body"
              label="نص رسالة النجاح"
              multiline
              values={values}
              onChange={setField}
              helpText="النص الرئيسي في رسالة التأكيد. فارغ = الترجمة الافتراضية."
            />
          </div>
          <div className="md:col-span-2">
            <BilingualPair
              id="booking_success_note"
              label="ملاحظة رسالة النجاح"
              multiline
              values={values}
              onChange={setField}
              helpText="الملاحظة الإضافية أسفل رسالة النجاح. فارغ = الترجمة الافتراضية."
            />
          </div>
        </CardContent>
      </Card>

      {/* 4. SEO Booking */}
      <Card>
        <CardHeader>
          <CardTitle>تحسين محركات البحث للحجز (SEO)</CardTitle>
          <CardDescription>عنوان ووصف صفحة الحجز لمحركات البحث ومشاركات الروابط. اترك أي حقل فارغاً لاستخدام النص الافتراضي.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <BilingualPair
            id="seo_booking_title"
            label="عنوان SEO للحجز"
            values={values}
            onChange={setField}
            helpText="اتركه فارغاً لاستخدام النص الافتراضي."
          />
          <div className="md:col-span-2">
            <BilingualPair
              id="seo_booking_description"
              label="وصف SEO للحجز"
              multiline
              values={values}
              onChange={setField}
              helpText="اتركه فارغاً لاستخدام النص الافتراضي."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
