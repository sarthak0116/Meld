import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import HudBackground from "../components/arena/HudBackground";
import ArenaHeader from "../components/arena/ArenaHeader";
import SidebarLeft from "../components/arena/SidebarLeft";
import CharacterStage from "../components/arena/CharacterStage";
import ScrollIndicator from "../components/arena/ScrollIndicator";
import Leaderboard from "../components/arena/Leaderboard";

function GameBackgroundSlideshow() {
  const images = [
    "/images/valorant.png",
    "/images/cs2.png",
    "/images/apex.png",
    "/images/dota2.png",
    "/images/r6siege.png"
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
      {images.map((src, idx) => (
        <div
          key={src}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${src})`,
            opacity: idx === index ? 0.15 : 0,
            transition: "opacity 1.5s ease-in-out"
          }}
        />
      ))}
    </div>
  );
}

export default function ArenaPage() {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [activeView, setActiveView] = useState("lobby");
  const [showArenaInfo, setShowArenaInfo] = useState(false);
  const [theme, setTheme] = useState("dark");
  const { user } = useAuth();
  return (
    <div
      className="relative min-h-screen w-screen transition-colors duration-300"
      style={{
        background: theme === "dark" ? "#0a0c10" : "#cbd4cc",
        color: theme === "dark" ? "#cbd4cc" : "#0b0c0b",
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: 14,
      }}
    >
      <HudBackground light={theme === "light"} />
      <GameBackgroundSlideshow />

      {/* ── Desktop: original grid, fits in one screen ── */}
      <main
        className="relative z-[2] hidden lg:grid h-screen w-full overflow-hidden"
        style={{
          padding: "40px 20px 10px 320px",
          gridTemplateColumns: "1fr",
          gridTemplateRows: "60px 1fr",
          gridTemplateAreas: `
            "header"
            "center"
          `,
        }}
      >
        <SidebarLeft
          activeView={activeView}
          onViewChange={setActiveView}
          theme={theme}
          onThemeToggle={() => setTheme(prev => prev === "dark" ? "light" : "dark")}
        />
        <div style={{ gridArea: "header" }}><ArenaHeader onInfoClick={() => setShowArenaInfo(true)} theme={theme} /></div>
        <div style={{ gridArea: "center", position: "relative" }}>
          <CharacterStage activeView={activeView} onViewChange={setActiveView} theme={theme} />
        </div>
      </main>

      {showArenaInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-6">
          <div className="w-full max-w-[800px] rounded-3xl border border-[#ffffff]/10 bg-[#0d1016]/95 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.8)] border-orange-500/10">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#ffffff]/10 pb-6 mb-6">
              <div>
                <p className="font-['Orbitron'] text-xs font-black uppercase tracking-[5px] text-[#fb923c]">
                  REAL-TIME STATS
                </p>
                <h2 className="mt-1 text-2xl font-black uppercase tracking-tight text-white font-['Orbitron']">
                  Arena Hub Status
                </h2>
              </div>
              <button
                onClick={() => setShowArenaInfo(false)}
                className="rounded-xl border border-[#ffffff]/10 bg-[#121620] px-4 py-2 text-[10px] font-black uppercase tracking-[2px] text-[#fb923c] transition hover:bg-[#fb923c]/10 hover:text-white"
              >
                CLOSE STATUS
              </button>
            </div>

            {/* Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              
              {/* Server Stats */}
              <div className="space-y-4">
                <p className="font-['Orbitron'] text-[10px] font-black tracking-[3px] text-[#cbd4cc]/50 uppercase">
                  SYSTEM OVERVIEW
                </p>
                
                <div className="grid gap-3">
                  <div className="flex justify-between items-center rounded-xl bg-[#121620]/80 border border-[#ffffff]/5 px-4 py-4">
                    <span className="opacity-60 uppercase tracking-wide text-[10px] font-bold text-[#cbd4cc]">Server Tickrate</span>
                    <span className="font-bold text-white font-mono text-sm">128 TR</span>
                  </div>

                  <div className="flex justify-between items-center rounded-xl bg-[#121620]/80 border border-[#ffffff]/5 px-4 py-4">
                    <span className="opacity-60 uppercase tracking-wide text-[10px] font-bold text-[#cbd4cc]">Active Matches</span>
                    <span className="font-bold text-[#fb923c] font-mono text-sm">412 Live</span>
                  </div>

                  <div className="flex justify-between items-center rounded-xl bg-[#121620]/80 border border-[#ffffff]/5 px-4 py-4">
                    <span className="opacity-60 uppercase tracking-wide text-[10px] font-bold text-[#cbd4cc]">Avg. Queue Time</span>
                    <span className="font-bold text-[#34d399] font-mono text-sm">1m 24s</span>
                  </div>
                </div>
              </div>

              {/* Regional Leaderboard */}
              <div className="space-y-4">
                <p className="font-['Orbitron'] text-[10px] font-black tracking-[3px] text-[#cbd4cc]/50 uppercase">
                  REGIONAL LEADERBOARD
                </p>
                
                <div className="rounded-xl border border-[#ffffff]/10 bg-[#121620]/40 p-4 space-y-3">
                  {[
                    { rank: 1, name: "S1mple", rating: "3,120 MMR" },
                    { rank: 2, name: "TenZ", rating: "3,095 MMR" },
                    { rank: 3, name: "Shroud", rating: "3,010 MMR" },
                  ].map((p) => (
                    <div key={p.rank} className="flex items-center justify-between text-xs py-2 border-b border-[#ffffff]/5 last:border-b-0">
                      <span className="font-bold text-white">#{p.rank} {p.name}</span>
                      <span className="text-[#fb923c] font-mono">{p.rating}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {showLeaderboard && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-hidden bg-black/70 p-6">
          <div className="mx-auto w-full max-w-[980px] overflow-hidden rounded-[32px] border border-[#ffffff]/10 bg-[#0d1119] shadow-[0_40px_120px_rgba(0,0,0,0.65)]">
            <div className="flex items-center justify-between border-b border-[#ffffff]/10 px-6 py-4">
              <div>
                <p className="font-['Orbitron'] text-[12px] font-black uppercase tracking-[4px] text-[#fb923c]/90">
                  TOP PLAYERS
                </p>
                <p className="mt-1 text-sm font-semibold uppercase tracking-[1px] text-[#e6e8eb]/80">
                  Leaderboard by MMR
                </p>
              </div>
              <button
                onClick={() => setShowLeaderboard(false)}
                className="rounded-full border border-[#ffffff]/10 bg-[#11161f] px-4 py-2 text-[11px] font-semibold uppercase tracking-[2px] text-[#fb923c] transition hover:bg-[#1b2430]"
              >
                Close
              </button>
            </div>
            <div className="p-6">
              <Leaderboard />
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile: scrollable stacked layout ── */}
      <div className="relative z-[2] flex flex-col lg:hidden min-h-screen">

        {/* Sticky header — pb-0 removed so border-b of ArenaHeader has room */}
        <div className="sticky top-0 z-30 bg-[#0a0c10] px-5 pt-5 pb-1">
          <ArenaHeader onInfoClick={() => setShowArenaInfo(true)} />
        </div>

        {/* VS label */}
        <div className="flex items-center justify-between px-5 pt-6 pb-2">
          <div>
            <p className="font-['Orbitron'] text-[9px] font-black tracking-[3px] text-[#cbd4cc]/40 uppercase">
              MATCHUP
            </p>
            <p className="font-['Orbitron'] text-lg font-black tracking-tight text-white uppercase">
              VS
            </p>
          </div>
          {/* Scan bar */}
          <div className="flex-1 mx-4 relative h-px overflow-hidden bg-[#ffffff]/10">
            <div
              className="absolute top-0 h-full w-full bg-[#e53e3e]"
              style={{ animation: "searchScan 2.5s infinite linear", left: "-100%" }}
            />
          </div>
          <p className="font-['Orbitron'] text-[9px] font-black tracking-[2px] text-[#e53e3e] uppercase">
            LIVE <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#e53e3e] ml-1 align-middle" style={{ boxShadow: "0 0 6px rgba(229,62,62,0.8)" }} />
          </p>
        </div>

        {/* Character stage — fixed aspect ratio so it never gets squished */}
        <div className="relative mx-5" style={{ aspectRatio: "16/9", minHeight: 220, maxHeight: "55vw" }}>
          <div className="absolute inset-0">
            <CharacterStage activeView={activeView} onViewChange={setActiveView} />
          </div>
        </div>

        {/* Stat strip */}
        <div className="mx-5 mt-4 grid grid-cols-3 border border-[#ffffff]/10">
          {[
            { label: "MMR",    value: user?.mmr ?? "—" },
            { label: "REGION", value: user?.region ?? "—" },
            { label: "RANK",   value: user?.rank ?? "—" },
          ].map((s, i) => (
            <div key={s.label} className={`flex flex-col items-center py-3 ${i < 2 ? "border-r border-[#ffffff]/10" : ""}`}>
              <span className="font-['Orbitron'] text-[12px] font-black text-white">{s.value}</span>
              <span className="font-['Rajdhani'] text-[9px] font-bold tracking-[1.5px] text-[#cbd4cc]/40 uppercase mt-0.5">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Challenge bar */}
        <div className="mx-5 mt-4 mb-8">
          <p className="font-['Orbitron'] text-[10px] font-black tracking-[2px] text-[#cbd4cc] uppercase mb-2">
            Challenge Your Game
          </p>
          <div className="relative h-1 w-full overflow-hidden bg-[#ffffff]/10">
            <div
              className="absolute top-0 h-full w-full bg-[#e53e3e]"
              style={{ animation: "searchScan 2.5s infinite linear", left: "-100%" }}
            />
          </div>
          <div className="mt-4 flex gap-6">
            {["TWITTER", "INSTAGRAM"].map(s => (
              <a key={s} href="#" className="font-['Rajdhani'] text-[11px] font-semibold tracking-[1px] text-[#cbd4cc]/40 no-underline hover:text-white transition-colors">
                {s}
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
