from fastapi import APIRouter
from app.models import SearchRequest, SearchResponse
from app.services.agent import run_agent

router = APIRouter()

@router.post("/search", response_model=SearchResponse)
async def search(req: SearchRequest):
    return await run_agent(req.query)