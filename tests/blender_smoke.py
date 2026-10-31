"""CI-only Blender modeling smoke test, separate from production Field Control."""
import sys
from pathlib import Path
import bpy
args=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
if len(args)!=2 or args[0]!="--out":
    raise SystemExit("Expected --out directory")
folder=Path(args[1]);folder.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
mesh=bpy.data.meshes.new("FromScratchTestGeometry")
mesh.from_pydata([(-.5,-.5,0),(.5,-.5,0),(.5,.5,0),(-.5,.5,0), (0,0,1)],
                 [],[(0,1,4),(1,2,4),(2,3,4),(3,0,4),(3,2,1,0)])
mesh.update()
obj=bpy.data.objects.new("FromScratchTestObject",mesh)
bpy.context.collection.objects.link(obj)
assert obj.type=="MESH" and len(mesh.polygons)==5
bpy.ops.wm.save_as_mainfile(filepath=str(folder/"mesh.blend"))
print("Blender generated mesh from scratch:", len(mesh.vertices),"vertices",len(mesh.polygons),"polygons")
