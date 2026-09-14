import React from 'react';
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  BarChart3,
  Coins,
  Cpu,
  CheckCircle,
  Clock,
  Wallet
} from 'lucide-react';

export function LandingPage({ onOpenKyc, onOpenLogin }) {
  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="landing-hero">
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '999px',
          background: 'rgba(0, 242, 254, 0.08)',
          border: '1px solid rgba(0, 242, 254, 0.25)',
          color: '#00f2fe',
          fontSize: '13px',
          fontWeight: 600,
          marginBottom: '24px'
        }}>
          <Zap size={15} /> Next-Gen Quantitative Trend Infrastructure
        </div>

        <h1 style={{
          fontSize: 'clamp(28px, 6vw, 56px)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: '1.15',
          marginBottom: '20px',
          color: '#ffffff'
        }}>
          Algorithmic Trading & <br />
          <span style={{
            background: 'linear-gradient(90deg, #00f2fe 0%, #00e676 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Disciplined Daily Growth
          </span>
        </h1>

        <p style={{
          fontSize: 'clamp(15px, 2vw, 18px)',
          color: '#9ca3af',
          maxWidth: '720px',
          margin: '0 auto 36px',
          lineHeight: '1.6',
          padding: '0 8px'
        }}>
          Welcome to <strong>Trading Trends</strong>. We combine institutional quantitative models with automated weekday yield. Get your KYC verified, receive your personal funded account, and watch your capital expand every Monday to Friday.
        </p>

        {/* CTA Buttons */}
        <div className="landing-cta-row">
          <button
            className="btn btn-primary"
            style={{ padding: '14px 28px', fontSize: '15px' }}
            onClick={onOpenKyc}
          >
            <ShieldCheck size={18} /> Open Account & Submit KYC <ArrowRight size={16} />
          </button>
          <button
            className="btn btn-secondary"
            style={{ padding: '14px 28px', fontSize: '15px' }}
            onClick={onOpenLogin}
          >
            Access Trader Portal
          </button>
        </div>

        {/* Live Metrics Strip */}
        <div className="landing-metrics-grid">
          <div className="glass-panel" style={{ padding: '18px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '4px' }}>
              Weekday Target Yield
            </div>
            <div style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 800, color: '#00e676', fontFamily: 'JetBrains Mono' }}>
              +$50 / Day
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>Active Monday to Friday</div>
          </div>

          <div className="glass-panel" style={{ padding: '18px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '4px' }}>
              Minimum Initial Investment
            </div>
            <div style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 800, color: '#00f2fe', fontFamily: 'JetBrains Mono' }}>
              $200 – $500
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>Required Deposit to Start</div>
          </div>

          <div className="glass-panel" style={{ padding: '18px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '4px' }}>
              Weekend Protocol
            </div>
            <div style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 800, color: '#ffb703', fontFamily: 'JetBrains Mono' }}>
              100% Shielded
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>Paused Sat & Sun (Zero Exposure)</div>
          </div>

          <div className="glass-panel" style={{ padding: '18px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '4px' }}>
              Withdrawal Settlement
            </div>
            <div style={{ fontSize: 'clamp(20px, 4.5vw, 26px)', fontWeight: 800, color: '#ffffff', fontFamily: 'JetBrains Mono' }}>
              Instant USDT / Binance
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>Direct Admin Payout Desk</div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: '40px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 700, color: '#ffffff', marginBottom: '10px' }}>
            How Trading Trends Works
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '14px', padding: '0 8px' }}>
            A transparent 4-stage onboarding and quantitative compounding process
          </p>
        </div>

        <div className="landing-steps-grid">
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(0, 242, 254, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00f2fe',
              fontWeight: 800,
              marginBottom: '16px'
            }}>
              01
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
              KYC Document Submission
            </h3>
            <p style={{ fontSize: '13px', color: '#9ca3af', lineHeight: '1.6' }}>
              Fill in your personal details (Aadhaar, PAN, Contact, Address) and upload official verification documents. Submissions are dispatched directly to compliance via email.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(0, 230, 118, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00e676',
              fontWeight: 800,
              marginBottom: '16px'
            }}>
              02
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
              Admin Verification & Initial Deposit
            </h3>
            <p style={{ fontSize: '13px', color: '#9ca3af', lineHeight: '1.6' }}>
              Our administrative desk reviews your KYC application and issues your verified credentials. Deposit the minimum initial investment ($200 to $500 USD) to activate your account and start earning 50 USDT daily.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(255, 183, 3, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffb703',
              fontWeight: 800,
              marginBottom: '16px'
            }}>
              03
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
              Mon–Fri Automated Profit
            </h3>
            <p style={{ fontSize: '13px', color: '#9ca3af', lineHeight: '1.6' }}>
              Your account automatically gains +$50.00 USD each business day (Monday through Friday). On Saturdays and Sundays, growth pauses cleanly to reflect closed markets.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(255, 71, 87, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ff4757',
              fontWeight: 800,
              marginBottom: '16px'
            }}>
              04
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
              Withdraw via Crypto or Binance
            </h3>
            <p style={{ fontSize: '13px', color: '#9ca3af', lineHeight: '1.6' }}>
              Request payouts anytime to your USDT wallet address (TRC-20) or Binance Pay ID. The admin receives instant email notification to complete the transfer promptly.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section style={{ padding: '30px 0' }}>
        <div className="glass-panel landing-feature-panel">
          <div className="landing-feature-grid">
            <div>
              <span className="badge badge-cyan" style={{ marginBottom: '12px' }}>
                Institutional Standards
              </span>
              <h3 style={{ fontSize: 'clamp(20px, 4.5vw, 26px)', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>
                Full Administrative Oversight & Risk Governance
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '13px', lineHeight: '1.7', marginBottom: '20px' }}>
                Trading Trends is built with total administrative transparency. Every account's wallet performance, daily yield, deposits, and withdrawal requests are supervised in real-time by the compliance portal to guarantee solvency and operational reliability.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e5e7eb', fontSize: '13px' }}>
                  <CheckCircle size={16} color="#00e676" style={{ flexShrink: 0 }} /> Strict Aadhaar & PAN verification before credential issuance
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e5e7eb', fontSize: '13px' }}>
                  <CheckCircle size={16} color="#00e676" style={{ flexShrink: 0 }} /> Guaranteed +$50.00 weekday growth rate (Mon-Fri)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e5e7eb', fontSize: '13px' }}>
                  <CheckCircle size={16} color="#00e676" style={{ flexShrink: 0 }} /> Seamless USDT TRC-20 & Binance ID payouts
                </div>
              </div>
            </div>

            <div style={{
              background: '#070a12',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>Sample Account Growth Curve</span>
                <span className="badge badge-emerald">Active +$50/Day</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px 12px', background: '#0e1422', borderRadius: '8px' }}>
                  <span style={{ color: '#9ca3af' }}>Initial Investment Deposit</span>
                  <strong style={{ color: '#ffffff' }}>$250.00 USD</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px 12px', background: '#0e1422', borderRadius: '8px' }}>
                  <span style={{ color: '#9ca3af' }}>Day 1 (Monday)</span>
                  <strong style={{ color: '#00e676' }}>$300.00 USD (+$50)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px 12px', background: '#0e1422', borderRadius: '8px' }}>
                  <span style={{ color: '#9ca3af' }}>Day 2 (Tuesday)</span>
                  <strong style={{ color: '#00e676' }}>$350.00 USD (+$50)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px 12px', background: '#0e1422', borderRadius: '8px' }}>
                  <span style={{ color: '#9ca3af' }}>Weekend (Sat & Sun)</span>
                  <strong style={{ color: '#ffb703' }}>$350.00 USD (Paused)</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ textAlign: 'center', padding: '50px 0 20px' }}>
        <h2 style={{ fontSize: 'clamp(22px, 5vw, 30px)', fontWeight: 700, color: '#ffffff', marginBottom: '14px' }}>
          Ready to Begin with Trading Trends?
        </h2>
        <p style={{ color: '#9ca3af', fontSize: '14px', maxWidth: '600px', margin: '0 auto 28px', padding: '0 8px' }}>
          Submit your KYC credentials today. Once approved by administration, receive your verified credentials, fund the minimum initial investment ($200–$500 USD), and start earning 50 USDT every weekday.
        </p>
        <button
          className="btn btn-primary"
          style={{ padding: '14px 28px', fontSize: '15px' }}
          onClick={onOpenKyc}
        >
          <ShieldCheck size={18} /> Submit KYC Application Now
        </button>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: '60px',
        paddingTop: '30px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        fontSize: '12px',
        color: '#6b7280'
      }}>
        <div>
          © 2026 <strong>Trading Trends</strong> Institutional Quantitative Technologies. All rights reserved.
        </div>
        <div>
          Identity verification managed by compliance desk • Mon–Fri algorithmic yield protocol
        </div>
      </footer>
    </div>
  );
}
