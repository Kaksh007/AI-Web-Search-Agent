from groq import Groq
from app.config import GROQ_API_KEY
from app.models import Source, SearchResponse
import httpx

client = Groq(api_key=GROQ_API_KEY)


async def web_search(query: str) -> list[dict]:
    async with httpx.AsyncClient() as http:
        r = await http.get(
            "https://api.duckduckgo.com/",
            params={"q": query, "format": "json", "no_redirect": 1},
            timeout=8,
        )
    data = r.json()
    results = []

    if data.get("AbstractText"):
        results.append({
            "title": data.get("Heading", query),
            "url": data.get("AbstractURL", ""),
            "snippet": data["AbstractText"],
        })

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

If the query appears to be a typo or misspelling, interpret it as the closest real word.

Respond in EXACTLY this format with no deviations:

ANSWER:
Write a clear, concise answer (3-5 sentences) based on the context.

CONFIDENCE: <number from 0 to 100 based on how well the search results answered the query>

SOURCES:
- title | url

FOLLOW_UP:
- first follow up question?
- second follow up question?
- third follow up question?
"""

    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=800,
    )

    raw = completion.choices[0].message.content or ""

    # --- Parse ANSWER ---
    answer_part = ""
    if "ANSWER:" in raw:
        after_answer = raw.split("ANSWER:", 1)[1]
        # take everything until the next section
        for section in ["CONFIDENCE:", "SOURCES:", "FOLLOW_UP:"]:
            if section in after_answer:
                after_answer = after_answer.split(section, 1)[0]
        answer_part = after_answer.strip()

    # --- Parse CONFIDENCE ---
    confidence = 0
    if "CONFIDENCE:" in raw:
        conf_line = raw.split("CONFIDENCE:", 1)[1].split("\n", 1)[0]
        digits = "".join(filter(str.isdigit, conf_line))
        confidence = min(int(digits), 100) if digits else 0

    # --- Parse SOURCES ---
    sources = []
    if "SOURCES:" in raw:
        sources_block = raw.split("SOURCES:", 1)[1]
        if "FOLLOW_UP:" in sources_block:
            sources_block = sources_block.split("FOLLOW_UP:", 1)[0]
        for line in sources_block.strip().splitlines():
            line = line.strip().lstrip("-").strip()
            if "|" in line:
                title, url = line.split("|", 1)
                sources.append(Source(title=title.strip(), url=url.strip()))

    # Fallback sources
    if not sources:
        sources = [
            Source(title=r["title"], url=r["url"])
            for r in results if r["url"]
        ]

    # --- Parse FOLLOW_UP ---
    follow_up = []
    if "FOLLOW_UP:" in raw:
        fu_block = raw.split("FOLLOW_UP:", 1)[1].strip()
        for line in fu_block.splitlines():
            line = line.strip().lstrip("-").strip()
            if line and "?" in line:
                follow_up.append(line)

    return SearchResponse(
        answer=answer_part or raw.strip(),
        sources=sources,
        follow_up=follow_up[:3],
        confidence=confidence,
    )