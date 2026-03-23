export default function SourceList({ sources }) {
  if (!sources?.length) return null;

  return (
    <div style={{
      borderTop: "1px solid var(--border-color)",
      padding: "18px 22px",
    }}>
      {/* Title */}
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
        Sources Used
        <span style={{ flex: 1, height: "1px", background: "var(--border-color)" }} />
      </div>

      {/* Source items */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {sources.map((s, i) => {
          let domain = s.url;
          try { domain = new URL(s.url).hostname.replace("www.", ""); } catch {}

          return (
            <a
              key={i}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "10px 14px",
                background: "var(--source-bg)",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                textDecoration: "none",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.background = "rgba(124,106,255,0.05)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "var(--border-color)";
                e.currentTarget.style.background = "var(--source-bg)";
              }}
            >
              {/* Number badge */}
              <span style={{
                fontSize: "10px",
                fontFamily: "'DM Mono', monospace",
                color: "var(--accent)",
                border: "1px solid rgba(124,106,255,0.3)",
                borderRadius: "4px",
                padding: "2px 6px",
                flexShrink: 0,
                marginTop: "1px",
              }}>
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Title + URL */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: "13px",
                  color: "var(--text)",
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  marginBottom: "2px",
                }}>
                  {s.title || domain}
                </div>
                <div style={{
                  fontSize: "11px",
                  color: "var(--muted)",
                  fontFamily: "'DM Mono', monospace",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {s.url}
                </div>
              </div>

              {/* Arrow */}
              <span style={{ color: "var(--muted)", fontSize: "14px", flexShrink: 0, marginTop: "3px" }}>↗</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}