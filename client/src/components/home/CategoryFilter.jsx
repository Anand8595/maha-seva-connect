import React from 'react';
import { FileText, Sprout, Laptop, Globe, IdCard } from '../common/Icons';
import { useLanguage } from '../../context/LanguageContext';

export const CategoryFilter = ({ selectedCategory, onSelectCategory }) => {
  const { t } = useLanguage();

  const categories = [
    {
      id: 'identity',
      title: t('ओळखपत्र सेवा', 'Identity Services'),
      sub: 'Identity',
      icon: <IdCard className="w-6 h-6 text-[#0D4F45]" />,
    },
    {
      id: 'certificates',
      title: t('दाखले / प्रमाणपत्र', 'Certificates'),
      sub: 'Certificates',
      icon: <FileText className="w-6 h-6 text-[#0D4F45]" />,
    },
    {
      id: 'farmer',
      title: t('शेतकरी सेवा', 'Farmer Services'),
      sub: 'Farmer',
      icon: <Sprout className="w-6 h-6 text-[#0D4F45]" />,
    },
    {
      id: 'online_govt',
      title: t('ऑनलाईन शासकीय सेवा', 'Online Govt. Services'),
      sub: 'Online Govt. Services',
      icon: <Globe className="w-6 h-6 text-[#0D4F45]" />,
    },
    {
      id: 'csc_partner',
      title: t('सायबर कॅफे / CSC', 'Cyber Cafe / CSC'),
      sub: 'Cyber Cafe',
      icon: <Laptop className="w-6 h-6 text-[#0D4F45]" />,
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="text-left mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-[#064E3B] tracking-tight">
          {t('सेवा प्रकार', 'Service Categories')}
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`p-5 rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-200 border cursor-pointer group ${
                isSelected
                  ? 'bg-white border-[#064E3B] shadow-md ring-2 ring-[#064E3B]/20 transform -translate-y-0.5'
                  : 'bg-white hover:bg-white border-stone-200/80 hover:border-emerald-600/50 shadow-xs hover:shadow-md'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-[#E6F4F1] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                {cat.icon}
              </div>
              <span className="text-sm font-bold text-stone-900 group-hover:text-[#064E3B] transition-colors line-clamp-1">
                {cat.title}
              </span>
              <span className="text-[11px] text-stone-400 mt-0.5 font-medium">
                {cat.sub}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
