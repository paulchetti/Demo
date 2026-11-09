import jwt from 'jsonwebtoken';
import { getUserById } from '../database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'trading_trends_super_secure_jwt_secret_2026_!@#';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    const user = getUserById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User account not found' });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ error: 'Your account has been temporarily suspended. Please contact support.' });
    }

    req.user = user;
    next();
  });
}

export function optionalAuthenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (!err && decoded?.id) {
      const user = getUserById(decoded.id);
      if (user && user.status !== 'SUSPENDED') {
        req.user = user;
      }
    }
    next();
  });
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  next();
}

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}
