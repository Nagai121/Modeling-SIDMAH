import tempfile
import unittest
from pathlib import Path
from sys import path as sys_path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
sys_path.insert(0,str(ROOT/"scripts"))
from validate_references import validate
from split_reference_montage import split

class MontageTest(unittest.TestCase):
    def test_single_montage_and_optional_panels(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d)
            inbox=root/"inbox"
            inbox.mkdir()
            montage=inbox/"multi.png"
            Image.new("RGB",(300,100),(255,255,255)).save(montage)
            found,errors=validate(root)
            self.assertEqual(len(found),1)
            self.assertEqual(errors,[])
            out=root/"panels"
            paths=split(montage,["front:0,0,100,100","side:100,0,200,100","back:200,0,300,100"],out)
            self.assertEqual(len(paths),3)
            for path in paths:
                with Image.open(path) as image:self.assertEqual(image.size,(100,100))
    def test_invalid_manifest_is_reported_as_error(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d)
            (root/"manifest.json").write_text("null")
            (root/"test.png").write_bytes(bytes.fromhex("89504e470d0a1a0a") + b"0"*32)
            _,errors=validate(root)
            self.assertTrue(any("manifest" in e for e in errors))

if __name__=="__main__":unittest.main()
