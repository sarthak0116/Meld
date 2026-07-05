import { useRef, useEffect, useState } from "react";

function loadCharacter(canvas, imageUrl, mirror) {
  const img = new Image();
  img.src = imageUrl;
  img.onload = () => {
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (mirror) {
      ctx.save();
      ctx.translate(img.naturalWidth, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(img, 0, 0);
    if (mirror) ctx.restore();

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;
    const threshold = 110;
    const feather = 40;
    for (let i = 0; i < d.length; i += 4) {
      const score = d[i] + d[i + 2] - 2 * d[i + 1];
      if (score > threshold + feather) {
        d[i + 3] = 0;
      } else if (score > threshold) {
        d[i + 3] = Math.round(d[i + 3] * (1 - (score - threshold) / feather));
      }
    }
    ctx.putImageData(imgData, 0, 0);
  };
}

export default function CharacterStage() {
  const jettRef = useRef(null);
  const shadowRef = useRef(null);
  const containerRef = useRef(null);
  const [introState, setIntroState] = useState("sliding");
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Load characters onto canvases (desktop only)
  useEffect(() => {
    if (isMobile) return;
    if (jettRef.current) loadCharacter(jettRef.current, "/images/jett.png", false);
    if (shadowRef.current) loadCharacter(shadowRef.current, "/images/jett.png", true);
  }, [isMobile]);

  // Intro → breathing transition
  useEffect(() => {
    const t = setTimeout(() => setIntroState("breathing"), 2200);
    return () => clearTimeout(t);
  }, []);

  // Mouse parallax — desktop only, after intro
  useEffect(() => {
    if (isMobile || introState !== "breathing") return;
    const jett = jettRef.current;
    const container = containerRef.current;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    let rafId;
    const onMove = (e) => {
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMove);
    const tick = () => {
      cx += (tx * 22 - cx) * 0.04;
      cy += (ty * 12 - cy) * 0.04;
      if (container) container.style.transform = `rotateY(${cx * 0.05}deg) rotateX(${-cy * 0.05}deg)`;
      if (jett) jett.style.transform = `translate3d(${cx * 0.9}px,${cy * 0.6}px,0)`;
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
    };
  }, [introState, isMobile]);

  const jettStyle = introState === "sliding"
    ? { animation: "slideFromCenter 2.2s cubic-bezier(0.16,1,0.3,1) forwards", opacity: 0 }
    : { animation: "breathe 12s ease-in-out infinite", opacity: 1 };

  const shadowStyle = {
    filter: "brightness(0) drop-shadow(0 0 25px rgba(229,62,62,0.65))",
    ...(introState === "sliding"
      ? { animation: "slideFromCenterMirror 2.2s cubic-bezier(0.16,1,0.3,1) forwards", opacity: 0 }
      : { animation: "breatheMirror 12s ease-in-out infinite", opacity: 0.95 }),
  };

  // ── Mobile layout ──────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <section className="relative overflow-hidden" style={{ height: "100%", width: "100%" }}>
        {/* CRT scanlines */}
        <div className="pointer-events-none absolute inset-0 z-[5]" style={{
          background: "linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.05) 50%)",
          backgroundSize: "100% 4px",
        }} />
        {/* Vignette */}
        <div className="pointer-events-none absolute inset-0 z-[4]" style={{
          background: "radial-gradient(circle, transparent 40%, rgba(203,212,204,0.2) 75%, rgba(0,0,0,0.15) 100%)",
        }} />

        {/* Two characters side by side using img tags — works on all mobile browsers */}
        <div className="absolute inset-0 z-10 flex items-end justify-center">
          {/* Jett */}
          <img
            src="/images/jett.png"
            alt="Character"
            className="relative z-10 origin-bottom"
            style={{
              width: "52%",
              maxHeight: "100%",
              objectFit: "contain",
              objectPosition: "bottom",
              filter: "drop-shadow(0 0 12px rgba(11,12,11,0.2))",
              animation: introState === "sliding"
                ? "slideFromCenter 2.2s cubic-bezier(0.16,1,0.3,1) forwards"
                : "breathe 12s ease-in-out infinite",
              opacity: introState === "sliding" ? 0 : 1,
            }}
          />
          {/* Shadow opponent */}
          <img
            src="/images/jett.png"
            alt="Opponent"
            className="relative origin-bottom"
            style={{
              width: "52%",
              maxHeight: "100%",
              objectFit: "contain",
              objectPosition: "bottom",
              transform: "scaleX(-1)",
              filter: "brightness(0) drop-shadow(0 0 20px rgba(229,62,62,0.65))",
              animation: introState === "sliding"
                ? "slideFromCenter 2.2s cubic-bezier(0.16,1,0.3,1) forwards"
                : "breathe 12s ease-in-out infinite",
              opacity: introState === "sliding" ? 0 : 0.9,
            }}
          />
        </div>

        {/* VS badge */}
        <div
          className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 font-['Orbitron'] font-black text-[#0b0c0b]/15 pointer-events-none select-none"
          style={{ fontSize: "clamp(48px, 18vw, 96px)", lineHeight: 1 }}
        >
          VS
        </div>
      </section>
    );
  }

  // ── Desktop layout ─────────────────────────────────────────────────────────
  return (
    <section className="relative z-10 overflow-hidden" style={{ height: "100%", width: "100%" }}>
      {/* CRT scanlines */}
      <div className="pointer-events-none absolute inset-0 z-[5]" style={{
        background: "linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.05) 50%), linear-gradient(90deg, rgba(255,0,0,0.01), rgba(0,255,0,0.005), rgba(0,0,255,0.01))",
        backgroundSize: "100% 4px, 6px 100%",
      }} />
      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0 z-[4]" style={{
        background: "radial-gradient(circle, transparent 40%, rgba(203,212,204,0.2) 75%, rgba(0,0,0,0.15) 100%)",
      }} />
      {/* Top glare */}
      <div className="pointer-events-none absolute inset-0 z-[2] opacity-60" style={{
        background: "radial-gradient(circle at 50% 10%, rgba(255,255,255,0.25) 0%, transparent 60%)",
      }} />

      <div
        ref={containerRef}
        className="absolute inset-0 z-10 will-change-transform"
        style={{ transformStyle: "preserve-3d" }}
      >
        <canvas
          ref={jettRef}
          className="absolute bottom-0 will-change-transform origin-bottom"
          style={{ left: "-2%", width: "58%", height: "102%", objectFit: "contain", ...jettStyle }}
        />
        <canvas
          ref={shadowRef}
          className="absolute bottom-0 origin-bottom"
          style={{ right: "-2%", width: "58%", height: "102%", objectFit: "contain", ...shadowStyle }}
        />
      </div>
    </section>
  );
}
