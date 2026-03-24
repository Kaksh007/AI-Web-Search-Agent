"use client";
import { useState } from "react";
import SourceList from "./SourceList";

function ConfidenceBar({ score }) {
  const color =
    score >= 75 ? "var(--accent2)" :
      score >= 40 ? "#f59e0b" :
        "var(--accent3)";

  const label =
    score >= 75 ? "High confidence" :
      score >= 40 ? "Medium confidence" :
        "Low confidence";

  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "6px",
      }}>
        <span style={{ fontSize: "11px", color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {label}
        </span>
        <span style={{ fontSize: "11px", color, fontFamily: "'DM Mono', monospace" }}>
          {score}%
        </span>
      </div>
      <div style={{
        height: "3px",
        background: "var(--border-color)",
        borderRadius: "2px",
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          width: `${score}%`,
          background: color,
          borderRadius: "2px",
          transition: "width 0.8s ease",
        }} />
      </div>
    </div>
  );
}

export default function ResultCard({ result, query, onFollowUp }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border-color)",
      borderRadius: "16px",
      overflow: "hidden",
      animation: "slideUp 0.4s ease",
      marginTop: "8px",
    }}>

      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "16px 22px",
        borderBottom: "1px solid var(--border-color)",
        background: "rgba(124,106,255,0.04)",
      }}>
        <span style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 700,
          fontSize: "12px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--accent)",
        }}>
          ✦ Answer
        </span>
        {/* Mode + model badge */}
        <span style={{
          fontSize: "10px",
          fontFamily: "'DM Mono', monospace",
          color: "var(--muted)",
          background: "rgba(107,107,138,0.1)",
          border: "1px solid var(--border-color)",
          borderRadius: "4px",
          padding: "2px 7px",
          flexShrink: 0,
        }}>
          {result.mode === "llm-only" ? "LLM only" : "Web + LLM"} · {result.model_used}
        </span>
        <span style={{
          fontSize: "12px",
          color: "var(--muted)",
          marginLeft: "auto",
          maxWidth: "40%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          "{query}"
        </span>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          title="Copy answer"
          style={{
            background: copied ? "rgba(0,212,170,0.15)" : "rgba(124,106,255,0.1)",
            border: `1px solid ${copied ? "rgba(0,212,170,0.4)" : "rgba(124,106,255,0.2)"}`,
            borderRadius: "6px",
            padding: "4px 10px",
            fontSize: "11px",
            fontFamily: "'DM Mono', monospace",
            color: copied ? "var(--accent2)" : "var(--accent)",
            cursor: "pointer",
            transition: "all 0.2s",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>

      {/* Answer body */}
      <div style={{ padding: "24px 26px 16px" }}>

        {/* Confidence bar */}
        {result.confidence > 0 && (
          <ConfidenceBar score={result.confidence} />
        )}

        <p style={{
          fontSize: "14.5px",
          lineHeight: 1.75,
          color: "#d0d0e8",
          whiteSpace: "pre-wrap",
          fontFamily: "'DM Mono', monospace",
          fontWeight: 300,
          margin: 0,
        }}>
          {result.answer}
        </p>
      </div>

      {/* Sources */}
      <SourceList
        sources={result.sources}
        answer={result.answer}
        mode={result.mode}
      />

      {/* Follow-up questions */}
      {result.follow_up?.length > 0 && (
        <div style={{
          borderTop: "1px solid var(--border-color)",
          padding: "18px 22px",
        }}>
          <div style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            Ask next
            <span style={{ flex: 1, height: "1px", background: "var(--border-color)" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {result.follow_up.map((q, i) => (
              <button
                key={i}
                onClick={() => onFollowUp(q)}
                style={{
                  background: "transparent",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  textAlign: "left",
                  fontSize: "13px",
                  fontFamily: "'DM Mono', monospace",
                  color: "var(--text)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.background = "rgba(124,106,255,0.05)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "var(--border-color)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <span style={{ color: "var(--accent)", fontSize: "12px", flexShrink: 0 }}>→</span>
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}