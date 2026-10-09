import React, { useState, useEffect } from 'react';
import { Search, Check, AlertCircle, Upload, CheckCircle2, FileText, ArrowRight, X } from '../common/Icons';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';

export const TrackStatusPage = ({ initialQuery = '' }) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalApp, setUploadModalApp] = useState(null);
  const [missingDocFile, setMissingDocFile] = useState(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('');

  const loadApplications = async (query = '') => {
    setLoading(true);
    try {
      const res = await api.trackApplications(query);
      if (res && res.applications) {
        setApplications(res.applications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications(initialQuery);
  }, [initialQuery]);

  const handleSearch = (e) => {
    e?.preventDefault();
    loadApplications(searchQuery);
  };

  const handleQuickDemoClick = (demoId) => {
    setSearchQuery(demoId);
    loadApplications(demoId);
  };

  const handleReuploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadModalApp) return;

    await api.uploadMissingDocs(uploadModalApp.applicationNumber, 'डिजिटल ७/१२ उतारा (नवीन)');
    setUploadSuccessMessage('कागदपत्र यशस्वीरीत्या पुन्हा अपलोड झाले! अर्ज पुन्हा पडताळणीत गेला आहे.');
    setTimeout(() => {
      setUploadSuccessMessage('');
      setUploadModalApp(null);
      loadApplications(searchQuery);
    }, 1500);
  };

  // 5 standard stages
  const stages = [
    { num: 1, label: t('अर्ज प्राप्त', 'Received') },
    { num: 2, label: t('तपासणी', 'Verification') },
    { num: 3, label: t('कागदपत्रे', 'Doc Review') },
    { num: 4, label: t('प्रक्रियेत', 'In Process') },
    { num: 5, label: t('पूर्ण', 'Completed') },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left animate-fadeIn">
      
      {/* Title & Subtitle */}
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#064E3B] tracking-tight">
          {t('अर्ज स्थिती', 'Track Status')}
        </h1>
        <p className="text-sm sm:text-base text-stone-500 mt-1">
          {t(
            'Application Tracking – अर्ज क्रमांक किंवा मोबाइलचे शेवटचे ४ अंक टाका',
            'Application Tracking – Enter Application ID or last 4 digits of registered mobile'
          )}
        </p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="mb-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="उदा. YD-24081"
              className="w-full px-4 py-3.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#064E3B] text-stone-900 bg-white placeholder-stone-400 text-sm sm:text-base shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); loadApplications(''); }}
                className="absolute right-3 top-3.5 text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="bg-[#064E3B] hover:bg-[#043c2d] text-white font-bold px-6 sm:px-8 py-3.5 rounded-xl text-sm sm:text-base flex items-center gap-2 shadow-sm transition active:scale-95"
          >
            <Search className="w-4 h-4" />
            <span>{t('शोधा', 'Search')}</span>
          </button>
        </div>
      </form>

      {/* Demo Quick Click Chips */}
      <div className="flex items-center gap-2 mb-8 text-xs text-stone-500 flex-wrap">
        <span className="font-medium text-stone-600">{t('Demo: अलीकडील अर्ज', 'Demo: Recent applications')}:</span>
        <button
          onClick={() => handleQuickDemoClick('YD-24081')}
          className="bg-stone-200/70 hover:bg-stone-300 px-2.5 py-1 rounded-md text-stone-800 font-mono text-xs transition"
        >
          YD-24081
        </button>
        <button
          onClick={() => handleQuickDemoClick('YD-24077')}
          className="bg-stone-200/70 hover:bg-stone-300 px-2.5 py-1 rounded-md text-stone-800 font-mono text-xs transition"
        >
          YD-24077
        </button>
        <button
          onClick={() => handleQuickDemoClick('YD-24072')}
          className="bg-stone-200/70 hover:bg-stone-300 px-2.5 py-1 rounded-md text-stone-800 font-mono text-xs transition"
        >
          YD-24072
        </button>
        <button
          onClick={() => handleQuickDemoClick('all')}
          className="text-[#064E3B] hover:underline font-semibold ml-1"
        >
          {t('सर्व दाखवा', 'Show all')}
        </button>
      </div>

      {/* Applications List */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12 text-stone-400">
            {t('माहिती शोधत आहे...', 'Loading tracking details...')}
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-stone-200">
            <AlertCircle className="w-10 h-10 text-stone-400 mx-auto mb-2" />
            <p className="text-base font-bold text-stone-700">
              {t('कोणताही अर्ज सापडला नाही', 'No application found')}
            </p>
            <p className="text-xs text-stone-500 mt-1">
              {t('कृपया योग्य अर्ज क्रमांक किंवा मोबाईल क्रमांक प्रविष्ट करा.', 'Please check the application ID or mobile number.')}
            </p>
          </div>
        ) : (
          applications.map((app) => {
            const currentStage = app.currentStage || 1;
            const isCompleted = app.status === 'completed' || currentStage === 5;
            const isActionNeeded = app.status === 'action_needed';

            // Status badge logic matching screenshots
            let badgeText = '• प्रक्रियेत';
            let badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';

            if (isCompleted) {
              badgeText = '• पूर्ण';
              badgeClass = 'bg-emerald-100 text-emerald-900 border-emerald-300';
            } else if (isActionNeeded) {
              badgeText = '• कागदपत्रे हवी';
              badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
            } else if (app.status === 'submitted') {
              badgeText = '• अर्ज प्राप्त';
              badgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
            }

            return (
              <div
                key={app._id || app.applicationNumber}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/90 shadow-sm hover:shadow-md transition-shadow relative"
              >
                {/* Card Top Row: ID on left, Badge on right */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-lg font-extrabold text-stone-900 tracking-tight font-mono">
                    {app.applicationNumber}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeClass}`}>
                    {badgeText}
                  </span>
                </div>

                {/* Subtitle: Service · Name · Date */}
                <p className="text-xs sm:text-sm text-stone-500 mb-6 font-medium">
                  {app.serviceTitle || app.serviceDetails?.marathiTitle || 'शासकीय सेवा'} ·{' '}
                  {app.applicantName || app.applicantDetails?.fullName} ·{' '}
                  {app.date || (app.createdAt ? new Date(app.createdAt).toISOString().split('T')[0] : '2026-10-06')}
                </p>

                {/* 5-Step Stepper Progress Bar (Pixel perfect match to Screenshot 1) */}
                <div className="relative mb-4 px-2 sm:px-6">
                  <div className="flex items-center justify-between relative">
                    
                    {stages.map((stage, idx) => {
                      const isPast = stage.num < currentStage || isCompleted;
                      const isCurrent = stage.num === currentStage && !isCompleted;
                      const isFuture = stage.num > currentStage && !isCompleted;

                      return (
                        <React.Fragment key={stage.num}>
                          {/* Step Node */}
                          <div className="flex flex-col items-center relative z-10">
                            {isPast ? (
                              // Completed step: green circle with checkmark
                              <div className="w-8 h-8 rounded-full bg-[#10b981] text-white flex items-center justify-center shadow-xs">
                                <Check className="w-4 h-4 stroke-[3]" />
                              </div>
                            ) : isCurrent ? (
                              // Current active step
                              <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center ring-4 ring-emerald-50">
                                {stage.num}
                              </div>
                            ) : (
                              // Future step: light gray circle
                              <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-400 font-semibold text-xs flex items-center justify-center">
                                {stage.num}
                              </div>
                            )}

                            {/* Step Label Underneath */}
                            <span
                              className={`text-[11px] sm:text-xs mt-2 font-medium tracking-tight text-center ${
                                isPast || isCurrent ? 'text-stone-800 font-semibold' : 'text-stone-400'
                              }`}
                            >
                              {stage.label}
                            </span>
                          </div>

                          {/* Connecting Bar between steps */}
                          {idx < stages.length - 1 && (
                            <div
                              className={`flex-1 h-1 mx-2 -mt-5 transition-colors duration-300 ${
                                stage.num < currentStage || isCompleted
                                  ? 'bg-[#10b981]'
                                  : 'bg-stone-200'
                              }`}
                            />
                          )}
                        </React.Fragment>
                      );
                    })}

                  </div>
                </div>

                {/* Action Needed Alert Banner & Reupload CTA (if applicable) */}
                {isActionNeeded && (
                  <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-rose-900">
                          {t('कागदपत्र त्रुटी आढळली', 'Document action required')}
                        </p>
                        <p className="text-xs text-rose-700 mt-0.5">
                          {app.actionRequiredNote || t('७/१२ उतारा स्पष्ट दिसत नाही, कृपया पुन्हा अपलोड करा.', '7/12 extract is unclear, please re-upload.')}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setUploadModalApp(app)}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 transition active:scale-95 shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{t('कागदपत्रे अपलोड करा', 'Upload Document')}</span>
                    </button>
                  </div>
                )}

                {/* Status description note */}
                {app.statusNote && !isActionNeeded && (
                  <div className="mt-3 text-xs text-stone-500 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                    <span className="font-semibold text-stone-700">{t('सध्याची स्थिती', 'Current Status')}: </span>
                    {app.statusNote}
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* Document Re-upload Modal */}
      {uploadModalApp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-scaleUp">
            <button
              onClick={() => setUploadModalApp(null)}
              className="absolute right-4 top-4 text-stone-400 hover:text-stone-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-[#064E3B] mb-1">
              {t('कागदपत्र पुन्हा अपलोड करा', 'Re-upload Document')}
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              {t(`अर्ज क्र: ${uploadModalApp.applicationNumber}`, `Application: ${uploadModalApp.applicationNumber}`)}
            </p>

            {uploadSuccessMessage ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{uploadSuccessMessage}</span>
              </div>
            ) : (
              <form onSubmit={handleReuploadSubmit} className="space-y-4">
                <div className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center hover:border-emerald-600 transition bg-stone-50">
                  <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-stone-700">
                    {missingDocFile ? missingDocFile.name : t('नवीन स्पष्ट कागदपत्र निवडा', 'Select clear document file')}
                  </p>
                  <p className="text-[11px] text-stone-400 mt-1">PDF, JPG किंवा PNG (कमाल 5MB)</p>
                  <input
                    type="file"
                    className="hidden"
                    id="reuploadInput"
                    onChange={(e) => setMissingDocFile(e.target.files[0] || { name: 'digital_7_12.pdf' })}
                  />
                  <label
                    htmlFor="reuploadInput"
                    className="mt-3 inline-block bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition"
                  >
                    {t('फाईल निवडा', 'Browse File')}
                  </label>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setUploadModalApp(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                  >
                    {t('रद्द करा', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="bg-[#064E3B] hover:bg-[#043c2d] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm transition active:scale-95"
                  >
                    {t('अपलोड करा व सबमिट करा', 'Upload & Submit')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
