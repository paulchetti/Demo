import nodemailer from 'nodemailer';
import { getSettings } from '../database.js';

function createTransporter() {
  const settings = getSettings();
  const host = process.env.SMTP_HOST || settings.smtpHost;
  const port = process.env.SMTP_PORT || settings.smtpPort || 587;
  const user = process.env.SMTP_USER || settings.smtpUser;
  const pass = process.env.SMTP_PASS || settings.smtpPass;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: { user, pass }
    });
  }
  return null;
}

export async function sendKycSubmissionEmail({ kycData, files }) {
  const settings = getSettings();
  const recipient = process.env.ADMIN_EMAIL || settings.adminEmail || 'admin@tradingtrends.com';
  const transporter = createTransporter();

  const attachments = (files || []).map(file => ({
    filename: file.originalname || file.filename,
    path: file.path
  }));

  const subject = `[KYC Application] New Account Request - ${kycData.name}`;
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #0d1117; color: #c9d1d9; padding: 24px; border-radius: 8px;">
      <h2 style="color: #00f2fe; border-bottom: 2px solid #00f2fe; padding-bottom: 8px;">New KYC Verification Application</h2>
      <p style="font-size: 14px; color: #8b949e;">A new user has submitted their KYC documents to open an account on <strong>Trading Trends</strong>.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px;">
        <tr style="border-bottom: 1px solid #30363d;">
          <td style="padding: 10px; color: #8b949e; width: 35%;">Full Name:</td>
          <td style="padding: 10px; font-weight: bold; color: #ffffff;">${kycData.name}</td>
        </tr>
        <tr style="border-bottom: 1px solid #30363d;">
          <td style="padding: 10px; color: #8b949e;">Email Address:</td>
          <td style="padding: 10px; font-weight: bold; color: #58a6ff;"><a href="mailto:${kycData.email}" style="color: #58a6ff;">${kycData.email}</a></td>
        </tr>
        <tr style="border-bottom: 1px solid #30363d;">
          <td style="padding: 10px; color: #8b949e;">Phone Number:</td>
          <td style="padding: 10px; color: #ffffff;">${kycData.phone}</td>
        </tr>
        <tr style="border-bottom: 1px solid #30363d;">
          <td style="padding: 10px; color: #8b949e;">Date of Birth (DOB):</td>
          <td style="padding: 10px; color: #ffffff;">${kycData.dob}</td>
        </tr>
        <tr style="border-bottom: 1px solid #30363d;">
          <td style="padding: 10px; color: #8b949e;">Residential Address:</td>
          <td style="padding: 10px; color: #ffffff;">${kycData.address}</td>
        </tr>
        <tr style="border-bottom: 1px solid #30363d;">
          <td style="padding: 10px; color: #8b949e;">Aadhaar Number:</td>
          <td style="padding: 10px; font-weight: bold; color: #00e676;">${kycData.aadhar}</td>
        </tr>
        <tr style="border-bottom: 1px solid #30363d;">
          <td style="padding: 10px; color: #8b949e;">PAN Card Number:</td>
          <td style="padding: 10px; font-weight: bold; color: #00e676;">${kycData.pan}</td>
        </tr>
      </table>

      <div style="margin-top: 24px; padding: 16px; background-color: #161b22; border-left: 4px solid #00f2fe; border-radius: 4px;">
        <h4 style="margin: 0 0 8px 0; color: #ffffff;">Admin Action Required:</h4>
        <p style="margin: 0; font-size: 13px; color: #8b949e;">Review the attached identity documents (Aadhaar & PAN). If verified, open your Admin Portal to generate login credentials and set the user's initial wallet balance ($200–$500 USD).</p>
      </div>
      <p style="margin-top: 20px; font-size: 12px; color: #6e7681;">Trading Trends Institutional Platform Automated Dispatch</p>
    </div>
  `;

  console.log(`\n======================================================`);
  console.log(`[EMAIL DISPATCH] => To Admin: ${recipient}`);
  console.log(`[SUBJECT] ${subject}`);
  console.log(`[USER NAME] ${kycData.name} | Email: ${kycData.email}`);
  console.log(`[DOCUMENTS ATTACHED] ${attachments.length} files`);
  attachments.forEach(att => console.log(` - File: ${att.filename} (${att.path})`));
  console.log(`======================================================\n`);

  if (transporter) {
    try {
      await transporter.sendMail({
        from: settings.smtpSender || '"Trading Trends" <no-reply@tradingtrends.com>',
        to: recipient,
        subject,
        html,
        attachments
      });
      return { success: true, sent: true };
    } catch (err) {
      console.error('SMTP Delivery error:', err.message);
      return { success: true, sent: false, error: err.message };
    }
  }

  return { success: true, sent: false, note: 'Simulated dispatch (configure SMTP in .env or Admin Settings for live delivery)' };
}

export async function sendCredentialsEmail({ toEmail, username, password, fullName, initialBalance }) {
  const settings = getSettings();
  const transporter = createTransporter();

  const subject = `Welcome to Trading Trends - Your Login Credentials`;
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #0d1117; color: #c9d1d9; padding: 24px; border-radius: 8px;">
      <h2 style="color: #00e676;">Account Approved & Credentials Generated</h2>
      <p>Hello <strong>${fullName}</strong>,</p>
      <p>Your KYC identity documents have been verified by the Trading Trends risk desk. Your trading account is now live!</p>
      
      <div style="background-color: #161b22; padding: 18px; border-radius: 6px; border: 1px solid #30363d; margin: 16px 0;">
        <p style="margin: 4px 0;"><strong>Username:</strong> <code style="color: #58a6ff; font-size: 15px;">${username}</code></p>
        <p style="margin: 4px 0;"><strong>Temporary Password:</strong> <code style="color: #00e676; font-size: 15px;">${password}</code></p>
        <p style="margin: 4px 0;"><strong>Initial Deposited Capital:</strong> <span style="color: #ffd700; font-weight: bold;">$${initialBalance} USD</span></p>
        <p style="margin: 4px 0;"><strong>Daily Algorithmic Yield:</strong> <span style="color: #00e676;">+50 USDT ($50.00 USD) / weekday (Mon-Fri)</span></p>
      </div>

      <p style="font-size: 13px; color: #8b949e;">Your initial investment deposit ($200–$500 USD) has been verified. You can now login at Trading Trends to monitor your daily compounding and manage withdrawals.</p>
    </div>
  `;

  console.log(`\n[EMAIL DISPATCH] => To User: ${toEmail} | Username: ${username} | Password: ${password}`);

  if (transporter) {
    try {
      await transporter.sendMail({
        from: settings.smtpSender || '"Trading Trends" <no-reply@tradingtrends.com>',
        to: toEmail,
        subject,
        html
      });
      return { success: true, sent: true };
    } catch (err) {
      console.error('SMTP Delivery error:', err.message);
      return { success: true, sent: false, error: err.message };
    }
  }

  return { success: true, sent: false };
}

export async function sendWithdrawalRequestEmail({ user, amount, cryptoAddress, network, binanceId }) {
  const settings = getSettings();
  const recipient = process.env.ADMIN_EMAIL || settings.adminEmail || 'admin@tradingtrends.com';
  const transporter = createTransporter();

  const subject = `[URGENT WITHDRAWAL REQUEST] $${amount} USD - ${user.fullName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #0d1117; color: #c9d1d9; padding: 24px; border-radius: 8px;">
      <h2 style="color: #ff7b72;">New Withdrawal Request Pending Approval</h2>
      <p>User <strong>${user.fullName}</strong> (${user.email}) has requested a withdrawal.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px;">
        <tr style="border-bottom: 1px solid #30363d;">
          <td style="padding: 10px; color: #8b949e;">Amount:</td>
          <td style="padding: 10px; font-weight: bold; color: #ffd700; font-size: 16px;">$${amount} USD</td>
        </tr>
        <tr style="border-bottom: 1px solid #30363d;">
          <td style="padding: 10px; color: #8b949e;">Target Network:</td>
          <td style="padding: 10px; color: #ffffff;">${network || 'USDT TRC-20'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #30363d;">
          <td style="padding: 10px; color: #8b949e;">Crypto Wallet Address:</td>
          <td style="padding: 10px; font-family: monospace; color: #58a6ff;">${cryptoAddress || 'N/A'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #30363d;">
          <td style="padding: 10px; color: #8b949e;">Binance ID (if provided):</td>
          <td style="padding: 10px; font-family: monospace; color: #00e676;">${binanceId || 'N/A'}</td>
        </tr>
      </table>

      <div style="margin-top: 20px;">
        <p style="font-size: 13px; color: #8b949e;">Please open your Admin Dashboard to verify funds, transfer the crypto, and approve the transaction.</p>
      </div>
    </div>
  `;

  console.log(`\n======================================================`);
  console.log(`[WITHDRAWAL DISPATCH] => To Admin: ${recipient}`);
  console.log(`[AMOUNT] $${amount} USD | User: ${user.fullName} (${user.email})`);
  console.log(`[PAYOUT DESTINATION] Address: ${cryptoAddress || 'N/A'} | Binance ID: ${binanceId || 'N/A'} | Network: ${network}`);
  console.log(`======================================================\n`);

  if (transporter) {
    try {
      await transporter.sendMail({
        from: settings.smtpSender || '"Trading Trends" <no-reply@tradingtrends.com>',
        to: recipient,
        subject,
        html
      });
      return { success: true, sent: true };
    } catch (err) {
      console.error('SMTP Delivery error:', err.message);
      return { success: true, sent: false, error: err.message };
    }
  }

  return { success: true, sent: false };
}
