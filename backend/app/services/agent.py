from groq import Groq
from app.config import GROQ_API_KEY
from app.models import Source, SearchResponse
import re

client = Groq(api_key=GROQ_API_KEY)

AVAILABLE_MODELS = {
    "llama-3.3-70b-versatile": "Llama 3.3 70B",
    "llama-3.1-8b-instant":    "Llama 3.1 8B",
    "openai/gpt-oss-120b":     "GPT-OSS 120B",
    "openai/gpt-oss-20b":      "GPT-OSS 20B",
}


def _parse_compound_output(raw: str) -> tuple[str, list[Source]]:
    """Parse a Compound response into (clean_answer, sources).

    Expects the model to append a SOURCES: block with '- title | url' lines.
    Falls back gracefully when the block is missing or malformed.
    """
    raw = (raw or "").strip()
    answer = raw
    sources: list[Source] = []
    seen: set[str] = set()

    if "SOURCES:" in raw:
        answer, sources_block = raw.split("SOURCES:", 1)
        for line in sources_block.strip().splitlines():
            line = line.strip().lstrip("-").strip()
            if "|" in line:
                title, url = line.split("|", 1)
                url = url.strip().rstrip(".,;:")
                if url.startswith("http") and url not in seen:
                    seen.add(url)
                    sources.append(Source(title=title.strip(), url=url))

    answer = re.sub(r"\s*【[^\】]*】", "", answer).strip()
    return answer, sources[:8]


def call_llm(prompt: str, model: str) -> str:
    """Single reusable LLM call."""
    if model not in AVAILABLE_MODELS:
        model = "llama-3.3-70b-versatile"

    completion = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
        max_tokens=900,
    )
    return completion.choices[0].message.content or ""


def parse_response(raw: str) -> dict:
    """Parse structured LLM output into answer / confidence / sources / follow_up."""

    answer     = ""
    confidence = 0
    sources    = []
    follow_up  = []

    # ANSWER
    if "ANSWER:" in raw:
        block = raw.split("ANSWER:", 1)[1]
        for stop in ["CONFIDENCE:", "SOURCES:", "FOLLOW_UP:"]:
            if stop in block:
                block = block.split(stop, 1)[0]
        answer = block.strip()

    # CONFIDENCE
    if "CONFIDENCE:" in raw:
        line   = raw.split("CONFIDENCE:", 1)[1].split("\n", 1)[0]
        digits = "".join(filter(str.isdigit, line))
        confidence = min(int(digits), 100) if digits else 0

    # SOURCES
    if "SOURCES:" in raw:
        block = raw.split("SOURCES:", 1)[1]
        if "FOLLOW_UP:" in block:
            block = block.split("FOLLOW_UP:", 1)[0]
        for line in block.strip().splitlines():
            line = line.strip().lstrip("-").strip()
            if "|" in line:
                title, url = line.split("|", 1)
                url = url.strip()
                if url.startswith("http"):
                    sources.append(Source(title=title.strip(), url=url))

    # FOLLOW_UP
    if "FOLLOW_UP:" in raw:
        block = raw.split("FOLLOW_UP:", 1)[1].strip()
        for line in block.splitlines():
            line = line.strip().lstrip("-").strip()
            if line and "?" in line:
                follow_up.append(line)

    return {
        "answer":     answer or raw.strip(),
        "confidence": confidence,
        "sources":    sources,
        "follow_up":  follow_up[:3],
    }


async def run_agent(query: str, mode: str, model: str) -> SearchResponse:

    # ── MODE 1: LLM Only ─────────────────────────────────────────────
    if mode == "llm-only":
        prompt = f"""You are a helpful, knowledgeable AI assistant like ChatGPT or Claude.
Answer the following question thoroughly and accurately from your training knowledge.

Question: {query}

Respond in EXACTLY this format:

ANSWER:
Your detailed answer here (4-6 sentences, be thorough and helpful).

CONFIDENCE: <0-100, how confident you are in your answer>

FOLLOW_UP:
- relevant follow up question 1?
- relevant follow up question 2?
- relevant follow up question 3?
"""
        raw    = call_llm(prompt, model)
        parsed = parse_response(raw)

        return SearchResponse(
            answer     = parsed["answer"],
            sources    = [],
            follow_up  = parsed["follow_up"],
            confidence = parsed["confidence"],
            mode       = "llm-only",
            model_used = AVAILABLE_MODELS.get(model, model),
        )

    # ── MODE 2: Web + LLM  (Groq Compound — built-in web search) ─────
    try:
        completion = client.chat.completions.create(
            model="groq/compound",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an AI search assistant with real-time web access.\n"
                        "Search the web, then answer the user's query accurately "
                        "in 4-6 sentences.\n\n"
                        "After your answer, list the sources you used in EXACTLY this format:\n\n"
                        "SOURCES:\n"
                        "- Page title | https://example.com/article\n"
                        "- Another title | https://example.com/other\n\n"
                        "Always include at least one source. "
                        "Do NOT use citation markers like 【1†L1-L9】."
                    ),
                },
                {"role": "user", "content": query},
            ],
        )

        raw_answer = completion.choices[0].message.content or ""
        answer, sources = _parse_compound_output(raw_answer)
        confidence = 85 if sources else 65

        # Quick follow-up generation with a fast model
        follow_up: list[str] = []
        try:
            fq_raw = call_llm(
                f'Given the query "{query}", suggest exactly 3 brief '
                f"follow-up questions a user might ask next. "
                f"One per line, starting with '- '.",
                "llama-3.1-8b-instant",
            )
            follow_up = [
                line.strip().lstrip("-").strip()
                for line in fq_raw.splitlines()
                if "?" in line
            ][:3]
        except Exception:
            pass

        return SearchResponse(
            answer     = answer,
            sources    = sources,
            follow_up  = follow_up,
            confidence = confidence,
            mode       = "ddg+llm",
            model_used = "Groq Compound",
        )

    except Exception:
        # Fallback: if Compound fails, use chosen model without web search
        prompt = f"""You are a helpful AI assistant.
Answer the following question as accurately as you can.

Question: {query}

Respond in EXACTLY this format:

ANSWER:
Your answer here (4-6 sentences).

CONFIDENCE: <0-100>

FOLLOW_UP:
- follow up question 1?
- follow up question 2?
- follow up question 3?
"""
        raw    = call_llm(prompt, model)
        parsed = parse_response(raw)

        return SearchResponse(
            answer     = parsed["answer"],
            sources    = [],
            follow_up  = parsed["follow_up"],
            confidence = max(parsed["confidence"] - 10, 0),
            mode       = "ddg+llm",
            model_used = AVAILABLE_MODELS.get(model, model),
        )