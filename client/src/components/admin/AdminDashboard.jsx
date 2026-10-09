import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Users,
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
  Award,
  Sprout,
  Laptop,
  FileCheck,
  Check,
} from '../common/Icons';
import { useLanguage } from '../../context/LanguageContext';
import { api, fallbackApplications, fallbackServices } from '../../services/api';

export const AdminDashboard = () => {
  const { t } = useLanguage();
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState('applications'); // 'applications' | 'verification' | 'services' | 'payouts'
  
  // Data state
  const [applications, setApplications] = useState(fallbackApplications);
  const [services, setServices] = useState(fallbackServices);
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modals & Drawers
  const [selectedApp, setSelectedApp] = useState(null); // Client Dossier Modal
  const [previewDoc, setPreviewDoc] = useState(null); // Document Previewer
  const [editStatusModal, setEditStatusModal] = useState(false);
  const [rejectionNote, setRejectionNote] = useState('');
  const [targetStage, setTargetStage] = useState(1);
  const [targetStatus, setTargetStatus] = useState('in_review');
  const [issuedDocName, setIssuedDocName] = useState('');

  // Payouts sample state
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
  ]);

  const loadData = async () => {
    try {
      const appRes = await api.trackApplications('all');
      if (appRes && appRes.applications && appRes.applications.length > 0) {
        setApplications(appRes.applications);
      }
      const srvRes = await api.getServices('all');
      if (srvRes && srvRes.services && srvRes.services.length > 0) {
        setServices(srvRes.services);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered applications based on search & filters
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
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
  }, [applications, statusFilter, categoryFilter, searchQuery]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter((a) => a.status === 'in_review' || a.status === 'submitted').length;
    const actionNeeded = applications.filter((a) => a.status === 'action_needed').length;
    const completed = applications.filter((a) => a.status === 'completed').length;
    const totalDocs = applications.reduce((acc, curr) => acc + (curr.uploadedDocs?.length || 0), 0);

    return {
      total,
      pending,
      actionNeeded,
      completed,
      totalDocs,
    };
  }, [applications]);

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

    await api.updateApplicationStage(app.applicationNumber || app._id, {
      currentStage: nextStage,
      status: nextStatus,
      statusNoteMarathi:
        nextStage === 5
          ? 'अभिनंदन! तुमचा शासकीय दाखला/कागदपत्र तयार झाले असून अर्ज पूर्ण झाला आहे.'
          : `तुमचा अर्ज स्टेज ${nextStage} वर प्रगतीपथावर आहे.`,
    });

    setApplications((prev) =>
      prev.map((item) =>
        (item.applicationNumber === app.applicationNumber || item._id === app._id)
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
  };

  // Save changes from Dossier / Modal
  const handleSaveDossierChanges = async (e) => {
    if (e) e.preventDefault();
    if (!selectedApp) return;

    await api.updateApplicationStage(selectedApp.applicationNumber || selectedApp._id, {
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
    alert(t('अर्ज व कागदपत्रे स्थिती यशस्वीरीत्या अद्ययावत केली गेली!', 'Application and documents status updated successfully!'));
  };

  // WhatsApp quick assist for admin to ping citizen
  const handlePingCitizenWhatsApp = (app) => {
    const phone = app.phone || app.applicantDetails?.phone;
    const name = app.applicantName || app.applicantDetails?.fullName;
    const service = app.serviceTitle || app.serviceDetails?.marathiTitle;
    const appNo = app.applicationNumber;

    let msg = `नमस्कार ${name} जी! आम्ही योजना दूत (YojanaDut) पोर्टलवरून बोलत आहोत. तुमच्या ${service} अर्जाबद्दल (क्रमांक: ${appNo}) अपडेट: `;
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left animate-fadeIn">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              प्रशासक नियंत्रण कक्ष (Admin Operations)
            </span>
            <span className="text-[11px] font-medium text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
              महाराष्ट्र शासन ई-सेवा सुलभ पोर्टल
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#064E3B] tracking-tight">
            {t('नागरिक अर्ज व कागदपत्रे पडताळणी डॅशबोर्ड', 'Citizen Applications & Document Verification Suite')}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            {t('कोणत्या नागरिकाने कोणती कागदपत्रे जोडली आहेत ते तपासा, त्रुटी नोंदवा व दाखला मंजुरी द्या.', 'Inspect which client applied with what documents, review submissions and issue certificates.')}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-stone-100 p-1.5 rounded-2xl text-xs font-bold text-stone-600 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'applications' ? 'bg-[#064E3B] text-white shadow-xs' : 'hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{t('नागरिकांचे अर्ज व कागदपत्रे', 'Client Applications')}</span>
            <span className="ml-1 text-[10px] bg-emerald-800/80 text-white px-1.5 py-0.2 rounded-full">
              {applications.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('verification')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'verification' ? 'bg-[#064E3B] text-white shadow-xs' : 'hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t('कागदपत्र तपासणी डेस्क', 'Doc Verification')}</span>
            {stats.pending > 0 && (
              <span className="ml-1 text-[10px] bg-amber-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                {stats.pending}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'services' ? 'bg-[#064E3B] text-white shadow-xs' : 'hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>{t('सेवा व दर', 'Services')}</span>
            <span className="ml-1 text-[10px] bg-stone-300 text-stone-800 px-1.5 py-0.2 rounded-full">
              {services.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('payouts')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'payouts' ? 'bg-[#064E3B] text-white shadow-xs' : 'hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>{t('विड्रॉल वाटप', 'Payouts')}</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 mb-8">
        
        {/* Metric 1 */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-stone-500 font-bold uppercase tracking-wider">{t('एकूण नागरिक अर्ज', 'Total Applications')}</span>
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 block">{stats.total}</span>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-block">
            ↑ +२४ आज नवीन आले
          </span>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-amber-700 font-bold uppercase tracking-wider">{t('तपासणी प्रलंबित', 'Pending Review')}</span>
            <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-900 block">{stats.pending}</span>
          <span className="text-[11px] text-amber-600 font-medium mt-1 inline-block">
            प्राधान्याने तपासणे आवश्यक
          </span>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-rose-700 font-bold uppercase tracking-wider">{t('कागदपत्रे हवीत (त्रुटी)', 'Action Needed')}</span>
            <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-800 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-rose-900 block">{stats.actionNeeded}</span>
          <span className="text-[11px] text-rose-600 font-medium mt-1 inline-block">
            नागरिकाकडून री-अपलोड प्रलंबित
          </span>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider">{t('पूर्ण झालेले दाखले', 'Completed & Issued')}</span>
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-950 block">{stats.completed}</span>
          <span className="text-[11px] text-emerald-700 font-bold mt-1 inline-block">
            ९८.९% यश दर (Success Rate)
          </span>
        </div>

        {/* Metric 5 */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-xs relative overflow-hidden col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-stone-500 font-bold uppercase tracking-wider">{t('पोर्टल महसूल', 'Platform Revenue')}</span>
            <span className="w-7 h-7 rounded-lg bg-orange-50 text-orange-800 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 block">₹२,४८,५००</span>
          <span className="text-[11px] text-[#EA580C] font-semibold mt-1 inline-block">
            एजंट कमिशन: ₹८४,२९०
          </span>
        </div>

      </div>

      {/* ======================================================== */}
      {/* TAB 1: APPLICATIONS & CLIENT DOCUMENTS LIST (PRIMARY REQ) */}
      {/* ======================================================== */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          
          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('अर्जदार नाव, मोबाईल नंबर, गाव किंवा अर्ज क्र. (उदा. YD-24081) शोधा...', 'Search applicant name, mobile, village or App ID...')}
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 bg-stone-50/50"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: 'सर्व अर्ज' },
                  { id: 'in_review', label: 'प्रक्रियेत / तपासणीत' },
                  { id: 'action_needed', label: 'कागदपत्रे हवीत' },
                  { id: 'completed', label: 'पूर्ण' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStatusFilter(s.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      statusFilter === s.id
                        ? 'bg-[#064E3B] text-white shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200/70 text-stone-600'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

            </div>

            {/* Sub-bar with categories filter */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs text-stone-500">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="font-semibold text-stone-400">{t('सेवा वर्गवारी:', 'Category:')}</span>
                {[
                  { id: 'all', label: 'सर्व' },
                  { id: 'certificates', label: 'दाखले' },
                  { id: 'identity', label: 'ओळखपत्र' },
                  { id: 'farmer', label: 'शेतकरी' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCategoryFilter(c.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition cursor-pointer ${
                      categoryFilter === c.id
                        ? 'bg-emerald-50 text-[#064E3B] font-bold border border-emerald-200'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <span className="text-[11px] font-medium text-stone-400 hidden sm:inline-block">
                {filteredApplications.length} अर्ज आढळले
              </span>
            </div>
          </div>

          {/* Master Applications & Documents Table */}
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#FAF9F6] border-b border-stone-200/80 text-stone-500 font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-4 px-4">{t('अर्ज क्र. व तारीख', 'App ID & Date')}</th>
                    <th className="py-4 px-4">{t('अर्जदार नागरिक (Client)', 'Applicant Client')}</th>
                    <th className="py-4 px-4">{t('अर्ज केलेली सेवा', 'Service Applied')}</th>
                    <th className="py-4 px-4">{t('जोडलेली कागदपत्रे (Attached Documents)', 'Client Documents')}</th>
                    <th className="py-4 px-4">{t('प्रगती स्टेज (Stage)', 'Stage (1-5)')}</th>
                    <th className="py-4 px-4">{t('स्थिती (Status)', 'Status')}</th>
                    <th className="py-4 px-4 text-right">{t('कृती (Actions)', 'Actions')}</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {filteredApplications.map((app) => {
                    const clientName = app.applicantName || app.applicantDetails?.fullName || 'नागरिक';
                    const clientPhone = app.phone || app.applicantDetails?.phone || '';
                    const clientVillage = app.applicantDetails?.village || '';
                    const clientTaluka = app.applicantDetails?.taluka || '';
                    const clientDistrict = app.applicantDetails?.district || '';
                    const serviceTitle = app.serviceTitle || app.serviceDetails?.marathiTitle || 'शासकीय सेवा';
                    const docsList = app.uploadedDocs || [];

                    return (
                      <tr
                        key={app._id || app.applicationNumber}
                        onClick={() => handleOpenClientDossier(app)}
                        className="hover:bg-emerald-50/30 transition-colors cursor-pointer group"
                      >
                        {/* 1. App ID & Date */}
                        <td className="py-4 px-4 align-top">
                          <span className="font-mono font-extrabold text-stone-900 group-hover:text-[#064E3B] transition-colors block">
                            {app.applicationNumber}
                          </span>
                          <span className="text-[11px] text-stone-400 font-medium block mt-0.5">
                            {app.date}
                          </span>
                          {app.time && (
                            <span className="text-[10px] text-stone-400 block">
                              {app.time}
                            </span>
                          )}
                        </td>

                        {/* 2. Applicant Client Details */}
                        <td className="py-4 px-4 align-top">
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#064E3B] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                              {clientName ? clientName[0] : 'न'}
                            </div>
                            <div>
                              <div className="font-extrabold text-stone-900 text-xs sm:text-sm">
                                {clientName}
                              </div>
                              <div className="text-[11px] text-stone-500 font-mono flex items-center gap-1.5 mt-0.5">
                                <span>{clientPhone}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePingCitizenWhatsApp(app);
                                  }}
                                  className="text-emerald-700 hover:text-emerald-900 p-0.5"
                                  title="WhatsApp वर संदेश पाठवा"
                                >
                                  <WhatsAppIcon className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              {(clientVillage || clientDistrict) && (
                                <div className="text-[10px] text-stone-400 mt-0.5">
                                  📍 {clientVillage ? `${clientVillage}, ` : ''}{clientTaluka ? `${clientTaluka}, ` : ''}{clientDistrict}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 3. Service Applied */}
                        <td className="py-4 px-4 align-top">
                          <div className="font-bold text-stone-900 text-xs sm:text-sm leading-snug">
                            {serviceTitle}
                          </div>
                          <div className="text-[11px] text-stone-400 font-medium mt-0.5">
                            शुल्क: <span className="text-stone-700 font-bold">₹{app.payment?.amount || app.serviceDetails?.basePrice || 149}</span>
                          </div>
                        </td>

                        {/* 4. Client's Uploaded Documents (THE HIGHLIGHTED FEATURE!) */}
                        <td className="py-4 px-4 align-top">
                          <div className="space-y-1.5 max-w-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-[#064E3B] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                {docsList.length} कागदपत्रे जोडली
                              </span>
                            </div>

                            {/* Document item pills */}
                            <div className="flex flex-wrap gap-1 mt-1">
                              {docsList.slice(0, 3).map((doc, idx) => (
                                <span
                                  key={idx}
                                  className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                                    doc.status === 'verified' || doc.status === 'valid'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      : doc.status === 'rejected'
                                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                                      : 'bg-amber-50 text-amber-800 border-amber-200'
                                  }`}
                                >
                                  <FileText className="w-3 h-3" />
                                  <span className="truncate max-w-[100px]">{doc.name || doc.docType}</span>
                                  {doc.status === 'verified' && <span className="text-emerald-700">✓</span>}
                                  {doc.status === 'rejected' && <span className="text-rose-700">✗</span>}
                                </span>
                              ))}
                              {docsList.length > 3 && (
                                <span className="text-[10px] text-stone-400 font-semibold self-center">
                                  +{docsList.length - 3} अधिक
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 5. Pipeline Stage */}
                        <td className="py-4 px-4 align-top">
                          <div className="space-y-1">
                            <span className="font-extrabold text-xs text-[#064E3B] block">
                              स्टेज {app.currentStage || 1}/५
                            </span>
                            <div className="w-20 h-2 bg-stone-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  app.currentStage === 5 ? 'bg-emerald-600' : 'bg-[#0D4F45]'
                                }`}
                                style={{ width: `${((app.currentStage || 1) / 5) * 100}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-stone-400 block">
                              {app.currentStage === 5 ? 'पूर्ण' : 'प्रक्रियेत'}
                            </span>
                          </div>
                        </td>

                        {/* 6. Status Badge */}
                        <td className="py-4 px-4 align-top">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${
                              app.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : app.status === 'action_needed'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {app.status === 'completed'
                              ? '• पूर्ण (Done)'
                              : app.status === 'action_needed'
                              ? '• कागदपत्रे हवीत'
                              : '• प्रक्रियेत (Review)'}
                          </span>
                        </td>

                        {/* 7. Action buttons */}
                        <td className="py-4 px-4 align-top text-right space-x-1.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenClientDossier(app)}
                            className="bg-[#064E3B] hover:bg-[#043d2e] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition cursor-pointer inline-flex items-center gap-1"
                            title="कागदपत्रे व संपूर्ण तपशील पहा"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{t('कागदपत्रे पहा', 'View Docs')}</span>
                          </button>

                          {app.currentStage < 5 && app.status !== 'completed' && (
                            <button
                              onClick={(e) => handleAdvanceStage(app, e)}
                              className="bg-emerald-50 hover:bg-emerald-100 text-[#064E3B] border border-emerald-300 text-xs font-bold px-2.5 py-1.5 rounded-xl transition cursor-pointer"
                              title="पुढील स्टेजवर नेणे"
                            >
                              + पुढील स्टेज
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredApplications.length === 0 && (
              <div className="p-12 text-center text-stone-400">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="font-semibold text-sm text-stone-600">कोणताही अर्ज सापडला नाही.</p>
                <button
                  onClick={() => { setSearchQuery(''); setStatusFilter('all'); setCategoryFilter('all'); }}
                  className="mt-2 text-xs text-[#064E3B] font-bold hover:underline"
                >
                  सर्व फिल्टर्स रिसेट करा
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: DEDICATED DOCUMENT VERIFICATION DESK */}
      {/* ======================================================== */}
      {activeTab === 'verification' && (
        <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900">
                {t('कागदपत्र तपासणी व पडताळणी डेस्क', 'Document Verification & Audit Desk')}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {t('सर्व अर्जदारांनी जोडलेली कागदपत्रे एकाच ठिकाणी तपासा व मंजुरी द्या.', 'Review and approve all citizen submitted documents in one streamlined view.')}
              </p>
            </div>
            <span className="text-xs bg-amber-50 text-amber-800 font-bold px-3 py-1.5 rounded-full border border-amber-200">
              {stats.pending} अर्ज पडताळणी बाकी
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {applications.map((app) => (
              <div
                key={app.applicationNumber}
                className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-white hover:border-emerald-600/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-extrabold text-[#064E3B]">
                      {app.applicationNumber}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      app.status === 'completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                      app.status === 'action_needed' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                      'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {app.statusBadge || 'प्रक्रियेत'}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-stone-900">
                    {app.applicantName || app.applicantDetails?.fullName}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {app.serviceTitle} · 📍 {app.applicantDetails?.village}, {app.applicantDetails?.district}
                  </p>

                  {/* Documents count and list */}
                  <div className="mt-4 pt-3 border-t border-stone-200/80 space-y-2">
                    <span className="text-[11px] font-bold text-stone-600 block">
                      जोडलेली कागदपत्रे ({app.uploadedDocs?.length || 0}):
                    </span>
                    {(app.uploadedDocs || []).map((doc, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded-xl bg-white border border-stone-200 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                          <span className="font-semibold text-stone-800 truncate">{doc.name}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          doc.status === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                          doc.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {doc.status === 'verified' ? 'मंजूर ✓' : doc.status === 'rejected' ? 'अस्पष्ट ✗' : 'तपासा'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-stone-200 flex items-center justify-between">
                  <button
                    onClick={() => handlePingCitizenWhatsApp(app)}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                    <span>WhatsApp संदेश</span>
                  </button>

                  <button
                    onClick={() => handleOpenClientDossier(app)}
                    className="bg-[#064E3B] text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-[#043d2e] transition cursor-pointer"
                  >
                    पडताळणी करा →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: SERVICES & PRICING MANAGEMENT */}
      {/* ======================================================== */}
      {activeTab === 'services' && (
        <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900">
                {t('उपलब्ध शासकीय सेवा व कमिशन दर', 'Services & Commissions Pricing')}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {t('प्रत्येक सेवेचे शासकीय शुल्क, एजंट कमिशन आणि लागणारा कालावधी', 'Base customer fees, agent referral rewards and turnaround SLA')}
              </p>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3.5 py-1.5 rounded-full">
              {services.length} सेवा सक्रिय
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((srv) => (
              <div key={srv._id || srv.slug} className="p-4 sm:p-5 rounded-2xl border border-stone-200 bg-stone-50/50 flex flex-col justify-between hover:bg-white hover:shadow-md transition">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {srv.categoryMarathi || srv.category}
                    </span>
                    <span className="text-[11px] font-medium text-stone-500 bg-stone-200/80 px-2 py-0.5 rounded-md">
                      {srv.estimatedDays}
                    </span>
                  </div>
                  <h3 className="font-bold text-stone-900 text-base">{srv.marathiTitle}</h3>
                  <p className="text-xs text-stone-400 font-medium">{srv.title}</p>
                  <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed">{srv.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-stone-400 block text-[10px]">नागरिक शुल्क:</span>
                    <strong className="text-stone-900 font-extrabold text-sm">₹{srv.basePrice}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">योजना दूत कमिशन:</span>
                    <strong className="text-[#EA580C] font-extrabold text-sm">₹{srv.agentCommission}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: PAYOUTS & AGENT APPROVALS */}
      {/* ======================================================== */}
      {activeTab === 'payouts' && (
        <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900">
                {t('योजना दूत कमिशन विड्रॉल मंजुरी', 'Agent Referral Commission Payout Approvals')}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {t('ग्रामीण योजना दूतांच्या खात्यावर कमिशन वर्ग करण्याची विनंती तपासा व मंजुरी द्या.', 'Review UPI transfer requests and approve immediate agent payouts.')}
              </p>
            </div>
            <span className="text-xs font-extrabold text-[#EA580C] bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200">
              ₹1,250 विड्रॉल प्रलंबित
            </span>
          </div>

          <div className="divide-y divide-stone-100">
            {payouts.map((po) => (
              <div key={po.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-sm">{po.agentName}</span>
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {po.referralCode}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    📞 {po.phone} · 📍 {po.village} · यशस्वी अर्ज: {po.totalApplications}
                  </p>
                  <p className="text-xs font-mono text-stone-600 mt-1">
                    UPI ID: <strong className="text-stone-900">{po.upiId}</strong> · {po.date}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-stone-400 block font-medium">रक्कम:</span>
                    <span className="text-xl font-extrabold text-stone-900">₹{po.amount}</span>
                  </div>

                  {po.status === 'pending' ? (
                    <button
                      onClick={() => {
                        setPayouts((prev) =>
                          prev.map((p) => (p.id === po.id ? { ...p, status: 'approved' } : p))
                        );
                        alert(`₹${po.amount} चे विड्रॉल ${po.agentName} च्या UPI वर यशस्वी मंजूर झाले!`);
                      }}
                      className="bg-[#064E3B] hover:bg-[#043d2e] text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs cursor-pointer"
                    >
                      मंजूर करा (Approve)
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                      ✓ वर्ग झाले (Transferred)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CLIENT APPLICATION & DOCUMENT INSPECTION DOSSIER MODAL */}
      {/* ======================================================== */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative my-8 text-left animate-scaleUp max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-stone-100 pb-4 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-extrabold text-[#064E3B] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    {selectedApp.applicationNumber}
                  </span>
                  <span className="text-xs text-stone-400">
                    तारीख: {selectedApp.date} {selectedApp.time ? `· ${selectedApp.time}` : ''}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 mt-1">
                  {selectedApp.serviceTitle || selectedApp.serviceDetails?.marathiTitle}
                </h2>
              </div>

              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="overflow-y-auto flex-1 py-4 space-y-6 pr-1">
              
              {/* 1. Client Identity Card */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-5">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-3">
                  {t('अर्जदार नागरिक तपशील (Client Profile)', 'Applicant Client Details')}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-xs text-stone-500 block">संपूर्ण नाव:</span>
                    <strong className="text-sm font-extrabold text-stone-900">
                      {selectedApp.applicantName || selectedApp.applicantDetails?.fullName}
                    </strong>
                  </div>

                  <div>
                    <span className="text-xs text-stone-500 block">मोबाईल क्रमांक:</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <strong className="text-sm font-mono font-bold text-stone-900">
                        {selectedApp.phone || selectedApp.applicantDetails?.phone}
                      </strong>
                      <button
                        onClick={() => handlePingCitizenWhatsApp(selectedApp)}
                        className="text-emerald-700 hover:text-emerald-900 p-0.5"
                        title="WhatsApp संदेश"
                      >
                        <WhatsAppIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-stone-500 block">पत्ता व ठिकाण:</span>
                    <span className="text-xs font-medium text-stone-800">
                      📍 {selectedApp.applicantDetails?.village ? `${selectedApp.applicantDetails.village}, ` : ''}
                      {selectedApp.applicantDetails?.taluka ? `ता. ${selectedApp.applicantDetails.taluka}, ` : ''}
                      जि. {selectedApp.applicantDetails?.district || 'पुणे'}
                    </span>
                  </div>

                  {selectedApp.applicantDetails?.aadhaarNumber && (
                    <div>
                      <span className="text-xs text-stone-500 block">आधार क्रमांक (मास्कड):</span>
                      <span className="text-xs font-mono font-bold text-stone-700">
                        {selectedApp.applicantDetails.aadhaarNumber}
                      </span>
                    </div>
                  )}

                  {selectedApp.applicantDetails?.annualIncome && (
                    <div>
                      <span className="text-xs text-stone-500 block">घोषित वार्षिक उत्पन्न:</span>
                      <span className="text-xs font-extrabold text-stone-900">
                        {selectedApp.applicantDetails.annualIncome}
                      </span>
                    </div>
                  )}

                  {selectedApp.applicantDetails?.purpose && (
                    <div>
                      <span className="text-xs text-stone-500 block">दाखल्याचा उद्देश:</span>
                      <span className="text-xs font-medium text-stone-700">
                        {selectedApp.applicantDetails.purpose}
                      </span>
                    </div>
                  )}
                </div>

                {/* Direct Action Chips */}
                <div className="mt-4 pt-3 border-t border-stone-200 flex flex-wrap gap-2">
                  <button
                    onClick={() => handlePingCitizenWhatsApp(selectedApp)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                    <span>व्हॉट्सॲपवर त्वरित अपडेट पाठवा</span>
                  </button>

                  <a
                    href={`tel:${selectedApp.phone || selectedApp.applicantDetails?.phone}`}
                    className="bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>कॉल करा</span>
                  </a>
                </div>
              </div>

              {/* 2. Client's Uploaded Documents Inspection Gallery */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-stone-900">
                      {t('नागरिकाने जोडलेली कागदपत्रे (Attached Documents)', 'Client Attached Documents')}
                    </h3>
                    <p className="text-xs text-stone-500">
                      {t('प्रत्येक कागदपत्र उघडून तपासा, योग्य असल्यास मंजूर करा किंवा त्रुटी नोंदवा.', 'Inspect each file preview, approve or mark for re-upload.')}
                    </p>
                  </div>
                  <span className="text-xs font-extrabold text-[#064E3B] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    {selectedApp.uploadedDocs?.length || 0} फाईल्स
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {(selectedApp.uploadedDocs || []).map((doc, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border transition-all ${
                        doc.status === 'verified'
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : doc.status === 'rejected'
                          ? 'bg-rose-50/50 border-rose-200'
                          : 'bg-white border-stone-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#854D0E] flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs sm:text-sm text-stone-900 line-clamp-1">
                              {doc.name || doc.docType}
                            </h4>
                            <span className="text-[11px] font-mono text-stone-400">
                              {doc.fileName || 'file.pdf'} · {doc.fileSize || '1.2 MB'}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border shrink-0 ${
                            doc.status === 'verified'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : doc.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                              : 'bg-amber-100 text-amber-800 border-amber-200'
                          }`}
                        >
                          {doc.status === 'verified' ? 'मंजूर ✓' : doc.status === 'rejected' ? 'अस्पष्ट ✗' : 'तपासणी बाकी'}
                        </span>
                      </div>

                      {doc.rejectionReason && (
                        <p className="text-[11px] text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-100 my-2 leading-relaxed">
                          ⚠️ त्रुटी नोंद: {doc.rejectionReason}
                        </p>
                      )}

                      {/* Interactive Document Inspection Actions */}
                      <div className="mt-3 pt-2.5 border-t border-stone-200/80 flex items-center justify-between gap-2 text-xs">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="text-[#064E3B] hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>कागदपत्र पहा</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleUpdateDocStatus(doc.id || doc.name, 'verified')}
                            className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold px-2 py-1 rounded-lg text-[11px] transition cursor-pointer"
                            title="कागदपत्र मंजूर करा"
                          >
                            ✓ मंजूर
                          </button>

                          <button
                            onClick={() => {
                              const reason = prompt('त्रुटी कारण लिहा (उदा. अस्पष्ट फोटो / जुना उतारा):', 'कागदपत्र अस्पष्ट आहे, कृपया स्पष्ट प्रत पुन्हा जोडा.');
                              if (reason) handleUpdateDocStatus(doc.id || doc.name, 'rejected', reason);
                            }}
                            className="bg-rose-100 hover:bg-rose-200 text-rose-900 font-bold px-2 py-1 rounded-lg text-[11px] transition cursor-pointer"
                            title="पुन्हा मागवा / त्रुटी"
                          >
                            ✗ पुन्हा मागवा
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Stage & Final Certificate Controls */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-5 space-y-4">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                  {t('प्रशासक निर्णय व स्टेज प्रगती', 'Admin Pipeline & Certificate Issuance')}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      {t('सध्याची प्रगती स्टेज (१ ते ५)', 'Pipeline Stage (1 to 5)')}
                    </label>
                    <select
                      value={targetStage}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setTargetStage(val);
                        if (val === 5) setTargetStatus('completed');
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold bg-white"
                    >
                      <option value={1}>१ - अर्ज प्राप्त (Application Received)</option>
                      <option value={2}>२ - तपासणी (Verification)</option>
                      <option value={3}>३ - कागदपत्रे पडताळणी (Documents Checked)</option>
                      <option value={4}>४ - शासकीय पोर्टलवर प्रक्रियेत (In Process)</option>
                      <option value={5}>५ - पूर्ण व दाखला तयार (Completed & Issued)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      {t('एकूण स्थिती (Status)', 'Application Status')}
                    </label>
                    <select
                      value={targetStatus}
                      onChange={(e) => setTargetStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold bg-white"
                    >
                      <option value="in_review">प्रक्रियेत (In Review / In Process)</option>
                      <option value="action_needed">कागदपत्रे हवीत (Action Needed - Resubmit)</option>
                      <option value="completed">पूर्ण झाले (Completed)</option>
                      <option value="rejected">नामंजूर (Rejected)</option>
                    </select>
                  </div>
                </div>

                {targetStatus === 'action_needed' && (
                  <div>
                    <label className="text-xs font-semibold text-rose-700 block mb-1">
                      {t('नागरिकाला पाठवायची त्रुटी / सूचना (SMS/WhatsApp वर जाईल)', 'Action Note for Citizen')}
                    </label>
                    <textarea
                      rows={2}
                      value={rejectionNote}
                      onChange={(e) => setRejectionNote(e.target.value)}
                      placeholder="उदा. ७/१२ उतारा स्पष्ट नाही, कृपया नवीन प्रत पुन्हा अपलोड करा."
                      className="w-full px-3 py-2 rounded-xl border border-rose-300 text-xs text-stone-800 bg-white"
                    />
                  </div>
                )}

                {targetStage === 5 && (
                  <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 space-y-2">
                    <span className="text-xs font-bold text-emerald-900 block">
                      ✓ तयार झालेला शासकीय दाखला / ई-पॅन जोडणे (Upload Issued Certificate)
                    </span>
                    <input
                      type="text"
                      value={issuedDocName}
                      onChange={(e) => setIssuedDocName(e.target.value)}
                      placeholder="उदा. digital_income_certificate_2026.pdf"
                      className="w-full px-3 py-2 rounded-lg border border-emerald-300 text-xs bg-white text-stone-900 font-mono"
                    />
                    <p className="text-[11px] text-emerald-700">
                      हा दाखला नागरिक आपल्या ट्रॅक स्टेटस पृष्ठावरून थेट डाउनलोड करू शकतील.
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer Controls */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                {t('बंद करा', 'Close')}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveDossierChanges}
                  className="bg-[#064E3B] hover:bg-[#043d2e] text-white px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>{t('बदल जतन करा (Save & Update)', 'Save & Update')}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* REALISTIC HIGH-RES DOCUMENT PREVIEW MODAL */}
      {/* ======================================================== */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative animate-scaleUp text-left">
            <button
              onClick={() => setPreviewDoc(null)}
              className="absolute right-5 top-5 p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                दस्तावेज पूर्वावलोकन (Document Preview)
              </span>
              <span className="text-xs text-stone-400 font-mono">
                {previewDoc.fileName || 'file.pdf'}
              </span>
            </div>

            <h3 className="text-lg font-bold text-stone-900 mb-4">
              {previewDoc.name}
            </h3>

            {/* Simulated official document display */}
            <div className="bg-[#FAF9F6] border-2 border-dashed border-stone-300 rounded-2xl p-8 text-center relative overflow-hidden min-h-[320px] flex flex-col items-center justify-center">
              
              {/* Official Seal Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <span className="text-7xl font-extrabold tracking-widest text-[#064E3B]">
                  GOVT OF MAHARASHTRA
                </span>
              </div>

              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-[#854D0E] flex items-center justify-center mb-3 shadow-xs">
                <FileText className="w-8 h-8" />
              </div>

              <h4 className="font-extrabold text-base text-stone-800">
                {previewDoc.name}
              </h4>
              <p className="text-xs text-stone-500 font-mono mt-1">
                आकार: {previewDoc.fileSize || '1.4 MB'} · तारीख: {previewDoc.uploadedAt || '०६ ऑक्टो २०२६'}
              </p>

              <div className="mt-4 p-3 rounded-xl bg-white border border-stone-200 max-w-md text-xs text-stone-600 leading-relaxed shadow-xs">
                <span className="text-emerald-800 font-bold block mb-1">
                  ✓ डिजिटल स्वाक्षरी पडताळणी:
                </span>
                हा दस्तावेज अर्जदाराने अधिकृत UIDAI / महसूल यंत्रणेकडून सादर केला असून स्पष्ट व वाचनीय आहे.
              </div>

              <div className="mt-5 flex gap-2">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(`डाउनलोड सुरू: ${previewDoc.fileName || 'document.pdf'}`);
                  }}
                  className="bg-[#064E3B] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-[#043d2e] transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>डाउनलोड करा</span>
                </a>

                <button
                  onClick={() => {
                    if (selectedApp) {
                      handleUpdateDocStatus(previewDoc.id || previewDoc.name, 'verified');
                    }
                    setPreviewDoc(null);
                  }}
                  className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-100 transition cursor-pointer"
                >
                  ✓ मंजूर करा आणि बंद करा
                </button>
              </div>
            </div>

            <div className="mt-4 text-right">
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-xs font-semibold text-stone-500 hover:text-stone-800"
              >
                बंद करा
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
