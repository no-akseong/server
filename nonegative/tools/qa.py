from typing import Any

from langchain.chains import RetrievalQA
from langchain.chains.retrieval_qa.base import BaseRetrievalQA
from langchain.document_loaders import DirectoryLoader
from langchain.document_loaders import TextLoader
from langchain.embeddings import OpenAIEmbeddings
from langchain.llms import OpenAI
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.tools import BaseTool
from langchain.vectorstores import Chroma

import nonegative.utils as utils
import val
import os

os.environ["OPENAI_API_KEY"] = val.OPENAI_API_KEY


def qa_chain():
    # encoding 자동 감지
    text_loader_kwargs = {"autodetect_encoding": True}
    loader = DirectoryLoader(
        val.RES_DOCS_DIR,
        glob="./*.md",
        loader_cls=TextLoader,
        loader_kwargs=text_loader_kwargs,
    )
    documents = loader.load()

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    texts = text_splitter.split_documents(documents)

    # persist_directory = val.DOCS_VECTOR_DB_DIR
    embedding = OpenAIEmbeddings()

    vectordb = Chroma.from_documents(documents=texts, embedding=embedding)

    # 검색기 생성 (search_kwargs: 참조 문서 개수)
    retriever = vectordb.as_retriever(search_kwargs={"k": 1})

    # chain 생성
    qa_chain = RetrievalQA.from_chain_type(
        llm=OpenAI(),  # 단순 completion
        chain_type="stuff",
        retriever=retriever,
    )
    return qa_chain


class QATool(BaseTool):
    name = "Retrieval QA"
    description = "Useful for when you need to answer questions about school related things."
    qa_chain = qa_chain()

    def __init__(self, **data: Any):
        super().__init__(**data)

    def _run(self, webpage: str):
        return self.qa_chain.run(webpage)

    def _arun(self, webpage: str):
        raise NotImplementedError("This tool does not support async")

    def details(self, llm_response):
        print(llm_response["result"])
        print("\n\nSources:")
        for source in llm_response["source_documents"]:
            print(source.metadata["source"])
