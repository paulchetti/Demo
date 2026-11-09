import {
  getAllUsers,
  getUserById,
  getUserByEmailOrUsername,
  createUser,
  updateUser,
  deleteUser,
  getAllTransactions,
  getTransactionsByUserId,
  getSettings,
  updateSettings,
  getAllKycSubmissions
} from '../database.js';
import { calculateUserWallet } from '../services/walletEngine.js';
import { sendCredentialsEmail } from '../services/emailService.js';

export async function listAllUsers(req, res) {
  try {
    const allUsers = getAllUsers();
    const allTxs = getAllTransactions();

    const usersWithWallets = allUsers.map(u => {
      const userTxs = allTxs.filter(t => t.userId === u.id);
      const growthStart = u.growthStartDate ? new Date(u.growthStartDate).getTime() : 0;
      const approvedWithdrawals = userTxs
        .filter(t => t.type === 'WITHDRAWAL' && t.status === 'APPROVED' && new Date(t.createdAt).getTime() >= growthStart)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const wallet = calculateUserWallet(u, approvedWithdrawals);
      const safe = { ...u };
      delete safe.passwordHash;
      return {
        ...safe,
        wallet
      };
    });

    return res.json({ success: true, users: usersWithWallets });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch users: ' + err.message });
  }
}

export async function createNewUser(req, res) {
  try {
    const {
      username,
      email,
      password,
      fullName,
      phone,
      dob,
      address,
      aadharNo,
      panNo,
      initialBalance = 200,
      dailyGrowthRate = 3,
      status = 'ACTIVE',
      sendEmailToUser = true
    } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Prevent duplicate username or email collisions
    const existingUser = getUserByEmailOrUsername(cleanUsername) || getUserByEmailOrUsername(cleanEmail);
    if (existingUser) {
      return res.status(400).json({
        error: `A user account with username "${cleanUsername}" or email "${cleanEmail}" already exists. Please choose a unique username/email.`
      });
    }

    const newUser = createUser({
      username: cleanUsername,
      email: cleanEmail,
      password: password.trim(),
      role: 'USER',
      fullName: fullName || username,
      phone: phone || '',
      dob: dob || '',
      address: address || '',
      aadharNo: aadharNo || '',
      panNo: panNo || '',
      initialBalance: Math.max(0, Number(initialBalance)),
      dailyGrowthRate: Number(dailyGrowthRate),
      growthStartDate: new Date().toISOString(),
      manualAdjustment: 0,
      status
    });

    // Optionally dispatch credentials to the user's email
    if (sendEmailToUser) {
      await sendCredentialsEmail({
        toEmail: newUser.email,
        username: newUser.username,
        password: password.trim(),
        fullName: newUser.fullName,
        initialBalance: newUser.initialBalance
      });
    }

    const safeUser = { ...newUser };
    delete safeUser.passwordHash;

    return res.status(201).json({
      success: true,
      message: `User ${newUser.username} created successfully!`,
      user: safeUser
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create user: ' + err.message });
  }
}

export async function editUser(req, res) {
  try {
    const { id } = req.params;
    const existing = getUserById(id);
    if (!existing) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updates = { ...req.body };

    // If admin is explicitly overriding the total current balance
    if (updates.overrideBalance !== undefined && updates.overrideBalance !== null && updates.overrideBalance !== '') {
      const newTargetBalance = Math.max(0, Number(updates.overrideBalance));
      updates.initialBalance = newTargetBalance;
      updates.growthStartDate = new Date().toISOString();
      updates.manualAdjustment = 0;
      delete updates.overrideBalance;
    }

    if (updates.initialBalance !== undefined) {
      updates.initialBalance = Number(updates.initialBalance);
    }
    if (updates.dailyGrowthRate !== undefined) {
      updates.dailyGrowthRate = Number(updates.dailyGrowthRate);
    }

    const updated = updateUser(id, updates);
    const safeUser = { ...updated };
    delete safeUser.passwordHash;

    const userTxs = getTransactionsByUserId(id);
    const growthStart = updated.growthStartDate ? new Date(updated.growthStartDate).getTime() : 0;
    const approvedWithdrawals = userTxs
      .filter(t => t.type === 'WITHDRAWAL' && t.status === 'APPROVED' && new Date(t.createdAt).getTime() >= growthStart)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const wallet = calculateUserWallet(updated, approvedWithdrawals);

    return res.json({
      success: true,
      message: 'User profile and dashboard updated successfully',
      user: safeUser,
      wallet
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update user: ' + err.message });
  }
}

export async function removeUser(req, res) {
  try {
    const { id } = req.params;
    const existing = getUserById(id);
    if (!existing) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (existing.role === 'ADMIN') {
      return res.status(400).json({ error: 'Cannot delete system administrator' });
    }

    deleteUser(id);
    return res.json({ success: true, message: 'User account removed successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete user: ' + err.message });
  }
}

export async function fetchPlatformSettings(req, res) {
  try {
    const settings = getSettings();
    return res.json({ success: true, settings });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load settings: ' + err.message });
  }
}

export async function savePlatformSettings(req, res) {
  try {
    const updated = updateSettings(req.body);
    return res.json({ success: true, message: 'Platform settings saved successfully', settings: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save settings: ' + err.message });
  }
}

export async function fetchKycSubmissions(req, res) {
  try {
    const submissions = getAllKycSubmissions();
    return res.json({ success: true, submissions });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load KYC submissions: ' + err.message });
  }
}

export async function inspectUserDashboard(req, res) {
  try {
    const { id } = req.params;
    const user = getUserById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const userTxs = getTransactionsByUserId(id);
    const growthStart = updated.growthStartDate ? new Date(updated.growthStartDate).getTime() : 0;
    const approvedWithdrawals = userTxs
      .filter(t => t.type === 'WITHDRAWAL' && t.status === 'APPROVED' && new Date(t.createdAt).getTime() >= growthStart)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const wallet = calculateUserWallet(user, approvedWithdrawals);

    const safeUser = { ...user };
    delete safeUser.passwordHash;

    return res.json({
      success: true,
      user: safeUser,
      wallet,
      transactions: userTxs
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to inspect user: ' + err.message });
  }
}
