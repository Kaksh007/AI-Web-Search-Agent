import SourceList from "./SourceList";

export default function ResultCard({ result, query }) {
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
        <span style={{
          fontSize: "12px",
          color: "var(--muted)",
          marginLeft: "auto",
          maxWidth: "50%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          "{query}"
        </span>
      </div>

      {/* Answer body */}
      <div style={{
        padding: "24px 26px",
        fontSize: "14.5px",
        lineHeight: 1.75,
        color: "#d0d0e8",
        whiteSpace: "pre-wrap",
        fontFamily: "'DM Mono', monospace",
        fontWeight: 300,
      }}>
        {result.answer}
      </div>

      {/* Sources */}
      <SourceList sources={result.sources} />
    </div>
  );
}