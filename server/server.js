import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, getIsMongoConnected } from './config/db.js';
import { upload } from './middleware/upload.js';

import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Copy hero family image if available
try {
  const artifactImage = 'C:\\Users\\anand\\.gemini\\antigravity-ide\\brain\\8221976d-40c1-4560-a643-a2ec58678f5f\\yojanadut_hero_family_1791538567981.jpg';
  const clientPublicDir = path.resolve(__dirname, '../client/public');
  if (fs.existsSync(artifactImage)) {
    if (!fs.existsSync(clientPublicDir)) fs.mkdirSync(clientPublicDir, { recursive: true });
    fs.copyFileSync(artifactImage, path.join(clientPublicDir, 'hero-family.jpg'));
    console.log('📸 Hero family image synced to client/public/hero-family.jpg');
  }
} catch (e) {
  console.warn('Could not copy hero image:', e.message);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static files for uploaded docs
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/notices', noticeRoutes);

// File upload endpoint for documents
app.post('/api/upload', upload.single('document'), (req, res) => {
  try {
    if (!req.file) {
      // If no file provided (e.g. simulated upload), return a demo placeholder url
      return res.json({
        success: true,
        fileUrl: `/uploads/demo-doc-${Date.now()}.pdf`,
        fileName: 'uploaded_document.pdf',
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    return res.json({
      success: true,
      fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'फाईल अपलोड करताना त्रुटी: ' + error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'YojanaDut API',
    mongoConnected: getIsMongoConnected(),
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'सर्व्हरवर अनपेक्षित त्रुटी आली.',
  });
});

// Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🌟 YojanaDut API Server running on port ${PORT}`);
    console.log(`📍 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`===============================================`);
  });
});
