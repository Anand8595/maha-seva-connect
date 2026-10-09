import Application from '../models/Application.js';
import Service from '../models/Service.js';
import User from '../models/User.js';
import WalletTransaction from '../models/WalletTransaction.js';
import { memoryStore, getIsMongoConnected } from '../config/db.js';

export const createApplication = async (req, res) => {
  try {
    const {
      serviceId,
      applicantDetails,
      referralCode,
      uploadedDocs = [],
    } = req.body;

    if (!serviceId || !applicantDetails || !applicantDetails.fullName || !applicantDetails.phone) {
      return res.status(400).json({
        success: false,
        message: 'कृपया सेवा निवडा आणि अर्जदाराचे नाव व मोबाईल नंबर प्रविष्ट करा.',
      });
    }

    // Generate custom YD-XXXXX number
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const applicationNumber = `YD-${randomSuffix}`;

    // Find service
    let service;
    if (getIsMongoConnected()) {
      service = await Service.findById(serviceId);
    } else {
      service = memoryStore.services.find((s) => String(s._id) === String(serviceId) || s.slug === serviceId);
    }

    if (!service) {
      return res.status(404).json({ success: false, message: 'निवडलेली सेवा उपलब्ध नाही.' });
    }

    // Process referral code
    let agent = null;
    let agentCommission = service.agentCommission || 40;
    if (referralCode) {
      const cleanRef = referralCode.trim().toUpperCase();
      if (getIsMongoConnected()) {
        agent = await User.findOne({ referralCode: cleanRef });
      } else {
        agent = memoryStore.users.find((u) => u.referralCode && u.referralCode.toUpperCase() === cleanRef);
      }
    }

    // Form docs array
    const docs = Array.isArray(uploadedDocs) && uploadedDocs.length > 0
      ? uploadedDocs.map((d) => ({
          docType: d.docType || 'कागदपत्र',
          name: d.name || 'दस्तावेज',
          url: d.url || '/uploads/default-doc.pdf',
          status: 'valid',
        }))
      : [
          { docType: 'आधार कार्ड', name: 'aadhaar_card.pdf', url: '/demo-docs/aadhaar.pdf', status: 'valid' },
          { docType: 'ओळख पुरावा', name: 'photo.jpg', url: '/demo-docs/photo.jpg', status: 'valid' },
        ];

    const initialTimeline = [
      {
        stage: 1,
        titleMarathi: 'अर्ज प्राप्त',
        descriptionMarathi: 'तुमचा अर्ज व कागदपत्रे यशस्वीरीत्या प्राप्त झाली आहेत.',
        updatedAt: new Date(),
      },
    ];

    if (getIsMongoConnected()) {
      const newApp = await Application.create({
        applicationNumber,
        userId: req.user ? req.user._id : null,
        serviceId: service._id,
        serviceDetails: {
          title: service.title,
          marathiTitle: service.marathiTitle,
          slug: service.slug,
          basePrice: service.basePrice,
          agentCommission: service.agentCommission,
        },
        applicantDetails,
        uploadedDocs: docs,
        currentStage: 1,
        status: 'submitted',
        statusNoteMarathi: 'अर्ज प्राप्त झाला आहे. कागदपत्रे तपासणी लवकरच सुरू होईल.',
        paymentStatus: 'paid',
        paymentAmount: service.basePrice,
        referralCodeUsed: referralCode ? referralCode.toUpperCase() : '',
        agentId: agent ? agent._id : null,
        timeline: initialTimeline,
      });

      // If referred by agent, create pending commission
      if (agent) {
        await WalletTransaction.create({
          agentId: agent._id,
          applicationId: newApp._id,
          applicationNumber: newApp.applicationNumber,
          applicantName: applicantDetails.fullName,
          serviceTitle: service.marathiTitle,
          amount: agentCommission,
          type: 'credit',
          status: 'pending',
          descriptionMarathi: `${service.marathiTitle} अर्ज रेफरल कमिशन (मंजुरीनंतर जमा)`,
        });

        // Update agent pending balance
        await User.findByIdAndUpdate(agent._id, {
          $inc: { pendingBalance: agentCommission },
        });
      }

      return res.status(201).json({
        success: true,
        message: 'तुमचा अर्ज यशस्वीरीत्या सादर केला गेला!',
        application: newApp,
      });
    } else {
      const newApp = {
        _id: `app_${Date.now()}`,
        applicationNumber,
        userId: req.user ? req.user._id : null,
        serviceId: service._id,
        serviceDetails: {
          title: service.title,
          marathiTitle: service.marathiTitle,
          slug: service.slug,
          basePrice: service.basePrice,
          agentCommission: service.agentCommission,
        },
        applicantDetails,
        uploadedDocs: docs,
        currentStage: 1,
        status: 'submitted',
        statusNoteMarathi: 'अर्ज प्राप्त झाला आहे. कागदपत्रे तपासणी लवकरच सुरू होईल.',
        paymentStatus: 'paid',
        paymentAmount: service.basePrice,
        referralCodeUsed: referralCode ? referralCode.toUpperCase() : '',
        agentId: agent ? agent._id : null,
        timeline: initialTimeline,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      memoryStore.applications.unshift(newApp);

      if (agent) {
        memoryStore.walletTransactions.unshift({
          _id: `tx_${Date.now()}`,
          agentId: agent._id,
          applicationId: newApp._id,
          applicationNumber: newApp.applicationNumber,
          applicantName: applicantDetails.fullName,
          serviceTitle: service.marathiTitle,
          amount: agentCommission,
          type: 'credit',
          status: 'pending',
          descriptionMarathi: `${service.marathiTitle} अर्ज रेफरल कमिशन (मंजुरीनंतर जमा)`,
          createdAt: new Date(),
        });
        agent.pendingBalance = (agent.pendingBalance || 0) + agentCommission;
      }

      return res.status(201).json({
        success: true,
        message: 'तुमचा अर्ज यशस्वीरीत्या सादर केला गेला!',
        application: newApp,
      });
    }
  } catch (error) {
    console.error('Create Application Error:', error);
    res.status(500).json({ success: false, message: 'अर्ज सादर करताना त्रुटी आली: ' + error.message });
  }
};

export const trackApplication = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === '' || query.toLowerCase() === 'all') {
      // Return recent applications for the Demo list (matching Screenshot 1)
      if (getIsMongoConnected()) {
        const apps = await Application.find().sort({ createdAt: -1 }).limit(10);
        return res.json({ success: true, count: apps.length, applications: apps });
      } else {
        return res.json({
          success: true,
          count: memoryStore.applications.length,
          applications: memoryStore.applications,
        });
      }
    }

    const cleanQuery = query.trim().toUpperCase();

    if (getIsMongoConnected()) {
      // Search by Application ID (e.g. YD-24081 or 24081) OR mobile ending with digits
      const applications = await Application.find({
        $or: [
          { applicationNumber: { $regex: cleanQuery, $options: 'i' } },
          { 'applicantDetails.phone': { $regex: cleanQuery.replace(/\D/g, '') + '$' } },
          { 'applicantDetails.fullName': { $regex: cleanQuery, $options: 'i' } },
        ],
      }).sort({ createdAt: -1 });

      return res.json({
        success: true,
        count: applications.length,
        applications,
      });
    } else {
      const digitsOnly = cleanQuery.replace(/\D/g, '');
      const filtered = memoryStore.applications.filter((app) => {
        const matchNumber = app.applicationNumber.toUpperCase().includes(cleanQuery);
        const matchPhone = digitsOnly && app.applicantDetails.phone && app.applicantDetails.phone.endsWith(digitsOnly);
        const matchName = app.applicantDetails.fullName.toLowerCase().includes(cleanQuery.toLowerCase());
        return matchNumber || matchPhone || matchName;
      });

      return res.json({
        success: true,
        count: filtered.length,
        applications: filtered,
      });
    }
  } catch (error) {
    console.error('Track Application Error:', error);
    res.status(500).json({ success: false, message: 'अर्ज शोधताना त्रुटी आली.' });
  }
};

export const getAllApplications = async (req, res) => {
  try {
    const { status, stage } = req.query;

    if (getIsMongoConnected()) {
      const filter = {};
      if (status && status !== 'all') filter.status = status;
      if (stage && stage !== 'all') filter.currentStage = Number(stage);

      const applications = await Application.find(filter).sort({ createdAt: -1 });
      return res.json({ success: true, count: applications.length, applications });
    } else {
      let filtered = [...memoryStore.applications];
      if (status && status !== 'all') {
        filtered = filtered.filter((a) => a.status === status);
      }
      if (stage && stage !== 'all') {
        filtered = filtered.filter((a) => a.currentStage === Number(stage));
      }
      return res.json({ success: true, count: filtered.length, applications: filtered });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateApplicationStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentStage, status, statusNoteMarathi, actionRequiredNote } = req.body;

    const stageTitles = {
      1: 'अर्ज प्राप्त',
      2: 'तपासणी',
      3: 'कागदपत्रे',
      4: 'प्रक्रियेत',
      5: 'पूर्ण',
    };

    if (getIsMongoConnected()) {
      const app = await Application.findById(id);
      if (!app) {
        return res.status(404).json({ success: false, message: 'अर्ज सापडला नाही.' });
      }

      if (currentStage) app.currentStage = Number(currentStage);
      if (status) app.status = status;
      if (statusNoteMarathi) app.statusNoteMarathi = statusNoteMarathi;
      if (actionRequiredNote !== undefined) app.actionRequiredNote = actionRequiredNote;

      const newTimelineEntry = {
        stage: app.currentStage,
        titleMarathi: stageTitles[app.currentStage] || 'स्थिती बदलली',
        descriptionMarathi: statusNoteMarathi || `अर्ज स्टेज ${app.currentStage} वर गेला आहे.`,
        updatedAt: new Date(),
      };
      app.timeline.push(newTimelineEntry);

      // If marked as completed (stage 5 / completed) and referred by agent
      if ((app.currentStage === 5 || status === 'completed') && app.agentId) {
        // Clear pending commission
        const tx = await WalletTransaction.findOne({
          applicationId: app._id,
          agentId: app.agentId,
          type: 'credit',
        });

        if (tx && tx.status === 'pending') {
          tx.status = 'cleared';
          tx.processedAt = new Date();
          await tx.save();

          await User.findByIdAndUpdate(app.agentId, {
            $inc: { walletBalance: tx.amount, pendingBalance: -tx.amount, totalEarned: tx.amount },
          });
        }
      }

      await app.save();
      return res.json({ success: true, message: 'अर्जाची स्थिती अद्ययावत केली गेली!', application: app });
    } else {
      const app = memoryStore.applications.find((a) => String(a._id) === String(id) || a.applicationNumber === id);
      if (!app) {
        return res.status(404).json({ success: false, message: 'अर्ज सापडला नाही.' });
      }

      if (currentStage) app.currentStage = Number(currentStage);
      if (status) app.status = status;
      if (statusNoteMarathi) app.statusNoteMarathi = statusNoteMarathi;
      if (actionRequiredNote !== undefined) app.actionRequiredNote = actionRequiredNote;

      app.timeline.push({
        stage: app.currentStage,
        titleMarathi: stageTitles[app.currentStage] || 'स्थिती बदलली',
        descriptionMarathi: statusNoteMarathi || `अर्ज स्टेज ${app.currentStage} वर गेला आहे.`,
        updatedAt: new Date(),
      });
      app.updatedAt = new Date();

      // Check agent commission payout if completed
      if ((app.currentStage === 5 || status === 'completed') && app.agentId) {
        const tx = memoryStore.walletTransactions.find(
          (t) => String(t.applicationId) === String(app._id) && t.type === 'credit' && t.status === 'pending'
        );
        if (tx) {
          tx.status = 'cleared';
          tx.processedAt = new Date();
          const agent = memoryStore.users.find((u) => String(u._id) === String(app.agentId));
          if (agent) {
            agent.walletBalance = (agent.walletBalance || 0) + tx.amount;
            agent.pendingBalance = Math.max(0, (agent.pendingBalance || 0) - tx.amount);
            agent.totalEarned = (agent.totalEarned || 0) + tx.amount;
          }
        }
      }

      return res.json({ success: true, message: 'अर्जाची स्थिती अद्ययावत केली गेली!', application: app });
    }
  } catch (error) {
    console.error('Update Application Stage Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadMissingDocs = async (req, res) => {
  try {
    const { id } = req.params;
    const { docName, docUrl } = req.body;

    if (!docName) {
      return res.status(400).json({ success: false, message: 'कागदपत्राचे नाव आवश्यक आहे.' });
    }

    if (getIsMongoConnected()) {
      const app = await Application.findById(id);
      if (!app) return res.status(404).json({ success: false, message: 'अर्ज सापडला नाही.' });

      app.uploadedDocs.push({
        docType: docName,
        name: docName,
        url: docUrl || '/demo-docs/reuploaded-doc.pdf',
        status: 'valid',
        uploadedAt: new Date(),
      });

      // Move back to in_review
      app.status = 'in_review';
      app.currentStage = 3;
      app.statusNoteMarathi = 'नवीन कागदपत्रे प्राप्त झाली आहेत. तपासणी प्रक्रियेत आहे.';
      app.actionRequiredNote = '';
      app.timeline.push({
        stage: 3,
        titleMarathi: 'कागदपत्रे पुन्हा अपलोड केली',
        descriptionMarathi: `${docName} यशस्वीरीत्या अपलोड करण्यात आले.`,
        updatedAt: new Date(),
      });

      await app.save();
      return res.json({ success: true, message: 'कागदपत्रे यशस्वीरीत्या अपलोड झाली!', application: app });
    } else {
      const app = memoryStore.applications.find((a) => String(a._id) === String(id) || a.applicationNumber === id);
      if (!app) return res.status(404).json({ success: false, message: 'अर्ज सापडला नाही.' });

      app.uploadedDocs.push({
        docType: docName,
        name: docName,
        url: docUrl || '/demo-docs/reuploaded-doc.pdf',
        status: 'valid',
        uploadedAt: new Date(),
      });

      app.status = 'in_review';
      app.currentStage = 3;
      app.statusNoteMarathi = 'नवीन कागदपत्रे प्राप्त झाली आहेत. तपासणी प्रक्रियेत आहे.';
      app.actionRequiredNote = '';
      app.timeline.push({
        stage: 3,
        titleMarathi: 'कागदपत्रे पुन्हा अपलोड केली',
        descriptionMarathi: `${docName} यशस्वीरीत्या अपलोड करण्यात आले.`,
        updatedAt: new Date(),
      });
      app.updatedAt = new Date();

      return res.json({ success: true, message: 'कागदपत्रे यशस्वीरीत्या अपलोड झाली!', application: app });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
