import useCustomCursor from "../../hooks/useCustomCursor";

/**
 * Global custom cursor.
 *
 * Default  — 4-segment dashed ring + 4px dot (mix-blend-mode: exclusion)
 * Hover    — solid filled ring, dot hidden. Signals "this is clickable."
 * Click    — ring shrinks for pulse feedback.
 *
 * mix-blend-mode: exclusion inverts on both light (#cbd4cc) and dark (#0a0c10) bgs.
 */
export default function CustomCursor() {
  const { ringRef, dotRef } = useCustomCursor();

  // Dashed ring geometry
  const r     = 16;
  const circ  = 2 * Math.PI * r; // ≈ 100.53
  const dash  = circ / 8;        // 4 equal segments + 4 equal gaps

  return (
    <>
      {/* ── Outer ring ─────────────────────────────────────────────── */}
      <div
        ref={ringRef}
        data-state="default"
        className="pointer-events-none fixed top-0 left-0 z-[10000] hidden [@media(pointer:fine)]:block"
        style={{
          width:      36,
          height:     36,
          marginLeft: -18,
          marginTop:  -18,
          mixBlendMode: "exclusion",
          willChange: "left, top, width, height",
          transition: "width 140ms ease, height 140ms ease, margin 140ms ease",
        }}
      >
        {/*
          Two SVG layers share the same viewport:
          1. Dashed ring  — visible in default state
          2. Solid circle — visible in hover/click states
          We toggle opacity via CSS data-attribute selectors defined below.
        */}
        <svg
          width="100%" height="100%"
          viewBox="0 0 36 36"
          style={{ overflow: "visible", display: "block", position: "absolute", inset: 0 }}
          className="cursor-dashed"
        >
          <circle
            cx="18" cy="18" r={r}
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeDasharray={`${dash} ${dash}`}
            strokeDashoffset={dash / 2}
            strokeLinecap="butt"
          />
        </svg>

        <svg
          width="100%" height="100%"
          viewBox="0 0 36 36"
          style={{ overflow: "visible", display: "block", position: "absolute", inset: 0 }}
          className="cursor-solid"
        >
          {/* Filled circle for hover */}
          <circle cx="18" cy="18" r={r} fill="#ffffff" />
          {/* Small crosshair inside to say "clickable" */}
          <line x1="18" y1="11" x2="18" y2="25" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="11" y1="18" x2="25" y2="18" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* ── Inner dot ──────────────────────────────────────────────── */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[10001] hidden [@media(pointer:fine)]:block"
        style={{
          width:        4,
          height:       4,
          marginLeft:  -2,
          marginTop:   -2,
          borderRadius: "50%",
          background:   "#ffffff",
          mixBlendMode: "exclusion",
          willChange:   "left, top, opacity",
          transition:   "opacity 100ms ease",
        }}
      />

      {/* ── State-driven CSS ───────────────────────────────────────── */}
      <style>{`
        /* default: show dashes, hide solid */
        [data-state="default"] .cursor-dashed { opacity: 1; }
        [data-state="default"] .cursor-solid  { opacity: 0; }

        /* hover: hide dashes, show solid */
        [data-state="hover"] .cursor-dashed { opacity: 0; }
        [data-state="hover"] .cursor-solid  { opacity: 1; }

        /* click: hide dashes, show solid (ring already shrunk via JS) */
        [data-state="click"] .cursor-dashed { opacity: 0; }
        [data-state="click"] .cursor-solid  { opacity: 1; }
      `}</style>
    </>
  );
}
