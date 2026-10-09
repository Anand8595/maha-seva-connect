import React from 'react';
import {
  CreditCard,
  Fingerprint,
  FileText,
  FileCheck,
  Sprout,
  Award,
  Laptop,
  Globe,
  IdCard,
} from '../common/Icons';
import { useLanguage } from '../../context/LanguageContext';

export const PopularServicesGrid = ({
  services = [],
  onSelectService,
  onApplyService,
  onViewAllServices,
}) => {
  const { t } = useLanguage();

  const getIcon = (type, category) => {
    switch (type) {
      case 'credit-card':
        return <CreditCard className="w-5 h-5 text-[#854D0E]" />;
      case 'fingerprint':
        return <Fingerprint className="w-5 h-5 text-[#854D0E]" />;
      case 'id-card':
        return <IdCard className="w-5 h-5 text-[#854D0E]" />;
      case 'file-text':
        return <FileText className="w-5 h-5 text-[#854D0E]" />;
      case 'file-check':
        return <FileCheck className="w-5 h-5 text-[#854D0E]" />;
      case 'award':
        return <Award className="w-5 h-5 text-[#854D0E]" />;
      case 'sprout':
        return <Sprout className="w-5 h-5 text-[#854D0E]" />;
      case 'laptop':
        return <Laptop className="w-5 h-5 text-[#854D0E]" />;
      case 'globe':
        return <Globe className="w-5 h-5 text-[#854D0E]" />;
      default:
        if (category === 'identity') return <IdCard className="w-5 h-5 text-[#854D0E]" />;
        if (category === 'farmer') return <Sprout className="w-5 h-5 text-[#854D0E]" />;
        if (category === 'online_govt') return <Globe className="w-5 h-5 text-[#854D0E]" />;
        return <FileText className="w-5 h-5 text-[#854D0E]" />;
    }
  };

  // Select top popular services matching Screenshot 2
  const popularServices = services
    .filter((s) => s.isPopular)
    .concat(services.filter((s) => !s.isPopular))
    .slice(0, 4);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#064E3B] tracking-tight text-left">
            {t('लोकप्रिय सेवा', 'Popular Services')}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 text-left mt-0.5">
            {t('सुलभ प्रक्रिया व वेळेत पूर्ततेची हमी', 'Easy online process with guaranteed timely completion')}
          </p>
        </div>

        {onViewAllServices && (
          <button
            onClick={onViewAllServices}
            className="text-xs sm:text-sm font-semibold text-[#064E3B] hover:text-emerald-800 hover:underline flex items-center gap-1 transition"
          >
            <span>{t('सर्व सेवा', 'All Services')}</span>
            <span>→</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {popularServices.map((service) => (
          <div
            key={service._id || service.slug}
            className="bg-white rounded-2xl p-5 border border-stone-200/90 hover:border-emerald-700/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between group text-left cursor-pointer relative"
            onClick={() => onSelectService(service)}
          >
            {/* Top row: Icon on left, Title on right */}
            <div className="flex items-start gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-xl bg-[#F6ECE2] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                {getIcon(service.iconType, service.category)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-base text-stone-900 group-hover:text-[#064E3B] transition-colors leading-snug line-clamp-1">
                  {service.marathiTitle}
                </h3>
                <p className="text-xs text-stone-500 font-medium mt-0.5 line-clamp-1">
                  {service.title} • {service.estimatedDays}
                </p>
              </div>
            </div>

            {/* Bottom row: Price and referral */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between mt-auto">
              <div className="flex items-baseline gap-1">
                <span className="font-extrabold text-base text-stone-900">
                  ₹{service.basePrice}
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  {t('सेवा शुल्क', 'fee')}
                </span>
              </div>

              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FFF7ED] text-[#EA580C] border border-[#FED7AA]">
                {t(`रेफरल ₹${service.agentCommission}`, `Referral ₹${service.agentCommission}`)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
