export default function GameFilters({
  genres,
  platforms,
  selectedGenre,
  selectedPlatform,
  onGenreChange,
  onPlatformChange
}) {
  return (
    <div className="flex flex-col gap-6 mb-8">
      <div>
        <p className="mb-2 font-['Orbitron'] text-[10px] font-black tracking-[2px] text-[#0b0c0b]/50 uppercase">
          GENRE
        </p>
        <div className="flex flex-wrap gap-2">
          {["ALL", ...genres].map(genre => {
            const active = selectedGenre === genre;
            return (
              <button
                key={genre}
                type="button"
                onClick={() => onGenreChange(genre)}
                className={`font-['Rajdhani'] text-[11px] font-bold tracking-[1px] border px-3 py-1.5 uppercase transition-all cursor-pointer ${
                  active
                    ? "bg-[#0b0c0b] text-[#cbd4cc] border-[#0b0c0b]"
                    : "bg-transparent text-[#0b0c0b]/50 border-[#0b0c0b]/20 hover:border-[#0b0c0b]/50"
                }`}
                style={{ borderRadius: 0 }}
              >
                {genre}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <p className="mb-2 font-['Orbitron'] text-[10px] font-black tracking-[2px] text-[#0b0c0b]/50 uppercase">
          PLATFORM
        </p>
        <div className="flex flex-wrap gap-2">
          {["ALL", ...platforms].map(platform => {
            const active = selectedPlatform === platform;
            return (
              <button
                key={platform}
                type="button"
                onClick={() => onPlatformChange(platform)}
                className={`font-['Rajdhani'] text-[11px] font-bold tracking-[1px] border px-3 py-1.5 uppercase transition-all cursor-pointer ${
                  active
                    ? "bg-[#0b0c0b] text-[#cbd4cc] border-[#0b0c0b]"
                    : "bg-transparent text-[#0b0c0b]/50 border-[#0b0c0b]/20 hover:border-[#0b0c0b]/50"
                }`}
                style={{ borderRadius: 0 }}
              >
                {platform}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
