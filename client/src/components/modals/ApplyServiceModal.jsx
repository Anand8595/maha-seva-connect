import React, { useState, useEffect } from 'react';
import { X, Upload, CheckCircle2, FileText, AlertCircle, ArrowRight } from '../common/Icons';
import { useLanguage } from '../../context/LanguageContext';
import { api, fallbackServices } from '../../services/api';

export const ApplyServiceModal = ({ initialService, isOpen, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const [services, setServices] = useState(fallbackServices);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [district, setDistrict] = useState('पुणे');
  const [taluka, setTaluka] = useState('');
  const [village, setVillage] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState(null);

  useEffect(() => {
    // Check url search params for ref code
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) setReferralCode(ref);

    if (initialService) {
      setSelectedServiceId(initialService._id || initialService.slug);
    } else if (fallbackServices.length > 0) {
      setSelectedServiceId(fallbackServices[0]._id);
    }
  }, [initialService, isOpen]);

  if (!isOpen) return null;

  const currentService = services.find((s) => s._id === selectedServiceId || s.slug === selectedServiceId) || services[0];

  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map((f) => ({
        name: f.name,
        docType: f.name.split('.')[0] || 'दस्तावेज',
        url: `/uploads/${f.name}`,
      }));
      setUploadedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !phone) {
      alert('कृपया नाव आणि मोबाईल नंबर भरा.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        serviceId: currentService._id || currentService.slug,
        serviceTitle: currentService.marathiTitle,
        applicantDetails: {
          fullName,
          phone,
          email,
          district,
          taluka,
          village,
        },
        referralCode: referralCode.trim(),
        uploadedDocs: uploadedFiles.length > 0 ? uploadedFiles : [
          { docType: 'आधार कार्ड', name: 'aadhaar_card.pdf', url: '/demo-docs/aadhaar.pdf' },
        ],
      };

      const res = await api.createApplication(payload);
      if (res && res.application) {
        setSubmittedApp(res.application);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = () => {
    onClose();
    if (submittedApp && onSuccess) {
      onSuccess(submittedApp.applicationNumber);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8 text-left animate-scaleUp">
        
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedApp ? (
          /* Success Screen */
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#064E3B] flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-extrabold text-[#064E3B]">
              {t('अर्ज यशस्वीरीत्या सादर केला गेला!', 'Application Submitted Successfully!')}
            </h3>

            <p className="text-sm text-stone-600">
              {t('तुमचा ट्रॅकिंग आयडी खालीलप्रमाणे आहे. SMS द्वारे देखील सूचना पाठवली गेली आहे.', 'Your tracking number is generated. Updates sent to your mobile.')}
            </p>

            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 max-w-sm mx-auto">
              <span className="text-xs text-stone-400 font-semibold block">{t('अर्ज क्रमांक', 'Application Number')}</span>
              <span className="text-2xl font-mono font-extrabold text-[#064E3B] tracking-wider">
                {submittedApp.applicationNumber}
              </span>
            </div>

            <div className="pt-4">
              <button
                onClick={handleFinish}
                className="bg-[#EA580C] hover:bg-[#c2410c] text-white font-bold px-8 py-3.5 rounded-full text-sm shadow-md transition active:scale-95"
              >
                {t('अर्ज स्थिती तपासा →', 'Track Application Status →')}
              </button>
            </div>
          </div>
        ) : (
          /* Form Screen */
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <span className="text-xs font-bold text-[#EA580C] bg-orange-50 px-2.5 py-1 rounded-full">
                {t('नवीन सेवा अर्ज', 'New Service Application')}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 mt-1">
                {t('सेवा अर्ज करा', 'Apply for Assistance')}
              </h2>
            </div>

            {/* Service Selector */}
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                {t('सेवा निवडा', 'Select Service')}
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold text-stone-900 bg-stone-50/50"
              >
                {services.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.marathiTitle} (₹{s.basePrice})
                  </option>
                ))}
              </select>
            </div>

            {/* Applicant Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  {t('अर्जदाराचे पूर्ण नाव *', 'Full Name *')}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="उदा. सुनीता पाटील"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-[#064E3B] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  {t('मोबाईल नंबर *', 'Mobile Number *')}
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="९८५०XXXXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-[#064E3B] outline-none"
                />
              </div>
            </div>

            {/* Location & Referral Code */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  {t('जिल्हा', 'District')}
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="उदा. पुणे"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  {t('तालुका / गाव', 'Taluka / Village')}
                </label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="उदा. शिरूर / शिक्रापूर"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  {t('रेफरल कोड (ऐच्छिक)', 'Referral Code (Optional)')}
                </label>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="उदा. YD-RAHUL100"
                  className="w-full px-3 py-2 rounded-xl border border-orange-300 font-mono text-xs text-[#EA580C] uppercase font-bold"
                />
              </div>
            </div>

            {/* Documents Upload Section */}
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                {t('कागदपत्रे अपलोड करा (किंवा नंतर पाठवा)', 'Upload Documents')}
              </label>
              
              <div className="border-2 border-dashed border-stone-300 rounded-xl p-4 text-center hover:border-emerald-600 transition bg-stone-50">
                <Upload className="w-6 h-6 text-stone-400 mx-auto mb-1" />
                <p className="text-xs text-stone-600 font-medium">
                  {uploadedFiles.length > 0
                    ? `${uploadedFiles.length} कागदपत्रे जोडली गेली आहेत`
                    : t('आधार, फोटो किंवा संबंधित कागदपत्रे जोडा', 'Attach Aadhaar, photo or relevant documents')}
                </p>
                <input
                  type="file"
                  multiple
                  id="docUploadModal"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="docUploadModal"
                  className="mt-2 inline-block bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 text-xs font-semibold px-3 py-1 rounded-lg cursor-pointer transition shadow-xs"
                >
                  {t('+ फाईल जोडा', '+ Add File')}
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {uploadedFiles.map((f, i) => (
                    <span key={i} className="text-[11px] bg-emerald-50 text-[#064E3B] px-2 py-0.5 rounded-md border border-emerald-200">
                      ✓ {f.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing Summary & Submit */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-stone-400">{t('एकूण सेवा शुल्क', 'Total Fee')}:</span>
                <span className="text-xl font-extrabold text-[#064E3B] ml-1.5">
                  ₹{currentService.basePrice}
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="bg-[#EA580C] hover:bg-[#c2410c] text-white font-bold px-6 py-3 rounded-full text-xs sm:text-sm shadow-md transition active:scale-95 disabled:opacity-50"
              >
                {submitting ? t('सादर करत आहे...', 'Submitting...') : t('अर्ज सादर करा →', 'Submit Application →')}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
