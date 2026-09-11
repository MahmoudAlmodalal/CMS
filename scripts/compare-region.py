#!/usr/bin/env python3
"""Stack the Figma reference and the current capture for one region, side by side.

Usage: compare-region.py <frame-name> <y> <height> [out.png] [--scale N]

Writes a single image with the reference on top and the current capture below,
separated by a magenta rule, so one look shows what moved.
"""
import json
import sys
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
args = [a for a in sys.argv[1:] if not a.startswith("--")]
scale = 1.0
for a in sys.argv[1:]:
    if a.startswith("--scale"):
        scale = float(a.split("=", 1)[1])

name, y, height = args[0], int(args[1]), int(args[2])
# The two renders often hold the same section at different offsets while the page
# above is still the wrong height. --current-y aligns them so the section itself
# can be compared before its position is fixed.
current_y = y
for a in sys.argv[1:]:
    if a.startswith("--current-y"):
        current_y = int(a.split("=", 1)[1])
out = Path(args[3]) if len(args) > 3 else ROOT / "artifacts/visual/compare" / f"{name}-{y}-{height}.png"
out.parent.mkdir(parents=True, exist_ok=True)

manifest = json.loads((ROOT / "docs/figma-reference-manifest.json").read_text())
frame = next(f for f in manifest["referenceFrames"] if f["name"] == name)

reference = Image.open(ROOT / frame["referenceImage"]).convert("RGB")
current = Image.open(ROOT / "artifacts/visual/current" / f"{name}.png").convert("RGB")
width = min(reference.width, current.width)

def band(image, y):
    bottom = min(y + height, image.height)
    if y >= image.height:
        return Image.new("RGB", (width, height), (255, 0, 255))
    crop = image.crop((0, y, width, bottom))
    if crop.height < height:
        padded = Image.new("RGB", (width, height), (255, 0, 255))
        padded.paste(crop, (0, 0))
        return padded
    return crop

top, bottom = band(reference, y), band(current, current_y)
gap = 6
canvas = Image.new("RGB", (width, height * 2 + gap), (255, 0, 255))
canvas.paste(top, (0, 0))
canvas.paste(bottom, (0, height + gap))
draw = ImageDraw.Draw(canvas)
draw.text((8, 4), "FIGMA", fill=(255, 0, 255))
draw.text((8, height + gap + 4), "CURRENT", fill=(255, 0, 255))

if scale != 1.0:
    canvas = canvas.resize((int(canvas.width * scale), int(canvas.height * scale)), Image.LANCZOS)
canvas.save(out)
print(out)
