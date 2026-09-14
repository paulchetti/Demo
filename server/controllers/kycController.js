import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { sendKycSubmissionEmail } from '../services/emailService.js';
import { addKycSubmission } from '../database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const cleanExt = path.extname(file.originalname) || '.pdf';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + cleanExt);
  }
});

export const uploadKycDocs = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB per file
}).fields([
  { name: 'aadharFrontFile', maxCount: 1 },
  { name: 'aadharBackFile', maxCount: 1 },
  { name: 'aadharFile', maxCount: 1 },
  { name: 'panFile', maxCount: 1 }
]);

export async function submitKyc(req, res) {
  try {
    const { name, email, phone, dob, address, aadhar, pan } = req.body;

    if (!name || !email || !phone || !dob || !address || !aadhar || !pan) {
      return res.status(400).json({ error: 'All 7 identity fields are required' });
    }

    const files = [];
    if (req.files?.aadharFrontFile?.[0]) {
      const f = req.files.aadharFrontFile[0];
      files.push({ originalname: `Aadhaar_Front_${f.originalname}`, filename: f.filename, path: f.path, label: 'Aadhaar (Front Side)' });
    }
    if (req.files?.aadharBackFile?.[0]) {
      const f = req.files.aadharBackFile[0];
      files.push({ originalname: `Aadhaar_Back_${f.originalname}`, filename: f.filename, path: f.path, label: 'Aadhaar (Back Side)' });
    }
    if (req.files?.aadharFile?.[0]) {
      const f = req.files.aadharFile[0];
      files.push({ originalname: f.originalname, filename: f.filename, path: f.path, label: 'Aadhaar Document' });
    }
    if (req.files?.panFile?.[0]) {
      const f = req.files.panFile[0];
      files.push({ originalname: `PAN_${f.originalname}`, filename: f.filename, path: f.path, label: 'PAN Card' });
    }

    const kycData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      dob: dob.trim(),
      address: address.trim(),
      aadhar: aadhar.trim(),
      pan: pan.trim(),
      files: files.map(f => ({ originalname: f.originalname, filename: f.filename, path: f.path, label: f.label }))
    };

    // Store in internal registry so admin can review and easily 1-click create user
    addKycSubmission(kycData);

    // Send email dispatch with attachments to Admin
    await sendKycSubmissionEmail({ kycData, files });

    return res.status(200).json({
      success: true,
      message: 'KYC Verification Application successfully submitted! Our risk desk has received your documents and will dispatch your verified login credentials to your email upon approval.'
    });
  } catch (err) {
    console.error('KYC submission error:', err);
    return res.status(500).json({ error: 'Failed to process KYC application: ' + err.message });
  }
}
