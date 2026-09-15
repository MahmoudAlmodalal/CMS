#!/usr/bin/env python3
"""Regenerate the navbar brand logo from the intact footer artwork.

`logo-navbar.png` shipped as a low-resolution export: the artwork occupied only
205x73 pixels of its 292x178 canvas, and at that size the thin outlined strokes
of the Latin "ANDALUSIA" wordmark dissolved into `ANDAL___A`. `logo-footer.png`
carries the *same* artwork intact and larger (313x112), differing only in
palette -- it is the cream-on-dark footer treatment.

So the navbar logo is derived from the footer file by a two-colour swap. Both
target colours are sampled from the old navbar PNG, so the brand palette is
unchanged; only the missing glyphs come back.

    cream  #EBE6D0  ->  #C54716  (--color-brand-primary)
    blue   #90D4FF  ->  #005266  (the hamza and the small diamond)

Usage: python3 scripts/generate-navbar-logo.py
"""

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "public/assets/branding/logo-footer.png"
TARGET = ROOT / "public/assets/branding/logo-navbar.png"

PRIMARY = (197, 71, 22)  # #C54716
ACCENT = (0, 82, 102)  # #005266

# Retina: the source artwork is 112px tall and the bar renders it at ~56px, so
# 2x leaves a real pixel for every device pixel without inventing detail.
SCALE = 2


def main() -> None:
    src = np.array(Image.open(SOURCE).convert("RGBA")).astype(np.int16)
    rgb, alpha = src[..., :3], src[..., 3]

    # The footer artwork is exactly two inks. The accent is the only one with a
    # strong blue channel, which separates it cleanly from the cream at every
    # anti-aliased coverage level.
    visible = alpha > 0
    accent = visible & (rgb[..., 2] > 230) & (rgb[..., 0] < 200)
    primary = visible & ~accent

    out = np.zeros_like(src)
    out[..., 3] = alpha  # keep the original coverage so edges stay smooth
    out[primary, :3] = PRIMARY
    out[accent, :3] = ACCENT

    image = Image.fromarray(out.astype(np.uint8), "RGBA")

    # Trim the dead transparent margin the old file baked in -- it is what forced
    # the translate-y nudges in MobileNavbar -- so the rendered height is the
    # artwork's height and `h-* w-auto` sizing behaves predictably.
    box = image.getbbox()
    image = image.crop(box)
    image = image.resize((image.width * SCALE, image.height * SCALE), Image.LANCZOS)

    image.save(TARGET)
    print(f"wrote {TARGET.relative_to(ROOT)} at {image.width}x{image.height}")


if __name__ == "__main__":
    main()
