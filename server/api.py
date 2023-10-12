from server.utils import i, d
import val
import json
import requests


def chatbot_response(text):
    chatbot_response = "챗봇이 응답하지 못했습니다."

    # 서버로 챗봇의 응답 요청
    url = val.FILTERING_SERVER + "/chat"
    data = json.dumps({"text": text})
    headers = {"Content-Type": "application/json; charset=utf-8"}
    response = requests.post(url, data=data, headers=headers)

    if response.status_code == 200:
        chatbot_response = json.loads(response.content.decode("unicode_escape"))["text"]
    return chatbot_response


def sentiment_score(text):
    data = json.dumps({"text": text})
    headers = {"Content-Type": "application/json; charset=utf-8"}
    url = val.FILTERING_SERVER + "/sentiment"
    response = requests.post(url, data=data, headers=headers)

    sentiment_score = 1.0  # 만약 감정 점수를 받아오지 못하면 1.0으로 설정후 순화를 하지 않음
    if response.status_code == 200:
        sentiment_score = json.loads(response.content)["score"]
    return sentiment_score


def refine_text(text):
    headers = {"Content-Type": "application/json; charset=utf-8"}
    url = val.FILTERING_SERVER + "/refine_text"
    data = json.dumps({"text": text})
    response = requests.post(url, data=data, headers=headers)

    refined_text = text
    if response.status_code == 200:
        refined_text = json.loads(response.content)["refined_text"]
    return refined_text


def img_obscenity(img):
    """
    :param img: base64로 인코딩 된 이미지 데이터
    """
    headers = {"Content-Type": "application/json; charset=utf-8"}
    url = val.FILTERING_SERVER + "/img_obscenity"
    data = json.dumps({"img": img})
    response = requests.post(url, data=data, headers=headers)

    is_safe = False
    if response.status_code == 200:
        scores = json.loads(response.content)
        d(scores)
        # 모든 카테고리에서 점수가 IMG_NEGATIVE_THRESHOLD보다 낮으면 True
        is_safe = all([score < val.IMG_NEGATIVE_THRESHOLD for score in scores.values()])
    return is_safe
