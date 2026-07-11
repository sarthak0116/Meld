import { useState } from "react";

export default function SidebarRight() {
  const [lobbyCode, setLobbyCode] = useState("");
  const [selectedGame, setSelectedGame] = useState("VALORANT");

  const handleCreateLobby = () => {
    alert(`Lobby created for ${selectedGame}!`);
  };

  const handleJoinLobby = (e) => {
    e.preventDefault();
    if (!lobbyCode.trim()) return;
    alert(`Joining lobby: ${lobbyCode}`);
  };

  return (
    <aside className="relative z-20 flex flex-col justify-between h-full w-full lg:border-l border-[#0b0c0b]/15 pb-5 lg:pl-6 pt-6">
      {/* Top Part: Information/Status */}
      <div className="flex-1 space-y-6 mb-6 lg:mb-0">
        <div>
          <div className="flex items-center justify-between">
            <span className="font-['Orbitron'] text-[10px] font-black tracking-[3px] text-[#0b0c0b]/60 uppercase">
              ARENA STATUS
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-700">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
              ONLINE
            </span>
          </div>
          <div className="mt-4 p-4 border border-[#0b0c0b]/10 bg-[#0b0c0b]/5 rounded-sm">
            <div className="flex justify-between items-center text-xs">
              <span className="opacity-60">Server Tickrate</span>
              <span className="font-bold">128 TR</span>
            </div>
            <div className="flex justify-between items-center text-xs mt-2">
              <span className="opacity-60">Active Matches</span>
              <span className="font-bold">412 Live</span>
            </div>
            <div className="flex justify-between items-center text-xs mt-2">
              <span className="opacity-60">Avg. Queue Time</span>
              <span className="font-bold">1m 24s</span>
            </div>
          </div>
        </div>

        <div>
          <span className="font-['Orbitron'] text-[10px] font-black tracking-[3px] text-[#0b0c0b]/60 uppercase">
            REGIONAL LEADERBOARD
          </span>
          <div className="mt-3 space-y-2">
            {[
              { rank: 1, name: "S1mple", rating: "3,120 MMR" },
              { rank: 2, name: "TenZ", rating: "3,095 MMR" },
              { rank: 3, name: "Shroud", rating: "3,010 MMR" },
            ].map((p) => (
              <div key={p.rank} className="flex items-center justify-between text-xs py-1 border-b border-[#0b0c0b]/5">
                <span className="font-bold">#{p.rank} {p.name}</span>
                <span className="opacity-70 font-mono">{p.rating}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Part: Create Lobby & Join Lobby Boxes */}
      <div className="space-y-4 pt-6 border-t border-[#0b0c0b]/15">
        <span className="font-['Orbitron'] text-[11px] font-black tracking-[3px] text-[#0b0c0b] uppercase block">
          LOBBY CONTROLS
        </span>

        {/* Create Lobby Box */}
        <div className="p-4 border border-[#0b0c0b]/15 bg-[#0b0c0b]/5 rounded-sm space-y-3">
          <div className="text-xs font-bold tracking-wider text-[#0b0c0b]/80 uppercase">
            Create Lobby
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#0b0c0b]/60 block mb-1">
              Select Game
            </label>
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              className="w-full bg-[#cbd4cc] border border-[#0b0c0b]/20 px-2 py-1.5 text-xs focus:outline-none focus:border-[#0b0c0b] transition-all font-mono"
            >
              <option value="VALORANT">VALORANT</option>
              <option value="CS2">CS2 (COUNTER-STRIKE 2)</option>
              <option value="APEX">APEX LEGENDS</option>
              <option value="DOTA2">DOTA 2</option>
              <option value="R6SIEGE">R6 SIEGE</option>
            </select>
          </div>
          <button
            onClick={handleCreateLobby}
            className="w-full bg-[#0b0c0b] text-[#cbd4cc] hover:bg-[#0b0c0b]/90 py-2 text-xs font-black uppercase tracking-[2px] transition-all border border-[#0b0c0b] hover:shadow-[0_0_10px_rgba(11,12,11,0.2)]"
          >
            CREATE NEW LOBBY
          </button>
        </div>

        {/* Join Lobby Box */}
        <form onSubmit={handleJoinLobby} className="p-4 border border-[#0b0c0b]/15 bg-[#0b0c0b]/5 rounded-sm space-y-3">
          <div className="text-xs font-bold tracking-wider text-[#0b0c0b]/80 uppercase">
            Join Lobby
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#0b0c0b]/60 block mb-1">
              Lobby Code
            </label>
            <input
              type="text"
              placeholder="e.g. LBY-9281"
              value={lobbyCode}
              onChange={(e) => setLobbyCode(e.target.value)}
              className="w-full bg-[#cbd4cc] border border-[#0b0c0b]/20 px-3 py-1.5 text-xs placeholder:text-[#0b0c0b]/30 focus:outline-none focus:border-[#0b0c0b] transition-all font-mono uppercase"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#e53e3e] text-white hover:bg-[#c53030] py-2 text-xs font-black uppercase tracking-[2px] transition-all hover:shadow-[0_0_10px_rgba(229,62,62,0.3)]"
          >
            JOIN LOBBY
          </button>
        </form>
      </div>
    </aside>
  );
}
