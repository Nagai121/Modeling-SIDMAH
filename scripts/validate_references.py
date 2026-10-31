#!/usr/bin/env python3
"""Validate 15 required modeling images; never alter source images."""
from __future__ import annotations
import json
import sys
from pathlib import Path

PARTS = ("head", "upper_body", "lower_body", "accessories", "whole")
VIEWS = ("front", "side", "back")
EXTS = {".png", ".jpg", ".jpeg", ".webp"}
MAGIC = {".png": b"\x89PNG\r\n\x1a\n", ".jpg": b"\xff\xd8\xff", ".jpeg": b"\xff\xd8\xff", ".webp": b"RIFF"}

def validate(root: Path):
    problems, files = [], []
    manifest_file = root / "manifest.json"
    try:
        manifest = json.loads(manifest_file.read_text(encoding="utf-8"))
    except (OSError, ValueError) as error:
        return files, ["invalid/missing manifest.json: " + str(error)]
    if manifest.get("schemaVersion") != 1: problems.append("schemaVersion must be 1")
    if manifest.get("side") not in ("left", "right"): problems.append("side must be left or right, from the subject's perspective")
    if set(manifest.get("parts", [])) != set(PARTS): problems.append("parts must contain exactly all five modeling targets")
    if set(manifest.get("views", [])) != set(VIEWS): problems.append("views must contain front, side, back")
    for part in PARTS:
        directory = root / part
        if directory.is_symlink():
            problems.append(f"{part}: directory symlink is not allowed")
            continue
        for view in VIEWS:
            candidates = [p for p in directory.glob(view + ".*") if p.suffix.lower() in EXTS and p.is_file()]
            if len(candidates) != 1:
                problems.append(f"{part}/{view}: exactly one image required, found {len(candidates)}")
                continue
            image = candidates[0]
            if image.is_symlink() or image.stat().st_size < 32:
                problems.append(f"{part}/{image.name}: symlink or unexpectedly small file")
                continue
            with image.open("rb") as fp:
                signature = fp.read(16)
            if not signature.startswith(MAGIC[image.suffix.lower()]):
                problems.append(f"{part}/{image.name}: invalid file signature")
                continue
            if image.suffix.lower() == ".webp" and signature[8:12] != b"WEBP":
                problems.append(f"{part}/{image.name}: invalid WebP signature")
                continue
            files.append(str(image))
    return files, problems

if __name__ == "__main__":
    folder = Path(sys.argv[1] if len(sys.argv) > 1 else "modeling/reference_images")
    found, errors = validate(folder)
    print(json.dumps({"ok": not errors, "found": len(found), "expected": 15, "files": found, "issues": errors}, ensure_ascii=False, indent=2))
    sys.exit(1 if errors else 0)
