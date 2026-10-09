import React from 'react';
import { WhatsAppIcon, Bell, ArrowRight, HelpCircle } from '../common/Icons';
import { useLanguage } from '../../context/LanguageContext';

export const NoticesAndHelpWidget = ({ notices = [], onOpenWhatsApp }) => {
  const { t } = useLanguage();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
        
        {/* Left: Latest Notices (ताज्या सूचना) - 7 cols */}
        <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-[#064E3B]" />
            <h3 className="text-lg font-bold text-stone-900">
              {t('ताज्या सूचना', 'Latest Notices')}
            </h3>
          </div>

          <div className="space-y-4">
            {/* Notice 1 */}
            <div className="p-3.5 rounded-2xl bg-orange-50/50 border border-orange-100 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-[#EA580C]">
                  {t('नवीन', 'NEW')}
                </span>
                <span className="font-bold text-sm text-stone-900">
                  {t('शेतकरी ओळखपत्र नोंदणी सुरू', 'Farmer ID Registration Open')}
                </span>
              </div>
              <p className="text-xs text-stone-600 pl-1 mt-0.5 leading-relaxed">
                {t(
                  'Farmer ID नोंदणीसाठी ७/१२ व आधार लिंक मोबाइल तयार ठेवा.',
                  'Keep 7/12 extract and Aadhaar linked mobile ready for Farmer ID registration.'
                )}
              </p>
            </div>

            {/* Notice 2 */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-[#064E3B]">
                  {t('ऑफर', 'OFFER')}
                </span>
                <span className="font-bold text-sm text-stone-900">
                  {t('दिवाळी रेफरल बोनस', 'Diwali Referral Bonus')}
                </span>
              </div>
              <p className="text-xs text-stone-600 pl-1 mt-0.5 leading-relaxed">
                {t(
                  'प्रत्येक ३ यशस्वी अर्जांमागे अतिरिक्त ₹१०० बोनस थेट वॉलेटमध्ये.',
                  'Extra Rs. 100 bonus on every 3 completed referral applications directly into your wallet.'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Quick Help Widget (मदत हवी आहे?) - 5 cols */}
        <div className="md:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="w-5 h-5 text-[#064E3B]" />
              <h3 className="text-lg font-bold text-stone-900">
                {t('मदत हवी आहे?', 'Need Help?')}
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {t(
                'कोणती कागदपत्रे लागतात, अर्ज कसा करायचा – WhatsApp वर विचारा, सकाळी ९ ते संध्या. ७.',
                'Which documents are needed, how to apply – Ask on WhatsApp, 9 AM to 7 PM.'
              )}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
            <button
              onClick={onOpenWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-98"
            >
              <WhatsAppIcon className="w-5 h-5" />
              <span>{t('WhatsApp वर मदत मिळवा', 'Get Help on WhatsApp')}</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
