import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
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

export const ServicesPage = ({
  services = [],
  selectedCategory = 'all',
  onSelectCategory,
  onSelectService,
  onApplyService,
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', title: t('सर्व', 'All') },
    { id: 'identity', title: t('ओळखपत्र सेवा', 'Identity Services') },
    { id: 'certificates', title: t('दाखले / प्रमाणपत्र', 'Certificates') },
    { id: 'farmer', title: t('शेतकरी सेवा', 'Farmer Services') },
    { id: 'online_govt', title: t('ऑनलाईन शासकीय सेवा', 'Online Govt. Services') },
    { id: 'csc_partner', title: t('सायबर कॅफे / CSC', 'Cyber Cafe / CSC') },
  ];

  const getServiceIcon = (type, category) => {
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
        if (category === 'csc_partner') return <Laptop className="w-5 h-5 text-[#854D0E]" />;
        if (category === 'online_govt') return <Globe className="w-5 h-5 text-[#854D0E]" />;
        return <FileText className="w-5 h-5 text-[#854D0E]" />;
    }
  };

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchCategory =
        selectedCategory === 'all' || service.category === selectedCategory;
      if (!matchCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const inTitle = service.title?.toLowerCase().includes(q);
      const inMarathiTitle = service.marathiTitle?.includes(q);
      const inDesc = service.description?.toLowerCase().includes(q);
      const inCategory = service.categoryMarathi?.includes(q);

      return inTitle || inMarathiTitle || inDesc || inCategory;
    });
  }, [services, selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn text-left">
      
      {/* Page Heading matching screenshot */}
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#064E3B] tracking-tight">
          {t('सर्व सेवा', 'All Services')}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          {t('Services – सेवा निवडा, कागदपत्रे पहा आणि अर्ज करा', 'Services – Select service, check documents and apply')}
        </p>
      </div>

      {/* Search Bar matching screenshot */}
      <div className="relative mb-6">
        <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('सेवा शोधा... (उदा. PAN)', 'Search services... (e.g. PAN)')}
          className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white border border-stone-200/90 text-sm sm:text-base text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 shadow-xs transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 rounded-full hover:bg-stone-100 transition"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Horizontal Category Filter Pills matching screenshot */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar flex-wrap sm:flex-nowrap">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#0D4F45] text-white shadow-xs'
                  : 'bg-white border border-stone-200/90 text-stone-700 hover:bg-stone-50 hover:border-stone-300'
              }`}
            >
              {cat.title}
            </button>
          );
        })}
      </div>

      {/* Service Cards Grid (3 columns on desktop matching screenshot) */}
      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredServices.map((service) => (
            <div
              key={service._id || service.slug}
              onClick={() => onSelectService(service)}
              className="bg-white rounded-2xl p-5 border border-stone-200/90 hover:border-emerald-700/40 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group text-left relative"
            >
              {/* Top Row: Icon on left, Titles on right */}
              <div className="flex items-start gap-3.5 mb-5">
                <div className="w-12 h-12 rounded-xl bg-[#F6ECE2] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  {getServiceIcon(service.iconType, service.category)}
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

              {/* Bottom Row: Price on left, Referral on right */}
              <div className="flex items-center justify-between pt-3 border-t border-stone-100">
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
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center my-6">
          <p className="text-stone-500 font-medium">
            {t('कोणतीही सेवा सापडली नाही.', 'No services found.')}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              onSelectCategory('all');
            }}
            className="mt-3 text-sm font-semibold text-[#064E3B] hover:underline"
          >
            {t('सर्व सेवा पहा →', 'View all services →')}
          </button>
        </div>
      )}

    </div>
  );
};
