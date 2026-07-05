import useLeaderboard from '../../hooks/useLeaderboard';
import { useAuth } from '../../context/AuthContext';

/**
 * Live leaderboard — fetches top players by MMR from the API.
 * Polls every 30s. Highlights the current user's row.
 */
export default function Leaderboard() {
  const { players, loading, error } = useLeaderboard(10);
  const { user } = useAuth();

  return (
    <article className="relative mt-5 px-5 py-6">
      {/* Decorative border lines */}
      <span className="absolute top-0 left-0 right-0 h-px bg-[#0b0c0b]/25" />
      <span className="absolute bottom-0 left-0 right-0 h-px bg-[#0b0c0b]/25" />
      {/* Corner brackets */}
      <span className="absolute top-0 left-0 h-3 w-3 border-l border-t border-[#0b0c0b]" />
      <span className="absolute bottom-0 right-0 h-3 w-3 border-r border-b border-[#0b0c0b]" />

      <div className="flex flex-col gap-2 font-['Rajdhani'] text-[11px] font-bold uppercase tracking-wide">
        {/* Title */}
        <div className="flex items-center justify-between mb-1">
          <p className="font-['Orbitron'] text-[10px] font-black tracking-[3px] text-[#0b0c0b]/40 uppercase">
            TOP PLAYERS
          </p>
          {/* Live indicator */}
          <span className="flex items-center gap-1 font-['Orbitron'] text-[8px] font-black tracking-[1px] text-[#e53e3e]">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full bg-[#e53e3e]"
              style={{ boxShadow: '0 0 5px rgba(229,62,62,0.8)' }}
            />
            LIVE
          </span>
        </div>

        {/* Header row */}
        <div className="grid grid-cols-[36px_1fr_80px] border-b border-[#0b0c0b]/15 pb-1.5 text-[10px] tracking-[1.5px] text-[#0b0c0b]/40">
          <span>#</span>
          <span>PLAYER</span>
          <span className="text-right">MMR</span>
        </div>

        {/* Loading skeleton */}
        {loading && Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="grid grid-cols-[36px_1fr_80px] py-2 gap-2 animate-pulse">
            <div className="h-2 w-4 bg-[#0b0c0b]/10 rounded" />
            <div className="h-2 bg-[#0b0c0b]/10 rounded w-3/4" />
            <div className="h-2 bg-[#0b0c0b]/10 rounded w-full" />
          </div>
        ))}

        {/* Error state */}
        {!loading && error && (
          <p className="py-4 font-['Share_Tech_Mono'] text-[10px] text-[#0b0c0b]/40 text-center">
            // failed to load
          </p>
        )}

        {/* Rows */}
        {!loading && !error && players.map((player, idx) => {
          const isMe = user && player.username === user.username;
          return (
            <div
              key={player._id ?? player.username}
              className={`grid grid-cols-[36px_1fr_80px] border-b border-dashed border-[#0b0c0b]/10 py-2 transition-all duration-150 hover:bg-[#e53e3e]/5 hover:pl-1 ${
                isMe ? 'text-[#e53e3e]' : 'text-[#0b0c0b]'
              }`}
            >
              <span className={`font-['Orbitron'] text-[10px] ${isMe ? 'text-[#e53e3e]' : 'text-[#0b0c0b]/40'}`}>
                {String(idx + 1).padStart(2, '0')}
              </span>
              <span className="truncate">
                {player.username}
                {isMe && <span className="ml-1 text-[8px] opacity-60">YOU</span>}
              </span>
              <span className="text-right font-['Orbitron'] text-[10px]">
                {player.mmr.toLocaleString()}
              </span>
            </div>
          );
        })}

        {/* Empty state */}
        {!loading && !error && players.length === 0 && (
          <p className="py-4 font-['Share_Tech_Mono'] text-[10px] text-[#0b0c0b]/40 text-center">
            // no players yet
          </p>
        )}
      </div>
    </article>
  );
}
