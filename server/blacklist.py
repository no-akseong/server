import json

def load():
    # blacklist.json을 열어서 blacklist를 반환
    with open("data/blacklist.json", "r", encoding="utf-8") as f:
        blacklist = json.load(f)
    return blacklist

def save(blacklist):
    # blacklist를 blacklist.json에 저장
    with open("data/blacklist.json", "w", encoding="utf-8") as f:
        json.dump(blacklist, f, ensure_ascii=False, indent='\t')
    
def add(id):
    # blacklist.json에 고객의 아이디("customer1")를 추가
    blacklist = load()
    blacklist["id"].append(id)
    save(blacklist)

def is_in(id):
    # blacklist.json에 고객의 아이디("customer1")가 있는지 여부를 반환
    blacklist = load()
    return id in blacklist["id"]

def remove(id):
    # blacklist.json에 고객의 아이디("customer1")를 삭제
    blacklist = load()
    blacklist["id"].remove(id)
    save(blacklist)

def get():
    # blacklist.json에 있는 모든 고객의 아이디를 반환
    blacklist = load()
    return blacklist["id"]