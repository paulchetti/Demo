import {
  createTransaction,
  getTransactionsByUserId,
  getTransactionById,
  getAllTransactions,
  updateTransaction,
  getUserById,
  updateUser,
  getSettings
} from '../database.js';
import { calculateUserWallet } from '../services/walletEngine.js';
import { sendWithdrawalRequestEmail } from '../services/emailService.js';

export async function requestWithdrawal(req, res) {
  try {
    const { amount, cryptoAddress, network, binanceId, note } = req.body;
    const user = getUserById(req.user.id);

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Please specify a valid withdrawal amount' });
    }

    if (!cryptoAddress && !binanceId) {
      return res.status(400).json({ error: 'Please provide either a Crypto Wallet Address or a Binance ID' });
    }

    // Check available balance
    const userTxs = getTransactionsByUserId(user.id);
    const approvedWithdrawals = userTxs
      .filter(t => t.type === 'WITHDRAWAL' && t.status === 'APPROVED')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const wallet = calculateUserWallet(user, approvedWithdrawals);

    const withdrawAmount = Number(amount);
    if (withdrawAmount > wallet.currentBalance) {
      return res.status(400).json({
        error: `Insufficient funds. Available balance: $${wallet.currentBalance.toFixed(2)} USD`
      });
    }

    const tx = createTransaction({
      userId: user.id,
      userName: user.fullName || user.username,
      userEmail: user.email,
      type: 'WITHDRAWAL',
      amount: withdrawAmount,
      cryptoAddress: cryptoAddress ? cryptoAddress.trim() : '',
      network: network || 'USDT (TRC-20)',
      binanceId: binanceId ? binanceId.trim() : '',
      status: 'PENDING',
      note: note || ''
    });

    // Send email alert to admin
    await sendWithdrawalRequestEmail({
      user,
      amount: withdrawAmount,
      cryptoAddress,
      network: network || 'USDT (TRC-20)',
      binanceId
    });

    return res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted! Our payments desk has received your request and will process the transfer shortly.',
      transaction: tx
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to process withdrawal request: ' + err.message });
  }
}

export async function submitDepositNotice(req, res) {
  try {
    const { amount, txHash, network, note } = req.body;
    const user = getUserById(req.user.id);

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Please enter a valid deposit amount' });
    }

    const tx = createTransaction({
      userId: user.id,
      userName: user.fullName || user.username,
      userEmail: user.email,
      type: 'DEPOSIT',
      amount: Number(amount),
      network: network || 'USDT (TRC-20)',
      txHash: txHash ? txHash.trim() : '',
      status: 'PENDING',
      note: note || ''
    });

    return res.status(201).json({
      success: true,
      message: 'Deposit notification logged. Funds will reflect in your wallet upon admin on-chain confirmation.',
      transaction: tx
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to log deposit notice: ' + err.message });
  }
}

export async function getMyTransactions(req, res) {
  try {
    const txs = getTransactionsByUserId(req.user.id);
    return res.json({ success: true, transactions: txs });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load transactions: ' + err.message });
  }
}

export async function listAllTransactionsAdmin(req, res) {
  try {
    const txs = getAllTransactions();
    return res.json({ success: true, transactions: txs });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load transactions: ' + err.message });
  }
}

export async function handleTransactionStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, note, newBalance } = req.body;

    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const tx = getTransactionById(id);
    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // When approving a DEPOSIT, credit the user's wallet
    if (status === 'APPROVED' && tx.type === 'DEPOSIT') {
      const user = getUserById(tx.userId);
      if (user) {
        let targetBalance;
        if (newBalance !== undefined && newBalance !== null && newBalance !== '') {
          targetBalance = Math.max(0, Number(newBalance));
        } else {
          targetBalance = (Number(user.initialBalance) || 0) + Number(tx.amount);
        }
        updateUser(user.id, {
          initialBalance: targetBalance,
          growthStartDate: new Date().toISOString(),
          manualAdjustment: 0
        });
      }
    }

    const updated = updateTransaction(id, {
      status,
      note: note !== undefined ? note : undefined
    });

    return res.json({
      success: true,
      message: `Transaction ${id} marked as ${status}`,
      transaction: updated
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update transaction status: ' + err.message });
  }
}

export async function getPublicDepositInfo(req, res) {
  try {
    const settings = getSettings();
    return res.json({
      success: true,
      depositInfo: {
        address: settings.depositUsdtAddress,
        network: settings.depositNetwork,
        qrCode: settings.depositQrCode,
        note: settings.depositNote
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load deposit info: ' + err.message });
  }
}
