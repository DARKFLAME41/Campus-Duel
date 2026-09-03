const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

router.get('/profile', auth, async (req, res) => res.json({ user: req.user.toSafeJSON() }));
router.patch('/profile', auth, async (req, res) => {
  const allowed = ['name', 'college', 'department', 'year'];
  allowed.forEach(k => { if (req.body[k] !== undefined) req.user[k] = req.body[k]; });
  await req.user.save();
  res.json({ user: req.user.toSafeJSON() });
});
module.exports = router;
