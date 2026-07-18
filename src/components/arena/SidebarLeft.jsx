import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function NavIcon({ type }) {
  switch (type) {
    case "lobby":
      return (
        <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "party":
      return (
        <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      );
    case "friends":
      return (
        <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "bell":
      return (
        <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
    case "rank":
      return (
        <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="7" />
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
        </svg>
      );
    default:
      return null;
  }
}

const NAV = [
  { label: "LOBBY",         icon: "lobby",   view: "lobby" },
  { label: "TOURNAMENTS",   icon: "party",   view: "tournaments" },
  { label: "FRIENDS",       icon: "friends", view: "friends" },
  { label: "NOTIFICATIONS", icon: "bell",    view: "notifications" },
  { label: "PLAYER STATS",  icon: "rank",    view: "stats" },
];

export default function SidebarLeft({ activeView, onViewChange, theme, onThemeToggle }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMicOn,       setIsMicOn]       = useState(true);
  const [isDeafenOn,    setIsDeafenOn]    = useState(false);
  const [profileOpen,   setProfileOpen]   = useState(false);
  const profileRef = useRef(null);

  // close profile card on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isDark = theme === "dark";

  // ── Theme tokens ───────────────────────────────────────────────────────────
  const bg          = isDark ? "#0d0e12"   : "#cbd4cc";
  const border      = isDark ? "rgba(255,255,255,0.08)" : "rgba(11,12,11,0.15)";
  const textPrimary = isDark ? "#e6e8eb"   : "#0b0c0b";
  const textMuted   = isDark ? "rgba(230,232,235,0.4)"  : "rgba(11,12,11,0.4)";
  const avatarBg    = isDark ? "#e6e8eb"   : "#0b0c0b";
  const avatarFg    = isDark ? "#0d0e12"   : "#cbd4cc";
  const onlineDot   = isDark ? "#0d0e12"   : "#cbd4cc"; // border color around status dot

  // active nav item: invert the theme
  const activeNavBg = isDark ? "#e6e8eb"  : "#0b0c0b";
  const activeNavFg = isDark ? "#0d0e12"  : "#cbd4cc";

  // inactive nav hover
  const inactiveHoverBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(11,12,11,0.05)";

  // control button (mic / headphones) — active (enabled) state
  const ctrlActiveBorder = isDark ? "rgba(255,255,255,0.15)" : "rgba(11,12,11,0.2)";
  const ctrlActiveColor  = isDark ? "rgba(230,232,235,0.5)"  : "rgba(11,12,11,0.5)";
  const ctrlHoverBorder  = isDark ? "rgba(255,255,255,0.35)" : "rgba(11,12,11,0.4)";
  const ctrlHoverColor   = isDark ? "#e6e8eb" : "#0b0c0b";

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 z-20 flex w-[260px] flex-col transition-colors duration-300"
      style={{
        background: bg,
        borderRight: `1px solid ${border}`,
        fontFamily: "'Share Tech Mono', monospace",
      }}
    >
      {/* ── Logo ──────────────────────────────────────── */}
      <div
        className="relative flex items-end justify-between px-6 py-5"
        style={{ borderBottom: `1px solid ${border}` }}
      >
        <span
          className="absolute top-0 left-0 h-3 w-3"
          style={{ borderLeft: `1px solid ${textPrimary}`, borderTop: `1px solid ${textPrimary}`, opacity: 0.3 }}
        />
        <div>
          <Link
            to="/"
            className="no-underline block"
            title="Back to home"
          >
            <p className="font-['Orbitron'] text-xl font-black tracking-[4px] transition-opacity hover:opacity-60" style={{ color: textPrimary }}>
              MELD
            </p>
          </Link>
          <p className="mt-0.5 font-['Rajdhani'] text-[10px] font-bold tracking-[2px] uppercase" style={{ color: textMuted }}>
            Arena Hub
          </p>
        </div>
        <span
          className="font-['Orbitron'] text-[9px] font-black tracking-[1.5px] px-2 py-0.5 uppercase"
          style={{ border: `1px solid ${textMuted}`, color: textMuted }}
        >
          BETA
        </span>
      </div>

      {/* ── Player badge ──────────────────────────────── */}
      <div className="relative px-6 py-4" style={{ borderBottom: `1px solid ${border}` }} ref={profileRef}>
        {/* Clickable badge row */}
        <button
          type="button"
          onClick={() => setProfileOpen(o => !o)}
          className="flex w-full items-center gap-3 transition-opacity hover:opacity-70"
          style={{ background: "transparent", border: "none" }}
        >
          <div
            className="relative flex h-9 w-9 shrink-0 items-center justify-center"
            style={{ background: avatarBg, border: `1px solid ${border}` }}
          >
            <span className="font-['Orbitron'] text-[11px] font-black" style={{ color: avatarFg }}>
              {user?.username?.substring(0, 2).toUpperCase() ?? "ME"}
            </span>
            <span
              className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#22c55e]"
              style={{ border: `2px solid ${onlineDot}` }}
            />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="font-['Orbitron'] text-[11px] font-black tracking-[1px] truncate" style={{ color: textPrimary }}>
              {user?.username ?? "PLAYER"}
            </p>
            <p className="font-['Rajdhani'] text-[9px] font-bold tracking-[1.5px] uppercase" style={{ color: textMuted }}>
              {user?.rank ?? "Unranked"} · {user?.region ?? "—"}
            </p>
          </div>
          {/* chevron */}
          <svg
            width="10" height="10" viewBox="0 0 10 10" fill="none"
            className="shrink-0 transition-transform duration-200"
            style={{ color: textMuted, transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Profile popover — slides down inside the sidebar */}
        {profileOpen && (
          <div
            className="mt-3 animate-fade-in"
            style={{
              border: `1px solid ${border}`,
              background: isDark ? "rgba(255,255,255,0.04)" : "rgba(11,12,11,0.04)",
            }}
          >
            {/* Corner ticks */}
            <span className="absolute" style={{ top: "auto", left: 24, bottom: -1, height: 0 }} />

            {/* Header row */}
            <div className="px-4 pt-4 pb-3" style={{ borderBottom: `1px solid ${border}` }}>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center font-['Orbitron'] text-sm font-black"
                  style={{ background: avatarBg, color: avatarFg }}
                >
                  {user?.username?.substring(0, 2).toUpperCase() ?? "ME"}
                </div>
                <div>
                  <p className="font-['Orbitron'] text-[12px] font-black tracking-[1px]" style={{ color: textPrimary }}>
                    {user?.username ?? "PLAYER"}
                  </p>
                  <p className="font-['Rajdhani'] text-[9px] font-bold tracking-[1.5px] uppercase" style={{ color: textMuted }}>
                    {user?.email ?? "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-px" style={{ background: border }}>
              {[
                { label: "RANK",   value: user?.rank   ?? "—" },
                { label: "REGION", value: user?.region ?? "—" },
                { label: "MMR",    value: user?.mmr    ?? "—" },
                { label: "ROLE",   value: user?.role   ?? "user" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="px-4 py-3"
                  style={{ background: isDark ? "#0d0e12" : "#cbd4cc" }}
                >
                  <p className="font-['Orbitron'] text-[8px] font-black tracking-[2px] uppercase mb-1" style={{ color: textMuted }}>
                    {stat.label}
                  </p>
                  <p className="font-['Orbitron'] text-[12px] font-black" style={{ color: textPrimary }}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Premium badge if applicable */}
            {user?.isPremium && (
              <div className="px-4 py-2" style={{ borderTop: `1px solid ${border}` }}>
                <span
                  className="font-['Orbitron'] text-[9px] font-black tracking-[2px] uppercase px-2 py-0.5"
                  style={{ border: "1px solid rgba(234,179,8,0.5)", color: "#eab308" }}
                >
                  PREMIUM
                </span>
              </div>
            )}

            {/* Action */}
            <div className="px-4 py-3" style={{ borderTop: `1px solid ${border}` }}>
              <button
                type="button"
                onClick={() => { setProfileOpen(false); navigate("/profile"); }}
                className="w-full py-2 font-['Rajdhani'] text-[11px] font-bold tracking-[2px] uppercase transition-colors"
                style={{
                  background: activeNavBg,
                  color: activeNavFg,
                  border: "none",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.8"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              >
                VIEW FULL PROFILE →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation ────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5">
        {NAV.map((item) => {
          const isActive = activeView === item.view;
          return (
            <button
              key={item.view}
              type="button"
              onClick={() => onViewChange(item.view)}
              className="relative flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors duration-150"
              style={{
                background: isActive ? activeNavBg : "transparent",
                color: isActive ? activeNavFg : textMuted,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = inactiveHoverBg;
                  e.currentTarget.style.color = textPrimary;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = textMuted;
                }
              }}
            >
              {isActive && (
                <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#e53e3e]" />
              )}
              <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                <NavIcon type={item.icon} />
              </span>
              <span className="flex-1 font-['Rajdhani'] text-[12px] font-bold tracking-[2px] uppercase">
                {item.label}
              </span>
              {item.badge && (
                <span
                  className="font-['Orbitron'] text-[8px] font-black tracking-[0.5px] px-1.5 py-0.5"
                  style={{ border: "1px solid rgba(229,62,62,0.6)", color: "#e53e3e" }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Voice controls ────────────────────────────── */}
      <div className="px-6 py-4" style={{ borderTop: `1px solid ${border}` }}>
        <p
          className="font-['Orbitron'] text-[9px] font-black tracking-[2px] uppercase mb-3"
          style={{ color: textMuted }}
        >
          Voice Controls
        </p>
        <div className="flex items-center gap-2">
          {/* Mic */}
          <button
            onClick={() => setIsMicOn(!isMicOn)}
            title={isMicOn ? "Mute" : "Unmute"}
            className="flex h-8 w-8 items-center justify-center transition-colors"
            style={{
              border: isMicOn
                ? `1px solid ${ctrlActiveBorder}`
                : "1px solid rgba(229,62,62,0.5)",
              color: isMicOn ? ctrlActiveColor : "#e53e3e",
            }}
            onMouseEnter={(e) => {
              if (isMicOn) {
                e.currentTarget.style.borderColor = ctrlHoverBorder;
                e.currentTarget.style.color = ctrlHoverColor;
              }
            }}
            onMouseLeave={(e) => {
              if (isMicOn) {
                e.currentTarget.style.borderColor = ctrlActiveBorder;
                e.currentTarget.style.color = ctrlActiveColor;
              }
            }}
          >
            {isMicOn ? (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="1" x2="23" y1="1" y2="23" />
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6" />
                <path d="M17 11.5a7 7 0 0 1-2.12 4.88M12 22v-3" />
                <path d="M5 10v1a7 7 0 0 0 3.28 5.89" />
              </svg>
            )}
          </button>

          {/* Headphones */}
          <button
            onClick={() => setIsDeafenOn(!isDeafenOn)}
            title={isDeafenOn ? "Undeafen" : "Deafen"}
            className="flex h-8 w-8 items-center justify-center transition-colors"
            style={{
              border: !isDeafenOn
                ? `1px solid ${ctrlActiveBorder}`
                : "1px solid rgba(229,62,62,0.5)",
              color: !isDeafenOn ? ctrlActiveColor : "#e53e3e",
            }}
            onMouseEnter={(e) => {
              if (!isDeafenOn) {
                e.currentTarget.style.borderColor = ctrlHoverBorder;
                e.currentTarget.style.color = ctrlHoverColor;
              }
            }}
            onMouseLeave={(e) => {
              if (!isDeafenOn) {
                e.currentTarget.style.borderColor = ctrlActiveBorder;
                e.currentTarget.style.color = ctrlActiveColor;
              }
            }}
          >
            {!isDeafenOn ? (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="1" x2="23" y1="1" y2="23" />
                <path d="M6.21 6.21A9 9 0 0 1 21 12v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
                <path d="M3 14h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-5a9 9 0 0 1 .4-2.6" />
              </svg>
            )}
          </button>

          {/* Theme toggle — shows sun in dark mode, moon in light mode */}
          <button
            onClick={onThemeToggle}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="ml-auto flex h-8 w-8 items-center justify-center transition-colors"
            style={{ border: `1px solid ${ctrlActiveBorder}`, color: ctrlActiveColor }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = ctrlHoverBorder;
              e.currentTarget.style.color = ctrlHoverColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = ctrlActiveBorder;
              e.currentTarget.style.color = ctrlActiveColor;
            }}
          >
            {isDark ? (
              /* Sun icon — click to go light */
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              /* Moon icon — click to go dark */
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* bottom-right corner tick */}
      <span
        className="pointer-events-none absolute bottom-0 right-0 h-3 w-3"
        style={{ borderRight: `1px solid ${textPrimary}`, borderBottom: `1px solid ${textPrimary}`, opacity: 0.3 }}
      />
    </aside>
  );
}
