#!/usr/bin/env python3
"""Crop image assets out of the 1:1 Figma reference renders.

The reference PNGs in docs/figma-reference are exported at exactly the frame's
canvas size, so every photograph in the design already sits in this repository at
its rendered pixel coordinates. Cropping them is more faithful than re-exporting,
because it bakes in Figma's own scaling and cropping of the original fill.

It only works where the design draws the image clean. Where text or a gradient is
composited on top — the page heroes — the crop would bake the headline in, so
those still need a real export and are listed in docs/figma/asset-map.json as
outstanding.

Crops are declared below as (frame, x, y, w, h, destination), taken from the
rendered geometry of the ported page once it matches the design.

The last field says whether the design composites its date wash onto the cover.
That wash must not survive into the asset, or the site renders its own pill on top
of a baked-in copy; it is painted over with the band of photograph directly below
it, which ArticleCard's pill then covers again at the same coordinates.
"""
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]

CROPS = [
    # /news floating card — Figma nodes 91:17309 and 91:17316.
    ("news-desktop", 150, 249, 352, 192, "public/assets/articles/news-side-1.png",
     "حوار مع النحات أحمد محمود", False),
    ("news-desktop", 150, 539, 352, 192, "public/assets/articles/news-side-2.png",
     "ورشة عمل جديدة في النحت الكلاسيكي", False),
    # /news grid covers — nodes 91:17380, 91:17399, 91:17418. Right to left, the
    # grid runs newest first, matching published_at descending.
    ("news-desktop", 951, 922, 385, 192, "public/assets/articles/article-1.png",
     "تطور الفن الرقمي في العالم العربي", True),
    ("news-desktop", 541, 922, 385, 192, "public/assets/articles/article-2.png",
     "رحلة مصور في أزقة المدينة القديمة", True),
    ("news-desktop", 130, 922, 385, 192, "public/assets/articles/article-3.png",
     "الإعلان عن جدول فعاليات الصيف الموسيقية", True),
]

# The news grid draws a date wash on the cover: 72x24 at 16px down and 16px in
# from the inline end, measured off the reference at node 91:17380. It is design
# chrome, not photograph, so it is painted out of the asset and re-rendered by
# ArticleCard at the same coordinates. Two extra pixels of pad take the feathered
# edge of the composite with it.
DATE_WASH = (72, 24, 16, 16)
WASH_PAD = 2


def wash_box(width):
    """Rect of the cover's date wash, inset from the inline end of a `width` crop."""
    wash_width, wash_height, top, inset = DATE_WASH
    left = width - inset - wash_width
    return (
        left - WASH_PAD,
        top - WASH_PAD,
        left + wash_width - 1 + WASH_PAD,
        top + wash_height - 1 + WASH_PAD,
    )


def scrub(crop, box):
    """Paint over `box` with the band of image directly beneath it."""
    left, top, right, bottom = box
    height = bottom - top + 1
    source_top = bottom + 1
    if source_top + height > crop.height:
        source_top = max(0, top - height)
    patch = crop.crop((left, source_top, right + 1, source_top + height))
    crop.paste(patch, (left, top))


manifest = json.loads((ROOT / "docs/figma-reference-manifest.json").read_text())
frames = {f["name"]: f for f in manifest["referenceFrames"]}

written = []
for name, x, y, w, h, dest, note, wash in CROPS:
    frame = frames[name]
    reference = ROOT / frame["referenceImage"]
    if not reference.exists():
        print(f"skip {dest}: {reference} is missing")
        continue
    image = Image.open(reference).convert("RGB")
    if x + w > image.width or y + h > image.height:
        print(f"skip {dest}: crop {x},{y} {w}x{h} falls outside {image.size}")
        continue
    out = ROOT / dest
    out.parent.mkdir(parents=True, exist_ok=True)
    crop = image.crop((x, y, x + w, y + h))
    overlay = wash_box(w) if wash else None
    if overlay:
        scrub(crop, overlay)
    written.append({
        "file": dest,
        "frame": name,
        "nodeRect": [x, y, w, h],
        "subject": note,
        "scrubbed": list(overlay) if overlay else None,
    })
    crop.save(out)
    scrubbed = f"  scrubbed overlay {overlay}" if overlay else ""
    print(f"{dest}  <-  {name} [{x},{y} {w}x{h}]  ({note}){scrubbed}")

index = ROOT / "docs/figma/asset-map.json"
index.parent.mkdir(parents=True, exist_ok=True)
index.write_text(json.dumps({
    "source": "cropped 1:1 from docs/figma-reference",
    "note": "Page heroes are not croppable: the design composites the headline and "
            "gradient onto the photograph, so a crop would bake the text in. Those "
            "need a real export from Figma.",
    "cropped": written,
    "outstanding": [
        {"file": "public/assets/figma/news-hero.png", "frame": "news-desktop",
         "node": "91:17298", "reason": "headline and gradient are composited over the photo"},
    ],
}, ensure_ascii=False, indent=2) + "\n")
print(f"\nwrote {index.relative_to(ROOT)}")
