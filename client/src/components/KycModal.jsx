import React, { useState } from 'react';
import { X, ShieldCheck, Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { API_BASE } from '../apiConfig.js';

export function KycModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    address: '',
    aadhar: '',
    pan: ''
  });

  const [aadharFrontFile, setAadharFrontFile] = useState(null);
  const [aadharBackFile, setAadharBackFile] = useState(null);
  const [panFile, setPanFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  function handleChange(e) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.name || !formData.email || !formData.phone || !formData.dob || !formData.address || !formData.aadhar || !formData.pan) {
      setErrorMessage('Please fill in all 7 required identity details.');
      return;
    }

    if (!aadharFrontFile) {
      setErrorMessage('Please attach your Aadhaar Card Front Side (Image/PDF).');
      return;
    }

    if (!aadharBackFile) {
      setErrorMessage('Please attach your Aadhaar Card Back Side (Image/PDF).');
      return;
    }

    if (!panFile) {
      setErrorMessage('Please attach your PAN Card document (Image/PDF).');
      return;
    }

    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('dob', formData.dob);
      data.append('address', formData.address);
      data.append('aadhar', formData.aadhar);
      data.append('pan', formData.pan);
      data.append('aadharFrontFile', aadharFrontFile);
      data.append('aadharBackFile', aadharBackFile);
      data.append('panFile', panFile);

      const res = await fetch(`${API_BASE}/api/kyc/submit`, {
        method: 'POST',
        body: data
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to submit KYC application');
      }

      setSuccessMessage(json.message || 'KYC application submitted successfully! Check your email for login credentials.');
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
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
              <ShieldCheck size={20} color="#00f2fe" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>Open Account & KYC Verification</h3>
              <p style={{ fontSize: '12px', color: '#9ca3af' }}>Submit identity documents for institutional credential provisioning</p>
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
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(0, 230, 118, 0.15)',
              border: '2px solid #00e676',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <CheckCircle2 size={36} color="#00e676" />
            </div>
            <h4 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', marginBottom: '10px' }}>
              Application Successfully Dispatched!
            </h4>
            <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: '1.6', marginBottom: '24px' }}>
              {successMessage}
            </p>
            <div style={{
              background: '#131929',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(0, 242, 254, 0.2)',
              fontSize: '13px',
              color: '#d1d5db',
              textAlign: 'left',
              marginBottom: '24px'
            }}>
              <div style={{ fontWeight: 600, color: '#00f2fe', marginBottom: '4px' }}>What happens next?</div>
              <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                <li>Our compliance desk reviews your Aadhaar & PAN submissions.</li>
                <li>An administrator issues your verified credentials and guides you to fund the minimum initial investment ($200–$500 USD).</li>
                <li>Once your initial deposit is confirmed, your 50 USDT daily yield activates every Monday to Friday.</li>
              </ul>
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>
              Got It
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {errorMessage && (
              <div style={{
                background: 'rgba(255, 71, 87, 0.12)',
                border: '1px solid rgba(255, 71, 87, 0.3)',
                padding: '12px 16px',
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>
                  1. Full Legal Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Johnathan Doe"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>
                  2. Registered Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@domain.com"
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>
                  3. Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>
                  4. Date of Birth (DOB) *
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>
                5. Permanent Residential Address *
              </label>
              <textarea
                name="address"
                rows={2}
                value={formData.address}
                onChange={handleChange}
                placeholder="House/Street, City, State, Postal Code"
                className="input-field"
                required
              />
            </div>

            {/* Aadhaar Section */}
            <div style={{
              background: '#090d16',
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              marginBottom: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>
                  6. Aadhaar Number & Documents (Front & Back) *
                </label>
                <span style={{ fontSize: '11px', color: '#00f2fe' }}>2 Required Files</span>
              </div>
              <input
                type="text"
                name="aadhar"
                value={formData.aadhar}
                onChange={handleChange}
                placeholder="12-digit Aadhaar Number (XXXX XXXX XXXX)"
                className="input-field"
                style={{ marginBottom: '12px' }}
                required
              />

              {/* Box 1: Front Side */}
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Front Side (Photo, Name, DOB & Aadhaar No.)</span>
                  {aadharFrontFile && <span style={{ color: '#00e676', fontWeight: 600 }}>✓ Attached</span>}
                </div>
                <div style={{
                  border: '1px dashed rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(255, 255, 255, 0.02)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={18} color="#00f2fe" />
                    <span style={{ fontSize: '13px', color: aadharFrontFile ? '#00e676' : '#9ca3af' }}>
                      {aadharFrontFile ? aadharFrontFile.name : 'No file chosen (Front Side)'}
                    </span>
                  </div>
                  <label style={{
                    padding: '6px 12px',
                    background: 'rgba(0, 242, 254, 0.15)',
                    color: '#00f2fe',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}>
                    <Upload size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                    Browse Front Side
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      style={{ display: 'none' }}
                      onChange={e => setAadharFrontFile(e.target.files[0] || null)}
                    />
                  </label>
                </div>
              </div>

              {/* Box 2: Back Side */}
              <div>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Back Side (Permanent Address & QR Code)</span>
                  {aadharBackFile && <span style={{ color: '#00e676', fontWeight: 600 }}>✓ Attached</span>}
                </div>
                <div style={{
                  border: '1px dashed rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(255, 255, 255, 0.02)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={18} color="#00f2fe" />
                    <span style={{ fontSize: '13px', color: aadharBackFile ? '#00e676' : '#9ca3af' }}>
                      {aadharBackFile ? aadharBackFile.name : 'No file chosen (Back Side)'}
                    </span>
                  </div>
                  <label style={{
                    padding: '6px 12px',
                    background: 'rgba(0, 242, 254, 0.15)',
                    color: '#00f2fe',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}>
                    <Upload size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                    Browse Back Side
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      style={{ display: 'none' }}
                      onChange={e => setAadharBackFile(e.target.files[0] || null)}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* PAN Card Section */}
            <div style={{
              background: '#090d16',
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>
                  7. PAN Card Number & Document *
                </label>
                <span style={{ fontSize: '11px', color: '#00e676' }}>Official PAN Card</span>
              </div>
              <input
                type="text"
                name="pan"
                value={formData.pan}
                onChange={handleChange}
                placeholder="10-character PAN (e.g. ABCDE1234F)"
                className="input-field"
                style={{ marginBottom: '10px' }}
                required
              />
              <div style={{
                border: '1px dashed rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255, 255, 255, 0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} color="#00e676" />
                  <span style={{ fontSize: '13px', color: panFile ? '#00e676' : '#9ca3af' }}>
                    {panFile ? panFile.name : 'No PAN file chosen'}
                  </span>
                </div>
                <label style={{
                  padding: '6px 12px',
                  background: 'rgba(0, 230, 118, 0.15)',
                  color: '#00e676',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}>
                  <Upload size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  Browse File
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    style={{ display: 'none' }}
                    onChange={e => setPanFile(e.target.files[0] || null)}
                  />
                </label>
              </div>
            </div>

            {/* Disclaimer */}
            <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '18px', lineHeight: '1.5' }}>
              By submitting this form, your personal data and attached verification documents are securely dispatched directly to the Trading Trends administrative desk via email. Login credentials will be issued exclusively upon administrative review.
            </p>

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
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Dispatching Documents...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} /> Submit KYC Application
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
