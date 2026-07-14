export default function GameCard({ game }) {
  return (
    <div className="group relative flex-col border border-[#0b0c0b]/10 bg-[#cbd4cc] px-6 py-7 hover:bg-[#0b0c0b] transition-colors duration-200 cursor-pointer">
      <h3 className="font-['Orbitron'] text-base font-black tracking-[1px] text-[#0b0c0b] group-hover:text-[#cbd4cc] uppercase mb-1 transition-colors">
        {game.name}
      </h3>
      <p className="font-['Rajdhani'] text-[11px] font-bold tracking-[1.5px] text-[#0b0c0b]/40 group-hover:text-[#e53e3e]/60 uppercase mb-4 transition-colors">
        {game.genre}
      </p>
      
      <div className="flex flex-wrap gap-1 mb-4">
        {game.platforms.map(platform => (
          <span key={platform} className="font-['Share_Tech_Mono'] text-[10px] bg-[#0b0c0b]/5 px-1.5 py-0.5 text-[#0b0c0b]/50 group-hover:bg-[#cbd4cc]/10 group-hover:text-[#cbd4cc]/60 transition-colors">
            {platform}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mt-auto">
        <span className="font-['Share_Tech_Mono'] text-[11px] text-[#0b0c0b]/50 group-hover:text-[#cbd4cc]/50 transition-colors">
          {game.playerCount} PLAYERS
        </span>
        {game.tag && (
          <span
            className="font-['Orbitron'] text-[9px] font-black tracking-[1px] text-[#e53e3e] group-hover:text-[#e53e3e]"
            style={{ textShadow: "0 0 8px rgba(229,62,62,0.6)" }}
          >
            {game.tag}
          </span>
        )}
      </div>

      {/* Corner accent */}
      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 border-r border-b border-[#0b0c0b]/20 group-hover:border-[#e53e3e]/50 transition-colors" />
    </div>
  );
}
