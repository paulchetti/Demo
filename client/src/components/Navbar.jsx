import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp,
  ShieldCheck,
  User,
  LogOut,
  LayoutDashboard,
  Wallet,
  EyeOff,
  Menu,
  X,
  ChevronRight,
  Activity,
  Download
} from 'lucide-react';
import { API_BASE } from '../apiConfig.js';

export function Navbar({ onOpenKyc, onOpenLogin }) {
  const { user, wallet, logout, activeView, setActiveView, impersonatedUser, setImpersonatedUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isWeekend = wallet?.isWeekend;
  const currentBalance = wallet?.currentBalance || 0;

  const handleNav = (view) => {
    setActiveView(view);
    setMobileMenuOpen(false);
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      backgroundColor: 'rgba(7, 9, 14, 0.9)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
    }}>
      {/* Impersonation Banner if Admin is viewing as user */}
      {impersonatedUser && (
        <div style={{
          background: 'linear-gradient(90deg, #ffb703, #fb8500)',
          color: '#050b14',
          fontWeight: 'bold',
          padding: '8px 16px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          fontSize: '12px'
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
              padding: '5px 10px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <EyeOff size={13} /> Exit User View
          </button>
        </div>
      )}

      {/* Main Bar */}
      <div style={{
        maxWidth: '1380px',
        margin: '0 auto',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        {/* Brand Logo */}
        <div
          onClick={() => {
            if (user?.role === 'ADMIN') handleNav('ADMIN_DASHBOARD');
            else if (user) handleNav('USER_DASHBOARD');
            else handleNav('LANDING');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(0, 242, 254, 0.4)',
            flexShrink: 0
          }}>
            <TrendingUp size={20} color="#07090e" strokeWidth={2.8} />
          </div>
          <div>
            <div style={{
              fontSize: '18px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              fontFamily: 'Outfit, sans-serif',
              background: 'linear-gradient(90deg, #ffffff, #d1d5db)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.2
            }}>
              TRADING TRENDS
            </div>
            <div style={{
              fontSize: '9px',
              letterSpacing: '0.12em',
              color: '#00f2fe',
              fontWeight: 600,
              textTransform: 'uppercase'
            }}>
              Algorithmic Growth Desk
            </div>
          </div>
        </div>

        {/* Desktop Live Engine Status Indicator */}
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
            {isWeekend ? 'Weekend Paused (Market Closed)' : 'Mon-Fri Algorithmic Yield (+3%/day)'}
          </span>
        </div>

        {/* Desktop Controls (Hidden on mobile via CSS) */}
        <div className="navbar-desktop-actions" style={{ alignItems: 'center', gap: '12px' }}>
          {user ? (
            <>
              {/* Quick Wallet Pill */}
              <div
                onClick={() => handleNav('USER_DASHBOARD')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(0, 242, 254, 0.08)',
                  border: '1px solid rgba(0, 242, 254, 0.25)',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
              >
                <Wallet size={15} color="#00f2fe" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase' }}>Balance</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#00e676', fontFamily: 'JetBrains Mono' }}>
                    ${currentBalance.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Admin Portal Button */}
              {user.role === 'ADMIN' && (
                <button
                  className="btn btn-secondary"
                  style={{ padding: '8px 12px', fontSize: '12px' }}
                  onClick={() => handleNav('ADMIN_DASHBOARD')}
                >
                  <LayoutDashboard size={14} /> Admin Portal
                </button>
              )}

              {/* User Identity Chip */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 10px',
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
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>
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
                style={{ padding: '8px 10px' }}
                onClick={logout}
                title="Log Out"
              >
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-secondary"
                style={{ padding: '8px 14px', fontSize: '13px' }}
                onClick={onOpenLogin}
              >
                <User size={15} /> Log In
              </button>
              <button
                className="btn btn-primary"
                style={{ padding: '8px 14px', fontSize: '13px' }}
                onClick={onOpenKyc}
              >
                <ShieldCheck size={15} /> Open Account / KYC
              </button>
            </>
          )}
        </div>

        {/* Mobile Action Pill + Hamburger Button (Visible only on mobile) */}
        <div className="navbar-mobile-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {user ? (
            <div
              onClick={() => handleNav('USER_DASHBOARD')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(0, 242, 254, 0.08)',
                border: '1px solid rgba(0, 242, 254, 0.25)',
                padding: '5px 9px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <Wallet size={14} color="#00f2fe" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#00e676', fontFamily: 'JetBrains Mono' }}>
                ${currentBalance.toFixed(2)}
              </span>
            </div>
          ) : (
            <button
              className="btn btn-primary"
              style={{ padding: '6px 11px', fontSize: '12px' }}
              onClick={onOpenLogin}
            >
              <User size={14} /> Log In
            </button>
          )}

          {/* Hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '7px 9px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            background: 'rgba(10, 14, 24, 0.97)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '16px',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* User Profile Card */}
              <div style={{
                background: '#131929',
                borderRadius: '12px',
                padding: '12px 14px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: user.role === 'ADMIN' ? '#ffb703' : '#00f2fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#050b14',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  flexShrink: 0
                }}>
                  {(user.fullName || user.username || 'U')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.fullName || user.username}
                  </div>
                  <div style={{ fontSize: '11px', color: user.role === 'ADMIN' ? '#ffb703' : '#00e676' }}>
                    {user.role === 'ADMIN' ? '⚡ Super Admin Desk' : '✓ KYC Verified Trader'}
                  </div>
                </div>
              </div>

              {/* Engine Status info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: '#090d16',
                borderRadius: '10px',
                fontSize: '12px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <span style={{ color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity size={14} color={isWeekend ? '#ffb703' : '#00e676'} />
                  Engine Protocol:
                </span>
                <span style={{ fontWeight: 600, color: isWeekend ? '#ffb703' : '#00e676' }}>
                  {isWeekend ? 'Weekend Paused' : 'Mon-Fri Yield Active (+3%)'}
                </span>
              </div>

              {/* Navigation Links */}
              <button
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  fontSize: '13px'
                }}
                onClick={() => handleNav('USER_DASHBOARD')}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Wallet size={16} color="#00f2fe" /> My Trading Dashboard
                </span>
                <ChevronRight size={16} color="#6b7280" />
              </button>

              {user.role === 'ADMIN' && (
                <button
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    fontSize: '13px',
                    borderColor: 'rgba(255, 183, 3, 0.3)',
                    color: '#ffb703'
                  }}
                  onClick={() => handleNav('ADMIN_DASHBOARD')}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LayoutDashboard size={16} color="#ffb703" /> Super-Admin Portal
                  </span>
                  <ChevronRight size={16} color="#ffb703" />
                </button>
              )}

              {/* Download APK Button */}
              <a
                href={`${API_BASE}/api/download/apk`}
                target="_blank"
                rel="noopener noreferrer"
                download="TradingTrends.apk"
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  fontSize: '13px',
                  textDecoration: 'none',
                  color: '#00f2fe',
                  borderColor: 'rgba(0, 242, 254, 0.3)',
                  background: 'rgba(0, 242, 254, 0.05)'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Download size={16} color="#00f2fe" /> Download Android APK
                </span>
                <ChevronRight size={16} color="#00f2fe" />
              </a>

              {/* Logout Button */}
              <button
                className="btn btn-danger"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontSize: '13px',
                  marginTop: '4px'
                }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
              >
                <LogOut size={16} /> Sign Out of Portal
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '14px' }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenKyc();
                }}
              >
                <ShieldCheck size={18} /> Open Account & KYC Application
              </button>
              <button
                className="btn btn-secondary"
                style={{ width: '100%', padding: '12px', fontSize: '14px' }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin();
                }}
              >
                <User size={18} /> Trader Login
              </button>
              <a
                href={`${API_BASE}/api/download/apk`}
                target="_blank"
                rel="noopener noreferrer"
                download="TradingTrends.apk"
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '12px',
                  fontSize: '14px',
                  textDecoration: 'none',
                  color: '#00f2fe',
                  borderColor: 'rgba(0, 242, 254, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Download size={18} /> Download Android APK
              </a>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
