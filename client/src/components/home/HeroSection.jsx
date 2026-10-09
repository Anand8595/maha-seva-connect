import React from 'react';
import { ShieldCheck, ArrowRight, CheckCircle2, MessageSquare } from '../common/Icons';
import { useLanguage } from '../../context/LanguageContext';

export const HeroSection = ({ onOpenApplyModal, onOpenAgentModal }) => {
  const { t } = useLanguage();

  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-4 pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#064E3B] text-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xl relative overflow-hidden">
          
          {/* Subtle background glow circle */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/70 border border-emerald-600/50 text-emerald-200 text-xs sm:text-sm font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>{t('✓ विश्वासार्ह ऑनलाइन सहाय्य सेवा', '✓ Trusted Online Assistance')}</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold leading-tight tracking-tight">
                {t('सरकारी कागदपत्रे,', 'Government Documents,')}{' '}
                <span className="text-[#F97316]">
                  {t('आता घरबसल्या', 'Now from Home')}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-emerald-100/90 text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed">
                {t(
                  'PAN, आधार, उत्पन्न दाखला, Farmer ID – अर्ज करा, स्थिती तपासा. आणि योजना दूत बनून प्रत्येक रेफरलवर कमाई करा.',
                  'Assistance for PAN Card, Aadhaar updates, Income Certificate, Farmer ID with real-time tracking and referral earnings.'
                )}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  onClick={onOpenApplyModal}
                  className="bg-[#EA580C] hover:bg-[#c2410c] text-white font-bold px-6 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-150 flex items-center gap-2 text-sm sm:text-base group active:scale-95"
                >
                  <span>{t('सेवा अर्ज करा', 'Apply for Service')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={onOpenAgentModal}
                  className="bg-emerald-900/60 hover:bg-emerald-900/90 text-white font-semibold px-6 py-3.5 rounded-full border border-emerald-600/60 hover:border-emerald-400 transition-all text-sm sm:text-base active:scale-95"
                >
                  {t('योजना दूत बना', 'Become an Agent')}
                </button>
              </div>

              {/* Trust Proof Chips */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-3 text-xs sm:text-sm text-emerald-200/90">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{t('५,०००+ अर्ज', '5,000+ Applications')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{t('३००+ योजना दूत', '300+ Partners')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{t('WhatsApp मदत', 'WhatsApp Support')}</span>
                </div>
              </div>

            </div>

            {/* Right Graphic / Image Column with Floating Earnings Card */}
            <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md">
                
                {/* Main Hero Photo: Indian rural/semi-urban family using laptop */}
                <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 bg-emerald-950 aspect-[4/3] relative">
                  <img
                    src="/hero-family.jpg"
                    alt="Indian family using YojanaDut portal"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Graceful fallback to Unsplash image of Indian family if local file is missing
                      e.target.src = 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Floating Referral Earnings Card Overlay (Exact match to screenshot!) */}
                <div className="absolute -bottom-4 left-4 sm:left-6 bg-white text-stone-800 rounded-xl px-4 py-3 shadow-xl border border-stone-100 flex flex-col items-start animate-float">
                  <span className="text-[11px] font-medium text-stone-500">
                    {t('या महिन्याची रेफरल कमाई', "This Month's Referral Earnings")}
                  </span>
                  <span className="text-xl sm:text-2xl font-extrabold text-[#064E3B] tracking-tight">
                    ₹1,890
                  </span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
