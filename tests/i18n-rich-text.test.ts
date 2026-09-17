import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(".");

function flatten(node: unknown, prefix = "", out: Record<string, string> = {}) {
  if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      flatten(value, prefix ? `${prefix}.${key}` : key, out);
    }
  } else if (typeof node === "string") {
    out[prefix] = node;
  }
  return out;
}

function catalog(locale: "ar" | "en") {
  return flatten(JSON.parse(fs.readFileSync(path.join(ROOT, `src/messages/${locale}.json`), "utf-8")));
}

/** Every message that carries rich-text markup, by its leaf key. */
function richLeafKeys(): Set<string> {
  const leaves = new Set<string>();
  for (const locale of ["ar", "en"] as const) {
    for (const [key, value] of Object.entries(catalog(locale))) {
      if (/<\w+>/.test(value)) leaves.add(key.split(".").pop()!);
    }
  }
  return leaves;
}

function componentFiles(dir: string, found: string[] = []): string[] {
  for (const entry of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) componentFiles(rel, found);
    else if (entry.name.endsWith(".tsx")) found.push(rel);
  }
  return found;
}

test("a message with rich-text markup is never read with a plain t() into <Highlight>", () => {
  // next-intl's ICU formatter treats <em> as a tag placeholder: t("key") on such
  // a message throws FORMATTING_ERROR ("the intl string context variable "em"
  // was not provided") and takes the section down with it. Highlight parses the
  // markup itself, so it needs the untouched string from t.raw(); a consumer
  // that wants React nodes uses t.rich() with an em handler instead.
  const rich = richLeafKeys();
  assert.ok(rich.size > 0, "the catalogs should contain rich-text messages to guard");

  const offenders: string[] = [];
  for (const file of componentFiles("src")) {
    const source = fs.readFileSync(path.join(ROOT, file), "utf-8");
    for (const match of source.matchAll(/<Highlight\b[^>]*?text=\{([^}]*)\}/g)) {
      for (const call of match[1].matchAll(/(?<!\.raw|\.rich)\bt\("([^"]+)"\)/g)) {
        if (rich.has(call[1])) offenders.push(`${file}: <Highlight text={t("${call[1]}")}>`);
      }
    }
  }

  assert.deepEqual(offenders, [], `use t.raw() for rich-text messages:\n  ${offenders.join("\n  ")}`);
});

test("Highlight turns <em> runs into highlighted spans", async () => {
  // The contract the fix depends on: Highlight, not the formatter, is what
  // interprets the markup.
  const source = fs.readFileSync(path.join(ROOT, "src/components/ui/Highlight.tsx"), "utf-8");
  assert.match(source, /<em>/, "Highlight must recognise <em> runs");
  assert.match(source, /t\.raw\(key\)/, "its contract must tell callers to use t.raw");
});
