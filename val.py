import os
from os.path import join, abspath, dirname, sep

# 설정값
PROJECT_NAME = "nonegative"
LOG_LEVEL = "d"

# 루트
ROOT_DIR = os.path.dirname(abspath(__file__))

# log
LOG_DIR = join(ROOT_DIR, "logs")

# api 키
OPENAI_API_KEY_FILE = join(ROOT_DIR, "openai-api-key.txt")
OPENAI_API_KEY = open(OPENAI_API_KEY_FILE).read()

# 리소스
RES_DIR = join(ROOT_DIR, "res")
RES_DOCS_DIR = join(RES_DIR, "docs")

DATA_DIR = join(ROOT_DIR, "data")
CONVERSATIONS_DIR = join(DATA_DIR, "conversations")