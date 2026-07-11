import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [];

function UserDropdown({ username, onProfile, onLogout, theme }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dropdownBg = theme === "dark" ? "bg-[#0d1016]" : "bg-[#cbd4cc]";
  const dropdownText = theme === "dark" ? "text-[#cbd4cc]" : "text-[#0b0c0b]";
  const dropdownBorder = theme === "dark" ? "border-[#ffffff]/10" : "border-[#0b0c0b]/20";
  const dropdownHover = theme === "dark" ? "hover:bg-[#ffffff]/5" : "hover:bg-[#0b0c0b]/5";

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 font-['Rajdhani'] text-sm font-bold tracking-[1.5px] ${theme === "dark" ? "text-white hover:text-[#fb923c]" : "text-[#0b0c0b] hover:text-[#fb923c]"} transition-colors bg-transparent border-none cursor-pointer`}
      >
        {username}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="ml-2">
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className={`absolute right-0 top-full mt-2 w-44 border ${dropdownBorder} ${dropdownBg} z-[200]`}
          style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.3)", maxWidth: "calc(100vw - 16px)" }}
        >
          <span className={`absolute top-0 left-0 h-2.5 w-2.5 border-l border-t ${theme === "dark" ? "border-[#ffffff]/20" : "border-[#0b0c0b]/40"}`} />
          <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 border-r border-b ${theme === "dark" ? "border-[#ffffff]/20" : "border-[#0b0c0b]/40"}`} />
          <button
            onClick={() => { onProfile(); setOpen(false); }}
            className={`w-full px-4 py-3 text-left font-['Rajdhani'] text-[12px] font-bold tracking-[2px] ${dropdownText}/70 uppercase ${dropdownHover} transition-colors cursor-pointer bg-transparent border-none`}
          >
            VIEW PROFILE
          </button>
          <div className={`h-px ${theme === "dark" ? "bg-[#ffffff]/10" : "bg-[#0b0c0b]/10"}`} />
          <button
            onClick={() => { onLogout(); setOpen(false); }}
            className={`w-full px-4 py-3 text-left font-['Rajdhani'] text-[12px] font-bold tracking-[2px] text-[#e53e3e]/70 uppercase ${dropdownHover} transition-colors cursor-pointer bg-transparent border-none`}
          >
            LOGOUT
          </button>
        </div>
      )}
    </div>
  );
}

export default function ArenaHeader({ theme }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/"); setMenuOpen(false); };
  const handleProfile = () => { navigate("/profile"); setMenuOpen(false); };

  const borderClass = theme === "dark" ? "border-[#ffffff]/10" : "border-[#0b0c0b]/20";
  const titleColor = theme === "dark" ? "text-white" : "text-[#0b0c0b]";
  const linkColor = theme === "dark" ? "text-[#cbd4cc]" : "text-[#0b0c0b]";

  return (
    <>
      <header className={`col-span-full flex items-center justify-between border-b ${borderClass} pb-4 z-20`}>
        <div className={`font-['Orbitron'] font-black text-xl tracking-[2px] ${titleColor}`}>MELD</div>

        <nav className="hidden gap-10 md:flex">
<<<<<<< HEAD
          {NAV_ITEMS.map((item) => (
            <a key={item} href="#" className={`group relative font-['Rajdhani'] text-[13px] font-bold tracking-[3px] ${linkColor} no-underline`}>
              {item} <span className="text-[#e53e3e] text-[11px]">+</span>
              <span className={`absolute bottom-0 left-0 h-px w-0 ${theme === "dark" ? "bg-white" : "bg-[#0b0c0b]"} transition-all duration-200 group-hover:w-full`} />
            </a>
          ))}
=======
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
>>>>>>> da7eaa9e7bfb39280b1fad364842d7fa8c622734
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-3 font-['Rajdhani'] text-sm font-bold tracking-[1.5px] md:flex">
            {isLoggedIn ? (
              <UserDropdown
                username={user?.username}
                onProfile={handleProfile}
                onLogout={handleLogout}
                theme={theme}
              />
            ) : (
              <>
                <Link to="/signup" className={`${theme === "dark" ? "text-[#cbd4cc]/60 hover:text-white" : "text-[#0b0c0b]/40 hover:text-[#0b0c0b]"} no-underline transition-colors`}>CREATE ACCOUNT</Link>
                <span className={theme === "dark" ? "text-[#cbd4cc]/40" : "text-[#0b0c0b]/40"}>/</span>
                <Link to="/login" className={`border ${theme === "dark" ? "border-white text-white hover:text-[#cbd4cc]" : "border-[#0b0c0b] text-[#0b0c0b] hover:text-[#0b0c0b]/60"} px-1 py-0.5 no-underline transition-colors`}>LOGIN</Link>
              </>
            )}
          </div>

          <button
            className="flex h-5 w-7 flex-col justify-center gap-1.5 bg-transparent border-none cursor-pointer md:hidden"
            aria-label="Menu"
            onClick={() => setMenuOpen(o => !o)}
          >
            <span className={`block h-0.5 ${theme === "dark" ? "bg-white" : "bg-[#0b0c0b]"} transition-all duration-200 ${menuOpen ? "w-full translate-y-2 rotate-45" : "w-full"}`} />
            <span className={`block h-0.5 ${theme === "dark" ? "bg-white" : "bg-[#0b0c0b]"} transition-all duration-200 ${menuOpen ? "opacity-0 w-full" : "w-[70%] self-end"}`} />
            <span className={`block h-0.5 ${theme === "dark" ? "bg-white" : "bg-[#0b0c0b]"} transition-all duration-200 ${menuOpen ? "w-full -translate-y-2 -rotate-45" : "w-full"}`} />
          </button>
        </div>
      </header>

      {/* Mobile dropdown */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-b ${theme === "dark" ? "border-[#ffffff]/10 bg-[#0d1016]" : "border-[#0b0c0b]/15 bg-[#cbd4cc]"} z-30 ${
          menuOpen ? "max-h-72 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-1 px-4 py-4">
<<<<<<< HEAD
          {NAV_ITEMS.map(item => (
            <a key={item} href="#" onClick={() => setMenuOpen(false)} className={`font-['Rajdhani'] text-[13px] font-bold tracking-[3px] ${theme === "dark" ? "text-[#cbd4cc]/70 hover:text-white" : "text-[#0b0c0b]/70 hover:text-[#0b0c0b]"} py-2 no-underline`}>
              {item} <span className="text-[#e53e3e]">+</span>
            </a>
          ))}
          <div className={`mt-2 flex flex-col gap-2 border-t ${theme === "dark" ? "border-[#ffffff]/10" : "border-[#0b0c0b]/10"} pt-3`}>
=======
          {NAV_ITEMS.map(item => {
            const isGames = item === "GAMES";
            const Comp = isGames ? Link : "a";
            const props = isGames ? { to: "/games" } : { href: "#" };
            return (
              <Comp key={item} {...props} onClick={() => setMenuOpen(false)} className="font-['Rajdhani'] text-[13px] font-bold tracking-[3px] text-[#0b0c0b]/70 py-2 no-underline hover:text-[#0b0c0b]">
                {item} <span className="text-[#e53e3e]">+</span>
              </Comp>
            );
          })}
          <div className="mt-2 flex flex-col gap-2 border-t border-[#0b0c0b]/10 pt-3">
>>>>>>> da7eaa9e7bfb39280b1fad364842d7fa8c622734
            {isLoggedIn ? (
              <>
                <button
                  onClick={handleProfile}
                  className={`text-left font-['Rajdhani'] text-[12px] font-bold tracking-[2px] ${theme === "dark" ? "text-[#cbd4cc]/70 hover:text-white" : "text-[#0b0c0b]/70 hover:text-[#0b0c0b]"} uppercase bg-transparent border-none cursor-pointer`}
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
              <>
                <Link to="/signup" onClick={() => setMenuOpen(false)} className={`font-['Rajdhani'] text-[12px] font-bold tracking-[2px] ${theme === "dark" ? "text-[#cbd4cc]/70 hover:text-white" : "text-[#0b0c0b]/70 hover:text-[#0b0c0b]"} no-underline`}>CREATE ACCOUNT</Link>
                <Link to="/login" onClick={() => setMenuOpen(false)} className={`font-['Rajdhani'] text-[12px] font-bold tracking-[2px] ${theme === "dark" ? "text-[#cbd4cc]/70 hover:text-white" : "text-[#0b0c0b]/70 hover:text-[#0b0c0b]"} no-underline`}>LOGIN</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
