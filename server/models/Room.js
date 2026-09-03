const mongoose = require('mongoose');
const roomSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  opponent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['waiting', 'active', 'completed'], default: 'waiting' },
  problemId: { type: String, default: null }
}, { timestamps: true });
module.exports = mongoose.model('Room', roomSchema);
