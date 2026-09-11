"use client";

// Shared UI shapes lifted from ArtistsManager.tsx (ponytail: small duplication left there
// on purpose — its test greps the file's own source for these shapes).

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { FormHelperText, FormLabel } from "@/components/ui/FormElements";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export function Field({
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

/**
 * The English sibling of an Arabic content field.
 *
 * Always optional: a blank value is stored as null and the public English pages
 * fall back to the Arabic text, so an untranslated row never renders empty.
 */
export function TranslationField({
  id,
  label,
  value,
  onChange,
  multiline = false,
  rows = 3,
  className,
}: {
  id: string;
  label: string;
  value: string | null | undefined;
  onChange: (value: string) => void;
  multiline?: boolean;
  rows?: number;
  className?: string;
}) {
  return (
    <Field
      id={id}
      label={`${label} — English`}
      required={false}
      help="اختياري. يظهر في النسخة الإنجليزية؛ إن تُرك فارغاً يُعرض النص العربي."
    >
      {multiline ? (
        <Textarea
          id={id}
          dir="ltr"
          lang="en"
          rows={rows}
          className={className}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <Input
          id={id}
          dir="ltr"
          lang="en"
          className={className}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </Field>
  );
}

export function StatusBadge({ published, labels }: { published: boolean; labels?: [string, string] }) {
  const [publishedLabel, draftLabel] = labels ?? ["منشور", "مسودة"];
  return (
    <Badge variant={published ? "active" : "surface"} size="sm">
      {published ? publishedLabel : draftLabel}
    </Badge>
  );
}

export function Notice({ notice }: { notice: { type: "success" | "error"; text: string } | null }) {
  if (!notice) return null;
  return (
    <div
      role={notice.type === "error" ? "alert" : "status"}
      className={notice.type === "error"
        ? "rounded-xl border border-alert-error/30 bg-alert-error/10 px-4 py-3 text-sm font-medium text-alert-error"
        : "rounded-xl border border-brand-primary/20 bg-brand-primary/10 px-4 py-3 text-sm font-medium text-brand-primary"}
    >
      {notice.text}
    </div>
  );
}

export function ModalShell({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card variant="primary-border" id={id}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="grid gap-5 md:grid-cols-2">{children}</CardContent>
    </Card>
  );
}
