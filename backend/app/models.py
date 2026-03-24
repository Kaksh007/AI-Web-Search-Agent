from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class SearchRequest(BaseModel):
    query: str
    mode: str = "ddg+llm"      # "ddg+llm" | "llm-only"
    model: str = "llama-3.3-70b-versatile"

class Source(BaseModel):
    title: str
    url: str

class SearchResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    answer: str
    sources: List[Source] = []
    follow_up: List[str] = []
    confidence: int = 0
    mode: str = "ddg+llm"
    model_used: str = ""