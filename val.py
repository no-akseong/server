import os
from os.path import join, abspath, dirname, sep

# 설정값
PROJECT_NAME = "nonegative"
LOG_LEVEL = "d"
PORT = 11111
TEXT_NEGATIVE_THRESHOLD = -0.2
IMG_NEGATIVE_THRESHOLD = 3
SERVICE_PATIENT_LIMIT = 1 # NEGATIVE_THRESHOLD를 넘었을 때 최대 참을 수 있는 횟수
FILTERING_SERVER_DOMAIN = "localhost"
FILTERING_SERVER_PORT = 11110
FILTERING_SERVER = f"http://{FILTERING_SERVER_DOMAIN}:{FILTERING_SERVER_PORT}"
TEST_CUSTOMER_ID = "customer1"


# 루트
ROOT_DIR = os.path.dirname(abspath(__file__))

# log
LOG_DIR = join(ROOT_DIR, "logs")

# data
DATA_DIR = join(ROOT_DIR, "data")
CONVERSATIONS_DIR = join(DATA_DIR, "conversations")
