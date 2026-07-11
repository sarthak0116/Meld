import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = ["GAMES", "LOBBIES", "ABOUT US"];
const NAV_ROUTES = { GAMES: "/games", LOBBIES: "/lobbies" };

function UserDropdown({ username, onProfile, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
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
        {/* Down arrow */}
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-44 border border-[#0b0c0b]/20 bg-[#cbd4cc] z-[200]"
          style={{ boxShadow: "0 8px 24px rgba(11,12,11,0.15)", maxWidth: "calc(100vw - 16px)" }}
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

export default function ArenaHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/"); setMenuOpen(false); };
  const handleProfile = () => { navigate("/profile"); setMenuOpen(false); };

  return (
    <>
      <header className="col-span-full flex items-center justify-between border-b border-[#0b0c0b]/20 pb-4 z-20">
        <div className="font-['Orbitron'] font-black text-xl tracking-[2px] text-[#0b0c0b]">MELD</div>

        <nav className="hidden gap-10 md:flex">
          {NAV_ITEMS.map((item) => {
            const to = NAV_ROUTES[item];
            const Comp = to ? Link : "a";
            const props = to ? { to } : { href: "#" };
            return (
              <Comp key={item} {...props} className="group relative font-['Rajdhani'] text-[13px] font-bold tracking-[3px] text-[#0b0c0b] no-underline">
                {item} <span className="text-[#e53e3e] text-[11px]">+</span>
                <span className="absolute bottom-0 left-0 h-px w-0 bg-[#0b0c0b] transition-all duration-200 group-hover:w-full" />
              </Comp>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-3 font-['Rajdhani'] text-sm font-bold tracking-[1.5px] md:flex">
            {isLoggedIn ? (
              <UserDropdown
                username={user?.username}
                onProfile={handleProfile}
                onLogout={handleLogout}
              />
            ) : (
              <>
                <Link to="/signup" className="text-[#0b0c0b]/40 no-underline transition-colors hover:text-[#0b0c0b]">CREATE ACCOUNT</Link>
                <span className="text-[#0b0c0b]/40">/</span>
                <Link to="/login" className="border border-[#0b0c0b] px-1 py-0.5 text-[#0b0c0b] no-underline transition-colors hover:text-[#0b0c0b]/60">LOGIN</Link>
              </>
            )}
          </div>

          <button
            className="flex h-5 w-7 flex-col justify-center gap-1.5 bg-transparent border-none cursor-pointer md:hidden"
            aria-label="Menu"
            onClick={() => setMenuOpen(o => !o)}
          >
            <span className={`block h-0.5 bg-[#0b0c0b] transition-all duration-200 ${menuOpen ? "w-full translate-y-2 rotate-45" : "w-full"}`} />
            <span className={`block h-0.5 bg-[#0b0c0b] transition-all duration-200 ${menuOpen ? "opacity-0 w-full" : "w-[70%] self-end"}`} />
            <span className={`block h-0.5 bg-[#0b0c0b] transition-all duration-200 ${menuOpen ? "w-full -translate-y-2 -rotate-45" : "w-full"}`} />
          </button>
        </div>
      </header>

      {/* Mobile dropdown */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-b border-[#0b0c0b]/15 bg-[#cbd4cc] z-30 ${
          menuOpen ? "max-h-72 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-1 px-4 py-4">
          {NAV_ITEMS.map(item => {
            const to = NAV_ROUTES[item];
            const Comp = to ? Link : "a";
            const props = to ? { to } : { href: "#" };
            return (
              <Comp key={item} {...props} onClick={() => setMenuOpen(false)} className="font-['Rajdhani'] text-[13px] font-bold tracking-[3px] text-[#0b0c0b]/70 py-2 no-underline hover:text-[#0b0c0b]">
                {item} <span className="text-[#e53e3e]">+</span>
              </Comp>
            );
          })}
          <div className="mt-2 flex flex-col gap-2 border-t border-[#0b0c0b]/10 pt-3">
            {isLoggedIn ? (
              <>
                <button
                  onClick={handleProfile}
                  className="text-left font-['Rajdhani'] text-[12px] font-bold tracking-[2px] text-[#0b0c0b]/70 uppercase hover:text-[#0b0c0b] bg-transparent border-none cursor-pointer"
                >
                  VIEW PROFILE
                </button>
                <button
                  onClick={handleLogout}
                  className="text-left font-['Rajdhani'] text-[12px] font-bold tracking-[2px] text-[#e53e3e]/70 uppercase hover:text-[#e53e3e] bg-transparent border-none cursor-pointer"
                >
                  LOGOUT
                </button>
              </>
            ) : (
              <div className="flex gap-4">
                <Link to="/signup" onClick={() => setMenuOpen(false)} className="font-['Rajdhani'] text-[12px] font-bold tracking-[2px] text-[#0b0c0b]/50 no-underline hover:text-[#0b0c0b]">CREATE ACCOUNT</Link>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="font-['Rajdhani'] text-[12px] font-bold tracking-[2px] border border-[#0b0c0b] px-2 py-0.5 text-[#0b0c0b] no-underline hover:text-[#0b0c0b]/60">LOGIN</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
