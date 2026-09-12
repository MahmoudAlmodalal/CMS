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

# The release-type badge of node 134:4700 and its siblings, as an inclusive rect in
# a 269-wide cover crop: 20 tall at 11.99 down, its inline end 2.5px inside the
# cover, and as wide as its label. Two extra pixels of pad take the feathered edge
# of the composite with it.
STUDIO_BADGE = (184, 10, 268, 34)
LIVE_BADGE = (202, 10, 264, 34)

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
    # Arabesque corner marks. Both are flat artwork on an opaque espresso ground,
    # so a crop carries its own background and needs no alpha. The footer's mark
    # (I94:18509;87:14546) is declared 6.39% x 14.14% of a 1454-wide footer that
    # starts 14px off the artboard, so only the right 79px of it is ever drawn.
    ("booking-desktop", 0, 1568, 79, 55, "public/assets/branding/footer-mark.png",
     "arabesque mark, footer top-left", False),
    # The booking sidebar's card (91:17251) carries the same mark at 18.75% x 21.35%.
    ("booking-desktop", 149, 676, 77, 61, "public/assets/branding/card-mark.png",
     "arabesque mark, dark card top-left", False),
    # The academy's value-props band (91:16348) draws the same mark at 6.39% x 12.4%
    # of a 1444-wide band that starts 1px off the artboard, so 92x55 of it shows.
    ("academy-desktop", 0, 1210, 92, 55, "public/assets/branding/band-mark.png",
     "arabesque mark, dark band top-left", False),
    # The dotted marks flanking the academy tracks grid (91:16120 and 91:16225) are
    # 122.7x111.56 each and hang off both edges of the artboard, so only the inner
    # 73.7 and 86.7 are ever drawn. Both sit on the flat cream ground.
    ("academy-desktop", 0, 839, 74, 112, "public/assets/branding/dots-start.png",
     "dotted mark, tracks grid inline end", False),
    ("academy-desktop", 1354, 1066, 86, 112, "public/assets/branding/dots-end.png",
     "dotted mark, tracks grid inline start", False),
    # The same dotted marks on الفنانين (91:17845, 91:17950) hang off the artboard by
    # different amounts, so they need their own crops.
    ("artists-desktop", 0, 708, 62, 112, "public/assets/branding/dots-artists-start.png",
     "dotted mark, artists grid inline end", False),
    ("artists-desktop", 1377, 1696, 63, 112, "public/assets/branding/dots-artists-end.png",
     "dotted mark, artists grid inline start", False),
    # The eight portraits of the الفنانين grid (91:18061) are four photographs used
    # twice each. Each card clips its 340 image box to the 314 it actually shows, so
    # the crop is the visible rectangle and the card renders it at that size. Read
    # right to left, the first row is artist 1 through 4.
    ("artists-desktop", 1031, 846, 296, 314, "public/assets/artists/artist-1.png",
     "portrait, artists row 1 card 1", False),
    ("artists-desktop", 725, 846, 296, 314, "public/assets/artists/artist-2.png",
     "portrait, artists row 1 card 2", False),
    ("artists-desktop", 419, 846, 296, 314, "public/assets/artists/artist-3.png",
     "portrait, artists row 1 card 3", False),
    ("artists-desktop", 113, 846, 296, 314, "public/assets/artists/artist-4.png",
     "portrait, artists row 1 card 4", False),
    # The same dotted marks again on الفعاليات (91:16533, 91:16638), hanging off the
    # artboard by 61 and 1376 respectively.
    ("events-desktop", 0, 705, 62, 112, "public/assets/branding/dots-events-start.png",
     "dotted mark, events list inline end", False),
    ("events-desktop", 1376, 1682, 64, 112, "public/assets/branding/dots-events-end.png",
     "dotted mark, events list inline start", False),
    # The featured panel's cover (91:16915) is 503x397 of clean photograph: the
    # panel's arabesque mark sits in the background layer underneath it and the
    # 225-tall node above it carries no fill, so nothing is composited on top.
    ("events-desktop", 100, 748, 503, 397, "public/assets/events/featured-cover.png",
     "cover, featured event panel", False),
    # The five row thumbnails (91:16816 and siblings) are each a 140x105 clip at
    # the inline start of the row, one per row down the list.
    ("events-desktop", 1201, 786, 140, 105, "public/assets/events/event-1.png",
     "thumbnail, ليلة الطرب الأندلسي", False),
    ("events-desktop", 1201, 952, 140, 105, "public/assets/events/event-2.png",
     "thumbnail, أمسية العود والكلمة", False),
    ("events-desktop", 1201, 1118, 140, 105, "public/assets/events/event-3.png",
     "thumbnail, مهرجان الربيع الموسيقي", False),
    ("events-desktop", 1201, 1284, 140, 105, "public/assets/events/event-4.png",
     "thumbnail, ورشة الإيقاع الشرقي", False),
    ("events-desktop", 1201, 1450, 140, 105, "public/assets/events/event-5.png",
     "thumbnail, حفل الذكرى الخامسة", False),
    # الفنان (134:4420). The profile portrait (134:4674) is a 160 circle with a 20%
    # primary ring drawn inside it; the crop carries the ring, and the card's own
    # rounding clips the cream that sits outside the circle.
    ("artist-detail-desktop", 151, 671, 160, 160,
     "public/assets/artists/sara-alsawt-profile.png", "portrait, artist profile card", False),
    # The two stage photographs flanking the quote card (134:4650, 134:4659). The
    # design draws them clean, and both are section artwork rather than per-artist
    # media — there is no gallery table for them to come from.
    ("artist-detail-desktop", 884, 1042, 266, 266, "public/assets/artists/stage-1.png",
     "stage photograph, gallery inline start", False),
    ("artist-detail-desktop", 290, 1042, 266, 266, "public/assets/artists/stage-2.png",
     "stage photograph, gallery inline end", False),
    # The four release covers (134:4699 and siblings), read right to left, newest
    # first. Each carries the release-type badge composited onto the photograph, so
    # the badge is painted out and ArtistDiscography re-renders it in place.
    ("artist-detail-desktop", 1019, 1668, 269, 269, "public/assets/releases/release-1.png",
     "cover, نسمة من الأندلس", STUDIO_BADGE),
    ("artist-detail-desktop", 730, 1668, 269, 269, "public/assets/releases/release-2.png",
     "cover, حنين", STUDIO_BADGE),
    ("artist-detail-desktop", 441, 1668, 269, 269, "public/assets/releases/release-3.png",
     "cover, ليالي بيروت", LIVE_BADGE),
    ("artist-detail-desktop", 152, 1668, 269, 269, "public/assets/releases/release-4.png",
     "cover, عطر الماضي", STUDIO_BADGE),
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
    overlay = wash_box(w) if wash is True else (tuple(wash) if wash else None)
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
        {"file": "public/assets/figma/booking-hero.png", "frame": "booking-desktop",
         "node": "91:17111", "reason": "headline and gradient are composited over the photo"},
        {"file": "public/assets/figma/academy-hero.png", "frame": "academy-desktop",
         "node": "91:16331", "reason": "headline and gradient are composited over the photo"},
        {"file": "public/assets/figma/events-hero.png", "frame": "events-desktop",
         "node": "91:16745", "reason": "headline and gradient are composited over the photo"},
        {"file": "public/assets/figma/artist-detail-hero.png", "frame": "artist-detail-desktop",
         "node": "134:4631", "reason": "the artist name, quote, standfirst and CTAs are "
                                       "composited over the photo"},
        {"file": "public/assets/branding/booking-banner.png", "frame": "artist-detail-desktop",
         "node": "134:4660", "reason": "the 88% espresso wash and every line of copy are "
                                       "composited over the photo"},
    ],
    "blockedBy": "The outstanding files need a real export from Figma. The MCP asset "
                 "URLs live on www.figma.com, which this environment's egress policy "
                 "blocks (403 on CONNECT), so they cannot be fetched from here.",
}, ensure_ascii=False, indent=2) + "\n")
print(f"\nwrote {index.relative_to(ROOT)}")
