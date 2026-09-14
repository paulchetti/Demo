import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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
  ExternalLink
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
    initialBalance: 250,
    dailyGrowthRate: 50,
    status: 'ACTIVE',
    sendEmailToUser: true
  });

  // Edit user form state
  const [editUserForm, setEditUserForm] = useState({});

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    const token = localStorage.getItem('tt_token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [usersRes, txsRes, kycRes, settingsRes] = await Promise.all([
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/transactions', { headers }),
        fetch('/api/admin/kyc-submissions', { headers }),
        fetch('/api/admin/settings', { headers })
      ]);

      const [usersData, txsData, kycData, settingsData] = await Promise.all([
        usersRes.json(),
        txsRes.json(),
        kycRes.json(),
        settingsRes.json()
      ]);

      if (usersData.success) setUsers(usersData.users);
      if (txsData.success) setTransactions(txsData.transactions);
      if (kycData.success) setKycSubmissions(kycData.submissions);
      if (settingsData.success) setSettings(settingsData.settings);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    const token = localStorage.getItem('tt_token');

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newUserForm)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');

      alert(`User ${newUserForm.username} created successfully! Initial Balance: $${newUserForm.initialBalance} USD`);
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
        initialBalance: 250,
        dailyGrowthRate: 50,
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
      dailyGrowthRate: user.dailyGrowthRate ?? 50,
      overrideBalance: user.wallet?.currentBalance || user.initialBalance
    });
    setEditUserModalOpen(true);
  }

  async function handleSaveEditUser(e) {
    e.preventDefault();
    const token = localStorage.getItem('tt_token');

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
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
      const res = await fetch(`/api/admin/users/${user.id}`, {
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

  async function handleTransactionAction(txId, status) {
    const token = localStorage.getItem('tt_token');
    try {
      const res = await fetch(`/api/admin/transactions/${txId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      loadAllData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  async function handleSaveSettings(e) {
    e.preventDefault();
    const token = localStorage.getItem('tt_token');
    try {
      const res = await fetch('/api/admin/settings', {
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
      initialBalance: 250,
      dailyGrowthRate: 50,
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
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '30px 24px 80px' }}>
      {/* Admin Top Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px',
            height: '44px',
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
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff' }}>
              Trading Trends Super-Admin Portal
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '13px' }}>
              Full Control Management: Onboarding, Wallet Compounding, Deposits, and Payout Approvals
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-secondary"
            onClick={loadAllData}
            style={{ fontSize: '13px' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Data
          </button>
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
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        marginBottom: '24px'
      }}>
        {[
          { id: 'USERS', label: `Registered Users (${users.length})`, icon: Users },
          { id: 'KYC', label: `KYC Inquiries (${kycSubmissions.length})`, icon: FileText },
          { id: 'TRANSACTIONS', label: `Withdrawals & Deposits (${transactions.filter(t => t.status === 'PENDING').length} Pending)`, icon: ArrowUpFromLine },
          { id: 'SETTINGS', label: 'Platform & Deposit Settings', icon: Settings }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #00f2fe' : '2px solid transparent',
                color: isActive ? '#00f2fe' : '#9ca3af',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Icon size={16} />
              {tab.label}
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

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#9ca3af' }}>
                  <th style={{ padding: '12px 10px' }}>User Details</th>
                  <th style={{ padding: '12px 10px' }}>Current Balance</th>
                  <th style={{ padding: '12px 10px' }}>Initial Deposit ($200–$500)</th>
                  <th style={{ padding: '12px 10px' }}>Daily Rate (Mon-Fri)</th>
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
                        +${u.dailyGrowthRate ?? 50}/day
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
                            href={`/uploads/${f.filename}`}
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

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
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
                            onClick={() => handleTransactionAction(tx.id, 'APPROVED')}
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

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '14px' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
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

      {/* MODAL: CREATE USER */}
      {createUserModalOpen && (
        <div className="modal-overlay" onClick={() => setCreateUserModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '14px' }}>
              Create New User Account & Set Balance
            </h3>

            <form onSubmit={handleCreateUser}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#ffffff', marginBottom: '4px' }}>
                      Initial Deposited Capital (USD) *
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
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>User Minimum Investment: $200 – $500 USD</span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#ffffff', marginBottom: '4px' }}>
                      Daily Growth Increment (Mon-Fri) *
                    </label>
                    <input
                      type="number"
                      value={newUserForm.dailyGrowthRate}
                      onChange={e => setNewUserForm({ ...newUserForm, dailyGrowthRate: Number(e.target.value) })}
                      className="input-field"
                      style={{ fontFamily: 'JetBrains Mono', fontSize: '15px', color: '#00e676', fontWeight: 700 }}
                      required
                    />
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>Default: +$50 USD / weekday</span>
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
                  Modifying this instantly updates what the user sees in their wallet. The Mon–Fri +$50/day growth will continue smoothly from this updated amount.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                    Daily Growth Rate (Mon-Fri)
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
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
    </div>
  );
}
