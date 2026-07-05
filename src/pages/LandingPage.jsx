import { Link } from "react-router-dom";

const STATS = [
  { value: "50,000+", label: "Players" },
  { value: "1,200+", label: "Tournaments" },
  { value: "98", label: "Games Supported" },
  { value: "4.9★", label: "Rating" },
];

const FEATURES = [
  { title: "Skill-Based Matchmaking", desc: "Get matched with players at your exact rank and skill level.", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5l4-4 4 4 4-8 4 4" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 20h18" /></svg> },
  { title: "Real-Time Lobbies", desc: "Create or join lobbies instantly with room codes and invite links.", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.5a3 3 0 100-6 3 3 0 000 6zm0 0v1.5a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h8" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 3h6m-3-3v6" /></svg> },
  { title: "Live Voice Chat", desc: "Coordinate with your team using built-in voice communication.", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg> },
  { title: "Tournament Hosting", desc: "Run full brackets with live updates and automatic advancement.", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5A3.375 3.375 0 0012 10.875a3.375 3.375 0 00-3.375 3.375v4.5m0 0h9M12 10.875V3.75M9 6.75l3-3 3 3" /></svg> },
  { title: "Player Statistics", desc: "Track your win rate, KDA, match history, and rank progression.", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" /><path strokeLinecap="round" strokeLinejoin="round" d="M7 16l4-6 4 4 4-8" /></svg> },
  { title: "Reputation System", desc: "Earn karma for good play and get matched with positive players.", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg> },
];

const STEPS = [
  { num: "01", title: "Create Profile", desc: "Set up your gaming profile with your rank, region, and preferred games." },
  { num: "02", title: "Find Players", desc: "Browse lobbies or let our matchmaking system find the perfect teammates." },
  { num: "03", title: "Play Together", desc: "Jump into voice chat, coordinate strategy, and climb the ladder." },
];

const GAMES = [
  { name: "Valorant", genre: "Tactical FPS", players: "12,400", from: "from-red-600", to: "to-pink-800" },
  { name: "League of Legends", genre: "MOBA", players: "9,800", from: "from-blue-700", to: "to-indigo-900" },
  { name: "CS2", genre: "FPS", players: "8,200", from: "from-orange-600", to: "to-yellow-800" },
  { name: "Apex Legends", genre: "Battle Royale", players: "7,100", from: "from-red-700", to: "to-orange-900" },
  { name: "Rocket League", genre: "Sports", players: "5,600", from: "from-cyan-600", to: "to-blue-800" },
  { name: "Overwatch 2", genre: "Hero Shooter", players: "4,900", from: "from-amber-500", to: "to-orange-700" },
  { name: "Fortnite", genre: "Battle Royale", players: "11,200", from: "from-purple-600", to: "to-indigo-800" },
  { name: "Dota 2", genre: "MOBA", players: "6,300", from: "from-green-700", to: "to-emerald-900" },
  { name: "Rainbow Six Siege", genre: "Tactical FPS", players: "3,800", from: "from-slate-600", to: "to-gray-800" },
  { name: "PUBG", genre: "Battle Royale", players: "4,200", from: "from-yellow-600", to: "to-amber-900" },
];

const TESTIMONIALS = [
  { username: "NightWolf_GG", initials: "NW", color: "bg-indigo-600", quote: "MELD completely changed how I find teammates. No more toxic randoms — just skill-matched players who communicate." },
  { username: "CyberViper99", initials: "CV", color: "bg-cyan-600", quote: "Went from Silver to Diamond in two months because I finally had a consistent team to practice with." },
  { username: "PixelStorm_X", initials: "PS", color: "bg-purple-600", quote: "The tournament hosting feature is insane. Set up a 64-team bracket in minutes. Our community loves it." },
];

export default function LandingPage() {
  return (
    <div className="bg-[#0a0a0f] text-white">
      {/* Hero */}
      <section className="relative min-h-screen bg-grid flex items-center justify-center overflow-hidden px-4">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
        </div>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-float absolute left-[15%] top-[25%] h-3 w-3 rounded-full bg-indigo-400/60 shadow-[0_0_12px_rgba(99,102,241,0.8)]" />
          <div className="animate-float-delay absolute right-[20%] top-[40%] h-2 w-2 rounded-full bg-cyan-400/60 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
          <div className="animate-float-delay-2 absolute left-[30%] bottom-[30%] h-2 w-2 rounded-full bg-purple-400/60 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
          <div className="animate-float absolute right-[35%] bottom-[20%] h-3 w-3 rounded-full bg-indigo-300/40 shadow-[0_0_12px_rgba(99,102,241,0.6)]" />
        </div>
        <div className="relative z-10 max-w-4xl text-center">
          <div className="mb-4 inline-block rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-300">
            The Future of Team Gaming
          </div>
          <h1 className="font-tektur text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            Find Your Perfect<br />
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Gaming Team</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-gray-400 sm:text-lg">
            Connect with skilled players, join competitive lobbies, and dominate the ranked ladder together.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/signup" className="rounded-lg bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-[0_0_24px_rgba(99,102,241,0.5)] hover:bg-indigo-500 hover:shadow-[0_0_36px_rgba(99,102,241,0.7)] transition-all duration-300">Get Started Free</Link>
            <Link to="/login" className="rounded-lg border border-white/10 px-8 py-3.5 text-base font-semibold text-gray-300 hover:border-indigo-500/50 hover:text-white transition-all duration-300">Browse Lobbies</Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/5 bg-[#0d0d14]">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 divide-x divide-y divide-white/5 md:grid-cols-4 md:divide-y-0">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center justify-center px-6 py-10">
                <span className="font-tektur text-3xl font-extrabold text-indigo-400 sm:text-4xl">{s.value}</span>
                <span className="mt-1 text-sm text-gray-500">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="mb-14 text-center">
          <h2 className="font-tektur text-3xl font-extrabold sm:text-4xl md:text-5xl">Everything You Need to <span className="text-indigo-400">Win</span></h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="group rounded-xl border border-white/5 bg-[#0d0d14] p-6 hover:border-indigo-500/40 hover:shadow-[0_0_24px_rgba(99,102,241,0.1)] transition-all duration-300">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-600/15 text-indigo-400 group-hover:bg-indigo-600/25 transition-colors">{f.icon}</div>
              <h3 className="mb-2 font-tektur text-lg font-bold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-[#0d0d14] px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <h2 className="font-tektur text-3xl font-extrabold sm:text-4xl md:text-5xl">Up and Running in <span className="text-cyan-400">Minutes</span></h2>
          </div>
          <div className="relative grid grid-cols-1 gap-10 md:grid-cols-3">
            <div className="pointer-events-none absolute left-0 right-0 top-8 hidden border-t border-dashed border-indigo-500/20 md:block" />
            {STEPS.map((step) => (
              <div key={step.num} className="relative flex flex-col items-center text-center">
                <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-indigo-500/40 bg-[#0a0a0f] shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                  <span className="font-tektur text-xl font-extrabold text-indigo-400">{step.num}</span>
                </div>
                <h3 className="mb-2 font-tektur text-lg font-bold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Game Showcase */}
      <section className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <h2 className="font-tektur text-3xl font-extrabold sm:text-4xl md:text-5xl">Compete Across <span className="text-indigo-400">Top Games</span></h2>
          </div>
          <div className="no-scrollbar flex gap-4 overflow-x-auto pb-4">
            {GAMES.map((game) => (
              <div key={game.name} className="group flex-shrink-0 w-40 cursor-pointer overflow-hidden rounded-xl border border-white/5 bg-[#0d0d14] hover:border-indigo-500/40 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all duration-300">
                <div className={`h-28 w-full bg-gradient-to-br ${game.from} ${game.to} opacity-80 group-hover:opacity-100 transition-opacity`} />
                <div className="p-3">
                  <p className="font-tektur text-sm font-bold leading-tight">{game.name}</p>
                  <p className="mt-0.5 text-xs text-indigo-400">{game.genre}</p>
                  <p className="mt-2 text-xs text-gray-500">{game.players} online</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#0d0d14] px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <h2 className="font-tektur text-3xl font-extrabold sm:text-4xl md:text-5xl">Trusted by <span className="text-cyan-400">Competitive Players</span></h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.username} className="rounded-xl border border-white/5 bg-[#0a0a0f] p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${t.color} text-sm font-bold uppercase`}>{t.initials}</div>
                  <div>
                    <p className="text-sm font-semibold">{t.username}</p>
                    <p className="text-xs text-yellow-400">★★★★★</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-gray-400">"{t.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden px-4 py-28 sm:px-6">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-96 w-96 rounded-full bg-indigo-600/10 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="font-tektur text-4xl font-extrabold sm:text-5xl md:text-6xl">Ready to Find Your <span className="text-indigo-400">Team?</span></h2>
          <p className="mt-5 text-gray-400 sm:text-lg">Join thousands of players already competing on MELD. It's free.</p>
          <Link to="/signup" className="mt-10 inline-block rounded-xl bg-indigo-600 px-12 py-4 text-lg font-bold shadow-[0_0_40px_rgba(99,102,241,0.5)] hover:bg-indigo-500 hover:shadow-[0_0_60px_rgba(99,102,241,0.7)] transition-all duration-300">
            Join MELD Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#07070b]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <span className="font-tektur text-2xl font-extrabold"><span className="text-red-500">M</span>eld</span>
            <div className="flex flex-wrap gap-6 text-sm text-gray-500">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <Link to="/signup" className="hover:text-white transition-colors">Sign Up</Link>
              <Link to="/login" className="hover:text-white transition-colors">Login</Link>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
            <div className="flex gap-4 text-gray-500">
              <a href="#" aria-label="Twitter" className="hover:text-indigo-400 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="#" aria-label="Discord" className="hover:text-indigo-400 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" /></svg>
              </a>
              <a href="#" aria-label="GitHub" className="hover:text-indigo-400 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
              </a>
            </div>
          </div>
          <div className="mt-10 border-t border-white/5 pt-6 text-center text-xs text-gray-600">
            © {new Date().getFullYear()} MELD. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
