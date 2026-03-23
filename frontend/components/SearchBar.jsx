"use client";
import { useState } from "react";

const SUGGESTIONS = [
  "Latest AI news 2026",
  "What is the current price of gold?",
  "Top programming languages 2026",
  "Best electric cars 2026",
];

export default function SearchBar({ onSearch, loading }) {
  const [value, setValue] = useState("");

  const submit = () => { if (value.trim()) onSearch(value.trim()); };

  return (
    <div style={{ margin: "32px 0" }}>
      {/* Search box */}
      <div style={{
        display: "flex",
        background: "var(--surface)",
        border: "1px solid var(--border-color)",
        borderRadius: "14px",
        overflow: "hidden",
        transition: "border-color 0.2s, box-shadow 0.2s",
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

      {/* Suggestion chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "14px" }}>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => { setValue(s); }}
            style={{
              fontSize: "11.5px",
              fontFamily: "'DM Mono', monospace",
              color: "var(--muted)",
              border: "1px solid var(--border-color)",
              borderRadius: "100px",
              padding: "5px 13px",
              cursor: "pointer",
              background: "transparent",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => {
              e.target.style.color = "var(--accent)";
              e.target.style.borderColor = "var(--accent)";
              e.target.style.background = "rgba(124,106,255,0.07)";
            }}
            onMouseLeave={e => {
              e.target.style.color = "var(--muted)";
              e.target.style.borderColor = "var(--border-color)";
              e.target.style.background = "transparent";
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}