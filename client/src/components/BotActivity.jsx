import React, { useState, useEffect } from 'react';
import { Cpu, Shield, TrendingUp, CheckCircle, Activity } from 'lucide-react';
import { API_BASE } from '../apiConfig.js';

export function BotActivity({ isWeekend = false }) {
  const [trades, setTrades] = useState([
    { id: '1', pair: 'BTC/USDT', type: 'LONG', entry: '64,280.50', exit: '64,810.00', profit: '+$18.40', time: '10 mins ago', status: 'CLOSED' },
    { id: '2', pair: 'ETH/USDT', type: 'LONG', entry: '3,490.20', exit: '3,522.80', profit: '+$14.20', time: '28 mins ago', status: 'CLOSED' },
    { id: '3', pair: 'SOL/USDT', type: 'LONG', entry: '152.10', exit: '154.90', profit: '+$17.40', time: '45 mins ago', status: 'CLOSED' },
    { id: '4', pair: 'BTC/USDT', type: 'SHORT', entry: '65,120.00', exit: '64,950.00', profit: '+$12.50', time: '2 hours ago', status: 'CLOSED' }
  ]);

  const [botConfig, setBotConfig] = useState({
    status: 'ACTIVE',
    dailyYield: '+3.0% / Day',
    winRate: '94.2%',
    schedule: 'Monday – Friday',
    riskProtocol: 'Capital Shielded'
  });

  useEffect(() => {
    fetchBotData();
    const interval = setInterval(fetchBotData, 20000); // 20s live sync
    return () => clearInterval(interval);
  }, []);

  async function fetchBotData() {
    try {
      const res = await fetch(`${API_BASE}/api/bot/data`);
      if (res.ok) {
        const data = await res.json();
        if (data.trades && Array.isArray(data.trades)) {
          setTrades(data.trades);
        }
        if (data.config) {
          setBotConfig(data.config);
        }
      }
    } catch (err) {
      // Fallback silently to existing state
    }
  }

  const isPaused = isWeekend || botConfig.status === 'PAUSED';

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
          <span className={`badge ${isPaused ? 'badge-gold' : 'badge-emerald'}`}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isPaused ? '#ffb703' : '#00e676'
            }}></span>
            {isPaused ? (isWeekend ? 'Weekend Paused' : 'Bot Engine Paused') : 'Bot Active & Profiting'}
          </span>
        </div>
      </div>

      {/* Bot Key Metrics */}
      <div className="bot-metrics-grid">
        <div style={{ background: '#090d16', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase' }}>Daily Strategy Yield</div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: isPaused ? '#9ca3af' : '#00e676', fontFamily: 'JetBrains Mono', marginTop: '2px' }}>
            {isPaused ? '0.00% (Paused)' : botConfig.dailyYield || '+3.0% / Day'}
          </div>
        </div>

        <div style={{ background: '#090d16', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase' }}>Model Win Rate</div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#00f2fe', fontFamily: 'JetBrains Mono', marginTop: '2px' }}>
            {botConfig.winRate || '94.2%'}
          </div>
        </div>

        <div style={{ background: '#090d16', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase' }}>Trading Schedule</div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff', marginTop: '4px' }}>
            {botConfig.schedule || 'Monday – Friday'}
          </div>
        </div>

        <div style={{ background: '#090d16', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase' }}>Risk Protocol</div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#00e676', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Shield size={13} /> {botConfig.riskProtocol || 'Capital Shielded'}
          </div>
        </div>
      </div>

      {/* Live Strategy Trade Ledger */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af' }}>
          Recent Algorithmic Trade Executions:
        </div>
        <div style={{ fontSize: '11px', color: '#00f2fe', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#00f2fe', display: 'inline-block' }}></span> Live Feed
        </div>
      </div>

      <div style={{
        background: '#070a10',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        overflow: 'hidden'
      }}>
        {trades.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: '#6b7280', fontSize: '12px' }}>
            No recent trades in ledger. Awaiting algorithm signal...
          </div>
        ) : (
          trades.map(t => {
            const isLong = (t.type || 'LONG').toUpperCase() === 'LONG';
            const isNegativeProfit = (t.profit || '').startsWith('-');
            return (
              <div
                key={t.id}
                className="bot-trade-row"
              >
                <div className="bot-trade-top-line">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge ${isLong ? 'badge-emerald' : 'badge-rose'}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                      {t.type}
                    </span>
                    <strong style={{ color: '#ffffff', fontFamily: 'JetBrains Mono', letterSpacing: '0.5px' }}>{t.pair}</strong>
                  </div>
                  <span style={{
                    color: isNegativeProfit ? '#ff3366' : '#00e676',
                    fontWeight: 700,
                    fontFamily: 'JetBrains Mono'
                  }}>
                    {t.profit}
                  </span>
                </div>

                <div className="bot-trade-bottom-line">
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <span>Open: <strong style={{ color: '#d1d5db' }}>${t.entry}</strong></span>
                    {t.exit && <span>Close: <strong style={{ color: '#d1d5db' }}>${t.exit}</strong></span>}
                  </div>
                  <span>{t.time}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
