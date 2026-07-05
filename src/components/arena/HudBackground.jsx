import { useRef } from "react";
import useParticleCanvas from "../../hooks/useParticleCanvas";

/**
 * Full-screen background layer:
 *   - Grid lines + dot matrix
 *   - Crosshair (+) markers
 *   - HUD corner ticks
 *   - Particle canvas (wind trails, sparks, kunais)
 */
export default function HudBackground() {
  const canvasRef = useRef(null);
  useParticleCanvas(canvasRef);

  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
      {/* Grid lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(11,12,11,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(11,12,11,0.1) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
      {/* Dot matrix */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(11,12,11,0.15) 1px, transparent 1.5px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Crosshair markers */}
      {[
        { top: "15%", left: "10%" },
        { top: "25%", left: "75%" },
        { top: "78%", left: "18%" },
        { top: "82%", left: "78%" },
      ].map((pos, i) => (
        <span
          key={i}
          className="absolute font-mono text-base text-[#0b0c0b]/40 -translate-x-1/2 -translate-y-1/2"
          style={pos}
        >
          +
        </span>
      ))}

      {/* Corner HUD ticks */}
      <span className="absolute top-5 left-5 h-4 w-4 border-l border-t border-[#0b0c0b]/25" />
      <span className="absolute top-5 right-5 h-4 w-4 border-r border-t border-[#0b0c0b]/25" />
      <span className="absolute bottom-5 left-5 h-4 w-4 border-l border-b border-[#0b0c0b]/25" />
      <span className="absolute bottom-5 right-5 h-4 w-4 border-r border-b border-[#0b0c0b]/25" />

      {/* Particle canvas — behind characters (z-[2]), above grid (z-[1]) */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ zIndex: 2 }} />
    </div>
  );
}
