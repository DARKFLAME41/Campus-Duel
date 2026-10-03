const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  college: { type: String, default: 'Not set', trim: true },
  department: { type: String, default: 'Not set', trim: true },
  year: { type: String, default: '2028' },
  elo: { type: Number, default: 1200 },
  solved: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  draws: { type: Number, default: 0 },
  role: { type: String, enum: ['student', 'faculty', 'setter', 'moderator', 'admin'], default: 'student' },
  roleDetails: { type: String, default: '', trim: true }
}, { timestamps: true });

userSchema.methods.toSafeJSON = function () {
  return {
    id: this._id.toString(), name: this.name, email: this.email,
    college: this.college, department: this.department, year: this.year,
    elo: this.elo, solved: this.solved, streak: this.streak,
    wins: this.wins, losses: this.losses, draws: this.draws,
    role: this.role, roleDetails: this.roleDetails
  };
};
module.exports = mongoose.model('User', userSchema);
