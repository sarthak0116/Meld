import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useArena } from "../../context/ArenaContext";
import { io } from "socket.io-client";
import { api } from "../../utils/api";

// ── Small inline toast ────────────────────────────────────────────────────────
function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] pointer-events-none animate-fade-in">
      <div className="bg-[#0b0c0b] text-[#cbd4cc] font-['Share_Tech_Mono'] text-[11px] tracking-[1.5px] px-5 py-3 border border-[#e53e3e]/40 shadow-xl">
        {message}
      </div>
    </div>
  );
}

// ── Watch-match modal ─────────────────────────────────────────────────────────
function WatchMatchModal({ tourney, onClose }) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0b0c0b]/70 p-6">
      <div className="relative w-full max-w-[540px] bg-[#0d0e12] border border-[#e53e3e]/30" style={{ boxShadow: "0 24px 80px rgba(229,62,62,0.15)" }}>
        <span className="absolute top-0 left-0 h-3 w-3 border-l border-t border-[#e53e3e]/40" />
        <span className="absolute bottom-0 right-0 h-3 w-3 border-r border-b border-[#e53e3e]/40" />
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#e53e3e]/15">
          <div>
            <p className="font-['Orbitron'] text-[9px] font-black tracking-[3px] text-[#e53e3e] uppercase">LIVE MATCH</p>
            <h2 className="mt-1 font-['Orbitron'] text-lg font-black tracking-[2px] text-[#e6e8eb] uppercase">{tourney.name}</h2>
          </div>
          <button onClick={onClose} className="font-['Rajdhani'] text-[11px] font-bold tracking-[2px] text-[#e6e8eb]/40 uppercase hover:text-[#e6e8eb] bg-transparent border-none cursor-pointer transition-colors">
            CLOSE <span className="text-[#e53e3e]">×</span>
          </button>
        </div>
        <div className="px-8 py-8 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-[#e53e3e] animate-pulse" style={{ boxShadow: "0 0 8px rgba(229,62,62,0.8)" }} />
            <span className="font-['Orbitron'] text-[10px] font-black tracking-[2px] text-[#e53e3e] uppercase">Match In Progress</span>
          </div>
          <p className="font-['Share_Tech_Mono'] text-[11px] text-[#e6e8eb]/60 leading-relaxed">
            // Live stream integration pending. Stream embed will appear here once a broadcast URL is configured for this tournament.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="border border-[#ffffff]/10 px-4 py-3">
              <p className="font-['Orbitron'] text-[8px] text-[#e6e8eb]/35 uppercase tracking-[2px] mb-1">GAME</p>
              <p className="font-['Orbitron'] text-[12px] font-black text-[#e6e8eb]">{tourney.game}</p>
            </div>
            <div className="border border-[#ffffff]/10 px-4 py-3">
              <p className="font-['Orbitron'] text-[8px] text-[#e6e8eb]/35 uppercase tracking-[2px] mb-1">PRIZE POOL</p>
              <p className="font-['Orbitron'] text-[12px] font-black text-[#e53e3e]">{tourney.prize}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusIcon({ status, sizeClass = "h-2.5 w-2.5" }) {
  if (status === "Online") {
    return (
      <span className={`${sizeClass} rounded-full bg-[#23a55a] flex-shrink-0`} title="Online" />
    );
  }
  if (status === "Away") {
    return (
      <svg className={`${sizeClass} text-[#f0b232] flex-shrink-0`} viewBox="0 0 24 24" fill="currentColor" title="Away">
        <path d="M12 3c.132 0 .263 0 .393.007a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 12 3Z" />
      </svg>
    );
  }
  if (status === "In-Game") {
    return (
      <div className={`${sizeClass} rounded-full bg-[#a370f7] flex items-center justify-center flex-shrink-0`} title="In-Game">
        <svg className="h-[65%] w-[65%] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <path d="M6 12h4M8 10v4M15 11h.01M18 13h.01" />
        </svg>
      </div>
    );
  }
  // Offline
  return (
    <span className={`${sizeClass} rounded-full border-2 border-[#80848e] bg-transparent flex-shrink-0`} title="Offline" />
  );
}

export default function CharacterStage({ activeView, onViewChange, theme }) {
  const { user } = useAuth();
  const { setUnreadNotifCount } = useArena();
  const socketRef = useRef(null);
  const [selectedGame, setSelectedGame] = useState("VALORANT");
  const [showInviteCard, setShowInviteCard] = useState(false);
  const [inviteSearchQuery, setInviteSearchQuery] = useState("");
  const [sentRequests, setSentRequests] = useState([]);

  // Toast state
  const [toast, setToast] = useState(null); // string | null

  // Watch-match modal
  const [watchTourney, setWatchTourney] = useState(null);

  // Add-friend search state (name suggestions feature)
  const [addFriendQuery, setAddFriendQuery] = useState("");
  const [addFriendSuggestions, setAddFriendSuggestions] = useState([]);
  const [addFriendLoading, setAddFriendLoading] = useState(false);
  const [addFriendStatus, setAddFriendStatus] = useState(null); // { type: 'success'|'error', msg }
  const addFriendDebounceRef = useRef(null);

  // Play Game & Matchmaking States
  const [showPlayConfig, setShowPlayConfig] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [matchTimer, setMatchTimer] = useState(0);
  const matchIntervalRef = useRef(null);

  // Custom Lobby Inputs
  const [customLobbyGame, setCustomLobbyGame] = useState("VALORANT");
  const [customLobbySize, setCustomLobbySize] = useState(5);
  const [lobbyCode, setLobbyCode] = useState("");

  // Lobby Room States
  const [isInLobbyRoom, setIsInLobbyRoom] = useState(false);
  const [lobbyGame, setLobbyGame] = useState("");
  const [lobbyMembers, setLobbyMembers] = useState(["You"]);
  const [lobbyMaxSize, setLobbyMaxSize] = useState(5);
  const [lobbyMessages, setLobbyMessages] = useState([]);
  const [lobbyChatInput, setLobbyChatInput] = useState("");

  const [newMessage, setNewMessage] = useState("");

  // Friends State — loaded from API
  const [friendsList, setFriendsList] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);

  const [activeFriendId, setActiveFriendId] = useState(null);
  const activeFriend = friendsList.find(f => f.id === activeFriendId);

  const [invitedPlayerIds, setInvitedPlayerIds] = useState([]);
  const [registeredTournaments, setRegisteredTournaments] = useState([]);

  // Notifications State — loaded from API
  const [notifications, setNotifications] = useState([]);
  const [notifsLoading, setNotifsLoading] = useState(false);

  // Tournaments State — loaded from API
  const [tournamentsList, setTournamentsList] = useState([]);
  const [tournamentsLoading, setTournamentsLoading] = useState(false);

  // Stats State — loaded from API
  const [gameStats, setGameStats] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);

  // ── Game rank lookup for matchmaking display ─────────────────────────────
  const gameRanks = {
    VALORANT: "Platinum IV",
    CS2: "Gold Nova II",
    LOL: "Diamond II",
    APEX: "Diamond III",
    DOTA2: "Archon V",
    R6SIEGE: "Gold I",
    OVERWATCH2: "Master V",
    ROCKETLG: "Champion II",
  };

  // ── Fetch friends when view activates ────────────────────────────────────
  useEffect(() => {
    if (activeView !== "friends") return;
    setFriendsLoading(true);
    api("/friends")
      .then(d => {
        const list = d.friends ?? [];
        setFriendsList(list);
        // B16 fix: only auto-select first friend if current activeFriendId is not in the new list
        // B13 fix: if activeFriendId is stale (friend removed), reset it
        setActiveFriendId(prev => {
          if (prev && list.some(f => f.id === prev)) return prev; // keep valid selection
          return list.length > 0 ? list[0].id : null;             // reset to first or null
        });
      })
      .catch(() => {})
      .finally(() => setFriendsLoading(false));
  }, [activeView]); // eslint-disable-line

  // ── Fetch notifications when view activates ──────────────────────────────
  useEffect(() => {
    if (activeView !== "notifications") return;
    setNotifsLoading(true);
    api("/notifications")
      .then(d => {
        const list = d.notifications ?? [];
        setNotifications(list);
        setUnreadNotifCount(list.filter(n => !n.resolved).length);
      })
      .catch(() => {})
      .finally(() => setNotifsLoading(false));
  }, [activeView]); // eslint-disable-line

  // ── Fetch tournaments when view activates ────────────────────────────────
  useEffect(() => {
    if (activeView !== "tournaments") return;
    setTournamentsLoading(true);
    api("/tournaments")
      .then(d => {
        const list = d.tournaments ?? [];
        setTournamentsList(list);
        setRegisteredTournaments(list.filter(t => t.isRegistered).map(t => t.id));
      })
      .catch(() => {})
      .finally(() => setTournamentsLoading(false));
  }, [activeView]);

  // ── Fetch stats when view activates ─────────────────────────────────────
  useEffect(() => {
    if (activeView !== "stats") return;
    setStatsLoading(true);
    api("/stats")
      .then(d => setGameStats(d.stats ?? []))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, [activeView]);

  // ── Matchmaking timer ────────────────────────────────────────────────────
  useEffect(() => {
    if (isMatching) {
      matchIntervalRef.current = setInterval(() => {
        setMatchTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(matchIntervalRef.current);
  }, [isMatching]);

  // ── Matchmaking success handler ─────────────────────────────────────────
  useEffect(() => {
    if (isMatching && matchTimer >= 4) {
      clearInterval(matchIntervalRef.current);
      setIsMatching(false);
      const randomFriend = friendsList.length > 0
        ? friendsList[Math.floor(Math.random() * friendsList.length)]
        : { name: "PLAYER_01" };
      const uuid = crypto.randomUUID().replace(/-/g, "").substring(0, 8).toUpperCase();
      const code = `LBY-${uuid}`;
      setLobbyCode(code);
      const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setLobbyGame(selectedGame);
      setLobbyMembers(["You", randomFriend.name]);
      setLobbyMessages([
        { sender: "System", text: `Match Found! ${randomFriend.name} has joined your lobby.`, time: ts },
        { sender: randomFriend.name, text: `Hey! Ready to play some ${selectedGame}?`, time: ts },
      ]);
      setIsInLobbyRoom(true);
      setMatchTimer(0);
    }
  }, [matchTimer, isMatching, friendsList, selectedGame]);

  // ── Socket cleanup ───────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // ── Socket listeners ─────────────────────────────────────────────────────
  const setupSocketListeners = (socket) => {
    socket.on("lobby-update", (lobby) => {
      setLobbyGame(lobby.game);
      setLobbyMembers(lobby.members);
      setLobbyMessages(lobby.messages);
      setLobbyMaxSize(lobby.maxSize || 5);
    });
    socket.on("chat-message", (msg) => setLobbyMessages(prev => [...prev, msg]));
    socket.on("lobby-error", (err) => { alert(err.message); handleLeaveLobby(); });
    socket.on("match-started", ({ serverLink, message }) => {
      alert(message);
      window.open(serverLink, "_blank");
    });
  };

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleStartMatchmaking = () => { setMatchTimer(0); setIsMatching(true); };
  const handleCancelMatchmaking = () => { setIsMatching(false); setMatchTimer(0); };

  const nowTime = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleCreateCustomLobby = () => {
    // Use crypto.randomUUID() for a secure, unique lobby code
    const uuid = crypto.randomUUID().replace(/-/g, "").substring(0, 8).toUpperCase();
    const code = `LBY-${uuid}`;
    setLobbyCode(code);
    const socketUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace("/api", "")
      : "http://localhost:5001";
    // B4 fix: disconnect any existing socket before creating a new one
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    const socket = io(socketUrl, { transports: ["websocket"] });
    socketRef.current = socket;
    socket.emit("join-lobby", {
      lobbyCode: code,
      username: user?.username || "player",
      rank: gameRanks[customLobbyGame] || "Unranked",
      game: customLobbyGame,
      maxSize: customLobbySize,
    });
    setupSocketListeners(socket);
    setLobbyGame(customLobbyGame);
    setIsInLobbyRoom(true);
  };

  const handleJoinCustomLobby = (e) => {
    e.preventDefault();
    if (!lobbyCode.trim()) return;
    const code = lobbyCode.toUpperCase();
    const socketUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace("/api", "")
      : "http://localhost:5001";
    // B4 fix: disconnect any existing socket before creating a new one
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    const socket = io(socketUrl, { transports: ["websocket"] });
    socketRef.current = socket;
    // B10 fix: use the selected game (customLobbyGame) not hardcoded VALORANT
    socket.emit("join-lobby", {
      lobbyCode: code,
      username: user?.username || "player",
      rank: gameRanks[customLobbyGame] || "Unranked",
      game: customLobbyGame,
    });
    setupSocketListeners(socket);
    setLobbyGame(customLobbyGame);
    setIsInLobbyRoom(true);
  };

  const handleLeaveLobby = () => {
    if (socketRef.current) {
      socketRef.current.emit("leave-lobby");
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsInLobbyRoom(false);
    setLobbyMembers(["You"]);
    setLobbyMessages([]);
    setShowPlayConfig(false);
  };

  const handleSendLobbyChat = (e) => {
    e.preventDefault();
    if (!lobbyChatInput.trim()) return;
    if (socketRef.current) {
      socketRef.current.emit("send-chat", { message: lobbyChatInput });
    } else {
      setLobbyMessages(prev => [...prev, { sender: "You", text: lobbyChatInput, time: nowTime() }]);
    }
    setLobbyChatInput("");
  };

  const handleStartGameMatch = () => {
    if (socketRef.current) socketRef.current.emit("start-match");
    else setToast("Launching matchmaking game server! Good luck!");
  };

  const handleCopyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/join-lobby?code=${lobbyCode}`;
    navigator.clipboard.writeText(inviteUrl).catch(() => {});
    setToast("Invite link copied to clipboard!");
  };

  const handleSendFriendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeFriend) return;
    try {
      const data = await api(`/friends/${activeFriend.id}/message`, {
        method: "POST",
        body: JSON.stringify({ text: newMessage }),
      });
      setFriendsList(prev => prev.map(f =>
        f.id === activeFriend.id
          ? { ...f, messages: [...(f.messages || []), data.message] }
          : f
      ));
      setNewMessage("");
    } catch (err) {
      console.error("send message error:", err);
    }
  };

  const handleInvitePlayer = (id, name) => {
    if (invitedPlayerIds.includes(id)) return;
    setInvitedPlayerIds(prev => [...prev, id]);
    if (isInLobbyRoom) {
      setLobbyMessages(prev => [...prev, { sender: "System", text: `Invitation sent to ${name}!`, time: nowTime() }]);
    } else {
      setToast(`Invitation sent to ${name}!`);
    }
  };

  // ── Add-friend handlers (name suggestion feature) ───────────────────────────
  const [showAddFriend, setShowAddFriend] = useState(false);

  const handleAddFriendQueryChange = (e) => {
    const val = e.target.value;
    setAddFriendQuery(val);
    setAddFriendStatus(null);
    // Clear any existing debounce timer
    if (addFriendDebounceRef.current) clearTimeout(addFriendDebounceRef.current);
    if (!val.trim()) {
      setAddFriendSuggestions([]);
      return;
    }
    // Debounce: wait 300ms after user stops typing before hitting the API
    addFriendDebounceRef.current = setTimeout(async () => {
      setAddFriendLoading(true);
      try {
        const data = await api(`/friends/search?q=${encodeURIComponent(val.trim())}`);
        setAddFriendSuggestions(data.users ?? []);
        setAddFriendStatus(null);
      } catch (err) {
        setAddFriendSuggestions([]);
        setAddFriendStatus({ type: 'error', msg: err.message || 'Error searching users' });
      } finally {
        setAddFriendLoading(false);
      }
    }, 300);
  };

  const handleSendFriendRequest = async (username) => {
    try {
      await api('/friends/request', {
        method: 'POST',
        body: JSON.stringify({ username }),
      });
      setAddFriendStatus({ type: 'success', msg: `Friend request sent to ${username}!` });
      setSentRequests(prev => [...prev, username]);
      setAddFriendSuggestions(prev => prev.filter(u => u.username !== username));
    } catch (err) {
      setAddFriendStatus({ type: 'error', msg: err.message || 'Could not send request' });
    }
  };

  const handleResolveNotification = async (id, action, detail = "") => {
    try {
      await api(`/notifications/${id}/resolve`, {
        method: "PATCH",
        body: JSON.stringify({ action, detail }),
      });
      setNotifications(prev => {
        const updated = prev.map(n =>
          n.id === id ? { ...n, resolved: true, statusText: detail } : n
        );
        setUnreadNotifCount(updated.filter(n => !n.resolved).length);
        return updated;
      });

      // If user accepted a lobby invite — join it via socket
      if (action === "accept") {
        const notif = notifications.find(n => n.id === id);
        if (notif?.type === "lobby" && notif?.game) {
          // Extract lobby code from the message if present (format: "... lobby CODE (GAME).")
          const codeMatch = notif.message?.match(/lobby\s+(LBY-[A-Z0-9]+)/i);
          if (codeMatch) {
            const code = codeMatch[1].toUpperCase();
            const socketUrl = import.meta.env.VITE_API_URL
              ? import.meta.env.VITE_API_URL.replace("/api", "")
              : "http://localhost:5001";
            if (socketRef.current) { socketRef.current.disconnect(); socketRef.current = null; }
            const socket = io(socketUrl, { transports: ["websocket"] });
            socketRef.current = socket;
            socket.emit("join-lobby", {
              lobbyCode: code,
              username: user?.username || "player",
              rank: gameRanks[notif.game] || "Unranked",
              game: notif.game,
            });
            setupSocketListeners(socket);
            setLobbyCode(code);
            setLobbyGame(notif.game);
            setIsInLobbyRoom(true);
            onViewChange("lobby");
          }
        }
      }
    } catch (err) {
      console.error("resolve notification error:", err);
    }
  };

  const handleRegisterTournament = async (id, name) => {
    // Optimistically mark as registered
    setRegisteredTournaments(prev => [...prev, id]);
    try {
      await api(`/tournaments/${id}/register`, { method: "POST" });
      setTournamentsList(prev => prev.map(t =>
        t.id === id ? { ...t, isRegistered: true } : t
      ));
    } catch (err) {
      // Revert optimistic update on failure
      setRegisteredTournaments(prev => prev.filter(tid => tid !== id));
      setToast(err.message || "Could not register — please try again");
    }
  };

  // ── Derived stats for the table ──────────────────────────────────────────
  const gamesStats = gameStats.map(s => ({
    name: s.game,
    rank: s.rank,
    winRate: (s.wins + s.losses) > 0
      ? `${((s.wins / (s.wins + s.losses)) * 100).toFixed(1)}%`
      : "—",
    kda: String(s.kda ?? "—"),
    history: s.recentHistory ?? [],
    mmr: s.mmr !== undefined ? `${s.mmr.toLocaleString()} MMR` : "—",
  }));

  // ── Theme helpers ────────────────────────────────────────────────────────
  const isDark = theme === "dark";
  const textColor       = isDark ? "text-white"           : "text-[#0b0c0b]";
  const textPrimary     = isDark ? "text-[#e6e8eb]"       : "text-[#0b0c0b]";
  const textMuted       = isDark ? "text-[#cbd4cc]/60"    : "text-[#0b0c0b]/60";
  const textMutedLight  = isDark ? "text-[#cbd4cc]/45"    : "text-[#0b0c0b]/40";
  const borderColor     = isDark ? "border-[#ffffff]/10"  : "border-[#0b0c0b]/15";
  const bgSelect        = isDark ? "bg-[#121620] text-[#cbd4cc]" : "bg-[#ffffff] text-[#0b0c0b]";
  const borderFilter    = isDark ? "border-[#ffffff]/15"  : "border-[#0b0c0b]/20";

  const filteredFriends = friendsList.filter(f =>
    f.name.toLowerCase().includes(inviteSearchQuery.toLowerCase())
  );

  // ══════════════════════════════════════════════════════════════════════════
  // STATS VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (activeView === "stats") {
    return (
      <div className={`absolute inset-0 flex flex-col justify-between p-2 sm:p-4 animate-fade-in ${textPrimary} z-[5]`}>
        {/* Header */}
        <div className={`flex items-center justify-between border-b ${borderColor} pb-4 mb-4 px-2`}>
          <div>
            <p className="font-['Orbitron'] text-xs font-black uppercase tracking-[6px] text-[#e53e3e]">
              PLAYER STATS OVERVIEW
            </p>
            <h2 className={`mt-1 text-2xl font-black uppercase tracking-tight ${textColor} font-['Orbitron']`}>
              {user?.username ?? "Agent"} Game Performance
            </h2>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto min-h-0 pb-6 w-full">
          {statsLoading ? (
            <div className={`px-6 py-8 text-center font-['Share_Tech_Mono'] text-[11px] ${textMuted}`}>
              // loading stats...
            </div>
          ) : gamesStats.length === 0 ? (
            <div className={`px-6 py-8 text-center font-['Share_Tech_Mono'] text-[11px] ${textMuted}`}>
              // no game stats recorded yet
            </div>
          ) : (
            <div className={`w-full border border-x-0 border-b-0 ${borderColor} bg-transparent overflow-hidden flex flex-col`}>
              {/* Table Header */}
              <div className={`grid grid-cols-6 gap-4 px-6 py-4 ${isDark ? "bg-[#ffffff]/5" : "bg-[#0b0c0b]/5"} border-b ${borderColor} text-[10px] font-black uppercase tracking-[2.5px] ${textMuted}`}>
                <div className="col-span-2">Game Title</div>
                <div className="text-center">Win Rate</div>
                <div className="text-center">KDA Ratio</div>
                <div className="text-center">Match History</div>
                <div className="text-right">Rank / MMR</div>
              </div>
              {/* Table Body */}
              <div className={`divide-y ${isDark ? "divide-[#ffffff]/5" : "divide-[#0b0c0b]/10"} flex flex-col ${isDark ? "bg-[#0a0c10]/40" : "bg-[#ffffff]/60"} backdrop-blur-[2px]`}>
                {gamesStats.map((game) => (
                  <div key={game.name} className={`grid grid-cols-6 gap-4 px-6 py-4 items-center ${isDark ? "hover:bg-[#ffffff]/5" : "hover:bg-[#0b0c0b]/5"} transition-colors`}>
                    <div className="col-span-2 flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-[#e53e3e]" />
                      <span className={`font-['Orbitron'] text-xs font-bold uppercase tracking-wider ${textColor}`}>
                        {game.name}
                      </span>
                    </div>
                    <div className={`text-center font-mono text-xs font-semibold ${textColor}`}>{game.winRate}</div>
                    <div className={`text-center font-mono text-xs font-semibold ${textColor}`}>{game.kda}</div>
                    <div className="flex items-center justify-center gap-1.5">
                      {game.history.map((res, i) => (
                        <span key={i} className={`flex h-5 w-5 items-center justify-center rounded text-[9px] font-black font-mono border ${
                          res === "W"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}>
                          {res}
                        </span>
                      ))}
                    </div>
                    <div className="text-right space-y-1 pr-6">
                      <div className={`font-mono text-xs ${textColor} font-bold`}>{game.mmr}</div>
                      <div className={`text-[9px] uppercase tracking-wider ${textMuted} font-bold`}>{game.rank}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FRIENDS VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (activeView === "friends") {
    return (
      <div className={`absolute inset-0 flex animate-fade-in ${textPrimary} z-[5] pb-0`}>
        <div className={`w-full h-full border border-x-0 border-b-0 ${borderColor} bg-transparent overflow-hidden flex`}>

          {/* Left: friends list */}
          <div className={`w-[240px] flex flex-col border-r ${borderColor} h-full ${isDark ? "bg-[#0a0c10]/80" : "bg-[#ffffff]/80"} backdrop-blur-md`}>
            <div className={`px-5 py-4 border-b ${borderColor} ${isDark ? "bg-[#ffffff]/5" : "bg-[#0b0c0b]/5"} flex items-center justify-between`}>
              <h3 className={`font-['Orbitron'] text-xs font-black uppercase tracking-[2px] ${textColor}`}>Friends</h3>
              <span className={`text-[9px] font-bold uppercase tracking-widest ${textMuted}`}>
                {friendsList.filter(f => f.status !== "Offline").length} online
              </span>
            </div>

            <div className={`flex-1 overflow-y-auto divide-y ${isDark ? "divide-[#ffffff]/5" : "divide-[#0b0c0b]/10"}`}>
              {friendsLoading && (
                <div className={`px-5 py-4 text-[10px] ${textMuted} font-['Share_Tech_Mono']`}>// loading...</div>
              )}
              {!friendsLoading && friendsList.length === 0 && (
                <div className={`px-5 py-4 text-[10px] ${textMuted} font-['Share_Tech_Mono']`}>// no friends yet</div>
              )}
              {friendsList.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => setActiveFriendId(friend.id)}
                  className={`w-full text-left px-5 py-3.5 flex items-center justify-between transition-colors ${
                    isDark ? "hover:bg-[#ffffff]/5" : "hover:bg-[#0b0c0b]/5"
                  } ${
                    activeFriendId === friend.id
                      ? (isDark ? "bg-[#ffffff]/5 border-l-2 border-[#e53e3e]" : "bg-[#0b0c0b]/5 border-l-2 border-[#e53e3e]")
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`relative flex h-7 w-7 items-center justify-center border text-[9px] font-black ${
                      isDark ? "border-[#ffffff]/15 text-[#cbd4cc]/70" : "border-[#0b0c0b]/25 text-[#0b0c0b]/70"
                    }`}>
                      {friend.initial}
                      <span className={`absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full ${
                        friend.status === "Online"  ? "bg-[#22c55e]" :
                        friend.status === "In-Game" ? "bg-[#a370f7]" :
                        friend.status === "Away"    ? "bg-[#f0b232]" : "bg-[#80848e]"
                      }`} />
                    </div>
                    <div className="flex flex-col">
                      <span className={`font-['Orbitron'] text-[11px] font-black ${textColor}`}>{friend.name}</span>
                      <span className={`text-[9px] uppercase tracking-wider ${textMuted}`}>{friend.status}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Always-visible Add Friend panel at the bottom */}
            <div className={`mt-auto border-t ${borderColor} ${isDark ? "bg-[#0d1016]" : "bg-[#f7f7f5]"} p-4 shadow-[0_-4px_20px_rgba(229,62,62,0.1)] relative overflow-visible`}>
              <div className="absolute -top-[1px] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#e53e3e]/50 to-transparent" />
              <p className={`font-['Orbitron'] text-[10px] uppercase tracking-[2px] font-black ${textColor} mb-2`}>
                Add Friend
              </p>
              <div className="relative">
                <input
                  type="text"
                  value={addFriendQuery}
                  onChange={handleAddFriendQueryChange}
                  placeholder="Search username..."
                  className={`w-full ${isDark ? "bg-[#121620] text-[#cbd4cc]" : "bg-white text-[#0b0c0b]"} border border-[#e53e3e]/30 px-3 py-2 text-[11px] focus:outline-none focus:border-[#e53e3e] focus:shadow-[0_0_10px_rgba(229,62,62,0.2)] pr-7 transition-all`}
                />
                {addFriendLoading && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <div className="h-3 w-3 border-2 border-[#e53e3e]/40 border-t-[#e53e3e] rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Suggestions dropdown (floats above) */}
              {addFriendSuggestions.length > 0 && (
                <div className={`absolute bottom-full left-0 w-full mb-2 border ${borderColor} ${isDark ? "bg-[#121620]" : "bg-white"} max-h-48 overflow-y-auto shadow-xl z-50`}>
                  {addFriendSuggestions.map((u) => (
                    <div key={u.id} className={`flex items-center justify-between px-3 py-2 border-b last:border-0 ${borderColor} ${isDark ? "hover:bg-[#ffffff]/5" : "hover:bg-[#0b0c0b]/5"}`}>
                      <div className="flex items-center gap-2">
                        <div className={`h-6 w-6 border flex items-center justify-center text-[9px] font-black ${
                          isDark ? "border-[#ffffff]/15 text-[#cbd4cc]/60" : "border-[#0b0c0b]/20 text-[#0b0c0b]/50"
                        }`}>
                          {u.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className={`block text-[11px] font-bold ${textColor}`}>{u.username}</span>
                          <span className={`block text-[9px] ${textMuted}`}>{u.rank}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSendFriendRequest(u.username)}
                        disabled={sentRequests.includes(u.username)}
                        className={`text-[9px] font-black uppercase tracking-[1px] px-2.5 py-1 transition-all ${
                          sentRequests.includes(u.username)
                            ? "bg-green-500/10 text-green-500 border border-green-500/20 cursor-default"
                            : "bg-[#e53e3e] hover:bg-[#e53e3e]/80 text-black shadow-[0_0_8px_rgba(229,62,62,0.4)]"
                        }`}
                      >
                        {sentRequests.includes(u.username) ? "Sent" : "Add"}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* No results */}
              {!addFriendLoading && addFriendQuery.trim() && addFriendSuggestions.length === 0 && !addFriendStatus && (
                <p className={`text-[10px] ${textMuted} mt-2 font-['Share_Tech_Mono']`}>
                  // no users found
                </p>
              )}

              {/* Status message */}
              {addFriendStatus && (
                <p className={`text-[10px] mt-2 font-['Share_Tech_Mono'] ${
                  addFriendStatus.type === 'success' ? 'text-[#22c55e]' : 'text-[#e53e3e]'
                }`}>
                  {addFriendStatus.msg}
                </p>
              )}
            </div>
          </div>

          {/* Right: chat area */}
          <div className={`flex-1 flex flex-col h-full ${isDark ? "bg-[#0a0c10]/80" : "bg-[#ffffff]/80"} backdrop-blur-md`}>
            {/* Online strip */}
            <div className={`px-6 py-3 border-b ${borderColor} ${isDark ? "bg-[#ffffff]/5" : "bg-[#0b0c0b]/5"} flex items-center gap-4`}>
              <span className={`font-['Orbitron'] text-[9px] font-black tracking-[2px] ${textMuted} uppercase shrink-0`}>Online</span>
              <div className="flex items-center gap-2">
                {friendsList.filter(f => f.status !== "Offline").map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => setActiveFriendId(friend.id)}
                    title={`${friend.name} — ${friend.status}`}
                    className={`relative flex h-7 w-7 items-center justify-center border text-[9px] font-black transition-colors ${
                      activeFriendId === friend.id
                        ? (isDark ? "border-[#e53e3e] bg-[#e53e3e]/10 text-[#e53e3e]" : "border-[#0b0c0b] bg-[#0b0c0b] text-[#cbd4cc]")
                        : (isDark ? "border-[#ffffff]/15 text-[#cbd4cc]/60 hover:border-[#e53e3e]/40" : "border-[#0b0c0b]/20 text-[#0b0c0b]/50 hover:border-[#0b0c0b]/50")
                    }`}
                  >
                    {friend.initial}
                    <span className={`absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full ${
                      friend.status === "Online"  ? "bg-[#22c55e]" :
                      friend.status === "In-Game" ? "bg-[#a370f7]" : "bg-[#f0b232]"
                    }`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Chat pane */}
            {activeFriend ? (
              <div className="flex-1 flex flex-col h-full min-h-0">
                {/* Chat header */}
                <div className={`px-6 py-3 border-b ${borderColor} ${isDark ? "bg-[#ffffff]/3" : "bg-[#0b0c0b]/3"} flex justify-between items-center`}>
                  <div>
                    <h3 className={`font-['Orbitron'] text-xs font-black ${textColor}`}>Chat with {activeFriend.name}</h3>
                    <span className={`text-[9px] uppercase tracking-wider ${textMuted}`}>{activeFriend.status}</span>
                  </div>
                  {activeFriend.status !== "Offline" && (
                    <button
                      onClick={() => {
                        // B9 fix: actually send a lobby invite notification instead of alert
                        if (isInLobbyRoom && lobbyCode) {
                          api(`/notifications`, {
                            method: "POST",
                            body: JSON.stringify({
                              recipientId: activeFriend.friendId,
                              type: "lobby",
                              title: "Lobby Invitation",
                              message: `${user?.username} invited you to join lobby ${lobbyCode} (${lobbyGame}).`,
                              game: lobbyGame,
                            }),
                          }).catch(() => {});
                          setLobbyMessages(prev => [...prev, {
                            sender: "System",
                            text: `Lobby invitation sent to ${activeFriend.name}!`,
                            time: "Just now",
                          }]);
                        } else {
                          // Not in a lobby — just show a message
                          setLobbyMessages([]);
                          alert(`Start a lobby first to invite ${activeFriend.name}!`);
                        }
                      }}
                      className="font-['Rajdhani'] text-[11px] font-bold tracking-[2px] uppercase border-b border-[#e53e3e]/50 text-[#e53e3e] hover:border-[#e53e3e] transition-colors bg-transparent border-l-0 border-r-0 border-t-0 cursor-pointer pb-px"
                    >
                      INVITE TO LOBBY <span className="text-[10px]">→</span>
                    </button>
                  )}
                </div>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
                  {(activeFriend.messages || []).map((msg, i) => {
                    const isSelf = msg.sender === "You";
                    return (
                      <div key={i} className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}>
                        <div className={`px-4 py-2 max-w-md text-xs ${
                          isSelf
                            ? "bg-[#e53e3e] text-black"
                            : (isDark ? "bg-[#121620] text-[#cbd4cc] border border-[#ffffff]/10" : "bg-white text-[#0b0c0b] border border-[#0b0c0b]/10")
                        }`}>
                          {msg.text}
                        </div>
                        <span className={`text-[9px] ${textMutedLight} mt-1`}>{msg.time}</span>
                      </div>
                    );
                  })}
                </div>
                {/* Chat input */}
                <form onSubmit={handleSendFriendMessage} className={`p-4 border-t ${borderColor} ${isDark ? "bg-[#ffffff]/5" : "bg-[#0b0c0b]/5"} flex gap-3`}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Send message to ${activeFriend.name}...`}
                    className={`flex-1 ${isDark ? "bg-[#121620] text-[#e6e8eb]" : "bg-white text-[#0b0c0b]"} placeholder:text-[#cbd4cc]/30 border ${borderFilter} px-4 py-2.5 text-xs focus:outline-none focus:border-[#e53e3e]`}
                  />
                  <button type="submit" className="bg-[#e53e3e] text-black hover:bg-[#e53e3e]/90 px-5 py-2.5 text-xs font-black uppercase tracking-[2px] transition-all">
                    SEND
                  </button>
                </form>
              </div>
            ) : (
              <div className={`flex-1 flex items-center justify-center ${textMutedLight} text-xs font-bold uppercase tracking-[2px]`}>
                Select a friend to begin chatting
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TOURNAMENTS VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (activeView === "tournaments") {
    return (
      <div className={`absolute inset-0 flex flex-col animate-fade-in ${textPrimary} z-[5] p-2 sm:p-4 pb-0 sm:pb-0`}>
        <div className={`flex items-center justify-between border-b ${borderColor} pb-4 mb-4 px-2`}>
          <div>
            <p className="font-['Orbitron'] text-xs font-black uppercase tracking-[6px] text-[#e53e3e]">TOURNAMENTS ARENA</p>
            <h2 className={`mt-1 text-2xl font-black uppercase tracking-tight ${textColor} font-['Orbitron']`}>
              Open Tournaments &amp; Championships
            </h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 pb-2 pr-1 w-full">
          {tournamentsLoading ? (
            <div className={`px-6 py-8 text-center font-['Share_Tech_Mono'] text-[11px] ${textMuted}`}>
              // loading tournaments...
            </div>
          ) : tournamentsList.length === 0 ? (
            <div className={`px-6 py-8 text-center font-['Share_Tech_Mono'] text-[11px] ${textMuted}`}>
              // no tournaments available
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6 px-2">
              {tournamentsList.map((tourney) => {
                const isRegistered = registeredTournaments.includes(tourney.id);
                const isLive      = tourney.status === "Live";
                const isCompleted = tourney.status === "Completed";
                return (
                  <div key={tourney.id} className={`relative border ${borderColor} ${isDark ? "bg-[#0d1016]/90" : "bg-[#ffffff]/90"} p-5 flex flex-col justify-between backdrop-blur-sm`}>
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className={`text-[10px] font-black font-mono tracking-widest ${isLive ? "text-red-500" : isCompleted ? "text-gray-400" : "text-[#e53e3e]"}`}>
                          // {tourney.game}
                        </span>
                        <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 border ${
                          isLive
                            ? "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse"
                            : isCompleted
                              ? "bg-gray-500/10 text-gray-500 border-gray-500/20"
                              : "bg-[#e53e3e]/10 text-[#e53e3e] border-[#e53e3e]/20"
                        }`}>
                          {tourney.status}
                        </span>
                      </div>
                      <h3 className={`font-['Orbitron'] text-sm font-black tracking-wide ${textColor} mb-1`}>{tourney.name}</h3>
                      <p className={`text-[10px] ${textMuted} mb-4`}>
                        Prize Pool: <span className={`font-bold ${textColor}`}>{tourney.prize}</span>
                      </p>
                      <div className={`space-y-1.5 border-t border-b ${borderColor} py-3 mb-4`}>
                        <div className="flex justify-between text-[10px]">
                          <span className={textMuted}>Schedule:</span>
                          <span className={`font-bold ${textColor}`}>{tourney.time}</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className={textMuted}>Registration:</span>
                          <span className={`font-bold ${textColor}`}>{tourney.spots}</span>
                        </div>
                      </div>
                    </div>
                    {isCompleted ? (
                      <button disabled className="w-full bg-gray-500/10 text-gray-400/60 py-2.5 text-xs font-black uppercase tracking-[1.5px] cursor-not-allowed border border-gray-500/10">
                        Ended
                      </button>
                    ) : isLive ? (
                      <button onClick={() => alert("Launching Stream overlay...")} className="w-full bg-[#e53e3e] hover:bg-[#c53030] text-white py-2.5 text-xs font-black uppercase tracking-[1.5px] transition-all">
                        Watch Match
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRegisterTournament(tourney.id, tourney.name)}
                        disabled={isRegistered}
                        className={`w-full py-2.5 text-xs font-black uppercase tracking-[1.5px] transition-all ${
                          isRegistered
                            ? "bg-green-500/15 text-green-500 border border-green-500/20 cursor-default"
                            : "bg-[#e53e3e] hover:bg-[#e53e3e]/90 text-black"
                        }`}
                      >
                        {isRegistered ? "Registered" : "Register"}
                      </button>
                    )}
                    <span className="absolute top-0 left-0 h-2 w-2 border-l border-t border-[#e53e3e]/20" />
                    <span className="absolute bottom-0 right-0 h-2 w-2 border-r border-b border-[#e53e3e]/20" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // NOTIFICATIONS VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (activeView === "notifications") {
    return (
      <div className={`absolute inset-0 flex flex-col animate-fade-in ${textPrimary} z-[5] p-2 sm:p-4`}>
        <div className={`flex items-center justify-between border-b ${borderColor} pb-4 mb-4 px-2`}>
          <div>
            <p className="font-['Orbitron'] text-xs font-black uppercase tracking-[6px] text-[#e53e3e]">SYSTEM ALERTS</p>
            <h2 className={`mt-1 text-2xl font-black uppercase tracking-tight ${textColor} font-['Orbitron']`}>
              Inbox Notifications
            </h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 pb-6 space-y-px w-full">
          {notifsLoading && (
            <div className={`px-4 py-4 font-['Share_Tech_Mono'] text-[10px] ${textMuted}`}>// loading...</div>
          )}
          {!notifsLoading && notifications.length === 0 && (
            <div className={`text-center py-10 ${textMutedLight} text-xs font-bold uppercase tracking-[2px]`}>
              No new alerts
            </div>
          )}
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`relative flex items-start justify-between gap-6 border-b ${borderColor} px-4 py-4 transition-colors ${
                notif.resolved ? "opacity-50" : (isDark ? "hover:bg-[#ffffff]/3" : "hover:bg-[#0b0c0b]/3")
              }`}
            >
              {/* Left: type tag + message */}
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <span className={`mt-0.5 shrink-0 font-['Orbitron'] text-[8px] font-black tracking-[1.5px] uppercase border px-1.5 py-0.5 ${
                  notif.type === "lobby"
                    ? "border-[#e53e3e]/40 text-[#e53e3e]"
                    : notif.type === "friend_request"
                      ? "border-[#22c55e]/40 text-[#22c55e]"
                      : "border-[#a370f7]/40 text-[#a370f7]"
                }`}>
                  {notif.type === "lobby" ? "LOBBY" : notif.type === "friend_request" ? "FRIEND" : "TOURNEY"}
                </span>
                <div className="min-w-0">
                  <p className={`font-['Orbitron'] text-[11px] font-black tracking-[0.5px] ${textColor} leading-tight`}>
                    {notif.title}
                  </p>
                  <p className={`font-['Share_Tech_Mono'] text-[10px] ${textMuted} mt-0.5 leading-snug`}>
                    {notif.message}
                  </p>
                </div>
              </div>

              {/* Right: actions + time */}
              <div className="flex items-center gap-4 shrink-0">
                {!notif.resolved ? (
                  <div className="flex items-center gap-3">
                    {notif.type === "lobby" && (
                      <>
                        <button
                          onClick={() => handleResolveNotification(notif.id, "accept", `Joined ${notif.sender}'s ${notif.game} lobby!`)}
                          className="font-['Rajdhani'] text-[11px] font-bold tracking-[2px] uppercase border-b border-[#e53e3e]/50 text-[#e53e3e] hover:border-[#e53e3e] transition-colors bg-transparent border-l-0 border-r-0 border-t-0 cursor-pointer pb-px"
                        >
                          ACCEPT
                        </button>
                        <button
                          onClick={() => handleResolveNotification(notif.id, "decline", "Ignored lobby invitation.")}
                          className={`font-['Rajdhani'] text-[11px] font-bold tracking-[2px] uppercase ${textMuted} transition-colors bg-transparent border-none cursor-pointer`}
                        >
                          IGNORE
                        </button>
                      </>
                    )}
                    {notif.type === "friend_request" && (
                      <>
                        <button
                          onClick={() => handleResolveNotification(notif.id, "accept", `Accepted friend request from ${notif.sender}!`)}
                          className="font-['Rajdhani'] text-[11px] font-bold tracking-[2px] uppercase border-b border-[#22c55e]/50 text-[#22c55e] hover:border-[#22c55e] transition-colors bg-transparent border-l-0 border-r-0 border-t-0 cursor-pointer pb-px"
                        >
                          ACCEPT
                        </button>
                        <button
                          onClick={() => handleResolveNotification(notif.id, "decline", `Declined friend request from ${notif.sender}.`)}
                          className={`font-['Rajdhani'] text-[11px] font-bold tracking-[2px] uppercase ${textMuted} transition-colors bg-transparent border-none cursor-pointer`}
                        >
                          DECLINE
                        </button>
                      </>
                    )}
                    {notif.type === "tournament" && (
                      <button
                        onClick={() => { onViewChange("tournaments"); handleResolveNotification(notif.id, "view", "Navigating to tournaments board."); }}
                        className="font-['Rajdhani'] text-[11px] font-bold tracking-[2px] uppercase border-b border-[#a370f7]/50 text-[#a370f7] hover:border-[#a370f7] transition-colors bg-transparent border-l-0 border-r-0 border-t-0 cursor-pointer pb-px"
                      >
                        REGISTER
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="font-['Share_Tech_Mono'] text-[9px] text-[#22c55e] uppercase tracking-wider">
                    ✓ done
                  </span>
                )}
                <span className={`font-['Share_Tech_Mono'] text-[9px] ${textMutedLight} whitespace-nowrap`}>
                  {notif.time}
                </span>
              </div>

              {/* Left accent bar */}
              {!notif.resolved && (
                <span className={`absolute left-0 top-0 bottom-0 w-0.5 ${
                  notif.type === "lobby" ? "bg-[#e53e3e]" :
                  notif.type === "friend_request" ? "bg-[#22c55e]" : "bg-[#a370f7]"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // LOBBY VIEW (default)
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className={`absolute inset-0 flex flex-col justify-between p-2 sm:p-4 animate-fade-in ${textPrimary}`}>

      {/* Invite drawer */}
      {showInviteCard && (
        <div className={`fixed right-6 top-[120px] w-[280px] max-h-[380px] border ${borderColor} ${isDark ? "bg-[#0d1016]/95" : "bg-[#cbd4cc]/95"} shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-md flex flex-col p-4 z-40 animate-fade-in`}>
          <div className={`flex items-center justify-between mb-3 pb-2 border-b ${borderColor}`}>
            <span className={`font-['Orbitron'] text-[10px] font-black tracking-[2px] ${textColor}`}>INVITE PLAYERS</span>
            <button onClick={() => setShowInviteCard(false)} className="text-[10px] uppercase font-bold text-red-500 hover:text-red-400 bg-transparent border-none cursor-pointer">
              Close
            </button>
          </div>
          <input
            type="text"
            placeholder="Search friends..."
            value={inviteSearchQuery}
            onChange={(e) => setInviteSearchQuery(e.target.value)}
            className={`w-full ${isDark ? "bg-[#121620] text-[#cbd4cc]" : "bg-white text-[#0b0c0b]"} border ${borderFilter} px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#e53e3e] mb-3`}
          />
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredFriends.map((friend) => (
              <div key={friend.id} className={`flex items-center justify-between py-2 border-b ${borderColor} last:border-0`}>
                <div className="flex items-center gap-2">
                  <div className={`h-6 w-6 border flex items-center justify-center text-[8px] font-bold ${isDark ? "border-[#ffffff]/15 text-[#cbd4cc]/60" : "border-[#0b0c0b]/20 text-[#0b0c0b]/50"}`}>
                    {friend.initial}
                  </div>
                  <span className={`text-xs font-bold ${textColor}`}>{friend.name}</span>
                </div>
                <button
                  onClick={() => handleInvitePlayer(friend.id, friend.name)}
                  className={`text-[9px] font-black uppercase tracking-[1px] px-2.5 py-1 transition-all ${
                    invitedPlayerIds.includes(friend.id)
                      ? "bg-gray-600/40 text-gray-400 cursor-default"
                      : "bg-[#e53e3e] hover:bg-[#e53e3e]/90 text-black"
                  }`}
                >
                  {invitedPlayerIds.includes(friend.id) ? "Invited" : "Invite"}
                </button>
              </div>
            ))}
            {filteredFriends.length === 0 && (
              <p className={`text-center text-[10px] ${textMuted} py-4 font-['Share_Tech_Mono']`}>// no friends found</p>
            )}
          </div>
          <span className="absolute top-0 left-0 h-2.5 w-2.5 border-l border-t border-[#e53e3e]/40" />
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 border-r border-b border-[#e53e3e]/40" />
        </div>
      )}

      {/* ── In lobby room ── */}
      {isInLobbyRoom ? (
        <div className="flex-1 flex flex-col justify-between h-full animate-fade-in p-2">
          {/* Lobby header */}
          <div className={`flex justify-between items-center border-b ${borderColor} pb-4 mb-4`}>
            <div>
              <p className="font-['Orbitron'] text-xs font-black uppercase tracking-[6px] text-[#e53e3e]">CUSTOM LOBBY</p>
              <div className="flex items-center gap-3 mt-1">
                <h2 className={`text-2xl font-black uppercase tracking-tight ${textColor} font-['Orbitron']`}>
                  Room // {lobbyGame}
                </h2>
                <span className="text-xs font-mono font-bold bg-[#e53e3e]/15 text-[#e53e3e] px-3 py-1 border border-[#e53e3e]/30 uppercase">
                  Code: {lobbyCode}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCopyInviteLink} className="bg-[#e53e3e] hover:bg-[#e53e3e]/90 text-black px-5 py-2 text-xs font-black uppercase tracking-[1.5px] transition-all">
                Copy Invite Link
              </button>
              <button onClick={() => setShowInviteCard(!showInviteCard)} className="bg-transparent hover:bg-[#e53e3e]/15 text-[#e53e3e] border border-[#e53e3e]/40 px-5 py-2 text-xs font-black uppercase tracking-[1.5px] transition-all">
                + Invite Players
              </button>
              <button onClick={handleLeaveLobby} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 px-5 py-2 text-xs font-black uppercase tracking-[1.5px] transition-all">
                Leave Room
              </button>
            </div>
          </div>

          {/* Roster + chat grid */}
          <div className="flex-1 grid md:grid-cols-5 gap-8 min-h-0 mb-4">
            {/* Roster */}
            <div className="md:col-span-2 flex flex-col gap-4">
              <h3 className={`font-['Orbitron'] text-xs font-black uppercase tracking-[2px] ${textColor} mb-1`}>
                Lobby Roster ({lobbyMembers.length}/{lobbyMaxSize})
              </h3>
              <div className="space-y-4">
                {lobbyMembers.map((member, index) => {
                  const memberName = typeof member === "string" ? member : member.name;
                  const isSelf = memberName === "You" || memberName === user?.username;
                  const rank = typeof member === "string"
                    ? (isSelf ? (gameRanks[lobbyGame] ?? "Unranked") : "Diamond III")
                    : member.rank;
                  const isHost = typeof member === "string" ? index === 0 : member.isHost;
                  return (
                    <div key={index} className={`relative border ${borderColor} ${isDark ? "bg-[#0d1016]/90" : "bg-[#ffffff]/90"} p-4 flex items-center justify-between backdrop-blur-sm`}>
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 border flex items-center justify-center text-xs font-black ${isDark ? "border-[#e53e3e]/25 text-[#e53e3e] bg-[#1b2230]" : "border-[#0b0c0b]/20 text-[#0b0c0b] bg-[#f0f0f0]"}`}>
                          {memberName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className={`text-xs font-black ${textColor}`}>{memberName}</p>
                            {isHost && (
                              <span className="text-[8px] font-black uppercase tracking-[1px] px-1.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                                Host
                              </span>
                            )}
                          </div>
                          <p className={`text-[9px] uppercase tracking-wider ${textMutedLight} font-mono mt-0.5`}>
                            Rank: {rank}
                          </p>
                        </div>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-[1px] px-2 py-0.5 bg-green-500/10 text-green-500 border border-green-500/20">
                        Ready
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chat panel */}
            <div className={`md:col-span-3 border ${borderColor} ${isDark ? "bg-[#0a0c10]/80" : "bg-[#ffffff]/80"} flex flex-col overflow-hidden backdrop-blur-md`}>
              <div className={`px-5 py-3.5 border-b ${borderColor} ${isDark ? "bg-[#ffffff]/3" : "bg-[#0b0c0b]/3"}`}>
                <h3 className={`font-['Orbitron'] text-xs font-black ${textColor}`}>Lobby Dialogue</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-0">
                {lobbyMessages.map((msg, idx) => {
                  const isSystem = msg.sender === "System";
                  const isSelf   = msg.sender === "You";
                  if (isSystem) {
                    return (
                      <div key={idx} className="text-center py-1">
                        <span className="px-3 py-1 bg-[#e53e3e]/10 border border-[#e53e3e]/20 text-[9px] font-bold font-mono text-[#e53e3e] uppercase tracking-[1px]">
                          {msg.text}
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div key={idx} className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}>
                      <span className={`text-[8.5px] ${textMutedLight} mb-0.5 px-1 font-bold`}>{isSelf ? "You" : msg.sender}</span>
                      <div className={`px-3 py-1.5 max-w-sm text-xs ${
                        isSelf ? "bg-[#e53e3e] text-black" : (isDark ? "bg-[#121620] text-[#cbd4cc] border border-[#ffffff]/10" : "bg-white text-[#0b0c0b] border border-[#0b0c0b]/10")
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              </div>
              <form onSubmit={handleSendLobbyChat} className={`p-3 border-t ${borderColor} ${isDark ? "bg-[#ffffff]/5" : "bg-[#0b0c0b]/5"} flex gap-2`}>
                <input
                  type="text"
                  value={lobbyChatInput}
                  onChange={(e) => setLobbyChatInput(e.target.value)}
                  placeholder="Communicate with team lobby..."
                  className={`flex-1 ${isDark ? "bg-[#121620] text-[#e6e8eb]" : "bg-white text-[#0b0c0b]"} placeholder:text-[#cbd4cc]/30 border ${borderFilter} px-3 py-2 text-xs focus:outline-none focus:border-[#e53e3e]`}
                />
                <button type="submit" className="bg-[#e53e3e] text-black hover:bg-[#e53e3e]/90 px-4 py-2 text-xs font-black uppercase tracking-[1px] transition-all">
                  Send
                </button>
              </form>
            </div>
          </div>

          {/* Launch button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleStartGameMatch}
              className="bg-[#e53e3e] text-black hover:bg-[#e53e3e]/90 px-10 py-3.5 text-xs font-black uppercase tracking-[2px] transition-all hover:scale-105"
            >
              START GAME MATCH
            </button>
          </div>
        </div>

      ) : (
        /* ── Matchmaker setup ── */
        <div className="flex-1 grid md:grid-cols-3 gap-8 items-stretch h-full py-4 min-h-0 px-2">

          {/* Card 1: Random Match */}
          <div className={`border ${borderColor} ${isDark ? "bg-[#0d1016]/75" : "bg-[#ffffff]/75"} p-6 backdrop-blur-sm flex flex-col justify-between h-full relative`}>
            {!showPlayConfig && !isMatching ? (
              <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
                <div className="space-y-4">
                  <h3 className={`font-['Orbitron'] text-base font-black ${textColor} uppercase tracking-[2px]`}>Random Match</h3>
                  <p className={`text-xs ${textMuted} leading-relaxed`}>
                    Join the queue to find teammates matching your game choice.
                  </p>
                </div>
                <button
                  onClick={() => setShowPlayConfig(true)}
                  className="w-full bg-[#e53e3e] text-black hover:bg-[#e53e3e]/90 py-4 text-xs font-black uppercase tracking-[2px] transition-all active:scale-95"
                >
                  RANDOM MATCH
                </button>
              </div>
            ) : showPlayConfig && !isMatching ? (
              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-5 text-left">
                  <div>
                    <h3 className={`font-['Orbitron'] text-sm font-black ${textColor} uppercase tracking-[2px]`}>
                      Random Match Setup
                    </h3>
                    <p className={`text-[10px] ${textMuted} mt-1`}>Select your game to search for active players.</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className={`text-[9px] uppercase tracking-widest ${textMutedLight} block mb-1.5 font-bold`}>
                        Select Game Title
                      </label>
                      <select
                        value={selectedGame}
                        onChange={(e) => setSelectedGame(e.target.value)}
                        className={`w-full ${bgSelect} border ${borderFilter} px-3 py-2 text-xs focus:outline-none focus:border-[#e53e3e] font-mono`}
                      >
                        <option value="VALORANT">VALORANT</option>
                        <option value="CS2">CS2</option>
                        <option value="LOL">LEAGUE OF LEGENDS</option>
                        <option value="APEX">APEX LEGENDS</option>
                        <option value="DOTA2">DOTA 2</option>
                        <option value="R6SIEGE">R6 SIEGE</option>
                        <option value="OVERWATCH2">OVERWATCH 2</option>
                        <option value="ROCKETLG">ROCKET LEAGUE</option>
                      </select>
                    </div>
                    <div className={`flex items-center justify-between border-t border-b ${borderColor} py-3.5 text-xs`}>
                      <span className={textMuted}>Selected:</span>
                      <span className="font-bold font-mono text-[#e53e3e] uppercase tracking-wider">{selectedGame}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={handleStartMatchmaking} className="flex-1 bg-[#e53e3e] text-black hover:bg-[#e53e3e]/90 py-3 text-xs font-black uppercase tracking-[2px] transition-all">
                    START MATCH
                  </button>
                  <button onClick={() => setShowPlayConfig(false)} className={`px-4 bg-transparent border ${borderColor} ${textColor} text-xs font-black uppercase tracking-[1px] hover:bg-[#e53e3e]/5 transition-all`}>
                    Back
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-between items-center text-center py-4">
                <div className="relative h-16 w-16 flex items-center justify-center mt-6">
                  <div className="absolute inset-0 rounded-full border-4 border-[#e53e3e]/20 animate-ping" />
                  <div className="h-10 w-10 rounded-full border-4 border-[#e53e3e] animate-spin border-t-transparent" />
                </div>
                <div>
                  <p className={`font-['Orbitron'] text-xs font-black ${textColor} uppercase tracking-[2px]`}>
                    SEARCHING MATCH
                  </p>
                  <p className={`text-[10px] ${textMutedLight} mt-1`}>
                    Queue: <span className="font-bold text-[#e53e3e]">{selectedGame}</span>
                  </p>
                  <p className="text-xl font-mono font-bold text-[#e53e3e] mt-4">{matchTimer}s</p>
                </div>
                <button onClick={handleCancelMatchmaking} className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 py-3 text-xs font-black uppercase tracking-[2px] transition-all mt-4">
                  CANCEL
                </button>
              </div>
            )}
            <span className="absolute top-0 left-0 h-2 w-2 border-l border-t border-[#e53e3e]/20" />
            <span className="absolute bottom-0 right-0 h-2 w-2 border-r border-b border-[#e53e3e]/20" />
          </div>

          {/* Card 2: Create Custom Lobby */}
          <div className={`border ${borderColor} ${isDark ? "bg-[#0d1016]/75" : "bg-[#ffffff]/75"} p-6 backdrop-blur-sm flex flex-col justify-between h-full relative`}>
            <div className="space-y-5">
              <div>
                <h3 className={`font-['Orbitron'] text-base font-black ${textColor} uppercase tracking-[2px]`}>Create Lobby</h3>
                <p className={`text-xs ${textMuted} mt-2 leading-relaxed`}>
                  Start a custom room. Share the code with friends to fill up.
                </p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className={`text-[9px] uppercase tracking-widest ${textMutedLight} block mb-1.5 font-bold`}>Game</label>
                  <select
                    value={customLobbyGame}
                    onChange={(e) => setCustomLobbyGame(e.target.value)}
                    className={`w-full ${bgSelect} border ${borderFilter} px-3 py-2 text-xs focus:outline-none focus:border-[#e53e3e] font-mono`}
                  >
                    <option value="VALORANT">VALORANT</option>
                    <option value="CS2">CS2</option>
                    <option value="LOL">LEAGUE OF LEGENDS</option>
                    <option value="APEX">APEX LEGENDS</option>
                    <option value="DOTA2">DOTA 2</option>
                    <option value="R6SIEGE">R6 SIEGE</option>
                    <option value="OVERWATCH2">OVERWATCH 2</option>
                    <option value="ROCKETLG">ROCKET LEAGUE</option>
                  </select>
                </div>
                <div>
                  <label className={`text-[9px] uppercase tracking-widest ${textMutedLight} block mb-1.5 font-bold`}>
                    Max Players
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={10}
                    value={customLobbySize}
                    onChange={(e) => setCustomLobbySize(Number(e.target.value))}
                    className={`w-full ${bgSelect} border ${borderFilter} px-3 py-2 text-xs focus:outline-none focus:border-[#e53e3e] font-mono`}
                  />
                </div>
              </div>
            </div>
            <button
              onClick={handleCreateCustomLobby}
              className="w-full mt-4 bg-[#e53e3e] text-black hover:bg-[#e53e3e]/90 py-3.5 text-xs font-black uppercase tracking-[2px] transition-all"
            >
              CREATE LOBBY
            </button>
            <span className="absolute top-0 left-0 h-2 w-2 border-l border-t border-[#e53e3e]/20" />
            <span className="absolute bottom-0 right-0 h-2 w-2 border-r border-b border-[#e53e3e]/20" />
          </div>

          {/* Card 3: Join by Code */}
          <div className={`border ${borderColor} ${isDark ? "bg-[#0d1016]/75" : "bg-[#ffffff]/75"} p-6 backdrop-blur-sm flex flex-col justify-between h-full relative`}>
            <div className="space-y-5">
              <div>
                <h3 className={`font-['Orbitron'] text-base font-black ${textColor} uppercase tracking-[2px]`}>Join Lobby</h3>
                <p className={`text-xs ${textMuted} mt-2 leading-relaxed`}>
                  Have a code? Enter it below to jump into a friend's room.
                </p>
              </div>
              <form onSubmit={handleJoinCustomLobby} className="space-y-3">
                <div>
                  <label className={`text-[9px] uppercase tracking-widest ${textMutedLight} block mb-1.5 font-bold`}>
                    Lobby Code
                  </label>
                  <input
                    type="text"
                    value={lobbyCode}
                    onChange={(e) => setLobbyCode(e.target.value)}
                    placeholder="LBY-XXXX"
                    className={`w-full ${bgSelect} border ${borderFilter} px-3 py-2 text-xs focus:outline-none focus:border-[#e53e3e] font-mono uppercase`}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#e53e3e] text-black hover:bg-[#e53e3e]/90 py-3.5 text-xs font-black uppercase tracking-[2px] transition-all"
                >
                  JOIN LOBBY
                </button>
              </form>
            </div>
            <span className="absolute top-0 left-0 h-2 w-2 border-l border-t border-[#e53e3e]/20" />
            <span className="absolute bottom-0 right-0 h-2 w-2 border-r border-b border-[#e53e3e]/20" />
          </div>

        </div>
      )}
    </div>
  );
}
