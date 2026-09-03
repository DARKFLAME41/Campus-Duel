const router = require('express').Router();
const crypto = require('crypto');
const auth = require('../middleware/auth');
const Room = require('../models/Room');

function code() { return crypto.randomBytes(3).toString('hex').toUpperCase(); }
router.post('/', auth, async (req, res) => {
  let roomCode;
  do { roomCode = code(); } while (await Room.exists({ code: roomCode }));
  const room = await Room.create({ code: roomCode, host: req.user._id, problemId: req.body.problemId || null });
  res.status(201).json({ room });
});
router.get('/', auth, async (req, res) => {
  const rooms = await Room.find({ status: { $ne: 'completed' } }).populate('host', 'name elo college').populate('opponent', 'name elo college').sort({ createdAt: -1 });
  res.json({ rooms });
});
router.post('/:code/join', auth, async (req, res) => {
  const room = await Room.findOne({ code: req.params.code });
  if (!room) return res.status(404).json({ message: 'Room not found' });
  if (room.status !== 'waiting' || room.host.equals(req.user._id)) return res.status(400).json({ message: 'Room cannot be joined.' });
  room.opponent = req.user._id; room.status = 'active'; await room.save();
  res.json({ room });
});
module.exports = router;
