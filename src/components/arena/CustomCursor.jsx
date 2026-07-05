import useCustomCursor from "../../hooks/useCustomCursor";

/**
 * Global custom cursor — circle split into 4 equal dashed segments via SVG.
 * mix-blend-mode: exclusion for vivid inversion on both light & dark backgrounds.
 * Hidden on touch/coarse-pointer devices.
 */
export default function CustomCursor() {
  const { ringRef, dotRef } = useCustomCursor();

  // Circle circumference = 2π × r = 2π × 16 ≈ 100.53
  // 4 equal dashes with gaps: dash = 100.53/8 ≈ 12.6, gap = 100.53/8 ≈ 12.6
  // So stroke-dasharray = "12.6 12.6" gives 4 evenly spaced segments
  const r = 16;
  const circ = 2 * Math.PI * r; // ≈ 100.53
  const dash = circ / 8;        // each segment + each gap = circ/4, split 50/50

  return (
    <>
      {/* Outer dashed ring */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[10000] hidden [@media(pointer:fine)]:block"
        style={{
          width: 36,
          height: 36,
          marginLeft: -18,
          marginTop: -18,
          mixBlendMode: "exclusion",
          willChange: "left, top",
          transition: "width 150ms ease, height 150ms ease, margin 150ms ease",
        }}
      >
        <svg
          width="100%" height="100%"
          viewBox="0 0 36 36"
          style={{ overflow: "visible", display: "block" }}
        >
          <circle
            cx="18" cy="18" r={r}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeDasharray={`${dash} ${dash}`}
            strokeDashoffset={dash / 2} // rotate so gaps fall at 45°, dashes at N/S/E/W
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Inner dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[10001] hidden [@media(pointer:fine)]:block"
        style={{
          width: 4,
          height: 4,
          marginLeft: -2,
          marginTop: -2,
          borderRadius: "50%",
          background: "#ffffff",
          mixBlendMode: "exclusion",
          willChange: "left, top",
        }}
      />
    </>
  );
}
