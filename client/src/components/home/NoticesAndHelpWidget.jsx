import React, { useState, useEffect } from 'react';
import { WhatsAppIcon, Bell, ArrowRight, HelpCircle } from '../common/Icons';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';

export const NoticesAndHelpWidget = ({ notices: initialNotices = [], onOpenWhatsApp }) => {
  const { t } = useLanguage();
  const [noticesList, setNoticesList] = useState(initialNotices);

  useEffect(() => {
    if (initialNotices && initialNotices.length > 0) {
      setNoticesList(initialNotices);
    } else {
      api.getNotices()
        .then((res) => {
          if (res && res.notices) setNoticesList(res.notices);
        })
        .catch(() => {});
    }
  }, [initialNotices]);

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
            {noticesList.length === 0 ? (
              <div className="py-6 text-center text-xs text-stone-400">
                {t('सध्या कोणतीही नवीन सूचना नाही.', 'No notices available at this moment.')}
              </div>
            ) : (
              noticesList.map((n) => (
                <div key={n._id} className="p-3.5 rounded-2xl bg-orange-50/50 border border-orange-100 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-[#EA580C]">
                      {n.tag || t('सूचना', 'NOTICE')}
                    </span>
                    <span className="font-bold text-sm text-stone-900">
                      {n.marathiTitle || n.title}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 pl-1 mt-0.5 leading-relaxed">
                    {n.contentMarathi || n.content || ''}
                  </p>
                </div>
              ))
            )}
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
