import React, { useState, useEffect } from 'react';
import { Search, Check, AlertCircle, Upload, CheckCircle2, FileText, ArrowRight, X, User, Eye, Download } from '../common/Icons';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const TrackStatusPage = ({ initialQuery = '' }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalApp, setUploadModalApp] = useState(null);
  const [missingDocFile, setMissingDocFile] = useState(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('');
  const [previewCertDoc, setPreviewCertDoc] = useState(null);

  const loadApplications = async (query = '') => {
    setLoading(true);
    try {
      let targetQuery = query;
      if (!targetQuery && user?.phone) {
        targetQuery = `phone:${user.phone}`;
      }
      if (!targetQuery) {
        setApplications([]);
        setLoading(false);
        return;
      }
      const res = await api.trackApplications(targetQuery);
      if (res && res.applications) {
        setApplications(res.applications);
      } else {
        setApplications([]);
      }
    } catch (err) {
      console.error(err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      loadApplications(initialQuery);
    } else if (user?.phone) {
      loadApplications('');
    } else {
      setApplications([]);
    }
  }, [initialQuery, user?.phone]);

  const handleSearch = (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) {
      if (user?.phone) {
        loadApplications('');
      } else {
        setApplications([]);
      }
      return;
    }
    loadApplications(searchQuery);
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

      {/* Applications List */}
      <div className="space-y-6 mt-6">
        {user && !searchQuery && applications.length > 0 && (
          <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-200 px-4 py-2.5 rounded-2xl text-xs">
            <div className="flex items-center gap-2 text-[#064E3B] font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t(`माझे अर्ज (${applications.length})`, `My Applications (${applications.length})`)}:</span>
              <span className="text-stone-700 font-semibold">{user.name} ({user.phone})</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-800 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200">
              {user.role === 'agent' ? 'योजना दूत खाते' : 'नागरिक खाते'}
            </span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-stone-400">
            {t('माहिती शोधत आहे...', 'Loading tracking details...')}
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-stone-200">
            {searchQuery ? (
              <>
                <AlertCircle className="w-10 h-10 text-stone-400 mx-auto mb-2" />
                <p className="text-base font-bold text-stone-700">
                  {t('कोणताही अर्ज सापडला नाही', 'No application found')}
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  {t('कृपया योग्य अर्ज क्रमांक किंवा मोबाईल क्रमांक प्रविष्ट करा.', 'Please check the application ID or mobile number.')}
                </p>
              </>
            ) : user ? (
              <>
                <FileText className="w-10 h-10 text-stone-400 mx-auto mb-2" />
                <p className="text-base font-bold text-stone-700">
                  {t('तुमच्या खात्यावर अद्याप कोणताही अर्ज नाही', 'No applications on this account yet')}
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  {t(`मोबाईल: ${user.phone} – नवीन सेवेसाठी अर्ज करा.`, `Mobile: ${user.phone} – Apply for a service to view progress here.`)}
                </p>
              </>
            ) : (
              <>
                <Search className="w-10 h-10 text-[#064E3B]/60 mx-auto mb-2" />
                <p className="text-base font-bold text-stone-700">
                  {t('अर्ज स्थिती तपासण्यासाठी वर शोध घ्या', 'Search above to track application status')}
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  {t('तुमचा अर्ज क्रमांक (उदा. YD-12345) किंवा नोंदणीकृत मोबाईल क्रमांक प्रविष्ट करा.', 'Enter your application ID (e.g. YD-12345) or registered mobile number.')}
                </p>
              </>
            )}
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

                {/* Official Issued Certificates & Documents Received from Admin */}
                {((app.issuedDocs && app.issuedDocs.length > 0) || (app.deliveredDocuments && app.deliveredDocuments.length > 0)) && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50 border-2 border-emerald-500/40 rounded-2xl shadow-xs">
                    <div className="flex items-start sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">🏆</span>
                        <div>
                          <h4 className="text-sm font-black text-emerald-950">
                            {t('कार्यालयाकडून जारी केलेले अधिकृत प्रमाणपत्र / दाखला', 'Official Certificate / Document Issued')}
                          </h4>
                          <p className="text-[11px] text-emerald-700">
                            {t('प्रशासकाने आपला अधिकृत दाखला जारी केला आहे. खाली दिलेल्या बटनावरून पहा किंवा डाऊनलोड करा.', 'Admin has issued your official document. View or download below.')}
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-600 text-white shadow-xs shrink-0">
                        {t('अधिकृत प्रत तयार', 'Official Copy Ready')}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {((app.issuedDocs && app.issuedDocs.length > 0) ? app.issuedDocs : app.deliveredDocuments).map((doc, dIdx) => (
                        <div
                          key={dIdx}
                          className="p-3 bg-white border border-emerald-200 rounded-xl flex items-center justify-between gap-3 shadow-xs hover:border-emerald-400 transition"
                        >
                          <div className="min-w-0 flex items-center gap-2.5">
                            <span className="text-xl shrink-0">📜</span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-stone-900 truncate">
                                {doc.name || t('अधिकृत प्रमाणपत्र', 'Official Certificate')}
                              </p>
                              <p className="text-[10px] text-stone-500">
                                {doc.size ? `${doc.size} • ` : ''}
                                {t('जारी तारीख', 'Issued')}: {doc.issuedAt ? new Date(doc.issuedAt).toLocaleDateString('mr-IN') : t('आज', 'Today')}
                                {doc.note ? ` • "${doc.note}"` : ''}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewCertDoc(doc)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs transition flex items-center gap-1 shadow-2xs"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>{t('पहा', 'View')}</span>
                            </button>
                            {doc.url && (
                              <a
                                href={doc.url}
                                download={doc.name || 'official_document'}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs flex items-center gap-1"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>{t('डाऊनलोड', 'Download')}</span>
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
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

      {/* Official Certificate Preview Modal */}
      {previewCertDoc && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] flex flex-col animate-scaleUp">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-2xl shrink-0">
                  {previewCertDoc.url?.startsWith('data:image/') || previewCertDoc.name?.match(/\.(jpg|jpeg|png|webp|svg)$/i)
                    ? '🖼️'
                    : '📜'}
                </span>
                <div className="min-w-0">
                  <h3 className="text-base font-black text-stone-900 truncate">
                    {previewCertDoc.name || t('अधिकृत प्रमाणपत्र', 'Official Certificate')}
                  </h3>
                  <p className="text-xs text-emerald-700 font-medium">
                    {t('महाराष्ट्र शासन ई-सेवा कक्षाकडून जारी अधिकृत प्रत', 'Issued by Maharashtra Govt e-Seva Desk')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewCertDoc(null)}
                className="p-1.5 rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Content / Actual Preview */}
            <div className="flex-1 overflow-auto bg-stone-100 rounded-2xl p-3 sm:p-4 flex items-center justify-center min-h-[300px]">
              {previewCertDoc.url && (previewCertDoc.url.startsWith('data:image/') || previewCertDoc.name?.match(/\.(jpg|jpeg|png|webp|svg)$/i)) ? (
                <img
                  src={previewCertDoc.url}
                  alt={previewCertDoc.name}
                  className="max-h-[60vh] max-w-full rounded-xl object-contain shadow-md mx-auto"
                />
              ) : previewCertDoc.url && previewCertDoc.url.startsWith('data:application/pdf') ? (
                <iframe
                  src={previewCertDoc.url}
                  title={previewCertDoc.name}
                  className="w-full h-[55vh] rounded-xl border border-stone-300"
                />
              ) : (
                <div className="text-center p-8 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-2xl font-bold">
                    📜
                  </div>
                  <h4 className="text-sm font-bold text-stone-800">{previewCertDoc.name}</h4>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    {previewCertDoc.note || t('अधिकृत दाखला तयार झाला आहे. खालील डाऊनलोड बटणावर क्लिक करून सुरक्षित जतन करा.', 'Official certificate ready. Download below.')}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-200 mt-4">
              <span className="text-xs text-stone-500">
                {t('दस्तऐवज स्थिती: ', 'Document Status: ')}<strong className="text-emerald-700 font-bold">{t('अधिकृत व वैध (Verified)', 'Verified & Valid')}</strong>
              </span>
              <div className="flex items-center gap-2">
                {previewCertDoc.url && (
                  <a
                    href={previewCertDoc.url}
                    download={previewCertDoc.name || 'official_certificate'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t('डाउनलोड करा (Download)', 'Download')}</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewCertDoc(null)}
                  className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs transition"
                >
                  {t('बंद करा (Close)', 'Close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
