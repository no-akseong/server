import json
import os
from langchain.prompts import ChatPromptTemplate, HumanMessagePromptTemplate
from nonegative.utils import i, d
import val
from langchain.memory import ConversationBufferWindowMemory, ConversationSummaryMemory, ChatMessageHistory, \
    ConversationSummaryBufferMemory
from langchain.chains import ConversationChain
import time
from typing import Any
from langchain.callbacks.base import BaseCallbackHandler
from langchain.chat_models import ChatOpenAI
from langchain.schema import (
    AIMessage,
    HumanMessage,
    SystemMessage, LLMResult
)


class StreamHandler(BaseCallbackHandler):
    def __init__(self):
        self.stream = ""
        self.start = time.time()

    def on_llm_new_token(self, token: str, **kwargs) -> None:
        self.stream += token
        current = time.time()
        if current - self.start > 1:
            self.start = current
            self.stream = ""

    def on_llm_end(self, response: LLMResult, **kwargs: Any) -> Any:
        self.stream = ""


class Chatbot:
    def __init__(self, id):
        self.id = id
        self.conversation_chain = None
        self.setup()

    def load_conversation(self):
        """
        - data/conversations 폴더 안에 {id}.json 파일이 있으면 불러오고
         없으면 사용자의 대화기록을 저장할 폴더를 생성한다.
         user_id.json 파일 형식:
         {"id": <user_id>,
         "conversation": [{Human: <human_msg>, AI: <ai_msg>}, ...]}
        """
        conv_dir = val.CONVERSATIONS_DIR
        conv_file = os.path.join(conv_dir, f"{self.id}.json")

        # 파일이 있는지 체크후 없으면 생성
        if not os.path.exists(conv_file):
            with open(conv_file, "w", encoding='utf-8') as f:
                data = {"id": self.id, "conversation": []}
                f.write(json.dumps(data, indent='\t', ensure_ascii=False))

        # 대화기록 불러오기
        with open(conv_file, "r", encoding='utf-8') as f:
            data = json.load(f)

        return data["conversation"]

    def setup(self):
        # 불러온 대화기록 끝에서 5개 대화쌍까지만 {history}에 넣기
        conversation_history = self.load_conversation()[-5:]
        conversation_history = "\n".join([f"Human: {msg['Human']}\nAI: {msg['AI']}" for msg in conversation_history])
        # d(f"conversation_history: {conversation_history}")

        system_msg = """

The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

Current conversation:
{history}
Human: {input}
AI:
"""

        messages = [
            ("system", system_msg),
        ]

        template = ChatPromptTemplate.from_messages(messages)

        llm = ChatOpenAI(
            model_name='gpt-3.5-turbo',
            temperature=0.7,
            # openai_api_key=self.api_key,
            callbacks=[StreamHandler()],
            streaming=True,
        )

        self.conversation_chain = ConversationChain(
            prompt=template,
            llm=llm,
            memory=ConversationBufferWindowMemory(k=5),
            verbose=True,
        )


    def chat(self, msg):
        response = self.conversation_chain.predict(input=msg)
        # 대화기록 파일에 저장
        self.save_conversation({"Human": msg, "AI": response})
        return response

    def save_conversation(self, conversation):
        conv_dir = val.CONVERSATIONS_DIR
        conv_file = os.path.join(conv_dir, f"{self.id}.json")
        with open(conv_file, "r", encoding='utf-8') as f:
            data = json.load(f)
            data["conversation"].append(conversation)
        with open(conv_file, "w", encoding='utf-8') as f:
            f.write(json.dumps(data, indent='\t', ensure_ascii=False))
