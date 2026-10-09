import React from 'react';
import {
  CreditCard,
  Fingerprint,
  FileText,
  Sprout,
  CheckCircle2,
  AlertCircle,
  WhatsAppIcon,
  Clock,
  Gift,
  ArrowLeft,
  Share2,
} from '../common/Icons';
import { useLanguage } from '../../context/LanguageContext';

export const ServiceDetailPage = ({ service, onBack, onApply, onWhatsAppQuery }) => {
  const { t } = useLanguage();

  if (!service) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-stone-500">{t('सेवा सापडली नाही.', 'Service not found.')}</p>
        <button onClick={onBack} className="mt-4 text-[#064E3B] font-bold hover:underline">
          {t('← सर्व सेवा पहा', '← View all services')}
        </button>
      </div>
    );
  }

  const getServiceIcon = (type) => {
    switch (type) {
      case 'credit-card':
        return <CreditCard className="w-7 h-7 text-stone-800" />;
      case 'fingerprint':
        return <Fingerprint className="w-7 h-7 text-stone-800" />;
      case 'file-text':
        return <FileText className="w-7 h-7 text-stone-800" />;
      case 'sprout':
        return <Sprout className="w-7 h-7 text-stone-800" />;
      default:
        return <FileText className="w-7 h-7 text-stone-800" />;
    }
  };

  const processSteps = [
    t('ऑनलाईन अर्ज व कागदपत्रे पाठवा', 'Submit application and send documents online'),
    t('आमची टीम तपासणी करेल व संपर्क करेल', 'Our team will verify and contact you'),
    t('अधिकृत पोर्टलवर अर्ज सादर', 'Application submission on official portal'),
    t('स्थिती अपडेट SMS/WhatsApp वर', 'Real-time status updates via SMS & WhatsApp'),
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-left animate-fadeIn">
      
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-stone-600 hover:text-[#064E3B] mb-6 transition group"
      >
        <span className="group-hover:-translate-x-1 transition-transform">←</span>
        <span>{t('सर्व सेवा', 'All Services')}</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Service Details & Process - 8 cols */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Service Card Header */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100/70 flex items-center justify-center shrink-0">
                {getServiceIcon(service.iconType)}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight">
                  {service.marathiTitle}
                </h1>
                <p className="text-sm font-medium text-stone-500 mt-0.5">
                  {service.title}
                </p>
              </div>
            </div>

            <p className="text-sm sm:text-base text-stone-700 leading-relaxed pt-2">
              {service.description}
            </p>

            {/* Section: आवश्यक कागदपत्रे (Required Documents) */}
            <div className="mt-8 pt-6 border-t border-stone-100">
              <h2 className="text-base sm:text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#064E3B]" />
                <span>{t('आवश्यक कागदपत्रे', 'Required Documents')}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {service.requiredDocs?.map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-stone-800">
                    <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />
                    <span className="font-medium">{doc.marathiName || doc.name}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Section: प्रक्रिया कशी आहे? (Process Steps) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 mb-6">
              {t('प्रक्रिया कशी आहे?', 'What is the process?')}
            </h2>

            <div className="space-y-4">
              {processSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-[#064E3B] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    {idx + 1}
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-stone-800">
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Disclaimer Box matching Screenshot 2 */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 flex items-start gap-3 text-stone-700">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-stone-600">
              <strong className="text-stone-900">
                {t('अस्वीकरण (Disclaimer):', 'Disclaimer:')}{' '}
              </strong>
              {t(
                'YojanaDut ही एक स्वतंत्र ऑनलाइन सहाय्य व रेफरल सेवा आहे. आम्ही कोणत्याही शासकीय विभागाशी संलग्न नाही (अधिकृत परवानगी असल्याशिवाय). अधिकृत शासकीय शुल्क वेगळे असू शकते; आमचे शुल्क फक्त सहाय्य सेवेसाठी आहे.',
                'YojanaDut is an independent facilitation and referral platform. We are not officially affiliated with any government department. Official govt fees if applicable are separate; our charges are purely for assistance service.'
              )}
            </p>
          </div>

        </div>

        {/* Right Sticky Card: Pricing & Action (4 cols) */}
        <div className="lg:col-span-4 sticky top-24">
          <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-md space-y-5">
            
            <div className="space-y-3.5 divide-y divide-stone-100">
              {/* Fee */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs sm:text-sm text-stone-600 font-medium">
                  {t('₹ सेवा शुल्क', '₹ Service Fee')}
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-stone-900">
                  ₹{service.basePrice}
                </span>
              </div>

              {/* SLA Timeline */}
              <div className="flex items-center justify-between pt-3">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-stone-600 font-medium">
                  <Clock className="w-4 h-4 text-stone-400" />
                  <span>{t('कालावधी', 'Timeline')}</span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-stone-900">
                  {service.estimatedDays}
                </span>
              </div>

              {/* Referral reward */}
              <div className="flex items-center justify-between pt-3">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-stone-600 font-medium">
                  <Gift className="w-4 h-4 text-[#EA580C]" />
                  <span>{t('योजना दूत रिवॉर्ड', 'Partner Reward')}</span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-[#EA580C]">
                  ₹{service.agentCommission}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-stone-400 italic">
              {t('* अधिकृत शासकीय शुल्क असल्यास वेगळे लागू.', '* Official government fee if applicable is separate.')}
            </p>

            {/* CTAs */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => onApply(service)}
                className="w-full bg-[#EA580C] hover:bg-[#c2410c] text-white font-bold py-3.5 px-4 rounded-xl text-sm shadow-md transition-all active:scale-98"
              >
                {t('सेवा अर्ज करा', 'Apply for Service')}
              </button>

              <button
                onClick={() => onWhatsAppQuery(service)}
                className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-bold py-3.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98"
              >
                <WhatsAppIcon className="w-5 h-5" />
                <span>{t('WhatsApp वर विचारा', 'Ask on WhatsApp')}</span>
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
