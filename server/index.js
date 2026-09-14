import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { login, getCurrentUser } from './controllers/authController.js';
import { uploadKycDocs, submitKyc } from './controllers/kycController.js';
import {
  listAllUsers,
  createNewUser,
  editUser,
  removeUser,
  inspectUserDashboard,
  fetchPlatformSettings,
  savePlatformSettings,
  fetchKycSubmissions
} from './controllers/adminController.js';
import {
  requestWithdrawal,
  submitDepositNotice,
  getMyTransactions,
  listAllTransactionsAdmin,
  handleTransactionStatus,
  getPublicDepositInfo
} from './controllers/transactionController.js';
import { authenticateToken, requireAdmin } from './middleware/auth.js';
import { getBotData, createBotTrade, deleteBotTrade, updateBotConfig, initDatabase } from './database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded KYC files (restricted in production or used for attachment preview)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'Trading Trends API Engine',
    timestamp: new Date().toISOString()
  });
});

// Public Deposit info
app.get('/api/deposit-info', getPublicDepositInfo);

// KYC Submission (Emails directly with Aadhaar + PAN attachments)
app.post('/api/kyc/submit', uploadKycDocs, submitKyc);

// Auth Routes
app.post('/api/auth/login', login);
app.get('/api/auth/me', authenticateToken, getCurrentUser);

// User Transaction Routes
app.post('/api/transactions/withdraw', authenticateToken, requestWithdrawal);
app.post('/api/transactions/deposit', authenticateToken, submitDepositNotice);
app.get('/api/transactions/my', authenticateToken, getMyTransactions);

// Admin Routes (Guarded by requireAdmin)
app.get('/api/admin/users', authenticateToken, requireAdmin, listAllUsers);
app.post('/api/admin/users', authenticateToken, requireAdmin, createNewUser);
app.put('/api/admin/users/:id', authenticateToken, requireAdmin, editUser);
app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, removeUser);
app.get('/api/admin/users/:id/dashboard', authenticateToken, requireAdmin, inspectUserDashboard);

app.get('/api/admin/transactions', authenticateToken, requireAdmin, listAllTransactionsAdmin);
app.put('/api/admin/transactions/:id/status', authenticateToken, requireAdmin, handleTransactionStatus);

app.get('/api/admin/kyc-submissions', authenticateToken, requireAdmin, fetchKycSubmissions);
app.get('/api/admin/settings', authenticateToken, requireAdmin, fetchPlatformSettings);
app.put('/api/admin/settings', authenticateToken, requireAdmin, savePlatformSettings);

// Alpha-V Bot Public & Admin Routes
app.get('/api/bot/data', (req, res) => {
  try {
    const data = getBotData();
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bot data: ' + err.message });
  }
});

app.post('/api/admin/bot/trades', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { pair, type, entry, exit, profit, time, status } = req.body;
    if (!pair || !entry) {
      return res.status(400).json({ error: 'Instrument pair and entry price are required' });
    }
    const trade = createBotTrade({ pair, type, entry, exit, profit, time, status });
    res.json({ success: true, trade });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create bot trade: ' + err.message });
  }
});

app.delete('/api/admin/bot/trades/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const deleted = deleteBotTrade(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Trade not found' });
    }
    res.json({ success: true, message: 'Bot trade removed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete bot trade: ' + err.message });
  }
});

app.put('/api/admin/bot/config', authenticateToken, requireAdmin, (req, res) => {
  try {
    const updated = updateBotConfig(req.body);
    res.json({ success: true, config: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update bot config: ' + err.message });
  }
});

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Trading Trends Backend running on http://localhost:${PORT}`);
    console.log(`🔑 Default Admin: admin / admin123`);
    console.log(`📈 Automated Mon-Fri $50/day growth engine initialized`);
    console.log(`====================================================`);
  });
}).catch(err => {
  console.error('Database initialization fatal error:', err);
  app.listen(PORT, () => {
    console.log(`🚀 Trading Trends running on http://localhost:${PORT}`);
  });
});
