import fs from "node:fs";
import path from "node:path";

const root = path.resolve(".");

export function loadMessages(locale: "ar" | "en"): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(path.join(root, `src/messages/${locale}.json`), "utf-8"));
}

/** Flattens a catalog to "namespace.key" -> value for direct copy assertions. */
export function flattenMessages(messages: Record<string, unknown>, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(messages)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object") {
      Object.assign(out, flattenMessages(value as Record<string, unknown>, full));
    } else {
      out[full] = String(value);
    }
  }
  return out;
}

export const arMessages = flattenMessages(loadMessages("ar"));
export const enMessages = flattenMessages(loadMessages("en"));
