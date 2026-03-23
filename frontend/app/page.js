"use client";
import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import ResultCard from "@/components/ResultCard";
import { search } from "@/lib/api";

export default function Home() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  const handleSearch = async (q) => {
    setQuery(q);
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await search(q);
      setResult(data);
      setHistory(prev => [
        { q, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
        ...prev.slice(0, 4),
      ]);
    } catch {
      setError("Something went wrong. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "0 16px 60px",
      position: "relative",
      zIndex: 1,
    }}>
      <div style={{ width: "100%", maxWidth: "820px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <header style={{ padding: "48px 0 36px", textAlign: "center" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--accent)",
            border: "1px solid rgba(124,106,255,0.3)",
            padding: "5px 14px",
            borderRadius: "100px",
            marginBottom: "24px",
          }}>
            <span style={{
              width: "6px", height: "6px",
              borderRadius: "50%",
              background: "var(--accent2)",
              animation: "pulse 2s infinite",
              display: "inline-block",
            }} />
            AI Web Search Agent
          </div>

          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(2rem, 5vw, 3.2rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            marginBottom: "12px",
          }}>
            Search.{" "}
            <span style={{
              background: "linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Think. Answer.
            </span>
          </h1>

          <p style={{ fontSize: "13px", color: "var(--muted)", letterSpacing: "0.02em" }}>
            Powered by Groq + Llama 3
          </p>
        </header>

        {/* Search bar */}
        <SearchBar onSearch={handleSearch} loading={loading} />

        {/* Loading indicator */}
        {loading && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "18px",
            padding: "48px 0",
            textAlign: "center",
          }}>
            <div style={{ display: "flex", gap: "6px" }}>
              {["var(--accent)", "var(--accent2)", "var(--accent3)"].map((color, i) => (
                <div key={i} style={{
                  width: "8px", height: "8px",
                  borderRadius: "50%",
                  background: color,
                  animation: `bounce 1.2s infinite ease-in-out`,
                  animationDelay: `${i * 0.15}s`,
                }} />
              ))}
            </div>
            <div style={{ fontSize: "13px", color: "var(--muted)", fontStyle: "italic" }}>
              Searching the web…
            </div>
            <div style={{ fontSize: "11px", color: "rgba(107,107,138,0.6)", letterSpacing: "0.06em" }}>
              query → web search → context retrieval → synthesis
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(255,107,107,0.07)",
            border: "1px solid rgba(255,107,107,0.2)",
            borderRadius: "12px",
            padding: "20px 24px",
            color: "#ff9a9a",
            fontSize: "13.5px",
            animation: "slideUp 0.3s ease",
            marginTop: "8px",
          }}>
            <strong style={{ fontFamily: "'Syne', sans-serif", display: "block", marginBottom: "4px" }}>
              ⚠ Something went wrong
            </strong>
            {error}
          </div>
        )}

        {/* Result */}
        {result && <ResultCard result={result} query={query} />}

        {/* History */}
        {history.length > 0 && (
          <div style={{ marginTop: "24px" }}>
            <div style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              fontSize: "11px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: "10px",
            }}>
              Recent Queries
            </div>
            {history.map((h, i) => (
              <div
                key={i}
                onClick={() => handleSearch(h.q)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "9px 14px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  marginBottom: "6px",
                  cursor: "pointer",
                  background: "var(--surface)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border-color)"}
              >
                <span style={{
                  fontSize: "12.5px",
                  color: "var(--text)",
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {h.q}
                </span>
                <span style={{ fontSize: "10px", color: "var(--muted)", flexShrink: 0 }}>
                  {h.time}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <footer style={{
          textAlign: "center",
          marginTop: "48px",
          fontSize: "10.5px",
          color: "rgba(107,107,138,0.5)",
          letterSpacing: "0.08em",
        }}>
          Built with Groq + FastAPI + Next.js
        </footer>

      </div>
    </main>
  );
}