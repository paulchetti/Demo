import React, { useEffect, useRef, useState } from 'react';
import { BarChart2 } from 'lucide-react';

export function TradingViewWidget() {
  const containerRef = useRef(null);
  const [activeSymbol, setActiveSymbol] = useState('BINANCE:BTCUSDT');

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: activeSymbol,
      interval: '15',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      backgroundColor: 'rgba(14, 19, 31, 0.95)',
      gridColor: 'rgba(255, 255, 255, 0.04)',
      hide_side_toolbar: true,
      allow_symbol_change: false,
      save_image: false,
      details: false,
      calendar: false,
      support_host: 'https://www.tradingview.com'
    });

    containerRef.current.appendChild(script);
  }, [activeSymbol]);

  return (
    <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart2 size={18} color="#00f2fe" />
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>Live Market Terminal</h4>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { label: 'BTC/USDT', symbol: 'BINANCE:BTCUSDT' },
            { label: 'ETH/USDT', symbol: 'BINANCE:ETHUSDT' },
            { label: 'SOL/USDT', symbol: 'BINANCE:SOLUSDT' }
          ].map(item => (
            <button
              key={item.symbol}
              onClick={() => setActiveSymbol(item.symbol)}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: activeSymbol === item.symbol ? '1px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.08)',
                background: activeSymbol === item.symbol ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
                color: activeSymbol === item.symbol ? '#00f2fe' : '#9ca3af',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="tradingview-chart-box"
        ref={containerRef}
      >
        <div className="tradingview-widget-container__widget" style={{ height: '100%', width: '100%' }}></div>
      </div>
    </div>
  );
}
