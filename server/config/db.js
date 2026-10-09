import mongoose from 'mongoose';
import User from '../models/User.js';
import Service from '../models/Service.js';
import Application from '../models/Application.js';
import WalletTransaction from '../models/WalletTransaction.js';
import Notice from '../models/Notice.js';
import { initialServices, initialNotices } from '../data/seedData.js';
import bcrypt from 'bcryptjs';

let isMongoConnected = false;

// In-Memory store fallback if MongoDB is not running locally
export const memoryStore = {
  users: [],
  services: [],
  applications: [],
  walletTransactions: [],
  notices: [],
};

export const initMemoryStore = async () => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('agent123', salt);
  const hashedAdminPassword = await bcrypt.hash('admin123', salt);

  // Admin user
  const adminUser = {
    _id: 'usr_admin_001',
    name: 'प्रशासक (Admin)',
    phone: '9876543210',
    email: 'admin@yojanadut.in',
    password: hashedAdminPassword,
    role: 'admin',
    referralCode: 'YD-ADMIN01',
    walletBalance: 0,
    pendingBalance: 0,
    totalEarned: 0,
    createdAt: new Date('2026-01-01'),
  };

  // Agent Rahul Shinde (exact match to screenshot: Available ₹455, Pending ₹50, Cleared ₹1,240)
  const agentRahul = {
    _id: 'usr_agent_rahul',
    name: 'राहुल शिंदे (Rahul Shinde)',
    phone: '9822012345',
    email: 'rahul.shinde@yojanadut.in',
    password: hashedPassword,
    role: 'agent',
    referralCode: 'YD-RAHUL100',
    district: 'पुणे',
    taluka: 'शिरूर',
    village: 'शिक्रापूर',
    walletBalance: 455,
    pendingBalance: 50,
    totalEarned: 1240,
    createdAt: new Date('2026-08-10'),
  };

  // Regular citizen user Sunita Patil
  const userSunita = {
    _id: 'usr_citizen_sunita',
    name: 'सुनीता पाटील',
    phone: '9850123456',
    email: 'sunita.patil@gmail.com',
    password: hashedPassword,
    role: 'user',
    referredBy: 'YD-RAHUL100',
    district: 'पुणे',
    walletBalance: 0,
    pendingBalance: 0,
    totalEarned: 0,
    createdAt: new Date('2026-09-15'),
  };

  memoryStore.users = [adminUser, agentRahul, userSunita];

  // Seed services
  memoryStore.services = initialServices.map((s, index) => ({
    _id: `srv_${index + 1}`,
    ...s,
    createdAt: new Date(),
  }));

  // Seed applications matching screenshots:
  // Card 1: YD-24081 - उत्पन्न दाखला · सुनीता पाटील · 2026-10-06 - In Progress (4)
  // Card 2: YD-24077 - पॅन कार्ड (नवीन / दुरुस्ती) · गणेश जाधव · 2026-10-03 - Completed (5)
  // Card 3: YD-24072 - शेतकरी ओळखपत्र (Farmer ID) · आशा शिंदे · 2026-10-02 - Action Required (3)
  const app1 = {
    _id: 'app_24081',
    applicationNumber: 'YD-24081',
    userId: 'usr_citizen_sunita',
    serviceId: 'srv_3', // Income Certificate
    serviceDetails: {
      title: 'Income Certificate (Tahsildar)',
      marathiTitle: 'उत्पन्न दाखला',
      slug: 'income-certificate',
      basePrice: 149,
      agentCommission: 30,
    },
    applicantDetails: {
      fullName: 'सुनीता पाटील',
      phone: '9850123456',
      email: 'sunita.patil@gmail.com',
      district: 'पुणे',
      taluka: 'हवेली',
      village: 'वाघोली',
      aadhaarOrId: 'XXXX-XXXX-8921',
    },
    uploadedDocs: [
      { docType: 'रेशन कार्ड', name: 'ration_card.pdf', url: '/demo-docs/ration_card.pdf', status: 'valid' },
      { docType: 'आधार कार्ड', name: 'aadhaar_card.pdf', url: '/demo-docs/aadhaar_card.pdf', status: 'valid' },
      { docType: 'तलाठी अहवाल', name: 'talathi_ahwal.pdf', url: '/demo-docs/talathi_ahwal.pdf', status: 'valid' },
    ],
    currentStage: 4, // 1: अर्ज प्राप्त, 2: तपासणी, 3: कागदपत्रे, 4: प्रक्रियेत, 5: पूर्ण
    status: 'in_review',
    statusNoteMarathi: 'तहसीलदार कार्यालयाकडून स्वाक्षरी पडताळणी प्रक्रियेत आहे.',
    paymentStatus: 'paid',
    paymentAmount: 149,
    referralCodeUsed: 'YD-RAHUL100',
    agentId: 'usr_agent_rahul',
    timeline: [
      { stage: 1, titleMarathi: 'अर्ज प्राप्त', descriptionMarathi: 'अर्ज यशस्वीरीत्या प्राप्त झाला.', updatedAt: new Date('2026-10-06T10:00:00') },
      { stage: 2, titleMarathi: 'तपासणी पूर्ण', descriptionMarathi: 'प्राथमिक पडताळणी मंजूर झाली.', updatedAt: new Date('2026-10-06T14:30:00') },
      { stage: 3, titleMarathi: 'कागदपत्रे तपासली', descriptionMarathi: 'कागदपत्रे योग्य आढळली.', updatedAt: new Date('2026-10-07T11:00:00') },
      { stage: 4, titleMarathi: 'प्रक्रियेत', descriptionMarathi: 'तहसीलदार कार्यालयात सबमिट केले आहे.', updatedAt: new Date('2026-10-08T16:00:00') },
    ],
    createdAt: new Date('2026-10-06T09:30:00'),
    updatedAt: new Date('2026-10-08T16:00:00'),
  };

  const app2 = {
    _id: 'app_24077',
    applicationNumber: 'YD-24077',
    userId: null,
    serviceId: 'srv_1', // PAN Card
    serviceDetails: {
      title: 'PAN Card (New / Correction)',
      marathiTitle: 'पॅन कार्ड (नवीन / दुरुस्ती)',
      slug: 'pan-card',
      basePrice: 199,
      agentCommission: 40,
    },
    applicantDetails: {
      fullName: 'गणेश जाधव',
      phone: '9822987077',
      email: 'ganesh.jadhav@gmail.com',
      district: 'सातारा',
      taluka: 'कराड',
      village: 'मलकापूर',
      aadhaarOrId: 'XXXX-XXXX-4509',
    },
    uploadedDocs: [
      { docType: 'आधार कार्ड', name: 'aadhaar_doc.pdf', url: '/demo-docs/aadhaar_doc.pdf', status: 'valid' },
      { docType: 'पासपोर्ट फोटो', name: 'photo.jpg', url: '/demo-docs/photo.jpg', status: 'valid' },
      { docType: 'सही', name: 'sign.png', url: '/demo-docs/sign.png', status: 'valid' },
    ],
    currentStage: 5, // 5: पूर्ण
    status: 'completed',
    statusNoteMarathi: 'पॅन कार्ड यशस्वीरीत्या जनरेट झाले आहे. ई-पॅन ईमेल व व्हॉट्सॲपवर पाठवले आहे.',
    paymentStatus: 'paid',
    paymentAmount: 199,
    referralCodeUsed: 'YD-RAHUL100',
    agentId: 'usr_agent_rahul',
    timeline: [
      { stage: 1, titleMarathi: 'अर्ज प्राप्त', descriptionMarathi: 'अर्ज प्राप्त झाला.', updatedAt: new Date('2026-10-03T09:00:00') },
      { stage: 2, titleMarathi: 'तपासणी', descriptionMarathi: 'तपासणी मंजूर.', updatedAt: new Date('2026-10-03T12:00:00') },
      { stage: 3, titleMarathi: 'कागदपत्रे', descriptionMarathi: 'कागदपत्रे प्रमाणित.', updatedAt: new Date('2026-10-03T15:00:00') },
      { stage: 4, titleMarathi: 'प्रक्रियेत', descriptionMarathi: 'NSDL पोर्टलवर सबमिट.', updatedAt: new Date('2026-10-04T10:00:00') },
      { stage: 5, titleMarathi: 'पूर्ण', descriptionMarathi: 'पॅन नंबर मंजूर व कार्ड डिस्पॅच.', updatedAt: new Date('2026-10-05T17:00:00') },
    ],
    createdAt: new Date('2026-10-03T08:45:00'),
    updatedAt: new Date('2026-10-05T17:00:00'),
  };

  const app3 = {
    _id: 'app_24072',
    applicationNumber: 'YD-24072',
    userId: null,
    serviceId: 'srv_4', // Farmer ID
    serviceDetails: {
      title: 'Farmer ID (Shekari Olakhpatra)',
      marathiTitle: 'शेतकरी ओळखपत्र (Farmer ID)',
      slug: 'farmer-id',
      basePrice: 99,
      agentCommission: 25,
    },
    applicantDetails: {
      fullName: 'आशा शिंदे',
      phone: '9890124072',
      email: '',
      district: 'अहमदनगर',
      taluka: 'संगमनेर',
      village: 'धांदरफळ',
      aadhaarOrId: 'XXXX-XXXX-3341',
    },
    uploadedDocs: [
      { docType: '७/१२ उतारा', name: '7_12_extract.pdf', url: '/demo-docs/7_12.pdf', status: 'rejected', rejectionReason: '७/१२ उतारा अस्पष्ट आहे. नवीन डिजिटल स्वाक्षरी असलेला उतारा अपलोड करा.' },
      { docType: 'आधार कार्ड', name: 'aadhaar.pdf', url: '/demo-docs/aadhaar.pdf', status: 'valid' },
    ],
    currentStage: 3,
    status: 'action_needed',
    statusNoteMarathi: 'कागदपत्रे हवीत - कृपया ७/१२ उतारा पुन्हा अपलोड करा.',
    actionRequiredNote: '७/१२ उतारा अस्पष्ट आहे, कृपया अधिकृत डिजिटल ७/१२ उतारा पुन्हा अपलोड करा.',
    paymentStatus: 'paid',
    paymentAmount: 99,
    referralCodeUsed: 'YD-RAHUL100',
    agentId: 'usr_agent_rahul',
    timeline: [
      { stage: 1, titleMarathi: 'अर्ज प्राप्त', descriptionMarathi: 'अर्ज प्राप्त झाला.', updatedAt: new Date('2026-10-02T11:00:00') },
      { stage: 2, titleMarathi: 'तपासणी', descriptionMarathi: 'कागदपत्रे तपासली जात आहेत.', updatedAt: new Date('2026-10-02T16:00:00') },
      { stage: 3, titleMarathi: 'कागदपत्रे हवी', descriptionMarathi: 'कागदपत्र त्रुटी आढळली.', updatedAt: new Date('2026-10-03T10:00:00') },
    ],
    createdAt: new Date('2026-10-02T10:15:00'),
    updatedAt: new Date('2026-10-03T10:00:00'),
  };

  const app4 = {
    _id: 'app_24065',
    applicationNumber: 'YD-24065',
    userId: null,
    serviceId: 'srv_5', // Caste Certificate
    serviceDetails: {
      title: 'Caste Certificate',
      marathiTitle: 'जात प्रमाणपत्र',
      slug: 'caste-certificate',
      basePrice: 249,
      agentCommission: 50,
    },
    applicantDetails: {
      fullName: 'सचिन मारुती तांबडे',
      phone: '9860456123',
      email: 'sachin.tambade@gmail.com',
      district: 'नाशिक',
      taluka: 'निफाड',
      village: 'ओझर',
      aadhaarOrId: 'XXXX-XXXX-3341',
    },
    uploadedDocs: [
      { docType: 'शाळा सोडल्याचा दाखला', name: 'lc_sachin.pdf', url: '/demo-docs/lc.pdf', status: 'valid' },
      { docType: 'जात पुरावा (१९६७)', name: 'old_caste_record_1965.pdf', url: '/demo-docs/caste_proof.pdf', status: 'valid' },
      { docType: 'आधार कार्ड', name: 'aadhaar_sachin.pdf', url: '/demo-docs/aadhaar.pdf', status: 'valid' },
    ],
    currentStage: 2,
    status: 'in_review',
    statusNoteMarathi: 'एसडीओ कार्यालयाकडे कागदपत्रांची प्राथमिक तपासणी सुरू आहे.',
    paymentStatus: 'paid',
    paymentAmount: 249,
    referralCodeUsed: 'YD-RAHUL100',
    agentId: 'usr_agent_rahul',
    timeline: [
      { stage: 1, titleMarathi: 'अर्ज प्राप्त', descriptionMarathi: 'अर्ज प्राप्त झाला.', updatedAt: new Date('2026-10-01T09:50:00') },
      { stage: 2, titleMarathi: 'तपासणी', descriptionMarathi: 'तपासणी सुरू.', updatedAt: new Date('2026-10-01T15:00:00') },
    ],
    createdAt: new Date('2026-10-01T09:50:00'),
    updatedAt: new Date('2026-10-01T15:00:00'),
  };

  const app5 = {
    _id: 'app_24050',
    applicationNumber: 'YD-24050',
    userId: null,
    serviceId: 'srv_2b', // Voter ID
    serviceDetails: {
      title: 'Voter ID',
      marathiTitle: 'मतदार ओळखपत्र',
      slug: 'voter-id',
      basePrice: 99,
      agentCommission: 20,
    },
    applicantDetails: {
      fullName: 'राहुल दत्तात्रय कांबळे',
      phone: '9876543210',
      email: 'rahul.kamble@gmail.com',
      district: 'कोल्हापूर',
      taluka: 'करवीर',
      village: 'शिरोली',
      aadhaarOrId: 'XXXX-XXXX-1994',
    },
    uploadedDocs: [
      { docType: 'आधार कार्ड', name: 'aadhaar_rahul.pdf', url: '/demo-docs/aadhaar.pdf', status: 'valid' },
      { docType: 'वय पुरावा', name: 'birth_cert_rahul.jpg', url: '/demo-docs/birth_cert.jpg', status: 'valid' },
      { docType: 'पासपोर्ट फोटो', name: 'passport_photo_rahul.jpg', url: '/demo-docs/photo.jpg', status: 'valid' },
    ],
    currentStage: 1,
    status: 'submitted',
    statusNoteMarathi: 'नवीन मतदार नोंदणी अर्ज प्राप्त झाला असून पडताळणी बाकी आहे.',
    paymentStatus: 'paid',
    paymentAmount: 99,
    referralCodeUsed: '',
    agentId: null,
    timeline: [
      { stage: 1, titleMarathi: 'अर्ज प्राप्त', descriptionMarathi: 'अर्ज प्राप्त झाला.', updatedAt: new Date('2026-09-29T15:20:00') },
    ],
    createdAt: new Date('2026-09-29T15:20:00'),
    updatedAt: new Date('2026-09-29T15:20:00'),
  };

  memoryStore.applications = [app1, app2, app3, app4, app5];

  // Seed transactions for Agent Rahul Shinde
  memoryStore.walletTransactions = [
    {
      _id: 'tx_001',
      agentId: 'usr_agent_rahul',
      applicationId: 'app_24077',
      applicationNumber: 'YD-24077',
      applicantName: 'गणेश जाधव',
      serviceTitle: 'पॅन कार्ड (नवीन / दुरुस्ती)',
      amount: 40,
      type: 'credit',
      status: 'cleared',
      descriptionMarathi: 'पॅन कार्ड अर्ज यशस्वी पूर्ण झाल्याबद्दल कमिशन',
      createdAt: new Date('2026-10-05T17:15:00'),
    },
    {
      _id: 'tx_002',
      agentId: 'usr_agent_rahul',
      applicationId: 'app_24081',
      applicationNumber: 'YD-24081',
      applicantName: 'सुनीता पाटील',
      serviceTitle: 'उत्पन्न दाखला',
      amount: 30,
      type: 'credit',
      status: 'pending',
      descriptionMarathi: 'उत्पन्न दाखला अर्ज प्रक्रियेत - अंतिम मंजुरीवर जमा होईल',
      createdAt: new Date('2026-10-06T10:30:00'),
    },
    {
      _id: 'tx_003',
      agentId: 'usr_agent_rahul',
      applicationId: null,
      applicationNumber: '',
      applicantName: '',
      serviceTitle: 'बँक ट्रान्सफर विड्रॉल',
      amount: 500,
      type: 'withdrawal',
      status: 'cleared',
      descriptionMarathi: 'UPI खात्यात वर्ग केले (rahul@upi)',
      payoutDetails: { payoutMethod: 'upi', upiId: 'rahulshinde@okaxis', holderName: 'राहुल शिंदे' },
      createdAt: new Date('2026-09-28T14:00:00'),
    },
    {
      _id: 'tx_004',
      agentId: 'usr_agent_rahul',
      applicationId: 'app_past_01',
      applicationNumber: 'YD-23910',
      applicantName: 'महेश बोरसे',
      serviceTitle: 'डिजिटल ७/१२ उतारा',
      amount: 15,
      type: 'credit',
      status: 'cleared',
      descriptionMarathi: '७/१२ उतारा डाउनलोड पूर्ण',
      createdAt: new Date('2026-09-25T11:20:00'),
    },
  ];

  // Seed Notices
  memoryStore.notices = initialNotices.map((n, idx) => ({
    _id: `notice_${idx + 1}`,
    ...n,
    createdAt: new Date(),
  }));

  console.log('✅ In-Memory Data Store successfully initialized with realistic YojanaDut data!');
};

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/yojanadut';
  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2000,
    });
    isMongoConnected = true;
    console.log('🚀 Connected to MongoDB successfully at:', mongoURI);

    // Seed MongoDB collections if empty
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      await Service.insertMany(initialServices);
      console.log('✅ Seeded Services in MongoDB');
    }

    const noticeCount = await Notice.countDocuments();
    if (noticeCount === 0) {
      await Notice.insertMany(initialNotices);
      console.log('✅ Seeded Notices in MongoDB');
    }

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await initMemoryStore();
      // Insert demo users into Mongo
      for (const u of memoryStore.users) {
        await User.create(u);
      }
      for (const a of memoryStore.applications) {
        await Application.create(a);
      }
      for (const t of memoryStore.walletTransactions) {
        await WalletTransaction.create(t);
      }
      console.log('✅ Seeded Demo Users & Applications into MongoDB');
    }
  } catch (error) {
    console.warn('⚠️  MongoDB local server connection failed or unavailable:', error.message);
    console.log('⚡ Switching seamlessly to In-Memory YojanaDut Store (all features work 100%!)');
    isMongoConnected = false;
    await initMemoryStore();
  }
};

export const getIsMongoConnected = () => isMongoConnected;
