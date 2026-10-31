"""Render front/side/back images from Blend/GLB/GLTF/FBX/OBJ with orthographic cameras.

Usage: blender -b --python scripts/blender_render_views.py -- --input model.glb --output renders
The side orientation is taken from modeling/reference_images/manifest.json unless overridden.
No Tripo API calls.
"""
import argparse
import json
import sys
from pathlib import Path

argv = sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
parser = argparse.ArgumentParser()
parser.add_argument("--input", type=Path, required=True)
parser.add_argument("--output", type=Path, required=True)
parser.add_argument("--side", choices=("left", "right"), default=None)
parser.add_argument("--manifest", type=Path, default=Path("modeling/reference_images/manifest.json"))
parser.add_argument("--resolution", type=int, default=1024)
parser.add_argument("--ortho-scale", type=float, default=None, help="Fixed shared orthographic scale for comparisons")
parser.add_argument("--camera-center", type=float, nargs=3, default=None, metavar=("X","Y","Z"),
                    help="Fixed shared camera center for comparisons")
args = parser.parse_args(argv)

from mathutils import Vector
import bpy

side = args.side
if side is None:
    if not args.manifest.is_file():
        raise SystemExit("Reference manifest not found; specify --side left|right explicitly")
    side = json.loads(args.manifest.read_text(encoding="utf-8")).get("side")
if side not in (None, "left", "right"):
    raise SystemExit("Invalid side direction")
if args.resolution < 32:
    raise SystemExit("Resolution must be at least 32")

suffix = args.input.suffix.lower()
if suffix == ".blend":
    bpy.ops.wm.open_mainfile(filepath=str(args.input.resolve()))
else:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    if suffix in (".glb", ".gltf"):
        bpy.ops.import_scene.gltf(filepath=str(args.input.resolve()))
    elif suffix == ".fbx":
        bpy.ops.import_scene.fbx(filepath=str(args.input.resolve()))
    elif suffix == ".obj":
        bpy.ops.wm.obj_import(filepath=str(args.input.resolve()))
    else:
        raise SystemExit("Unsupported input format " + suffix)

meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
if not meshes:
    raise SystemExit("No mesh in scene")
corners = [obj.matrix_world @ Vector(corner) for obj in meshes for corner in obj.bound_box]
lower = Vector(tuple(min(v[i] for v in corners) for i in range(3)))
upper = Vector(tuple(max(v[i] for v in corners) for i in range(3)))
extent = upper - lower
if (args.ortho_scale is None) != (args.camera_center is None):
    raise SystemExit("Comparison rendering requires BOTH --ortho-scale and --camera-center")
if args.ortho_scale is not None and args.ortho_scale <= 0:
    raise SystemExit("--ortho-scale must be positive")
if args.ortho_scale is not None:
    # Use the exact same scale and center for every compared candidate.
    center = Vector(args.camera_center)
    camera_scale = args.ortho_scale
else:
    center = (lower + upper) / 2
    camera_scale = max(extent.x, extent.y, extent.z, 0.0001) * 1.15
    print("WARNING: model-dependent framing; do not compare sizes unless --ortho-scale and --camera-center are shared")

scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE_NEXT"
scene.render.resolution_x = args.resolution
scene.render.resolution_y = args.resolution
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"
scene.render.film_transparent = True

world = bpy.data.worlds.new("ReferenceRenderWorld") if not bpy.data.worlds else bpy.data.worlds[0]
scene.world = world
world.use_nodes = True
background = world.node_tree.nodes.get("Background")
if background is not None:
    background.inputs["Strength"].default_value = 0.7

# Simple neutral lighting, identical for every camera direction.
light_data = bpy.data.lights.new("ReviewSoftbox", type="AREA")
light = bpy.data.objects.new("ReviewSoftbox", light_data)
scene.collection.objects.link(light)
light.location = center + Vector((2, -3, 4)) * camera_scale
light_data.energy = 800
light_data.shape = "DISK"
light_data.size = camera_scale * 2

camera_data = bpy.data.cameras.new("ReferenceCamera")
camera = bpy.data.objects.new("ReferenceCamera", camera_data)
scene.collection.objects.link(camera)
scene.camera = camera
camera_data.type = "ORTHO"
camera_data.ortho_scale = camera_scale
views = [("front", (0, -1, 0)), ("back", (0, 1, 0))]
if side is not None:
    views.insert(1, ("side", (1 if side == "right" else -1, 0, 0)))
for name, axis in views:
    camera.location = center + Vector(axis) * max(4.0, camera_scale * 3)
    camera.rotation_euler = (center - camera.location).to_track_quat("-Z", "Y").to_euler()
    path = args.output.resolve() / (name + ".png")
    path.parent.mkdir(parents=True, exist_ok=True)
    scene.render.filepath = str(path)
    bpy.ops.render.render(write_still=True)
    print("RENDERED", name, path)
