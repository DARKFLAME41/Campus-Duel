const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function tokenFor(user) { return jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' }); }

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, college, department, year } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required.' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    const normalized = email.trim().toLowerCase();
    if (await User.findOne({ email: normalized })) return res.status(409).json({ message: 'An account with this email already exists.' });
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email: normalized, password: hashed, college, department, year });
    return res.status(201).json({ message: 'Registration successful', token: tokenFor(user), user: user.toSafeJSON() });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    return res.status(500).json({ message: 'Registration failed.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Invalid email or password.' });
    return res.json({ message: 'Login successful', token: tokenFor(user), user: user.toSafeJSON() });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    return res.status(500).json({ message: 'Login failed.' });
  }
});

module.exports = router;
