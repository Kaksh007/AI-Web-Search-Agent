from pydantic import BaseModel
from typing import List

class SearchRequest(BaseModel):
    query: str

class Source(BaseModel):
    title: str
    url: str

class SearchResponse(BaseModel):
    answer: str
    sources: List[Source]