import jwt from 'jsonwebtoken';
import { memoryStore, getIsMongoConnected } from '../config/db.js';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'yojanadut_super_secret_jwt_key_2026';

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      phone: user.phone,
      role: user.role,
      referralCode: user.referralCode,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'अधिकृत प्रवेश नाही. कृपया लॉगिन करा.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (getIsMongoConnected()) {
      req.user = await User.findById(decoded.id).select('-password');
    } else {
      req.user = memoryStore.users.find((u) => String(u._id) === String(decoded.id));
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'वापरकर्ता सापडला नाही.' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'टोकन अवैध किंवा कालबाह्य झाले आहे.' });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'या पेजवर प्रवेश करण्याची परवानगी नाही (फक्त अधिकृत खात्यांसाठी).',
      });
    }
    next();
  };
};
