#!/usr/bin/env python3
"""Optional cropping of panels from one composite reference image.
No inference of view order: Director explicitly chooses panel labels and boxes.
Usage: python scripts/split_reference_montage.py source.png --panel front:0,0,320,512 --panel side:320,0,640,512 --output-dir out/
"""
import argparse
from pathlib import Path
from PIL import Image

def split(source: Path, panels: list[str], output_dir: Path) -> list[str]:
    output_dir.mkdir(parents=True,exist_ok=True)
    result=[]
    with Image.open(source) as image:
        for spec in panels:
            name,values=spec.split(":",1)
            if name not in {"front","side","side_left","side_right","back","detail"}:
                raise ValueError("Unsupported panel label: "+name)
            coords=tuple(int(v) for v in values.split(","))
            if len(coords)!=4:
                raise ValueError("Each panel requires 4 coordinates: "+spec)
            l,t,r,b=coords
            if not (0<=l<r<=image.width and 0<=t<b<=image.height):
                raise ValueError("Panel rectangle outside image: "+spec)
            path=output_dir/(name+".png")
            if path.exists(): raise FileExistsError(path)
            image.crop(coords).save(path)
            result.append(str(path))
    return result

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("image",type=Path)
    p.add_argument("--panel",action="append",required=True)
    p.add_argument("--output-dir",type=Path,required=True)
    a=p.parse_args()
    print("\n".join(split(a.image,a.panel,a.output_dir)))
