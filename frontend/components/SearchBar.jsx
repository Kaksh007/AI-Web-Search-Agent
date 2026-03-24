"use client";
import { useState } from "react";
import { MODES, MODELS } from "@/lib/api";

const SUGGESTIONS = [
  "Latest AI news 2026",
  "What is the current price of gold?",
  "Top programming languages 2026",
  "Best electric cars 2026",
];

const pill = {
  background: "transparent",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "var(--border-color)",
  borderRadius: "100px",
  padding: "5px 13px",
  cursor: "pointer",
  fontSize: "11.5px",
  fontFamily: "'DM Mono', monospace",
  color: "var(--muted)",
  transition: "all 0.15s",
};

const pillActive = {
  ...pill,
  borderColor: "var(--accent)",
  color: "var(--accent)",
  background: "rgba(124,106,255,0.1)",
};

export default function SearchBar({ onSearch, loading }) {
  const [value,    setValue]    = useState("");
  const [mode,     setMode]     = useState("ddg+llm");
  const [model,    setModel]    = useState("llama-3.3-70b-versatile");
  const [showCfg,  setShowCfg]  = useState(false);

  const submit = () => {
    if (value.trim()) onSearch(value.trim(), mode, model);
  };

  return (
    <div style={{ margin: "32px 0" }}>

      {/* Search input */}
      <div style={{
        display: "flex",
        background: "var(--surface)",
        border: "1px solid var(--border-color)",
        borderRadius: "14px",
        overflow: "hidden",
        transition: "border-color 0.2s",
      }}>
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          placeholder="Ask anything…"
          autoComplete="off"
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            padding: "18px 22px",
            fontFamily: "'DM Mono', monospace",
            fontSize: "14px",
            color: "var(--text)",
            caretColor: "var(--accent)",
          }}
        />

        {/* Config toggle */}
        <button
          onClick={() => setShowCfg(v => !v)}
          title="Model & mode settings"
          style={{
            background: showCfg ? "rgba(124,106,255,0.12)" : "transparent",
            border: "none",
            borderRight: "1px solid var(--border-color)",
            padding: "0 14px",
            cursor: "pointer",
            color: showCfg ? "var(--accent)" : "var(--muted)",
            fontSize: "16px",
            transition: "all 0.15s",
          }}
        >
          ⚙
        </button>

        <button
          onClick={submit}
          disabled={loading}
          style={{
            background: "linear-gradient(135deg, var(--accent), #5b4de8)",
            border: "none",
            padding: "14px 26px",
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: "13px",
            letterSpacing: "0.06em",
            color: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
            margin: "6px",
            borderRadius: "9px",
            opacity: loading ? 0.4 : 1,
            transition: "opacity 0.2s",
            whiteSpace: "nowrap",
          }}
        >
          {loading ? "Searching…" : "↵ Search"}
        </button>
      </div>

      {/* Config panel */}
      {showCfg && (
        <div style={{
          marginTop: "10px",
          background: "var(--surface)",
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          padding: "16px 18px",
          animation: "slideUp 0.2s ease",
        }}>

          {/* Mode selector */}
          <div style={{ marginBottom: "14px" }}>
            <p style={{
              fontSize: "10px",
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: "8px",
            }}>
              Search mode
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {MODES.map(m => (
                <button
                  key={m.value}
                  onClick={() => setMode(m.value)}
                  style={mode === m.value ? pillActive : pill}
                >
                  {m.label}
                  <span style={{
                    marginLeft: "6px",
                    fontSize: "10px",
                    opacity: 0.6,
                  }}>
                    — {m.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Model selector */}
          <div style={{ opacity: mode === "ddg+llm" ? 0.45 : 1, transition: "opacity 0.2s" }}>
            <p style={{
              fontSize: "10px",
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: "8px",
            }}>
              Model
              {mode === "ddg+llm" && (
                <span style={{ fontWeight: 400, textTransform: "none", marginLeft: "8px", fontSize: "9px" }}>
                  (Web mode uses Groq Compound)
                </span>
              )}
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {MODELS.map(m => (
                <button
                  key={m.value}
                  onClick={() => setModel(m.value)}
                  style={{
                    ...(model === m.value ? pillActive : pill),
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {m.label}
                  <span style={{
                    fontSize: "9px",
                    padding: "1px 5px",
                    borderRadius: "4px",
                    background: model === m.value
                      ? "rgba(124,106,255,0.2)"
                      : "rgba(107,107,138,0.15)",
                    color: model === m.value ? "var(--accent)" : "var(--muted)",
                  }}>
                    {m.tag}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Suggestion chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "14px" }}>
        {SUGGESTIONS.map(s => (
          <button
            key={s}
            onClick={() => setValue(s)}
            style={pill}
            onMouseEnter={e => Object.assign(e.target.style, pillActive)}
            onMouseLeave={e => Object.assign(e.target.style, pill)}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}