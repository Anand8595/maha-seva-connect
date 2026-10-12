import React, { useState } from 'react';
import { WhatsAppIcon, X, Send, HelpCircle } from './Icons';
import { useLanguage } from '../../context/LanguageContext';

export const WhatsAppFloatingButton = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  const whatsappUrl = import.meta.env.VITE_WHATSAPP_LINK || 'https://chat.whatsapp.com/CPGUrVqOf2I4ZzsvBivj6e?s=sw&p=a&mlu=4&ilr=4';
  const contactPhone = import.meta.env.VITE_CONTACT_PHONE || '9579224223';
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || 'sanviinfotechcsc@gmail.com';

  const quickQuestions = [
    'पॅन कार्डसाठी कोणती कागदपत्रे लागतात?',
    'माझा अर्ज क्र. कसा शोधायचा?',
    'उत्पन्न दाखला किती दिवसांत मिळतो?',
    'योजना दूत बनून कमिशन कसे मिळवायचे?',
  ];

  const handleSendToWhatsApp = () => {
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 select-none">
      {/* Quick Assist Modal Popup */}
      {isOpen && (
        <div className="mb-3 bg-white rounded-3xl shadow-2xl border border-stone-200 w-80 sm:w-96 overflow-hidden animate-scaleUp text-left">
          
          {/* Header */}
          <div className="bg-[#064E3B] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center">
                <WhatsAppIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">Sanvi Infotech WhatsApp Group</h4>
                <span className="text-[11px] text-emerald-200">मोबाईल: +91 {contactPhone}</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-emerald-200 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3 bg-[#f8f7f4]">
            <p className="text-xs text-stone-600 bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
              🙏 {t('नमस्कार! आपल्याला कोणत्या सेवेबद्दल मदत हवी आहे? खालील प्रश्नावर क्लिक करा किंवा संदेश टाईप करा:', 'Hello! How can we help you today? Pick a question below:')}
            </p>

            <div className="space-y-1.5">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendToWhatsApp(q)}
                  className="w-full text-left text-xs bg-white hover:bg-emerald-50 text-stone-800 p-2.5 rounded-xl border border-stone-200 hover:border-emerald-500 transition font-medium shadow-xs"
                >
                  💬 {q}
                </button>
              ))}
            </div>

            {/* Direct Join WhatsApp Group CTA */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleSendToWhatsApp}
                className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
              >
                <WhatsAppIcon className="w-4 h-4 text-white" />
                <span>ग्रुप जॉइन करा (Join WhatsApp Group)</span>
              </button>
              <div className="text-[11px] text-center text-stone-500 font-mono">
                📞 +91 {contactPhone} • ✉️ {contactEmail}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Floating Green Pill matching screenshot */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#25D366] hover:bg-[#20ba59] text-white font-bold px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 group active:scale-95"
        aria-label="WhatsApp Support"
      >
        <WhatsAppIcon className="w-5 h-5" />
        <span className="text-xs sm:text-sm font-semibold tracking-wide">
          WhatsApp
        </span>
      </button>
    </div>
  );
};
