import { useAuth } from "../context/AuthContext";
import HudBackground from "../components/arena/HudBackground";
import ArenaHeader from "../components/arena/ArenaHeader";
import SidebarLeft from "../components/arena/SidebarLeft";
import CharacterStage from "../components/arena/CharacterStage";
import SidebarRight from "../components/arena/SidebarRight";
import ScrollIndicator from "../components/arena/ScrollIndicator";

export default function ArenaPage() {
  const { user } = useAuth();
  return (
    <div
      className="relative min-h-screen w-screen"
      style={{
        background: "#cbd4cc",
        color: "#0b0c0b",
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: 14,
      }}
    >
      <HudBackground />

      {/* ── Desktop: original 3-column grid, fits in one screen ── */}
      <main
        className="relative z-[2] hidden lg:grid h-screen w-full overflow-hidden"
        style={{
          padding: "40px 60px",
          gridTemplateColumns: "280px 1fr 340px",
          gridTemplateRows: "60px 1fr 60px",
          gridTemplateAreas: `
            "header header header"
            "left   center right"
            "left   scroll right"
          `,
        }}
      >
        <div style={{ gridArea: "header" }}><ArenaHeader /></div>
        <div style={{ gridArea: "left",   position: "relative" }}><SidebarLeft /></div>
        <div style={{ gridArea: "center", position: "relative" }}><CharacterStage /></div>
        <div style={{ gridArea: "right" }}><SidebarRight /></div>
        <div style={{ gridArea: "scroll" }}><ScrollIndicator /></div>
      </main>

      {/* ── Mobile: scrollable stacked layout ── */}
      <div className="relative z-[2] flex flex-col lg:hidden min-h-screen">

        {/* Sticky header — pb-0 removed so border-b of ArenaHeader has room */}
        <div className="sticky top-0 z-30 bg-[#cbd4cc] px-5 pt-5 pb-1">
          <ArenaHeader />
        </div>

        {/* VS label */}
        <div className="flex items-center justify-between px-5 pt-6 pb-2">
          <div>
            <p className="font-['Orbitron'] text-[9px] font-black tracking-[3px] text-[#0b0c0b]/40 uppercase">
              MATCHUP
            </p>
            <p className="font-['Orbitron'] text-lg font-black tracking-tight text-[#0b0c0b] uppercase">
              VS
            </p>
          </div>
          {/* Scan bar */}
          <div className="flex-1 mx-4 relative h-px overflow-hidden bg-[#0b0c0b]/15">
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
            <CharacterStage />
          </div>
        </div>

        {/* Stat strip */}
        <div className="mx-5 mt-4 grid grid-cols-3 border border-[#0b0c0b]/15">
          {[
            { label: "MMR",    value: user?.mmr ?? "—" },
            { label: "REGION", value: user?.region ?? "—" },
            { label: "RANK",   value: user?.rank ?? "—" },
          ].map((s, i) => (
            <div key={s.label} className={`flex flex-col items-center py-3 ${i < 2 ? "border-r border-[#0b0c0b]/15" : ""}`}>
              <span className="font-['Orbitron'] text-[12px] font-black text-[#0b0c0b]">{s.value}</span>
              <span className="font-['Rajdhani'] text-[9px] font-bold tracking-[1.5px] text-[#0b0c0b]/40 uppercase mt-0.5">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Leaderboard + CTA — override sidebar's desktop padding */}
        <div className="mx-5 mt-4 [&_aside]:pl-0 [&_aside]:pt-0 [&_aside]:pb-0">
          <SidebarRight />
        </div>

        {/* Challenge bar */}
        <div className="mx-5 mt-4 mb-8">
          <p className="font-['Orbitron'] text-[10px] font-black tracking-[2px] text-[#0b0c0b] uppercase mb-2">
            Challenge Your Game
          </p>
          <div className="relative h-1 w-full overflow-hidden bg-[#0b0c0b]/15">
            <div
              className="absolute top-0 h-full w-full bg-[#e53e3e]"
              style={{ animation: "searchScan 2.5s infinite linear", left: "-100%" }}
            />
          </div>
          <div className="mt-4 flex gap-6">
            {["TWITTER", "INSTAGRAM"].map(s => (
              <a key={s} href="#" className="font-['Rajdhani'] text-[11px] font-semibold tracking-[1px] text-[#0b0c0b]/40 no-underline hover:text-[#0b0c0b] transition-colors">
                {s}
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
