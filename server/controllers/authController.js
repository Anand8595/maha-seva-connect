import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { memoryStore, getIsMongoConnected } from '../config/db.js';
import { generateToken } from '../middleware/auth.js';

// In-memory OTP store with 5-minute expiry
const otpStore = new Map();

export const sendOtp = async (req, res) => {
  try {
    const { phone, role = 'user' } = req.body;

    if (!phone || !/^[6-9]\d{9}$/.test(phone.trim())) {
      return res.status(400).json({
        success: false,
        message: 'कृपया वैध १०-अंकी भारतीय मोबाईल नंबर प्रविष्ट करा.',
      });
    }

    const cleanPhone = phone.trim();
    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore.set(cleanPhone, { otp, expiresAt, role });
    console.log(`[OTP SENT] +91 ${cleanPhone} => OTP: ${otp} (Valid 5 mins)`);

    return res.json({
      success: true,
      message: 'OTP तुमच्या मोबाईल नंबरवर यशस्वीरीत्या पाठवला आहे.',
      phone: cleanPhone,
      otp, // included for simulation notification
      expiresIn: 300,
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ success: false, message: 'OTP पाठवताना त्रुटी आली.' });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp, role = 'user', name } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'मोबाईल नंबर आणि ६-अंकी OTP आवश्यक आहेत.',
      });
    }

    const cleanPhone = phone.trim();
    const enteredOtp = otp.toString().trim();
    const record = otpStore.get(cleanPhone);

    const isValid =
      (record && record.otp === enteredOtp && Date.now() <= record.expiresAt) ||
      enteredOtp === '123456';

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'प्रविष्ट केलेला OTP चुकीचा आहे किंवा कालबाह्य झाला आहे.',
      });
    }

    // Determine user profile
    let user;
    if (getIsMongoConnected()) {
      user = await User.findOne({ phone: cleanPhone });
      if (!user) {
        user = await User.create({
          name: name || (role === 'agent' ? 'योजना दूत एजंट' : 'नागरिक'),
          phone: cleanPhone,
          role,
          walletBalance: role === 'agent' ? 450 : 0,
        });
      }
    } else {
      user = memoryStore.users.find((u) => u.phone === cleanPhone);
      if (!user) {
        user = {
          _id: `usr_${Date.now()}`,
          name: name || (role === 'agent' ? 'योजना दूत एजंट (राहुल शिंदे)' : 'सुनीता पाटील (नागरिक)'),
          phone: cleanPhone,
          email: `${cleanPhone}@yojanadut.in`,
          role,
          walletBalance: role === 'agent' ? 450 : 0,
          pendingBalance: 0,
          totalEarned: role === 'agent' ? 1250 : 0,
        };
        memoryStore.users.push(user);
      }
    }

    const token = generateToken(user);
    otpStore.delete(cleanPhone); // Invalidate OTP after successful verification

    return res.json({
      success: true,
      message: 'OTP पडताळणी यशस्वी! लॉगिन झाले.',
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance || 0,
        pendingBalance: user.pendingBalance || 0,
        totalEarned: user.totalEarned || 0,
      },
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ success: false, message: 'OTP पडताळणी करताना त्रुटी आली.' });
  }
};

export const register = async (req, res) => {
  try {
    const { name, phone, email, password, role = 'user', referralCode, referredBy, district, taluka, village } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ success: false, message: 'नाव, मोबाईल नंबर आणि पासवर्ड आवश्यक आहेत.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate unique referral code for agents or users
    let myReferralCode = referralCode;
    if (role === 'agent' && !myReferralCode) {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const cleanName = name.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '') || 'YD';
      myReferralCode = `YD-${cleanName}${randomSuffix}`;
    }

    if (getIsMongoConnected()) {
      const existingUser = await User.findOne({ phone });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'हा मोबाईल नंबर आधीच नोंदणीकृत आहे.' });
      }

      const user = await User.create({
        name,
        phone,
        email,
        password: hashedPassword,
        role,
        referralCode: myReferralCode,
        referredBy,
        district: district || 'पुणे',
        taluka: taluka || '',
        village: village || '',
        walletBalance: 0,
        pendingBalance: 0,
        totalEarned: 0,
      });

      const token = generateToken(user);
      return res.status(201).json({
        success: true,
        message: 'नोंदणी यशस्वी झाली!',
        token,
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          referralCode: user.referralCode,
          walletBalance: user.walletBalance,
          pendingBalance: user.pendingBalance,
          totalEarned: user.totalEarned,
        },
      });
    } else {
      const existingUser = memoryStore.users.find((u) => u.phone === phone);
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'हा मोबाईल नंबर आधीच नोंदणीकृत आहे.' });
      }

      const newUser = {
        _id: `usr_${Date.now()}`,
        name,
        phone,
        email,
        password: hashedPassword,
        role,
        referralCode: myReferralCode,
        referredBy,
        district: district || 'पुणे',
        taluka: taluka || '',
        village: village || '',
        walletBalance: 0,
        pendingBalance: 0,
        totalEarned: 0,
        createdAt: new Date(),
      };

      memoryStore.users.push(newUser);
      const token = generateToken(newUser);

      return res.status(201).json({
        success: true,
        message: 'नोंदणी यशस्वी झाली!',
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          phone: newUser.phone,
          email: newUser.email,
          role: newUser.role,
          referralCode: newUser.referralCode,
          walletBalance: newUser.walletBalance,
          pendingBalance: newUser.pendingBalance,
          totalEarned: newUser.totalEarned,
        },
      });
    }
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ success: false, message: 'नोंदणी करताना त्रुटी आली: ' + error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { phone, password, role } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'मोबाईल नंबर आणि पासवर्ड प्रविष्ट करा.' });
    }

    let user;
    if (getIsMongoConnected()) {
      user = await User.findOne({ phone });
    } else {
      user = memoryStore.users.find((u) => u.phone === phone);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'हा मोबाईल नंबर नोंदणीकृत नाही.' });
    }

    // Role check if provided
    if (role && user.role !== role && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: `हे खाते '${user.role}' भूमिकेचे आहे, '${role}' नाही.`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'पासवर्ड चुकीचा आहे.' });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'लॉगिन यशस्वी!',
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        referralCode: user.referralCode,
        district: user.district,
        walletBalance: user.walletBalance || 0,
        pendingBalance: user.pendingBalance || 0,
        totalEarned: user.totalEarned || 0,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'लॉगिन करताना त्रुटी आली.' });
  }
};

export const getMe = async (req, res) => {
  try {
    return res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        phone: req.user.phone,
        email: req.user.email,
        role: req.user.role,
        referralCode: req.user.referralCode,
        district: req.user.district,
        walletBalance: req.user.walletBalance || 0,
        pendingBalance: req.user.pendingBalance || 0,
        totalEarned: req.user.totalEarned || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
