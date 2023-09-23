import os
from os.path import join, abspath, dirname, sep

PROJECT_NAME = "noak"
LOG_LEVEL = "d"

# 경로
ROOT_DIR = os.path.dirname(abspath(__file__))
LOG_DIR = join(ROOT_DIR, "logs")
