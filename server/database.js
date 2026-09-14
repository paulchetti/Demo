import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_SETTINGS = {
  depositUsdtAddress: 'TXyZ889KqN7W8B29LkJ5Q81HkMvPqS4eRt',
  depositNetwork: 'USDT (TRC-20)',
  depositQrCode: '',
  depositNote: 'Please deposit only USDT TRC-20 to this address. Sending any other currency or using another network may result in permanent loss. Contact support after transfer.',
  adminEmail: 'chettipaul@gmail.com',
  smtpHost: '',
  smtpPort: 587,
  smtpUser: '',
  smtpPass: '',
  smtpSender: 'Trading Trends <no-reply@tradingtrends.com>'
};

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialDb = {
        users: [],
        transactions: [],
        kycSubmissions: [],
        settings: { ...DEFAULT_SETTINGS }
      };
      // Create initial default admin
      const salt = bcrypt.genSaltSync(10);
      const adminPasswordHash = bcrypt.hashSync('admin123', salt);
      initialDb.users.push({
        id: 'admin-001',
        username: 'admin',
        email: 'admin@tradingtrends.com',
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
        fullName: 'System Administrator',
        phone: '+1 (555) 019-2834',
        dob: '1985-01-01',
        address: 'HQ Financial District, New York, NY',
        aadharNo: 'N/A',
        panNo: 'N/A',
        initialBalance: 0,
        dailyGrowthRate: 0,
        growthStartDate: new Date().toISOString(),
        manualAdjustment: 0,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      });
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
      return initialDb;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database file:', err);
    return { users: [], transactions: [], kycSubmissions: [], settings: { ...DEFAULT_SETTINGS } };
  }
}

function writeDb(data) {
  try {
    const tmpFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

// User Helpers
export function getAllUsers() {
  const db = readDb();
  return db.users;
}

export function getUserById(id) {
  const db = readDb();
  return db.users.find(u => u.id === id);
}

export function getUserByEmailOrUsername(identifier) {
  const db = readDb();
  const lower = identifier.toLowerCase().trim();
  return db.users.find(u => u.email.toLowerCase() === lower || u.username.toLowerCase() === lower);
}

export function createUser(userData) {
  const db = readDb();
  const id = 'user-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(userData.password, salt);

  const newUser = {
    id,
    username: userData.username,
    email: userData.email,
    passwordHash,
    role: userData.role || 'USER',
    fullName: userData.fullName || '',
    phone: userData.phone || '',
    dob: userData.dob || '',
    address: userData.address || '',
    aadharNo: userData.aadharNo || '',
    panNo: userData.panNo || '',
    initialBalance: Number(userData.initialBalance) || 200,
    dailyGrowthRate: Number(userData.dailyGrowthRate) !== undefined ? Number(userData.dailyGrowthRate) : 50,
    growthStartDate: userData.growthStartDate || new Date().toISOString(),
    manualAdjustment: Number(userData.manualAdjustment) || 0,
    status: userData.status || 'ACTIVE',
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDb(db);
  return newUser;
}

export function updateUser(id, updates) {
  const db = readDb();
  const idx = db.users.findIndex(u => u.id === id);
  if (idx === -1) return null;

  if (updates.password) {
    const salt = bcrypt.genSaltSync(10);
    updates.passwordHash = bcrypt.hashSync(updates.password, salt);
    delete updates.password;
  }

  db.users[idx] = {
    ...db.users[idx],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  writeDb(db);
  return db.users[idx];
}

export function deleteUser(id) {
  const db = readDb();
  const idx = db.users.findIndex(u => u.id === id);
  if (idx === -1) return false;
  db.users.splice(idx, 1);
  writeDb(db);
  return true;
}

// Transaction Helpers
export function getAllTransactions() {
  const db = readDb();
  return db.transactions;
}

export function getTransactionsByUserId(userId) {
  const db = readDb();
  return db.transactions.filter(t => t.userId === userId);
}

export function createTransaction(txData) {
  const db = readDb();
  const newTx = {
    id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    userId: txData.userId,
    userName: txData.userName || '',
    userEmail: txData.userEmail || '',
    type: txData.type, // 'WITHDRAWAL', 'DEPOSIT', 'ADMIN_ADJUST'
    amount: Number(txData.amount) || 0,
    cryptoAddress: txData.cryptoAddress || '',
    network: txData.network || 'USDT (TRC-20)',
    binanceId: txData.binanceId || '',
    txHash: txData.txHash || '',
    status: txData.status || 'PENDING', // 'PENDING', 'APPROVED', 'REJECTED'
    note: txData.note || '',
    createdAt: new Date().toISOString()
  };

  db.transactions.unshift(newTx);
  writeDb(db);
  return newTx;
}

export function updateTransaction(id, updates) {
  const db = readDb();
  const idx = db.transactions.findIndex(t => t.id === id);
  if (idx === -1) return null;
  db.transactions[idx] = {
    ...db.transactions[idx],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  writeDb(db);
  return db.transactions[idx];
}

// Settings Helpers
export function getSettings() {
  const db = readDb();
  return db.settings || { ...DEFAULT_SETTINGS };
}

export function updateSettings(updates) {
  const db = readDb();
  db.settings = {
    ...DEFAULT_SETTINGS,
    ...db.settings,
    ...updates
  };
  writeDb(db);
  return db.settings;
}

// KYC Submissions
export function addKycSubmission(submission) {
  const db = readDb();
  if (!db.kycSubmissions) db.kycSubmissions = [];
  const entry = {
    id: 'kyc-' + Date.now(),
    ...submission,
    submittedAt: new Date().toISOString()
  };
  db.kycSubmissions.unshift(entry);
  writeDb(db);
  return entry;
}

export function getAllKycSubmissions() {
  const db = readDb();
  return db.kycSubmissions || [];
}
