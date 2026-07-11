import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

function NavIcon({ type }) {
  switch (type) {
    case 'lobby':
      return (
        <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case 'party':
      return (
        <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      );
    case 'friends':
      return (
        <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'bell':
      return (
        <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
    case 'rank':
      return (
        <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="7" />
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
        </svg>
      );
    default:
      return null;
  }
}

export default function SidebarLeft({ activeView, onViewChange, theme, onThemeToggle }) {
  const { user } = useAuth();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isDeafenOn, setIsDeafenOn] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setShowSettings(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isDark = theme === "dark";

  // Dynamic theme variables
  const sidebarBg = isDark ? "bg-[#0d0e12]/95 text-[#e6e8eb]" : "bg-[#cbd4cc]/95 text-[#0b0c0b]";
  const sidebarBorder = isDark ? "border-[#ffffff]/10" : "border-[#0b0c0b]/15";
  const titleColor = isDark ? "text-[#fb923c]" : "text-[#ea580c]";
  const subtitleColor = isDark ? "text-[#ffffff]/60" : "text-[#0b0c0b]/60";
  const badgeBg = isDark ? "bg-[#fb923c]/10 border-[#fb923c]/30 text-[#fb923c]" : "bg-[#ea580c]/15 border-[#ea580c]/30 text-[#ea580c]";
  
  const navItemActive = "bg-[#fb923c] text-black shadow-[0_4px_15px_rgba(251,146,96,0.25)]";
  const navItemInactive = isDark 
    ? "text-[#e6e8eb]/70 hover:bg-[#fb923c]/10 hover:text-[#fb923c]" 
    : "text-[#0b0c0b]/75 hover:bg-[#ea580c]/10 hover:text-[#ea580c]";

  const settingsBoxBg = isDark ? "bg-[#0d1016]/90" : "bg-[#ffffff]/90";
  const popoverBg = isDark ? "bg-[#0d0e12]/95" : "bg-[#ffffff]/95";

  return (
    <aside className={`fixed left-0 top-0 bottom-0 z-20 flex w-[280px] flex-col justify-between rounded-br-[36px] border-r ${isDark ? "border-orange-500/10" : "border-orange-500/20"} ${sidebarBg} backdrop-blur-md p-6 shadow-[0_24px_80px_rgba(0,0,0,0.3)] animate-sidebar-in transition-all duration-300`}>
      <div className="flex-1 min-h-0 flex flex-col">
        {/* Header Block */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className={`font-['Orbitron'] text-[22px] font-black uppercase tracking-[5px] ${titleColor}`}>
              MELD
            </p>
            <p className={`mt-1 text-xs font-semibold uppercase tracking-[1px] ${subtitleColor}`}>
              Game hub
            </p>
          </div>
          <div className="flex flex-col items-end gap-2.5">
            <div className={`rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[2px] ${badgeBg}`}>
              beta
            </div>
            
            {/* Small Switch below Beta badge */}
            <button
              onClick={onThemeToggle}
              type="button"
              className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${
                theme === "dark" ? "bg-[#fb923c]" : "bg-gray-400"
              }`}
            >
              <span
                className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${
                  theme === "dark" ? "translate-x-4.5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          <nav className="space-y-1">
            {[
              { label: 'Lobby', icon: 'lobby', view: 'lobby' },
              { label: 'Tournaments', icon: 'party', view: 'tournaments' },
              { label: 'Friends', icon: 'friends', badge: '7', view: 'friends' },
              { label: 'Notifications', icon: 'bell', view: 'notifications' },
            ].map((item) => {
              const isActive = activeView === item.view;
              return (
                <button
                  key={item.label}
                  type="button"
                  aria-label={item.label}
                  onClick={() => onViewChange(item.view)}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-xs font-black uppercase tracking-[1.5px] transition-all rounded-lg group ${
                    isActive ? navItemActive : navItemInactive
                  }`}
                >
                  <span className={`flex h-5 w-5 items-center justify-center transition-transform group-hover:scale-110 ${isActive ? "text-black" : (isDark ? "text-[#fb923c]" : "text-[#ea580c]")}`}>
                    <NavIcon type={item.icon} />
                  </span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="rounded bg-[#e53e3e]/20 border border-[#e53e3e]/40 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[1px] text-[#e53e3e]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Dedicated Player Section */}
      <div className={`mt-4 pt-4 border-t ${sidebarBorder}`}>
        <p className={`font-['Orbitron'] text-[9px] font-black uppercase tracking-[2.5px] ${isDark ? "text-[#fb923c]/70" : "text-[#ea580c]/70"} mb-2`}>
          Player Profile
        </p>
        <button
          type="button"
          onClick={() => onViewChange("stats")}
          className={`flex w-full items-center gap-3 px-3 py-2.5 text-xs font-black uppercase tracking-[1.5px] transition-all rounded-lg group ${
            activeView === 'stats' ? navItemActive : navItemInactive
          }`}
        >
          <span className={`flex h-5 w-5 items-center justify-center transition-transform group-hover:scale-110 ${activeView === 'stats' ? "text-black" : (isDark ? "text-[#fb923c]" : "text-[#ea580c]")}`}>
            <NavIcon type="rank" />
          </span>
          <span className="flex-1 text-left">Player Stats</span>
        </button>
      </div>

      {/* Enhanced Settings Control Box */}
      <div className={`mt-4 rounded-2xl border ${sidebarBorder} ${settingsBoxBg} p-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)] relative`} ref={settingsRef}>
        
        {/* Settings Popover Overlay */}
        {showSettings && (
          <div className={`absolute left-[calc(100%+12px)] bottom-0 w-56 rounded-2xl border ${sidebarBorder} ${popoverBg} p-4 shadow-[0_15px_50px_rgba(0,0,0,0.5)] backdrop-blur-md animate-fade-in z-[30]`}>
            <h4 className={`font-['Orbitron'] text-[10px] font-black tracking-[2px] ${isDark ? "text-[#fb923c]" : "text-[#ea580c]"} uppercase mb-1`}>Settings</h4>
            <p className={`text-[9px] ${subtitleColor}`}>Configure microphone and audio settings from the controls box.</p>
            
            {/* Popover corners */}
            <span className={`absolute top-0 left-0 h-2 w-2 border-l border-t ${isDark ? "border-[#fb923c]/40" : "border-[#ea580c]/40"} rounded-tl-lg`} />
            <span className={`absolute bottom-0 right-0 h-2 w-2 border-r border-b ${isDark ? "border-[#fb923c]/40" : "border-[#ea580c]/40"} rounded-br-lg`} />
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          {/* Mic Button */}
          <button 
            onClick={() => setIsMicOn(!isMicOn)}
            title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
            className={`flex h-9 items-center justify-center rounded-lg transition-all ${
              isMicOn 
                ? (isDark ? "bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/30 hover:bg-[#34d399]/20" : "bg-[#34d399]/20 text-[#047857] border border-[#34d399]/40 hover:bg-[#34d399]/30") 
                : "bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20"
            }`}
          >
            {isMicOn ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="1" x2="23" y1="1" y2="23" />
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6" />
                <path d="M17 11.5a7 7 0 0 1-2.12 4.88M12 22v-3" />
                <path d="M5 10v1a7 7 0 0 0 3.28 5.89" />
              </svg>
            )}
          </button>

          {/* Headphones (Deafen) Button */}
          <button 
            onClick={() => setIsDeafenOn(!isDeafenOn)}
            title={isDeafenOn ? "Undeafen Audio" : "Deafen Audio"}
            className={`flex h-9 items-center justify-center rounded-lg transition-all ${
              !isDeafenOn 
                ? (isDark ? "bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/30 hover:bg-[#34d399]/20" : "bg-[#34d399]/20 text-[#047857] border border-[#34d399]/40 hover:bg-[#34d399]/30") 
                : "bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20"
            }`}
          >
            {!isDeafenOn ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="1" x2="23" y1="1" y2="23" />
                <path d="M6.21 6.21A9 9 0 0 1 21 12v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
                <path d="M3 14h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-5a9 9 0 0 1 .4-2.6" />
              </svg>
            )}
          </button>

          {/* Settings Button */}
          <button 
            onClick={() => setShowSettings(!showSettings)}
            title="Settings"
            className={`flex h-9 items-center justify-center rounded-lg border transition-all cursor-pointer ${
              showSettings 
                ? "bg-[#fb923c] text-black border-[#fb923c]" 
                : (isDark ? "bg-[#ffffff]/5 text-[#cbd4cc] border-[#ffffff]/10 hover:bg-[#ffffff]/10 hover:text-white" : "bg-[#0b0c0b]/5 text-[#0b0c0b] border-[#0b0c0b]/15 hover:bg-[#0b0c0b]/10")
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
