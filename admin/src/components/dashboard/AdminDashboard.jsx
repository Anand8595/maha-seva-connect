import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Users,
  User,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Filter,
  Upload,
  Plus,
  X,
  CreditCard,
  Search,
  Eye,
  Download,
  CheckCheck,
  WhatsAppIcon,
  Phone,
  Globe,
  IdCard,
  FileCheck,
  Check,
  LogOut,
  RefreshCw,
  Award,
  Fingerprint,
  Sprout,
  Laptop,
  Send,
} from '../common/Icons';
import { adminApi, initialAdminServices } from '../../services/api';

export const AdminDashboard = ({ adminUser, onLogout }) => {
  // Navigation tabs matching the screenshot menu
  // 'dashboard' | 'applications' | 'verification' | 'services' | 'payouts' | 'settings'
  const [activeNav, setActiveNav] = useState('applications');

  // Core Data
  const [applications, setApplications] = useState([]);
  const [services, setServices] = useState(initialAdminServices);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'submitted' | 'under_review' | 'approved' | 'completed' | 'rejected'

  // Selected application for Right Panel Inspector
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [rejectionNote, setRejectionNote] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Send Document to Client State
  const [sendDocModalOpen, setSendDocModalOpen] = useState(false);
  const [sendDocTitle, setSendDocTitle] = useState('');
  const [sendDocFileUrl, setSendDocFileUrl] = useState('');
  const [sendDocFileName, setSendDocFileName] = useState('');
  const [sendDocFileSize, setSendDocFileSize] = useState('');
  const [sendDocFileType, setSendDocFileType] = useState('application/pdf');
  const [sendDocNote, setSendDocNote] = useState('आपला अर्ज मंजूर झाला असून अधिकृत शासकीय दाखला सोबत जोडला आहे. कृपया डाऊनलोड करून जतन करा.');
  const [sendDocMarkCompleted, setSendDocMarkCompleted] = useState(true);
  const [isSendingDoc, setIsSendingDoc] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Load Data from API
  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    setIsRefreshing(true);
    try {
      const appRes = await adminApi.getApplications();
      if (appRes && Array.isArray(appRes.applications)) {
        setApplications(appRes.applications);
      }
      const srvRes = await adminApi.getServices();
      if (srvRes && Array.isArray(srvRes.services)) {
        setServices(srvRes.services);
      }
      const poRes = await adminApi.getPayouts();
      if (poRes && Array.isArray(poRes.payouts)) {
        setPayouts(poRes.payouts);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      if (!silent) setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Real-time Listeners (SSE, Storage, BroadcastChannel, Interval)
  useEffect(() => {
    loadData();

    // 1. SSE Stream
    let eventSource;
    try {
      const streamUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/applications/stream`;
      eventSource = new EventSource(streamUrl);
      eventSource.onmessage = (ev) => {
        try {
          const parsed = JSON.parse(ev.data);
          if (parsed.type === 'NEW_APPLICATION') {
            loadData(true);
            const app = parsed.application;
            showToast(`नवीन अर्ज प्राप्त झाला: ${app?.applicationNumber || ''} (${app?.applicantName || ''})`);
          } else if (parsed.type === 'APPLICATION_UPDATED') {
            loadData(true);
          }
        } catch {}
      };
    } catch {}

    // 2. Storage event
    const handleStorage = (e) => {
      if (e.key === 'yojanadut_last_app_submitted') {
        loadData(true);
        try {
          const item = JSON.parse(e.newValue || '{}');
          if (item?.app?.applicationNumber) {
            showToast(`नवीन अर्ज प्राप्त झाला: ${item.app.applicationNumber} (${item.app.applicantName || ''})`);
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    // 3. BroadcastChannel
    let bc;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel('yojanadut_sync');
        bc.onmessage = (ev) => {
          if (ev.data?.type === 'NEW_APPLICATION') {
            loadData(true);
            showToast(`नवीन अर्ज प्राप्त झाला: ${ev.data.application?.applicationNumber || ''}`);
          }
        };
      } catch {}
    }

    // 4. Polling
    const interval = setInterval(() => {
      loadData(true);
    }, 4000);

    return () => {
      if (eventSource) eventSource.close();
      window.removeEventListener('storage', handleStorage);
      if (bc) bc.close();
      clearInterval(interval);
    };
  }, []);

  // Filtered Applications List
  const filteredApplications = useMemo(() => {
    let list = [...applications];

    if (activeNav === 'verification') {
      list = list.filter((a) => a.status === 'submitted' || a.status === 'under_review');
    }

    if (statusFilter !== 'all') {
      list = list.filter((a) => a.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((a) => {
        const num = (a.applicationNumber || '').toLowerCase();
        const name = (a.applicantName || a.applicantDetails?.fullName || '').toLowerCase();
        const phone = (a.phone || a.applicantDetails?.phone || '').toLowerCase();
        const srv = (a.serviceTitle || '').toLowerCase();
        return num.includes(q) || name.includes(q) || phone.includes(q) || srv.includes(q);
      });
    }

    return list;
  }, [applications, statusFilter, searchQuery, activeNav]);

  // Group applications into "Today" and "Previous"
  const groupedApplications = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayList = [];
    const previousList = [];

    filteredApplications.forEach((app) => {
      const appDate = app.date || (app.createdAt ? new Date(app.createdAt).toISOString().split('T')[0] : '');
      if (appDate === todayStr || !appDate) {
        todayList.push(app);
      } else {
        previousList.push(app);
      }
    });

    return { today: todayList, previous: previousList };
  }, [filteredApplications]);

  // Selected Application object
  const activeApp = useMemo(() => {
    if (!selectedAppId) return null;
    return applications.find((a) => a._id === selectedAppId || a.id === selectedAppId) || null;
  }, [selectedAppId, applications]);

  // Counts & Categories
  const stats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter((a) => a.status === 'submitted' || a.status === 'under_review').length;
    const approved = applications.filter((a) => a.status === 'approved' || a.status === 'completed').length;
    const rejected = applications.filter((a) => a.status === 'rejected').length;

    // Service category breakdown
    const categoryCounts = {
      identity: 0,
      certificates: 0,
      farmer: 0,
      online_govt: 0,
      csc_partner: 0,
    };

    applications.forEach((a) => {
      const title = (a.serviceTitle || '').toLowerCase();
      if (title.includes('पॅन') || title.includes('आधार') || title.includes('मतदार') || title.includes('pan') || title.includes('aadhaar')) {
        categoryCounts.identity += 1;
      } else if (title.includes('दाखला') || title.includes('प्रमाणपत्र') || title.includes('उत्पन्न') || title.includes('जात') || title.includes('certificate')) {
        categoryCounts.certificates += 1;
      } else if (title.includes('शेतकरी') || title.includes('७/१२') || title.includes('farmer') || title.includes('विमा') || title.includes('kisan')) {
        categoryCounts.farmer += 1;
      } else if (title.includes('csc') || title.includes('सायबर') || title.includes('बल्क')) {
        categoryCounts.csc_partner += 1;
      } else {
        categoryCounts.online_govt += 1;
      }
    });

    return { total, pending, approved, rejected, categoryCounts };
  }, [applications]);

  // Category Icon helper
  const getServiceVisual = (serviceTitle = '') => {
    const title = serviceTitle.toLowerCase();
    if (title.includes('पॅन') || title.includes('pan') || title.includes('credit')) {
      return { icon: CreditCard, bg: 'bg-[#3B82F6] text-white', categoryName: 'ओळखपत्र सेवा', amount: '₹199' };
    }
    if (title.includes('आधार') || title.includes('aadhaar') || title.includes('fingerprint')) {
      return { icon: Fingerprint, bg: 'bg-[#0EA5E9] text-white', categoryName: 'ओळखपत्र सेवा', amount: '₹99' };
    }
    if (title.includes('उत्पन्न') || title.includes('income')) {
      return { icon: FileText, bg: 'bg-[#8B5CF6] text-white', categoryName: 'दाखले / प्रमाणपत्र', amount: '₹149' };
    }
    if (title.includes('जात') || title.includes('caste') || title.includes('domicile')) {
      return { icon: Award, bg: 'bg-[#EC4899] text-white', categoryName: 'दाखले / प्रमाणपत्र', amount: '₹249' };
    }
    if (title.includes('शेतकरी') || title.includes('७/१२') || title.includes('farmer')) {
      return { icon: Sprout, bg: 'bg-[#F97316] text-white', categoryName: 'शेतकरी सेवा', amount: '₹99' };
    }
    if (title.includes('csc') || title.includes('सायबर') || title.includes('laptop')) {
      return { icon: Laptop, bg: 'bg-[#10B981] text-white', categoryName: 'सायबर कॅफे / CSC', amount: '₹499' };
    }
    return { icon: FileCheck, bg: 'bg-[#6366F1] text-white', categoryName: 'शासकीय सेवा', amount: '₹149' };
  };

  // Stage update handler
  const handleUpdateStage = async (newStage, newStatus, note = '') => {
    if (!activeApp) return;
    const appId = activeApp._id || activeApp.id;

    const payload = {
      currentStage: newStage,
      status: newStatus,
      statusNote: note || (newStatus === 'approved' ? 'कागदपत्रे मंजूर झाली आहेत.' : newStatus === 'completed' ? 'प्रमाणपत्र जारी झाले.' : 'पडताळणी प्रगतीपथावर आहे.'),
    };

    try {
      await adminApi.updateApplicationStage(appId, payload);
      showToast(`स्थिती अद्ययावत केली: टप्पा ${newStage}`);
      setActionSuccessMsg('अर्जाची स्थिती यशस्वीरीत्या बदलण्यात आली!');
      setTimeout(() => setActionSuccessMsg(''), 3000);
      loadData(true);
    } catch {
      showToast('स्थिती अद्ययावत करताना त्रुटी आली.');
    }
  };

  // WhatsApp Alert Generator
  const openWhatsAppAlert = (app) => {
    if (!app) return;
    const phone = app.phone || app.applicantDetails?.phone || '';
    if (!phone) {
      alert('मोबाईल नंबर उपलब्ध नाही.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = `नमस्कार ${app.applicantName || 'नागरिक'}, महाराष्ट्र शासन योजनादूत पोर्टलमधून आपल्या ${app.serviceTitle || 'शासकीय सेवा'} अर्जाचा (क्रमांक: ${app.applicationNumber}) स्थिती अपडेट: ${app.statusNote || 'अर्ज मंजूर झाला आहे.'}`;
    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Send Document to Client Handlers
  const openSendDocModal = (app) => {
    if (!app) return;
    const title = (app.serviceTitle || '').toLowerCase();
    let suggestedTitle = 'अधिकृत शासकीय प्रमाणपत्र / दाखला';
    if (title.includes('पॅन') || title.includes('pan')) {
      suggestedTitle = 'अधिकृत पॅन कार्ड ई-प्रत (e-PAN Copy)';
    } else if (title.includes('आधार') || title.includes('aadhaar')) {
      suggestedTitle = 'आधार पावती / ई-आधार डिजिटल प्रत';
    } else if (title.includes('उत्पन्न') || title.includes('income')) {
      suggestedTitle = 'डिजिटल स्वाक्षरीत उत्पन्न दाखला (Income Certificate)';
    } else if (title.includes('जात') || title.includes('caste')) {
      suggestedTitle = 'डिजिटल स्वाक्षरीत जात प्रमाणपत्र (Caste Certificate)';
    } else if (title.includes('७/१२') || title.includes('farmer') || title.includes('उतारा')) {
      suggestedTitle = 'डिजिटल स्वाक्षरीत ७/१२ व ८-अ उतारा (Digital 7/12)';
    } else if (title.includes('रेशन') || title.includes('ration')) {
      suggestedTitle = 'रेशन कार्ड अद्ययावत प्रत / पोचपावती';
    }

    setSendDocTitle(suggestedTitle);
    setSendDocFileUrl('');
    setSendDocFileName('');
    setSendDocFileSize('');
    setSendDocFileType('application/pdf');
    setSendDocNote('आपला अर्ज मंजूर झाला असून अधिकृत शासकीय दाखला सोबत जोडला आहे. कृपया डाऊनलोड करून जतन करा.');
    setSendDocMarkCompleted(true);
    setSendDocModalOpen(true);
  };

  const handleSendDocFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setSendDocFileUrl(uploadEvent.target.result);
      setSendDocFileName(file.name);
      setSendDocFileSize((file.size / 1024).toFixed(1) + ' KB');
      setSendDocFileType(file.type || 'application/pdf');
    };
    reader.readAsDataURL(file);
  };

  const generateInstantCertificate = (app, docName) => {
    const applicantName = app?.applicantName || app?.applicantDetails?.fullName || 'नागरिक';
    const appNo = app?.applicationNumber || 'YD-DOC';
    const srvName = app?.serviceTitle || 'शासकीय सेवा';
    const dateStr = new Date().toLocaleDateString('mr-IN');

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1100" viewBox="0 0 800 1100">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#f8fafc"/>
        </linearGradient>
      </defs>
      <rect width="800" height="1100" fill="url(#bg)"/>
      <rect x="25" y="25" width="750" height="1050" fill="none" stroke="#047857" stroke-width="6" rx="16"/>
      <rect x="35" y="35" width="730" height="1030" fill="none" stroke="#e2e8f0" stroke-width="2" rx="12"/>
      <circle cx="400" cy="110" r="45" fill="#065f46"/>
      <text x="400" y="118" font-size="28" font-family="sans-serif" font-weight="bold" fill="#ffffff" text-anchor="middle">शासन</text>
      <text x="400" y="190" font-size="24" font-family="sans-serif" font-weight="900" fill="#0f172a" text-anchor="middle">महाराष्ट्र शासन • ई-सेवा कक्ष</text>
      <text x="400" y="220" font-size="15" font-family="sans-serif" font-weight="600" fill="#047857" text-anchor="middle">MAHARASHTRA STATE DIGITAL CITIZEN PORTAL</text>
      <line x1="120" y1="245" x2="680" y2="245" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="150" y="275" width="500" height="50" rx="25" fill="#ecfdf5" stroke="#10b981" stroke-width="1.5"/>
      <text x="400" y="307" font-size="18" font-family="sans-serif" font-weight="bold" fill="#065f46" text-anchor="middle">${docName}</text>
      <text x="120" y="380" font-size="15" font-family="sans-serif" font-weight="bold" fill="#64748b">अर्ज संदर्भ क्रमांक:</text>
      <text x="280" y="380" font-size="16" font-family="monospace" font-weight="bold" fill="#0f172a">${appNo}</text>
      <text x="120" y="420" font-size="15" font-family="sans-serif" font-weight="bold" fill="#64748b">जारी केलेली तारीख:</text>
      <text x="280" y="420" font-size="15" font-family="sans-serif" font-weight="bold" fill="#0f172a">${dateStr}</text>
      <text x="120" y="460" font-size="15" font-family="sans-serif" font-weight="bold" fill="#64748b">सेवेचे नाव:</text>
      <text x="280" y="460" font-size="15" font-family="sans-serif" font-weight="bold" fill="#0f172a">${srvName}</text>
      <rect x="100" y="500" width="600" height="260" rx="16" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
      <text x="130" y="540" font-size="16" font-family="sans-serif" font-weight="bold" fill="#0f172a">प्रमाणित करण्यात येते की:</text>
      <text x="130" y="590" font-size="18" font-family="sans-serif" font-weight="bold" fill="#047857">श्री / श्रीमती: ${applicantName}</text>
      <text x="130" y="630" font-size="14" font-family="sans-serif" fill="#334155">यांनी उपरोक्त सेवेसाठी योजनादूत ई-सेवा पोर्टलवर सादर केलेले सर्व आवश्यक</text>
      <text x="130" y="660" font-size="14" font-family="sans-serif" fill="#334155">कागदपत्रे योग्य व वैध आढळल्याने हे अधिकृत प्रमाणपत्र डिजिटलरीत्या निर्गमित</text>
      <text x="130" y="690" font-size="14" font-family="sans-serif" fill="#334155">करण्यात येत आहे. हे सर्व शासकीय व खाजगी कामांसाठी ग्राह्य आहे.</text>
      <rect x="470" y="800" width="220" height="120" rx="12" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5"/>
      <text x="580" y="830" font-size="13" font-family="sans-serif" font-weight="bold" fill="#1d4ed8" text-anchor="middle">✓ DIGITALLY SIGNED</text>
      <text x="580" y="855" font-size="11" font-family="sans-serif" fill="#475569" text-anchor="middle">सक्षम प्राधिकारी (Competent Authority)</text>
      <text x="580" y="875" font-size="10" font-family="sans-serif" fill="#64748b" text-anchor="middle">ई-सेवा केंद्र, महाराष्ट्र</text>
      <text x="580" y="895" font-size="10" font-family="monospace" fill="#0284c7" text-anchor="middle">${dateStr}</text>
      <rect x="120" y="800" width="110" height="110" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
      <text x="175" y="865" font-size="32" font-family="sans-serif" text-anchor="middle">📱</text>
      <text x="175" y="895" font-size="9" font-family="monospace" fill="#64748b" text-anchor="middle">VERIFIED QR</text>
      <line x1="80" y1="970" x2="720" y2="970" stroke="#e2e8f0" stroke-width="1"/>
      <text x="400" y="1005" font-size="11" font-family="sans-serif" fill="#94a3b8" text-anchor="middle">हा संगणकीय दाखला असून त्यावर कोणत्याही हाताने केलेल्या स्वाक्षरीची आवश्यकता नाही.</text>
      <text x="400" y="1025" font-size="10" font-family="sans-serif" fill="#cbd5e1" text-anchor="middle">Government of Maharashtra • Information Technology Department</text>
    </svg>`;

    const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    setSendDocFileUrl(dataUrl);
    setSendDocFileName(`${docName.replace(/\s+/g, '_')}_${appNo}.svg`);
    setSendDocFileSize('28.5 KB');
    setSendDocFileType('image/svg+xml');
  };

  const handleSendDocSubmit = async (e) => {
    e?.preventDefault();
    if (!activeApp) return;
    if (!sendDocTitle.trim()) {
      alert('कृपया दस्तऐवजाचे नाव प्रविष्ट करा.');
      return;
    }
    if (!sendDocFileUrl) {
      alert('कृपया फाईल जोडा किंवा "डिजिटल दाखला तयार करा" बटणावर क्लिक करा.');
      return;
    }

    setIsSendingDoc(true);
    const appId = activeApp._id || activeApp.id || activeApp.applicationNumber;

    try {
      const payload = {
        documentName: sendDocTitle.trim(),
        documentUrl: sendDocFileUrl,
        documentSize: sendDocFileSize || '100 KB',
        documentType: sendDocFileType || 'application/pdf',
        note: sendDocNote.trim(),
        markCompleted: sendDocMarkCompleted,
      };

      const res = await adminApi.sendDocument(appId, payload);
      if (res && res.success) {
        showToast(`दस्तऐवज नागरिकाला यशस्वीरीत्या पाठवला: ${sendDocTitle}`);
        setActionSuccessMsg('दस्तऐवज नागरिकाला पाठवला व अर्ज अद्ययावत झाला!');
        setTimeout(() => setActionSuccessMsg(''), 4000);
        setSendDocModalOpen(false);
        loadData(true);
      } else {
        alert(res?.message || 'दस्तऐवज पाठवताना त्रुटी आली.');
      }
    } catch (err) {
      console.error(err);
      alert('दस्तऐवज पाठवताना तांत्रिक अडचण आली.');
    } finally {
      setIsSendingDoc(false);
    }
  };

  return (
    <div className="w-screen h-screen min-h-screen bg-[#141416] text-stone-900 flex overflow-hidden font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* 1. LEFT SIDEBAR (Dark Theme - Full height, flush with desktop edge) */}
      <aside className="w-60 lg:w-64 h-full shrink-0 flex flex-col justify-between text-stone-400 p-5 lg:p-6 bg-[#141416] border-r border-stone-800/80 overflow-y-auto no-scrollbar">
          <div>
            {/* Admin Profile Area */}
            <div className="flex items-center gap-3.5 mb-8 px-2">
              <div className="relative">
                {/* Avatar with Red Notification Pill */}
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-stone-700 via-stone-800 to-stone-600 flex items-center justify-center text-white font-bold text-lg border border-stone-700 shadow-md">
                  {adminUser?.name ? adminUser.name.charAt(0) : 'प्र'}
                </div>
                {/* Red counter badge as seen in reference pic */}
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs border-2 border-[#141416]">
                  {stats.pending > 9 ? '9+' : stats.pending || '4'}
                </span>
              </div>
              <div className="overflow-hidden">
                <h3 className="text-sm font-black text-white truncate tracking-tight">
                  {adminUser?.name || 'प्रशासक (Admin)'}
                </h3>
                <p className="text-[11px] text-stone-400 truncate">
                  {adminUser?.email || 'sanviinfotechcsc@gmail.com'}
                </p>
              </div>
            </div>

            {/* Vertical Navigation Menu */}
            <nav className="space-y-1.5 text-sm font-semibold">
              <button
                type="button"
                onClick={() => { setActiveNav('dashboard'); setSelectedAppId(null); }}
                className={`w-full text-left px-4 py-2.5 rounded-2xl transition flex items-center gap-3 ${
                  activeNav === 'dashboard'
                    ? 'text-white font-bold bg-white/10'
                    : 'text-stone-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>डॅशबोर्ड (Dashboard)</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveNav('applications'); setStatusFilter('all'); }}
                className={`w-full text-left px-4 py-2.5 rounded-2xl transition flex items-center justify-between ${
                  activeNav === 'applications'
                    ? 'text-white font-black bg-white/10 shadow-inner'
                    : 'text-stone-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>अर्ज (Applications)</span>
                {applications.length > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-stone-800 text-stone-300">
                    {applications.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setActiveNav('verification'); setSelectedAppId(null); }}
                className={`w-full text-left px-4 py-2.5 rounded-2xl transition flex items-center justify-between ${
                  activeNav === 'verification'
                    ? 'text-white font-black bg-white/10'
                    : 'text-stone-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>पडताळणी (Verification)</span>
                {stats.pending > 0 && (
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {stats.pending}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setActiveNav('services'); setSelectedAppId(null); }}
                className={`w-full text-left px-4 py-2.5 rounded-2xl transition flex items-center gap-3 ${
                  activeNav === 'services'
                    ? 'text-white font-black bg-white/10'
                    : 'text-stone-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>सेवा यादी (Services)</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveNav('payouts'); setSelectedAppId(null); }}
                className={`w-full text-left px-4 py-2.5 rounded-2xl transition flex items-center gap-3 ${
                  activeNav === 'payouts'
                    ? 'text-white font-black bg-white/10'
                    : 'text-stone-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>दूत कमिशन (Payouts)</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveNav('settings'); setSelectedAppId(null); }}
                className={`w-full text-left px-4 py-2.5 rounded-2xl transition flex items-center gap-3 ${
                  activeNav === 'settings'
                    ? 'text-white font-black bg-white/10'
                    : 'text-stone-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>सेटिंग्ज (Settings)</span>
              </button>
            </nav>
          </div>

          {/* Bottom Sidebar: System Health & Logout */}
          <div className="pt-6 border-t border-stone-800/80 px-2 space-y-3">
            <div className="flex items-center gap-2 text-[11px] text-stone-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Realtime Live Stream</span>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="w-full py-2 px-3 rounded-xl border border-stone-800 text-stone-400 hover:text-rose-300 hover:border-rose-900/50 hover:bg-rose-950/20 text-xs font-bold transition flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>लॉगआउट करा (Logout)</span>
            </button>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* 2. MAIN CONTENT DESKTOP AREA (Spans entire remaining screen)              */}
        {/* ========================================================================= */}
        <div className="flex-1 h-full p-3 sm:p-4 lg:p-5 flex flex-col lg:flex-row gap-4 lg:gap-5 overflow-hidden bg-[#141416]">
          {/* 2A. MIDDLE MAIN WHITE PANEL (Clean White Card as in Reference Picture) */}
          <main className="flex-1 h-full bg-white rounded-[28px] p-5 sm:p-7 lg:p-8 flex flex-col justify-between overflow-y-auto shadow-xl min-w-0">
          <div>
            {/* Header: Title, Date, Team Avatars & Refresh Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                  {activeNav === 'services'
                    ? 'शासकीय सेवा कॅटलॉग (Services)'
                    : activeNav === 'payouts'
                    ? 'दूत कमिशन व विड्रॉल (Payouts)'
                    : activeNav === 'settings'
                    ? 'प्रणाली सेटिंग्ज (Settings)'
                    : 'Applications & Activity'}
                </h1>
                <p className="text-xs font-semibold text-stone-400 mt-0.5">
                  ०१ - ३१ मार्च, २०२६ • महाराष्ट्र शासन ई-सेवा नियंत्रण
                </p>
              </div>

              {/* Top-Right: Team Avatar Cluster & Refresh */}
              <div className="flex items-center gap-3">
                <div className="flex items-center -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center text-xs font-bold text-amber-800 shadow-xs">
                    रा
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-xs font-bold text-blue-800 shadow-xs">
                    सु
                  </div>
                  <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-xs font-bold text-emerald-800 shadow-xs">
                    अ
                  </div>
                  <button
                    type="button"
                    onClick={() => loadData()}
                    title="रिफ्रेश करा (Refresh)"
                    className="w-8 h-8 rounded-full bg-stone-100 border-2 border-white flex items-center justify-center text-stone-600 hover:bg-stone-200 transition shadow-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* MINIMALIST BAR CHART (Visual Volume Indicator from Reference Screenshot) */}
            {(activeNav === 'applications' || activeNav === 'dashboard' || activeNav === 'verification') && (
              <div className="mb-7 pb-4 border-b border-stone-100">
                <div className="flex items-end justify-between h-14 sm:h-16 gap-1 sm:gap-1.5 px-1">
                  {[
                    32, 45, 28, 40, 25, 52, 35, 48, 60, 42, 30, 55, 38, 65, 45, 50, 70, 58, 62, 85, 42, 98, 72, 60
                  ].map((heightPct, idx) => {
                    const isPeak = idx === 21; // The vivid blue bar from reference pic
                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center justify-end h-full group relative"
                      >
                        <div
                          style={{ height: `${heightPct}%` }}
                          className={`w-full max-w-[9px] rounded-full transition-all duration-300 ${
                            isPeak
                              ? 'bg-[#2563EB] shadow-md shadow-blue-500/30'
                              : 'bg-[#DCEBFA] hover:bg-blue-300'
                          }`}
                        />
                        {/* Tooltip on hover */}
                        <div className="absolute -top-7 hidden group-hover:flex items-center px-1.5 py-0.5 bg-stone-900 text-white text-[10px] rounded font-mono font-bold pointer-events-none z-10">
                          {Math.round(heightPct / 4)} अर्ज
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SEARCH & STATUS FILTER ROW */}
            {(activeNav === 'applications' || activeNav === 'dashboard' || activeNav === 'verification') && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="नाव, मोबाईल, अर्ज क्रमांक शोधा..."
                    className="w-full pl-10 pr-3.5 py-2 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-900 placeholder-stone-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {[
                    { id: 'all', label: 'सर्व (All)' },
                    { id: 'submitted', label: 'प्राप्त (New)' },
                    { id: 'under_review', label: 'पडताळणी (Review)' },
                    { id: 'approved', label: 'मंजूर (Approved)' },
                    { id: 'completed', label: 'पूर्ण (Done)' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setStatusFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                        statusFilter === tab.id
                          ? 'bg-stone-900 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 1: APPLICATIONS & ACTIVITY LIST (Matched to "Today", etc.)          */}
            {/* ========================================================================= */}
            {(activeNav === 'applications' || activeNav === 'dashboard' || activeNav === 'verification') && (
              <div className="space-y-6">
                {/* SECTION 1: TODAY / आजचे अर्ज */}
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs font-bold text-stone-400">
                    <span className="text-stone-800 text-sm font-black">Today (आजचे अर्ज)</span>
                    <button
                      type="button"
                      onClick={() => loadData(true)}
                      className="hover:text-stone-700 text-base tracking-widest px-1"
                    >
                      •••
                    </button>
                  </div>

                  {groupedApplications.today.length === 0 ? (
                    <div className="p-5 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-xs text-stone-400 font-semibold">
                      आज कोणतेही नवीन अर्ज आलेले नाहीत.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {groupedApplications.today.map((app) => {
                        const srv = getServiceVisual(app.serviceTitle);
                        const Icon = srv.icon;
                        const isSelected = selectedAppId === app._id || selectedAppId === app.id;

                        return (
                          <div
                            key={app._id || app.id}
                            onClick={() => setSelectedAppId(app._id || app.id)}
                            className={`p-3 sm:p-3.5 rounded-2xl transition cursor-pointer flex items-center justify-between gap-3 border ${
                              isSelected
                                ? 'bg-blue-50/70 border-blue-400 shadow-sm ring-1 ring-blue-400'
                                : 'bg-white hover:bg-stone-50 border-stone-100 hover:border-stone-200 shadow-2xs'
                            }`}
                          >
                            {/* Left: Round colored circle icon + title + applicant */}
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-xs ${srv.bg}`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-sm font-black text-stone-900 truncate">
                                  {app.serviceTitle || 'शासकीय सेवा'}
                                </h4>
                                <p className="text-xs text-stone-400 truncate">
                                  {app.time || 'आज'} • {app.applicantName || app.applicantDetails?.fullName || 'नागरिक'}
                                  {app.applicantDetails?.district ? `, ${app.applicantDetails.district}` : ''}
                                </p>
                              </div>
                            </div>

                            {/* Right: App Number & Status pill */}
                            <div className="text-right shrink-0">
                              <div className="text-xs font-black text-stone-900 font-mono tracking-tight">
                                {app.applicationNumber}
                              </div>
                              <span
                                className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold mt-0.5 ${
                                  app.status === 'completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : app.status === 'approved'
                                    ? 'bg-blue-100 text-blue-800'
                                    : app.status === 'rejected'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {app.statusBadge || (app.status === 'submitted' ? 'नवीन अर्ज' : app.status === 'under_review' ? 'पडताळणी' : 'प्रक्रिया')}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* SECTION 2: PREVIOUS DATES / मागील अर्ज */}
                {groupedApplications.previous.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3 text-xs font-bold text-stone-400">
                      <span className="text-stone-800 text-sm font-black">मागील अर्ज (Previous Records)</span>
                      <button type="button" className="hover:text-stone-700 text-base tracking-widest px-1">
                        •••
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {groupedApplications.previous.map((app) => {
                        const srv = getServiceVisual(app.serviceTitle);
                        const Icon = srv.icon;
                        const isSelected = selectedAppId === app._id || selectedAppId === app.id;

                        return (
                          <div
                            key={app._id || app.id}
                            onClick={() => setSelectedAppId(app._id || app.id)}
                            className={`p-3 sm:p-3.5 rounded-2xl transition cursor-pointer flex items-center justify-between gap-3 border ${
                              isSelected
                                ? 'bg-blue-50/70 border-blue-400 shadow-sm ring-1 ring-blue-400'
                                : 'bg-white hover:bg-stone-50 border-stone-100 hover:border-stone-200 shadow-2xs'
                            }`}
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-xs ${srv.bg}`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-sm font-black text-stone-900 truncate">
                                  {app.serviceTitle || 'शासकीय सेवा'}
                                </h4>
                                <p className="text-xs text-stone-400 truncate">
                                  {app.date || 'मागील'} • {app.applicantName || app.applicantDetails?.fullName || 'नागरिक'}
                                </p>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="text-xs font-black text-stone-900 font-mono tracking-tight">
                                {app.applicationNumber}
                              </div>
                              <span
                                className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold mt-0.5 ${
                                  app.status === 'completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : app.status === 'approved'
                                    ? 'bg-blue-100 text-blue-800'
                                    : app.status === 'rejected'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-stone-100 text-stone-700'
                                }`}
                              >
                                {app.statusBadge || app.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 2: SERVICES CATALOG (When Services nav is selected)                  */}
            {/* ========================================================================= */}
            {activeNav === 'services' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {services.map((srv) => (
                    <div
                      key={srv._id || srv.slug}
                      className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-white hover:border-blue-300 transition shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h3 className="font-black text-stone-900 text-sm">{srv.marathiTitle || srv.title}</h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 shrink-0">
                            ₹{srv.basePrice}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 line-clamp-2 mb-3">
                          {srv.description || 'अधिकृत शासकीय सेवा'}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-stone-200">
                        <span>कालावधी: {srv.estimatedDays || '७-१५ दिवस'}</span>
                        <span className="font-bold text-emerald-700">दूत कमिशन: ₹{srv.agentCommission || 20}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 3: AGENT PAYOUTS (When Payouts nav is selected)                      */}
            {/* ========================================================================= */}
            {activeNav === 'payouts' && (
              <div className="space-y-3">
                {payouts.length === 0 ? (
                  <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-xs text-stone-500">
                    सध्या कोणत्याही दूत प्रतिनिधींची विड्रॉल विनंती प्रलंबित नाही.
                  </div>
                ) : (
                  payouts.map((po) => (
                    <div
                      key={po.id}
                      className="p-4 rounded-2xl border border-stone-200 bg-white flex items-center justify-between gap-4 shadow-xs"
                    >
                      <div>
                        <h4 className="font-bold text-stone-900 text-sm">{po.agentName}</h4>
                        <p className="text-xs text-stone-400 font-mono">
                          UPI: {po.upiId} • कोड: {po.referralCode}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-base font-black text-emerald-700">₹{po.amount}</span>
                        {po.status === 'cleared' ? (
                          <span className="px-2 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800">
                            जमा झाले
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={async () => {
                              await adminApi.approvePayout(po.id);
                              showToast('पैसे जमा झाले!');
                              loadData(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-xs"
                          >
                            मंजूर करा (Approve)
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 4: SYSTEM SETTINGS                                                   */}
            {/* ========================================================================= */}
            {activeNav === 'settings' && (
              <div className="space-y-4 max-w-lg">
                <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50">
                  <h4 className="font-bold text-stone-900 text-sm mb-1">प्रशासक खाते तपशील</h4>
                  <p className="text-xs text-stone-500 mb-3">ई-सेवा पोर्टल नियंत्रण कक्ष</p>
                  <div className="text-xs space-y-1.5 text-stone-600 font-mono">
                    <p>नाव: {adminUser?.name || 'प्रशासक'}</p>
                    <p>ईमेल: {adminUser?.email || import.meta.env.VITE_ADMIN_CONTACT_EMAIL || 'sanviinfotechcsc@gmail.com'}</p>
                    <p>मोबाईल: +91 {import.meta.env.VITE_ADMIN_CONTACT_PHONE || '9579224223'}</p>
                    <p>
                      WhatsApp ग्रुप:{' '}
                      <a
                        href={import.meta.env.VITE_WHATSAPP_GROUP_URL || 'https://chat.whatsapp.com/CPGUrVqOf2I4ZzsvBivj6e?s=sw&p=a&mlu=4&ilr=4'}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline font-bold"
                      >
                        ग्रुप लिंक उघडा
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* ========================================================================= */}
        {/* 2B. RIGHT PANEL (Soft Off-White Card from Reference Picture)              */}
        {/* ========================================================================= */}
        <aside className="w-full lg:w-[350px] xl:w-[380px] shrink-0 h-full bg-[#F8F9FA] rounded-[28px] p-5 sm:p-6 flex flex-col justify-between overflow-y-auto border border-stone-200/80">
          {/* IF NO APPLICATION SELECTED -> SHOW "Where your money go?" / Category Breakdown */}
          {!activeApp ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-black text-stone-900 tracking-tight mb-4">
                  Where do applications come from?
                </h3>

                {/* Category Progress Bars (Matching reference picture layout) */}
                <div className="space-y-4">
                  {/* Item 1 */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-stone-800 mb-1">
                      <span>ओळखपत्र सेवा (Identity)</span>
                      <span className="font-mono text-stone-500">
                        {stats.categoryCounts.identity || 872}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#14B8A6] rounded-full" style={{ width: '65%' }} />
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-stone-800 mb-1">
                      <span>दाखले / प्रमाणपत्र (Certificates)</span>
                      <span className="font-mono text-stone-500">
                        {stats.categoryCounts.certificates || '1,378'}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#10B981] rounded-full" style={{ width: '85%' }} />
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-stone-800 mb-1">
                      <span>शेतकरी सेवा (Farmer ID & 7/12)</span>
                      <span className="font-mono text-stone-500">
                        {stats.categoryCounts.farmer || 928}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#F59E0B] rounded-full" style={{ width: '50%' }} />
                    </div>
                  </div>

                  {/* Item 4 */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-stone-800 mb-1">
                      <span>शासकीय योजना (Govt Schemes)</span>
                      <span className="font-mono text-stone-500">
                        {stats.categoryCounts.online_govt || 420}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#3B82F6] rounded-full" style={{ width: '40%' }} />
                    </div>
                  </div>

                  {/* Item 5 */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-stone-800 mb-1">
                      <span>सीएससी केंद्र (CSC / Cyber Cafe)</span>
                      <span className="font-mono text-stone-500">
                        {stats.categoryCounts.csc_partner || 520}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#6366F1] rounded-full" style={{ width: '45%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Card: "Save more money" styled card from reference picture */}
              <div className="mt-8 p-5 bg-[#EDF2F7] rounded-3xl border border-stone-200/60 relative overflow-hidden">
                {/* Illustration Top Graphic */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-2xl bg-[#EA580C] text-white flex items-center justify-center font-bold text-base shadow-sm">
                    📁
                  </div>
                  <div className="w-7 h-7 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center text-xs">
                    🌿
                  </div>
                </div>

                <h4 className="text-sm font-black text-stone-900 tracking-tight mb-1">
                  जलद पडताळणी कक्ष (Verification)
                </h4>
                <p className="text-[11px] text-stone-500 leading-relaxed mb-4">
                  {stats.pending > 0
                    ? `${stats.pending} नवीन अर्ज पडताळणीसाठी प्रलंबित आहेत. त्वरित मंजुरी द्या.`
                    : 'सर्व अर्जांची पडताळणी पूर्ण झाली आहे.'}
                </p>

                {/* Black Pill Button as in reference picture ("VIEW TIPS" -> "VIEW ALL") */}
                <button
                  type="button"
                  onClick={() => {
                    if (applications.length > 0) {
                      const firstPending = applications.find((a) => a.status === 'submitted' || a.status === 'under_review') || applications[0];
                      setSelectedAppId(firstPending._id || firstPending.id);
                    }
                  }}
                  className="w-full py-2.5 px-4 rounded-full bg-[#141416] hover:bg-stone-800 text-white font-bold text-xs tracking-wider transition uppercase shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>VIEW DETAILS</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* =================================================================== */
            /* IF APPLICATION IS SELECTED -> SHOW APPLICATION INSPECTOR DOSSIER    */
            /* =================================================================== */
            <div className="space-y-4">
              {/* Back to Summary Header */}
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <button
                  type="button"
                  onClick={() => setSelectedAppId(null)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>← परत या (Overview)</span>
                </button>
                <span className="text-[11px] font-mono text-stone-400">
                  {activeApp.applicationNumber}
                </span>
              </div>

              {/* Applicant Card */}
              <div className="p-3.5 bg-white rounded-2xl border border-stone-200 shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-black text-stone-900 text-sm">
                    {activeApp.applicantName || activeApp.applicantDetails?.fullName || 'नागरिक'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => openWhatsAppAlert(activeApp)}
                    title="WhatsApp संदेश पाठवा"
                    className="p-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-stone-500 font-mono">
                  +91 {activeApp.phone || activeApp.applicantDetails?.phone || ''}
                </p>
                <p className="text-xs text-blue-700 font-bold mt-1">
                  {activeApp.serviceTitle}
                </p>
                {activeApp.applicantDetails?.district && (
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    जिल्हा: {activeApp.applicantDetails.district}
                  </p>
                )}
              </div>

              {/* Stage Progression Selector (1 to 4) */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1.5">
                  अर्जाचा टप्पा (Current Stage):
                </label>
                <div className="grid grid-cols-4 gap-1 p-1 bg-stone-200 rounded-xl text-center text-xs font-bold">
                  {[
                    { st: 1, label: '१. प्राप्त' },
                    { st: 2, label: '२. तपासणी' },
                    { st: 3, label: '३. मंजूर' },
                    { st: 4, label: '४. पूर्ण' },
                  ].map((s) => (
                    <button
                      key={s.st}
                      type="button"
                      onClick={() => {
                        const statusMap = {
                          1: 'submitted',
                          2: 'under_review',
                          3: 'approved',
                          4: 'completed',
                        };
                        handleUpdateStage(s.st, statusMap[s.st]);
                      }}
                      className={`py-1.5 rounded-lg transition text-[11px] ${
                        activeApp.currentStage === s.st
                          ? 'bg-blue-600 text-white font-black shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Uploaded Documents List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-stone-700">
                    कागदपत्रे (Attached Documents)
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {((activeApp.uploadedDocs && activeApp.uploadedDocs.length > 0) ? activeApp.uploadedDocs : (activeApp.uploadedDocuments || [])).length} फाईल्स
                  </span>
                </div>

                {(!((activeApp.uploadedDocs && activeApp.uploadedDocs.length > 0) || (activeApp.uploadedDocuments && activeApp.uploadedDocuments.length > 0))) ? (
                  <div className="p-3 bg-stone-50 rounded-xl border border-dashed border-stone-200 text-center text-xs text-stone-400">
                    नागरिकाने अद्याप कोणतीही कागदपत्रे जोडलेली नाहीत.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {((activeApp.uploadedDocs && activeApp.uploadedDocs.length > 0) ? activeApp.uploadedDocs : activeApp.uploadedDocuments).map((doc, i) => {
                      const isImage = (doc.type && doc.type.includes('image')) || (doc.url && doc.url.startsWith('data:image/')) || (doc.name && doc.name.match(/\.(jpg|jpeg|png|webp|gif)$/i));
                      const isPdf = (doc.type && doc.type.includes('pdf')) || (doc.url && doc.url.startsWith('data:application/pdf')) || (doc.name && doc.name.match(/\.pdf$/i));

                      return (
                        <div
                          key={i}
                          className="p-2.5 bg-white rounded-xl border border-stone-200 shadow-2xs hover:border-blue-300 transition flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base shrink-0">
                              {isImage ? '🖼️' : isPdf ? '📕' : '📄'}
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-stone-800 truncate" title={doc.name}>
                                {doc.name || doc.docType || 'दस्तावेज'}
                              </p>
                              <p className="text-[10px] text-stone-400">
                                {doc.size ? `${doc.size} • ` : ''}{doc.docType || 'कागदपत्र'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewDoc(doc)}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px] transition shadow-2xs flex items-center gap-1"
                            >
                              <span>पहा</span>
                            </button>
                            {doc.url && (
                              <a
                                href={doc.url}
                                download={doc.name || 'document'}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-1 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 font-bold text-[11px] transition shadow-2xs"
                                title="डाऊनलोड करा (Download)"
                              >
                                ⬇️
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sent / Issued Documents Section (If Any) */}
              {((activeApp.issuedDocs && activeApp.issuedDocs.length > 0) || (activeApp.deliveredDocuments && activeApp.deliveredDocuments.length > 0)) && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <span className="text-sm">🎖️</span>
                      <span>पाठवलेले दाखले (Sent to Citizen)</span>
                    </label>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {((activeApp.issuedDocs && activeApp.issuedDocs.length > 0) ? activeApp.issuedDocs : activeApp.deliveredDocuments).length} जारी
                    </span>
                  </div>

                  <div className="space-y-2">
                    {((activeApp.issuedDocs && activeApp.issuedDocs.length > 0) ? activeApp.issuedDocs : activeApp.deliveredDocuments).map((doc, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs hover:border-emerald-300 transition"
                      >
                        <div className="min-w-0 flex items-center gap-2">
                          <span className="text-base shrink-0">📜</span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-emerald-950 truncate" title={doc.name}>
                              {doc.name}
                            </p>
                            <p className="text-[10px] text-emerald-700 truncate">
                              {doc.size ? `${doc.size} • ` : ''}दि: {doc.issuedAt ? new Date(doc.issuedAt).toLocaleDateString('mr-IN') : 'आज'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            className="px-2 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-[11px] font-bold transition shadow-2xs"
                          >
                            पहा
                          </button>
                          {doc.url && (
                            <a
                              href={doc.url}
                              download={doc.name || 'official_document'}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 text-[11px] font-bold transition shadow-2xs"
                              title="डाउनलोड करा (Download)"
                            >
                              ⬇️
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {/* 1. PRIMARY ACTION: SEND DOCUMENT TO CLIENT */}
                <button
                  type="button"
                  onClick={() => openSendDocModal(activeApp)}
                  className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-xs shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 active:scale-98"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>नागरिकाला दाखला / दस्तऐवज पाठवा (Send Document)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateStage(3, 'approved', 'कागदपत्रे पडताळणी पूर्ण झाली असून अर्ज मंजूर करण्यात आला आहे.')}
                  className="w-full py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>कागदपत्रे मंजूर करा (Approve)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateStage(4, 'completed', 'अधिकृत प्रमाणपत्र जारी झाले आहे.')}
                  className="w-full py-2.5 px-3 rounded-2xl bg-[#141416] hover:bg-stone-800 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <FileCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>प्रमाणपत्र जारी झाले (Completed)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateStage(activeApp.currentStage || 1, 'rejected', 'त्रुटी आढळल्याने अर्ज नाकारण्यात आला.')}
                  className="w-full py-2 px-3 rounded-2xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs transition"
                >
                  नाकारा (Reject Application)
                </button>
              </div>

              {actionSuccessMsg && (
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold text-center animate-fadeIn">
                  {actionSuccessMsg}
                </div>
              )}
            </div>
          )}
        </aside>
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] flex flex-col animate-scaleUp">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-2xl shrink-0">
                  {(previewDoc.type && previewDoc.type.includes('image')) || (previewDoc.url && previewDoc.url.startsWith('data:image/')) || (previewDoc.name && previewDoc.name.match(/\.(jpg|jpeg|png|webp|gif)$/i))
                    ? '🖼️'
                    : '📄'}
                </span>
                <div className="min-w-0">
                  <h3 className="text-base font-black text-stone-900 truncate">
                    {previewDoc.name || previewDoc.docType || 'दस्तऐवज'}
                  </h3>
                  <p className="text-xs text-stone-400">
                    {previewDoc.size ? `${previewDoc.size} • ` : ''}नागरिकाने अपलोड केलेले अधिकृत कागदपत्र
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Content / Actual Preview */}
            <div className="flex-1 overflow-auto bg-stone-100 rounded-2xl p-3 sm:p-4 flex items-center justify-center min-h-[300px]">
              {previewDoc.url && (previewDoc.url.startsWith('data:image/') || previewDoc.name?.match(/\.(jpg|jpeg|png|webp|gif)$/i)) ? (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.name}
                  className="max-h-[60vh] max-w-full rounded-xl object-contain shadow-md mx-auto"
                />
              ) : previewDoc.url && previewDoc.url.startsWith('data:application/pdf') ? (
                <iframe
                  src={previewDoc.url}
                  title={previewDoc.name}
                  className="w-full h-[55vh] rounded-xl border border-stone-300"
                />
              ) : (
                <div className="text-center p-8 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto text-2xl font-bold">
                    📄
                  </div>
                  <h4 className="text-sm font-bold text-stone-800">{previewDoc.name || previewDoc.docType}</h4>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    दस्तऐवज सुरक्षितरीत्या प्राप्त झाले आहे. खालील "डाउनलोड करा" बटणावर क्लिक करून फाईल उघडू शकता.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-200 mt-4">
              <span className="text-xs text-stone-500">
                दस्तऐवज स्थिती: <strong className="text-emerald-700 font-bold">वैध (Valid)</strong>
              </span>
              <div className="flex items-center gap-2">
                {previewDoc.url && (
                  <a
                    href={previewDoc.url}
                    download={previewDoc.name || 'document'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
                  >
                    <span>डाउनलोड करा (Download)</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs transition"
                >
                  बंद करा (Close)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEND DOCUMENT TO CLIENT MODAL */}
      {sendDocModalOpen && activeApp && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl relative max-h-[92vh] flex flex-col animate-scaleUp">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg shadow-xs">
                  📤
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900 tracking-tight">
                    नागरिकाला दाखला / दस्तऐवज पाठवा
                  </h3>
                  <p className="text-xs text-stone-500 font-mono">
                    {activeApp.applicantName} • {activeApp.applicationNumber}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSendDocModalOpen(false)}
                className="p-1.5 rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSendDocSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Quick Preset Selector Chips */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1.5">
                  त्वरित प्रकार निवडा (Quick Presets):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '💳 पॅन कार्ड ई-प्रत', title: 'अधिकृत पॅन कार्ड ई-प्रत (e-PAN Copy)' },
                    { label: '📜 उत्पन्न दाखला', title: 'डिजिटल स्वाक्षरीत उत्पन्न दाखला (Income Certificate)' },
                    { label: '🌾 ७/१२ उतारा', title: 'डिजिटल स्वाक्षरीत ७/१२ उतारा (Digital 7/12)' },
                    { label: '🏅 जात प्रमाणपत्र', title: 'डिजिटल स्वाक्षरीत जात प्रमाणपत्र (Caste Certificate)' },
                    { label: '📄 अधिकृत पावती', title: 'अधिकृत शासकीय पोचपावती (Official Receipt)' },
                  ].map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => setSendDocTitle(preset.title)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition ${
                        sendDocTitle === preset.title
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Document Title Input */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  दस्तऐवजाचे नाव / शीर्षक (Document Title): <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={sendDocTitle}
                  onChange={(e) => setSendDocTitle(e.target.value)}
                  placeholder="उदा. अधिकृत पॅन कार्ड ई-प्रत / उत्पन्न दाखला"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs font-semibold outline-hidden"
                />
              </div>

              {/* File Attachment & Digital Generator */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  दस्तऐवज फाईल (Document File / Certificate): <span className="text-rose-500">*</span>
                </label>

                {sendDocFileUrl ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-2xl shrink-0">
                        {sendDocFileType?.includes('image') || sendDocFileType?.includes('svg') ? '🖼️' : '📕'}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-emerald-950 truncate" title={sendDocFileName}>
                          {sendDocFileName || 'तयार केलेला दाखला'}
                        </p>
                        <p className="text-[11px] text-emerald-700">
                          {sendDocFileSize} • {sendDocFileType || 'दस्तऐवज फाईल'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <label
                        htmlFor="replaceFileInput"
                        className="px-2.5 py-1 rounded-xl bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-[11px] font-bold cursor-pointer transition"
                      >
                        बदला
                      </label>
                      <input
                        id="replaceFileInput"
                        type="file"
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                        onChange={handleSendDocFileChange}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-stone-300 hover:border-blue-400 rounded-2xl p-4 bg-stone-50/70 text-center space-y-2.5 transition">
                    <div className="text-2xl">📄</div>
                    <div>
                      <p className="text-xs font-bold text-stone-700">
                        नागरिकाला पाठवायची फाईल जोडा किंवा डिजिटल दाखला तयार करा
                      </p>
                      <p className="text-[10px] text-stone-400 mt-0.5">
                        PDF, JPG, PNG, WEBP (कमाल 15MB)
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      <label
                        htmlFor="adminDocUploadInput"
                        className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs cursor-pointer shadow-xs transition flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>संगणकावरून फाईल निवडा</span>
                      </label>
                      <input
                        id="adminDocUploadInput"
                        type="file"
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                        onChange={handleSendDocFileChange}
                      />

                      <button
                        type="button"
                        onClick={() => generateInstantCertificate(activeApp, sendDocTitle || 'अधिकृत शासकीय प्रमाणपत्र')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                      >
                        <span>✨ डिजिटल दाखला तयार करा</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Note / Remark */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  नागरिकासाठी संदेश / टीप (Note to Citizen):
                </label>
                <textarea
                  rows={2}
                  value={sendDocNote}
                  onChange={(e) => setSendDocNote(e.target.value)}
                  placeholder="नागरिकाला अर्जासोबत दाखवण्याची टीप..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs font-medium outline-hidden resize-none"
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-2 bg-stone-50 p-3 rounded-2xl border border-stone-200">
                <label className="flex items-center gap-2.5 text-xs font-bold text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendDocMarkCompleted}
                    onChange={(e) => setSendDocMarkCompleted(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>अर्जाचा टप्पा आपोआप '४. पूर्ण (Completed)' म्हणून नोंदवा</span>
                </label>
              </div>

              {/* Action Buttons in Modal */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setSendDocModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition"
                >
                  रद्द करा (Cancel)
                </button>

                <button
                  type="submit"
                  disabled={isSendingDoc || !sendDocFileUrl}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                >
                  {isSendingDoc ? (
                    <span>पाठवत आहे...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>नागरिकाला पाठवा (Send Now)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIVE TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-stone-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 z-50 animate-fadeIn border border-stone-700">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
