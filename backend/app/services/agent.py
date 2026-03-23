from groq import Groq
from app.config import GROQ_API_KEY
from app.models import Source, SearchResponse
import httpx, os

client = Groq(api_key=GROQ_API_KEY)

async def web_search(query: str) -> list[dict]:
    """DuckDuckGo instant answer API (free, no key needed)."""
    async with httpx.AsyncClient() as http:
        r = await http.get(
            "https://api.duckduckgo.com/",
            params={"q": query, "format": "json", "no_redirect": 1},
            timeout=8,
        )
    data = r.json()
    results = []

    # Abstract (top summary)
    if data.get("AbstractText"):
        results.append({
            "title": data.get("Heading", query),
            "url": data.get("AbstractURL", ""),
            "snippet": data["AbstractText"],
        })

    # Related topics
    for topic in data.get("RelatedTopics", [])[:4]:
        if "Text" in topic and "FirstURL" in topic:
            results.append({
                "title": topic["Text"][:60],
                "url": topic["FirstURL"],
                "snippet": topic["Text"],
            })
    return results


async def run_agent(query: str) -> SearchResponse:
    results = await web_search(query)

    context = "\n\n".join(
        f"[{i+1}] {r['title']}\n{r['snippet']}\nURL: {r['url']}"
        for i, r in enumerate(results)
    ) or "No web results found."

    prompt = f"""You are an AI search assistant.
User query: {query}

Web search context:
{context}
If the query appears to be a typo or misspelling, interpret it as the closest real word and answer based on that.
Write a clear, concise answer (3–5 sentences) based on the context.
At the end, list sources as:
SOURCES:
- title | url
"""

    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=600,
    )

    raw = completion.choices[0].message.content or ""

    # Parse answer + sources
    if "SOURCES:" in raw:
        answer_part, sources_part = raw.split("SOURCES:", 1)
    else:
        answer_part, sources_part = raw, ""

    sources = []
    for line in sources_part.strip().splitlines():
        line = line.strip().lstrip("-").strip()
        if "|" in line:
            title, url = line.split("|", 1)
            sources.append(Source(title=title.strip(), url=url.strip()))

    # Fallback: use raw search URLs if LLM didn't emit any
    if not sources:
        sources = [
            Source(title=r["title"], url=r["url"])
            for r in results if r["url"]
        ]

    return SearchResponse(answer=answer_part.strip(), sources=sources)