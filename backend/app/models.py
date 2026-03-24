from pydantic import BaseModel
from typing import List, Optional

class SearchRequest(BaseModel):
    query: str

class Source(BaseModel):
    title: str
    url: str

class SearchResponse(BaseModel):
    answer: str
    sources: List[Source]
    follow_up: List[str] = []
    confidence: int = 0