const NAV_NUMBERS = ["01", "02", "03", "04", "05", "06"];
const ACTIVE_NUM = "03";

const SOCIAL_LINKS = ["TWITTER", "INSTAGRAM"];

/**
 * Left sidebar:
 *   - Vertical nav numbers
 *   - Giant ghosted "MELD" title (rotated)
 *   - VS badge
 *   - Matchmaking progress bar
 *   - Social links
 */
export default function SidebarLeft() {
  return (
    <aside className="relative z-20 flex flex-col justify-between pt-10 pb-5">
      {/* Nav numbers */}
      <div className="flex flex-col gap-5 font-['Orbitron'] text-[13px] font-medium">
        {NAV_NUMBERS.map((n) => (
          <div
            key={n}
            className={`relative cursor-pointer pl-3 transition-colors ${
              n === ACTIVE_NUM
                ? "font-bold text-[#0b0c0b] before:absolute before:left-0 before:top-1/2 before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full before:bg-[#0b0c0b] before:content-['']"
                : "text-[#0b0c0b]/40 hover:text-[#0b0c0b]/70"
            }`}
          >
            {n}
          </div>
        ))}
      </div>

      {/* Ghost vertical title — exact replica of original CSS:
          position:absolute, left:70px, top:30%,
          transform-origin:left top, transform:rotate(-90deg) translate(-50%,0) */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: 70,
          top: "30%",
          transformOrigin: "left top",
          transform: "rotate(-90deg) translate(-50%, 0)",
          fontFamily: "'Orbitron', sans-serif",
          display: "flex",
          alignItems: "flex-end",
          gap: 15,
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700, fontSize: 14, color: "#0b0c0b", transform: "translateY(-10px)", display: "inline-block" }}>
          VS
        </span>
        <span style={{ fontSize: 130, fontWeight: 900, letterSpacing: -2, lineHeight: 1, color: "rgba(11,12,11,0.12)", transform: "scaleY(1.7)", display: "inline-block" }}>
          MELD
        </span>
      </div>

      {/* VS large badge */}
      <div className="font-['Orbitron'] text-[56px] font-black leading-none tracking-tight text-[#0b0c0b] mb-6">
        VS
      </div>

      {/* Matchmaking progress bar */}
      <div className="mb-8 w-[220px]">
        <p className="mb-2 font-['Orbitron'] text-[11px] font-black tracking-[2px] text-[#0b0c0b] uppercase">
          Challenge Your Game
        </p>
        <div className="relative h-1 w-full overflow-hidden bg-[#0b0c0b]/15">
          <div
            className="absolute top-0 h-full w-full bg-[#e53e3e]"
            style={{
              animation: "searchScan 2.5s infinite linear",
              left: "-100%",
            }}
          />
        </div>
      </div>

      {/* Social links */}
      <div className="flex gap-6">
        {SOCIAL_LINKS.map((s) => (
          <a
            key={s}
            href="#"
            className="font-['Rajdhani'] text-[11px] font-semibold tracking-[1px] text-[#0b0c0b]/40 no-underline transition-colors hover:text-[#0b0c0b]"
          >
            {s}
          </a>
        ))}
      </div>
    </aside>
  );
}
