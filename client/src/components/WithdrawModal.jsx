import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, ArrowUpFromLine, AlertTriangle, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export function WithdrawModal({ isOpen, onClose }) {
  const { wallet, user, refreshProfile } = useAuth();
  const [amount, setAmount] = useState('');
  const [destinationType, setDestinationType] = useState('CRYPTO'); // 'CRYPTO' | 'BINANCE'
  const [cryptoAddress, setCryptoAddress] = useState('');
  const [network, setNetwork] = useState('USDT (TRC-20)');
  const [binanceId, setBinanceId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const currentBalance = wallet?.currentBalance || 0;

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const withdrawAmount = Number(amount);
    if (!withdrawAmount || withdrawAmount <= 0) {
      setErrorMessage('Please enter a valid amount to withdraw.');
      return;
    }

    if (withdrawAmount > currentBalance) {
      setErrorMessage(`Insufficient funds. Your available balance is $${currentBalance.toFixed(2)} USD.`);
      return;
    }

    if (destinationType === 'CRYPTO' && !cryptoAddress.trim()) {
      setErrorMessage('Please provide your Crypto Wallet Address.');
      return;
    }

    if (destinationType === 'BINANCE' && !binanceId.trim()) {
      setErrorMessage('Please provide your Binance Pay ID or Binance User ID.');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('tt_token');
      const res = await fetch('/api/transactions/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: withdrawAmount,
          cryptoAddress: destinationType === 'CRYPTO' ? cryptoAddress.trim() : '',
          network: destinationType === 'CRYPTO' ? network : 'Binance Internal Transfer',
          binanceId: destinationType === 'BINANCE' ? binanceId.trim() : ''
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit withdrawal request');
      }

      setSuccessMessage(data.message || 'Withdrawal request transmitted to Admin desk!');
      refreshProfile();
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleSetMax() {
    setAmount(currentBalance.toString());
  }

  function handleSetHalf() {
    setAmount((Math.floor((currentBalance / 2) * 100) / 100).toString());
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(255, 71, 87, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ArrowUpFromLine size={20} color="#ff4757" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>Withdraw Profits & Capital</h3>
              <p style={{ fontSize: '12px', color: '#9ca3af' }}>Fast settlement to your crypto wallet or Binance account</p>
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

        {successMessage ? (
          <div style={{ textAlign: 'center', padding: '24px 10px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(0, 230, 118, 0.15)',
              border: '2px solid #00e676',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <CheckCircle2 size={36} color="#00e676" />
            </div>
            <h4 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', marginBottom: '10px' }}>
              Withdrawal Dispatched to Admin!
            </h4>
            <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: '1.6', marginBottom: '20px' }}>
              Your withdrawal request has reached the administrator directly via email notification. The administrative desk will execute the payout to your provided destination and confirm the settlement.
            </p>
            <div style={{
              background: '#131929',
              padding: '14px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '13px',
              textAlign: 'left',
              marginBottom: '20px'
            }}>
              <div style={{ color: '#9ca3af' }}>Requested Amount: <strong style={{ color: '#ffd700' }}>${amount} USD</strong></div>
              <div style={{ color: '#9ca3af', marginTop: '4px' }}>
                Destination: <strong style={{ color: '#00f2fe' }}>{destinationType === 'CRYPTO' ? cryptoAddress : `Binance ID: ${binanceId}`}</strong>
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
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

            {/* Available Balance Header */}
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
                <div style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase' }}>Available to Withdraw</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#00e676', fontFamily: 'JetBrains Mono' }}>
                  ${currentBalance.toFixed(2)} USD
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={handleSetHalf}
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '11px' }}
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={handleSetMax}
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '11px', color: '#00f2fe', borderColor: 'rgba(0, 242, 254, 0.3)' }}
                >
                  Max
                </button>
              </div>
            </div>

            {/* Amount Input */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>
                Withdrawal Amount (USD) *
              </label>
              <input
                type="number"
                step="any"
                max={currentBalance}
                min="1"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="e.g. 150"
                className="input-field"
                required
              />
            </div>

            {/* Destination Toggle */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>
                Payout Destination Method *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setDestinationType('CRYPTO')}
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    border: destinationType === 'CRYPTO' ? '1px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: destinationType === 'CRYPTO' ? 'rgba(0, 242, 254, 0.1)' : '#080c14',
                    color: destinationType === 'CRYPTO' ? '#00f2fe' : '#9ca3af',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Crypto Wallet Address
                </button>
                <button
                  type="button"
                  onClick={() => setDestinationType('BINANCE')}
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    border: destinationType === 'BINANCE' ? '1px solid #ffb703' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: destinationType === 'BINANCE' ? 'rgba(255, 183, 3, 0.1)' : '#080c14',
                    color: destinationType === 'BINANCE' ? '#ffb703' : '#9ca3af',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Binance Pay / User ID
                </button>
              </div>
            </div>

            {/* Crypto Address Fields */}
            {destinationType === 'CRYPTO' ? (
              <>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>
                    Select Network *
                  </label>
                  <select
                    value={network}
                    onChange={e => setNetwork(e.target.value)}
                    className="input-field"
                    style={{ background: '#080c14', cursor: 'pointer' }}
                  >
                    <option value="USDT (TRC-20)">USDT (TRC-20) - Fast & Low Fee [Recommended]</option>
                    <option value="USDT (BEP-20)">USDT (BEP-20 / BSC)</option>
                    <option value="USDT (ERC-20)">USDT (ERC-20 / Ethereum)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>
                    Your USDT Wallet Address *
                  </label>
                  <input
                    type="text"
                    value={cryptoAddress}
                    onChange={e => setCryptoAddress(e.target.value)}
                    placeholder="Enter your USDT wallet address"
                    className="input-field"
                    style={{ fontFamily: 'JetBrains Mono', fontSize: '13px' }}
                    required
                  />
                </div>
              </>
            ) : (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>
                  Binance Pay ID or Binance User ID (UID) *
                </label>
                <input
                  type="text"
                  value={binanceId}
                  onChange={e => setBinanceId(e.target.value)}
                  placeholder="e.g. 198273645 or binance_pay_email"
                  className="input-field"
                  style={{ fontFamily: 'JetBrains Mono', fontSize: '13px' }}
                  required
                />
              </div>
            )}

            {/* Mandatory Network Advisory Note */}
            <div style={{
              background: 'rgba(255, 183, 3, 0.08)',
              border: '1px solid rgba(255, 183, 3, 0.25)',
              borderRadius: '10px',
              padding: '12px 14px',
              marginBottom: '20px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start'
            }}>
              <AlertTriangle size={18} color="#ffb703" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '12px', color: '#d1d5db', lineHeight: '1.5' }}>
                <strong style={{ color: '#ffb703', display: 'block', marginBottom: '2px' }}>
                  Important Network Note:
                </strong>
                Please choose the exact right network for transferring crypto. For example, if you want to withdraw USDT, ensure you provide a matching USDT address only (e.g. TRC-20 address for TRC-20 transfers). Supplying mismatched networks or wrong addresses will result in irreversible loss of funds.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 2 }}
                disabled={submitting || !amount}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Dispatching Request...
                  </>
                ) : (
                  <>
                    <ArrowUpFromLine size={16} /> Submit Withdrawal Request
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
