import { useEffect, useRef } from "react";

// ── Shared HUD primitives ─────────────────────────────────────────────────────

/** Grid lines + dot matrix background, identical to HudBackground */
function GridBg() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0" style={{
        backgroundImage: "linear-gradient(to right,rgba(11,12,11,0.08) 1px,transparent 1px),linear-gradient(to bottom,rgba(11,12,11,0.08) 1px,transparent 1px)",
        backgroundSize: "80px 80px",
      }} />
      <div className="absolute inset-0" style={{
        backgroundImage: "radial-gradient(circle,rgba(11,12,11,0.12) 1px,transparent 1.5px)",
        backgroundSize: "40px 40px",
      }} />
    </div>
  );
}

/** Four floating + crosshairs */
function Crosshairs() {
  const positions = [
    { top: "15%", left: "10%" }, { top: "22%", left: "78%" },
    { top: "75%", left: "20%" }, { top: "80%", left: "75%" },
  ];
  return (
    <>
      {positions.map((p, i) => (
        <span key={i} className="pointer-events-none absolute font-mono text-base -translate-x-1/2 -translate-y-1/2 text-[#0b0c0b]/25" style={p}>+</span>
      ))}
    </>
  );
}

/** Four HUD corner ticks */
function CornerTicks() {
  return (
    <>
      <span className="pointer-events-none absolute top-5 left-5  h-4 w-4 border-l border-t border-[#0b0c0b]/20" />
      <span className="pointer-events-none absolute top-5 right-5 h-4 w-4 border-r border-t border-[#0b0c0b]/20" />
      <span className="pointer-events-none absolute bottom-5 left-5  h-4 w-4 border-l border-b border-[#0b0c0b]/20" />
      <span className="pointer-events-none absolute bottom-5 right-5 h-4 w-4 border-r border-b border-[#0b0c0b]/20" />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function SplashScreen({ phase, splashLogoRef, computeTransform, animDuration }) {
  const logoWrapperRef = useRef(null);

  useEffect(() => {
    if (phase !== "animating") return;
    const raf = requestAnimationFrame(() => {
      const { translateX, translateY, scale } = computeTransform();
      if (logoWrapperRef.current) {
        logoWrapperRef.current.style.transition = `transform ${animDuration}ms cubic-bezier(0.4,0,0.2,1), opacity ${animDuration}ms ease`;
        logoWrapperRef.current.style.transform = `translate(${translateX}px,${translateY}px) scale(${scale})`;
        logoWrapperRef.current.style.opacity = "0";
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [phase, computeTransform, animDuration]);

  const isAnimating = phase === "animating";

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity ${isAnimating ? "opacity-0" : "opacity-100"}`}
      style={{
        background: "#cbd4cc",
        color: "#0b0c0b",
        fontFamily: "'Share Tech Mono', monospace",
        transitionDuration: `${animDuration}ms`,
        cursor: "none",
      }}
    >
      <GridBg />
      <Crosshairs />
      <CornerTicks />

      {/* Section index — top left */}
      <div className="absolute top-10 left-[60px] font-['Orbitron'] text-[10px] font-black tracking-[3px] text-[#0b0c0b]/30 uppercase">
        MELD // INITIALISING
      </div>

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Flying logo wrapper */}
        <div ref={logoWrapperRef} className="origin-center will-change-transform">
          <div ref={splashLogoRef}>
            <p
              className="font-['Orbitron'] font-black uppercase leading-none tracking-[-2px] text-[#0b0c0b]"
              style={{
                fontSize: "clamp(72px, 12vw, 140px)",
                textShadow: "0 0 60px rgba(229,62,62,0.15)",
              }}
            >
              MELD
            </p>
          </div>
        </div>

        {/* Tagline */}
        <p className="mt-4 font-['Rajdhani'] text-[13px] font-bold tracking-[4px] text-[#0b0c0b]/50 uppercase">
          FIND YOUR TEAM <span className="text-[#e53e3e]">+</span> DOMINATE TOGETHER
        </p>

        {/* Loading bar — corner bracket panel */}
        <div className="relative mt-10 w-64">
          {/* corner brackets */}
          <span className="absolute -top-1 -left-1 h-2.5 w-2.5 border-l border-t border-[#0b0c0b]/40" />
          <span className="absolute -bottom-1 -right-1 h-2.5 w-2.5 border-r border-b border-[#0b0c0b]/40" />

          <div className="relative h-px w-full overflow-hidden bg-[#0b0c0b]/15">
            <div
              className="absolute top-0 h-full bg-[#e53e3e]"
              style={{
                width: "100%",
                animation: "splashLoad 2s ease-in-out forwards",
                boxShadow: "0 0 8px rgba(229,62,62,0.7)",
              }}
            />
          </div>

          <div className="mt-2 flex justify-between">
            <span className="font-['Orbitron'] text-[9px] font-black tracking-[2px] text-[#0b0c0b]/30">LOADING</span>
            <span className="font-['Orbitron'] text-[9px] font-black tracking-[2px] text-[#e53e3e]" style={{ textShadow: "0 0 6px rgba(229,62,62,0.5)" }}>
              READY
            </span>
          </div>
        </div>
      </div>

      {/* Bottom scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="font-['Orbitron'] text-[9px] font-black tracking-[3px] text-[#0b0c0b]/25 uppercase">
          MELD // 2025
        </span>
      </div>
    </div>
  );
}
