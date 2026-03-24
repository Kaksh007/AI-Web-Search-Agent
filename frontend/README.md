# 🔍 AI Web Search Agent

> A full-stack AI-powered search agent that retrieves live web data and synthesizes intelligent answers using LLMs — built with FastAPI, Next.js, and Groq.

![Tech Stack](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)
![Tech Stack](https://img.shields.io/badge/Frontend-Next.js_15-000000?style=flat-square&logo=nextdotjs)
![Tech Stack](https://img.shields.io/badge/LLM-Groq_%2B_Llama_3-F55036?style=flat-square)
![Tech Stack](https://img.shields.io/badge/UI-Tailwind_%2B_shadcn-06B6D4?style=flat-square&logo=tailwindcss)
![Tech Stack](https://img.shields.io/badge/Search-DuckDuckGo_API-DE5833?style=flat-square)

---

## 📸 Preview

```
┌─────────────────────────────────────────────┐
│  ✦ AI Web Search Agent                      │
│                                             │
│  Search. Think. Answer.                     │
│  ─────────────────────────────────────────  │
│  [ Ask anything...              ] [Search]  │
│                                             │
│  ✦ ANSWER  "latest MacBook specs 2026"      │
│  ─────────────────────────────────────────  │
│  Recent MacBook Pro models feature...       │
│                                             │
│  SOURCES USED ─────────────────────────     │
│  01  apple.com                     ↗        │
│  02  theverge.com                  ↗        │
└─────────────────────────────────────────────┘
```

---

## ✨ Features

- **Live Web Search** — Queries DuckDuckGo's API in real time, no stale data
- **LLM Synthesis** — Llama 3 (70B) via Groq reads search results and writes a grounded answer
- **Source Attribution** — Every answer links back to its sources
- **RAG Pattern** — Retrieval-Augmented Generation: web results injected directly into the prompt
- **Follow-up Suggestions** — Agent suggests related questions after each answer
- **Search History** — Recent queries tracked in session for quick re-access
- **Dark UI** — Custom dark theme with grid background, gradient headings, animated loader
- **Network Ready** — Backend listens on `0.0.0.0`, accessible across local network

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     USER BROWSER                        │
│                                                         │
│   Next.js 15 (App Router) — localhost:3000              │
│   ┌──────────────┐  ┌─────────────┐  ┌──────────────┐  │
│   │  SearchBar   │  │ ResultCard  │  │  SourceList  │  │
│   │  .jsx        │  │ .jsx        │  │  .jsx        │  │
│   └──────┬───────┘  └──────┬──────┘  └──────────────┘  │
│          │    page.jsx     │                            │
│          │    lib/api.js   │                            │
└──────────┼─────────────────┼────────────────────────────┘
           │  POST /api/search  { query }
           ▼
┌─────────────────────────────────────────────────────────┐
│                   FASTAPI BACKEND                        │
│                   localhost:8000                         │
│                                                         │
│   main.py → routes.py → agent.py                        │
│                                                         │
│   agent.py                                              │
│   ┌─────────────────────────────────────────────────┐   │
│   │  1. web_search(query)                           │   │
│   │        └─► DuckDuckGo Instant Answer API        │   │
│   │                                                 │   │
│   │  2. build_prompt(query + search_results)        │   │
│   │        └─► RAG: inject snippets as context      │   │
│   │                                                 │   │
│   │  3. groq_client.chat.completions.create(...)    │   │
│   │        └─► Groq API → Llama 3 (70B)             │   │
│   │                                                 │   │
│   │  4. parse_response(raw_text)                    │   │
│   │        └─► split answer + sources               │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│   Returns: { answer: "...", sources: [...] }            │
└─────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────┐   ┌─────────────────────────┐
│   Groq Cloud API     │   │  DuckDuckGo API          │
│   llama-3.3-70b      │   │  (free, no key needed)   │
└──────────────────────┘   └─────────────────────────┘
```

---

## 📁 Project Structure

```
AI-Web-Search-Agent/
│
├── backend/                        # FastAPI backend
│   ├── main.py                     # App entry point, CORS middleware
│   ├── requirements.txt            # Python dependencies
│   ├── .env                        # API keys (never committed)
│   ├── .gitignore
│   └── app/
│       ├── config.py               # Loads env variables
│       ├── models.py               # Pydantic request/response schemas
│       ├── api/
│       │   └── routes.py           # POST /api/search endpoint
│       └── services/
│           └── agent.py            # Core agent: search + LLM + parse
│
├── frontend/                       # Next.js 15 frontend
│   ├── app/
│   │   ├── page.jsx                # Main page, state management
│   │   ├── layout.jsx              # Root layout, metadata
│   │   └── globals.css             # Global styles + CSS variables
│   ├── components/
│   │   ├── SearchBar.jsx           # Input + submit + suggestion chips
│   │   ├── ResultCard.jsx          # Answer display container
│   │   └── SourceList.jsx          # Clickable source links
│   ├── lib/
│   │   └── api.js                  # fetch() wrapper for backend calls
│   ├── .env.local                  # Frontend env (API URL)
│   ├── jsconfig.json               # Path alias (@/) config
│   └── package.json
│
└── README.md
```

---

## 🚀 Setup & Running Locally

### Prerequisites

- Python 3.10+
- Node.js 18+
- A free [Groq API key](https://console.groq.com)

---

### 1. Clone the repository

```bash
git clone https://github.com/Kaksh007/AI-Web-Search-Agent.git
cd AI-Web-Search-Agent
```

---

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo GROQ_API_KEY=your_groq_api_key_here > .env
```

Start the backend:
```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
echo NEXT_PUBLIC_API_URL=http://localhost:8000 > .env.local
```

Start the frontend:
```bash
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

### 4. Test the API directly

```bash
curl -X POST http://localhost:8000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "What are the latest AI models in 2026?"}'
```

Expected response:
```json
{
  "answer": "In 2026, the AI landscape has seen...",
  "sources": [
    { "title": "OpenAI Blog", "url": "https://openai.com/..." },
    { "title": "Google DeepMind", "url": "https://deepmind.google/..." }
  ]
}
```

---

## 📦 Dependencies

### Backend

| Package | Version | Purpose |
|---|---|---|
| `fastapi` | latest | Web framework, auto API docs |
| `uvicorn[standard]` | latest | ASGI server |
| `groq` | latest | Groq SDK for LLM calls |
| `httpx` | latest | Async HTTP client for web search |
| `pydantic` | v2 | Request/response data validation |
| `python-dotenv` | latest | Load `.env` variables |

### Frontend

| Package | Purpose |
|---|---|
| `next` 15 | React framework, App Router |
| `react` 19 | UI library |
| `tailwindcss` | Utility-first CSS |
| `shadcn/ui` | Accessible component library (Radix UI) |

---

## 🧠 Design Decisions & Trade-offs

### 1. DuckDuckGo over paid search APIs
**Decision:** Used DuckDuckGo's free Instant Answer API instead of Tavily or SerpAPI.

**Trade-off:** DuckDuckGo returns less results for vague/misspelled queries. Paid APIs like Tavily return richer, more structured results. However, DuckDuckGo requires zero setup, no API key, and is sufficient for a proof-of-concept agent.

**Mitigation:** Prompt instructs the LLM to auto-correct typos and interpret the closest valid query.

---

### 2. Groq over OpenAI
**Decision:** Used Groq's inference API with Llama 3 (70B) instead of OpenAI GPT-4.

**Trade-off:** Groq is significantly faster (low-latency inference) and free-tier friendly. The trade-off is slightly less instruction-following reliability compared to GPT-4, mitigated by a well-structured prompt.

---

### 3. RAG via prompt injection (no vector DB)
**Decision:** Search results are injected directly into the prompt as text context rather than using embeddings + a vector database.

**Trade-off:** This approach is simpler and faster to build, works well for short search snippets, and has no infrastructure overhead. The limitation is that it doesn't scale to hundreds of documents — a vector DB (like Chroma or Pinecone) would be needed for that. For a real-time web search agent with 3-5 results, prompt injection is the right call.

---

### 4. Structured output via prompt formatting
**Decision:** LLM is instructed to output `SOURCES:` as a delimiter, which is then parsed with `split("SOURCES:", 1)`.

**Trade-off:** Simpler than JSON mode or function calling but slightly brittle — if the LLM ignores the format, sources come back empty. Mitigated by a fallback that uses the raw search URLs when LLM-parsed sources are empty.

---

### 5. Monorepo structure (backend + frontend together)
**Decision:** Both services live in one repository.

**Trade-off:** Easier to clone, run, and review for a project of this scale. In production, separate repos with CI/CD pipelines per service would be preferred.

---

## 🔮 Future Improvements

- [ ] **Streaming responses** — stream LLM tokens to the frontend for faster perceived performance
- [ ] **Tavily API integration** — richer search results with better snippet quality
- [ ] **Multi-turn conversation** — maintain chat history for follow-up questions
- [ ] **Model selector** — let user switch between Llama 3 8B (fast) and 70B (quality)
- [ ] **Redis caching** — cache repeated queries to reduce API calls and latency
- [ ] **Docker Compose** — single `docker-compose up` to run both services

---

## 📄 License

MIT — free to use, modify, and distribute.

---

*Built as part of the Slooze AI Agent Technical Challenge.*