import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useArena } from "../context/ArenaContext";
import HudBackground from "../components/arena/HudBackground";
import ArenaHeader from "../components/arena/ArenaHeader";
import SidebarLeft from "../components/arena/SidebarLeft";
import CharacterStage from "../components/arena/CharacterStage";
import Leaderboard from "../components/arena/Leaderboard";

// ─── Game background slideshow ───────────────────────────────────────────────
// Same images as before, but kept very subtle so they blend into the light bg.
function GameBackgroundSlideshow({ isDark }) {
  const images = [
    "/images/valorant.png",
    "/images/cs2.png",
    "/images/apex.png",
    "/images/dota2.png",
    "/images/r6siege.png",
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((p) => (p + 1) % images.length), 5000);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
      {images.map((src, idx) => (
        <div
          key={src}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-[1500ms] ease-in-out"
          style={{
            backgroundImage: `url(${src})`,
            // Light mode: very faint texture (0.06). Dark mode: slightly stronger (0.12).
            opacity: idx === index ? (isDark ? 0.12 : 0.06) : 0,
          }}
        />
      ))}
    </div>
  );
}

// ─── Arena-info modal (status panel) ────────────────────────────────────────

function ArenaInfoModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b0c0b]/60 p-6">
      <div
        className="relative w-full max-w-[720px] border border-[#0b0c0b]/20 bg-[#cbd4cc]"
        style={{ boxShadow: "0 24px 80px rgba(11,12,11,0.2)" }}
      >
        {/* Corner ticks */}
        <span className="absolute top-0 left-0 h-3 w-3 border-l border-t border-[#0b0c0b]/40" />
        <span className="absolute top-0 right-0 h-3 w-3 border-r border-t border-[#0b0c0b]/40" />
        <span className="absolute bottom-0 left-0 h-3 w-3 border-l border-b border-[#0b0c0b]/40" />
        <span className="absolute bottom-0 right-0 h-3 w-3 border-r border-b border-[#0b0c0b]/40" />

        {/* Header */}
        <div className="flex items-end justify-between border-b border-[#0b0c0b]/15 px-8 py-6">
          <div>
            <p className="font-['Orbitron'] text-[10px] font-black tracking-[4px] text-[#e53e3e] uppercase">
              REAL-TIME STATUS
            </p>
            <h2 className="mt-1 font-['Orbitron'] text-xl font-black tracking-[2px] text-[#0b0c0b] uppercase">
              Arena Hub
            </h2>
          </div>
          <button
            onClick={onClose}
            className="font-['Rajdhani'] text-[11px] font-bold tracking-[2px] text-[#0b0c0b]/50 uppercase hover:text-[#0b0c0b] bg-transparent border-none cursor-pointer transition-colors"
          >
            CLOSE <span className="text-[#e53e3e]">×</span>
          </button>
        </div>

        {/* Body */}
        <div className="grid md:grid-cols-2 gap-px bg-[#0b0c0b]/10 m-px">
          {/* System stats */}
          <div className="bg-[#cbd4cc] px-8 py-6">
            <p className="font-['Orbitron'] text-[9px] font-black tracking-[3px] text-[#0b0c0b]/35 uppercase mb-4">
              SYSTEM OVERVIEW
            </p>
            {[
              { label: "SERVER TICKRATE",  value: "128 TR"  },
              { label: "ACTIVE MATCHES",   value: "412",    accent: true },
              { label: "AVG QUEUE TIME",   value: "1m 24s"  },
              { label: "PLAYERS ONLINE",   value: "12,480", accent: true },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between border-b border-dashed border-[#0b0c0b]/10 py-3 last:border-0"
              >
                <span className="font-['Rajdhani'] text-[11px] font-bold tracking-[1px] text-[#0b0c0b]/50 uppercase">
                  {row.label}
                </span>
                <span
                  className={`font-['Orbitron'] text-[13px] font-black ${row.accent ? "text-[#e53e3e]" : "text-[#0b0c0b]"}`}
                  style={row.accent ? { textShadow: "0 0 10px rgba(229,62,62,0.35)" } : {}}
                >
                  {row.value}
                </span>
              </div>
            ))}
            {/* scan bar */}
            <div className="mt-4 relative h-px w-full overflow-hidden bg-[#0b0c0b]/15">
              <div className="absolute top-0 h-full w-full bg-[#e53e3e]" style={{ animation: "searchScan 2.5s infinite linear", left: "-100%" }} />
            </div>
          </div>

          {/* Regional leaderboard */}
          <div className="bg-[#cbd4cc] px-8 py-6">
            <p className="font-['Orbitron'] text-[9px] font-black tracking-[3px] text-[#0b0c0b]/35 uppercase mb-4">
              TOP PLAYERS
            </p>
            {[
              { rank: "01", name: "S1MPLE",  mmr: "3,120 MMR" },
              { rank: "02", name: "TENZ",    mmr: "3,095 MMR" },
              { rank: "03", name: "SHROUD",  mmr: "3,010 MMR" },
            ].map((p) => (
              <div
                key={p.rank}
                className="flex items-center justify-between border-b border-dashed border-[#0b0c0b]/10 py-3 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="font-['Orbitron'] text-[9px] font-black text-[#0b0c0b]/30">{p.rank}</span>
                  <span className="font-['Orbitron'] text-[11px] font-black tracking-[1px] text-[#0b0c0b]">{p.name}</span>
                </div>
                <span className="font-['Share_Tech_Mono'] text-[11px] text-[#e53e3e]">{p.mmr}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Leaderboard modal ───────────────────────────────────────────────────────

function LeaderboardModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-[#0b0c0b]/60 p-8">
      <div
        className="relative w-full max-w-[900px] border border-[#0b0c0b]/20 bg-[#cbd4cc]"
        style={{ boxShadow: "0 24px 80px rgba(11,12,11,0.2)" }}
      >
        <span className="absolute top-0 left-0 h-3 w-3 border-l border-t border-[#0b0c0b]/40" />
        <span className="absolute top-0 right-0 h-3 w-3 border-r border-t border-[#0b0c0b]/40" />

        <div className="flex items-end justify-between border-b border-[#0b0c0b]/15 px-8 py-6">
          <div>
            <p className="font-['Orbitron'] text-[10px] font-black tracking-[4px] text-[#e53e3e] uppercase">
              RANKED
            </p>
            <h2 className="mt-1 font-['Orbitron'] text-xl font-black tracking-[2px] text-[#0b0c0b] uppercase">
              Leaderboard
            </h2>
          </div>
          <button
            onClick={onClose}
            className="font-['Rajdhani'] text-[11px] font-bold tracking-[2px] text-[#0b0c0b]/50 uppercase hover:text-[#0b0c0b] bg-transparent border-none cursor-pointer transition-colors"
          >
            CLOSE <span className="text-[#e53e3e]">×</span>
          </button>
        </div>
        <div className="p-8">
          <Leaderboard />
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ArenaPage() {
  const [showArenaInfo,   setShowArenaInfo]   = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const { activeView, setActiveView, theme, setTheme } = useArena();
  const { user } = useAuth();

  const isDark = theme === "dark";
  const bg     = isDark ? "#0a0c10" : "#cbd4cc";
  const fg     = isDark ? "#cbd4cc" : "#0b0c0b";

  return (
    <div
      className="relative min-h-screen w-screen transition-colors duration-300"
      style={{
        background: bg,
        color: fg,
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: 14,
        cursor: "none",
      }}
    >
      <HudBackground light={!isDark} />
      <GameBackgroundSlideshow isDark={isDark} />

      {/* ── Desktop layout ───────────────────────────── */}
      <main
        className="relative z-[2] hidden lg:grid h-screen w-full overflow-hidden"
        style={{
          paddingLeft: 292,   // 260 sidebar + 32 content breathing room
          paddingRight: 32,
          paddingTop: 32,
          paddingBottom: 24,
          gridTemplateRows: "auto 1fr",
          gridTemplateAreas: `"header" "center"`,
          rowGap: 24,
        }}
      >
        <SidebarLeft
          activeView={activeView}
          onViewChange={setActiveView}
          theme={theme}
          onThemeToggle={() => setTheme((p) => (p === "dark" ? "light" : "dark"))}
        />

        {/* Header */}
        <div style={{ gridArea: "header" }}>
          <ArenaHeader onInfoClick={() => setShowArenaInfo(true)} />
        </div>

        {/* Main content */}
        <div style={{ gridArea: "center", position: "relative", overflow: "hidden" }}>
          <CharacterStage activeView={activeView} onViewChange={setActiveView} theme={theme} />
        </div>
      </main>

      {/* ── Mobile layout ────────────────────────────── */}
      <div className="relative z-[2] flex flex-col lg:hidden min-h-screen">
        <div
          className="sticky top-0 z-30 border-b px-5 pt-5 pb-4"
          style={{ background: bg, borderColor: `${fg}22` }}
        >
          <ArenaHeader onInfoClick={() => setShowArenaInfo(true)} />
        </div>

        {/* Matchup bar */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <div>
            <p className="font-['Orbitron'] text-[9px] font-black tracking-[3px] text-[#0b0c0b]/35 uppercase">MATCHUP</p>
            <p className="font-['Orbitron'] text-lg font-black tracking-tight text-[#0b0c0b] uppercase">VS</p>
          </div>
          <div className="flex-1 mx-4 relative h-px overflow-hidden bg-[#0b0c0b]/15">
            <div className="absolute top-0 h-full w-full bg-[#e53e3e]" style={{ animation: "searchScan 2.5s infinite linear", left: "-100%" }} />
          </div>
          <p className="font-['Orbitron'] text-[9px] font-black tracking-[2px] text-[#e53e3e] uppercase flex items-center gap-1.5">
            LIVE <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#e53e3e]" style={{ boxShadow: "0 0 6px rgba(229,62,62,0.8)" }} />
          </p>
        </div>

        {/* Stage */}
        <div className="relative mx-5" style={{ aspectRatio: "16/9", minHeight: 200, maxHeight: "55vw" }}>
          <div className="absolute inset-0">
            <CharacterStage activeView={activeView} onViewChange={setActiveView} theme={theme} />
          </div>
        </div>

        {/* Stat strip */}
        <div className="mx-5 mt-4 grid grid-cols-3 border border-[#0b0c0b]/15">
          {[
            { label: "MMR",    value: user?.mmr    ?? "—" },
            { label: "REGION", value: user?.region ?? "—" },
            { label: "RANK",   value: user?.rank   ?? "—" },
          ].map((s, i) => (
            <div key={s.label} className={`flex flex-col items-center py-3 ${i < 2 ? "border-r border-[#0b0c0b]/10" : ""}`}>
              <span className="font-['Orbitron'] text-[12px] font-black text-[#0b0c0b]">{s.value}</span>
              <span className="font-['Rajdhani'] text-[9px] font-bold tracking-[1.5px] text-[#0b0c0b]/40 uppercase mt-0.5">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Mobile nav strip */}
        <div className="mx-5 mt-4 mb-8">
          <p className="font-['Orbitron'] text-[10px] font-black tracking-[2px] text-[#0b0c0b]/40 uppercase mb-2">Navigation</p>
          <div className="grid grid-cols-2 gap-px bg-[#0b0c0b]/10 border border-[#0b0c0b]/10">
            {["LOBBY", "FRIENDS", "TOURNAMENTS", "STATS"].map((label) => {
              const view = label.toLowerCase();
              return (
                <button
                  key={label}
                  onClick={() => setActiveView(view)}
                  className={`py-3 font-['Rajdhani'] text-[11px] font-bold tracking-[2px] uppercase transition-colors ${
                    activeView === view
                      ? "bg-[#0b0c0b] text-[#cbd4cc]"
                      : "bg-[#cbd4cc] text-[#0b0c0b]/50 hover:text-[#0b0c0b]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Modals ───────────────────────────────────── */}
      {showArenaInfo   && <ArenaInfoModal   onClose={() => setShowArenaInfo(false)}   />}
      {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
