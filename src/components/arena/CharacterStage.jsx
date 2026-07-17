import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { io } from "socket.io-client";

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
  const socketRef = useRef(null);
  const [selectedGame, setSelectedGame] = useState("VALORANT");
  const [timeFilter, setTimeFilter] = useState("overall");
  const [showInviteCard, setShowInviteCard] = useState(false);
  const [inviteSearchQuery, setInviteSearchQuery] = useState("");
  const [addFriendQuery, setAddFriendQuery] = useState("");
  const [sentRequests, setSentRequests] = useState([]);

  // Play Game & Matchmaking States
  const [showPlayConfig, setShowPlayConfig] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [matchTimer, setMatchTimer] = useState(0);
  
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
  const [friendsList, setFriendsList] = useState([
    { id: 1, name: "S1mple", status: "Online", initial: "S1", messages: [
      { sender: "S1mple", text: "Ready to queue for CS2?", time: "10:32 AM" },
      { sender: "You", text: "Yeah, let me finish warm up.", time: "10:33 AM" },
      { sender: "S1mple", text: "Cool, invite me when ready.", time: "10:35 AM" }
    ]},
    { id: 2, name: "TenZ", status: "In-Game", initial: "TZ", messages: [
      { sender: "TenZ", text: "Check out this crazy Ascent lineup!", time: "Yesterday" },
      { sender: "You", text: "Nice, we should try it in ranked.", time: "Yesterday" }
    ]},
    { id: 3, name: "Shroud", status: "Away", initial: "SD", messages: [
      { sender: "Shroud", text: "R6 Siege tonight?", time: "2 days ago" }
    ]},
    { id: 4, name: "Faker", status: "Offline", initial: "FK", messages: [
      { sender: "Faker", text: "GG WP! Let's play next time.", time: "3 days ago" }
    ]},
    { id: 5, name: "Ninja", status: "Offline", initial: "NJ", messages: [
      { sender: "Ninja", text: "Hey! Collab on some Apex Legends matches?", time: "4 days ago" }
    ]}
  ]);

  const [activeFriendId, setActiveFriendId] = useState(1);
  const activeFriend = friendsList.find(f => f.id === activeFriendId);

  const [invitedPlayerIds, setInvitedPlayerIds] = useState([]);
  const [registeredTournaments, setRegisteredTournaments] = useState([]);

  // Notifications List State
  const [notifications, setNotifications] = useState([
    { id: 1, type: "lobby", title: "Game Invitation", message: "S1mple invited you to join their CS2 lobby.", time: "2 mins ago", sender: "S1mple", game: "CS2", resolved: false },
    { id: 2, type: "friend_request", title: "Friend Request", message: "Shroud sent you a friend request.", time: "15 mins ago", sender: "Shroud", resolved: false },
    { id: 3, type: "tournament", title: "Tournament Closing", message: "Valorant Ascension tournament registration is closing in 1 hour!", time: "1 hour ago", resolved: false, tourneyId: 1 }
  ]);

  // Tournaments Demo List
  const tournamentsList = [
    { id: 1, name: "VALORANT ASCENSION", game: "VALORANT", prize: "$5,000", spots: "14/16 Teams", time: "Starts in 2h", status: "Registering" },
    { id: 2, name: "CS2 SHOWDOWN", game: "CS2", prize: "$10,000", spots: "8/8 Teams", time: "Live Now", status: "Live" },
    { id: 3, name: "LOL CHAMPIONS TROPHY", game: "LOL", prize: "$7,500", spots: "28/32 Teams", time: "Starts tomorrow, 6:00 PM", status: "Registering" },
    { id: 4, name: "APEX COMBAT MASTER", game: "APEX", prize: "$3,000", spots: "20/20 Squads", time: "Completed", status: "Completed" },
    { id: 5, name: "R6 SIEGE SHIELD CUP", game: "R6 SIEGE", prize: "$4,000", spots: "12/16 Teams", time: "July 18, 5:00 PM", status: "Registering" },
    { id: 6, name: "ROCKET LG DUAL CUP", game: "ROCKET LG", prize: "$2,500", spots: "8/8 Teams", time: "Live Now", status: "Live" }
  ];

  // Ranks Mapping for Matchmaking
  const gameRanks = {
    VALORANT: "Platinum IV",
    CS2: "Gold Nova II",
    LOL: "Diamond II",
    APEX: "Diamond III",
    DOTA2: "Archon V",
    R6SIEGE: "Gold I",
    OVERWATCH2: "Master V",
    ROCKETLG: "Champion II"
  };

  const activeRank = gameRanks[selectedGame] || "Unranked";

  // Matchmaking Timer Loop
  useEffect(() => {
    let interval;
    if (isMatching) {
      interval = setInterval(() => {
        setMatchTimer(prev => {
          if (prev >= 4) {
            clearInterval(interval);
            setIsMatching(false);
            
            // Match found: select a random player from friends list to join lobby
            const randomFriend = friendsList[Math.floor(Math.random() * friendsList.length)];
            setLobbyGame(selectedGame);
            setLobbyMembers(["You", randomFriend.name]);
            setLobbyMessages([
              { sender: "System", text: `Match Found! ${randomFriend.name} has joined your lobby.`, time: "Just now" },
              { sender: randomFriend.name, text: `Hey! Ready to play some ${selectedGame}?`, time: "Just now" }
            ]);
            setIsInLobbyRoom(true);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMatching, friendsList, selectedGame]);

  const handleStartMatchmaking = () => {
    setMatchTimer(0);
    setIsMatching(true);
  };

  const handleCancelMatchmaking = () => {
    setIsMatching(false);
    setMatchTimer(0);
  };

  // Cleanup socket on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const setupSocketListeners = (socket) => {
    socket.on("lobby-update", (lobby) => {
      setLobbyGame(lobby.game);
      setLobbyMembers(lobby.members);
      setLobbyMessages(lobby.messages);
      setLobbyMaxSize(lobby.maxSize || 5);
    });
    
    socket.on("chat-message", (msg) => {
      setLobbyMessages(prev => [...prev, msg]);
    });
    
    socket.on("lobby-error", (err) => {
      alert(err.message);
      handleLeaveLobby();
    });
    
    socket.on("match-started", ({ serverLink, message }) => {
      alert(message);
      window.open(serverLink, "_blank");
    });
  };

  const handleCreateCustomLobby = () => {
    const code = `LBY-${Math.floor(1000 + Math.random() * 9000)}`;
    setLobbyCode(code);
    
    const socketUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace("/api", "") 
      : "http://localhost:5001";
      
    const socket = io(socketUrl, { transports: ["websocket"] });
    socketRef.current = socket;
    
    socket.emit("join-lobby", {
      lobbyCode: code,
      username: user?.username || "prachix",
      rank: gameRanks[customLobbyGame] || "Platinum IV",
      game: customLobbyGame,
      maxSize: customLobbySize
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
      
    const socket = io(socketUrl, { transports: ["websocket"] });
    socketRef.current = socket;
    
    socket.emit("join-lobby", {
      lobbyCode: code,
      username: user?.username || "prachix",
      rank: gameRanks["VALORANT"] || "Platinum IV",
      game: "VALORANT"
    });
    
    setupSocketListeners(socket);
    setLobbyGame("VALORANT");
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
      setLobbyMessages(prev => [
        ...prev,
        { sender: "You", text: lobbyChatInput, time: "Just now" }
      ]);
    }
    setLobbyChatInput("");
  };

  const handleStartGameMatch = () => {
    if (socketRef.current) {
      socketRef.current.emit("start-match");
    } else {
      alert("Launching matchmaking game server! Good luck!");
    }
  };

  const nonFriendsDatabase = [
    { id: 101, name: "kennyS", rank: "Global Elite", initial: "KS" },
    { id: 102, name: "ZywOo", rank: "Gold Nova III", initial: "ZW" },
    { id: 103, name: "dev1ce", rank: "Silver IV", initial: "DV" },
    { id: 104, name: "Wardell", rank: "Immortal", initial: "WD" },
    { id: 105, name: "Subroza", rank: "Diamond I", initial: "SR" }
  ];

  const handleSendFriendRequest = (id, name) => {
    setSentRequests(prev => [...prev, id]);
    alert(`Friend request sent to ${name}!`);
  };

  const handleCopyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/join-lobby?code=${lobbyCode}`;
    navigator.clipboard.writeText(inviteUrl);
    alert("Invite link copied to clipboard!");
  };

  const handleBrowseOpenLobbies = () => {
    alert("Mock Open Lobbies:\n1. VALORANT - Code: LBY-4291 (4/5 players)\n2. CS2 - Code: LBY-8201 (2/5 players)\n3. APEX - Code: LBY-1033 (1/3 players)");
  };

  const handleSendFriendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeFriend) return;
    
    const msg = {
      sender: "You",
      text: newMessage,
      time: "Just now"
    };

    setFriendsList(prev => prev.map(friend => {
      if (friend.id === activeFriend.id) {
        return {
          ...friend,
          messages: [...(friend.messages || []), msg]
        };
      }
      return friend;
    }));

    setNewMessage("");
  };

  const handleInvitePlayer = (id, name) => {
    if (invitedPlayerIds.includes(id)) return;
    setInvitedPlayerIds(prev => [...prev, id]);
    
    // If inside a lobby room, automatically post a system dialogue line
    if (isInLobbyRoom) {
      setLobbyMessages(prev => [
        ...prev,
        { sender: "System", text: `Invitation sent to ${name}!`, time: "Just now" }
      ]);
    } else {
      alert(`Invitation sent to ${name}!`);
    }
  };

  const handleResolveNotification = (id, action, detail = "") => {
    setNotifications(prev => prev.map(notif => {
      if (notif.id === id) {
        return { ...notif, resolved: true, statusText: detail };
      }
      return notif;
    }));
    alert(detail);
  };

  // Helper theme classes
  const isDark = theme === "dark";
  const textColor = isDark ? "text-white" : "text-[#0b0c0b]";
  const textPrimary = isDark ? "text-[#e6e8eb]" : "text-[#0b0c0b]";
  const textMuted = isDark ? "text-[#cbd4cc]/60" : "text-[#0b0c0b]/60";
  const textMutedLight = isDark ? "text-[#cbd4cc]/45" : "text-[#0b0c0b]/40";
  const borderColor = isDark ? "border-[#ffffff]/10" : "border-[#0b0c0b]/15";
  const bgOverlay = isDark ? "bg-[#0a0c10]/40" : "bg-[#ffffff]/50";
  const bgSelect = isDark ? "bg-[#121620] text-[#cbd4cc]" : "bg-[#ffffff] text-[#0b0c0b]";
  const borderFilter = isDark ? "border-[#ffffff]/15" : "border-[#0b0c0b]/20";

  const statsDataByFilter = {
    overall: [
      { name: "VALORANT", rank: "Platinum IV", winRate: "58.3%", kda: "2.7", history: ["W", "W", "L", "W", "W"], mmr: "2,450 MMR" },
      { name: "CS2", rank: "Gold Nova II", winRate: "54.2%", kda: "2.4", history: ["W", "L", "W", "L", "W"], mmr: "1,820 MMR" },
      { name: "LOL", rank: "Diamond II", winRate: "56.8%", kda: "3.2", history: ["W", "W", "W", "L", "W"], mmr: "3,120 MMR" },
      { name: "APEX", rank: "Diamond III", winRate: "12.5%", kda: "3.1", history: ["L", "W", "L", "W", "L"], mmr: "4,100 MMR" },
      { name: "DOTA 2", rank: "Archon V", winRate: "50.0%", kda: "2.1", history: ["L", "L", "W", "L", "W"], mmr: "2,980 MMR" },
      { name: "R6 SIEGE", rank: "Gold I", winRate: "55.6%", kda: "2.8", history: ["W", "W", "L", "W", "L"], mmr: "2,150 MMR" },
      { name: "OVERWATCH 2", rank: "Master V", winRate: "59.2%", kda: "3.5", history: ["W", "L", "W", "W", "W"], mmr: "3,550 MMR" },
      { name: "ROCKET LG", rank: "Champion II", winRate: "51.4%", kda: "1.9", history: ["L", "W", "L", "W", "L"], mmr: "1,220 MMR" }
    ],
    last_match: [
      { name: "VALORANT", rank: "Platinum IV", winRate: "100%", kda: "4.5", history: ["W"], mmr: "2,450 MMR" },
      { name: "CS2", rank: "Gold Nova II", winRate: "0%", kda: "1.2", history: ["L"], mmr: "1,820 MMR" },
      { name: "LOL", rank: "Diamond II", winRate: "100%", kda: "5.5", history: ["W"], mmr: "3,120 MMR" },
      { name: "APEX", rank: "Diamond III", winRate: "100%", kda: "5.0", history: ["W"], mmr: "4,100 MMR" },
      { name: "DOTA 2", rank: "Archon V", winRate: "0%", kda: "0.8", history: ["L"], mmr: "2,980 MMR" },
      { name: "R6 SIEGE", rank: "Gold I", winRate: "100%", kda: "3.2", history: ["W"], mmr: "2,150 MMR" },
      { name: "OVERWATCH 2", rank: "Master V", winRate: "100%", kda: "4.8", history: ["W"], mmr: "3,550 MMR" },
      { name: "ROCKET LG", rank: "Champion II", winRate: "0%", kda: "1.0", history: ["L"], mmr: "1,220 MMR" }
    ],
    today: [
      { name: "VALORANT", rank: "Platinum IV", winRate: "75.0%", kda: "3.2", history: ["W", "W", "L", "W"], mmr: "2,475 MMR" },
      { name: "CS2", rank: "Gold Nova II", winRate: "50.0%", kda: "2.0", history: ["W", "L"], mmr: "1,820 MMR" },
      { name: "LOL", rank: "Diamond II", winRate: "66.7%", kda: "3.0", history: ["W", "W", "L"], mmr: "3,145 MMR" },
      { name: "APEX", rank: "Diamond III", winRate: "33.3%", kda: "2.5", history: ["L", "W", "L"], mmr: "4,080 MMR" },
      { name: "DOTA 2", rank: "Archon V", winRate: "100%", kda: "4.0", history: ["W", "W"], mmr: "3,010 MMR" },
      { name: "R6 SIEGE", rank: "Gold I", winRate: "66.7%", kda: "2.9", history: ["W", "W", "L"], mmr: "2,168 MMR" },
      { name: "OVERWATCH 2", rank: "Master V", winRate: "100%", kda: "4.5", history: ["W", "W"], mmr: "3,570 MMR" },
      { name: "ROCKET LG", rank: "Champion II", winRate: "50.0%", kda: "1.8", history: ["W", "L"], mmr: "1,220 MMR" }
    ],
    last_week: [
      { name: "VALORANT", rank: "Platinum IV", winRate: "59.1%", kda: "2.8", history: ["W", "W", "L", "W", "W"], mmr: "2,450 MMR" },
      { name: "CS2", rank: "Gold Nova II", winRate: "52.4%", kda: "2.3", history: ["W", "L", "W", "L", "W"], mmr: "1,820 MMR" },
      { name: "LOL", rank: "Diamond II", winRate: "57.1%", kda: "3.3", history: ["W", "L", "W", "W", "L"], mmr: "3,120 MMR" },
      { name: "APEX", rank: "Diamond III", winRate: "15.0%", kda: "3.0", history: ["W", "L", "L", "L", "W"], mmr: "4,100 MMR" },
      { name: "DOTA 2", rank: "Archon V", winRate: "48.2%", kda: "2.0", history: ["L", "L", "W", "L", "W"], mmr: "2,980 MMR" },
      { name: "R6 SIEGE", rank: "Gold I", winRate: "54.1%", kda: "2.6", history: ["W", "W", "L", "W", "L"], mmr: "2,150 MMR" },
      { name: "OVERWATCH 2", rank: "Master V", winRate: "58.8%", kda: "3.6", history: ["W", "L", "W", "L", "W"], mmr: "3,550 MMR" },
      { name: "ROCKET LG", rank: "Champion II", winRate: "52.2%", kda: "2.0", history: ["L", "W", "L", "W", "L"], mmr: "1,220 MMR" }
    ],
    last_month: [
      { name: "VALORANT", rank: "Platinum IV", winRate: "57.5%", kda: "2.7", history: ["W", "L", "W", "W", "L"], mmr: "2,450 MMR" },
      { name: "CS2", rank: "Gold Nova II", winRate: "53.2%", kda: "2.4", history: ["L", "W", "W", "L", "L"], mmr: "1,820 MMR" },
      { name: "LOL", rank: "Diamond II", winRate: "58.5%", kda: "3.1", history: ["W", "W", "L", "L", "W"], mmr: "3,120 MMR" },
      { name: "APEX", rank: "Diamond III", winRate: "11.8%", kda: "2.9", history: ["L", "W", "L", "W", "L"], mmr: "4,100 MMR" },
      { name: "DOTA 2", rank: "Archon V", winRate: "52.0%", kda: "2.2", history: ["W", "L", "W", "L", "W"], mmr: "2,980 MMR" },
      { name: "R6 SIEGE", rank: "Gold I", winRate: "56.3%", kda: "2.8", history: ["W", "W", "W", "L", "W"], mmr: "2,150 MMR" },
      { name: "OVERWATCH 2", rank: "Master V", winRate: "60.4%", kda: "3.7", history: ["W", "W", "L", "W", "W"], mmr: "3,550 MMR" },
      { name: "ROCKET LG", rank: "Champion II", winRate: "51.1%", kda: "1.9", history: ["W", "L", "L", "W", "L"], mmr: "1,220 MMR" }
    ],
    last_year: [
      { name: "VALORANT", rank: "Platinum IV", winRate: "55.0%", kda: "2.6", history: ["W", "W", "L", "W", "L"], mmr: "2,450 MMR" },
      { name: "CS2", rank: "Gold Nova II", y1: 22, y2: 22, winRate: "51.8%", kda: "2.2", history: ["W", "L", "W", "W", "L"], mmr: "1,820 MMR" },
      { name: "LOL", rank: "Diamond II", winRate: "55.4%", kda: "3.0", history: ["L", "W", "L", "W", "L"], mmr: "3,120 MMR" },
      { name: "APEX", rank: "Diamond III", winRate: "10.5%", kda: "2.8", history: ["W", "L", "L", "W", "W"], mmr: "4,100 MMR" },
      { name: "DOTA 2", rank: "Archon V", winRate: "50.5%", kda: "2.0", history: ["L", "W", "L", "W", "L"], mmr: "2,980 MMR" },
      { name: "R6 SIEGE", rank: "Gold I", winRate: "53.2%", kda: "2.5", history: ["W", "W", "W", "L", "W"], mmr: "2,150 MMR" },
      { name: "OVERWATCH 2", rank: "Master V", winRate: "57.8%", kda: "3.4", history: ["W", "L", "W", "L", "W"], mmr: "3,550 MMR" },
      { name: "ROCKET LG", rank: "Champion II", winRate: "50.6%", kda: "1.8", history: ["L", "W", "L", "W", "L"], mmr: "1,220 MMR" }
    ]
  };

  const gamesStats = statsDataByFilter[timeFilter];

  if (activeView === "stats") {
    return (
      <div className={`absolute inset-0 flex flex-col justify-between p-2 sm:p-4 animate-fade-in ${textPrimary} z-[5]`}>
        {/* Header */}
        <div className={`flex items-center justify-between border-b ${borderColor} pb-4 mb-4 px-2`}>
          <div className="flex items-end gap-6">
            <div>
              <p className="font-['Orbitron'] text-xs font-black uppercase tracking-[6px] text-[#e53e3e]">
                PLAYER STATS OVERVIEW
              </p>
              <h2 className={`mt-1 text-2xl font-black uppercase tracking-tight ${textColor} font-['Orbitron']`}>
                {user?.username ?? "Agent"} Game Performance
              </h2>
            </div>
            
            {/* Time Filter Dropdown */}
            <div className="pb-1">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className={`${bgSelect} border ${borderFilter} px-3 py-1.5 text-xs focus:outline-none focus:border-[#e53e3e]  font-bold uppercase tracking-wider`}
              >
                <option value="overall">Overall</option>
                <option value="last_match">Last Match</option>
                <option value="today">Today</option>
                <option value="last_week">Last Week</option>
                <option value="last_month">Last Month</option>
                <option value="last_year">Last Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Table / List */}
        <div className="flex-1 overflow-y-auto min-h-0 pb-6 w-full">
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
                  
                  {/* Game Title */}
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-[#e53e3e]" />
                    <span className={`font-['Orbitron'] text-xs font-bold uppercase tracking-wider ${textColor}`}>
                      {game.name}
                    </span>
                  </div>

                  {/* Win Rate */}
                  <div className={`text-center font-mono text-xs font-semibold ${textColor}`}>
                    {game.winRate}
                  </div>

                  {/* KDA */}
                  <div className={`text-center font-mono text-xs font-semibold ${textColor}`}>
                    {game.kda}
                  </div>

                  {/* Match History */}
                  <div className="flex items-center justify-center gap-1.5">
                    {game.history.map((res, i) => (
                      <span
                        key={i}
                        className={`flex h-5 w-5 items-center justify-center rounded text-[9px] font-black font-mono border ${
                          res === "W"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}
                      >
                        {res}
                      </span>
                    ))}
                  </div>

                  {/* MMR / Rank */}
                  <div className="text-right space-y-1 pr-6">
                    <div className={`font-mono text-xs ${textColor} font-bold`}>{game.mmr}</div>
                    <div className={`text-[9px] uppercase tracking-wider ${textMuted} font-bold`}>{game.rank}</div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    );
  }

  if (activeView === "friends") {
    return (
      <div className={`absolute inset-0 flex animate-fade-in ${textPrimary} z-[5] pb-0`}>
        {/* Unified Outer Container Box */}
        <div className={`w-full h-full border border-x-0 border-b-0 ${borderColor} bg-transparent overflow-hidden flex`}>
          
          {/* Left Side: Narrow Vertical Friends List */}
          <div className={`w-[220px] flex flex-col border-r ${borderColor} h-full ${isDark ? "bg-[#0a0c10]/80" : "bg-[#ffffff]/80"} backdrop-blur-md`}>
            <div className={`px-5 py-4 border-b ${borderColor} ${isDark ? "bg-[#ffffff]/5" : "bg-[#0b0c0b]/5"}`}>
              <h3 className={`font-['Orbitron'] text-xs font-black uppercase tracking-[2px] ${textColor}`}>Friends</h3>
            </div>
            
            <div className={`flex-1 overflow-y-auto divide-y ${isDark ? "divide-[#ffffff]/5" : "divide-[#0b0c0b]/10"}`}>
              {friendsList.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => setActiveFriendId(friend.id)}
                  className={`w-full text-left px-5 py-3.5 flex items-center justify-between transition-colors ${
                    isDark ? "hover:bg-[#ffffff]/5" : "hover:bg-[#0b0c0b]/5"
                  } ${
                    activeFriendId === friend.id ? (isDark ? "bg-[#ffffff]/5 border-l-2 border-[#e53e3e]" : "bg-[#0b0c0b]/5 border-l-2 border-[#e53e3e]") : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`relative flex h-7 w-7 items-center justify-center border text-[9px] font-black ${
                      isDark ? "border-[#ffffff]/15 text-[#cbd4cc]/70" : "border-[#0b0c0b]/25 text-[#0b0c0b]/70"
                    }`}>
                      {friend.initial}
                      <span className={`absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full ${
                        friend.status === "Online" ? "bg-[#22c55e]" :
                        friend.status === "In-Game" ? "bg-[#a370f7]" :
                        friend.status === "Away" ? "bg-[#f0b232]" : "bg-[#80848e]"
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
          </div>

          {/* Right Side: Chat View Area */}
          <div className={`flex-1 flex flex-col h-full ${isDark ? "bg-[#0a0c10]/80" : "bg-[#ffffff]/80"} backdrop-blur-md`}>
            
            {/* Top Row: Online strip */}
            <div className={`px-6 py-3 border-b ${borderColor} ${isDark ? "bg-[#ffffff]/5" : "bg-[#0b0c0b]/5"} flex items-center gap-4`}>
              <span className="font-['Orbitron'] text-[9px] font-black tracking-[2px] text-[#0b0c0b]/35 uppercase shrink-0">Online</span>
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
                    <span className={`absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full border border-[${isDark ? "#0a0c10" : "#cbd4cc"}] ${
                      friend.status === "Online" ? "bg-[#22c55e]" :
                      friend.status === "In-Game" ? "bg-[#a370f7]" : "bg-[#f0b232]"
                    }`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Conversation Pane */}
            {activeFriend ? (
              <div className="flex-1 flex flex-col h-full min-h-0">
                {/* Header */}
                <div className={`px-6 py-3 border-b ${borderColor} ${isDark ? "bg-[#ffffff]/3" : "bg-[#0b0c0b]/3"} flex justify-between items-center`}>
                  <div>
                    <h3 className={`font-['Orbitron'] text-xs font-black ${textColor}`}>Chat with {activeFriend.name}</h3>
                    <span className={`text-[9px] uppercase tracking-wider ${textMuted}`}>{activeFriend.status}</span>
                  </div>
                  
                  {activeFriend.status !== "Offline" && (
                    <button
                      onClick={() => alert(`Lobby invitation sent to ${activeFriend.name}!`)}
                      className={`font-['Rajdhani'] text-[11px] font-bold tracking-[2px] uppercase border-b border-[#e53e3e]/50 text-[#e53e3e] hover:border-[#e53e3e] transition-colors bg-transparent border-l-0 border-r-0 border-t-0 cursor-pointer pb-px`}
                    >
                      INVITE TO LOBBY <span className="text-[10px]">→</span>
                    </button>
                  )}
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
                  {activeFriend.messages?.map((msg, i) => {
                    const isSelf = msg.sender === "You";
                    return (
                      <div key={i} className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}>
                        <div className={`px-4 py-2  max-w-md text-xs ${
                          isSelf ? "bg-[#e53e3e] text-black" : (isDark ? "bg-[#121620] text-[#cbd4cc] border border-[#ffffff]/10" : "bg-white text-[#0b0c0b] border border-[#0b0c0b]/10")
                        }`}>
                          {msg.text}
                        </div>
                        <span className={`text-[9px] ${textMutedLight} mt-1`}>{msg.time}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Chat Input Footer */}
                <form onSubmit={handleSendFriendMessage} className={`p-4 border-t ${borderColor} ${isDark ? "bg-[#ffffff]/5" : "bg-[#0b0c0b]/5"} flex gap-3`}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Send message to ${activeFriend.name}...`}
                    className={`flex-1 ${isDark ? "bg-[#121620] text-[#e6e8eb]" : "bg-white text-[#0b0c0b]"} placeholder:text-[#cbd4cc]/30 border ${borderFilter}  px-4 py-2.5 text-xs focus:outline-none focus:border-[#e53e3e]`}
                  />
                  <button
                    type="submit"
                    className="bg-[#e53e3e] text-[#0d1016] hover:bg-[#e53e3e]/90 px-5 py-2.5  text-xs font-black uppercase tracking-[2px] transition-all"
                  >
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

  if (activeView === "tournaments") {
    return (
      <div className={`absolute inset-0 flex flex-col animate-fade-in ${textPrimary} z-[5] p-2 sm:p-4 pb-0 sm:pb-0`}>
        {/* Header */}
        <div className={`flex items-center justify-between border-b ${borderColor} pb-4 mb-4 px-2`}>
          <div>
            <p className="font-['Orbitron'] text-xs font-black uppercase tracking-[6px] text-[#e53e3e]">
              TOURNAMENTS ARENA
            </p>
            <h2 className={`mt-1 text-2xl font-black uppercase tracking-tight ${textColor} font-['Orbitron']`}>
              Open Tournaments & Championships
            </h2>
          </div>
        </div>

        {/* Tournaments Grid covering whole screen vertically */}
        <div className="flex-1 overflow-y-auto min-h-0 pb-2 pr-1 w-full">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6 px-2">
            {tournamentsList.map((tourney) => {
              const isRegistered = registeredTournaments.includes(tourney.id);
              const isLive = tourney.status === "Live";
              const isCompleted = tourney.status === "Completed";
              
              return (
                <div key={tourney.id} className={`relative border ${borderColor} ${isDark ? "bg-[#0d1016]/90" : "bg-[#ffffff]/90"} p-5  flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-sm`}>
                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-center mb-3">
                      <span className={`text-[10px] font-black font-mono tracking-widest ${isLive ? "text-red-500" : isCompleted ? "text-gray-400" : "text-[#e53e3e]"}`}>
                        // {tourney.game}
                      </span>
                      <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${
                        isLive 
                          ? "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse" 
                          : isCompleted 
                            ? "bg-gray-500/10 text-gray-500 border-gray-500/20" 
                            : "bg-[#e53e3e]/10 text-[#e53e3e] border-[#e53e3e]/20"
                      }`}>
                        {tourney.status}
                      </span>
                    </div>

                    <h3 className={`font-['Orbitron'] text-sm font-black tracking-wide ${textColor} mb-1`}>
                      {tourney.name}
                    </h3>
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

                  {/* Actions */}
                  {isCompleted ? (
                    <button disabled className="w-full bg-gray-500/10 text-gray-400/60 py-2.5  text-xs font-black uppercase tracking-[1.5px] cursor-not-allowed border border-gray-500/10">
                      Ended
                    </button>
                  ) : isLive ? (
                    <button onClick={() => alert("Launching Stream overlay...")} className="w-full bg-[#e53e3e] hover:bg-[#c53030] text-white py-2.5  text-xs font-black uppercase tracking-[1.5px] transition-all hover:shadow-[0_0_15px_rgba(229,62,62,0.3)]">
                      Watch Match
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRegisterTournament(tourney.id, tourney.name)}
                      disabled={isRegistered}
                      className={`w-full py-2.5  text-xs font-black uppercase tracking-[1.5px] transition-all ${
                        isRegistered 
                          ? "bg-green-500/15 text-green-500 border border-green-500/20 cursor-default" 
                          : "bg-[#e53e3e] hover:bg-[#e53e3e]/90 text-[#0d1016]"
                      }`}
                    >
                      {isRegistered ? "Registered" : "Register Arena"}
                    </button>
                  )}

                  {/* Corner accents */}
                  <span className="absolute top-0 left-0 h-2 w-2 border-l border-t border-[#e53e3e]/20 rounded-tl-lg" />
                  <span className="absolute bottom-0 right-0 h-2 w-2 border-r border-b border-[#e53e3e]/20 rounded-br-lg" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (activeView === "notifications") {
    return (
      <div className={`absolute inset-0 flex flex-col animate-fade-in ${textPrimary} z-[5] p-2 sm:p-4`}>
        {/* Header */}
        <div className={`flex items-center justify-between border-b ${borderColor} pb-4 mb-4 px-2`}>
          <div>
            <p className="font-['Orbitron'] text-xs font-black uppercase tracking-[6px] text-[#e53e3e]">
              SYSTEM ALERTS
            </p>
            <h2 className={`mt-1 text-2xl font-black uppercase tracking-tight ${textColor} font-['Orbitron']`}>
              Inbox Notifications
            </h2>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto min-h-0 pb-6 space-y-px w-full">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`relative flex items-start justify-between gap-6 border-b ${borderColor} px-4 py-4 transition-colors ${
                notif.resolved ? "opacity-50" : (isDark ? "hover:bg-[#ffffff]/3" : "hover:bg-[#0b0c0b]/3")
              }`}
            >
              {/* Left: type label + message */}
              <div className="flex items-start gap-4 min-w-0 flex-1">
                {/* Type tag */}
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

              {/* Right: actions or resolved + time */}
              <div className="flex items-center gap-4 shrink-0">
                {!notif.resolved ? (
                  <div className="flex items-center gap-3">
                    {notif.type === "lobby" && (
                      <>
                        <button
                          onClick={() => handleResolveNotification(notif.id, "accept", `Joined ${notif.sender}'s ${notif.game} lobby!`)}
                          className={`font-['Rajdhani'] text-[11px] font-bold tracking-[2px] uppercase border-b border-[#e53e3e]/50 text-[#e53e3e] hover:border-[#e53e3e] transition-colors bg-transparent border-l-0 border-r-0 border-t-0 cursor-pointer pb-px`}
                        >
                          ACCEPT
                        </button>
                        <button
                          onClick={() => handleResolveNotification(notif.id, "decline", "Ignored lobby invitation.")}
                          className={`font-['Rajdhani'] text-[11px] font-bold tracking-[2px] uppercase ${textMuted} hover:${textColor} transition-colors bg-transparent border-none cursor-pointer`}
                        >
                          IGNORE
                        </button>
                      </>
                    )}
                    {notif.type === "friend_request" && (
                      <>
                        <button
                          onClick={() => handleResolveNotification(notif.id, "accept", `Accepted friend request from ${notif.sender}!`)}
                          className={`font-['Rajdhani'] text-[11px] font-bold tracking-[2px] uppercase border-b border-[#22c55e]/50 text-[#22c55e] hover:border-[#22c55e] transition-colors bg-transparent border-l-0 border-r-0 border-t-0 cursor-pointer pb-px`}
                        >
                          ACCEPT
                        </button>
                        <button
                          onClick={() => handleResolveNotification(notif.id, "decline", `Declined friend request from ${notif.sender}.`)}
                          className={`font-['Rajdhani'] text-[11px] font-bold tracking-[2px] uppercase ${textMuted} hover:${textColor} transition-colors bg-transparent border-none cursor-pointer`}
                        >
                          DECLINE
                        </button>
                      </>
                    )}
                    {notif.type === "tournament" && (
                      <button
                        onClick={() => { onViewChange("tournaments"); handleResolveNotification(notif.id, "view", "Navigating to tournaments board."); }}
                        className={`font-['Rajdhani'] text-[11px] font-bold tracking-[2px] uppercase border-b border-[#a370f7]/50 text-[#a370f7] hover:border-[#a370f7] transition-colors bg-transparent border-l-0 border-r-0 border-t-0 cursor-pointer pb-px`}
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

              {/* left edge accent on unresolved */}
              {!notif.resolved && (
                <span className={`absolute left-0 top-0 bottom-0 w-0.5 ${
                  notif.type === "lobby" ? "bg-[#e53e3e]" :
                  notif.type === "friend_request" ? "bg-[#22c55e]" : "bg-[#a370f7]"
                }`} />
              )}
            </div>
          ))}

          {notifications.length === 0 && (
            <div className={`text-center py-10 ${textMutedLight} text-xs font-bold uppercase tracking-[2px]`}>
              No new alerts
            </div>
          )}
        </div>
      </div>
    );
  }

  // Lobby filter list
  const filteredFriends = friendsList.filter(f => 
    f.name.toLowerCase().includes(inviteSearchQuery.toLowerCase())
  );

  return (
    <div className={`absolute inset-0 flex flex-col justify-between p-2 sm:p-4 animate-fade-in ${textPrimary}`}>
      
      {/* Lobby Invitation Drawer/Popup on Right Side */}
      {showInviteCard && (
        <div className={`fixed right-6 top-[120px] w-[280px] max-h-[380px] border ${borderColor} ${isDark ? "bg-[#0d1016]/95" : "bg-[#cbd4cc]/95"}  shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-md flex flex-col p-4 z-40 animate-fade-in`}>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#ffffff]/10">
            <span className={`font-['Orbitron'] text-[10px] font-black tracking-[2px] ${textColor}`}>INVITE PLAYERS</span>
            <button onClick={() => setShowInviteCard(false)} className="text-[10px] uppercase font-bold text-red-500 hover:text-red-400">Close</button>
          </div>
          
          <input
            type="text"
            placeholder="Search friends..."
            value={inviteSearchQuery}
            onChange={(e) => setInviteSearchQuery(e.target.value)}
            className={`w-full ${isDark ? "bg-[#121620] text-[#cbd4cc]" : "bg-white text-[#0b0c0b]"} border ${borderFilter}  px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#e53e3e] mb-3`}
          />

          <div className="flex-1 overflow-y-auto divide-y divide-[#ffffff]/5 space-y-2 pr-1">
            {filteredFriends.map((friend) => (
              <div key={friend.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-[#1b2230] border border-[#e53e3e]/20 flex items-center justify-center text-[8px] font-bold text-[#e53e3e]">
                    {friend.initial}
                  </div>
                  <span className={`text-xs font-bold ${textColor}`}>{friend.name}</span>
                </div>
                <button
                  onClick={() => handleInvitePlayer(friend.id, friend.name)}
                  className={`text-[9px] font-black uppercase tracking-[1px] px-2.5 py-1 rounded transition-all ${
                    invitedPlayerIds.includes(friend.id)
                      ? "bg-gray-600/40 text-gray-400 cursor-default"
                      : "bg-[#e53e3e] hover:bg-[#e53e3e]/90 text-[#0d1016]"
                  }`}
                >
                  {invitedPlayerIds.includes(friend.id) ? "Invited" : "Invite"}
                </button>
              </div>
            ))}
            {filteredFriends.length === 0 && (
              <p className="text-center text-[10px] text-gray-500 py-4 font-bold">// No friends found</p>
            )}
          </div>
          <span className="absolute top-0 left-0 h-2.5 w-2.5 border-l border-t border-[#e53e3e]/40 rounded-tl-lg" />
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 border-r border-b border-[#e53e3e]/40 rounded-br-lg" />
        </div>
      )}

      {/* Main Lobby Workspace View */}
      {isInLobbyRoom ? (
        <div className="flex-1 flex flex-col justify-between h-full animate-fade-in p-2">
          {/* Lobby Room Header */}
          <div className={`flex justify-between items-center border-b ${borderColor} pb-4 mb-4`}>
            <div>
              <p className="font-['Orbitron'] text-xs font-black uppercase tracking-[6px] text-[#e53e3e]">
                CUSTOM LOBBY
              </p>
              <div className="flex items-center gap-3 mt-1">
                <h2 className={`text-2xl font-black uppercase tracking-tight ${textColor} font-['Orbitron']`}>
                  Room // {lobbyGame}
                </h2>
                <span className={`text-xs font-mono font-bold bg-[#e53e3e]/15 text-[#e53e3e] px-3 py-1 rounded border border-[#e53e3e]/30 uppercase`}>
                  Room Code: {lobbyCode}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleCopyInviteLink}
                className="bg-[#e53e3e] hover:bg-[#e53e3e]/90 text-black px-5 py-2  text-xs font-black uppercase tracking-[1.5px] transition-all shadow-[0_0_15px_rgba(251,146,60,0.2)]"
              >
                Copy Invite Link
              </button>
              <button
                onClick={() => setShowInviteCard(!showInviteCard)}
                className="bg-transparent hover:bg-[#e53e3e]/15 text-[#e53e3e] border border-[#e53e3e]/40 px-5 py-2  text-xs font-black uppercase tracking-[1.5px] transition-all"
              >
                + Invite Players
              </button>
              <button
                onClick={handleLeaveLobby}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 px-5 py-2  text-xs font-black uppercase tracking-[1.5px] transition-all"
              >
                Leave Room
              </button>
            </div>
          </div>

          {/* Lobby Workspace Grid */}
          <div className="flex-1 grid md:grid-cols-5 gap-8 min-h-0 mb-4">
            
            {/* Left Side: Lobby Roster Members (dynamic columns) */}
            <div className="md:col-span-2 flex flex-col gap-4">
              <h3 className={`font-['Orbitron'] text-xs font-black uppercase tracking-[2px] ${textColor} mb-1`}>
                Lobby Roster ({lobbyMembers.length}/{lobbyMaxSize})
              </h3>
              
              <div className="space-y-4">
                {lobbyMembers.map((member, index) => {
                  const memberName = typeof member === "string" ? member : member.name;
                  const isSelf = memberName === "You" || memberName === user?.username;
                  const rank = typeof member === "string" 
                    ? (isSelf ? gameRanks[lobbyGame] : (gameRanks[lobbyGame] || "Diamond III"))
                    : member.rank;
                  const isHost = typeof member === "string" ? index === 0 : member.isHost;
                  
                  return (
                    <div
                      key={index}
                      className={`relative border ${borderColor} ${isDark ? "bg-[#0d1016]/90" : "bg-[#ffffff]/90"} p-4  flex items-center justify-between shadow-md backdrop-blur-sm`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded bg-[#1b2230] border border-[#e53e3e]/25 flex items-center justify-center text-xs font-black text-[#e53e3e]">
                          {memberName.substring(0,2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className={`text-xs font-black ${textColor}`}>{memberName}</p>
                            {isHost && (
                              <span className="text-[8px] font-black uppercase tracking-[1px] px-1.5 py-0.2 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                                Host
                              </span>
                            )}
                          </div>
                          <p className={`text-[9px] uppercase tracking-wider ${textMutedLight} font-mono mt-0.5`}>Rank: {rank}</p>
                        </div>
                      </div>
                      
                      <span className="text-[9px] font-black uppercase tracking-[1px] px-2 py-0.5 rounded bg-green-500/10 text-green-500 border border-green-500/20">
                        Ready
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Side: Lobby Chat Panel (3 columns) */}
            <div className={`md:col-span-3 border ${borderColor}  ${isDark ? "bg-[#0a0c10]/80" : "bg-[#ffffff]/80"} flex flex-col overflow-hidden shadow-lg backdrop-blur-md`}>
              <div className={`px-5 py-3.5 border-b ${borderColor} ${isDark ? "bg-[#ffffff]/3" : "bg-[#0b0c0b]/3"}`}>
                <h3 className={`font-['Orbitron'] text-xs font-black ${textColor}`}>Lobby Dialogue</h3>
              </div>

              {/* Chat messages list */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-0">
                {lobbyMessages.map((msg, idx) => {
                  const isSystem = msg.sender === "System";
                  const isSelf = msg.sender === "You";
                  if (isSystem) {
                    return (
                      <div key={idx} className="text-center py-1">
                        <span className="px-3 py-1 rounded bg-[#e53e3e]/10 border border-[#e53e3e]/20 text-[9px] font-bold font-mono text-[#e53e3e] uppercase tracking-[1px]">
                          {msg.text}
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div key={idx} className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}>
                      <span className={`text-[8.5px] ${textMutedLight} mb-0.5 px-1 font-bold`}>{isSelf ? "You" : msg.sender}</span>
                      <div className={`px-3 py-1.5  max-w-sm text-xs ${
                        isSelf ? "bg-[#e53e3e] text-black" : (isDark ? "bg-[#121620] text-[#cbd4cc] border border-[#ffffff]/10" : "bg-white text-[#0b0c0b] border border-[#0b0c0b]/10")
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input field */}
              <form onSubmit={handleSendLobbyChat} className={`p-3 border-t ${borderColor} ${isDark ? "bg-[#ffffff]/5" : "bg-[#0b0c0b]/5"} flex gap-2`}>
                <input
                  type="text"
                  value={lobbyChatInput}
                  onChange={(e) => setLobbyChatInput(e.target.value)}
                  placeholder="Communicate with team lobby..."
                  className={`flex-1 ${isDark ? "bg-[#121620] text-[#e6e8eb]" : "bg-white text-[#0b0c0b]"} placeholder:text-[#cbd4cc]/30 border ${borderFilter}  px-3 py-2 text-xs focus:outline-none focus:border-[#e53e3e]`}
                />
                <button
                  type="submit"
                  className="bg-[#e53e3e] text-[#0d1016] hover:bg-[#e53e3e]/90 px-4 py-2  text-xs font-black uppercase tracking-[1px] transition-all"
                >
                  Send
                </button>
              </form>
            </div>
            
          </div>

          {/* Lobby Launch Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleStartGameMatch}
              className="bg-[#e53e3e] text-[#0d1016] hover:bg-[#e53e3e]/90 px-10 py-3.5  text-xs font-black uppercase tracking-[2px] shadow-[0_0_20px_rgba(251,146,60,0.3)] transition-all hover:scale-105"
            >
              START GAME MATCH
            </button>
          </div>
        </div>
      ) : (
        /* Setup / Matchmaker Portal Grid (Split 3-columns cards layout side-by-side) */
        <div className="flex-1 grid md:grid-cols-3 gap-8 items-stretch justify-center h-full py-4 min-h-0 px-2">
          
          {/* Card 1: Random Match Setup */}
          <div className={`border ${borderColor} ${isDark ? "bg-[#0d1016]/75" : "bg-[#ffffff]/75"} p-6  backdrop-blur-sm flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.12)] h-full relative`}>
            
            {/* Setup / Active Queue State split inside Card 1 */}
            {!showPlayConfig && !isMatching ? (
              <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
                <div className="space-y-4">
                  <h3 className={`font-['Orbitron'] text-base font-black ${textColor} uppercase tracking-[2px]`}>
                    Random Match
                  </h3>
                  <p className={`text-xs ${textMuted} leading-relaxed`}>
                    Join the queue to find teammates and players matching your game choices to form a team lobby.
                  </p>
                </div>
                
                <button
                  onClick={() => setShowPlayConfig(true)}
                  className="w-full bg-[#e53e3e] text-[#0d1016] hover:bg-[#e53e3e]/90 py-4  text-xs font-black uppercase tracking-[2px] shadow-[0_0_20px_rgba(251,146,60,0.25)] transition-all active:scale-95"
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
                    <p className={`text-[10px] ${textMuted} mt-1`}>Select your game choice to search for active players ready to match.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className={`text-[9px] uppercase tracking-widest ${textMutedLight} block mb-1.5 font-bold`}>
                        Select Game Title
                      </label>
                      <select
                        value={selectedGame}
                        onChange={(e) => setSelectedGame(e.target.value)}
                        className={`w-full ${isDark ? "bg-[#121620] text-[#cbd4cc]" : "bg-white text-[#0b0c0b]"} border ${borderFilter}  px-3 py-2 text-xs focus:outline-none focus:border-[#e53e3e] transition-all font-mono`}
                      >
                        <option value="VALORANT">VALORANT</option>
                        <option value="CS2">CS2 (COUNTER-STRIKE 2)</option>
                        <option value="LOL">LOL (LEAGUE OF LEGENDS)</option>
                        <option value="APEX">APEX LEGENDS</option>
                        <option value="DOTA2">DOTA 2</option>
                        <option value="R6SIEGE">R6 SIEGE</option>
                        <option value="OVERWATCH2">OVERWATCH 2</option>
                        <option value="ROCKETLG">ROCKET LEAGUE</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between border-t border-b border-[#ffffff]/10 dark:border-[#ffffff]/10 py-3.5 text-xs">
                      <span className={textMuted}>Selected Title:</span>
                      <span className={`font-bold font-mono text-[#e53e3e] uppercase tracking-wider`}>{selectedGame}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleStartMatchmaking}
                    className="flex-1 bg-[#e53e3e] text-[#0d1016] hover:bg-[#e53e3e]/90 py-3  text-xs font-black uppercase tracking-[2px] transition-all"
                  >
                    START MATCH
                  </button>
                  <button
                    onClick={() => setShowPlayConfig(false)}
                    className={`px-4 bg-transparent border ${borderColor} ${textColor}  text-xs font-black uppercase tracking-[1px] hover:bg-[#e53e3e]/5 transition-all`}
                  >
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
                    SEARCHING RANDOM MATCH
                  </p>
                  <p className={`text-[10px] ${textMutedLight} mt-1`}>
                    Searching queue in: <span className="font-bold text-[#e53e3e]">{selectedGame}</span>
                  </p>
                  <p className="text-xl font-mono font-bold text-[#e53e3e] mt-4">{matchTimer}s</p>
                </div>

                <button
                  onClick={handleCancelMatchmaking}
                  className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 py-2.5  text-xs font-black uppercase tracking-[2px] transition-all mt-4"
                >
                  CANCEL QUEUE
                </button>
              </div>
            )}
            
            {/* Corner accents */}
            <span className="absolute top-0 left-0 h-2 w-2 border-l border-t border-[#e53e3e]/30 rounded-tl-lg" />
            <span className="absolute bottom-0 right-0 h-2 w-2 border-r border-b border-[#e53e3e]/30 rounded-br-lg" />
          </div>

          {/* Card 2: Create Custom Lobby */}
          <div className={`border ${borderColor} ${isDark ? "bg-[#0d1016]/75" : "bg-[#ffffff]/75"} p-6  backdrop-blur-sm flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.12)] h-full relative`}>
            <div className="space-y-4 text-left">
              <h3 className={`font-['Orbitron'] text-base font-black ${textColor} uppercase tracking-[1.5px]`}>
                Create Custom Lobby
              </h3>
              <p className={`text-xs ${textMuted} leading-relaxed`}>
                Create a lobby slot for custom team play. Share lobby codes with friends to coordinate and match together.
              </p>
            </div>

            <div className="space-y-4 mt-6">
              <div className="text-left">
                <label className={`text-[9px] uppercase tracking-widest ${textMutedLight} block mb-1.5 font-bold`}>
                  Select Game Title
                </label>
                <select
                  value={customLobbyGame}
                  onChange={(e) => setCustomLobbyGame(e.target.value)}
                  className={`w-full ${isDark ? "bg-[#121620] text-[#cbd4cc]" : "bg-white text-[#0b0c0b]"} border ${borderFilter}  px-3 py-2.5 text-xs focus:outline-none focus:border-[#e53e3e] transition-all font-mono`}
                >
                  <option value="VALORANT">VALORANT</option>
                  <option value="CS2">CS2 (COUNTER-STRIKE 2)</option>
                  <option value="LOL">LOL (LEAGUE OF LEGENDS)</option>
                  <option value="APEX">APEX LEGENDS</option>
                  <option value="DOTA2">DOTA 2</option>
                  <option value="R6SIEGE">R6 SIEGE</option>
                  <option value="OVERWATCH2">OVERWATCH 2</option>
                  <option value="ROCKETLG">ROCKET LEAGUE</option>
                </select>
              </div>

              <div className="text-left">
                <label className={`text-[9px] uppercase tracking-widest ${textMutedLight} block mb-1.5 font-bold`}>
                  Lobby Size (Max Players)
                </label>
                <select
                  value={customLobbySize}
                  onChange={(e) => setCustomLobbySize(parseInt(e.target.value))}
                  className={`w-full ${isDark ? "bg-[#121620] text-[#cbd4cc]" : "bg-white text-[#0b0c0b]"} border ${borderFilter}  px-3 py-2.5 text-xs focus:outline-none focus:border-[#e53e3e] transition-all font-mono`}
                >
                  <option value={2}>2 Players (1v1 / Duos)</option>
                  <option value={3}>3 Players (3v3 / Trios)</option>
                  <option value={4}>4 Players (4v4)</option>
                  <option value={5}>5 Players (Full Squad)</option>
                </select>
              </div>

              <button
                onClick={handleCreateCustomLobby}
                className="w-full bg-[#e53e3e] text-[#0d1016] hover:bg-[#e53e3e]/90 py-3  text-xs font-black uppercase tracking-[2px] transition-all"
              >
                Create Custom Room
              </button>
            </div>
            
            {/* Corner accents */}
            <span className="absolute top-0 left-0 h-2 w-2 border-l border-t border-[#e53e3e]/30 rounded-tl-lg" />
            <span className="absolute bottom-0 right-0 h-2 w-2 border-r border-b border-[#e53e3e]/30 rounded-br-lg" />
          </div>

          {/* Card 3: Join Active Lobby */}
          <div className={`border ${borderColor} ${isDark ? "bg-[#0d1016]/75" : "bg-[#ffffff]/75"} p-6  backdrop-blur-sm flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.12)] h-full relative`}>
            <div className="space-y-4 text-left">
              <h3 className={`font-['Orbitron'] text-base font-black ${textColor} uppercase tracking-[1.5px]`}>
                Join Active Lobby
              </h3>
              <p className={`text-xs ${textMuted} leading-relaxed`}>
                Enter shared code to join a custom lobby roster. Coordinate matches with the host player.
              </p>
            </div>

            <form onSubmit={handleJoinCustomLobby} className="space-y-4 mt-6">
              <div className="text-left">
                <label className={`text-[9px] uppercase tracking-widest ${textMutedLight} block mb-1.5 font-bold`}>
                  Enter Lobby Code
                </label>
                <input
                  type="text"
                  placeholder="Enter Code or Paste Link"
                  value={lobbyCode}
                  onChange={(e) => setLobbyCode(e.target.value)}
                  className={`w-full ${isDark ? "bg-[#121620] text-[#e6e8eb] placeholder:text-[#cbd4cc]/30" : "bg-white text-[#0b0c0b] placeholder:text-black/55"} border ${borderFilter}  px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#e53e3e] transition-all font-mono uppercase`}
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-[#e53e3e] text-white hover:bg-[#c53030] py-3  text-xs font-black uppercase tracking-[2px] transition-all"
              >
                Join Custom Room
              </button>
              
              <button
                type="button"
                onClick={handleBrowseOpenLobbies}
                className="w-full bg-transparent border border-[#e53e3e]/40 text-[#e53e3e] hover:bg-[#e53e3e]/10 py-3  text-xs font-black uppercase tracking-[2px] transition-all mt-2 cursor-pointer"
              >
                Browse Open Lobbies
              </button>
            </form>
            
            {/* Corner accents */}
            <span className="absolute top-0 left-0 h-2 w-2 border-l border-t border-[#e53e3e]/30 rounded-tl-lg" />
            <span className="absolute bottom-0 right-0 h-2 w-2 border-r border-b border-[#e53e3e]/30 rounded-br-lg" />
          </div>

        </div>
      )}
      
    </div>
  );
}
