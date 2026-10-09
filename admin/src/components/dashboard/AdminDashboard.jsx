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
} from '../common/Icons';
import { adminApi, initialAdminApplications, initialAdminServices } from '../../services/api';

export const AdminDashboard = ({ adminUser, onLogout }) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState('applications'); // 'applications' | 'verification' | 'services' | 'payouts'

  // Data state
  const [applications, setApplications] = useState(initialAdminApplications);
  const [services, setServices] = useState(initialAdminServices);
  const [loading, setLoading] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all'); // '1day' | '1week' | '1month' | 'all'

  // Modals & Drawers
  const [selectedApp, setSelectedApp] = useState(null); // Client Dossier Modal
  const [previewDoc, setPreviewDoc] = useState(null); // Document Previewer
  const [rejectionNote, setRejectionNote] = useState('');
  const [targetStage, setTargetStage] = useState(1);
  const [targetStatus, setTargetStatus] = useState('in_review');
  const [issuedDocName, setIssuedDocName] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Agent Payouts state
  const [payouts, setPayouts] = useState([
    {
      id: 'po_101',
      agentName: 'राहुल शिंदे (Rahul Shinde)',
      phone: '9822012345',
      referralCode: 'YD-RAHUL100',
      village: 'शिक्रापूर, शिरूर (पुणे)',
      amount: 500,
      upiId: 'rahulshinde@okaxis',
      date: '२०२६-१०-०८, १२:३० PM',
      status: 'pending',
      totalApplications: 18,
    },
    {
      id: 'po_102',
      agentName: 'अमोल विठ्ठल गायकवाड',
      phone: '9823114455',
      referralCode: 'YD-AMOL50',
      village: 'ओझर, निफाड (नाशिक)',
      amount: 750,
      upiId: 'amol.gaikwad@paytm',
      date: '२०२६-१०-०७, ०५:१५ PM',
      status: 'approved',
      totalApplications: 24,
    },
    {
      id: 'po_103',
      agentName: 'सुजाता संजय पाटील',
      phone: '9766554433',
      referralCode: 'YD-SUJATA88',
      village: 'इस्लामपूर, वाळवा (सांगली)',
      amount: 1200,
      upiId: 'sujata.patil@upi',
      date: '२०२६-१०-०६, ०२:०० PM',
      status: 'pending',
      totalApplications: 41,
    },
  ]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const appRes = await adminApi.getApplications();
      if (appRes?.applications?.length > 0) {
        setApplications(appRes.applications);
      }
      const srvRes = await adminApi.getServices();
      if (srvRes?.services?.length > 0) {
        setServices(srvRes.services);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calculate relative days ago compared to current demo reference date (2026-10-09)
  const calculateDaysAgo = (dateStr) => {
    if (!dateStr) return 999;
    const refDate = new Date('2026-10-09T00:00:00');
    const d = new Date(dateStr + 'T00:00:00');
    const diffTime = refDate.getTime() - d.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Timeline counts across periods (1 Day / 1 Week / 1 Month / All)
  const timelineStats = useMemo(() => {
    let day1 = 0;
    let week1 = 0;
    let month1 = 0;
    const all = applications.length;

    applications.forEach((a) => {
      const days = calculateDaysAgo(a.date);
      if (days === 0) day1++;
      if (days <= 7) week1++;
      if (days <= 30) month1++;
    });

    return { day1, week1, month1, all };
  }, [applications]);

  // Applications filtered by selected time range
  const timeFilteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const days = calculateDaysAgo(app.date);
      if (timeFilter === '1day') return days === 0;
      if (timeFilter === '1week') return days <= 7;
      if (timeFilter === '1month') return days <= 30;
      return true;
    });
  }, [applications, timeFilter]);

  // Filtered applications based on search, status, category & time
  const filteredApplications = useMemo(() => {
    return timeFilteredApplications.filter((app) => {
      // Status filter
      if (statusFilter !== 'all' && app.status !== statusFilter) {
        return false;
      }
      // Category filter
      if (categoryFilter !== 'all' && app.category !== categoryFilter) {
        return false;
      }
      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchNum = app.applicationNumber?.toLowerCase().includes(q);
      const matchName = (app.applicantName || app.applicantDetails?.fullName)?.toLowerCase().includes(q);
      const matchPhone = (app.phone || app.applicantDetails?.phone)?.includes(q);
      const matchVillage = app.applicantDetails?.village?.toLowerCase().includes(q);
      const matchTaluka = app.applicantDetails?.taluka?.toLowerCase().includes(q);
      const matchService = (app.serviceTitle || app.serviceDetails?.marathiTitle)?.toLowerCase().includes(q);

      return matchNum || matchName || matchPhone || matchVillage || matchTaluka || matchService;
    });
  }, [timeFilteredApplications, statusFilter, categoryFilter, searchQuery]);

  // Aggregate stats based on active time filter
  const stats = useMemo(() => {
    const list = timeFilteredApplications;
    const total = list.length;
    const pending = list.filter((a) => a.status === 'in_review' || a.status === 'submitted').length;
    const actionNeeded = list.filter((a) => a.status === 'action_needed').length;
    const completed = list.filter((a) => a.status === 'completed').length;
    const totalDocs = list.reduce((acc, curr) => acc + (curr.uploadedDocs?.length || 0), 0);
    const verifiedDocs = list.reduce(
      (acc, curr) => acc + (curr.uploadedDocs?.filter((d) => d.status === 'verified').length || 0),
      0
    );
    const totalRevenue = list.reduce((acc, curr) => acc + (curr.payment?.amount || 149), 0);

    return {
      total,
      pending,
      actionNeeded,
      completed,
      totalDocs,
      verifiedDocs,
      totalRevenue,
    };
  }, [timeFilteredApplications]);

  // Open Client Documents Dossier
  const handleOpenClientDossier = (app) => {
    setSelectedApp(app);
    setTargetStage(app.currentStage || 1);
    setTargetStatus(app.status || 'in_review');
    setRejectionNote(app.actionRequiredNote || '');
    setIssuedDocName(app.issuedDocument?.fileName || '');
  };

  // Advance stage 1 step
  const handleAdvanceStage = async (app, e) => {
    if (e) e.stopPropagation();
    const nextStage = Math.min(5, (app.currentStage || 1) + 1);
    const nextStatus = nextStage === 5 ? 'completed' : 'in_review';

    await adminApi.updateApplicationStage(app.applicationNumber || app._id, {
      currentStage: nextStage,
      status: nextStatus,
      statusNoteMarathi:
        nextStage === 5
          ? 'अभिनंदन! तुमचा शासकीय दाखला/कागदपत्र तयार झाले असून अर्ज पूर्ण झाला आहे.'
          : `तुमचा अर्ज स्टेज ${nextStage} वर प्रगतीपथावर आहे.`,
    });

    setApplications((prev) =>
      prev.map((item) =>
        item.applicationNumber === app.applicationNumber || item._id === app._id
          ? {
              ...item,
              currentStage: nextStage,
              status: nextStatus,
              statusBadge: nextStatus === 'completed' ? 'पूर्ण' : 'प्रक्रियेत',
              badgeVariant: nextStatus === 'completed' ? 'green' : 'teal',
            }
          : item
      )
    );

    if (selectedApp && (selectedApp.applicationNumber === app.applicationNumber || selectedApp._id === app._id)) {
      setSelectedApp((prev) => ({
        ...prev,
        currentStage: nextStage,
        status: nextStatus,
        statusBadge: nextStatus === 'completed' ? 'पूर्ण' : 'प्रक्रियेत',
      }));
    }

    showToast(`अर्जाची स्टेज ${nextStage} वर अद्ययावत केली गेली!`);
  };

  // Toggle or update individual document verification status
  const handleUpdateDocStatus = (docId, newStatus, reason = '') => {
    if (!selectedApp) return;

    const updatedDocs = (selectedApp.uploadedDocs || []).map((doc) => {
      if (doc.id === docId || doc.name === docId) {
        return {
          ...doc,
          status: newStatus,
          rejectionReason: reason,
        };
      }
      return doc;
    });

    const updatedApp = {
      ...selectedApp,
      uploadedDocs: updatedDocs,
    };

    setSelectedApp(updatedApp);
    setApplications((prev) =>
      prev.map((a) => (a.applicationNumber === selectedApp.applicationNumber ? updatedApp : a))
    );

    showToast(newStatus === 'verified' ? 'कागदपत्र मंजूर केले गेले! ✓' : 'कागदपत्रात त्रुटी नोंदवली गेली!');
  };

  // Save changes from Dossier / Modal
  const handleSaveDossierChanges = async (e) => {
    if (e) e.preventDefault();
    if (!selectedApp) return;

    await adminApi.updateApplicationStage(selectedApp.applicationNumber || selectedApp._id, {
      currentStage: targetStage,
      status: targetStatus,
      actionRequiredNote: targetStatus === 'action_needed' ? rejectionNote : '',
      statusNoteMarathi:
        targetStage === 5
          ? 'अर्ज यशस्वीरीत्या पूर्ण झाला असून अधिकृत दाखला जारी करण्यात आला आहे.'
          : targetStatus === 'action_needed'
          ? `कागदपत्रे हवीत: ${rejectionNote}`
          : `अर्ज स्टेज ${targetStage} वर प्रक्रियेत आहे.`,
    });

    const updated = {
      ...selectedApp,
      currentStage: targetStage,
      status: targetStatus,
      statusBadge:
        targetStatus === 'completed'
          ? 'पूर्ण'
          : targetStatus === 'action_needed'
          ? 'कागदपत्रे हवी'
          : 'प्रक्रियेत',
      actionRequiredNote: targetStatus === 'action_needed' ? rejectionNote : '',
      issuedDocument:
        targetStage === 5
          ? {
              name: `${selectedApp.serviceTitle} - अधिकृत दाखला`,
              fileName: issuedDocName || `${selectedApp.serviceSlug}_${selectedApp.applicationNumber}.pdf`,
              fileSize: '1.2 MB',
              issuedDate: new Date().toLocaleDateString('mr-IN'),
            }
          : selectedApp.issuedDocument,
    };

    setApplications((prev) =>
      prev.map((item) => (item.applicationNumber === selectedApp.applicationNumber ? updated : item))
    );
    setSelectedApp(updated);
    showToast('अर्ज व कागदपत्रे स्थिती यशस्वीरीत्या अद्ययावत केली!');
  };

  // WhatsApp quick assist for admin to ping citizen
  const handlePingCitizenWhatsApp = (app) => {
    const phone = app.phone || app.applicantDetails?.phone;
    const name = app.applicantName || app.applicantDetails?.fullName;
    const service = app.serviceTitle || app.serviceDetails?.marathiTitle;
    const appNo = app.applicationNumber;

    let msg = `नमस्कार ${name} जी! आम्ही योजना दूत (YojanaDut) प्रशासकीय कक्षातून बोलत आहोत. तुमच्या ${service} अर्जाबद्दल (क्रमांक: ${appNo}) अपडेट: `;
    if (app.status === 'action_needed') {
      msg += `कृपया खालील त्रुटी दूर करण्यासाठी कागदपत्रे पुन्हा अपलोड करा: "${app.actionRequiredNote || 'कागदपत्रे स्पष्ट नाहीत'}". लिंक: https://yojanadut.in/track-status`;
    } else if (app.status === 'completed') {
      msg += `अभिनंदन! तुमचा अधिकृत दाखला मंजूर झाला आहे. तुम्ही पोर्टलवरून लगेच डाउनलोड करू शकता.`;
    } else {
      msg += `तुमचा अर्ज सध्या शासकीय कार्यालयात स्टेज ${app.currentStage}/५ वर प्रक्रियेत आहे.`;
    }

    const encoded = encodeURIComponent(msg);
    window.open(`https://api.whatsapp.com/send?phone=91${phone}&text=${encoded}`, '_blank');
  };

  // Payout action
  const handleApprovePayout = (id) => {
    setPayouts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'approved' } : p))
    );
    showToast('पेआउट मंजूर करण्यात आले!');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-900">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-fadeIn border border-emerald-400">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Administrative Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-xl">
            य
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base tracking-tight">योजनादूत</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Admin Panel
              </span>
            </div>
            <p className="text-[11px] text-slate-400">नागरिक सेवा व कागदपत्रे नियंत्रण कक्ष</p>
          </div>
        </div>

        {/* Admin info & Logout */}
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            title="रिफ्रेश करा"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            <span className="hidden sm:inline">रिफ्रेश</span>
          </button>

          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-bold text-slate-200">
              {adminUser?.name || 'प्रशासक (Super Admin)'}
            </span>
            <span className="text-[10px] text-amber-400">
              {adminUser?.designation || 'मुख्य प्रशासकीय अधिकारी'}
            </span>
          </div>

          <button
            onClick={onLogout}
            title="सत्रातून बाहेर पडा"
            className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 hover:text-rose-200 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">बाहेर पडा (Logout)</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Banner with Stats Overview */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                थेट प्रशासकीय नियंत्रण
              </span>
              <span className="text-[11px] font-medium text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded-full">
                महा-सेवा कनेक्ट v2.4
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              ग्राहक अर्ज व कागदपत्रे पडताळणी डॅशबोर्ड
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              कोणत्या ग्राहकाने कोणती कागदपत्रे जोडली आहेत ते तपासा, त्रुटी नोंदवा व शासकीय दाखला मंजुरी द्या.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl text-xs font-bold text-slate-400 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'applications'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'hover:text-slate-200 hover:bg-slate-800/80'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>ग्राहकांचे अर्ज व कागदपत्रे</span>
              <span
                className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'applications' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {applications.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('verification')}
              className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'verification'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'hover:text-slate-200 hover:bg-slate-800/80'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>कागदपत्र तपासणी डेस्क</span>
              {stats.pending > 0 && (
                <span
                  className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === 'verification' ? 'bg-slate-950 text-amber-400' : 'bg-amber-500 text-slate-950'
                  }`}
                >
                  {stats.pending}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'services'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'hover:text-slate-200 hover:bg-slate-800/80'
              }`}
            >
              <IdCard className="w-4 h-4" />
              <span>सेवा व शासकीय दर</span>
              <span
                className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'services' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {services.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('payouts')}
              className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'payouts'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'hover:text-slate-200 hover:bg-slate-800/80'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>एजंट पेआउट्स</span>
              <span
                className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'payouts' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {payouts.filter((p) => p.status === 'pending').length}
              </span>
            </button>
          </div>
        </div>

        {/* 1 DAY / 1 WEEK / 1 MONTH CUSTOMER APPLY TIMELINE ANALYTICS BAR */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/80 border border-slate-800 rounded-3xl p-4 sm:p-5 mb-6 shadow-xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                  ग्राहक अर्ज कालावधी (Customer Application Timeline)
                </h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {timeFilter === '1day'
                    ? '⚡ आज आलेले अर्ज (1 Day)'
                    : timeFilter === '1week'
                    ? '📅 या आठवड्यातील अर्ज (1 Week)'
                    : timeFilter === '1month'
                    ? '🗓️ या महिन्यातील अर्ज (1 Month)'
                    : '🌐 सर्व ग्राहक अर्ज (All Time)'}
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-xl">
                १ दिवस (आज), १ आठवडा किंवा १ महिन्यात अर्ज केलेल्या ग्राहकांची यादी आणि पोर्टल महसूल एका क्लिकवर तपासा.
              </p>
            </div>

            {/* 1 Day, 1 Week, 1 Month, All Time Segmented Filter */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs overflow-x-auto no-scrollbar shadow-inner">
              <button
                type="button"
                onClick={() => setTimeFilter('1day')}
                className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                  timeFilter === '1day'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/25 scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900 font-semibold'
                }`}
              >
                <span>⚡ १ दिवस (आज)</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    timeFilter === '1day' ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {timelineStats.day1} ग्राहक
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTimeFilter('1week')}
                className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                  timeFilter === '1week'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/25 scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900 font-semibold'
                }`}
              >
                <span>📅 १ आठवडा (7 Days)</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    timeFilter === '1week' ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {timelineStats.week1}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTimeFilter('1month')}
                className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                  timeFilter === '1month'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/25 scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900 font-semibold'
                }`}
              >
                <span>🗓️ १ महिना (30 Days)</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    timeFilter === '1month' ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {timelineStats.month1}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTimeFilter('all')}
                className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                  timeFilter === 'all'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/25 scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900 font-semibold'
                }`}
              >
                <span>🌐 सर्व (All)</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    timeFilter === 'all' ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {timelineStats.all}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Metric Cards Row for Selected Time Window */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 mb-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">ग्राहक अर्ज (Applications)</span>
              <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </span>
            </div>
            <div>
              <span className="text-2xl font-black text-white">{stats.total}</span>
              <span className="text-[11px] text-emerald-400 ml-2">
                {timeFilter === '1day' ? '⚡ आजचे अर्ज' : timeFilter === '1week' ? '↑ ७ दिवसांतील' : timeFilter === '1month' ? '↑ ३० दिवसांतील' : '↑ सर्व वेळ'}
              </span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">तपासणी प्रलंबित</span>
              <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <div>
              <span className="text-2xl font-black text-amber-400">{stats.pending}</span>
              <span className="text-[11px] text-amber-300/80 ml-2">प्राधान्याने तपासा</span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">कागदपत्रे त्रुटी / हवी</span>
              <span className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </span>
            </div>
            <div>
              <span className="text-2xl font-black text-rose-400">{stats.actionNeeded}</span>
              <span className="text-[11px] text-rose-300/80 ml-2">री-अपलोड मागितले</span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">मंजूर / दाखला जारी</span>
              <span className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>
            <div>
              <span className="text-2xl font-black text-emerald-400">{stats.completed}</span>
              <span className="text-[11px] text-emerald-300/80 ml-2">यशस्वी पूर्ण</span>
            </div>
          </div>

          <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-amber-500/15 via-slate-900 to-indigo-950/60 border border-amber-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-black/40">
            <div className="flex items-center justify-between text-amber-300 mb-2">
              <span className="text-xs font-semibold">कालावधी महसूल (Revenue)</span>
              <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-amber-300 font-mono">
                  ₹{stats.totalRevenue.toLocaleString('en-IN')}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                {stats.totalDocs} दस्तऐवज तपासणी
              </span>
            </div>
          </div>
        </div>

        {/* TAB 1: APPLICATIONS & DOCUMENTS */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="नाव, अर्ज क्र., मोबाईल, गाव किंवा सेवा शोधा..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none transition"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
                  <span className="text-slate-500 px-2 flex items-center gap-1 font-semibold">
                    <Filter className="w-3 h-3" /> स्थिती:
                  </span>
                  {[
                    { key: 'all', label: 'सर्व' },
                    { key: 'in_review', label: 'प्रक्रियेत' },
                    { key: 'action_needed', label: 'कागदपत्रे हवी' },
                    { key: 'completed', label: 'पूर्ण' },
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => setStatusFilter(filter.key)}
                      className={`px-2.5 py-1 rounded-lg transition font-medium ${
                        statusFilter === filter.key
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  aria-label="Filter by Service Category"
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-amber-500"
                >
                  <option value="all">सर्व वर्गवारी (Categories)</option>
                  <option value="certificates">दाखले / प्रमाणपत्र</option>
                  <option value="identity">ओळखपत्र सेवा</option>
                  <option value="revenue">महसूल व शेती</option>
                  <option value="business">व्यापार व उद्योग</option>
                  <option value="social">कल्याणकारी योजना</option>
                </select>
              </div>
            </div>

            {/* Applications List & Documents Show Master Table */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3.5 px-4">अर्ज क्र. व तारीख</th>
                      <th className="py-3.5 px-4">ग्राहक (Applicant Details)</th>
                      <th className="py-3.5 px-4">मागितलेली सेवा</th>
                      <th className="py-3.5 px-4">जोडलेली कागदपत्रे (Attached Docs)</th>
                      <th className="py-3.5 px-4">प्रगती (Stage)</th>
                      <th className="py-3.5 px-4">स्थिती</th>
                      <th className="py-3.5 px-4 text-right">कृती (Actions)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredApplications.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-12 text-slate-500">
                          <FileText className="w-10 h-10 mx-auto text-slate-700 mb-2" />
                          <p className="font-semibold text-slate-400">कोणतेही अर्ज सापडले नाहीत.</p>
                          <p className="text-[11px]">कृपया सर्च किंवा फिल्टर निकष बदलून पहा.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredApplications.map((app) => (
                        <tr
                          key={app._id || app.applicationNumber}
                          onClick={() => handleOpenClientDossier(app)}
                          className="hover:bg-slate-800/40 transition cursor-pointer group"
                        >
                          {/* App Number & Date */}
                          <td className="py-3.5 px-4">
                            <div className="font-mono font-bold text-amber-400 flex items-center gap-1.5">
                              <span>{app.applicationNumber}</span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {app.date} {app.time && `• ${app.time}`}
                            </div>
                            <div className="mt-1">
                              {(() => {
                                const days = calculateDaysAgo(app.date);
                                if (days === 0) {
                                  return (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                      आज आलेला अर्ज (1 Day)
                                    </span>
                                  );
                                }
                                if (days <= 7) {
                                  return (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                      १ आठवड्यात ({days} दि. पूर्वी)
                                    </span>
                                  );
                                }
                                if (days <= 30) {
                                  return (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                                      १ महिन्यात ({days} दि. पूर्वी)
                                    </span>
                                  );
                                }
                                return (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800 text-slate-400">
                                    मागील अर्ज ({days} दि. पूर्वी)
                                  </span>
                                );
                              })()}
                            </div>
                          </td>

                          {/* Applicant Info */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 border border-amber-500/30 text-amber-300 font-bold flex items-center justify-center shrink-0">
                                {(app.applicantName || app.applicantDetails?.fullName || 'अ')[0]}
                              </div>
                              <div>
                                <div className="font-bold text-white group-hover:text-amber-300 transition">
                                  {app.applicantName || app.applicantDetails?.fullName}
                                </div>
                                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                                  <span>📞 {app.phone || app.applicantDetails?.phone}</span>
                                  {app.applicantDetails?.village && (
                                    <span className="text-slate-500">
                                      • {app.applicantDetails.village}, {app.applicantDetails.district}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Service */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-200">
                              {app.serviceTitle || app.serviceDetails?.marathiTitle}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {app.categoryMarathi || 'शासकीय सेवा'}
                            </div>
                          </td>

                          {/* Attached Documents Badges */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1.5 max-w-xs">
                              {app.uploadedDocs && app.uploadedDocs.length > 0 ? (
                                app.uploadedDocs.map((doc, idx) => {
                                  const isVer = doc.status === 'verified';
                                  const isRej = doc.status === 'rejected';
                                  return (
                                    <span
                                      key={idx}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPreviewDoc(doc);
                                      }}
                                      title={`${doc.name} (${doc.fileSize}) - ${
                                        isVer ? 'मंजूर' : isRej ? 'त्रुटी' : 'प्रलंबित'
                                      }`}
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border cursor-pointer transition ${
                                        isVer
                                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                                          : isRej
                                          ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
                                          : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                                      }`}
                                    >
                                      {isVer ? (
                                        <Check className="w-2.5 h-2.5 text-emerald-400" />
                                      ) : isRej ? (
                                        <X className="w-2.5 h-2.5 text-rose-400" />
                                      ) : (
                                        <Clock className="w-2.5 h-2.5 text-amber-400" />
                                      )}
                                      <span className="truncate max-w-[90px]">{doc.docType || doc.name}</span>
                                    </span>
                                  );
                                })
                              ) : (
                                <span className="text-[11px] text-slate-500 italic">कागदपत्रे जोडलेली नाहीत</span>
                              )}
                            </div>
                          </td>

                          {/* Stage (1-5) */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1 mb-1">
                              {[1, 2, 3, 4, 5].map((st) => (
                                <span
                                  key={st}
                                  className={`w-3.5 h-1.5 rounded-full ${
                                    st <= (app.currentStage || 1)
                                      ? app.currentStage === 5
                                        ? 'bg-emerald-500'
                                        : 'bg-amber-500'
                                      : 'bg-slate-800'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              स्टेज {app.currentStage || 1} / ५
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                app.status === 'completed'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : app.status === 'action_needed'
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              }`}
                            >
                              {app.status === 'completed' ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : app.status === 'action_needed' ? (
                                <AlertCircle className="w-3 h-3" />
                              ) : (
                                <Clock className="w-3 h-3" />
                              )}
                              <span>{app.statusBadge || 'प्रक्रियेत'}</span>
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handlePingCitizenWhatsApp(app)}
                                title="नागरिकाला व्हॉट्सॲपवर मेसेज करा"
                                className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition"
                              >
                                <WhatsAppIcon className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleOpenClientDossier(app)}
                                title="कागदपत्रे डॉसियर उघडा"
                                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5 text-amber-400" />
                                <span>तपासा</span>
                              </button>

                              {app.currentStage < 5 && (
                                <button
                                  onClick={(e) => handleAdvanceStage(app, e)}
                                  title="पुढील पायरीवर पाठवा"
                                  className="px-2 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1"
                                >
                                  <span>+१</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VERIFICATION DESK */}
        {activeTab === 'verification' && (
          <div className="space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                    कागदपत्र तपासणी डेस्क (Immediate Document Review)
                  </h2>
                  <p className="text-xs text-slate-400">
                    नागरिकांनी जोडलेल्या सर्व कागदपत्रांची जलद पडताळणी करा आणि थेट मंजुरी द्या.
                  </p>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
                  {stats.totalDocs} एकूण दस्तऐवज
                </span>
              </div>

              {/* Grid of all uploaded docs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {applications.flatMap((app) =>
                  (app.uploadedDocs || []).map((doc) => ({
                    ...doc,
                    appNumber: app.applicationNumber,
                    applicantName: app.applicantName || app.applicantDetails?.fullName,
                    serviceTitle: app.serviceTitle,
                    app,
                  }))
                ).map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 hover:border-slate-700 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-800">
                          {item.appNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            item.status === 'verified'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : item.status === 'rejected'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {item.status === 'verified'
                            ? 'मंजूर ✓'
                            : item.status === 'rejected'
                            ? 'त्रुटी ⚠️'
                            : 'पडताळणी बाकी'}
                        </span>
                      </div>

                      <h3 className="font-bold text-white text-xs mb-0.5 line-clamp-1">{item.name}</h3>
                      <p className="text-[11px] text-slate-400 mb-2">
                        {item.applicantName} • {item.serviceTitle}
                      </p>
                      <div className="text-[10px] text-slate-500 flex items-center justify-between mb-3">
                        <span>फाइल: {item.fileName}</span>
                        <span>{item.fileSize}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => setPreviewDoc(item)}
                        className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 transition"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>पहा</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedApp(item.app);
                          handleUpdateDocStatus(item.id, 'verified');
                        }}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1 transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>मंजूर</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedApp(item.app);
                          handleUpdateDocStatus(item.id, 'rejected', 'दस्तऐवज अस्पष्ट आहे, पुन्हा जोडा.');
                        }}
                        className="py-1.5 px-2.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-center transition"
                        title="त्रुटी नोंदवा"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SERVICES CATALOG */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <IdCard className="w-5 h-5 text-amber-400" />
                    शासकीय सेवा व शुल्क सूची
                  </h2>
                  <p className="text-xs text-slate-400">
                    पोर्टलवरील उपलब्ध सेवा, शासकीय फी, एजंट कमिशन व लागणारी कागदपत्रे.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((srv) => (
                  <div
                    key={srv.id || srv._id}
                    className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                          {srv.categoryMarathi || 'शासकीय सेवा'}
                        </span>
                        <span className="text-xs font-bold text-emerald-400 font-mono">
                          ₹{srv.fees?.serviceFee || srv.serviceFee || 149}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-sm mb-1">{srv.marathiTitle || srv.title}</h3>
                      <p className="text-xs text-slate-400 mb-3">{srv.title}</p>

                      <div className="text-[11px] text-slate-400 mb-3">
                        <span className="text-slate-500 block mb-1 font-semibold">आवश्यक कागदपत्रे:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                          {(srv.documents || []).slice(0, 3).map((d, i) => (
                            <li key={i} className="truncate">{d}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>कालावधी: {srv.timeline || '२ ते ३ दिवस'}</span>
                      <span className="text-amber-400 font-medium">कमिशन: ₹{srv.commission || 30}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AGENT PAYOUTS */}
        {activeTab === 'payouts' && (
          <div className="space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-amber-400" />
                    ग्रामीण योजनादूत एजंट कमिशन पेआउट्स
                  </h2>
                  <p className="text-xs text-slate-400">
                    गावागावांतील एजंट्सच्या कमिशन रकमेची पडताळणी व थेट UPI मंजुरी.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">एजंट तपशील</th>
                      <th className="py-3 px-4">गाव / तालुका</th>
                      <th className="py-3 px-4">एकूण अर्ज</th>
                      <th className="py-3 px-4">कमिशन रक्कम</th>
                      <th className="py-3 px-4">UPI आयडी</th>
                      <th className="py-3 px-4">तारीख</th>
                      <th className="py-3 px-4 text-right">कृती</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {payouts.map((po) => (
                      <tr key={po.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{po.agentName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            📞 {po.phone} • {po.referralCode}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{po.village}</td>
                        <td className="py-3 px-4 font-mono font-bold text-amber-400">
                          {po.totalApplications} अर्ज
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400 text-sm">
                          ₹{po.amount}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">{po.upiId}</td>
                        <td className="py-3 px-4 text-slate-400">{po.date}</td>
                        <td className="py-3 px-4 text-right">
                          {po.status === 'pending' ? (
                            <button
                              onClick={() => handleApprovePayout(po.id)}
                              className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
                            >
                              मंजूर करा
                            </button>
                          ) : (
                            <span className="text-emerald-400 font-bold text-xs flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              मंजूर झाले
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CLIENT DOSSIER MODAL ("Which client apply the document show") */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                  {(selectedApp.applicantName || selectedApp.applicantDetails?.fullName || 'अ')[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">
                      {selectedApp.applicantName || selectedApp.applicantDetails?.fullName}
                    </h2>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                      {selectedApp.applicationNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {selectedApp.serviceTitle || selectedApp.serviceDetails?.marathiTitle}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedApp(null)}
                aria-label="Close client dossier modal"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* Applicant Bio & Location Details */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                <h3 className="font-bold text-slate-200 text-xs mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400" />
                  ग्राहकाची माहिती (Applicant Information)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[10px]">मोबाईल क्रमांक:</span>
                    <span className="font-mono font-semibold">
                      {selectedApp.phone || selectedApp.applicantDetails?.phone || 'उपलब्ध नाही'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">ईमेल:</span>
                    <span className="truncate block">
                      {selectedApp.applicantDetails?.email || 'उपलब्ध नाही'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">आधार क्रमांक:</span>
                    <span className="font-mono">
                      {selectedApp.applicantDetails?.aadhaarNumber || 'XXXX-XXXX-XXXX'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">पत्ता (गाव, तालुका, जिल्हा):</span>
                    <span>
                      {selectedApp.applicantDetails?.village || ''}, {selectedApp.applicantDetails?.taluka || ''},{' '}
                      {selectedApp.applicantDetails?.district || ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* ATTACHED DOCUMENTS SHOWCASE */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-200 text-xs flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    ग्राहकाने जोडलेली कागदपत्रे (Client Uploaded Documents)
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {selectedApp.uploadedDocs?.length || 0} फाईल्स जोडल्या आहेत
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(selectedApp.uploadedDocs || []).map((doc) => {
                    const isVer = doc.status === 'verified';
                    const isRej = doc.status === 'rejected';

                    return (
                      <div
                        key={doc.id || doc.name}
                        className={`p-3.5 rounded-2xl border transition flex flex-col justify-between ${
                          isVer
                            ? 'bg-emerald-950/20 border-emerald-500/30'
                            : isRej
                            ? 'bg-rose-950/20 border-rose-500/30'
                            : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="w-8 h-8 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center font-bold">
                                {doc.fileType === 'pdf' ? 'PDF' : 'IMG'}
                              </span>
                              <div>
                                <span className="font-bold text-white block text-xs">{doc.name}</span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {doc.fileName} ({doc.fileSize})
                                </span>
                              </div>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                isVer
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : isRej
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              }`}
                            >
                              {isVer ? 'मंजूर ✓' : isRej ? 'त्रुटी ⚠️' : 'पडताळणी बाकी'}
                            </span>
                          </div>

                          {doc.rejectionReason && (
                            <p className="text-[11px] text-rose-300 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20 mb-2">
                              त्रुटी: {doc.rejectionReason}
                            </p>
                          )}
                        </div>

                        {/* Action buttons per document */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60 mt-2">
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            className="flex-1 py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center justify-center gap-1 transition"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                            <span>पहा (Preview)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUpdateDocStatus(doc.id, 'verified')}
                            className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>मंजूर</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const reason = prompt('कागदपत्रातील त्रुटी प्रविष्ट करा (Reason for re-upload):', 'दस्तऐवज अस्पष्ट आहे, कृपया स्पष्ट प्रत अपलोड करा.');
                              if (reason) handleUpdateDocStatus(doc.id, 'rejected', reason);
                            }}
                            className="py-1.5 px-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition"
                            title="त्रुटी नोंदवा"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>त्रुटी</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stage Progression & Action Form */}
              <form onSubmit={handleSaveDossierChanges} className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-4">
                <h3 className="font-bold text-slate-200 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  अर्जाची प्रगती व अंतिम निर्णय (Stage & Final Decision)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1.5 text-[11px] font-semibold">
                      सध्याची स्टेज निवडा (Stage 1-5):
                    </label>
                    <select
                      value={targetStage}
                      onChange={(e) => setTargetStage(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-amber-500 text-xs"
                    >
                      <option value="1">स्टेज १: अर्ज प्राप्त झाला (Received)</option>
                      <option value="2">स्टेज २: प्राथमिक तपासणी (Under Check)</option>
                      <option value="3">स्टेज ३: कागदपत्रे पडताळणी (Doc Verification)</option>
                      <option value="4">स्टेज ४: शासकीय पोर्टल प्रक्रिया (In Process)</option>
                      <option value="5">स्टेज ५: पूर्ण - दाखला तयार (Completed & Issued)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1.5 text-[11px] font-semibold">
                      अर्जाची स्थिती (Application Status):
                    </label>
                    <select
                      value={targetStatus}
                      onChange={(e) => setTargetStatus(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-amber-500 text-xs"
                    >
                      <option value="in_review">प्रक्रियेत आहे (In Review)</option>
                      <option value="action_needed">त्रुटी - कागदपत्रे हवीत (Action Needed)</option>
                      <option value="completed">पूर्ण - दाखला मंजूर (Completed)</option>
                    </select>
                  </div>
                </div>

                {targetStatus === 'action_needed' && (
                  <div>
                    <label className="block text-rose-300 mb-1.5 text-[11px] font-semibold">
                      नागरिकाला पाठवायचा संदेश / त्रुटी तपशील:
                    </label>
                    <input
                      type="text"
                      value={rejectionNote}
                      onChange={(e) => setRejectionNote(e.target.value)}
                      placeholder="उदा. ७/१२ उतारा अस्पष्ट आहे किंवा स्वाक्षरी दिसत नाही."
                      className="w-full bg-slate-900 border border-rose-500/40 text-white rounded-xl px-3 py-2 outline-none focus:border-rose-400 text-xs"
                    />
                  </div>
                )}

                {targetStage === 5 && (
                  <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3">
                    <label className="block text-emerald-300 mb-1.5 text-[11px] font-semibold">
                      जारी केलेला अधिकृत दाखला (Certificate File Name):
                    </label>
                    <input
                      type="text"
                      value={issuedDocName}
                      onChange={(e) => setIssuedDocName(e.target.value)}
                      placeholder={`${selectedApp.serviceSlug}_${selectedApp.applicationNumber}.pdf`}
                      className="w-full bg-slate-900 border border-emerald-500/40 text-white rounded-xl px-3 py-2 outline-none focus:border-emerald-400 text-xs font-mono"
                    />
                    <p className="text-[10px] text-emerald-400/80 mt-1">
                      हा दाखला नागरिक आपल्या ट्रॅकिंग पेजवरून लगेच डाउनलोड करू शकतील.
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => handlePingCitizenWhatsApp(selectedApp)}
                    className="px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-semibold text-xs flex items-center gap-1.5 transition"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    <span>नागरिकाला व्हॉट्सॲप पाठवा</span>
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>बदल जतन करा (Save Changes)</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-sm text-white">{previewDoc.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {previewDoc.fileName}
                </span>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                aria-label="Close document preview modal"
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Live Viewport */}
            <div className="p-6 bg-slate-950 flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-full max-w-md bg-white text-slate-900 rounded-2xl p-6 shadow-xl border border-slate-200 text-left font-serif relative">
                <div className="text-center border-b pb-3 mb-4">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    महाराष्ट्र शासन • MAHARASHTRA GOVERNMENT
                  </div>
                  <div className="text-xs font-black text-slate-900 mt-1">
                    {previewDoc.name}
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b pb-1 text-[11px]">
                    <span className="text-slate-500">दस्तऐवज प्रकार:</span>
                    <span className="font-bold">{previewDoc.docType || previewDoc.name}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1 text-[11px]">
                    <span className="text-slate-500">अपलोड दिनांक:</span>
                    <span>{previewDoc.uploadedAt || '०६ ऑक्टो २०२६'}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1 text-[11px]">
                    <span className="text-slate-500">डिजिटल स्वाक्षरी:</span>
                    <span className="text-emerald-700 font-bold">प्रमाणित (Verified Digital Signature)</span>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t text-center text-[10px] text-slate-400">
                  डिजिटल दस्तऐवज पडताळणी कक्ष • योजनादूत महा-सेवा
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">आकार: {previewDoc.fileSize || '1.2 MB'}</span>
              <button
                onClick={() => {
                  alert(`कागदपत्र ${previewDoc.fileName} यशस्वीरीत्या डाउनलोड झाले!`);
                }}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>डाउनलोड करा</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-3 px-4 text-center text-xs text-slate-500">
        <p>© 2026 योजनादूत प्रशासकीय पोर्टल. सर्व हक्क राखीव. महाराष्ट्र शासन लोकसेवा कक्ष.</p>
      </footer>
    </div>
  );
};
