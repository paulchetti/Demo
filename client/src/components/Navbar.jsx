import React from 'react';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, ShieldCheck, User, LogOut, LayoutDashboard, Wallet, EyeOff } from 'lucide-react';

export function Navbar({ onOpenKyc, onOpenLogin }) {
  const { user, wallet, logout, activeView, setActiveView, impersonatedUser, setImpersonatedUser } = useAuth();

  const isWeekend = wallet?.isWeekend;

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      backgroundColor: 'rgba(7, 9, 14, 0.85)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '14px 28px'
    }}>
      {/* Impersonation Banner if Admin is viewing as user */}
      {impersonatedUser && (
        <div style={{
          background: 'linear-gradient(90deg, #ffb703, #fb8500)',
          color: '#050b14',
          fontWeight: 'bold',
          padding: '6px 16px',
          borderRadius: '8px',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '13px'
        }}>
          <span>
            ⚠️ Viewing dashboard as <strong>{impersonatedUser.fullName || impersonatedUser.username}</strong> ({impersonatedUser.email})
          </span>
          <button
            onClick={() => setImpersonatedUser(null)}
            style={{
              background: '#050b14',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <EyeOff size={14} /> Exit User View
          </button>
        </div>
      )}

      <div style={{
        maxWidth: '1380px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
        <div
          onClick={() => {
            if (user?.role === 'ADMIN') setActiveView('ADMIN_DASHBOARD');
            else if (user) setActiveView('USER_DASHBOARD');
            else setActiveView('LANDING');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer'
          }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(0, 242, 254, 0.4)'
          }}>
            <TrendingUp size={22} color="#07090e" strokeWidth={2.8} />
          </div>
          <div>
            <div style={{
              fontSize: '20px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              fontFamily: 'Outfit, sans-serif',
              background: 'linear-gradient(90deg, #ffffff, #d1d5db)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              TRADING TRENDS
            </div>
            <div style={{
              fontSize: '10px',
              letterSpacing: '0.12em',
              color: '#00f2fe',
              fontWeight: 600,
              textTransform: 'uppercase'
            }}>
              Algorithmic Growth Desk
            </div>
          </div>
        </div>

        {/* Live Engine Status Indicator */}
        <div style={{
          display: 'none',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '999px',
          fontSize: '12px'
        }} className="desktop-indicator">
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isWeekend ? '#ffb703' : '#00e676',
            boxShadow: isWeekend ? '0 0 8px #ffb703' : '0 0 8px #00e676'
          }}></span>
          <span style={{ color: '#9ca3af' }}>Engine:</span>
          <span style={{ color: '#ffffff', fontWeight: 600 }}>
            {isWeekend ? 'Weekend Paused (Market Closed)' : 'Mon-Fri Algorithmic Yield (+$50/day)'}
          </span>
        </div>

        {/* User / Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {user ? (
            <>
              {/* Quick Wallet Pill */}
              <div
                onClick={() => setActiveView('USER_DASHBOARD')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'rgba(0, 242, 254, 0.08)',
                  border: '1px solid rgba(0, 242, 254, 0.25)',
                  padding: '6px 14px',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                <Wallet size={16} color="#00f2fe" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase' }}>Balance</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#00e676', fontFamily: 'JetBrains Mono' }}>
                    ${(wallet?.currentBalance || 0).toFixed(2)} USD
                  </div>
                </div>
              </div>

              {/* Navigation to User Dashboard or Admin Dashboard */}
              {user.role === 'ADMIN' && (
                <button
                  className="btn btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '13px' }}
                  onClick={() => setActiveView('ADMIN_DASHBOARD')}
                >
                  <LayoutDashboard size={15} /> Admin Portal
                </button>
              )}

              {/* User Identity Chip */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)'
              }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: user.role === 'ADMIN' ? '#ffb703' : '#00f2fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#050b14',
                  fontWeight: 'bold',
                  fontSize: '12px'
                }}>
                  {(user.fullName || user.username || 'U')[0].toUpperCase()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
                    {user.fullName || user.username}
                  </span>
                  <span style={{ fontSize: '10px', color: user.role === 'ADMIN' ? '#ffb703' : '#00e676' }}>
                    {user.role === 'ADMIN' ? 'Super Admin' : 'Verified Trader'}
                  </span>
                </div>
              </div>

              {/* Logout */}
              <button
                className="btn btn-secondary"
                style={{ padding: '8px 12px' }}
                onClick={logout}
                title="Log Out"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-secondary"
                onClick={onOpenLogin}
              >
                <User size={16} /> Log In
              </button>
              <button
                className="btn btn-primary"
                onClick={onOpenKyc}
              >
                <ShieldCheck size={16} /> Open Account / KYC
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
