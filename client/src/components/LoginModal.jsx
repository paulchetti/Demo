import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, User, AlertCircle, Loader2, KeyRound } from 'lucide-react';

export function LoginModal({ isOpen, onClose, onOpenKyc }) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      await login(identifier, password);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  function fillAdminCredentials() {
    setIdentifier('admin');
    setPassword('admin123');
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(0, 242, 254, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Lock size={20} color="#00f2fe" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>Account Login</h3>
              <p style={{ fontSize: '12px', color: '#9ca3af' }}>Enter your admin-issued credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {errorMessage && (
          <div style={{
            background: 'rgba(255, 71, 87, 0.12)',
            border: '1px solid rgba(255, 71, 87, 0.3)',
            padding: '12px 14px',
            borderRadius: '10px',
            color: '#ff4757',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>
              Username or Registered Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="e.g. your_username or email"
                className="input-field"
                style={{ paddingLeft: '38px' }}
                required
              />
              <User size={16} color="#6b7280" style={{ position: 'absolute', left: '12px', top: '14px' }} />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>
              Security Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="input-field"
                style={{ paddingLeft: '38px' }}
                required
              />
              <Lock size={16} color="#6b7280" style={{ position: 'absolute', left: '12px', top: '14px' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '16px' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Verifying Credentials...
              </>
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>

        {/* Quick Admin fill for developer / testing */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px dashed rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          fontSize: '12px'
        }}>
          <span style={{ color: '#9ca3af' }}>Administrator Quick Login:</span>
          <button
            type="button"
            onClick={fillAdminCredentials}
            style={{
              background: 'rgba(255, 183, 3, 0.15)',
              color: '#ffb703',
              border: '1px solid rgba(255, 183, 3, 0.3)',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <KeyRound size={12} /> Fill Admin Login
          </button>
        </div>

        <div style={{ textAlign: 'center', fontSize: '13px', color: '#9ca3af' }}>
          Don't have credentials yet?{' '}
          <button
            onClick={() => {
              onClose();
              onOpenKyc();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#00f2fe',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Submit KYC to open account
          </button>
        </div>
      </div>
    </div>
  );
}
