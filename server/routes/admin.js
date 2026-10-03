const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Room = require('../models/Room');
const adminAuth = require('../middleware/adminAuth');

// ── Admin Login (separate from user login — checks role) ──────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: 'Invalid email or password.' });

    if (user.role !== 'admin')
      return res.status(403).json({ message: 'Access denied. Not an admin account.' });

    const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({ message: 'Admin login successful', token, user: user.toSafeJSON() });
  } catch (err) {
    console.error('ADMIN LOGIN ERROR:', err);
    return res.status(500).json({ message: 'Login failed.' });
  }
});

// ── Dashboard Stats ────────────────────────────────────────────────────────────
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [totalUsers, totalRooms, activeRooms, waitingRooms] = await Promise.all([
      User.countDocuments(),
      Room.countDocuments(),
      Room.countDocuments({ status: 'active' }),
      Room.countDocuments({ status: 'waiting' }),
    ]);

    const topElo = await User.find().sort({ elo: -1 }).limit(1);
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);

    // College distribution
    const collegeAgg = await User.aggregate([
      { $group: { _id: '$college', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Total wins/losses
    const gameStats = await User.aggregate([
      { $group: { _id: null, totalWins: { $sum: '$wins' }, totalLosses: { $sum: '$losses' }, totalSolved: { $sum: '$solved' } } }
    ]);

    res.json({
      stats: {
        totalUsers,
        totalRooms,
        activeRooms,
        waitingRooms,
        completedRooms: totalRooms - activeRooms - waitingRooms,
        topElo: topElo[0] ? { name: topElo[0].name, elo: topElo[0].elo } : null,
        totalWins: gameStats[0]?.totalWins || 0,
        totalLosses: gameStats[0]?.totalLosses || 0,
        totalSolved: gameStats[0]?.totalSolved || 0,
      },
      recentUsers: recentUsers.map(u => u.toSafeJSON()),
      collegeDistribution: collegeAgg,
    });
  } catch (err) {
    console.error('ADMIN STATS ERROR:', err);
    res.status(500).json({ message: 'Failed to fetch stats.' });
  }
});

// ── List All Users ─────────────────────────────────────────────────────────────
router.get('/users', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const role = req.query.role;
    const query = search
      ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
      : {};
    if (role && role !== 'all') {
      query.role = role;
    }

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query)
    ]);

    res.json({ users: users.map(u => u.toSafeJSON()), total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
});

// ── Get Single User ────────────────────────────────────────────────────────────
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ user: user.toSafeJSON() });
  } catch {
    res.status(500).json({ message: 'Failed to fetch user.' });
  }
});

// ── Update User (role, ELO, etc.) ─────────────────────────────────────────────
router.patch('/users/:id', adminAuth, async (req, res) => {
  try {
    const allowed = ['name', 'college', 'department', 'year', 'elo', 'role', 'solved', 'wins', 'losses', 'streak'];
    const validRoles = ['student', 'faculty', 'setter', 'moderator', 'admin'];
    if (req.body.role && !validRoles.includes(req.body.role)) {
      return res.status(400).json({ message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    allowed.forEach(k => { if (req.body[k] !== undefined) user[k] = req.body[k]; });
    await user.save();
    res.json({ user: user.toSafeJSON() });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user.' });
  }
});

// ── Delete User ────────────────────────────────────────────────────────────────
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete another admin.' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully.' });
  } catch {
    res.status(500).json({ message: 'Failed to delete user.' });
  }
});

// ── List All Rooms ─────────────────────────────────────────────────────────────
router.get('/rooms', adminAuth, async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate('host', 'name email elo')
      .populate('opponent', 'name email elo')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ rooms });
  } catch {
    res.status(500).json({ message: 'Failed to fetch rooms.' });
  }
});

// ── Delete Room ────────────────────────────────────────────────────────────────
router.delete('/rooms/:id', adminAuth, async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: 'Room deleted.' });
  } catch {
    res.status(500).json({ message: 'Failed to delete room.' });
  }
});

// ── Promote a user to admin ────────────────────────────────────────────────────
router.post('/users/:id/promote', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: 'admin' }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ user: user.toSafeJSON() });
  } catch {
    res.status(500).json({ message: 'Failed to promote user.' });
  }
});

// ── Assign specific role to user ───────────────────────────────────────────────
router.post('/users/:id/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body || {};
    const validRoles = ['student', 'faculty', 'setter', 'moderator', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    user.role = role;
    await user.save();
    res.json({ message: `Role changed to ${role}`, user: user.toSafeJSON() });
  } catch (err) {
    res.status(500).json({ message: 'Failed to change role.' });
  }
});

module.exports = router;
