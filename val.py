import os
from os.path import join, abspath, dirname, sep

# 설정값
PROJECT_NAME = "nonegative"
LOG_LEVEL = "d"
PORT = 11111
NEGATIVE_THRESHOLD = -0.2
SERVICE_PATIENT_LIMIT = 2 # NEGATIVE_THRESHOLD를 넘었을 때 최대 참을 수 있는 횟수
FILTERING_SERVER_DOMAIN = "localhost"
FILTERING_SERVER_PORT = 11110
FILTERING_SERVER = f"http://{FILTERING_SERVER_DOMAIN}:{FILTERING_SERVER_PORT}"

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
DOCS_VECTOR_DB_DIR = join(DATA_DIR, "docs_vector_db")
