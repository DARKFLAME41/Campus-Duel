const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * RBAC authorization middleware.
 * Usage: router.get('/admin-only', authorize('admin'), handler);
 *        router.get('/faculty-zone', authorize('faculty'), handler);
 * Admins automatically bypass specific role restrictions.
 */
function authorize(...allowedRoles) {
  return async (req, res, next) => {
    try {
      const header = req.headers.authorization || '';
      const token = header.startsWith('Bearer ') ? header.slice(7) : null;
      if (!token) return res.status(401).json({ message: 'Authentication required' });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return res.status(401).json({ message: 'User not found' });

      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role) && user.role !== 'admin') {
        return res.status(403).json({
          message: `Access denied. Requires role: ${allowedRoles.join(' or ')}`
        });
      }

      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
}

module.exports = authorize;
