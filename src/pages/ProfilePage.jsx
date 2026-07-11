import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import HudBackground from "../components/arena/HudBackground";

const REGIONS = ["NA", "EU", "ASIA", "SA", "OCE", "ME"];
const GAMES_LIST = [
  "Valorant", "CS2", "League of Legends", "Dota 2",
  "Apex Legends", "Overwatch 2", "Rocket League", "Rainbow Six Siege",
  "PUBG", "Fortnite",
];

function HudInput({ id, label, type = "text", value, onChange, placeholder, error, as: Tag = "input", rows, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-['Orbitron'] text-[10px] font-black tracking-[2px] text-[#0b0c0b]/50 uppercase">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute -top-px -left-px h-2 w-2 border-l border-t border-[#0b0c0b]/30 z-10" />
        <span className="pointer-events-none absolute -bottom-px -right-px h-2 w-2 border-r border-b border-[#0b0c0b]/30 z-10" />
        {Tag === "input" ? (
          <input
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full bg-[#0b0c0b]/5 border px-4 py-3 font-['Share_Tech_Mono'] text-sm text-[#0b0c0b] placeholder-[#0b0c0b]/30 outline-none transition-all focus:bg-[#0b0c0b]/8 ${
              error ? "border-red-500/50 focus:border-red-500/80" : "border-[#0b0c0b]/20 focus:border-[#e53e3e]/60"
            }`}
            style={{ borderRadius: 0 }}
          />
        ) : (
          <textarea
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows || 3}
            className={`w-full bg-[#0b0c0b]/5 border px-4 py-3 font-['Share_Tech_Mono'] text-sm text-[#0b0c0b] placeholder-[#0b0c0b]/30 outline-none transition-all focus:bg-[#0b0c0b]/8 resize-none ${
              error ? "border-red-500/50 focus:border-red-500/80" : "border-[#0b0c0b]/20 focus:border-[#e53e3e]/60"
            }`}
            style={{ borderRadius: 0 }}
          />
        )}
        {children}
      </div>
      {error && (
        <p className="mt-1.5 font-['Share_Tech_Mono'] text-[11px] text-red-500/80">// {error}</p>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [bio, setBio] = useState(user?.bio ?? "");
  const [region, setRegion] = useState(user?.region ?? "NA");
  const [avatar, setAvatar] = useState(user?.avatar ?? "");
  const [preferredGames, setPreferredGames] = useState(user?.preferredGames ?? []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!user) return null; // ProtectedRoute in App.jsx handles the redirect

  const toggleGame = (game) => {
    setPreferredGames(prev =>
      prev.includes(game) ? prev.filter(g => g !== game) : [...prev, game]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (bio.length > 200) {
      setError("Bio must be under 200 characters");
      return;
    }

    // Diff against current user — only send what actually changed
    const changes = {};
    if (bio.trim() !== (user.bio ?? "")) changes.bio = bio.trim();
    if (region !== (user.region ?? "NA")) changes.region = region;
    if (avatar.trim() !== (user.avatar ?? "")) changes.avatar = avatar.trim();
    const gamesChanged =
      preferredGames.length !== (user.preferredGames ?? []).length ||
      preferredGames.some(g => !(user.preferredGames ?? []).includes(g));
    if (gamesChanged) changes.preferredGames = preferredGames;

    if (Object.keys(changes).length === 0) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile(changes);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div
      className="relative min-h-screen"
      style={{ background: "#cbd4cc", color: "#0b0c0b", fontFamily: "'Share Tech Mono', monospace" }}
    >
      <HudBackground light={true} />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-[#0b0c0b]/20 px-5 sm:px-[60px] py-4">
        <button
          onClick={() => navigate(-1)}
          className="font-['Rajdhani'] text-[11px] font-bold tracking-[3px] text-[#0b0c0b]/40 uppercase hover:text-[#0b0c0b] transition-colors bg-transparent border-none cursor-pointer"
        >
          ← BACK
        </button>
        <div className="font-['Orbitron'] font-black text-xl tracking-[2px] text-[#0b0c0b]">MELD</div>
        <div className="font-['Orbitron'] text-[10px] font-black tracking-[3px] text-[#0b0c0b]/25 uppercase">
          PROFILE <span className="text-[#e53e3e]">+</span>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-2xl px-5 sm:px-[60px] py-10">

        {/* Identity block */}
        <div className="mb-8 flex items-center gap-5">
          {/* Avatar circle */}
          <div className="relative flex h-16 w-16 items-center justify-center border-2 border-[#0b0c0b]/30 font-['Orbitron'] text-xl font-black text-[#0b0c0b] flex-shrink-0 bg-[#cbd4cc]">
            {user.avatar ? (
              <img src={user.avatar} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              user.username?.[0]?.toUpperCase()
            )}
            <span className="absolute -top-px -left-px h-2.5 w-2.5 border-l-2 border-t-2 border-[#e53e3e]" />
            <span className="absolute -bottom-px -right-px h-2.5 w-2.5 border-r-2 border-b-2 border-[#e53e3e]" />
          </div>
          <div>
            <p className="font-['Orbitron'] text-lg font-black tracking-[1px] text-[#0b0c0b] uppercase">{user.username}</p>
            <p className="font-['Share_Tech_Mono'] text-[11px] text-[#0b0c0b]/40">{user.email}</p>
            <div className="mt-1 flex items-center gap-3">
              <span className="font-['Orbitron'] text-[10px] font-black tracking-[1px] text-[#e53e3e]">{user.rank}</span>
              <span className="text-[#0b0c0b]/20">·</span>
              <span className="font-['Share_Tech_Mono'] text-[10px] text-[#0b0c0b]/40">{user.mmr} MMR</span>
            </div>
          </div>
        </div>

        {/* Read-only stats row */}
        <div className="mb-8 grid grid-cols-3 border border-[#0b0c0b]/15">
          {[
            { label: "BEHAVIOR", value: `${user.behaviorScore ?? 100}/100` },
            { label: "STATUS", value: user.isPremium ? "PREMIUM" : "FREE" },
            { label: "ROLE", value: user.role?.toUpperCase() ?? "USER" },
          ].map((s, i) => (
            <div key={s.label} className={`flex flex-col items-center py-4 ${i < 2 ? "border-r border-[#0b0c0b]/15" : ""}`}>
              <span className="font-['Orbitron'] text-[12px] font-black text-[#0b0c0b]">{s.value}</span>
              <span className="font-['Rajdhani'] text-[9px] font-bold tracking-[1.5px] text-[#0b0c0b]/40 uppercase mt-0.5">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Edit form */}
        <div className="relative border border-[#0b0c0b]/15 px-6 py-8 bg-[#cbd4cc]">
          <span className="absolute top-0 left-0 h-4 w-4 border-l-2 border-t-2 border-[#0b0c0b]/50" />
          <span className="absolute top-0 right-0 h-4 w-4 border-r-2 border-t-2 border-[#0b0c0b]/50" />
          <span className="absolute bottom-0 left-0 h-4 w-4 border-l-2 border-b-2 border-[#0b0c0b]/50" />
          <span className="absolute bottom-0 right-0 h-4 w-4 border-r-2 border-b-2 border-[#0b0c0b]/50" />

          <p className="font-['Orbitron'] text-[10px] font-black tracking-[3px] text-[#0b0c0b]/40 uppercase mb-6">
            02 // EDIT PROFILE
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Avatar URL */}
            <HudInput
              id="p-avatar"
              label="Avatar URL"
              value={avatar}
              onChange={e => setAvatar(e.target.value)}
              placeholder="https://example.com/avatar.png"
            />

            {/* Bio */}
            <div>
              <HudInput
                id="p-bio"
                label={`Bio (${bio.length}/200)`}
                as="textarea"
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Tell people about yourself..."
              />
            </div>

            {/* Region */}
            <div>
              <label className="mb-1.5 block font-['Orbitron'] text-[10px] font-black tracking-[2px] text-[#0b0c0b]/50 uppercase">
                Region
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute -top-px -left-px h-2 w-2 border-l border-t border-[#0b0c0b]/30 z-10" />
                <span className="pointer-events-none absolute -bottom-px -right-px h-2 w-2 border-r border-b border-[#0b0c0b]/30 z-10" />
                <select
                  value={region}
                  onChange={e => setRegion(e.target.value)}
                  className="w-full bg-[#0b0c0b]/5 border border-[#0b0c0b]/20 px-4 py-3 pr-10 font-['Share_Tech_Mono'] text-sm text-[#0b0c0b] outline-none focus:border-[#e53e3e]/60 appearance-none"
                  style={{ borderRadius: 0 }}
                >
                  {REGIONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                {/* Custom chevron */}
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 3.5L5 6.5L8 3.5" stroke="#0b0c0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Preferred games */}
            <div>
              <p className="mb-2 font-['Orbitron'] text-[10px] font-black tracking-[2px] text-[#0b0c0b]/50 uppercase">
                Preferred Games
              </p>
              <div className="flex flex-wrap gap-2">
                {GAMES_LIST.map(game => {
                  const active = preferredGames.includes(game);
                  return (
                    <button
                      key={game}
                      type="button"
                      onClick={() => toggleGame(game)}
                      className={`font-['Rajdhani'] text-[11px] font-bold tracking-[1px] border px-3 py-1.5 uppercase transition-all cursor-pointer ${
                        active
                          ? "bg-[#0b0c0b] text-[#cbd4cc] border-[#0b0c0b]"
                          : "bg-transparent text-[#0b0c0b]/50 border-[#0b0c0b]/20 hover:border-[#0b0c0b]/50"
                      }`}
                      style={{ borderRadius: 0 }}
                    >
                      {game}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error / success — fixed height so button never shifts */}
            <div className="h-5 flex items-center">
              {error && (
                <p className="font-['Share_Tech_Mono'] text-[11px] text-red-500/80">// {error}</p>
              )}
              {!error && success && (
                <p className="font-['Share_Tech_Mono'] text-[11px] text-[#0b0c0b]/60">// Profile updated successfully</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0b0c0b] py-3.5 font-['Orbitron'] text-[12px] font-black tracking-[3px] text-[#cbd4cc] uppercase transition-all duration-200 hover:bg-[#e53e3e] hover:text-[#0b0c0b] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderRadius: 0 }}
            >
              {isLoading ? "SAVING..." : "SAVE PROFILE"}
            </button>
          </form>
        </div>

        {/* Logout */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleLogout}
            className="font-['Rajdhani'] text-[11px] font-bold tracking-[2px] text-[#0b0c0b]/40 uppercase hover:text-[#e53e3e] transition-colors bg-transparent border-none cursor-pointer"
          >
            LOGOUT →
          </button>
        </div>
      </div>
    </div>
  );
}
