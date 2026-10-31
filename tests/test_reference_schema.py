import json
import tempfile
import unittest
from pathlib import Path
from sys import path as sys_path

ROOT = Path(__file__).resolve().parents[1]
sys_path.insert(0, str(ROOT / "scripts"))
from validate_references import validate, PARTS, VIEWS

PNG = bytes.fromhex("89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000b49444154789c636000020000050001a5f645400000000049454e44ae426082")

class ReferenceSchemaTest(unittest.TestCase):
    def test_one_image_sufficient_and_empty_rejected(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder)
            (root/"manifest.json").write_text(json.dumps({"schemaVersion":1,"side":None,"parts":list(PARTS),"views":list(VIEWS)}),encoding="utf-8")
            for part in PARTS:
                (root/part).mkdir()
                for view in VIEWS:
                    (root/part/(view+".png")).write_bytes(PNG)
            present,issues=validate(root)
            self.assertEqual(len(present),15)
            self.assertFalse(issues)
            for part in PARTS:
                for view in VIEWS:
                    if (part, view) != ("head","front"):
                        (root/part/(view+".png")).unlink()
            present,issues=validate(root)
            self.assertEqual(len(present),1)
            self.assertFalse(issues)
            (root/"head"/"front.png").unlink()
            _,issues=validate(root)
            self.assertIn("at least one reference image is required",issues)

if __name__=="__main__": unittest.main()
