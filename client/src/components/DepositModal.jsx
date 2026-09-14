import React, { useState, useEffect } from 'react';
import { X, ArrowDownToLine, Copy, Check, AlertTriangle, ShieldCheck, QrCode } from 'lucide-react';

export function DepositModal({ isOpen, onClose }) {
  const [depositInfo, setDepositInfo] = useState({
    address: 'TXyZ889KqN7W8B29LkJ5Q81HkMvPqS4eRt',
    network: 'USDT (TRC-20)',
    note: 'Please deposit only USDT TRC-20 to this address. Sending any other currency or using another network may result in permanent loss. Contact support after transfer.'
  });
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [submittingNotice, setSubmittingNotice] = useState(false);
  const [noticeSuccess, setNoticeSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetch('/api/deposit-info')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.depositInfo) {
            setDepositInfo(data.depositInfo);
          }
        })
        .catch(err => console.error('Failed to load deposit info:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function copyToClipboard() {
    navigator.clipboard.writeText(depositInfo.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  async function handleDepositNotice(e) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    setSubmittingNotice(true);
    setNoticeSuccess('');

    try {
      const token = localStorage.getItem('tt_token');
      const res = await fetch('/api/transactions/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: Number(amount),
          txHash,
          network: depositInfo.network
        })
      });

      const data = await res.json();
      if (res.ok) {
        setNoticeSuccess('Deposit notification submitted! Admin will credit your balance once confirmed on the blockchain.');
        setAmount('');
        setTxHash('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingNotice(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(0, 230, 118, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ArrowDownToLine size={20} color="#00e676" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>Deposit Cryptocurrency</h3>
              <p style={{ fontSize: '12px', color: '#9ca3af' }}>Transfer funds to your Trading Trends account</p>
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

        {/* Network & Currency Selection */}
        <div style={{
          background: '#090d16',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '14px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase' }}>Accepted Asset</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#00e676' }}>USDT</span>
              <span className="badge badge-cyan" style={{ fontSize: '11px' }}>
                {depositInfo.network || 'TRC-20'}
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase' }}>Confirmations</div>
            <div style={{ fontSize: '13px', color: '#00f2fe', fontWeight: 600 }}>1 Network Block</div>
          </div>
        </div>

        {/* Deposit Address Box with QR */}
        <div style={{
          background: '#111726',
          border: '1px solid rgba(0, 242, 254, 0.25)',
          borderRadius: '14px',
          padding: '18px',
          textAlign: 'center',
          marginBottom: '18px'
        }}>
          {/* Visual QR Code Generator */}
          <div style={{
            background: '#ffffff',
            padding: '12px',
            borderRadius: '10px',
            display: 'inline-block',
            margin: '0 auto 14px'
          }}>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${depositInfo.address}`}
              alt="Deposit QR Code"
              style={{ width: '130px', height: '130px', display: 'block' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>

          <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>
            Official Institutional Deposit Address ({depositInfo.network || 'TRC-20'}):
          </div>

          <div style={{
            background: '#080c14',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <span style={{
              fontFamily: 'JetBrains Mono',
              fontSize: '13px',
              color: '#00f2fe',
              wordBreak: 'break-all',
              textAlign: 'left'
            }}>
              {depositInfo.address}
            </span>
            <button
              onClick={copyToClipboard}
              style={{
                background: copied ? '#00e676' : 'rgba(0, 242, 254, 0.15)',
                color: copied ? '#050b14' : '#00f2fe',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                flexShrink: 0
              }}
            >
              {copied ? (
                <>
                  <Check size={14} /> Copied!
                </>
              ) : (
                <>
                  <Copy size={14} /> Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dynamic Admin Note */}
        <div style={{
          background: 'rgba(255, 183, 3, 0.08)',
          border: '1px solid rgba(255, 183, 3, 0.25)',
          borderRadius: '10px',
          padding: '12px 14px',
          marginBottom: '18px',
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start'
        }}>
          <AlertTriangle size={18} color="#ffb703" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '12px', color: '#d1d5db', lineHeight: '1.5' }}>
            <strong style={{ color: '#ffb703', display: 'block', marginBottom: '2px' }}>Important Deposit Notice:</strong>
            {depositInfo.note || 'Please deposit only USDT TRC-20 to this address. Sending any other currency or using another network may result in permanent loss. Contact support after transfer.'}
          </div>
        </div>

        {/* Optional Deposit Notice Submission */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '14px',
          marginBottom: '14px'
        }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', marginBottom: '6px' }}>
            Already Transferred? Notify Compliance (Optional)
          </div>
          <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '10px' }}>
            Submit your deposit amount and transaction hash (TxID) to expedite account crediting.
          </p>

          {noticeSuccess && (
            <div style={{
              background: 'rgba(0, 230, 118, 0.12)',
              border: '1px solid rgba(0, 230, 118, 0.3)',
              color: '#00e676',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              marginBottom: '10px'
            }}>
              {noticeSuccess}
            </div>
          )}

          <form onSubmit={handleDepositNotice}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', marginBottom: '10px' }}>
              <input
                type="number"
                placeholder="Amount (USD)"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="input-field"
                style={{ fontSize: '13px', padding: '8px 12px' }}
              />
              <input
                type="text"
                placeholder="Blockchain TxID / Hash (Optional)"
                value={txHash}
                onChange={e => setTxHash(e.target.value)}
                className="input-field"
                style={{ fontSize: '13px', padding: '8px 12px' }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-secondary"
              style={{ width: '100%', fontSize: '12px', padding: '8px' }}
              disabled={submittingNotice || !amount}
            >
              {submittingNotice ? 'Logging Notification...' : 'Submit Deposit Notification'}
            </button>
          </form>
        </div>

        <button className="btn btn-secondary" style={{ width: '100%' }} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
