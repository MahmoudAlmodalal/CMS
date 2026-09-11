#!/usr/bin/env python3
"""Create deterministic pixel-diff metrics and images for Figma baselines."""
import json
import sys
from pathlib import Path

try:
    from PIL import Image, ImageChops, ImageEnhance
except ModuleNotFoundError:
    sys.exit("Pillow is required for pixel diffing. Install it with: python3 -m pip install pillow")

ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT / "docs/figma-reference-manifest.json").read_text())
current_root = ROOT / "artifacts/visual/current"
diff_root = ROOT / "artifacts/visual/diff"
diff_root.mkdir(parents=True, exist_ok=True)
results = []
for frame in manifest["referenceFrames"]:
    name = frame["name"]
    reference_path = ROOT / frame["referenceImage"]
    current_path = current_root / f"{name}.png"
    if not reference_path.exists() or not current_path.exists():
        results.append({"name": name, "status": "missing"})
        continue
    reference = Image.open(reference_path).convert("RGB")
    current = Image.open(current_path).convert("RGB")
    if reference.size != current.size:
        results.append({"name": name, "status": "size-mismatch", "reference": reference.size, "current": current.size})
        continue
    diff = ImageChops.difference(reference, current)
    changed = diff.point(lambda value: 255 if value > 8 else 0)
    changed_pixels = sum(pixel != (0, 0, 0) for pixel in changed.getdata())
    total_pixels = reference.width * reference.height
    diff_path = diff_root / f"{name}.png"
    ImageEnhance.Contrast(diff).enhance(4.0).save(diff_path)
    results.append({"name": name, "status": "measured", "size": list(reference.size), "changedPixelsThreshold8": changed_pixels, "totalPixels": total_pixels, "changedRatioThreshold8": round(changed_pixels / total_pixels, 6), "maxChannelDifference": max(item[1] for item in diff.getextrema()), "diffImage": str(diff_path.relative_to(ROOT))})

output = diff_root / "report.json"
output.write_text(json.dumps({"frames": results}, ensure_ascii=False, indent=2) + "\n")
print(output)
for result in results: print(json.dumps(result, ensure_ascii=False))
