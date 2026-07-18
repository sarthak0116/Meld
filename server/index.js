const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min window
  max: 10,                   // 10 attempts per window per IP
  message: { message: 'Too many attempts, please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

// Security headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// CORS
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    
    // Allow any localhost origin (e.g., http://localhost:5173, http://localhost:5176)
    if (/^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    
    const envOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
    if (origin === envOrigin) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10kb' }));

// Apply general limiter to all /api routes
app.use('/api/', generalLimiter);

// Routes — auth gets the stricter limiter
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const leaderboardRoutes = require('./routes/leaderboard');
const friendsRoutes = require('./routes/friends');
const notificationsRoutes = require('./routes/notifications');
const tournamentsRoutes = require('./routes/tournaments');
const statsRoutes = require('./routes/stats');

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/tournaments', tournamentsRoutes);
app.use('/api/stats', statsRoutes);

// Health check
app.get('/', (_req, res) => {
  res.json({ message: 'Meld API is running' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5001;

const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      const envOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
      if (origin === envOrigin) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Real-time Lobby Storage
const lobbies = new Map();

io.on('connection', (socket) => {
  let currentLobbyCode = null;
  let currentUsername = null;

  // Join or Create Lobby
  socket.on('join-lobby', ({ lobbyCode, username, rank, game, maxSize }) => {
    const code = lobbyCode.toUpperCase();
    currentLobbyCode = code;
    currentUsername = username;

    if (!lobbies.has(code)) {
      lobbies.set(code, {
        code,
        game: game || "VALORANT",
        members: [],
        messages: [],
        maxSize: maxSize || 5 // default max size
      });
    }

    const lobby = lobbies.get(code);

    // Limit room capacity to maxSize players max
    if (lobby.members.length >= lobby.maxSize) {
      socket.emit('lobby-error', { message: `Lobby room is currently full (${lobby.maxSize}/${lobby.maxSize} players).` });
      return;
    }

    // Determine host status
    const isHost = lobby.members.length === 0;

    const newMember = {
      id: socket.id,
      name: username,
      rank: rank || "Unranked",
      status: "Ready",
      isHost
    };

    lobby.members.push(newMember);
    socket.join(code);

    // Add System Chat Message
    const systemMsg = {
      sender: "System",
      text: `${username} has joined the lobby.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    lobby.messages.push(systemMsg);

    // Broadcast updated state
    io.to(code).emit('lobby-update', lobby);
  });

  // Handle Room Chat Messages
  socket.on('send-chat', ({ message }) => {
    if (!currentLobbyCode || !lobbies.has(currentLobbyCode)) return;

    const lobby = lobbies.get(currentLobbyCode);
    const newMsg = {
      sender: currentUsername || "Player",
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    lobby.messages.push(newMsg);
    io.to(currentLobbyCode).emit('chat-message', newMsg);
  });

  // Handle Manual Leave Lobby
  socket.on('leave-lobby', () => {
    handleUserLeave();
  });

  // Handle Start Matchmaking / Start Game Match by Host
  socket.on('start-match', () => {
    if (!currentLobbyCode || !lobbies.has(currentLobbyCode)) return;

    const lobby = lobbies.get(currentLobbyCode);
    const member = lobby.members.find(m => m.id === socket.id);

    if (!member || !member.isHost) {
      socket.emit('lobby-error', { message: 'Only the lobby host can start the match.' });
      return;
    }

    if (lobby.members.length < lobby.maxSize) {
      socket.emit('lobby-error', { message: `Need all ${lobby.maxSize} players in the roster to start.` });
      return;
    }

    // Generate a cryptographically secure match ID (fixes B5 — no more Math.random())
    const matchId = require('crypto').randomUUID().replace(/-/g, '').substring(0, 8).toUpperCase();
    const serverLink = `https://riot-valorant.meld-play.net/match/match-id-${matchId}`;

    io.to(currentLobbyCode).emit('match-started', {
      serverLink,
      message: `Match server created! Connecting both players to match #${matchId}...`
    });
  });

  socket.on('disconnect', () => {
    handleUserLeave();
  });

  function handleUserLeave() {
    if (!currentLobbyCode || !lobbies.has(currentLobbyCode)) return;

    const lobby = lobbies.get(currentLobbyCode);
    const initialCount = lobby.members.length;

    // Filter out the leaving player
    lobby.members = lobby.members.filter(m => m.id !== socket.id);

    if (lobby.members.length === 0) {
      lobbies.delete(currentLobbyCode);
    } else {
      // Re-assign host status if host left
      const hostExists = lobby.members.some(m => m.isHost);
      if (!hostExists && lobby.members.length > 0) {
        lobby.members[0].isHost = true;
      }

      // Add System Chat Message
      if (initialCount !== lobby.members.length) {
        const systemMsg = {
          sender: "System",
          text: `${currentUsername || "A player"} has left the lobby.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        lobby.messages.push(systemMsg);
      }

      socket.leave(currentLobbyCode);
      io.to(currentLobbyCode).emit('lobby-update', lobby);
    }

    currentLobbyCode = null;
  }
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});
