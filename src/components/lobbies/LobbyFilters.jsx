export default function LobbyFilters({
  games,
  regions,
  statuses,
  selectedGame,
  selectedRegion,
  selectedStatus,
  onGameChange,
  onRegionChange,
  onStatusChange,
}) {
  const pillClass = (active) =>
    `font-['Rajdhani'] text-[11px] font-bold tracking-[1px] border px-3 py-1.5 uppercase transition-all cursor-pointer ${
      active
        ? "bg-[#0b0c0b] text-[#cbd4cc] border-[#0b0c0b]"
        : "bg-transparent text-[#0b0c0b]/50 border-[#0b0c0b]/20 hover:border-[#0b0c0b]/50"
    }`;

  return (
    <div className="flex flex-col gap-6 mb-8">
      <div>
        <p className="mb-2 font-['Orbitron'] text-[10px] font-black tracking-[2px] text-[#0b0c0b]/50 uppercase">
          GAME
        </p>
        <div className="flex flex-wrap gap-2">
          {["ALL", ...games].map((game) => (
            <button
              key={game}
              type="button"
              onClick={() => onGameChange(game)}
              className={pillClass(selectedGame === game)}
              style={{ borderRadius: 0 }}
            >
              {game}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 font-['Orbitron'] text-[10px] font-black tracking-[2px] text-[#0b0c0b]/50 uppercase">
          REGION
        </p>
        <div className="flex flex-wrap gap-2">
          {["ALL", ...regions].map((region) => (
            <button
              key={region}
              type="button"
              onClick={() => onRegionChange(region)}
              className={pillClass(selectedRegion === region)}
              style={{ borderRadius: 0 }}
            >
              {region}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 font-['Orbitron'] text-[10px] font-black tracking-[2px] text-[#0b0c0b]/50 uppercase">
          STATUS
        </p>
        <div className="flex flex-wrap gap-2">
          {["ALL", ...statuses].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onStatusChange(status)}
              className={pillClass(selectedStatus === status)}
              style={{ borderRadius: 0 }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
