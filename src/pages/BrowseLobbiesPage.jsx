import { useState, useMemo } from "react";
import HudBackground from "../components/arena/HudBackground";
import ArenaHeader from "../components/arena/ArenaHeader";
import LobbyFilters from "../components/lobbies/LobbyFilters";
import LobbyCard from "../components/lobbies/LobbyCard";
import { MOCK_LOBBIES } from "../utils/mockLobbies";
import { MOCK_GAMES } from "../utils/mockGames";

function IndexLabel({ children }) {
  return (
    <span className="font-['Orbitron'] text-[11px] font-medium text-[#0b0c0b]/40">
      {children}
    </span>
  );
}

function SectionHeading({ index, children }) {
  return (
    <div className="mb-10 flex items-end gap-6 border-b border-[#0b0c0b]/15 pb-4">
      <IndexLabel>{index}</IndexLabel>
      <h2 className="font-['Orbitron'] text-2xl font-black tracking-[3px] text-[#0b0c0b] uppercase">
        {children}
      </h2>
      <span className="text-[#e53e3e] text-lg leading-none mb-0.5">+</span>
    </div>
  );
}

export default function BrowseLobbiesPage() {
  const [selectedGame, setSelectedGame] = useState("ALL");
  const [selectedRegion, setSelectedRegion] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const gameNames = useMemo(() => {
    const ids = Array.from(new Set(MOCK_LOBBIES.map((l) => l.gameId)));
    return ids
      .map((id) => {
        const g = MOCK_GAMES.find((game) => game.id === id);
        return g ? g.name : null;
      })
      .filter(Boolean)
      .sort();
  }, []);

  const regions = useMemo(() => {
    return Array.from(new Set(MOCK_LOBBIES.map((l) => l.region))).sort();
  }, []);

  const statuses = useMemo(() => {
    return Array.from(new Set(MOCK_LOBBIES.map((l) => l.status))).sort();
  }, []);

  const filteredLobbies = useMemo(() => {
    return MOCK_LOBBIES.filter((lobby) => {
      const game = MOCK_GAMES.find((g) => g.id === lobby.gameId);
      const matchGame =
        selectedGame === "ALL" || (game && game.name === selectedGame);
      const matchRegion =
        selectedRegion === "ALL" || lobby.region === selectedRegion;
      const matchStatus =
        selectedStatus === "ALL" || lobby.status === selectedStatus;
      return matchGame && matchRegion && matchStatus;
    });
  }, [selectedGame, selectedRegion, selectedStatus]);

  return (
    <div
      className="relative min-h-screen w-full"
      style={{
        background: "#cbd4cc",
        color: "#0b0c0b",
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: 14,
      }}
    >
      <HudBackground />

      <div className="relative z-[2] flex flex-col min-h-screen">
        <div className="sticky top-0 z-30 bg-[#cbd4cc] px-4 sm:px-8 lg:px-[60px] pt-4 border-b border-[#0b0c0b]/15 lg:border-b-0 lg:bg-transparent">
          <ArenaHeader />
        </div>

        <main className="flex-1 w-full flex flex-col">
          <section className="px-4 sm:px-8 lg:px-[60px] py-10 lg:py-14">
            <div className="flex items-end gap-6 mb-4">
              <IndexLabel>BROWSE</IndexLabel>
              <h1 className="font-['Orbitron'] text-2xl font-black tracking-[3px] text-[#0b0c0b] uppercase">
                ACTIVE LOBBIES
              </h1>
              <span className="text-[#e53e3e] text-lg leading-none mb-0.5">
                +
              </span>
            </div>
            <p className="font-['Share_Tech_Mono'] text-sm leading-relaxed text-[#0b0c0b]/60 max-w-xl">
              Browse open lobbies across all supported games. Filter by game,
              region, or status to find your next squad.
            </p>
          </section>

          <section className="border-t border-[#0b0c0b]/15 px-4 sm:px-8 lg:px-[60px] py-10 lg:py-14">
            <SectionHeading index="01">FILTERS</SectionHeading>

            <LobbyFilters
              games={gameNames}
              regions={regions}
              statuses={statuses}
              selectedGame={selectedGame}
              selectedRegion={selectedRegion}
              selectedStatus={selectedStatus}
              onGameChange={setSelectedGame}
              onRegionChange={setSelectedRegion}
              onStatusChange={setSelectedStatus}
            />
          </section>

          <section className="border-t border-[#0b0c0b]/15 px-4 sm:px-8 lg:px-[60px] py-10 lg:py-14 pb-20">
            <SectionHeading index="02">
              LOBBIES ({filteredLobbies.length})
            </SectionHeading>

            {filteredLobbies.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredLobbies.map((lobby) => (
                  <LobbyCard key={lobby.id} lobby={lobby} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center border border-dashed border-[#0b0c0b]/20 bg-[#cbd4cc]">
                <p className="font-['Orbitron'] text-sm tracking-[2px] text-[#0b0c0b]/40 uppercase">
                  NO LOBBIES FOUND MATCHING FILTERS
                </p>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
