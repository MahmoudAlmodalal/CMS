/**
 * Resolves the 28 canonical screen frames out of a full Figma file tree.
 *
 * The canvas groups screens into four sections. Arabic desktop names map cleanly
 * onto routes, but several mobile frames carry a duplicated layer name in Figma
 * (three separate frames are all called "الفنانين"), so name matching alone is not
 * enough. Anything ambiguous is emitted with a null route and must be pinned down
 * in docs/figma/frame-overrides.json after looking at the exported PNG.
 */

export const SECTIONS = [
  { name: "شاشات لابتوب /عربي", locale: "ar", viewport: "desktop" },
  { name: "شاشات الهاتف /عربي", locale: "ar", viewport: "mobile" },
  { name: "english desktop", locale: "en", viewport: "desktop" },
  { name: "english mobile", locale: "en", viewport: "mobile" },
];

/** Figma layer name -> screen slug. Mobile frames reuse names, hence the overrides file. */
const NAME_TO_SLUG = {
  "الرئيسية": "home",
  "الأكاديمية": "academy",
  "الفعاليات": "events",
  "الحجز": "booking",
  "الأخبار": "news",
  "الفنانين": "artists",
  "الفنان": "artist-detail",
};

export const SLUG_TO_ROUTE = {
  home: "/",
  academy: "/academy",
  events: "/events",
  booking: "/booking",
  news: "/news",
  artists: "/artists",
  "artist-detail": "/artists/sara-alsawt",
};

/** Annotation sheets sit alongside the screens; they are not designs. */
function isScreenFrame(node) {
  if (node.type !== "FRAME") return false;
  if (!node.children || node.children.length === 0) return false;
  const width = node.absoluteBoundingBox?.width ?? 0;
  return width === 1440 || width === 390;
}

export function collectFrames(fileJson, overrides = {}) {
  const canvases = fileJson.document?.children ?? [];
  const sections = [];
  for (const canvas of canvases) {
    for (const node of canvas.children ?? []) {
      if (node.type === "SECTION") sections.push(node);
    }
  }

  const frames = [];
  for (const spec of SECTIONS) {
    const section = sections.find((s) => s.name.trim() === spec.name);
    if (!section) {
      frames.push({ section: spec.name, missing: true });
      continue;
    }
    const seen = new Map();
    for (const child of section.children ?? []) {
      if (!isScreenFrame(child)) continue;
      const override = overrides[child.id];
      let slug = override ?? NAME_TO_SLUG[child.name.trim()] ?? null;
      // A repeated name means Figma's label is unreliable for this frame.
      const count = (seen.get(slug) ?? 0) + 1;
      seen.set(slug, count);
      if (!override && count > 1) slug = null;
      frames.push({
        id: child.id,
        figmaName: child.name,
        slug,
        route: slug ? SLUG_TO_ROUTE[slug] : null,
        locale: spec.locale,
        viewport: spec.viewport,
        name: slug ? `${slug}-${spec.viewport}-${spec.locale}` : `unresolved-${child.id.replace(":", "_")}`,
        canvas: [
          Math.round(child.absoluteBoundingBox?.width ?? 0),
          Math.round(child.absoluteBoundingBox?.height ?? 0),
        ],
        ambiguous: !slug,
      });
    }
  }
  return frames;
}
