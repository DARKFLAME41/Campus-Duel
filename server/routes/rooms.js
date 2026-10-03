const router = require('express').Router();
const crypto = require('crypto');
const auth = require('../middleware/auth');
const Room = require('../models/Room');

function generateCode() {
  return 'FAC-' + Math.floor(1000 + Math.random() * 9000);
}

// Create Room (Supports App Question or Custom Question)
router.post('/', auth, async (req, res) => {
  try {
    const { roomName, joinCode, problemSource, problemId, customProblem } = req.body || {};
    
    let finalCode = (joinCode || '').trim().toUpperCase();
    if (!finalCode) {
      do {
        finalCode = generateCode();
      } while (await Room.exists({ code: finalCode }));
    }

    const room = await Room.create({
      code: finalCode,
      joinCode: finalCode,
      roomName: roomName || 'Faculty Classroom Arena',
      host: req.user._id,
      hostName: req.user.name || 'Faculty',
      problemSource: problemSource || 'app',
      problemId: problemId || 'Two Sum',
      customProblem: customProblem || null,
      status: 'waiting'
    });

    return res.status(201).json({ room });
  } catch (err) {
    console.error('CREATE ROOM ERROR:', err);
    return res.status(500).json({ message: 'Failed to create room.' });
  }
});

// List all active rooms
router.get('/', auth, async (req, res) => {
  try {
    const rooms = await Room.find({ status: { $ne: 'completed' } })
      .populate('host', 'name elo college role')
      .populate('opponent', 'name elo college')
      .sort({ createdAt: -1 });
    return res.json({ rooms });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch rooms.' });
  }
});

// Join Room by Join Code
router.post('/join-code', auth, async (req, res) => {
  try {
    const { joinCode } = req.body || {};
    if (!joinCode) return res.status(400).json({ message: 'Join code is required.' });

    const queryCode = joinCode.trim().toUpperCase();
    const room = await Room.findOne({
      $or: [{ code: queryCode }, { joinCode: queryCode }]
    }).populate('host', 'name elo college');

    if (!room) {
      return res.status(404).json({ message: `No active room found with code "${queryCode}". Please check code and try again.` });
    }

    return res.json({ room, message: `Successfully joined room ${room.code}` });
  } catch (err) {
    console.error('JOIN BY CODE ERROR:', err);
    return res.status(500).json({ message: 'Error joining room.' });
  }
});

// Join room by room code URL parameter
router.post('/:code/join', auth, async (req, res) => {
  try {
    const queryCode = req.params.code.trim().toUpperCase();
    const room = await Room.findOne({
      $or: [{ code: queryCode }, { joinCode: queryCode }]
    });

    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.status !== 'waiting') return res.status(400).json({ message: 'Room is already active or finished.' });

    if (!room.host.equals(req.user._id)) {
      room.opponent = req.user._id;
      room.status = 'active';
      await room.save();
    }

    return res.json({ room });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to join room.' });
  }
});

module.exports = router;

