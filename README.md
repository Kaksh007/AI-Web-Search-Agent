# AI Web Search Agent

A real-time AI search assistant that combines web search with LLM reasoning. Ask any question — the agent searches the web via **Groq Compound**, synthesizes an answer with source citations, and suggests follow-up questions.

Built with **FastAPI** (Python) + **Next.js 16** (React 19) + **Groq API**.

---

## Features

- **Web + LLM mode** — searches the web in real time using Groq Compound, returns an answer with clickable source links
- **LLM-only mode** — answers purely from model knowledge (no web access)
- **Multiple models** — Llama 3.3 70B, Llama 3.1 8B, GPT-OSS 120B, GPT-OSS 20B
- **Follow-up suggestions** — three contextual follow-up questions after every answer
- **Search history** — recent queries displayed for quick re-search
- **Confidence scoring** — visual confidence bar (high / medium / low)
- **Copy to clipboard** — one-click answer copying

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                   Frontend                      │
│           Next.js 16 · React 19                 │
│                                                 │
│  page.js ─► SearchBar ─► ResultCard             │
│                            ├─ SourceList        │
│                            └─ FollowUp buttons  │
│                                                 │
│  lib/api.js  POST /api/search ──────────────┐   │
└─────────────────────────────────────────────┼───┘
                                              │
                                              ▼
┌─────────────────────────────────────────────────┐
│                   Backend                       │
│             FastAPI · Python 3.12               │
│                                                 │
│  main.py ─► routes.py ─► agent.py               │
│                                                 │
│  Modes:                                         │
│   1. LLM-only → Groq chat completions           │
│   2. Web+LLM  → Groq Compound (built-in search)│
│                                                 │
│  agent.py parses the Compound SOURCES: block    │
│  into structured Source(title, url) objects      │
└─────────────────────────────────────────────────┘
```

### Request flow

1. User types a query and picks a mode/model in the frontend
2. Frontend `POST`s `{ query, mode, model }` to `/api/search`
3. Backend `run_agent()` dispatches to the selected mode:
   - **LLM-only**: calls `call_llm()` with a structured prompt, parses `ANSWER / CONFIDENCE / SOURCES / FOLLOW_UP` blocks
   - **Web+LLM**: calls Groq Compound with a system prompt that forces a `SOURCES:` block, then `_parse_compound_output()` splits the answer from the source list
4. Response returns `{ answer, sources[], follow_up[], confidence, mode, model_used }`
5. Frontend renders the answer card, source links, follow-ups, and history

### Key files

| Path | Purpose |
|---|---|
| `backend/main.py` | FastAPI app + CORS setup |
| `backend/app/api/routes.py` | `POST /api/search` endpoint |
| `backend/app/services/agent.py` | Agent logic: LLM calls, Compound integration, response parsing |
| `backend/app/models.py` | Pydantic models (`SearchRequest`, `SearchResponse`, `Source`) |
| `backend/app/config.py` | Loads `GROQ_API_KEY` from `.env` |
| `frontend/app/page.js` | Main page: search bar, results, history |
| `frontend/components/SearchBar.jsx` | Search input, mode/model selector, suggestion chips |
| `frontend/components/ResultCard.jsx` | Answer card with confidence bar, copy button |
| `frontend/components/SourceList.jsx` | Clickable source links extracted from the response |
| `frontend/lib/api.js` | API client, mode/model constants |

---

## Setup Instructions

### Prerequisites

- **Python 3.12+**
- **Node.js 18+** (with npm)
- A **Groq API key** — get one free at [console.groq.com](https://console.groq.com)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/AI-Web-Search-Agent.git
cd AI-Web-Search-Agent
```

### 2. Backend setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:

```
GROQ_API_KEY=gsk_your_key_here
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

### 4. Run the project

Open **two terminals**:

**Terminal 1 — Backend** (runs on port 8000):

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 — Frontend** (runs on port 3000):

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Dependencies

### Backend (`backend/requirements.txt`)

| Package | Version | Purpose |
|---|---|---|
| FastAPI | 0.116.0 | Async web framework for the REST API |
| Uvicorn | 0.30.6 | ASGI server to run FastAPI |
| Groq | 1.1.1 | Official Groq Python SDK (LLM + Compound) |
| python-dotenv | 1.0.1 | Load `.env` variables |
| Pydantic | 2.9.2 | Request/response data validation |

### Frontend (`frontend/package.json`)

| Package | Version | Purpose |
|---|---|---|
| Next.js | 16.2.1 | React framework (App Router) |
| React | 19.2.4 | UI library |
| Tailwind CSS | 4.x | Utility-first CSS |
| Lucide React | 0.577.0 | Icon set |
| Radix UI | 1.4.3 | Accessible primitives |
| shadcn | 4.1.0 | Component system |

---

## Design Decisions & Trade-offs

### Groq Compound for web search

Instead of managing a separate search API (e.g. DuckDuckGo, SerpAPI), the agent delegates web search to **Groq Compound** — a model that has built-in web access. This removes an entire service dependency at the cost of less control over which URLs are fetched.

### Prompt-driven source extraction

Compound's SDK does not reliably expose the URLs it visits via `executed_tools`. Instead, the system prompt instructs Compound to append a structured `SOURCES:` block (`- title | url`) at the end of every response. The backend parser `_parse_compound_output()` splits the answer from this block and extracts typed `Source` objects. This is simple, deterministic, and works regardless of SDK internals.

### Two-mode architecture

- **Web+LLM** always routes through Groq Compound (ignoring the user's model choice) because only Compound has web access.
- **LLM-only** lets the user pick any model for pure knowledge-based answers.

This keeps the API surface small (one endpoint, one request schema) while supporting both use cases.

### Frontend source fallback

`SourceList.jsx` includes a regex fallback that extracts URLs directly from the answer text. If the backend's structured `sources[]` is empty for any reason, the UI still attempts to show links. This layered approach ensures sources are visible even when the prompt-based extraction misses.

### No database

Search history lives in React state (client-side only). This is intentional — the agent is stateless and needs no persistence. Adding a database would increase deployment complexity with minimal benefit for a search tool.

### Confidence heuristic

Confidence is not a true probability. Web+LLM mode assigns 85 if sources were found, 65 otherwise. LLM-only mode lets the model self-report confidence. This is a UX signal, not a calibrated metric.
