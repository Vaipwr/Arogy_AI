import importlib.util
import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(BASE_DIR)
AROGYAI_DIR = os.path.join(REPO_ROOT, "Arogyai-main")

if AROGYAI_DIR not in sys.path:
    sys.path.insert(0, AROGYAI_DIR)

SUB_MAIN = os.path.join(AROGYAI_DIR, "backend", "main.py")

spec = importlib.util.spec_from_file_location("arogyai_backend_main", SUB_MAIN)
module = importlib.util.module_from_spec(spec)
sys.modules["arogyai_backend_main"] = module
spec.loader.exec_module(module)

app = module.app
