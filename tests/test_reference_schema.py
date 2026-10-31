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
    def test_15_images_required(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder)
            (root/"manifest.json").write_text(json.dumps({"schemaVersion":1,"side":"right","parts":list(PARTS),"views":list(VIEWS)}),encoding="utf-8")
            for part in PARTS:
                (root/part).mkdir()
                for view in VIEWS:
                    (root/part/(view+".png")).write_bytes(PNG)
            present,issues=validate(root)
            self.assertEqual(len(present),15)
            self.assertFalse(issues)
            (root/"head"/"back.png").unlink()
            _,issues=validate(root)
            self.assertTrue(issues)

if __name__=="__main__": unittest.main()
