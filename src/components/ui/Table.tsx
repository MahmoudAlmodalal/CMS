import React from "react";

export function Table({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-brand-surface shadow-xs bg-white">
      <table
        className={`w-full text-start text-sm border-collapse ${className}`}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function TableHeader({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={`bg-brand-surface/40 border-b border-brand-surface text-brand-espresso font-bold ${className}`}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={`divide-y divide-brand-surface/50 text-brand-espresso ${className}`} {...props}>
      {children}
    </tbody>
  );
}

export function TableFooter({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tfoot
      className={`bg-brand-surface/20 border-t border-brand-surface font-semibold ${className}`}
      {...props}
    >
      {children}
    </tfoot>
  );
}

export function TableRow({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={`hover:bg-brand-tint/30 transition-colors ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({
  className = "",
  align = "start",
  children,
  ...props
}: Omit<React.ThHTMLAttributes<HTMLTableCellElement>, "align"> & { align?: "start" | "end" | "center" }) {
  const alignClass =
    align === "end" ? "text-end" : align === "center" ? "text-center" : "text-start";

  return (
    <th
      scope="col"
      className={`py-3.5 px-4 font-semibold text-xs tracking-wider uppercase text-brand-espresso/80 ${alignClass} ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({
  className = "",
  align = "start",
  children,
  ...props
}: Omit<React.TdHTMLAttributes<HTMLTableCellElement>, "align"> & { align?: "start" | "end" | "center" }) {
  const alignClass =
    align === "end" ? "text-end" : align === "center" ? "text-center" : "text-start";

  return (
    <td className={`py-4 px-4 align-middle ${alignClass} ${className}`} {...props}>
      {children}
    </td>
  );
}

export function TableCaption({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLTableCaptionElement>) {
  return (
    <caption
      className={`mt-4 text-xs text-brand-espresso/60 text-start px-4 ${className}`}
      {...props}
    >
      {children}
    </caption>
  );
}
