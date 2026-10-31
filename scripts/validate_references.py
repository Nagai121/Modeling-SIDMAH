#!/usr/bin/env python3
"""Validate any one or more image references, including a single multi-view montage."""
from __future__ import annotations
import json
import sys
from pathlib import Path

PARTS=("head","upper_body","lower_body","accessories","whole")
VIEWS=("front","side","back")
EXTS={".png",".jpg",".jpeg",".webp"}
MAGIC={".png":b"\x89PNG\r\n\x1a\n",".jpg":b"\xff\xd8\xff",".jpeg":b"\xff\xd8\xff",".webp":b"RIFF"}

def validate(root: Path):
    files,errors=[],[]
    manifest=root/"manifest.json"
    if manifest.is_file():
        try:
            obj=json.loads(manifest.read_text(encoding="utf8"))
            if not isinstance(obj,dict):
                raise ValueError("manifest must be an object")
            if obj.get("schemaVersion")!=1: errors.append("manifest schemaVersion must be 1")
            if obj.get("side") not in (None,"left","right"): errors.append("side must be null, left or right")
            if obj.get("parts",list(PARTS))!=list(PARTS):errors.append("invalid part slots")
            if obj.get("views",list(VIEWS))!=list(VIEWS):errors.append("invalid view slots")
        except (OSError,ValueError,TypeError) as err:
            errors.append(f"invalid manifest: {err}")
    candidates=[]
    if root.exists():
        candidates.extend(p for p in root.iterdir() if p.is_file() and p.suffix.lower() in EXTS)
        for name in (*PARTS,"inbox"):
            directory=root/name
            if directory.is_symlink():
                errors.append(f"symlink directory: {directory}")
                continue
            if directory.is_dir():
                candidates.extend(p for p in directory.iterdir() if p.suffix.lower() in EXTS)
    for image in sorted(candidates):
        try:
            if image.is_symlink() or not image.is_file():
                raise ValueError("symlink or non-file")
            if image.stat().st_size<16:
                raise ValueError("image too small")
            with image.open("rb") as fh: sig=fh.read(16)
            ext=image.suffix.lower()
            if not sig.startswith(MAGIC[ext]) or (ext==".webp" and sig[8:12]!=b"WEBP"):
                raise ValueError("image signature invalid")
            files.append(str(image))
        except (OSError,ValueError) as err:
            errors.append(f"{image}: {err}")
    if not files:errors.append("at least one reference image is required")
    return files,errors

if __name__=="__main__":
    root=Path(sys.argv[1] if len(sys.argv)>1 else "modeling/reference_images")
    found,issues=validate(root)
    print(json.dumps({"ok":not issues,"found":len(found),"minimum":1,"files":found,"issues":issues},ensure_ascii=False,indent=2))
    raise SystemExit(1 if issues else 0)
