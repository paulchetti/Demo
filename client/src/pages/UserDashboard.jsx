import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  ShieldCheck,
  TrendingUp,
  Clock,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  FileCheck,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { DepositModal } from '../components/DepositModal';
import { WithdrawModal } from '../components/WithdrawModal';
import { BotActivity } from '../components/BotActivity';
import { TradingViewWidget } from '../components/TradingViewWidget';

export function UserDashboard() {
  const { user: authUser, wallet: authWallet, refreshProfile, impersonatedUser } = useAuth();

  // If Admin is impersonating a user, use impersonated user's data
  const user = impersonatedUser || authUser;
  const wallet = impersonatedUser ? impersonatedUser.wallet : authWallet;

  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [myTransactions, setMyTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, [user]);

  async function loadTransactions() {
    try {
      const token = localStorage.getItem('tt_token');
      if (impersonatedUser) {
        // Fetch specific impersonated user transactions
        const res = await fetch(`/api/admin/users/${impersonatedUser.id}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setMyTransactions(data.transactions || []);
        }
      } else {
        const res = await fetch('/api/transactions/my', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setMyTransactions(data.transactions || []);
        }
      }
    } catch (err) {
      console.error('Failed to load user transactions:', err);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await refreshProfile();
    await loadTransactions();
    setTimeout(() => setRefreshing(false), 600);
  }

  const isWeekend = wallet?.isWeekend;
  const currentBalance = wallet?.currentBalance || 0;
  const dailyRate = wallet?.dailyGrowthRate ?? 50;
  const todayProfit = wallet?.todayProfit || 0;

  return (
    <div style={{ maxWidth: '1380px', margin: '0 auto', padding: '30px 24px 80px' }}>
      {/* Dashboard Top Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff' }}>
              Welcome, {user?.fullName || user?.username}
            </h1>
            <span className="badge badge-cyan" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} /> KYC Verified
            </span>
          </div>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>
            Trading Trends Algorithmic Managed Capital Portfolio • Account ID: <code style={{ color: '#00f2fe' }}>{user?.id}</code>
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={handleRefresh}
          disabled={refreshing}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
        >
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Syncing...' : 'Sync Wallet'}
        </button>
      </div>

      {/* Main Highlights Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        marginBottom: '28px'
      }}>
        {/* Main Wallet Balance Card */}
        <div className="glass-panel glass-panel-glow" style={{ padding: '26px', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '120px',
            height: '120px',
            background: 'radial-gradient(circle, rgba(0, 242, 254, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Wallet Balance
              </span>
              <div style={{
                fontSize: '38px',
                fontWeight: 800,
                color: '#ffffff',
                fontFamily: 'JetBrains Mono',
                marginTop: '4px',
                display: 'flex',
                alignItems: 'baseline',
                gap: '8px'
              }}>
                ${currentBalance.toFixed(2)}
                <span style={{ fontSize: '16px', color: '#00e676', fontWeight: 600 }}>USD</span>
              </div>
            </div>

            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(0, 242, 254, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Wallet size={24} color="#00f2fe" />
            </div>
          </div>

          {/* Growth & Yield metrics row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            padding: '12px 14px',
            background: '#090d16',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            marginBottom: '20px'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>Today's P&L</div>
              <div style={{
                fontSize: '16px',
                fontWeight: 700,
                color: isWeekend ? '#ffb703' : '#00e676',
                fontFamily: 'JetBrains Mono'
              }}>
                {isWeekend ? '$0.00 (Weekend)' : `+$${todayProfit.toFixed(2)} USD`}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>Automated Compounding</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#00f2fe' }}>
                +${dailyRate.toFixed(2)}/day (Mon-Fri)
              </div>
            </div>
          </div>

          {/* Action Buttons: Deposit & Withdraw */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              className="btn btn-emerald"
              style={{ width: '100%', padding: '12px' }}
              onClick={() => setDepositOpen(true)}
            >
              <ArrowDownToLine size={18} /> Deposit
            </button>
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
              onClick={() => setWithdrawOpen(true)}
            >
              <ArrowUpFromLine size={18} /> Withdraw
            </button>
          </div>
        </div>

        {/* Growth & Yield Status Card */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase' }}>Growth Engine Schedule</span>
              <span className={`badge ${isWeekend ? 'badge-gold' : 'badge-emerald'}`}>
                {isWeekend ? 'Weekend Paused' : 'Active (Mon–Fri Growth)'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px 12px', background: '#090d16', borderRadius: '8px' }}>
                <span style={{ color: '#9ca3af' }}>Initial Deposited Capital:</span>
                <strong style={{ color: '#ffffff' }}>${(wallet?.initialBalance || 0).toFixed(2)} USD</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px 12px', background: '#090d16', borderRadius: '8px' }}>
                <span style={{ color: '#9ca3af' }}>Weekdays Active (Mon-Fri):</span>
                <strong style={{ color: '#00f2fe' }}>{wallet?.weekdaysElapsed || 0} business days</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px 12px', background: '#090d16', borderRadius: '8px' }}>
                <span style={{ color: '#9ca3af' }}>Accumulated Bot Yield:</span>
                <strong style={{ color: '#00e676' }}>+${(wallet?.calculatedGrowth || 0).toFixed(2)} USD</strong>
              </div>

              {wallet?.approvedWithdrawalsTotal > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px 12px', background: '#090d16', borderRadius: '8px' }}>
                  <span style={{ color: '#9ca3af' }}>Settled Withdrawals:</span>
                  <strong style={{ color: '#ff4757' }}>-${wallet.approvedWithdrawalsTotal.toFixed(2)} USD</strong>
                </div>
              )}
            </div>
          </div>

          <div style={{
            marginTop: '16px',
            padding: '10px 14px',
            background: 'rgba(0, 242, 254, 0.05)',
            border: '1px solid rgba(0, 242, 254, 0.15)',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#9ca3af',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Clock size={16} color="#00f2fe" style={{ flexShrink: 0 }} />
            <span>Next yield cycle credits on the upcoming business day at 00:00 UTC.</span>
          </div>
        </div>

        {/* User Profile & KYC Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase' }}>Verified KYC Profile</span>
            <span className="badge badge-cyan">Compliance Approved</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d1d5db' }}>
              <User size={15} color="#00f2fe" style={{ flexShrink: 0 }} />
              <span style={{ color: '#9ca3af', width: '70px' }}>Name:</span>
              <strong style={{ color: '#ffffff' }}>{user?.fullName || 'N/A'}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d1d5db' }}>
              <Mail size={15} color="#00f2fe" style={{ flexShrink: 0 }} />
              <span style={{ color: '#9ca3af', width: '70px' }}>Email:</span>
              <span>{user?.email || 'N/A'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d1d5db' }}>
              <Phone size={15} color="#00f2fe" style={{ flexShrink: 0 }} />
              <span style={{ color: '#9ca3af', width: '70px' }}>Phone:</span>
              <span>{user?.phone || 'N/A'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d1d5db' }}>
              <Calendar size={15} color="#00f2fe" style={{ flexShrink: 0 }} />
              <span style={{ color: '#9ca3af', width: '70px' }}>DOB:</span>
              <span>{user?.dob || 'N/A'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d1d5db' }}>
              <MapPin size={15} color="#00f2fe" style={{ flexShrink: 0 }} />
              <span style={{ color: '#9ca3af', width: '70px' }}>Address:</span>
              <span style={{ wordBreak: 'break-word' }}>{user?.address || 'N/A'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d1d5db' }}>
              <FileCheck size={15} color="#00e676" style={{ flexShrink: 0 }} />
              <span style={{ color: '#9ca3af', width: '70px' }}>Aadhaar:</span>
              <strong style={{ color: '#00e676', fontFamily: 'JetBrains Mono' }}>{user?.aadharNo || 'Verified'}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d1d5db' }}>
              <CreditCard size={15} color="#00e676" style={{ flexShrink: 0 }} />
              <span style={{ color: '#9ca3af', width: '70px' }}>PAN:</span>
              <strong style={{ color: '#00e676', fontFamily: 'JetBrains Mono' }}>{user?.panNo || 'Verified'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Bot Activity Engine Section */}
      <BotActivity isWeekend={isWeekend} />

      {/* Interactive Chart */}
      <TradingViewWidget />

      {/* Daily Growth History & Transactions Tabs */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>
          Portfolio History & Transactions
        </h4>

        {/* Transactions Table */}
        {myTransactions.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#00f2fe', marginBottom: '8px' }}>
              Deposits & Withdrawal Requests:
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#9ca3af' }}>
                    <th style={{ padding: '10px' }}>Type</th>
                    <th style={{ padding: '10px' }}>Amount</th>
                    <th style={{ padding: '10px' }}>Status</th>
                    <th style={{ padding: '10px' }}>Destination / Network</th>
                    <th style={{ padding: '10px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {myTransactions.map(tx => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '12px 10px', fontWeight: 600, color: tx.type === 'DEPOSIT' ? '#00e676' : '#ff4757' }}>
                        {tx.type}
                      </td>
                      <td style={{ padding: '12px 10px', fontFamily: 'JetBrains Mono', fontWeight: 700, color: '#ffffff' }}>
                        ${tx.amount.toFixed(2)} USD
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <span className={`badge ${
                          tx.status === 'APPROVED' ? 'badge-emerald' : tx.status === 'REJECTED' ? 'badge-rose' : 'badge-gold'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px', color: '#9ca3af', fontFamily: 'JetBrains Mono', fontSize: '12px' }}>
                        {tx.cryptoAddress || (tx.binanceId ? `Binance: ${tx.binanceId}` : tx.network)}
                      </td>
                      <td style={{ padding: '12px 10px', color: '#6b7280', fontSize: '12px' }}>
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Daily Mon-Fri Growth Statement */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#00e676', marginBottom: '8px' }}>
            Automated Daily Profit Timeline (Mon-Fri):
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#9ca3af' }}>
                  <th style={{ padding: '10px' }}>Date</th>
                  <th style={{ padding: '10px' }}>Day of Week</th>
                  <th style={{ padding: '10px' }}>Daily Yield</th>
                  <th style={{ padding: '10px' }}>End of Day Balance</th>
                  <th style={{ padding: '10px' }}>Activity Note</th>
                </tr>
              </thead>
              <tbody>
                {(wallet?.history || []).map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '10px', color: '#d1d5db', fontFamily: 'JetBrains Mono' }}>
                      {row.date}
                    </td>
                    <td style={{ padding: '10px', color: '#ffffff' }}>
                      {row.dayOfWeek}
                    </td>
                    <td style={{ padding: '10px', fontWeight: 700, fontFamily: 'JetBrains Mono', color: row.isWeekend ? '#9ca3af' : '#00e676' }}>
                      {row.growthAmount > 0 ? `+$${row.growthAmount}.00` : '$0.00'}
                    </td>
                    <td style={{ padding: '10px', fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#ffffff' }}>
                      ${row.balance.toFixed(2)} USD
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span className={`badge ${row.isWeekend ? 'badge-gold' : 'badge-cyan'}`} style={{ fontSize: '11px' }}>
                        {row.note}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DepositModal isOpen={depositOpen} onClose={() => setDepositOpen(false)} />
      <WithdrawModal isOpen={withdrawOpen} onClose={() => setWithdrawOpen(false)} />
    </div>
  );
}
