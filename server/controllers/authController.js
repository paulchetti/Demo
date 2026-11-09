import bcrypt from 'bcryptjs';
import { getUserByEmailOrUsername, getUserById, getTransactionsByUserId } from '../database.js';
import { generateToken } from '../middleware/auth.js';
import { calculateUserWallet } from '../services/walletEngine.js';

export async function login(req, res) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Username/Email and password are required' });
    }

    const user = getUserByEmailOrUsername(identifier);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. Only admin-approved accounts can log in.' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ error: 'Your trading account has been suspended by administration.' });
    }

    const token = generateToken(user);

    // Calculate live wallet metrics
    const userTxs = getTransactionsByUserId(user.id);
    const growthStart = user.growthStartDate ? new Date(user.growthStartDate).getTime() : 0;
    const approvedWithdrawals = userTxs
      .filter(t => t.type === 'WITHDRAWAL' && t.status === 'APPROVED' && new Date(t.createdAt).getTime() >= growthStart)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const wallet = calculateUserWallet(user, approvedWithdrawals);

    const safeUser = { ...user };
    delete safeUser.passwordHash;

    return res.json({
      success: true,
      token,
      user: safeUser,
      wallet
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
}

export async function getCurrentUser(req, res) {
  try {
    const user = getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userTxs = getTransactionsByUserId(user.id);
    const growthStart = user.growthStartDate ? new Date(user.growthStartDate).getTime() : 0;
    const approvedWithdrawals = userTxs
      .filter(t => t.type === 'WITHDRAWAL' && t.status === 'APPROVED' && new Date(t.createdAt).getTime() >= growthStart)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const wallet = calculateUserWallet(user, approvedWithdrawals);

    const safeUser = { ...user };
    delete safeUser.passwordHash;

    return res.json({
      success: true,
      user: safeUser,
      wallet
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve profile: ' + err.message });
  }
}
