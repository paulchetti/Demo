import React, { useState, useEffect } from 'react';
import { Cpu, TrendingUp, CheckCircle, Activity, Shield } from 'lucide-react';

export function BotActivity({ isWeekend = false }) {
  const [trades, setTrades] = useState([
    { id: 1, pair: 'BTC/USDT', type: 'LONG', entry: '64,280.50', exit: '64,810.00', profit: '+$18.40', time: '10 mins ago', status: 'CLOSED' },
    { id: 2, pair: 'ETH/USDT', type: 'LONG', entry: '3,490.20', exit: '3,522.80', profit: '+$14.20', time: '28 mins ago', status: 'CLOSED' },
    { id: 3, pair: 'SOL/USDT', type: 'LONG', entry: '152.10', exit: '154.90', profit: '+$17.40', time: '45 mins ago', status: 'CLOSED' },
    { id: 4, pair: 'BTC/USDT', type: 'SHORT', entry: '65,120.00', exit: '64,950.00', profit: '+$12.50', time: '2 hours ago', status: 'CLOSED' }
  ]);

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
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
            <Cpu size={20} color="#00f2fe" />
          </div>
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>Trading Trends Alpha-V Bot</h4>
            <p style={{ fontSize: '11px', color: '#9ca3af' }}>Institutional Algorithmic High-Frequency Strategy</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`badge ${isWeekend ? 'badge-gold' : 'badge-emerald'}`}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isWeekend ? '#ffb703' : '#00e676'
            }}></span>
            {isWeekend ? 'Weekend Paused' : 'Bot Active & Profiting'}
          </span>
        </div>
      </div>

      {/* Bot Key Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{ background: '#090d16', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase' }}>Daily Strategy Yield</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: isWeekend ? '#9ca3af' : '#00e676', fontFamily: 'JetBrains Mono' }}>
            {isWeekend ? '$0.00 (Paused)' : '+$50.00 USD'}
          </div>
        </div>

        <div style={{ background: '#090d16', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase' }}>Model Win Rate</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#00f2fe', fontFamily: 'JetBrains Mono' }}>
            94.2%
          </div>
        </div>

        <div style={{ background: '#090d16', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase' }}>Trading Schedule</div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', marginTop: '2px' }}>
            Monday – Friday
          </div>
        </div>

        <div style={{ background: '#090d16', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase' }}>Risk Protocol</div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#00e676', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Shield size={13} /> Capital Shielded
          </div>
        </div>
      </div>

      {/* Live Strategy Trade Ledger */}
      <div style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>
        Recent Algorithmic Trade Executions:
      </div>
      <div style={{
        background: '#070a10',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        overflow: 'hidden'
      }}>
        {trades.map(t => (
          <div
            key={t.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
              fontSize: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className={`badge ${t.type === 'LONG' ? 'badge-emerald' : 'badge-rose'}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                {t.type}
              </span>
              <strong style={{ color: '#ffffff', fontFamily: 'JetBrains Mono' }}>{t.pair}</strong>
              <span style={{ color: '#6b7280', fontSize: '11px' }}>Entry: ${t.entry}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: '#00e676', fontWeight: 700, fontFamily: 'JetBrains Mono' }}>
                {t.profit}
              </span>
              <span style={{ color: '#4b5563', fontSize: '11px' }}>{t.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
