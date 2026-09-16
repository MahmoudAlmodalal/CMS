"use client";

// Shared UI shapes lifted from ArtistsManager.tsx (ponytail: small duplication left there
// on purpose — its test greps the file's own source for these shapes).

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { FormHelperText, FormLabel } from "@/components/ui/FormElements";
import { Input } from "@/components/ui/Input";
import { ModalPortalContext } from "@/components/ui/ModalPortal";
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

/**
 * One translatable field, as one control.
 *
 * Before this, an Arabic <Field> and its standalone `— English` TranslationField
 * were two sibling cells in the form grid, so every field read as the field above
 * it repeated — which is what "duplicate English inputs" turned out to be. Here
 * the label is said once, for the pair, and the two locales are sub-labelled
 * inside a single bordered group, so nothing reads as a repeat.
 *
 * The English half is always optional: blank is stored as null and the English
 * pages fall back to the Arabic text, so an untranslated row never renders empty.
 */
export function BilingualField({
  id,
  label,
  help,
  required = true,
  multiline = false,
  rows = 3,
  className,
  value,
  onChange,
  valueEn,
  onChangeEn,
}: {
  id: string;
  label: string;
  help?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  className?: string;
  value: string;
  onChange: (value: string) => void;
  valueEn: string | null | undefined;
  onChangeEn: (value: string) => void;
}) {
  const enId = `${id}-en`;
  const control = (
    locale: "ar" | "en",
    controlId: string,
    controlValue: string,
    set: (value: string) => void,
  ) =>
    multiline ? (
      <Textarea
        id={controlId}
        dir={locale === "en" ? "ltr" : undefined}
        lang={locale}
        rows={rows}
        className={className}
        required={locale === "ar" && required}
        value={controlValue}
        onChange={(event) => set(event.target.value)}
      />
    ) : (
      <Input
        id={controlId}
        dir={locale === "en" ? "ltr" : undefined}
        lang={locale}
        className={className}
        required={locale === "ar" && required}
        value={controlValue}
        onChange={(event) => set(event.target.value)}
      />
    );

  return (
    <div className="space-y-3 rounded-2xl border border-brand-espresso-subtle/50 bg-brand-surface/40 p-4 text-start md:col-span-2">
      <div className="space-y-1">
        {/* A group heading, not a <label>: the two inputs below carry their own. */}
        <p className="text-sm font-bold text-brand-espresso">
          {label}
          {required && <span aria-hidden="true" className="text-brand-primary"> *</span>}
        </p>
        {help && <FormHelperText>{help}</FormHelperText>}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <FormLabel htmlFor={id} required={required}>العربية</FormLabel>
          {control("ar", id, value, onChange)}
        </div>
        <div className="space-y-2">
          <FormLabel htmlFor={enId} required={false}>English</FormLabel>
          {control("en", enId, valueEn ?? "", onChangeEn)}
          <FormHelperText>اختياري — إن تُرك فارغاً يُعرض النص العربي.</FormHelperText>
        </div>
      </div>
    </div>
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

/**
 * The shell every manager's create/edit form lives in.
 *
 * A real modal: a native `<dialog>` opened with `showModal()`, which gives
 * focus trapping, page inertness, the backdrop and top-layer painting for free.
 * It replaced an inline Card rendered *below* the list, where clicking «تعديل»
 * on a long table appeared to do nothing because the form opened off-screen.
 *
 * Callers keep their `{formOpen && <ModalShell …>}` conditional mount, so the
 * dialog exists in the DOM only while open.
 */
export function ModalShell({
  id,
  title,
  description,
  onClose,
  notice,
  maxWidth = "max-w-4xl",
  children,
}: {
  id: string;
  title: string;
  description?: string;
  /** Called for Esc, the backdrop and the close button. */
  onClose?: () => void;
  /** Rendered inside the dialog — a page-level notice would be behind the backdrop. */
  notice?: React.ReactNode;
  maxWidth?: string;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Provided to portalling overlays (Dropdown) so their panels are not painted
  // under the top-layer dialog. State, not the ref, so consumers re-render once
  // the element exists.
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    setPortalTarget(dialog);
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      id={id}
      dir="rtl"
      aria-label={title}
      onCancel={(event) => {
        // Esc: let the caller unmount us instead of the browser closing a
        // dialog React still believes is open.
        event.preventDefault();
        onClose?.();
      }}
      onClose={() => onClose?.()}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose?.();
      }}
      className={`m-auto max-h-[90vh] w-[calc(100vw-2rem)] ${maxWidth} overflow-y-auto rounded-2xl border border-brand-espresso-subtle bg-white p-0 text-start shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-xs`}
    >
      <ModalPortalContext.Provider value={portalTarget}>
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-brand-espresso-subtle bg-white px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-brand-espresso">{title}</h2>
            {description && (
              <p className="mt-1 text-sm leading-relaxed text-gradscale-400">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onClose?.()}
            aria-label="إغلاق النموذج"
            className="shrink-0 rounded-button px-3 py-2 text-sm font-bold text-gradscale-400 hover:bg-brand-surface hover:text-brand-espresso focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            ✕
          </button>
        </div>

        {notice ? <div className="px-5 pt-4 sm:px-6">{notice}</div> : null}

        <div className="grid gap-5 px-5 py-5 sm:px-6 md:grid-cols-2">{children}</div>
      </ModalPortalContext.Provider>
    </dialog>
  );
}
