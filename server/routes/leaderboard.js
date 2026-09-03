const router = require('express').Router();
const User = require('../models/User');
router.get('/', async (req, res) => {
  const users = await User.find().sort({ elo: -1, solved: -1 }).limit(100);
  res.json({ leaderboard: users.map((u, i) => ({ rank: i + 1, ...u.toSafeJSON() })) });
});
module.exports = router;
