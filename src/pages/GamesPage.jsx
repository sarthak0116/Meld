import { useState, useMemo } from "react";
import HudBackground from "../components/arena/HudBackground";
import ArenaHeader from "../components/arena/ArenaHeader";
import GameFilters from "../components/games/GameFilters";
import GameCard from "../components/games/GameCard";
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

export default function GamesPage() {
  const [selectedGenre, setSelectedGenre] = useState("ALL");
  const [selectedPlatform, setSelectedPlatform] = useState("ALL");

  const genres = useMemo(() => {
    const allGenres = MOCK_GAMES.map(g => g.genre);
    return Array.from(new Set(allGenres)).sort();
  }, []);

  const platforms = useMemo(() => {
    const allPlatforms = MOCK_GAMES.flatMap(g => g.platforms);
    return Array.from(new Set(allPlatforms)).sort();
  }, []);

  const filteredGames = useMemo(() => {
    return MOCK_GAMES.filter(game => {
      const matchGenre = selectedGenre === "ALL" || game.genre === selectedGenre;
      const matchPlatform = selectedPlatform === "ALL" || game.platforms.includes(selectedPlatform);
      return matchGenre && matchPlatform;
    });
  }, [selectedGenre, selectedPlatform]);

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
              <IndexLabel>DISCOVER</IndexLabel>
              <h1 className="font-['Orbitron'] text-2xl font-black tracking-[3px] text-[#0b0c0b] uppercase">
                GAME LIBRARY
              </h1>
              <span className="text-[#e53e3e] text-lg leading-none mb-0.5">+</span>
            </div>
            <p className="font-['Share_Tech_Mono'] text-sm leading-relaxed text-[#0b0c0b]/60 max-w-xl">
              Browse our full roster of supported titles. Filter by genre or platform to find your next arena.
            </p>
          </section>

          <section className="border-t border-[#0b0c0b]/15 px-4 sm:px-8 lg:px-[60px] py-10 lg:py-14">
            <SectionHeading index="01">FILTERS</SectionHeading>
            
            <GameFilters
              genres={genres}
              platforms={platforms}
              selectedGenre={selectedGenre}
              selectedPlatform={selectedPlatform}
              onGenreChange={setSelectedGenre}
              onPlatformChange={setSelectedPlatform}
            />
          </section>

          <section className="border-t border-[#0b0c0b]/15 px-4 sm:px-8 lg:px-[60px] py-10 lg:py-14 pb-20">
            <SectionHeading index="02">GAMES ({filteredGames.length})</SectionHeading>

            {filteredGames.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredGames.map(game => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center border border-dashed border-[#0b0c0b]/20 bg-[#cbd4cc]">
                <p className="font-['Orbitron'] text-sm tracking-[2px] text-[#0b0c0b]/40 uppercase">
                  NO GAMES FOUND MATCHING FILTERS
                </p>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
