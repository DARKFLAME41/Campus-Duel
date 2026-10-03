/**
 * create-admin.js
 * Run this once to create the first admin account.
 *
 * Usage:
 *   node server/seed/create-admin.js
 *
 * Env vars used: MONGODB_URI, JWT_SECRET  (loaded from server/.env)
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ADMIN_NAME     = process.env.ADMIN_NAME     || 'Campus Admin';
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'admin@campusduel.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@1234';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Require User model after DB is connected
  const User = require('../models/User');

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log(`🔑 Existing user "${ADMIN_EMAIL}" promoted to admin.`);
    } else {
      console.log(`ℹ️  Admin "${ADMIN_EMAIL}" already exists.`);
    }
    await mongoose.disconnect();
    return;
  }

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await User.create({
    name:     ADMIN_NAME,
    email:    ADMIN_EMAIL,
    password: hashed,
    role:     'admin',
    college:  'Administration',
    department: 'System',
  });

  console.log(`🛡  Admin account created!`);
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log(`   ⚠️  Change the password after first login!`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
