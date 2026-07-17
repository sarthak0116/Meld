import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function UserDropdown({ username, onProfile, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 font-['Rajdhani'] text-sm font-bold tracking-[1.5px] text-[#0b0c0b]/70 hover:text-[#0b0c0b] transition-colors bg-transparent border-none cursor-pointer"
      >
        {username}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-44 border border-[#0b0c0b]/20 bg-[#cbd4cc] z-[200]"
          style={{ boxShadow: "0 8px 24px rgba(11,12,11,0.12)" }}
        >
          <span className="absolute top-0 left-0 h-2.5 w-2.5 border-l border-t border-[#0b0c0b]/40" />
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 border-r border-b border-[#0b0c0b]/40" />
          <button
            onClick={() => { onProfile(); setOpen(false); }}
            className="w-full px-4 py-3 text-left font-['Rajdhani'] text-[12px] font-bold tracking-[2px] text-[#0b0c0b]/70 uppercase hover:bg-[#0b0c0b]/5 hover:text-[#0b0c0b] transition-colors cursor-pointer bg-transparent border-none"
          >
            VIEW PROFILE
          </button>
          <div className="h-px bg-[#0b0c0b]/10" />
          <button
            onClick={() => { onLogout(); setOpen(false); }}
            className="w-full px-4 py-3 text-left font-['Rajdhani'] text-[12px] font-bold tracking-[2px] text-[#e53e3e]/70 uppercase hover:bg-[#0b0c0b]/5 hover:text-[#e53e3e] transition-colors cursor-pointer bg-transparent border-none"
          >
            LOGOUT
          </button>
        </div>
      )}
    </div>
  );
}

export default function ArenaHeader({ onInfoClick }) {
  const [menuOpen, setMenuOpen]  = useState(false);
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout  = () => { logout(); navigate("/"); setMenuOpen(false); };
  const handleProfile = () => { navigate("/profile"); setMenuOpen(false); };

  const NAV_ITEMS = ["GAMES"];

  return (
    <>
      <header
        className="col-span-full flex items-center justify-between border-b border-[#0b0c0b]/15 pb-4"
        style={{ fontFamily: "'Share Tech Mono', monospace" }}
      >
        {/* Left — title + status */}
        <div className="flex items-end gap-5">
          <div className="border-l-2 border-[#0b0c0b]/20 pl-4">
            <p className="font-['Orbitron'] text-[9px] font-black tracking-[4px] text-[#0b0c0b]/35 uppercase">
              ARENA <span className="text-[#e53e3e]">+</span>
            </p>
            <h1 className="font-['Orbitron'] text-xl font-black tracking-[3px] text-[#0b0c0b] uppercase leading-none mt-1">
              HUB
            </h1>
          </div>

          {/* Live indicator */}
          <div className="hidden md:flex items-center gap-2 mb-0.5">
            <span
              className="h-1.5 w-1.5 rounded-full bg-[#e53e3e]"
              style={{ boxShadow: "0 0 6px rgba(229,62,62,0.8)" }}
            />
            <span className="font-['Orbitron'] text-[9px] font-black tracking-[2px] text-[#e53e3e]">LIVE</span>
          </div>
        </div>

        {/* Centre nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item}
              to="/games"
              className="group relative font-['Rajdhani'] text-[12px] font-bold tracking-[3px] text-[#0b0c0b]/50 no-underline hover:text-[#0b0c0b] transition-colors"
            >
              {item} <span className="text-[#e53e3e] text-[10px]">+</span>
              <span className="absolute bottom-0 left-0 h-px w-0 bg-[#0b0c0b] transition-all duration-200 group-hover:w-full" />
            </Link>
          ))}

          {/* Info button */}
          {onInfoClick && (
            <button
              onClick={onInfoClick}
              className="font-['Rajdhani'] text-[12px] font-bold tracking-[3px] text-[#0b0c0b]/40 uppercase hover:text-[#0b0c0b] transition-colors bg-transparent border-none cursor-pointer"
            >
              STATUS <span className="text-[#e53e3e] text-[10px]">+</span>
            </button>
          )}
        </nav>

        {/* Right — user */}
        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <UserDropdown
              username={user?.username}
              onProfile={handleProfile}
              onLogout={handleLogout}
            />
          ) : (
            <div className="flex items-center gap-3 font-['Rajdhani'] text-sm font-bold tracking-[1.5px]">
              <Link to="/login" className="text-[#0b0c0b]/40 no-underline hover:text-[#0b0c0b] transition-colors">LOGIN</Link>
              <span className="text-[#0b0c0b]/20">/</span>
              <Link to="/signup" className="border border-[#0b0c0b] px-2 py-0.5 text-[#0b0c0b] no-underline hover:text-[#0b0c0b]/60 transition-colors">
                CREATE ACCOUNT
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex md:hidden h-5 w-7 flex-col justify-center gap-1.5 bg-transparent border-none cursor-pointer"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className={`block h-0.5 bg-[#0b0c0b] transition-all duration-200 ${menuOpen ? "w-full translate-y-2 rotate-45" : "w-full"}`} />
          <span className={`block h-0.5 bg-[#0b0c0b] transition-all duration-200 ${menuOpen ? "opacity-0" : "w-[70%] self-end"}`} />
          <span className={`block h-0.5 bg-[#0b0c0b] transition-all duration-200 ${menuOpen ? "w-full -translate-y-2 -rotate-45" : "w-full"}`} />
        </button>
      </header>

      {/* Mobile drawer */}
      <div
        className={`md:hidden overflow-hidden bg-[#cbd4cc] border-b border-[#0b0c0b]/15 transition-all duration-300 ${
          menuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-1 px-4 py-4">
          <Link
            to="/games"
            onClick={() => setMenuOpen(false)}
            className="font-['Rajdhani'] text-[13px] font-bold tracking-[3px] text-[#0b0c0b]/70 py-2 no-underline hover:text-[#0b0c0b]"
          >
            GAMES <span className="text-[#e53e3e]">+</span>
          </Link>
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
