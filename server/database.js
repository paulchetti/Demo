import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-Memory store cache for instant lookups
let memoryStore = null;
let mongoClient = null;
let mongoCollection = null;

const DEFAULT_SETTINGS = {
  depositUsdtAddress: 'TXyZ889KqN7W8B29LkJ5Q81HkMvPqS4eRt',
  depositNetwork: 'USDT (TRC-20)',
  depositQrCode: '',
  depositNote: 'Please deposit only USDT TRC-20 to this address. Sending any other currency or using another network may result in permanent loss. Contact support after transfer.',
  adminEmail: 'tradingtrendsbeta@gmail.com',
  smtpHost: '',
  smtpPort: 587,
  smtpUser: '',
  smtpPass: '',
  smtpSender: 'Trading Trends <no-reply@tradingtrends.com>',
  apkDownloadUrl: ''
};

export const DEFAULT_BOT_CONFIG = {
  status: 'ACTIVE', // 'ACTIVE' or 'PAUSED'
  dailyYield: '+3.0% / Day',
  winRate: '94.2%',
  schedule: 'Monday – Friday',
  riskProtocol: 'Capital Shielded'
};

export const DEFAULT_BOT_TRADES = [
  { id: 'trade-1', pair: 'BTC/USDT', type: 'LONG', entry: '64,280.50', exit: '64,810.00', profit: '+$18.40', time: '10 mins ago', status: 'CLOSED' },
  { id: 'trade-2', pair: 'ETH/USDT', type: 'LONG', entry: '3,490.20', exit: '3,522.80', profit: '+$14.20', time: '28 mins ago', status: 'CLOSED' },
  { id: 'trade-3', pair: 'SOL/USDT', type: 'LONG', entry: '152.10', exit: '154.90', profit: '+$17.40', time: '45 mins ago', status: 'CLOSED' },
  { id: 'trade-4', pair: 'BTC/USDT', type: 'SHORT', entry: '65,120.00', exit: '64,950.00', profit: '+$12.50', time: '2 hours ago', status: 'CLOSED' }
];

export async function initDatabase() {
  const localDb = readLocalDb();
  memoryStore = localDb;

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.log('ℹ️ Running in local JSON file database mode. (Set MONGODB_URI in Render to enable permanent MongoDB Atlas cloud persistence)');
    return;
  }

  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    mongoClient = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 10000
    });
    await mongoClient.connect();
    const db = mongoClient.db('TradingTrends');
    mongoCollection = db.collection('app_store');
    console.log('✅ Connected to MongoDB Atlas successfully!');

    const cloudData = await mongoCollection.findOne({ _id: 'main_store' });
    if (cloudData) {
      memoryStore = {
        users: cloudData.users || [],
        transactions: cloudData.transactions || [],
        kycSubmissions: cloudData.kycSubmissions || [],
        settings: { ...DEFAULT_SETTINGS, ...cloudData.settings },
        botConfig: { ...DEFAULT_BOT_CONFIG, ...cloudData.botConfig },
        botTrades: cloudData.botTrades || [...DEFAULT_BOT_TRADES],
        supportMessages: cloudData.supportMessages || []
      };
      writeLocalDb(memoryStore);
      console.log(`✅ MongoDB Sync: Loaded ${memoryStore.users.length} users, ${memoryStore.transactions.length} transactions, and ${memoryStore.botTrades.length} bot trades from cloud.`);
    } else {
      // First time connecting to MongoDB: seed cloud from local store.json
      await mongoCollection.updateOne(
        { _id: 'main_store' },
        { $set: memoryStore },
        { upsert: true }
      );
      console.log(`✅ Seeded MongoDB Atlas with initial data (${memoryStore.users.length} users) from store.json!`);
    }
  } catch (err) {
    console.error('⚠️ MongoDB connection error (using local store.json fallback):', err.message);
  }
}

function readLocalDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialDb = {
        users: [],
        transactions: [],
        kycSubmissions: [],
        settings: { ...DEFAULT_SETTINGS },
        botConfig: { ...DEFAULT_BOT_CONFIG },
        botTrades: [...DEFAULT_BOT_TRADES],
        supportMessages: []
      };
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
    const parsed = JSON.parse(raw);
    if (!parsed.botTrades || !Array.isArray(parsed.botTrades)) parsed.botTrades = [...DEFAULT_BOT_TRADES];
    if (!parsed.botConfig) parsed.botConfig = { ...DEFAULT_BOT_CONFIG };
    if (!parsed.supportMessages || !Array.isArray(parsed.supportMessages)) parsed.supportMessages = [];
    return parsed;
  } catch (err) {
    console.error('Error reading database file:', err);
    return {
      users: [],
      transactions: [],
      kycSubmissions: [],
      settings: { ...DEFAULT_SETTINGS },
      botConfig: { ...DEFAULT_BOT_CONFIG },
      botTrades: [...DEFAULT_BOT_TRADES],
      supportMessages: []
    };
  }
}

function writeLocalDb(data) {
  try {
    const tmpFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

function readDb() {
  if (memoryStore) return memoryStore;
  memoryStore = readLocalDb();
  return memoryStore;
}

function writeDb(data) {
  memoryStore = data;
  writeLocalDb(data);

  if (mongoCollection) {
    mongoCollection.updateOne(
      { _id: 'main_store' },
      { $set: data },
      { upsert: true }
    ).catch(err => console.error('MongoDB cloud sync error:', err.message));
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
    dailyGrowthRate: Number(userData.dailyGrowthRate) !== undefined ? Number(userData.dailyGrowthRate) : 3,
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

export function getTransactionById(id) {
  const db = readDb();
  return db.transactions.find(t => t.id === id);
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

// Bot Trades & Config Helpers
export function getBotData() {
  const db = readDb();
  return {
    config: db.botConfig || { ...DEFAULT_BOT_CONFIG },
    trades: db.botTrades || [...DEFAULT_BOT_TRADES]
  };
}

export function createBotTrade(tradeData) {
  const db = readDb();
  if (!db.botTrades) db.botTrades = [...DEFAULT_BOT_TRADES];
  const newTrade = {
    id: 'trade-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    pair: tradeData.pair || 'BTC/USDT',
    type: (tradeData.type || 'LONG').toUpperCase(),
    entry: tradeData.entry || '0.00',
    exit: tradeData.exit || '0.00',
    profit: tradeData.profit || '+$0.00',
    time: tradeData.time || 'Just now',
    status: tradeData.status || 'CLOSED',
    createdAt: new Date().toISOString()
  };
  db.botTrades.unshift(newTrade);
  writeDb(db);
  return newTrade;
}

export function deleteBotTrade(id) {
  const db = readDb();
  if (!db.botTrades) return false;
  const idx = db.botTrades.findIndex(t => t.id === id);
  if (idx === -1) return false;
  db.botTrades.splice(idx, 1);
  writeDb(db);
  return true;
}

export function updateBotConfig(updates) {
  const db = readDb();
  db.botConfig = {
    ...DEFAULT_BOT_CONFIG,
    ...db.botConfig,
    ...updates
  };
  writeDb(db);
  return db.botConfig;
}

// Support & Chatbot Helpers
export function getAllSupportMessages() {
  const db = readDb();
  if (!db.supportMessages) db.supportMessages = [];
  return db.supportMessages;
}

export function getSupportMessagesByUserId(userId) {
  const db = readDb();
  if (!db.supportMessages) db.supportMessages = [];
  return db.supportMessages.filter(m => m.userId === userId);
}

export function addSupportMessage({ userId, userName, userEmail, sender, text }) {
  const db = readDb();
  if (!db.supportMessages) db.supportMessages = [];
  const newMsg = {
    id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    userId,
    userName: userName || 'Trader',
    userEmail: userEmail || '',
    sender: sender || 'USER', // 'USER', 'ADMIN', 'BOT'
    text: (text || '').trim(),
    readByAdmin: sender === 'ADMIN',
    readByUser: sender === 'USER',
    createdAt: new Date().toISOString()
  };
  db.supportMessages.push(newMsg);
  writeDb(db);
  return newMsg;
}

export function markSupportMessagesRead(userId, readerRole) {
  const db = readDb();
  if (!db.supportMessages) db.supportMessages = [];
  let updated = false;
  db.supportMessages.forEach(m => {
    if (m.userId === userId) {
      if (readerRole === 'ADMIN' && !m.readByAdmin) {
        m.readByAdmin = true;
        updated = true;
      } else if (readerRole === 'USER' && !m.readByUser) {
        m.readByUser = true;
        updated = true;
      }
    }
  });
  if (updated) {
    writeDb(db);
  }
  return true;
}


