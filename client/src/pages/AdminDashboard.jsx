import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../apiConfig.js';
import {
  Users,
  UserPlus,
  Edit3,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpFromLine,
  ArrowDownToLine,
  Settings,
  Shield,
  Search,
  FileText,
  Mail,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Sliders,
  ExternalLink,
  Cpu,
  Plus,
  TrendingUp,
  Download,
  X,
  MessageSquare,
  Send,
  Bot,
  UserCheck,
  CornerDownRight,
  Sparkles
} from 'lucide-react';

export function AdminDashboard() {
  const { setImpersonatedUser, setActiveView } = useAuth();
  const [activeTab, setActiveTab] = useState('USERS'); // 'USERS', 'KYC', 'TRANSACTIONS', 'SETTINGS'
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [kycSubmissions, setKycSubmissions] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositToApprove, setDepositToApprove] = useState(null);
  const [depositForm, setDepositForm] = useState({ newBalance: '', note: '', mode: 'INITIAL' });

  // Support Desk state
  const [supportConversations, setSupportConversations] = useState([]);
  const [totalSupportUnread, setTotalSupportUnread] = useState(0);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [adminReplySending, setAdminReplySending] = useState(false);
  const [supportSearchQuery, setSupportSearchQuery] = useState('');

  // New user form state
  const [newUserForm, setNewUserForm] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
    phone: '',
    dob: '',
    address: '',
    aadharNo: '',
    panNo: '',
    initialBalance: 200,
    dailyGrowthRate: 3,
    status: 'ACTIVE',
    sendEmailToUser: true
  });

  // Edit user form state
  const [editUserForm, setEditUserForm] = useState({});

  // Alpha-V Bot Trades & Metrics State
  const [botTrades, setBotTrades] = useState([]);
  const [botConfig, setBotConfig] = useState({
    status: 'ACTIVE',
    dailyYield: '+3.0% / Day',
    winRate: '94.2%',
    schedule: 'Monday – Friday',
    riskProtocol: 'Capital Shielded'
  });
  const [newTradeForm, setNewTradeForm] = useState({
    pair: 'BTC/USDT',
    type: 'LONG',
    entry: '',
    exit: '',
    profit: '+$',
    time: 'Just now',
    status: 'CLOSED'
  });
  const [tradePosting, setTradePosting] = useState(false);
  const [botConfigSaving, setBotConfigSaving] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    const token = localStorage.getItem('tt_token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [usersRes, txsRes, kycRes, settingsRes, botRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/users`, { headers }),
        fetch(`${API_BASE}/api/admin/transactions`, { headers }),
        fetch(`${API_BASE}/api/admin/kyc-submissions`, { headers }),
        fetch(`${API_BASE}/api/admin/settings`, { headers }),
        fetch(`${API_BASE}/api/bot/data`)
      ]);

      const [usersData, txsData, kycData, settingsData, botData] = await Promise.all([
        usersRes.json(),
        txsRes.json(),
        kycRes.json(),
        settingsRes.json(),
        botRes.json()
      ]);

      if (usersData.success) setUsers(usersData.users);
      if (txsData.success) setTransactions(txsData.transactions);
      if (kycData.success) setKycSubmissions(kycData.submissions);
      if (settingsData.success) setSettings(settingsData.settings);
      if (botData.success) {
        if (botData.trades) setBotTrades(botData.trades);
        if (botData.config) setBotConfig(botData.config);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  }

  // Support Desk data loader
  async function fetchSupportData() {
    const token = localStorage.getItem('tt_token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/support/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSupportConversations(data.conversations || []);
        setTotalSupportUnread(data.totalUnread || 0);

        // Auto-select first conversation if none selected
        setSelectedConversationId(current => {
          if (current && data.conversations.some(c => c.userId === current)) {
            return current;
          }
          return data.conversations.length > 0 ? data.conversations[0].userId : null;
        });
      }
    } catch (err) {
      console.error('Error fetching support conversations:', err);
    }
  }

  // Poll support conversations every 3.5 seconds
  useEffect(() => {
    fetchSupportData();
    const interval = setInterval(fetchSupportData, 3500);
    return () => clearInterval(interval);
  }, []);

  async function handleSelectConversation(convId) {
    setSelectedConversationId(convId);
    const token = localStorage.getItem('tt_token');

    try {
      await fetch(`${API_BASE}/api/admin/support/read/${convId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });

      // Optimistically mark as read
      setSupportConversations(prev =>
        prev.map(c => {
          if (c.userId === convId) {
            return {
              ...c,
              unreadCount: 0,
              messages: c.messages.map(m => ({ ...m, readByAdmin: true }))
            };
          }
          return c;
        })
      );
      setTotalSupportUnread(prev => Math.max(0, prev - (supportConversations.find(c => c.userId === convId)?.unreadCount || 0)));
    } catch (err) {
      console.error('Error marking conversation read:', err);
    }
  }

  async function handleSendAdminReply(e, predefinedText) {
    if (e) e.preventDefault();
    const textToSend = (predefinedText || adminReplyText).trim();
    if (!textToSend || !selectedConversationId || adminReplySending) return;

    setAdminReplySending(true);
    const token = localStorage.getItem('tt_token');

    try {
      const res = await fetch(`${API_BASE}/api/admin/support/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedConversationId,
          text: textToSend
        })
      });

      const data = await res.json();
      if (data.success) {
        setAdminReplyText('');
        // Update current conversation
        setSupportConversations(prev =>
          prev.map(c => {
            if (c.userId === selectedConversationId) {
              return {
                ...c,
                messages: [...c.messages, data.message],
                lastMessage: data.message
              };
            }
            return c;
          })
        );
      } else {
        alert(data.error || 'Failed to send reply');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setAdminReplySending(false);
    }
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    const token = localStorage.getItem('tt_token');

    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newUserForm)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');

      alert(`User ${newUserForm.username} created successfully! Recent Deposited Capital: $${newUserForm.initialBalance} USD`);
      setCreateUserModalOpen(false);
      // Reset form
      setNewUserForm({
        username: '',
        password: '',
        email: '',
        fullName: '',
        phone: '',
        dob: '',
        address: '',
        aadharNo: '',
        panNo: '',
        initialBalance: 200,
        dailyGrowthRate: 3,
        status: 'ACTIVE',
        sendEmailToUser: true
      });
      loadAllData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  function openEditUser(user) {
    setSelectedUser(user);
    setEditUserForm({
      fullName: user.fullName || '',
      email: user.email || '',
      username: user.username || '',
      phone: user.phone || '',
      dob: user.dob || '',
      address: user.address || '',
      aadharNo: user.aadharNo || '',
      panNo: user.panNo || '',
      password: '', // leave empty if not changing
      status: user.status || 'ACTIVE',
      dailyGrowthRate: user.dailyGrowthRate ?? 3,
      overrideBalance: user.wallet?.currentBalance || user.initialBalance
    });
    setEditUserModalOpen(true);
  }

  async function handleSaveEditUser(e) {
    e.preventDefault();
    const token = localStorage.getItem('tt_token');

    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editUserForm)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user');

      alert('User dashboard updated successfully!');
      setEditUserModalOpen(false);
      loadAllData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  async function handleDeleteUser(user) {
    if (!window.confirm(`Are you sure you want to delete user account "${user.username}"?`)) return;
    const token = localStorage.getItem('tt_token');

    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      loadAllData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  async function handleTransactionAction(txId, status, extra = {}) {
    const token = localStorage.getItem('tt_token');
    try {
      const res = await fetch(`${API_BASE}/api/admin/transactions/${txId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, ...extra })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      loadAllData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  function handleOpenApproveDeposit(tx) {
    const targetUser = users.find(u => u.id === tx.userId);
    const initialBal = Number(targetUser?.initialBalance) || 0;
    const currentBal = Number(targetUser?.wallet?.currentBalance || targetUser?.initialBalance) || 0;
    const depositAmt = Number(tx.amount) || 0;

    setDepositToApprove({ ...tx, user: targetUser, initialBal, currentBal, depositAmt });
    setDepositForm({
      newBalance: Math.round((initialBal + depositAmt) * 100) / 100,
      note: `Deposit of $${depositAmt.toFixed(2)} USD verified and credited.`,
      mode: 'INITIAL'
    });
    setDepositModalOpen(true);
  }

  async function handleConfirmApproveDeposit(e) {
    e.preventDefault();
    if (!depositToApprove) return;
    await handleTransactionAction(depositToApprove.id, 'APPROVED', {
      newBalance: Number(depositForm.newBalance),
      note: depositForm.note
    });
    setDepositModalOpen(false);
    setDepositToApprove(null);
  }

  async function handleSaveSettings(e) {
    e.preventDefault();
    const token = localStorage.getItem('tt_token');
    try {
      const res = await fetch(`${API_BASE}/api/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert('Platform settings saved successfully!');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  async function handleCreateBotTrade(e) {
    e.preventDefault();
    if (!newTradeForm.pair || !newTradeForm.entry) {
      alert('Instrument pair and entry price are required');
      return;
    }
    setTradePosting(true);
    const token = localStorage.getItem('tt_token');
    try {
      const res = await fetch(`${API_BASE}/api/admin/bot/trades`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newTradeForm)
      });
      const data = await res.json();
      if (data.success) {
        setBotTrades([data.trade, ...botTrades]);
        setNewTradeForm({
          pair: 'BTC/USDT',
          type: 'LONG',
          entry: '',
          exit: '',
          profit: '+$',
          time: 'Just now',
          status: 'CLOSED'
        });
        alert('Bot trade successfully broadcasted to all user dashboards!');
      } else {
        alert(data.error || 'Failed to broadcast trade');
      }
    } catch (err) {
      alert('Error broadcasting trade: ' + err.message);
    } finally {
      setTradePosting(false);
    }
  }

  async function handleDeleteBotTrade(tradeId) {
    if (!confirm('Are you sure you want to remove this trade execution from the live ledger?')) return;
    const token = localStorage.getItem('tt_token');
    try {
      const res = await fetch(`${API_BASE}/api/admin/bot/trades/${tradeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setBotTrades(botTrades.filter(t => t.id !== tradeId));
      } else {
        alert(data.error || 'Failed to delete trade');
      }
    } catch (err) {
      alert('Error deleting trade: ' + err.message);
    }
  }

  async function handleSaveBotConfig(e) {
    e.preventDefault();
    setBotConfigSaving(true);
    const token = localStorage.getItem('tt_token');
    try {
      const res = await fetch(`${API_BASE}/api/admin/bot/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(botConfig)
      });
      const data = await res.json();
      if (data.success) {
        alert('Bot display metrics saved successfully across all user dashboards!');
      } else {
        alert(data.error || 'Failed to update bot settings');
      }
    } catch (err) {
      alert('Error updating bot metrics: ' + err.message);
    } finally {
      setBotConfigSaving(false);
    }
  }

  function handleApproveKycToNewUser(sub) {
    setNewUserForm({
      username: sub.name.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 100),
      password: 'TT-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '!',
      email: sub.email,
      fullName: sub.name,
      phone: sub.phone,
      dob: sub.dob,
      address: sub.address,
      aadharNo: sub.aadhar,
      panNo: sub.pan,
      initialBalance: 200,
      dailyGrowthRate: 3,
      status: 'ACTIVE',
      sendEmailToUser: true
    });
    setCreateUserModalOpen(true);
  }

  function handleImpersonate(user) {
    setImpersonatedUser(user);
    setActiveView('USER_DASHBOARD');
  }

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      {/* Admin Top Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            minWidth: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #ffb703 0%, #fb8500 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(255, 183, 3, 0.3)'
          }}>
            <Shield size={24} color="#050b14" />
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
              Trading Trends Super-Admin Portal
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>
              Full Control Management: Onboarding, Wallet Compounding, Deposits, and Payout Approvals
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            onClick={loadAllData}
            style={{ fontSize: '13px' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Data
          </button>
          <a
            href={`${API_BASE}/api/download/apk`}
            target="_blank"
            rel="noopener noreferrer"
            download="TradingTrends.apk"
            className="btn btn-secondary"
            style={{
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
              color: '#00f2fe',
              borderColor: 'rgba(0, 242, 254, 0.35)',
              background: 'rgba(0, 242, 254, 0.08)'
            }}
          >
            <Download size={14} /> Download APK
          </a>
          <button
            className="btn btn-primary"
            onClick={() => setCreateUserModalOpen(true)}
            style={{ fontSize: '13px' }}
          >
            <UserPlus size={16} /> Create New User Account
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="responsive-tabs-bar" style={{ marginBottom: '24px' }}>
        {[
          { id: 'USERS', label: `Registered Users (${users.length})`, icon: Users },
          { id: 'SUPPORT', label: `Support Desk${totalSupportUnread > 0 ? ` (${totalSupportUnread} New)` : ''}`, icon: MessageSquare, unread: totalSupportUnread },
          { id: 'KYC', label: `KYC Inquiries (${kycSubmissions.length})`, icon: FileText },
          { id: 'TRANSACTIONS', label: `Withdrawals & Deposits (${transactions.filter(t => t.status === 'PENDING').length} Pending)`, icon: ArrowUpFromLine },
          { id: 'BOT_TRADES', label: `Alpha-V Bot Trades (${botTrades.length})`, icon: Cpu },
          { id: 'SETTINGS', label: 'Platform & Deposit Settings', icon: Settings }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #00f2fe' : '2px solid transparent',
                color: isActive ? '#00f2fe' : tab.unread > 0 ? '#ff0055' : '#9ca3af',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.2s'
              }}
            >
              <Icon size={16} />
              {tab.label}
              {tab.unread > 0 && (
                <span
                  style={{
                    marginLeft: '4px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#ff0055',
                    display: 'inline-block',
                    boxShadow: '0 0 6px #ff0055'
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: USERS */}
      {activeTab === 'USERS' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ position: 'relative', width: '320px' }}>
              <input
                type="text"
                placeholder="Search by name, email or username..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '36px', fontSize: '13px' }}
              />
              <Search size={16} color="#6b7280" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>

            <div style={{ fontSize: '13px', color: '#9ca3af' }}>
              Total Traders: <strong style={{ color: '#00f2fe' }}>{users.filter(u => u.role !== 'ADMIN').length}</strong>
            </div>
          </div>

          <div className="table-responsive-container">
            <table style={{ width: '100%', minWidth: '820px', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#9ca3af' }}>
                  <th style={{ padding: '12px 10px' }}>User Details</th>
                  <th style={{ padding: '12px 10px' }}>Current Balance</th>
                  <th style={{ padding: '12px 10px' }}>Recent Deposited Capital ($200+ Min)</th>
                  <th style={{ padding: '12px 10px' }}>Daily Rate (% / Mon-Fri)</th>
                  <th style={{ padding: '12px 10px' }}>KYC Aadhaar & PAN</th>
                  <th style={{ padding: '12px 10px' }}>Status</th>
                  <th style={{ padding: '12px 10px', textAlign: 'right' }}>Admin Controls</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => {
                  const isAdmin = u.role === 'ADMIN';
                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '12px 10px' }}>
                        <div style={{ fontWeight: 700, color: '#ffffff' }}>{u.fullName || u.username}</div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                          @{u.username} • <span style={{ color: '#58a6ff' }}>{u.email}</span>
                        </div>
                        {u.phone && <div style={{ fontSize: '11px', color: '#6b7280' }}>{u.phone}</div>}
                      </td>

                      <td style={{ padding: '12px 10px', fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: '15px', color: '#00e676' }}>
                        ${(u.wallet?.currentBalance || u.initialBalance || 0).toFixed(2)} USD
                      </td>

                      <td style={{ padding: '12px 10px', fontFamily: 'JetBrains Mono', color: '#ffd700' }}>
                        ${(u.initialBalance || 0).toFixed(2)} USD
                      </td>

                      <td style={{ padding: '12px 10px', fontFamily: 'JetBrains Mono', color: '#00f2fe' }}>
                        +{u.dailyGrowthRate ?? 3}%/day
                      </td>

                      <td style={{ padding: '12px 10px', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>
                        <div style={{ color: '#d1d5db' }}>Aadhaar: {u.aadharNo || 'N/A'}</div>
                        <div style={{ color: '#d1d5db' }}>PAN: {u.panNo || 'N/A'}</div>
                      </td>

                      <td style={{ padding: '12px 10px' }}>
                        <span className={`badge ${u.status === 'ACTIVE' ? 'badge-emerald' : 'badge-rose'}`}>
                          {u.status}
                        </span>
                      </td>

                      <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          {!isAdmin && (
                            <button
                              onClick={() => handleImpersonate(u)}
                              className="btn btn-secondary"
                              style={{ padding: '6px 10px', fontSize: '11px', color: '#00f2fe' }}
                              title="View Dashboard as this user"
                            >
                              <Eye size={13} /> View as User
                            </button>
                          )}

                          <button
                            onClick={() => openEditUser(u)}
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '11px' }}
                            title="Edit details & balance"
                          >
                            <Edit3 size={13} /> Edit
                          </button>

                          {!isAdmin && (
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="btn btn-danger"
                              style={{ padding: '6px 10px', fontSize: '11px' }}
                              title="Remove user"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: KYC INQUIRIES */}
      {activeTab === 'KYC' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
              Submitted KYC Inquiries & Document Uploads
            </h3>
            <p style={{ fontSize: '13px', color: '#9ca3af' }}>
              These applications were submitted via the landing page. Click "Create User Account" to automatically pre-fill verified credentials and issue login details.
            </p>
          </div>

          {kycSubmissions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              No KYC applications received yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {kycSubmissions.map(sub => (
                <div
                  key={sub.id}
                  style={{
                    background: '#090d16',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '18px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '16px', color: '#ffffff' }}>{sub.name}</strong>
                      <span className="badge badge-gold" style={{ fontSize: '10px' }}>Pending Provisioning</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#58a6ff', marginBottom: '6px' }}>
                      {sub.email} • {sub.phone}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af', lineHeight: '1.5' }}>
                      DOB: <strong style={{ color: '#d1d5db' }}>{sub.dob}</strong> | Address: {sub.address}
                    </div>
                    <div style={{ fontSize: '12px', color: '#00e676', marginTop: '4px', fontFamily: 'JetBrains Mono' }}>
                      Aadhaar: {sub.aadhar} | PAN: {sub.pan}
                    </div>
                    {sub.files && sub.files.length > 0 && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        {sub.files.map((f, i) => (
                          <a
                            key={i}
                            href={`${API_BASE}/uploads/${f.filename}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: '11px',
                              color: '#00f2fe',
                              textDecoration: 'underline',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <ExternalLink size={12} /> {f.label || f.originalname || 'Attached Document'}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleApproveKycToNewUser(sub)}
                      style={{ fontSize: '13px', padding: '10px 16px' }}
                    >
                      <UserPlus size={15} /> Create User Account
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TRANSACTIONS & WITHDRAWALS */}
      {activeTab === 'TRANSACTIONS' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
              Withdrawal & Deposit Requests
            </h3>
            <p style={{ fontSize: '13px', color: '#9ca3af' }}>
              Approve user withdrawals once crypto transfer is sent, or confirm deposits.
            </p>
          </div>

          <div className="table-responsive-container">
            <table style={{ width: '100%', minWidth: '780px', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#9ca3af' }}>
                  <th style={{ padding: '12px 10px' }}>User</th>
                  <th style={{ padding: '12px 10px' }}>Type</th>
                  <th style={{ padding: '12px 10px' }}>Amount</th>
                  <th style={{ padding: '12px 10px' }}>Payout Destination</th>
                  <th style={{ padding: '12px 10px' }}>Status</th>
                  <th style={{ padding: '12px 10px' }}>Date</th>
                  <th style={{ padding: '12px 10px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '12px 10px' }}>
                      <div style={{ fontWeight: 600, color: '#ffffff' }}>{tx.userName}</div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>{tx.userEmail}</div>
                    </td>

                    <td style={{ padding: '12px 10px', fontWeight: 700, color: tx.type === 'DEPOSIT' ? '#00e676' : '#ff4757' }}>
                      {tx.type}
                    </td>

                    <td style={{ padding: '12px 10px', fontFamily: 'JetBrains Mono', fontWeight: 800, color: '#ffd700' }}>
                      ${tx.amount.toFixed(2)} USD
                    </td>

                    <td style={{ padding: '12px 10px', fontFamily: 'JetBrains Mono', fontSize: '12px' }}>
                      <div style={{ color: '#00f2fe' }}>{tx.cryptoAddress || (tx.binanceId ? `Binance ID: ${tx.binanceId}` : 'N/A')}</div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>Network: {tx.network}</div>
                    </td>

                    <td style={{ padding: '12px 10px' }}>
                      <span className={`badge ${
                        tx.status === 'APPROVED' ? 'badge-emerald' : tx.status === 'REJECTED' ? 'badge-rose' : 'badge-gold'
                      }`}>
                        {tx.status}
                      </span>
                    </td>

                    <td style={{ padding: '12px 10px', color: '#6b7280', fontSize: '12px' }}>
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>

                    <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                      {tx.status === 'PENDING' ? (
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => {
                              if (tx.type === 'DEPOSIT') {
                                handleOpenApproveDeposit(tx);
                              } else {
                                handleTransactionAction(tx.id, 'APPROVED');
                              }
                            }}
                            className="btn btn-emerald"
                            style={{ padding: '6px 12px', fontSize: '11px' }}
                          >
                            <CheckCircle size={13} /> Approve
                          </button>
                          <button
                            onClick={() => handleTransactionAction(tx.id, 'REJECTED')}
                            className="btn btn-danger"
                            style={{ padding: '6px 12px', fontSize: '11px' }}
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#6b7280' }}>Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SETTINGS */}
      {activeTab === 'SETTINGS' && (
        <div className="glass-panel" style={{ padding: '24px', maxWidth: '720px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>
            Platform Deposit & Email Settings
          </h3>

          <form onSubmit={handleSaveSettings}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>
                Platform Deposit USDT Address
              </label>
              <input
                type="text"
                value={settings.depositUsdtAddress || ''}
                onChange={e => setSettings({ ...settings, depositUsdtAddress: e.target.value })}
                className="input-field"
                style={{ fontFamily: 'JetBrains Mono' }}
                required
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>
                Deposit Network Label
              </label>
              <input
                type="text"
                value={settings.depositNetwork || ''}
                onChange={e => setSettings({ ...settings, depositNetwork: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>
                Deposit Instructions Custom Note (Shown to users inside Deposit modal)
              </label>
              <textarea
                rows={3}
                value={settings.depositNote || ''}
                onChange={e => setSettings({ ...settings, depositNote: e.target.value })}
                className="input-field"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>
                Android APK Download Direct URL (Optional: Google Drive, S3, or direct CDN link)
              </label>
              <input
                type="url"
                placeholder="https://... or leave empty to serve local TradingTrends.apk"
                value={settings.apkDownloadUrl || ''}
                onChange={e => setSettings({ ...settings, apkDownloadUrl: e.target.value })}
                className="input-field"
              />
            </div>

            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', margin: '20px 0', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '15px', color: '#ffffff', marginBottom: '12px' }}>
                Admin Email Alerts & SMTP Config
              </h4>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>
                  Admin Recipient Email (Receives KYC & Withdrawals)
                </label>
                <input
                  type="email"
                  value={settings.adminEmail || ''}
                  onChange={e => setSettings({ ...settings, adminEmail: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div className="responsive-form-grid" style={{ marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>
                    SMTP Host (e.g. smtp.gmail.com)
                  </label>
                  <input
                    type="text"
                    value={settings.smtpHost || ''}
                    onChange={e => setSettings({ ...settings, smtpHost: e.target.value })}
                    className="input-field"
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>
                    Port
                  </label>
                  <input
                    type="number"
                    value={settings.smtpPort || 587}
                    onChange={e => setSettings({ ...settings, smtpPort: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="responsive-form-grid" style={{ marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>
                    SMTP Username / Email
                  </label>
                  <input
                    type="text"
                    value={settings.smtpUser || ''}
                    onChange={e => setSettings({ ...settings, smtpUser: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>
                    SMTP App Password
                  </label>
                  <input
                    type="password"
                    value={settings.smtpPass || ''}
                    onChange={e => setSettings({ ...settings, smtpPass: e.target.value })}
                    className="input-field"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>
              Save Platform Settings
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: ALPHA-V BOT CONTROL & TRADES */}
      {activeTab === 'BOT_TRADES' && (
        <div>
          {/* Card 1: Form to Broadcast New Trade */}
          <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(0, 242, 254, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Cpu size={22} color="#00f2fe" />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                  Broadcast New Algorithmic Trade
                </h3>
                <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                  Admin trade broadcaster: Add instrument (BTC/USDT, XAUUSD, etc.), side (LONG/SHORT), entry price, exit price, and profit. Instantly shows on every user dashboard.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateBotTrade}>
              {/* Quick Select Instrument Pills */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '6px' }}>
                  Quick-Select Instrument:
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XAUUSD', 'EUR/USD', 'GBP/USD', 'BNB/USDT', 'NDX100'].map(sym => (
                    <button
                      type="button"
                      key={sym}
                      onClick={() => setNewTradeForm({ ...newTradeForm, pair: sym })}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontFamily: 'JetBrains Mono',
                        border: newTradeForm.pair === sym ? '1px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.1)',
                        background: newTradeForm.pair === sym ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        color: newTradeForm.pair === sym ? '#00f2fe' : '#d1d5db',
                        cursor: 'pointer'
                      }}
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#ffffff', marginBottom: '4px' }}>
                    Instrument / Pair *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BTC/USDT or XAUUSD"
                    value={newTradeForm.pair}
                    onChange={e => setNewTradeForm({ ...newTradeForm, pair: e.target.value.toUpperCase() })}
                    className="input-field"
                    style={{ fontFamily: 'JetBrains Mono' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#ffffff', marginBottom: '4px' }}>
                    Trade Type / Position Side *
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setNewTradeForm({ ...newTradeForm, type: 'LONG' })}
                      style={{
                        flex: 1,
                        padding: '9px',
                        borderRadius: '8px',
                        border: newTradeForm.type === 'LONG' ? '1px solid #00e676' : '1px solid rgba(255, 255, 255, 0.1)',
                        background: newTradeForm.type === 'LONG' ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        color: newTradeForm.type === 'LONG' ? '#00e676' : '#9ca3af',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      🟢 LONG (BUY)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTradeForm({ ...newTradeForm, type: 'SHORT' })}
                      style={{
                        flex: 1,
                        padding: '9px',
                        borderRadius: '8px',
                        border: newTradeForm.type === 'SHORT' ? '1px solid #ff3366' : '1px solid rgba(255, 255, 255, 0.1)',
                        background: newTradeForm.type === 'SHORT' ? 'rgba(255, 51, 102, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        color: newTradeForm.type === 'SHORT' ? '#ff3366' : '#9ca3af',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      🔴 SHORT (SELL)
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#ffffff', marginBottom: '4px' }}>
                    Opened / Entry Price ($) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 64,280.50 or 2,345.20"
                    value={newTradeForm.entry}
                    onChange={e => setNewTradeForm({ ...newTradeForm, entry: e.target.value })}
                    className="input-field"
                    style={{ fontFamily: 'JetBrains Mono' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#ffffff', marginBottom: '4px' }}>
                    Closed / Exit Price ($)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 64,810.00 or 2,360.50"
                    value={newTradeForm.exit}
                    onChange={e => setNewTradeForm({ ...newTradeForm, exit: e.target.value })}
                    className="input-field"
                    style={{ fontFamily: 'JetBrains Mono' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#ffffff', marginBottom: '4px' }}>
                    Profit / PnL Realized *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +$18.40 or +$24.50"
                    value={newTradeForm.profit}
                    onChange={e => setNewTradeForm({ ...newTradeForm, profit: e.target.value })}
                    className="input-field"
                    style={{ fontFamily: 'JetBrains Mono', color: '#00e676', fontWeight: 700 }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#ffffff', marginBottom: '4px' }}>
                    Time Tag (Display Label) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Just now, 10 mins ago, 1 hour ago"
                    value={newTradeForm.time}
                    onChange={e => setNewTradeForm({ ...newTradeForm, time: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#ffffff', marginBottom: '4px' }}>
                    Execution Status
                  </label>
                  <select
                    value={newTradeForm.status}
                    onChange={e => setNewTradeForm({ ...newTradeForm, status: e.target.value })}
                    className="input-field"
                  >
                    <option value="CLOSED">CLOSED (Take Profit)</option>
                    <option value="OPEN">OPEN (Active Position)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={tradePosting}
                style={{ padding: '12px 24px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Cpu size={16} /> {tradePosting ? 'Broadcasting...' : 'Broadcast Trade to All User Dashboards'}
              </button>
            </form>
          </div>

          {/* Card 2: Current Live Bot Ledger Table */}
          <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
                  Live Trades Displayed on User Dashboards ({botTrades.length})
                </h4>
                <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                  Real-time list. Any trade deleted here will disappear from user screens instantly.
                </p>
              </div>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Instrument / Pair</th>
                    <th>Open (Entry)</th>
                    <th>Close (Exit)</th>
                    <th>Profit (PnL)</th>
                    <th>Time Display</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {botTrades.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '28px', color: '#6b7280' }}>
                        No bot trades in registry. Use the form above to add your first trade execution!
                      </td>
                    </tr>
                  ) : (
                    botTrades.map(trade => {
                      const isLong = (trade.type || 'LONG').toUpperCase() === 'LONG';
                      return (
                        <tr key={trade.id}>
                          <td>
                            <span className={`badge ${isLong ? 'badge-emerald' : 'badge-rose'}`}>
                              {trade.type}
                            </span>
                          </td>
                          <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: '#ffffff' }}>
                            {trade.pair}
                          </td>
                          <td style={{ fontFamily: 'JetBrains Mono', color: '#9ca3af' }}>
                            ${trade.entry}
                          </td>
                          <td style={{ fontFamily: 'JetBrains Mono', color: '#9ca3af' }}>
                            {trade.exit ? `$${trade.exit}` : '—'}
                          </td>
                          <td style={{ fontFamily: 'JetBrains Mono', color: '#00e676', fontWeight: 700 }}>
                            {trade.profit}
                          </td>
                          <td style={{ color: '#9ca3af', fontSize: '12px' }}>
                            {trade.time}
                          </td>
                          <td>
                            <span className="badge badge-emerald" style={{ fontSize: '10px' }}>
                              {trade.status || 'CLOSED'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className="btn btn-secondary"
                              onClick={() => handleDeleteBotTrade(trade.id)}
                              style={{ padding: '4px 10px', fontSize: '11px', color: '#ff3366', border: '1px solid rgba(255, 51, 102, 0.3)' }}
                              title="Delete trade"
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 3: Bot Performance & Metrics Configuration */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
              Bot Card Display Metrics
            </h4>
            <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '18px' }}>
              Customize the statistics and badges displayed at the top of the Alpha-V Bot card on all user dashboards.
            </p>

            <form onSubmit={handleSaveBotConfig}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>
                    Daily Strategy Yield
                  </label>
                  <input
                    type="text"
                    value={botConfig.dailyYield || ''}
                    onChange={e => setBotConfig({ ...botConfig, dailyYield: e.target.value })}
                    className="input-field"
                    style={{ fontFamily: 'JetBrains Mono', color: '#00e676' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>
                    Model Win Rate
                  </label>
                  <input
                    type="text"
                    value={botConfig.winRate || ''}
                    onChange={e => setBotConfig({ ...botConfig, winRate: e.target.value })}
                    className="input-field"
                    style={{ fontFamily: 'JetBrains Mono', color: '#00f2fe' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>
                    Trading Schedule Label
                  </label>
                  <input
                    type="text"
                    value={botConfig.schedule || ''}
                    onChange={e => setBotConfig({ ...botConfig, schedule: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>
                    Engine Status
                  </label>
                  <select
                    value={botConfig.status || 'ACTIVE'}
                    onChange={e => setBotConfig({ ...botConfig, status: e.target.value })}
                    className="input-field"
                  >
                    <option value="ACTIVE">ACTIVE (Bot Active & Profiting)</option>
                    <option value="PAUSED">PAUSED (Bot Engine Paused)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={botConfigSaving}
                style={{ padding: '10px 20px', fontSize: '13px' }}
              >
                {botConfigSaving ? 'Saving...' : 'Save Bot Display Metrics'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 6: SUPPORT DESK & CHATBOT INBOX */}
      {activeTab === 'SUPPORT' && (
        <div>
          {/* Header & Stats Banner */}
          <div
            className="glass-panel"
            style={{
              padding: '20px 24px',
              marginBottom: '20px',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(0, 230, 118, 0.2))',
                    border: '1px solid rgba(0, 242, 254, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#00f2fe'
                  }}
                >
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                    Live Support Desk & Chatbot Management
                  </h3>
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                    Monitor user conversations, answer questions, and communicate with traders in real-time.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '12px',
                  color: '#94a3b8'
                }}
              >
                Total Threads: <strong style={{ color: '#fff' }}>{supportConversations.length}</strong>
              </div>

              {totalSupportUnread > 0 ? (
                <div
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    background: 'rgba(255, 0, 85, 0.15)',
                    border: '1px solid #ff0055',
                    fontSize: '12px',
                    color: '#ff0055',
                    fontWeight: 700,
                    boxShadow: '0 0 10px rgba(255, 0, 85, 0.3)'
                  }}
                >
                  {totalSupportUnread} Unread User Message{totalSupportUnread > 1 ? 's' : ''}
                </div>
              ) : (
                <div
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    background: 'rgba(0, 230, 118, 0.1)',
                    border: '1px solid rgba(0, 230, 118, 0.3)',
                    fontSize: '12px',
                    color: '#00e676',
                    fontWeight: 600
                  }}
                >
                  All Inquiries Answered
                </div>
              )}

              <button
                onClick={fetchSupportData}
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                title="Refresh Support Inbox"
              >
                <RefreshCw size={13} /> Refresh
              </button>
            </div>
          </div>

          {/* Two-Column Split Desk */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* LEFT COLUMN: Conversation Threads List */}
            <div
              className="glass-panel"
              style={{
                flex: '0 0 360px',
                width: '360px',
                maxWidth: '100%',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                maxHeight: '720px'
              }}
            >
              {/* Search bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '8px 12px'
                }}
              >
                <Search size={14} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Filter by user, email, or message..."
                  value={supportSearchQuery}
                  onChange={e => setSupportSearchQuery(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                    width: '100%',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Thread cards */}
              <div
                style={{
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  paddingRight: '4px'
                }}
              >
                {supportConversations.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '40px 16px',
                      color: '#64748b',
                      fontSize: '13px'
                    }}
                  >
                    <Bot size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                    <p style={{ margin: 0, fontWeight: 600, color: '#94a3b8' }}>No inquiries yet</p>
                    <p style={{ margin: '4px 0 0', fontSize: '11px' }}>
                      When users submit queries via the website chatbot, they will appear here instantly.
                    </p>
                  </div>
                ) : (
                  supportConversations
                    .filter(c => {
                      if (!supportSearchQuery) return true;
                      const q = supportSearchQuery.toLowerCase();
                      const name = (c.userName || '').toLowerCase();
                      const email = (c.userEmail || '').toLowerCase();
                      const hasText = c.messages?.some(m => (m.text || '').toLowerCase().includes(q));
                      return name.includes(q) || email.includes(q) || hasText;
                    })
                    .map(conv => {
                      const isSelected = conv.userId === selectedConversationId;
                      const hasUnread = conv.unreadCount > 0;
                      const lastMsg = conv.lastMessage;
                      const timeStr = lastMsg?.createdAt
                        ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '';

                      return (
                        <div
                          key={conv.userId}
                          onClick={() => handleSelectConversation(conv.userId)}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            background: isSelected
                              ? 'linear-gradient(135deg, rgba(0, 242, 254, 0.12), rgba(0, 230, 118, 0.06))'
                              : 'rgba(255, 255, 255, 0.03)',
                            border: isSelected
                              ? '1px solid #00f2fe'
                              : hasUnread
                              ? '1px solid rgba(255, 0, 85, 0.5)'
                              : '1px solid rgba(255, 255, 255, 0.06)',
                            transition: 'all 0.2s',
                            boxShadow: isSelected ? '0 4px 16px rgba(0, 242, 254, 0.15)' : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '50%',
                                  background: conv.isRegisteredUser
                                    ? 'linear-gradient(135deg, #00f2fe, #4facfe)'
                                    : 'rgba(255, 255, 255, 0.15)',
                                  color: conv.isRegisteredUser ? '#07090e' : '#fff',
                                  fontWeight: 700,
                                  fontSize: '12px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                {(conv.userName || 'T').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                                  {conv.userName}
                                </span>
                                {conv.isRegisteredUser && (
                                  <span
                                    style={{
                                      marginLeft: '6px',
                                      fontSize: '9px',
                                      padding: '1px 6px',
                                      borderRadius: '10px',
                                      background: 'rgba(0, 230, 118, 0.15)',
                                      color: '#00e676',
                                      fontWeight: 600
                                    }}
                                  >
                                    Trader
                                  </span>
                                )}
                              </div>
                            </div>

                            <span style={{ fontSize: '10px', color: '#64748b' }}>{timeStr}</span>
                          </div>

                          {/* Last message snippet */}
                          <div
                            style={{
                              fontSize: '12px',
                              color: isSelected ? '#cbd5e1' : '#94a3b8',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              margin: '4px 0'
                            }}
                          >
                            {lastMsg?.sender === 'ADMIN' ? (
                              <strong style={{ color: '#00f2fe' }}>You: </strong>
                            ) : null}
                            {lastMsg?.text || 'No messages'}
                          </div>

                          {/* Unread badge & footer */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                              {conv.userEmail || conv.userId}
                            </span>
                            {hasUnread && (
                              <span
                                style={{
                                  background: '#ff0055',
                                  color: '#fff',
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  padding: '2px 8px',
                                  borderRadius: '10px',
                                  boxShadow: '0 2px 6px rgba(255, 0, 85, 0.4)'
                                }}
                              >
                                {conv.unreadCount} New
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Active Thread & Reply Studio */}
            <div
              className="glass-panel"
              style={{
                flex: 1,
                minWidth: '340px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '640px',
                position: 'relative'
              }}
            >
              {(() => {
                const activeConv = supportConversations.find(c => c.userId === selectedConversationId);

                if (!activeConv) {
                  return (
                    <div
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748b',
                        padding: '60px 20px'
                      }}
                    >
                      <MessageSquare size={44} style={{ opacity: 0.4, marginBottom: '16px' }} />
                      <h4 style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>
                        No Conversation Selected
                      </h4>
                      <p style={{ fontSize: '13px', margin: '6px 0 0', maxWidth: '300px', textAlign: 'center' }}>
                        Choose an inquiry from the left panel to review user queries and reply directly.
                      </p>
                    </div>
                  );
                }

                return (
                  <>
                    {/* Thread Header */}
                    <div
                      style={{
                        paddingBottom: '16px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            background: activeConv.isRegisteredUser
                              ? 'linear-gradient(135deg, rgba(0, 242, 254, 0.3), rgba(0, 230, 118, 0.3))'
                              : 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(0, 242, 254, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#00f2fe',
                            fontWeight: 700,
                            fontSize: '16px'
                          }}
                        >
                          {(activeConv.userName || 'T').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                              {activeConv.userName}
                            </h4>
                            <span
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: '#00e676',
                                display: 'inline-block',
                                boxShadow: '0 0 6px #00e676'
                              }}
                            />
                          </div>
                          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                            {activeConv.userEmail || 'Guest Channel'} • User ID: <code style={{ color: '#00f2fe' }}>{activeConv.userId}</code>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {activeConv.userProfile && (
                          <>
                            <div
                              style={{
                                padding: '4px 10px',
                                borderRadius: '12px',
                                background: 'rgba(0, 230, 118, 0.1)',
                                border: '1px solid rgba(0, 230, 118, 0.3)',
                                fontSize: '11px',
                                color: '#00e676'
                              }}
                            >
                              Recent Deposited Capital: <strong>${activeConv.userProfile.initialBalance} USD</strong>
                            </div>
                            <button
                              onClick={() => {
                                const fullUser = users.find(u => u.id === activeConv.userId);
                                if (fullUser) {
                                  setImpersonatedUser(fullUser);
                                  setActiveView('USER_DASHBOARD');
                                }
                              }}
                              className="btn btn-secondary"
                              style={{ fontSize: '11px', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Eye size={12} /> Inspect Trader View
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Messages Scroll Area */}
                    <div
                      style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '16px 8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                        maxHeight: '380px'
                      }}
                    >
                      {activeConv.messages.map((msg, index) => {
                        const isUser = msg.sender === 'USER';
                        const isAdmin = msg.sender === 'ADMIN';
                        const isBot = msg.sender === 'BOT';
                        const timeStr = msg.createdAt
                          ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '';

                        return (
                          <div
                            key={msg.id || index}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: isAdmin ? 'flex-end' : 'flex-start',
                              maxWidth: '82%',
                              alignSelf: isAdmin ? 'flex-end' : 'flex-start'
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11px',
                                marginBottom: '3px',
                                color: isAdmin ? '#00f2fe' : isBot ? '#00e676' : '#94a3b8',
                                fontWeight: 600
                              }}
                            >
                              {isAdmin ? (
                                <>
                                  <Shield size={12} /> You (Customer Support)
                                </>
                              ) : isBot ? (
                                <>
                                  <Bot size={12} /> Customer Support Bot
                                </>
                              ) : (
                                <>
                                  <Users size={12} /> {activeConv.userName}
                                </>
                              )}
                              <span style={{ color: '#64748b', fontWeight: 400, marginLeft: '4px' }}>
                                {timeStr}
                              </span>
                            </div>

                            <div
                              style={{
                                padding: '10px 16px',
                                borderRadius: isAdmin ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                                background: isAdmin
                                  ? 'linear-gradient(135deg, rgba(0, 242, 254, 0.25), rgba(79, 172, 254, 0.25))'
                                  : isBot
                                  ? 'rgba(0, 230, 118, 0.12)'
                                  : 'rgba(255, 255, 255, 0.05)',
                                border: isAdmin
                                  ? '1px solid rgba(0, 242, 254, 0.45)'
                                  : isBot
                                  ? '1px solid rgba(0, 230, 118, 0.3)'
                                  : '1px solid rgba(255, 255, 255, 0.12)',
                                color: '#fff',
                                fontSize: '13px',
                                lineHeight: 1.5,
                                wordBreak: 'break-word',
                                boxShadow: isAdmin ? '0 4px 14px rgba(0, 242, 254, 0.15)' : 'none'
                              }}
                            >
                              {msg.text}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Quick Response Templates */}
                    <div style={{ marginTop: '8px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Sparkles size={11} color="#00f2fe" /> Quick Response Presets (Click to insert & send):
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {[
                          'Deposit confirmed! Your account balance has been updated and 3% compounding is active.',
                          'Please provide your blockchain transaction hash (TxID) so our compliance desk can verify the transfer.',
                          'Your withdrawal request has been approved and settled successfully to your wallet.',
                          'Our algorithmic growth bot runs Monday through Friday with capital protection.'
                        ].map((preset, pIdx) => (
                          <button
                            key={pIdx}
                            onClick={() => handleSendAdminReply(null, preset)}
                            style={{
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '16px',
                              padding: '4px 10px',
                              color: '#94a3b8',
                              fontSize: '11px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              textAlign: 'left'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = '#00f2fe';
                              e.currentTarget.style.color = '#00f2fe';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                              e.currentTarget.style.color = '#94a3b8';
                            }}
                          >
                            + {preset.length > 45 ? preset.substring(0, 45) + '...' : preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reply Input Form */}
                    <form onSubmit={handleSendAdminReply} style={{ marginTop: '12px' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          background: 'rgba(0, 0, 0, 0.4)',
                          border: '1px solid rgba(0, 242, 254, 0.3)',
                          borderRadius: '12px',
                          padding: '6px 8px 6px 14px'
                        }}
                      >
                        <input
                          type="text"
                          placeholder={`Type direct reply to ${activeConv.userName}...`}
                          value={adminReplyText}
                          onChange={e => setAdminReplyText(e.target.value)}
                          disabled={adminReplySending}
                          style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            fontSize: '13px',
                            outline: 'none'
                          }}
                        />
                        <button
                          type="submit"
                          disabled={!adminReplyText.trim() || adminReplySending}
                          className="btn btn-primary"
                          style={{
                            padding: '8px 16px',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Send size={14} /> {adminReplySending ? 'Sending...' : 'Send Reply'}
                        </button>
                      </div>
                    </form>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE USER */}
      {createUserModalOpen && (
        <div className="modal-overlay" onClick={() => setCreateUserModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '14px' }}>
              Create New User Account & Set Balance
            </h3>

            <form onSubmit={handleCreateUser}>
              <div className="responsive-form-grid" style={{ marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                    Username *
                  </label>
                  <input
                    type="text"
                    value={newUserForm.username}
                    onChange={e => setNewUserForm({ ...newUserForm, username: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                    Initial Password *
                  </label>
                  <input
                    type="text"
                    value={newUserForm.password}
                    onChange={e => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="responsive-form-grid" style={{ marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={newUserForm.fullName}
                    onChange={e => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={newUserForm.email}
                    onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="responsive-form-grid" style={{ marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={newUserForm.phone}
                    onChange={e => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                    Date of Birth (DOB)
                  </label>
                  <input
                    type="date"
                    value={newUserForm.dob}
                    onChange={e => setNewUserForm({ ...newUserForm, dob: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                  Permanent Address
                </label>
                <input
                  type="text"
                  value={newUserForm.address}
                  onChange={e => setNewUserForm({ ...newUserForm, address: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="responsive-form-grid" style={{ marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                    Aadhaar Number
                  </label>
                  <input
                    type="text"
                    value={newUserForm.aadharNo}
                    onChange={e => setNewUserForm({ ...newUserForm, aadharNo: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                    PAN Card Number
                  </label>
                  <input
                    type="text"
                    value={newUserForm.panNo}
                    onChange={e => setNewUserForm({ ...newUserForm, panNo: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Financial Settings Section */}
              <div style={{
                background: '#090d16',
                border: '1px solid rgba(0, 242, 254, 0.25)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#00f2fe', marginBottom: '12px' }}>
                  Wallet Balance & Compounding Rate
                </div>

                <div className="responsive-form-grid" style={{ gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#ffffff', marginBottom: '4px' }}>
                      Recent Deposited Capital (USD) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={newUserForm.initialBalance}
                      onChange={e => setNewUserForm({ ...newUserForm, initialBalance: Number(e.target.value) })}
                      className="input-field"
                      style={{ fontFamily: 'JetBrains Mono', fontSize: '15px', color: '#ffd700', fontWeight: 700 }}
                      required
                    />
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>User Minimum Investment: $200+ USD (Any Amount)</span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#ffffff', marginBottom: '4px' }}>
                      Daily Growth Percentage (Mon-Fri %) *
                    </label>
                    <input
                      type="number"
                      value={newUserForm.dailyGrowthRate}
                      onChange={e => setNewUserForm({ ...newUserForm, dailyGrowthRate: Number(e.target.value) })}
                      className="input-field"
                      style={{ fontFamily: 'JetBrains Mono', fontSize: '15px', color: '#00e676', fontWeight: 700 }}
                      required
                    />
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>Default: +3% / weekday</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <input
                  type="checkbox"
                  id="sendEmail"
                  checked={newUserForm.sendEmailToUser}
                  onChange={e => setNewUserForm({ ...newUserForm, sendEmailToUser: e.target.checked })}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="sendEmail" style={{ fontSize: '13px', color: '#d1d5db', cursor: 'pointer' }}>
                  Send Welcome Email with generated login credentials to user's registered email
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setCreateUserModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                  Create User & Provision Wallet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT USER */}
      {editUserModalOpen && selectedUser && (
        <div className="modal-overlay" onClick={() => setEditUserModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '14px' }}>
              Edit Dashboard: {selectedUser.fullName || selectedUser.username}
            </h3>

            <form onSubmit={handleSaveEditUser}>
              {/* Direct Balance Override Box */}
              <div style={{
                background: '#090d16',
                border: '1px solid #ffb703',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#ffb703', marginBottom: '6px' }}>
                  Direct Balance Override (USD)
                </label>
                <input
                  type="number"
                  step="any"
                  value={editUserForm.overrideBalance}
                  onChange={e => setEditUserForm({ ...editUserForm, overrideBalance: e.target.value })}
                  className="input-field"
                  style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'JetBrains Mono', color: '#ffd700' }}
                />
                <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>
                  Modifying this instantly updates what the user sees in their wallet. The Mon–Fri 3%/day growth will continue smoothly from this updated amount.
                </p>
              </div>

              <div className="responsive-form-grid" style={{ marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                    Daily Growth Rate (Mon-Fri %)
                  </label>
                  <input
                    type="number"
                    value={editUserForm.dailyGrowthRate}
                    onChange={e => setEditUserForm({ ...editUserForm, dailyGrowthRate: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                    Account Status
                  </label>
                  <select
                    value={editUserForm.status}
                    onChange={e => setEditUserForm({ ...editUserForm, status: e.target.value })}
                    className="input-field"
                    style={{ background: '#080c14' }}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>

              <div className="responsive-form-grid" style={{ marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editUserForm.fullName}
                    onChange={e => setEditUserForm({ ...editUserForm, fullName: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editUserForm.email}
                    onChange={e => setEditUserForm({ ...editUserForm, email: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="responsive-form-grid" style={{ marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={editUserForm.phone}
                    onChange={e => setEditUserForm({ ...editUserForm, phone: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                    Date of Birth (DOB)
                  </label>
                  <input
                    type="date"
                    value={editUserForm.dob}
                    onChange={e => setEditUserForm({ ...editUserForm, dob: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                  Address
                </label>
                <input
                  type="text"
                  value={editUserForm.address}
                  onChange={e => setEditUserForm({ ...editUserForm, address: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="responsive-form-grid" style={{ marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                    Aadhaar Number
                  </label>
                  <input
                    type="text"
                    value={editUserForm.aadharNo}
                    onChange={e => setEditUserForm({ ...editUserForm, aadharNo: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                    PAN Number
                  </label>
                  <input
                    type="text"
                    value={editUserForm.panNo}
                    onChange={e => setEditUserForm({ ...editUserForm, panNo: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                  Reset Password (Leave blank to keep current)
                </label>
                <input
                  type="text"
                  placeholder="Enter new password if resetting"
                  value={editUserForm.password}
                  onChange={e => setEditUserForm({ ...editUserForm, password: e.target.value })}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setEditUserModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                  Save All Dashboard Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: APPROVE DEPOSIT & UPDATE BALANCE */}
      {depositModalOpen && depositToApprove && (
        <div className="modal-overlay" onClick={() => setDepositModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(0, 230, 118, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ArrowDownToLine size={20} color="#00e676" />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>Approve Deposit & Credit Wallet</h3>
                  <p style={{ fontSize: '12px', color: '#9ca3af' }}>Verify funds on blockchain and update user wallet</p>
                </div>
              </div>
              <button
                onClick={() => setDepositModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '6px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmApproveDeposit}>
              {/* User & Request Info Banner */}
              <div style={{
                background: '#090d16',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '14px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
                    {depositToApprove.userName} (@{depositToApprove.user?.username || 'user'})
                  </span>
                  <span className="badge badge-emerald" style={{ fontFamily: 'JetBrains Mono', fontSize: '13px' }}>
                    +${depositToApprove.depositAmt.toFixed(2)} USD
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#9ca3af', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div>Email: <span style={{ color: '#58a6ff' }}>{depositToApprove.userEmail}</span></div>
                  <div>Network: <span style={{ color: '#00f2fe' }}>{depositToApprove.network}</span></div>
                  {depositToApprove.txHash && (
                    <div style={{ wordBreak: 'break-all' }}>
                      TxID / Hash: <span style={{ color: '#00f2fe', fontFamily: 'JetBrains Mono' }}>{depositToApprove.txHash}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Current Wallet Balances */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                marginBottom: '16px'
              }}>
                <div style={{ background: '#0e1422', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>Recent Deposited Capital</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffd700', fontFamily: 'JetBrains Mono' }}>
                    ${depositToApprove.initialBal.toFixed(2)} USD
                  </div>
                </div>
                <div style={{ background: '#0e1422', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>Current Active Balance (With Yield)</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#00e676', fontFamily: 'JetBrains Mono' }}>
                    ${depositToApprove.currentBal.toFixed(2)} USD
                  </div>
                </div>
              </div>

              {/* Quick Calculation Selector */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#ffffff', marginBottom: '8px', fontWeight: 600 }}>
                  Select Crediting Option for +${depositToApprove.depositAmt.toFixed(2)} USD:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const newBal = Math.round((depositToApprove.initialBal + depositToApprove.depositAmt) * 100) / 100;
                      setDepositForm({ ...depositForm, newBalance: newBal, mode: 'INITIAL' });
                    }}
                    style={{
                      background: depositForm.mode === 'INITIAL' ? 'rgba(0, 242, 254, 0.15)' : '#090d16',
                      border: depositForm.mode === 'INITIAL' ? '1px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '10px',
                      padding: '10px',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>Add to Recent Deposited Capital</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#00f2fe', fontFamily: 'JetBrains Mono' }}>
                      ${(depositToApprove.initialBal + depositToApprove.depositAmt).toFixed(2)} USD
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const newBal = Math.round((depositToApprove.currentBal + depositToApprove.depositAmt) * 100) / 100;
                      setDepositForm({ ...depositForm, newBalance: newBal, mode: 'CURRENT' });
                    }}
                    style={{
                      background: depositForm.mode === 'CURRENT' ? 'rgba(0, 230, 118, 0.15)' : '#090d16',
                      border: depositForm.mode === 'CURRENT' ? '1px solid #00e676' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '10px',
                      padding: '10px',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>Add to Current Balance</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#00e676', fontFamily: 'JetBrains Mono' }}>
                      ${(depositToApprove.currentBal + depositToApprove.depositAmt).toFixed(2)} USD
                    </div>
                  </button>
                </div>
              </div>

              {/* Editable New Balance Target Box */}
              <div style={{
                background: '#070a12',
                border: '1px solid #00e676',
                borderRadius: '12px',
                padding: '14px',
                marginBottom: '16px'
              }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#00e676', marginBottom: '6px' }}>
                  Target Wallet Balance to Credit (USD) *
                </label>
                <input
                  type="number"
                  step="any"
                  value={depositForm.newBalance}
                  onChange={e => setDepositForm({ ...depositForm, newBalance: e.target.value, mode: 'CUSTOM' })}
                  className="input-field"
                  style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'JetBrains Mono', color: '#00e676' }}
                  required
                />
                <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>
                  This amount will immediately become the user's active wallet balance. Daily 3% compounding will smoothly proceed from this new amount.
                </p>
              </div>

              {/* Optional Approval Note */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>
                  Admin Note / Blockchain Reference (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Confirmed on blockchain, credited $300"
                  value={depositForm.note}
                  onChange={e => setDepositForm({ ...depositForm, note: e.target.value })}
                  className="input-field"
                  style={{ fontSize: '12px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setDepositModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-emerald" style={{ flex: 2, padding: '10px' }}>
                  <CheckCircle size={16} /> Confirm Approval & Credit ${depositForm.newBalance || '0.00'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
