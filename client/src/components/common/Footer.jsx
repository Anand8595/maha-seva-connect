import React from 'react';
import { ShieldCheck, Phone, WhatsAppIcon, Mail } from './Icons';
import { useLanguage } from '../../context/LanguageContext';

export const Footer = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#064E3B] text-emerald-100 border-t border-emerald-800/60 mt-16 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & mission */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                यो
              </div>
              <div>
                <span className="font-extrabold text-xl text-white block tracking-tight">YojanaDut</span>
                <span className="text-[11px] text-emerald-300">योजना दूत पोर्टल</span>
              </div>
            </div>
            <p className="text-xs text-emerald-200/80 leading-relaxed">
              {t(
                'नागरिकांसाठी शासकीय कागदपत्रे व दाखल्यांचे सुलभ सहाय्य आणि ग्रामीण तरुणांसाठी सन्माननीय रेफरल उत्पन्नाचे साधन.',
                'Facilitating citizen documents and certificates while empowering rural partners with referral income.'
              )}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {t('महत्त्वाच्या लिंक्स', 'Quick Links')}
            </h4>
            <ul className="space-y-2 text-xs text-emerald-200">
              <li>
                <button onClick={() => onNavigate('services')} className="hover:text-white transition">
                  {t('सर्व सेवा', 'All Services')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('track')} className="hover:text-white transition">
                  {t('अर्ज स्थिती तपासा (Track Status)', 'Track Status')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('agent')} className="hover:text-white transition">
                  {t('योजना दूत भागीदार बना', 'Become a Partner')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('wallet')} className="hover:text-white transition">
                  {t('वॉलेट सारांश', 'Wallet Overview')}
                </button>
              </li>
            </ul>
          </div>

          {/* Services list */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {t('प्रमुख सेवा', 'Popular Services')}
            </h4>
            <ul className="space-y-2 text-xs text-emerald-200">
              <li>{t('पॅन कार्ड (नवीन / दुरुस्ती)', 'PAN Card Services')}</li>
              <li>{t('तहसीलदार उत्पन्न दाखला', 'Income Certificate')}</li>
              <li>{t('शेतकरी ओळखपत्र (Farmer ID)', 'Farmer ID Registration')}</li>
              <li>{t('डिजिटल ७/१२ व ८-अ उतारा', 'Digital 7/12 & 8A Extract')}</li>
              <li>{t('जात प्रमाणपत्र सल्ला', 'Caste Certificate Assistance')}</li>
            </ul>
          </div>

          {/* Contact & Disclaimer */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {t('संपर्क व मदत', 'Contact & Help')}
            </h4>
            <p className="text-xs text-emerald-200/90 leading-relaxed">
              📞 {t('हेल्पलाईन: +९१ ९८२२० १२३४५', 'Helpline: +91 98220 12345')}<br />
              ⏰ {t('वेळ: सकाळी ९:०० ते संध्या. ७:०० (सोम-शनि)', 'Hours: 9:00 AM - 7:00 PM (Mon-Sat)')}<br />
              📍 {t('कार्यालय: पुणे, महाराष्ट्र', 'Office: Pune, Maharashtra')}
            </p>
          </div>

        </div>

        {/* Legal Disclaimer Line */}
        <div className="mt-12 pt-6 border-t border-emerald-800/80 text-[11px] text-emerald-300/70 text-center leading-relaxed">
          <p>
            {t(
              'अस्वीकरण (Disclaimer): YojanaDut ही एक स्वतंत्र ऑनलाइन सहाय्य व सुविधा सेवा आहे. आम्ही कोणत्याही शासकीय विभागाचे अधिकृत प्रतिनिधित्व करत नाही. नागरिकांना ऑनलाईन अर्ज भरण्यात व कागदपत्रे गोळा करण्यात मदत करणे हा या पोर्टलचा उद्देश आहे.',
              'Disclaimer: YojanaDut is an independent facilitation service. We do not represent any government department directly. Our mission is to assist citizens in accessing online document applications smoothly.'
            )}
          </p>
          <p className="mt-2 text-emerald-400 font-medium">
            © 2026 YojanaDut (योजना दूत पोर्टल). All rights reserved. Made for Citizens of Maharashtra.
          </p>
        </div>
      </div>
    </footer>
  );
};
