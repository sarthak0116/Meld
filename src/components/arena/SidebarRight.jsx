import { useState } from "react";
import Leaderboard from "./Leaderboard";
import Button from "../ui/Button";

/**
 * Right sidebar: leaderboard + "START PLAYING" HUD button.
 * The button shows a tech-toast notification on click.
 */
export default function SidebarRight() {
  const [toast, setToast] = useState(null);

  const handleStartPlaying = () => {
    // Visual scale feedback
    setToast({ header: "SEARCHING FOR OPPONENTS...", sub: "ESTABLISHING SECURE MATCHMAKING LOBBY" });
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <aside className="relative z-20 flex flex-col justify-between pl-8 pt-10 pb-5">
      <Leaderboard />

      {/* HUD "START PLAYING" button */}
      <div className="group mt-auto mb-10 w-full">
        <Button
          variant="hud"
          size="lg"
          className="w-full"
          onClick={handleStartPlaying}
        >
          START PLAYING
        </Button>
      </div>

      {/* Tech toast notification */}
      {toast && (
        <div
          className="fixed bottom-4 right-4 sm:bottom-10 sm:right-10 z-[9999] border-l-4 border-[#e53e3e] bg-[#0b0c0b] px-6 py-4 shadow-[0_20px_40px_rgba(0,0,0,0.3)] animate-fade-in max-w-[calc(100vw-32px)]"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          <p className="text-[11px] font-black tracking-[2px] text-[#cbd4cc]">
            {toast.header}
          </p>
          <p className="mt-1 font-['Share_Tech_Mono'] text-[9px] tracking-[1px] text-[#cbd4cc]/60">
            {toast.sub}
          </p>
        </div>
      )}
    </aside>
  );
}
