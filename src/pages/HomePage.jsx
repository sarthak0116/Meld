import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import HudBackground from "../components/arena/HudBackground";
import Button from "../components/ui/Button";
import SplashScreen from "../components/SplashScreen";
import useSplashAnimation from "../hooks/useSplashAnimation";

// ─── Data ────────────────────────────────────────────────────────────────────

const STATS = [
  { value: "50,000+", label: "ACTIVE PLAYERS", num: "01" },
  { value: "1,200+",  label: "TOURNAMENTS RUN", num: "02" },
  { value: "98",      label: "GAMES SUPPORTED", num: "03" },
  { value: "4.9",     label: "PLATFORM RATING", num: "04" },
];

const FEATURES = [
  {
    id: "01",
    title: "SKILL MATCHMAKING",
    label: "CORE SYSTEM",
    desc: "Paired with players at your exact rank. No smurfs. No stomps.",
  },
  {
    id: "02",
    title: "REAL-TIME LOBBIES",
    label: "MULTIPLAYER",
    desc: "Create or join rooms with shareable codes. Fill your squad in seconds.",
  },
  {
    id: "03",
    title: "VOICE COMMS",
    label: "BUILT-IN",
    desc: "Integrated push-to-talk. Zero external software needed.",
  },
  {
    id: "04",
    title: "TOURNAMENT ENGINE",
    label: "COMPETITIVE",
    desc: "Full bracket support — single elim, double elim, round robin.",
  },
  {
    id: "05",
    title: "PLAYER STATS",
    label: "ANALYTICS",
    desc: "Win rate, KDA, match history, rank progression — all tracked.",
  },
  {
    id: "06",
    title: "REPUTATION SYSTEM",
    label: "COMMUNITY",
    desc: "Karma-based matching. Good players find good players.",
  },
];

const GAMES = [
  { name: "VALORANT",   genre: "TACTICAL FPS",  players: "12,400", tag: "HOT" },
  { name: "CS2",        genre: "FPS",            players: "8,200",  tag: "LIVE" },
  { name: "LOL",        genre: "MOBA",           players: "9,800",  tag: "HOT" },
  { name: "APEX",       genre: "BATTLE ROYALE",  players: "7,100",  tag: null },
  { name: "DOTA 2",     genre: "MOBA",           players: "6,300",  tag: null },
  { name: "R6 SIEGE",   genre: "TACTICAL FPS",   players: "3,800",  tag: "NEW" },
  { name: "OVERWATCH 2",genre: "HERO SHOOTER",   players: "4,900",  tag: null },
  { name: "ROCKET LG",  genre: "SPORTS",         players: "5,600",  tag: null },
];

const STEPS = [
  { num: "01", title: "BUILD YOUR PROFILE", desc: "Set rank, region, preferred roles and games. Takes 2 minutes." },
  { num: "02", title: "JOIN OR CREATE",      desc: "Browse open lobbies or let the system match you automatically." },
  { num: "03", title: "PLAY & CLIMB",        desc: "Jump in, coordinate, win. Your rank updates after every match." },
];

const TESTIMONIALS = [
  { handle: "NIGHTWOLF_GG",  initials: "NW", quote: "Went from Bronze to Plat in 3 weeks. The matchmaking actually works." },
  { handle: "CYBERVIPER99",  initials: "CV", quote: "First platform where people actually use comms. Wild concept." },
  { handle: "PIXELSTORM_X",  initials: "PS", quote: "Ran a 64-team bracket for our community in under 10 minutes." },
];

// ─── Shared primitives ───────────────────────────────────────────────────────

/** Reusable HUD corner-bracket panel wrapper */
function HudPanel({ children, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      {/* top-left bracket */}
      <span className="absolute top-0 left-0 h-3 w-3 border-l border-t border-[#0b0c0b]/60" />
      {/* bottom-right bracket */}
      <span className="absolute bottom-0 right-0 h-3 w-3 border-r border-b border-[#0b0c0b]/60" />
      {/* top + bottom rule lines */}
      <span className="absolute top-0 left-0 right-0 h-px bg-[#0b0c0b]/20" />
      <span className="absolute bottom-0 left-0 right-0 h-px bg-[#0b0c0b]/20" />
      {children}
    </div>
  );
}

/** Orbitron index label — e.g. "01" in muted style */
function IndexLabel({ children }) {
  return (
    <span
      className="font-['Orbitron'] text-[11px] font-medium text-[#0b0c0b]/40"
    >
      {children}
    </span>
  );
}

/** Section heading in the arena typeface */
function SectionHeading({ index, children }) {
  return (
    <div className="mb-10 flex items-end gap-6 border-b border-[#0b0c0b]/15 pb-4">
      <IndexLabel>{index}</IndexLabel>
      <h2
        className="font-['Orbitron'] text-2xl font-black tracking-[3px] text-[#0b0c0b] uppercase"
      >
        {children}
      </h2>
      <span className="text-[#e53e3e] text-lg leading-none mb-0.5">+</span>
    </div>
  );
}

// ─── Page sections ───────────────────────────────────────────────────────────

function Hero({ username, isLoggedIn }) {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex items-center px-4 sm:px-8 lg:px-[60px]">
      {/* Vertical section index — hidden on mobile */}
      <div
        className="pointer-events-none absolute hidden lg:block"
        style={{
          left: 16,
          top: "50%",
          transformOrigin: "left top",
          transform: "rotate(-90deg) translate(-50%, 0)",
          fontFamily: "'Orbitron', sans-serif",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 4,
          color: "rgba(11,12,11,0.25)",
          whiteSpace: "nowrap",
        }}
      >
        MELD // GAMING MATCHMAKING PLATFORM
      </div>

      <div className="flex w-full flex-col lg:flex-row lg:items-end lg:justify-between gap-8 lg:gap-10">
        {/* Left — main copy */}
        <div className="w-full lg:max-w-xl">
          <p className="mb-4 font-['Rajdhani'] text-[11px] font-bold tracking-[4px] text-[#0b0c0b]/50 uppercase">
            WELCOME BACK, {username ?? "PLAYER"} <span className="text-[#e53e3e]">+</span>
          </p>

          <h1
            className="font-['Orbitron'] font-black uppercase leading-[1.05] tracking-tight text-[#0b0c0b]"
            style={{ fontSize: "clamp(48px, 6vw, 88px)" }}
          >
            FIND YOUR
            <br />
            <span className="relative inline-block">
              PERFECT
              {/* Underline accent */}
              <span
                className="absolute left-0 -bottom-1 h-0.5 w-full bg-[#e53e3e]"
                style={{ boxShadow: "0 0 12px rgba(229,62,62,0.6)" }}
              />
            </span>
            <br />
            TEAM.
          </h1>

          <p className="mt-7 font-['Share_Tech_Mono'] text-sm leading-relaxed text-[#0b0c0b]/60 max-w-md">
            Skill-based matchmaking · Real-time lobbies · Built-in voice comms ·
            Tournament hosting — all in one platform.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <div className="group">
              <Button variant="hud" size="lg" className="group" onClick={() => navigate(isLoggedIn ? "/arena" : "/signup")}>
                START PLAYING
              </Button>
            </div>
            <Link
              to="/arena"
              className="relative inline-flex items-center gap-2 border border-[#0b0c0b] px-6 py-3 font-['Rajdhani'] text-[13px] font-bold tracking-[3px] text-[#0b0c0b] no-underline uppercase transition-colors hover:bg-[#0b0c0b] hover:text-[#cbd4cc] group"
            >
              {/* corner ticks */}
              <span className="absolute top-0 left-0 h-2 w-2 border-l-2 border-t-2 border-[#e53e3e] -translate-x-px -translate-y-px" />
              <span className="absolute bottom-0 right-0 h-2 w-2 border-r-2 border-b-2 border-[#e53e3e] translate-x-px translate-y-px" />
              ENTER ARENA
              <span className="text-[#e53e3e] transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
        </div>

        {/* Right — live stats panel, hidden on mobile */}
        <HudPanel className="hidden lg:block w-[280px] shrink-0 px-6 py-5">
          <p className="mb-4 font-['Orbitron'] text-[10px] font-black tracking-[2px] text-[#0b0c0b]/50 uppercase">
            PLATFORM STATUS
          </p>
          {[
            { label: "PLAYERS ONLINE",  value: "12,480", status: "LIVE" },
            { label: "ACTIVE LOBBIES",  value: "342",    status: "LIVE" },
            { label: "MATCHES TODAY",   value: "9,104",  status: null   },
            { label: "AVG QUEUE TIME",  value: "0:48s",  status: null   },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between border-b border-dashed border-[#0b0c0b]/10 py-2.5 last:border-0"
            >
              <span className="font-['Rajdhani'] text-[11px] font-bold tracking-[1px] text-[#0b0c0b]/50 uppercase">
                {row.label}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-['Orbitron'] text-[13px] font-black text-[#0b0c0b]">
                  {row.value}
                </span>
                {row.status && (
                  <span
                    className="font-['Orbitron'] text-[8px] font-black tracking-[1px] text-[#e53e3e]"
                    style={{ textShadow: "0 0 8px rgba(229,62,62,0.7)" }}
                  >
                    {row.status}
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Scanning bar */}
          <div className="mt-4 relative h-px w-full overflow-hidden bg-[#0b0c0b]/15">
            <div
              className="absolute top-0 h-full w-full bg-[#e53e3e]"
              style={{ animation: "searchScan 2.5s infinite linear", left: "-100%" }}
            />
          </div>
        </HudPanel>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="font-['Orbitron'] text-[9px] font-black tracking-[4px] text-[#0b0c0b]/40">SCROLL</span>
        <div className="relative h-8 w-px overflow-hidden bg-[#0b0c0b]/20">
          <div className="absolute left-0 top-0 h-3 w-full bg-[#0b0c0b]/60" style={{ animation: "scrollDown 2s infinite ease-in-out" }} />
        </div>
      </div>
    </section>
  );
}

function StatsBar() {
  return (
    <section className="relative border-t border-b border-[#0b0c0b]/15 px-4 sm:px-8 lg:px-[60px]">
      <div className="grid grid-cols-2 md:grid-cols-4">
        {STATS.map((s, i) => (
          <div
            key={s.num}
            className={`flex flex-col justify-center py-8 px-4 ${i < 3 ? "border-r border-[#0b0c0b]/10" : ""}`}
          >
            <IndexLabel>{s.num}</IndexLabel>
            <p
              className="mt-1 font-['Orbitron'] font-black leading-none text-[#0b0c0b]"
              style={{ fontSize: "clamp(28px, 3vw, 42px)" }}
            >
              {s.value}
            </p>
            <p className="mt-1 font-['Rajdhani'] text-[11px] font-bold tracking-[2px] text-[#0b0c0b]/40 uppercase">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="px-4 sm:px-8 lg:px-[60px] py-14 lg:py-20">
      <SectionHeading index="02">PLATFORM FEATURES</SectionHeading>
      <div className="grid grid-cols-1 gap-px bg-[#0b0c0b]/10 border border-[#0b0c0b]/10 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.id}
            className="group relative bg-[#cbd4cc] p-7 transition-colors duration-200 hover:bg-[#0b0c0b] cursor-default"
          >
            {/* Corner tick — top-left only */}
            <span className="absolute top-0 left-0 h-2.5 w-2.5 border-l border-t border-[#0b0c0b]/30 group-hover:border-[#e53e3e]/60 transition-colors" />

            <div className="flex items-start justify-between mb-5">
              <span className="font-['Orbitron'] text-[11px] font-black tracking-[2px] text-[#0b0c0b]/30 group-hover:text-[#e53e3e]/50 transition-colors">
                {f.id}
              </span>
              <span className="font-['Rajdhani'] text-[10px] font-bold tracking-[2px] text-[#0b0c0b]/30 group-hover:text-[#e53e3e]/50 border border-[#0b0c0b]/20 group-hover:border-[#e53e3e]/30 px-2 py-0.5 uppercase transition-all">
                {f.label}
              </span>
            </div>

            <h3 className="font-['Orbitron'] text-base font-black tracking-[2px] text-[#0b0c0b] group-hover:text-[#cbd4cc] uppercase mb-3 transition-colors">
              {f.title}
            </h3>
            <p className="font-['Share_Tech_Mono'] text-[12px] leading-relaxed text-[#0b0c0b]/55 group-hover:text-[#cbd4cc]/60 transition-colors">
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="border-t border-[#0b0c0b]/15 px-4 sm:px-8 lg:px-[60px] py-14 lg:py-20">
      <SectionHeading index="03">HOW IT WORKS</SectionHeading>
      <div className="relative grid grid-cols-1 gap-10 md:grid-cols-3">
        {/* Connecting dashed line — desktop only */}
        <div className="hidden md:block absolute top-5 left-[16.66%] right-[16.66%] h-px border-t border-dashed border-[#0b0c0b]/20" />

        {STEPS.map((step) => (
          <div key={step.num} className="flex flex-col">
            {/* Circle */}
            <div className="relative mb-6 h-10 w-10 border border-[#0b0c0b]/30 flex items-center justify-center bg-[#cbd4cc]">
              <span className="font-['Orbitron'] text-[13px] font-black text-[#0b0c0b]">{step.num}</span>
              {/* corner ticks on circle box */}
              <span className="absolute -top-px -left-px h-2 w-2 border-l border-t border-[#e53e3e]/80" />
              <span className="absolute -bottom-px -right-px h-2 w-2 border-r border-b border-[#e53e3e]/80" />
            </div>
            <h3 className="font-['Orbitron'] text-[13px] font-black tracking-[2px] text-[#0b0c0b] uppercase mb-3">
              {step.title}
            </h3>
            <p className="font-['Share_Tech_Mono'] text-[12px] leading-relaxed text-[#0b0c0b]/50">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function GamesSection() {
  return (
    <section className="border-t border-[#0b0c0b]/15 py-14 lg:py-20">
      <div className="px-4 sm:px-8 lg:px-[60px]">
        <SectionHeading index="04">SUPPORTED GAMES</SectionHeading>
      </div>

      {/* Horizontally scrollable, no scrollbar */}
      <div className="no-scrollbar flex gap-px overflow-x-auto border-t border-b border-[#0b0c0b]/10">
        {GAMES.map((g, i) => (
          <div
            key={g.name}
            className="group relative flex-shrink-0 w-[180px] border-r border-[#0b0c0b]/10 last:border-r-0 px-6 py-7 bg-[#cbd4cc] hover:bg-[#0b0c0b] transition-colors duration-200 cursor-pointer"
          >
            {/* Index */}
            <p className="font-['Orbitron'] text-[10px] text-[#0b0c0b]/30 group-hover:text-[#e53e3e]/40 mb-4 transition-colors">
              {String(i + 1).padStart(2, "0")}
            </p>
            <h3 className="font-['Orbitron'] text-[13px] font-black tracking-[1px] text-[#0b0c0b] group-hover:text-[#cbd4cc] uppercase mb-1 transition-colors">
              {g.name}
            </h3>
            <p className="font-['Rajdhani'] text-[10px] font-bold tracking-[1.5px] text-[#0b0c0b]/40 group-hover:text-[#e53e3e]/60 uppercase mb-4 transition-colors">
              {g.genre}
            </p>

            <div className="flex items-center justify-between">
              <span className="font-['Share_Tech_Mono'] text-[11px] text-[#0b0c0b]/50 group-hover:text-[#cbd4cc]/50 transition-colors">
                {g.players}
              </span>
              {g.tag && (
                <span
                  className="font-['Orbitron'] text-[8px] font-black tracking-[1px] text-[#e53e3e] group-hover:text-[#e53e3e]"
                  style={{ textShadow: "0 0 8px rgba(229,62,62,0.6)" }}
                >
                  {g.tag}
                </span>
              )}
            </div>

            {/* Corner accent */}
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 border-r border-b border-[#0b0c0b]/20 group-hover:border-[#e53e3e]/50 transition-colors" />
          </div>
        ))}
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="border-t border-[#0b0c0b]/15 px-4 sm:px-8 lg:px-[60px] py-14 lg:py-20">
      <SectionHeading index="05">PLAYER FEEDBACK</SectionHeading>
      <div className="grid grid-cols-1 gap-px bg-[#0b0c0b]/10 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <HudPanel key={t.handle} className="bg-[#cbd4cc] px-6 py-7">
            <div className="flex items-center gap-3 mb-5">
              {/* Avatar circle */}
              <div className="flex h-9 w-9 items-center justify-center border border-[#0b0c0b]/30 font-['Orbitron'] text-[11px] font-black text-[#0b0c0b]">
                {t.initials}
              </div>
              <div>
                <p className="font-['Orbitron'] text-[11px] font-black tracking-[1px] text-[#0b0c0b]">
                  {t.handle}
                </p>
                <p className="font-['Share_Tech_Mono'] text-[10px] text-[#e53e3e]" style={{ textShadow: "0 0 6px rgba(229,62,62,0.5)" }}>
                  ★★★★★
                </p>
              </div>
            </div>
            <p className="font-['Share_Tech_Mono'] text-[12px] leading-relaxed text-[#0b0c0b]/60">
              "{t.quote}"
            </p>
          </HudPanel>
        ))}
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="border-t border-[#0b0c0b]/15 px-4 sm:px-8 lg:px-[60px] py-16 lg:py-24">
      <div className="relative flex flex-col items-center text-center">
        {/* Background crosshair */}
        <span className="absolute top-0 left-1/2 -translate-x-1/2 font-mono text-[80px] font-bold text-[#0b0c0b]/[0.04] leading-none pointer-events-none select-none">+</span>

        <p className="font-['Rajdhani'] text-[11px] font-bold tracking-[4px] text-[#0b0c0b]/40 uppercase mb-5">
          06 // READY TO COMPETE?
        </p>
        <h2
          className="font-['Orbitron'] font-black uppercase text-[#0b0c0b] leading-tight tracking-tight mb-8"
          style={{ fontSize: "clamp(32px, 4.5vw, 64px)" }}
        >
          FIND YOUR
          <br />
          TEAM TODAY.
        </h2>
        <p className="font-['Share_Tech_Mono'] text-sm text-[#0b0c0b]/50 mb-10 max-w-sm">
          No subscriptions. No paywalls. Just competitive gaming.
        </p>
        <div className="group">
          <Button variant="hud" size="lg">
            <Link to="/signup" className="no-underline text-inherit">
              CREATE FREE ACCOUNT
            </Link>
          </Button>
        </div>

        {/* Bottom scanning bar */}
        <div className="mt-12 relative h-px w-48 overflow-hidden bg-[#0b0c0b]/15">
          <div className="absolute top-0 h-full w-full bg-[#e53e3e]" style={{ animation: "searchScan 2.5s infinite linear", left: "-100%" }} />
        </div>
      </div>
    </section>
  );
}

function HomeFooter() {
  return (
    <footer className="border-t border-[#0b0c0b]/20 px-4 sm:px-8 lg:px-[60px] py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="font-['Orbitron'] text-xl font-black tracking-[3px] text-[#0b0c0b]">
          MELD <span className="text-[#e53e3e]">+</span>
        </div>
        <div className="flex flex-wrap gap-8">
          {["GAMES", "ABOUT US", "TWITTER", "INSTAGRAM"].map((item) => (
            <a key={item} href="#" className="font-['Rajdhani'] text-[11px] font-bold tracking-[2px] text-[#0b0c0b]/40 uppercase hover:text-[#0b0c0b] transition-colors no-underline">
              {item}
            </a>
          ))}
        </div>
        <p className="font-['Share_Tech_Mono'] text-[10px] text-[#0b0c0b]/30">
          © {new Date().getFullYear()} MELD. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
}

// ─── Page header (same style as ArenaHeader) ─────────────────────────────────

function UserDropdown({ username, onProfile, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 font-['Rajdhani'] text-sm font-bold tracking-[1.5px] text-[#0b0c0b]/70 hover:text-[#0b0c0b] transition-colors bg-transparent border-none cursor-pointer"
      >
        {username}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 border border-[#0b0c0b]/20 bg-[#cbd4cc] z-[200]" style={{ boxShadow: "0 8px 24px rgba(11,12,11,0.15)", maxWidth: "calc(100vw - 16px)" }}>
          <span className="absolute top-0 left-0 h-2.5 w-2.5 border-l border-t border-[#0b0c0b]/40" />
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 border-r border-b border-[#0b0c0b]/40" />
          <button onClick={() => { onProfile(); setOpen(false); }} className="w-full px-4 py-3 text-left font-['Rajdhani'] text-[12px] font-bold tracking-[2px] text-[#0b0c0b]/70 uppercase hover:bg-[#0b0c0b]/5 hover:text-[#0b0c0b] transition-colors cursor-pointer bg-transparent border-none">VIEW PROFILE</button>
          <div className="h-px bg-[#0b0c0b]/10" />
          <button onClick={() => { onLogout(); setOpen(false); }} className="w-full px-4 py-3 text-left font-['Rajdhani'] text-[12px] font-bold tracking-[2px] text-[#e53e3e]/70 uppercase hover:bg-[#0b0c0b]/5 hover:text-[#e53e3e] transition-colors cursor-pointer bg-transparent border-none">LOGOUT</button>
        </div>
      )}
    </div>
  );
}

function HomeHeader({ navLogoRef, logoVisible }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const NAV_ITEMS = ["GAMES", "ABOUT US"];

  const handleLogout = () => { logout(); setMenuOpen(false); };
  const handleProfile = () => { navigate("/profile"); setMenuOpen(false); };

  return (
    <>
      <header
        className="sticky top-0 z-30 flex items-center justify-between border-b border-[#0b0c0b]/20 px-4 sm:px-8 lg:px-[60px] bg-[#cbd4cc]"
        style={{ height: 60, fontFamily: "'Share Tech Mono', monospace" }}
      >
        <div
          ref={navLogoRef}
          className={`transition-opacity duration-150 ${logoVisible ? "opacity-100" : "opacity-0"}`}
        >
          <Link to="/" className="no-underline">
            <div className="font-['Orbitron'] font-black text-xl tracking-[2px] text-[#0b0c0b] hover:opacity-60 transition-opacity">MELD</div>
          </Link>
        </div>

        <nav className="hidden md:flex gap-10">
          {NAV_ITEMS.map((item) => {
            const isGames = item === "GAMES";
            const Comp = isGames ? Link : "a";
            const props = isGames ? { to: "/games" } : { href: "#" };
            return (
              <Comp key={item} {...props} className="group relative font-['Rajdhani'] text-[13px] font-bold tracking-[3px] text-[#0b0c0b] no-underline">
                {item} <span className="text-[#e53e3e] text-[11px]">+</span>
                <span className="absolute bottom-0 left-0 h-px w-0 bg-[#0b0c0b] transition-all duration-200 group-hover:w-full" />
              </Comp>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-4 font-['Rajdhani'] text-sm font-bold tracking-[1.5px]">
          {isLoggedIn ? (
            <UserDropdown username={user?.username} onProfile={handleProfile} onLogout={handleLogout} />
          ) : (
            <>
              <Link to="/login" className="text-[#0b0c0b]/40 no-underline hover:text-[#0b0c0b] transition-colors">LOGIN</Link>
              <span className="text-[#0b0c0b]/30">/</span>
              <Link to="/signup" className="border border-[#0b0c0b] px-2 py-0.5 text-[#0b0c0b] no-underline hover:text-[#0b0c0b]/60 transition-colors">CREATE ACCOUNT</Link>
            </>
          )}
        </div>

        <button
          className="flex md:hidden h-5 w-7 flex-col justify-center gap-1.5 bg-transparent border-none cursor-pointer"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen(o => !o)}
        >
          <span className={`block h-0.5 bg-[#0b0c0b] transition-all duration-200 ${menuOpen ? "w-full translate-y-2 rotate-45" : "w-full"}`} />
          <span className={`block h-0.5 bg-[#0b0c0b] transition-all duration-200 ${menuOpen ? "opacity-0" : "w-[70%] self-end"}`} />
          <span className={`block h-0.5 bg-[#0b0c0b] transition-all duration-200 ${menuOpen ? "w-full -translate-y-2 -rotate-45" : "w-full"}`} />
        </button>
      </header>

      <div
        className={`md:hidden sticky top-[60px] z-20 overflow-hidden bg-[#cbd4cc] border-b border-[#0b0c0b]/15 transition-all duration-300 ease-in-out ${
          menuOpen ? "max-h-72 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-1 px-4 py-4">
          {NAV_ITEMS.map(item => {
            const isGames = item === "GAMES";
            const Comp = isGames ? Link : "a";
            const props = isGames ? { to: "/games" } : { href: "#" };
            return (
              <Comp key={item} {...props} onClick={() => setMenuOpen(false)}
                className="font-['Rajdhani'] text-[13px] font-bold tracking-[3px] text-[#0b0c0b]/70 py-2 no-underline hover:text-[#0b0c0b]">
                {item} <span className="text-[#e53e3e]">+</span>
              </Comp>
            );
          })}
          <div className="mt-2 flex flex-col gap-2 border-t border-[#0b0c0b]/10 pt-3">
            {isLoggedIn ? (
              <>
                <button onClick={handleProfile} className="text-left font-['Rajdhani'] text-[12px] font-bold tracking-[2px] text-[#0b0c0b]/70 uppercase hover:text-[#0b0c0b] bg-transparent border-none cursor-pointer">VIEW PROFILE</button>
                <button onClick={handleLogout} className="text-left font-['Rajdhani'] text-[12px] font-bold tracking-[2px] text-[#e53e3e]/70 uppercase hover:text-[#e53e3e] bg-transparent border-none cursor-pointer">LOGOUT</button>
              </>
            ) : (
              <div className="flex gap-4">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="font-['Rajdhani'] text-[12px] font-bold tracking-[2px] text-[#0b0c0b]/50 no-underline hover:text-[#0b0c0b]">LOGIN</Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)} className="font-['Rajdhani'] text-[12px] font-bold tracking-[2px] border border-[#0b0c0b] px-2 py-0.5 text-[#0b0c0b] no-underline hover:text-[#0b0c0b]/60">CREATE ACCOUNT</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { user, isLoggedIn } = useAuth();
  const {
    phase,
    splashLogoRef,
    navLogoRef,
    navLogoVisible,
    computeTransform,
    animDuration,
  } = useSplashAnimation();

  return (
    <div
      className="relative min-h-screen"
      style={{
        background: "#cbd4cc",
        color: "#0b0c0b",
        cursor: "none",
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: 14,
      }}
    >
      <HudBackground light={true} />

      {/* Splash — only shown on first load of this page, unmounts when phase is "done" */}
      {phase !== "done" && (
        <SplashScreen
          phase={phase}
          splashLogoRef={splashLogoRef}
          computeTransform={computeTransform}
          animDuration={animDuration}
        />
      )}

      {/* Content sits above the background */}
      <div className="relative z-[2]">
        <HomeHeader navLogoRef={navLogoRef} logoVisible={navLogoVisible} />
        <Hero username={user?.username} isLoggedIn={isLoggedIn} />
        <StatsBar />
        <FeaturesSection />
        <HowItWorks />
        <GamesSection />
        <TestimonialsSection />
        <CtaSection />
        <HomeFooter />
      </div>
    </div>
  );
}
