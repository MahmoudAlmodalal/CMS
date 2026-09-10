from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = root / "public/assets/figma/hero-stage.png"
target = root / "public/assets/figma/hero-stage-landscape.png"
Image.open(source).rotate(90, expand=True).save(target, optimize=True)
print(target)
