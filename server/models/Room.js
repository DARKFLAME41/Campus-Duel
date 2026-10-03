const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  joinCode: { type: String, trim: true },
  roomName: { type: String, default: 'Classroom Duel', trim: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hostName: { type: String, default: '' },
  opponent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['waiting', 'active', 'completed'], default: 'waiting' },
  problemSource: { type: String, enum: ['app', 'custom'], default: 'app' },
  problemId: { type: String, default: 'Two Sum' },
  customProblem: {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    difficulty: { type: String, default: 'Medium' },
    category: { type: String, default: 'Arrays' },
    example: { type: String, default: '' },
    constraints: [{ type: String }],
    starters: { type: mongoose.Schema.Types.Mixed, default: {} },
    testCases: { type: mongoose.Schema.Types.Mixed, default: [] }
  },
  connectedStudents: [{ type: mongoose.Schema.Types.Mixed }],
  fixtures: [{ type: mongoose.Schema.Types.Mixed }]
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);

