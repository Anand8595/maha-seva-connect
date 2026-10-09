import React from 'react';
import { Gift, Wallet, Clock, ShieldCheck, ArrowRight, User as UserIcon } from '../common/Icons';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export const ReferralAndWalletSection = ({ onOpenAgentPage, onOpenWalletPage }) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const balance = user?.walletBalance !== undefined ? user.walletBalance : 455;
  const pending = user?.pendingBalance !== undefined ? user.pendingBalance : 50;
  const cleared = user?.totalEarned !== undefined ? user.totalEarned : 1240;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left: Referral Banner (Referral करून कमवा) - 7 cols */}
        <div className="lg:col-span-7 bg-[#EA580C] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-lg relative overflow-hidden text-left">
          
          <div>
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center mb-4">
              <Gift className="w-6 h-6 text-white" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
              {t('Referral करून कमवा', 'Earn by Referral')}
            </h3>

            <p className="text-orange-100 text-sm sm:text-base mt-2 max-w-xl leading-relaxed">
              {t(
                'तुमच्या गावातील लोकांना सेवा सुचवा. अर्ज पूर्ण झाल्यावर प्रत्येक रेफरलवर ₹१० ते ₹४० रिवॉर्ड थेट वॉलेटमध्ये.',
                'Recommend services to people in your village or town. Earn Rs. 10 to Rs. 40 reward directly in your wallet on every completed application.'
              )}
            </p>

            {/* 3 Steps Horizontal Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-6">
              <div className="bg-orange-100/90 text-stone-900 rounded-xl px-3 py-2 text-xs font-semibold flex items-center justify-center text-center shadow-xs">
                {t('१. नोंदणी करा व कोड मिळवा', '1. Register & get code')}
              </div>
              <div className="bg-orange-100/90 text-stone-900 rounded-xl px-3 py-2 text-xs font-semibold flex items-center justify-center text-center shadow-xs">
                {t('२. कोड/लिंक शेअर करा', '2. Share code/link')}
              </div>
              <div className="bg-orange-100/90 text-stone-900 rounded-xl px-3 py-2 text-xs font-semibold flex items-center justify-center text-center shadow-xs">
                {t('३. अर्ज पूर्ण → रिवॉर्ड', '3. Completed = Reward')}
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={onOpenAgentPage}
              className="bg-[#064E3B] hover:bg-[#043c2d] text-white font-bold px-6 py-3 rounded-full text-sm inline-flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <UserIcon className="w-4 h-4" />
              <span>{t('योजना दूत बना', 'Become an Agent')}</span>
            </button>
          </div>

        </div>

        {/* Right: Wallet Summary Widget (वॉलेट सारांश) - 5 cols */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm flex flex-col justify-between text-left">
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-stone-900">
                {t('वॉलेट सारांश', 'Wallet Summary')}
              </h3>
              <button
                onClick={onOpenWalletPage}
                className="text-xs font-bold text-[#064E3B] hover:underline flex items-center gap-1"
              >
                <span>{t('पहा →', 'View →')}</span>
              </button>
            </div>

            {/* Top Teal Block matching screenshot */}
            <div className="bg-[#064E3B] text-white rounded-2xl p-5 relative overflow-hidden shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-200 font-medium">
                    {t('उपलब्ध शिल्लक', 'Available Balance')}
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold mt-1 tracking-tight">
                    ₹{balance}
                  </div>
                  <span className="inline-block mt-2 text-[11px] text-emerald-300/90 font-medium">
                    {user?.name ? `${user.name} – खाते` : 'Demo खाते – राहुल शिंदे'}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-emerald-200" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row Stats */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <span className="text-[11px] text-stone-500 font-medium block">
                  {t('प्रलंबित', 'Pending')}
                </span>
                <span className="text-lg font-bold text-stone-900">
                  ₹{pending}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#064E3B]" />
              </div>
              <div>
                <span className="text-[11px] text-stone-500 font-medium block">
                  {t('मंजूर एकूण', 'Total Approved')}
                </span>
                <span className="text-lg font-bold text-stone-900">
                  ₹{cleared}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
