#!/usr/bin/env python3
"""Deterministic diff metrics and images for Figma baselines.

Two scores are produced per frame:

  pixelRatio   — full-resolution share of pixels differing by >8 on any channel.
                 Informational only. Arabic glyph antialiasing alone consumes
                 3-8% of a text-dense page, and Figma's rasteriser and Chrome's
                 disagree on subpixel positioning and gamma, so this number has
                 a hard floor around 2% even for a perfect port.

  layoutRatio  — the same comparison after an 8x LANCZOS downsample. Hinting and
                 antialiasing average away; misplaced boxes and wrong fills
                 survive. This is the structural score and the real gate.

A frame may declare "clip": {"y": N, "height": M} to score one section of a
taller capture, and "referenceImage": null when no Figma baseline exists yet —
such frames are still captured, and report as "no-baseline" rather than an error.
"""
import json
import sys
from pathlib import Path

try:
    from PIL import Image, ImageChops, ImageEnhance
except ModuleNotFoundError:
    sys.exit("Pillow is required for pixel diffing. Install it with: python3 -m pip install pillow")

ROOT = Path(__file__).resolve().parents[1]
DOWNSAMPLE = 8
THRESHOLD = 8

manifest = json.loads((ROOT / "docs/figma-reference-manifest.json").read_text())
current_root = ROOT / "artifacts/visual/current"
diff_root = ROOT / "artifacts/visual/diff"
diff_root.mkdir(parents=True, exist_ok=True)


def changed_ratio(reference, current):
    """Share of pixels where any channel differs by more than THRESHOLD."""
    diff = ImageChops.difference(reference, current)
    mask = diff.convert("L").point(lambda value: 255 if value > THRESHOLD else 0)
    # Band-max, so a difference confined to one channel still counts.
    for band in diff.split():
        mask = ImageChops.lighter(mask, band.point(lambda value: 255 if value > THRESHOLD else 0))
    changed = sum(count for value, count in enumerate(mask.histogram()) if value)
    return changed, mask.width * mask.height, diff


def downsampled(image):
    width = max(1, image.width // DOWNSAMPLE)
    height = max(1, image.height // DOWNSAMPLE)
    return image.resize((width, height), Image.LANCZOS)


results = []
for frame in manifest["referenceFrames"]:
    name = frame["name"]
    reference_image = frame.get("referenceImage")
    current_path = current_root / f"{name}.png"

    if not reference_image:
        results.append({"name": name, "status": "no-baseline", "nodeId": frame.get("nodeId")})
        continue

    reference_path = ROOT / reference_image
    if not reference_path.exists() or not current_path.exists():
        missing = "reference" if not reference_path.exists() else "capture"
        results.append({"name": name, "status": "missing", "missing": missing})
        continue

    reference = Image.open(reference_path).convert("RGB")
    current = Image.open(current_path).convert("RGB")

    # Figma sections may overflow the 1440 artboard; the reference render clips
    # them, so align on the narrower width rather than refusing to compare.
    width = min(reference.width, current.width)
    if reference.width != current.width:
        reference = reference.crop((0, 0, width, reference.height))
        current = current.crop((0, 0, width, current.height))

    clip = frame.get("clip")
    if clip:
        top = clip["y"]
        bottom = top + clip["height"]
        if bottom > reference.height or bottom > current.height:
            results.append({"name": name, "status": "clip-out-of-range",
                            "clip": clip, "reference": list(reference.size), "current": list(current.size)})
            continue
        reference = reference.crop((0, top, width, bottom))
        current = current.crop((0, top, width, bottom))

    if reference.size != current.size:
        results.append({"name": name, "status": "size-mismatch",
                        "reference": list(reference.size), "current": list(current.size)})
        continue

    pixel_changed, pixel_total, diff = changed_ratio(reference, current)
    layout_changed, layout_total, _ = changed_ratio(downsampled(reference), downsampled(current))

    diff_path = diff_root / f"{name}.png"
    ImageEnhance.Contrast(diff).enhance(4.0).save(diff_path)

    results.append({
        "name": name,
        "status": "measured",
        "size": list(reference.size),
        "layoutRatio": round(layout_changed / layout_total, 6),
        "pixelRatio": round(pixel_changed / pixel_total, 6),
        "changedPixelsThreshold8": pixel_changed,
        "totalPixels": pixel_total,
        "maxChannelDifference": max(item[1] for item in diff.getextrema()),
        "diffImage": str(diff_path.relative_to(ROOT)),
    })

output = diff_root / "report.json"
output.write_text(json.dumps({"frames": results}, ensure_ascii=False, indent=2) + "\n")
print(output)

measured = [r for r in results if r["status"] == "measured"]
if measured:
    width = max(len(r["name"]) for r in measured)
    print(f"{'frame'.ljust(width)}   layout    pixel")
    for r in sorted(measured, key=lambda r: -r["layoutRatio"]):
        print(f"{r['name'].ljust(width)}  {r['layoutRatio']:7.2%}  {r['pixelRatio']:7.2%}")
for r in results:
    if r["status"] != "measured":
        print(json.dumps(r, ensure_ascii=False))
