import Application from '../models/Application.js';
import Service from '../models/Service.js';
import User from '../models/User.js';
import WalletTransaction from '../models/WalletTransaction.js';
import { memoryStore, getIsMongoConnected } from '../config/db.js';

// Server-Sent Events (SSE) clients set for real-time multi-window sync
const sseClients = new Set();

export const subscribeApplicationsStream = (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });
  if (typeof res.flushHeaders === 'function') {
    res.flushHeaders();
  }

  // Initial handshake
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: Date.now() })}\n\n`);

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
};

export const broadcastApplicationEvent = (type, data) => {
  const payload = `data: ${JSON.stringify({ type, ...data })}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
};

export const enrichApp = (a) => {
  if (!a) return a;
  const doc = a.toObject ? a.toObject() : { ...a };
  return {
    ...doc,
    serviceTitle:
      doc.serviceTitle ||
      doc.serviceDetails?.marathiTitle ||
      doc.serviceDetails?.title ||
      'शासकीय सेवा',
    category: doc.category || doc.serviceDetails?.category || 'certificates',
    categoryMarathi:
      doc.categoryMarathi ||
      doc.serviceDetails?.categoryMarathi ||
      'दाखले / प्रमाणपत्र',
    applicantName: doc.applicantName || doc.applicantDetails?.fullName || 'नागरिक',
    phone: doc.phone || doc.applicantDetails?.phone || '',
    date:
      doc.date ||
      (doc.createdAt
        ? new Date(doc.createdAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]),
    time:
      doc.time ||
      (doc.createdAt
        ? new Date(doc.createdAt).toLocaleTimeString('mr-IN', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : ''),
    payment: doc.payment || {
      amount: doc.paymentAmount || doc.serviceDetails?.basePrice || 149,
      commission: doc.serviceDetails?.agentCommission || 30,
      status: doc.paymentStatus || 'paid',
    },
    paymentAmount:
      doc.paymentAmount ||
      doc.payment?.amount ||
      doc.serviceDetails?.basePrice ||
      149,
    uploadedDocs: doc.uploadedDocs || doc.uploadedDocuments || [],
    uploadedDocuments: doc.uploadedDocs || doc.uploadedDocuments || [],
    issuedDocs: doc.issuedDocs || doc.deliveredDocuments || [],
    deliveredDocuments: doc.issuedDocs || doc.deliveredDocuments || [],
  };
};

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
      if (serviceId && /^[0-9a-fA-F]{24}$/.test(serviceId)) {
        service = await Service.findById(serviceId);
      }
      if (!service) {
        service = await Service.findOne({
          $or: [{ slug: serviceId }, { _id: serviceId }],
        });
      }
    } else {
      service = memoryStore.services.find(
        (s) =>
          String(s._id) === String(serviceId) ||
          s.slug === serviceId ||
          (req.body.serviceTitle && (s.marathiTitle === req.body.serviceTitle || s.title === req.body.serviceTitle))
      );
    }

    if (!service) {
      service = {
        _id: serviceId || 'srv_custom',
        title: req.body.serviceTitle || 'Government Service',
        marathiTitle: req.body.serviceTitle || 'शासकीय सेवा',
        slug: req.body.slug || serviceId || 'govt-service',
        category: req.body.category || 'certificates',
        categoryMarathi: req.body.categoryMarathi || 'दाखले / प्रमाणपत्र',
        basePrice: req.body.basePrice || 99,
        agentCommission: req.body.agentCommission || 25,
      };
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

    // Form docs array from client upload
    const incomingDocs = req.body.uploadedDocs || req.body.uploadedDocuments || uploadedDocs || [];
    const docs = Array.isArray(incomingDocs) && incomingDocs.length > 0
      ? incomingDocs.map((d) => ({
          docType: d.docType || 'कागदपत्र',
          name: d.name || 'दस्तावेज',
          url: d.url || '',
          size: d.size || '',
          type: d.type || '',
          status: 'valid',
          uploadedAt: d.uploadedAt || new Date(),
        }))
      : [];

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
        userId: req.user ? req.user._id : (req.body.userId || null),
        serviceId: service._id,
        serviceDetails: {
          title: service.title,
          marathiTitle: service.marathiTitle,
          slug: service.slug,
          category: service.category || 'certificates',
          categoryMarathi: service.categoryMarathi || 'दाखले / प्रमाणपत्र',
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

      const enrichedMongoApp = enrichApp(newApp);
      broadcastApplicationEvent('NEW_APPLICATION', { application: enrichedMongoApp });

      return res.status(201).json({
        success: true,
        message: 'तुमचा अर्ज यशस्वीरीत्या सादर केला गेला!',
        application: enrichedMongoApp,
      });
    } else {
      const newApp = {
        _id: `app_${Date.now()}`,
        applicationNumber,
        userId: req.user ? req.user._id : (req.body.userId || null),
        serviceId: service._id,
        serviceTitle: service.marathiTitle || service.title,
        serviceDetails: {
          title: service.title,
          marathiTitle: service.marathiTitle,
          slug: service.slug,
          category: service.category || 'certificates',
          categoryMarathi: service.categoryMarathi || 'दाखले / प्रमाणपत्र',
          basePrice: service.basePrice,
          agentCommission: service.agentCommission,
        },
        category: service.category || 'certificates',
        categoryMarathi: service.categoryMarathi || 'दाखले / प्रमाणपत्र',
        applicantName: applicantDetails.fullName,
        phone: applicantDetails.phone,
        applicantDetails,
        uploadedDocs: docs,
        uploadedDocuments: docs,
        currentStage: 1,
        status: 'submitted',
        statusBadge: 'नवीन अर्ज (आज)',
        statusNoteMarathi: 'अर्ज प्राप्त झाला आहे. कागदपत्रे तपासणी लवकरच सुरू होईल.',
        paymentStatus: 'paid',
        paymentAmount: service.basePrice || 99,
        payment: {
          amount: service.basePrice || 99,
          commission: service.agentCommission || 20,
          status: 'paid',
        },
        referralCodeUsed: referralCode ? referralCode.toUpperCase() : '',
        agentId: agent ? agent._id : null,
        timeline: initialTimeline,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' }),
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

      const enrichedApp = enrichApp(newApp);
      broadcastApplicationEvent('NEW_APPLICATION', { application: enrichedApp });

      return res.status(201).json({
        success: true,
        message: 'तुमचा अर्ज यशस्वीरीत्या सादर केला गेला!',
        application: enrichedApp,
      });
    }
  } catch (error) {
    console.error('Create Application Error:', error);
    res.status(500).json({ success: false, message: 'अर्ज सादर करताना त्रुटी आली: ' + error.message });
  }
};

export const trackApplication = async (req, res) => {
  try {
    const { query, phone, userId } = req.query;

    const filterPhone = phone || (query && query.startsWith('phone:') ? query.replace('phone:', '').trim() : null);
    const filterUserId = userId || null;

    // 1. Phone or UserId specific query (User tracking their own applications)
    if (filterPhone || filterUserId) {
      if (getIsMongoConnected()) {
        const mongoFilter = {
          $or: [
            ...(filterPhone ? [{ 'applicantDetails.phone': filterPhone }, { phone: filterPhone }] : []),
            ...(filterUserId ? [{ userId: filterUserId }] : []),
          ],
        };
        const applications = await Application.find(mongoFilter).sort({ createdAt: -1 });
        const enriched = applications.map(enrichApp);
        return res.json({ success: true, count: enriched.length, applications: enriched });
      } else {
        const filtered = memoryStore.applications.filter((app) => {
          const appPhone = app.phone || app.applicantDetails?.phone;
          const matchPhone = filterPhone && appPhone === filterPhone;
          const matchUser = filterUserId && String(app.userId) === String(filterUserId);
          return matchPhone || matchUser;
        });
        const enriched = filtered.map(enrichApp);
        return res.json({ success: true, count: enriched.length, applications: enriched });
      }
    }

    // 2. No query supplied: return empty array rather than dumping other clients' applications
    if (!query || query.trim() === '') {
      return res.json({ success: true, count: 0, applications: [] });
    }

    // 3. Search by Application Number or exact phone digits
    const cleanQuery = query.trim().toUpperCase();
    const digitsOnly = cleanQuery.replace(/\D/g, '');

    if (getIsMongoConnected()) {
      const applications = await Application.find({
        $or: [
          { applicationNumber: { $regex: cleanQuery, $options: 'i' } },
          ...(digitsOnly.length >= 4 ? [{ 'applicantDetails.phone': { $regex: digitsOnly + '$' } }] : []),
          { 'applicantDetails.fullName': { $regex: cleanQuery, $options: 'i' } },
        ],
      }).sort({ createdAt: -1 });

      const enriched = applications.map(enrichApp);
      return res.json({
        success: true,
        count: enriched.length,
        applications: enriched,
      });
    } else {
      const filtered = memoryStore.applications.filter((app) => {
        const matchNumber = app.applicationNumber?.toUpperCase().includes(cleanQuery);
        const appPhone = app.phone || app.applicantDetails?.phone;
        const matchPhone = digitsOnly.length >= 4 && appPhone && appPhone.endsWith(digitsOnly);
        const appName = app.applicantName || app.applicantDetails?.fullName;
        const matchName = appName && appName.toLowerCase().includes(cleanQuery.toLowerCase());
        return matchNumber || matchPhone || matchName;
      });

      const enriched = filtered.map(enrichApp);
      return res.json({
        success: true,
        count: enriched.length,
        applications: enriched,
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
      const enriched = applications.map(enrichApp);
      return res.json({ success: true, count: enriched.length, applications: enriched });
    } else {
      let filtered = [...memoryStore.applications];
      if (status && status !== 'all') {
        filtered = filtered.filter((a) => a.status === status);
      }
      if (stage && stage !== 'all') {
        filtered = filtered.filter((a) => a.currentStage === Number(stage));
      }
      const enriched = filtered.map(enrichApp);
      return res.json({ success: true, count: enriched.length, applications: enriched });
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
      const enrichedMongo = enrichApp(app);
      broadcastApplicationEvent('APPLICATION_UPDATED', { application: enrichedMongo });
      return res.json({ success: true, message: 'अर्जाची स्थिती अद्ययावत केली गेली!', application: enrichedMongo });
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

      const enrichedMemory = enrichApp(app);
      broadcastApplicationEvent('APPLICATION_UPDATED', { application: enrichedMemory });

      return res.json({ success: true, message: 'अर्जाची स्थिती अद्ययावत केली गेली!', application: enrichedMemory });
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

export const sendDocumentToClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { documentName, documentUrl, documentSize, documentType, note, markCompleted = true } = req.body;

    if (!documentName || !documentUrl) {
      return res.status(400).json({ success: false, message: 'दस्तऐवजाचे नाव आणि फाईल आवश्यक आहेत.' });
    }

    const issuedDoc = {
      name: documentName,
      url: documentUrl,
      size: documentSize || '',
      type: documentType || 'application/pdf',
      issuedAt: new Date(),
      issuedBy: 'प्रशासक (Admin)',
      note: note || 'अधिकृत शासकीय दाखला / दस्तऐवज तयार झाला असून जारी केला आहे.',
    };

    if (getIsMongoConnected()) {
      const app = await Application.findById(id);
      if (!app) return res.status(404).json({ success: false, message: 'अर्ज सापडला नाही.' });

      if (!Array.isArray(app.issuedDocs)) app.issuedDocs = [];
      app.issuedDocs.push(issuedDoc);

      if (markCompleted) {
        app.currentStage = 4;
        app.status = 'completed';
        app.statusNoteMarathi = 'अधिकृत प्रमाणपत्र जारी झाले आहे. कृपया डाऊनलोड करा.';
      }

      app.timeline.push({
        stage: app.currentStage,
        titleMarathi: 'प्रमाणपत्र जारी झाले',
        descriptionMarathi: `${documentName} नागरिकाला पाठवण्यात आले आहे.`,
        updatedAt: new Date(),
      });

      // Clear agent commission if completed
      if (app.status === 'completed' && app.agentId) {
        const tx = await WalletTransaction.findOne({ applicationId: app._id, agentId: app.agentId, type: 'credit' });
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
      const enriched = enrichApp(app);
      broadcastApplicationEvent('APPLICATION_UPDATED', { application: enriched });
      return res.json({ success: true, message: 'दस्तऐवज नागरिकाला यशस्वीरीत्या पाठवला!', application: enriched });
    } else {
      const app = memoryStore.applications.find((a) => String(a._id) === String(id) || a.applicationNumber === id);
      if (!app) return res.status(404).json({ success: false, message: 'अर्ज सापडला नाही.' });

      if (!Array.isArray(app.issuedDocs)) app.issuedDocs = [];
      app.issuedDocs.push(issuedDoc);
      app.deliveredDocuments = app.issuedDocs;

      if (markCompleted) {
        app.currentStage = 4;
        app.status = 'completed';
        app.statusNoteMarathi = 'अधिकृत प्रमाणपत्र जारी झाले आहे. कृपया डाऊनलोड करा.';
      }

      app.timeline.push({
        stage: app.currentStage,
        titleMarathi: 'प्रमाणपत्र जारी झाले',
        descriptionMarathi: `${documentName} नागरिकाला पाठवण्यात आले आहे.`,
        updatedAt: new Date(),
      });
      app.updatedAt = new Date();

      if (app.status === 'completed' && app.agentId) {
        const tx = memoryStore.walletTransactions.find((t) => String(t.applicationId) === String(app._id) && t.type === 'credit' && t.status === 'pending');
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

      const enriched = enrichApp(app);
      broadcastApplicationEvent('APPLICATION_UPDATED', { application: enriched });
      return res.json({ success: true, message: 'दस्तऐवज नागरिकाला यशस्वीरीत्या पाठवला!', application: enriched });
    }
  } catch (error) {
    console.error('Send document error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
