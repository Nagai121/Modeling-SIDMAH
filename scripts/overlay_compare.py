#!/usr/bin/env python3
"""Save an alpha overlay of reference and corresponding orthographic render.

Only a visual review aid. The Director makes the final match judgment.
Requires Pillow.
"""
from __future__ import annotations
import argparse
from pathlib import Path
from PIL import Image

def fit(canvas_size, image, *, scale=1., dx=0, dy=0):
    ratio = min(canvas_size[0] / image.width, canvas_size[1] / image.height) * scale
    size = (max(1, round(image.width * ratio)), max(1, round(image.height * ratio)))
    resized = image.resize(size, Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", canvas_size, (255, 255, 255, 0))
    canvas.paste(resized, ((canvas_size[0]-size[0])//2+dx, (canvas_size[1]-size[1])//2+dy))
    return canvas

def compare(reference: Path, render: Path, output: Path, *, alpha=.5, scale=1., dx=0, dy=0):
    if not 0 <= alpha <= 1:
        raise ValueError("alpha must be in [0,1]")
    if scale <= 0:
        raise ValueError("scale must be positive")
    with Image.open(reference) as im:
        ref = im.convert("RGBA")
    with Image.open(render) as im:
        model = im.convert("RGBA")
    ref = fit(ref.size, ref)
    model = fit(ref.size, model, scale=scale, dx=dx, dy=dy)
    model.putalpha(model.getchannel("A").point(lambda a: int(a * alpha)))
    merged = Image.alpha_composite(ref, model)
    output.parent.mkdir(parents=True, exist_ok=True)
    merged.convert("RGB").save(output)
    return {"overlay": str(output), "alpha": alpha, "scale": scale, "offset": [dx, dy]}

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--reference", type=Path, required=True)
    p.add_argument("--render", type=Path, required=True)
    p.add_argument("--output", type=Path, required=True)
    p.add_argument("--alpha", type=float, default=.5)
    p.add_argument("--scale", type=float, default=1.)
    p.add_argument("--dx", type=int, default=0)
    p.add_argument("--dy", type=int, default=0)
    a = p.parse_args()
    import json
    print(json.dumps(compare(a.reference, a.render, a.output, alpha=a.alpha, scale=a.scale, dx=a.dx, dy=a.dy)))

if __name__ == "__main__":
    main()
