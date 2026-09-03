import { io } from "socket.io-client";

const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const socket = io(socketUrl, {
  autoConnect: false,
  transports: ["websocket"],
});

export const duelEvents = [
  "duel:created", "duel:joined", "duel:started", "duel:countdown",
  "duel:player-ready", "duel:code-submitted", "duel:submission-status",
  "duel:opponent-status", "duel:player-solved", "duel:attack-started",
  "duel:attack-result", "duel:finished", "duel:cancelled",
];