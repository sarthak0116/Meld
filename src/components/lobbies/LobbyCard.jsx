import { MOCK_GAMES } from "../../utils/mockGames";

export default function LobbyCard({ lobby }) {
  const game = MOCK_GAMES.find((g) => g.id === lobby.gameId);

  const statusStyles = {
    OPEN: "text-[#e53e3e]",
    FULL: "text-[#0b0c0b]/30 group-hover:text-[#cbd4cc]/30",
    "IN PROGRESS": "text-[#0b0c0b]/50 group-hover:text-[#cbd4cc]/50",
  };

  return (
    <div className="group relative flex flex-col border border-[#0b0c0b]/10 bg-[#cbd4cc] px-6 py-7 hover:bg-[#0b0c0b] transition-colors duration-200 cursor-default">
      {/* Corner accent — top-left */}
      <span className="absolute top-0 left-0 h-2.5 w-2.5 border-l border-t border-[#0b0c0b]/30 group-hover:border-[#e53e3e]/60 transition-colors" />

      {/* Lobby name */}
      <h3 className="font-['Orbitron'] text-base font-black tracking-[1px] text-[#0b0c0b] group-hover:text-[#cbd4cc] uppercase mb-1 transition-colors">
        {lobby.name}
      </h3>

      {/* Game name + genre */}
      <p className="font-['Rajdhani'] text-[11px] font-bold tracking-[1.5px] text-[#0b0c0b]/40 group-hover:text-[#e53e3e]/60 uppercase mb-4 transition-colors">
        {game?.name ?? "UNKNOWN"} — {game?.genre ?? "N/A"}
      </p>

      {/* Meta row: host + players */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-['Share_Tech_Mono'] text-[11px] text-[#0b0c0b]/50 group-hover:text-[#cbd4cc]/50 transition-colors">
          HOST: {lobby.hostUsername}
        </span>
        <span className="font-['Share_Tech_Mono'] text-[11px] text-[#0b0c0b]/50 group-hover:text-[#cbd4cc]/50 transition-colors">
          {lobby.currentPlayers}/{lobby.maxPlayers}
        </span>
      </div>

      {/* Region + Status + Room Code */}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-3">
          <span className="font-['Rajdhani'] text-[10px] font-bold tracking-[1.5px] border border-[#0b0c0b]/20 group-hover:border-[#cbd4cc]/20 px-1.5 py-0.5 text-[#0b0c0b]/50 group-hover:text-[#cbd4cc]/50 uppercase transition-colors">
            {lobby.region}
          </span>
          <span
            className={`font-['Orbitron'] text-[9px] font-black tracking-[1px] ${statusStyles[lobby.status] ?? "text-[#0b0c0b]/50"}`}
            style={
              lobby.status === "OPEN"
                ? { textShadow: "0 0 8px rgba(229,62,62,0.6)" }
                : undefined
            }
          >
            {lobby.status}
          </span>
        </div>
        <span className="font-['Share_Tech_Mono'] text-[10px] text-[#0b0c0b]/30 group-hover:text-[#cbd4cc]/30 transition-colors">
          {lobby.roomCode}
        </span>
      </div>

      {/* Corner accent — bottom-right */}
      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 border-r border-b border-[#0b0c0b]/20 group-hover:border-[#e53e3e]/50 transition-colors" />
    </div>
  );
}
