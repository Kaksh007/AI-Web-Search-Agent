const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL;
const API_PORT = process.env.NEXT_PUBLIC_API_PORT || "8000";

function getApiBase() {
  if (API_ORIGIN) return API_ORIGIN.replace(/\/$/, "");
  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:${API_PORT}`;
  }
  return `http://localhost:${API_PORT}`;
}

export const MODES = [
  { value: "ddg+llm",  label: "Web + LLM",  desc: "Search web, answer with AI" },
  { value: "llm-only", label: "LLM Only",    desc: "Pure AI knowledge, no links" },
];

export const MODELS = [
  { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B",    tag: "Best" },
  { value: "llama-3.1-8b-instant",    label: "Llama 3.1 8B",     tag: "Fast" },
  { value: "openai/gpt-oss-120b",     label: "GPT-OSS 120B",     tag: "Smart" },
  { value: "openai/gpt-oss-20b",      label: "GPT-OSS 20B",      tag: "Lite" },
];

export async function search(query, mode = "ddg+llm", model = "llama-3.3-70b-versatile") {
  const res = await fetch(`${getApiBase()}/api/search`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ query, mode, model }),
  });
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}