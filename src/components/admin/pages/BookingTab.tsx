"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  BilingualPair,
  type SiteSettingsFormValues,
  type TextFieldName,
} from "./settingsFormKit";

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
        </CardContent>
      </Card>

      {/* 2. SEO Booking */}
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
