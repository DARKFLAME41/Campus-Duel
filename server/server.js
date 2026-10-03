require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const roomRoutes = require('./routes/rooms');
const leaderboardRoutes = require('./routes/leaderboard');
const adminRoutes = require('./routes/admin');
const registerDuelSocket = require('./sockets/duelSocket');
const registerRoomSocket = require('./sockets/roomSocket');

const app = express();
const server = http.createServer(app);
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
const io = new Server(server, { cors: { origin: allowedOrigin, credentials: true } });

app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());
app.get('/', (req, res) => res.json({ name: 'Campus Duel API', status: 'ok' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);

io.on('connection', socket => {
  console.log('Socket connected:', socket.id);
  registerDuelSocket(io, socket);
  registerRoomSocket(io, socket);
  socket.on('disconnect', () => console.log('Socket disconnected:', socket.id));
});

const port = process.env.PORT || 5000;
connectDB().then(() => server.listen(port, () => console.log(`Campus Duel server running on http://localhost:${port}`)))
  .catch(err => { console.error('MongoDB connection failed:', err.message); process.exit(1); });
