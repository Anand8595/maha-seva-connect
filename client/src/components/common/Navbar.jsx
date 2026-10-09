import React, { useState } from 'react';
import { Bell, Menu, X, User as UserIcon, ShieldCheck, ChevronDown, CheckCircle2, AlertCircle } from './Icons';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const Navbar = ({ currentTab, setCurrentTab, onOpenApplyModal, onOpenAuthModal }) => {
  const { user, isAuthenticated, logout, quickDemoLogin } = useAuth();
  const { lang, switchLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const notifications = [
    { id: 1, title: 'अर्ज क्र. YD-24081 अपडेट', desc: 'कागदपत्रे तपासणी पूर्ण झाली आहे.', time: '१० मि. पूर्वी', read: false },
    { id: 2, title: 'दिवाळी रेफरल ऑफर!', desc: 'प्रत्येक ३ अर्जांवर ₹१०० अतिरिक्त कमिशन मिळवा.', time: '२ तासांपूर्वी', read: false },
    { id: 3, title: 'विड्रॉल जमा झाले', desc: 'तुमच्या खात्यात ₹५०० यशस्वी वर्ग झाले.', time: 'काल', read: true },
  ];

  const navItems = [
    { id: 'services', label: t('सेवा', 'Services') },
    { id: 'track', label: t('अर्ज स्थिती', 'Track Status') },
    { id: 'agent', label: t('योजना दूत', 'Yojana Dut') },
    { id: 'wallet', label: t('वॉलेट', 'Wallet') },
    { id: 'notices', label: t('सूचना', 'Notices') },
    { id: 'contact', label: t('संपर्क', 'Contact') },
  ];

  const handleNavClick = (id) => {
    setCurrentTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FAF9F6] border-b border-stone-200/80 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          
          {/* Logo Brand */}
          <div 
            onClick={() => handleNavClick('home')} 
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
              यो
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl leading-tight text-[#064E3B] tracking-tight">
                YojanaDut
              </span>
              <span className="text-[11px] leading-tight text-emerald-950 font-medium tracking-wide">
                {t('योजना दूत पोर्टल', 'Gov Facilitation Portal')}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-[#f0ede6] text-[#064e3b] font-bold shadow-xs'
                      : 'text-stone-700 hover:text-[#064e3b] hover:bg-stone-200/50 font-medium'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Header Right Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* 3-Language Selector: मराठी | हिंदी | English */}
            <div className="hidden sm:inline-flex items-center p-0.5 rounded-full bg-stone-200/90 border border-stone-300 text-xs font-semibold">
              <button
                type="button"
                onClick={() => switchLanguage('mr')}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  lang === 'mr'
                    ? 'bg-[#064E3B] text-white font-bold shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
                title="मराठी"
              >
                मराठी
              </button>
              <button
                type="button"
                onClick={() => switchLanguage('hi')}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  lang === 'hi'
                    ? 'bg-[#064E3B] text-white font-bold shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
                title="हिंदी"
              >
                हिंदी
              </button>
              <button
                type="button"
                onClick={() => switchLanguage('en')}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  lang === 'en'
                    ? 'bg-[#064E3B] text-white font-bold shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
                title="English"
              >
                English
              </button>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 transition relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#EA580C] rounded-full ring-2 ring-[#FAF9F6]"></span>
              </button>

              {/* Notification Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-2 border-b border-stone-100 flex items-center justify-between">
                    <span className="font-bold text-sm text-[#064E3B]">{t('सूचना आणि अपडेट्स', 'Notifications')}</span>
                    <span className="text-[11px] bg-orange-100 text-[#EA580C] font-semibold px-2 py-0.5 rounded-full">
                      ३ नवीन
                    </span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-stone-100">
                    {notifications.map((n) => (
                      <div key={n.id} className={`p-3 hover:bg-stone-50 transition cursor-pointer ${!n.read ? 'bg-orange-50/40' : ''}`}>
                        <div className="flex justify-between items-start">
                          <p className="text-xs font-semibold text-stone-800">{n.title}</p>
                          <span className="text-[10px] text-stone-400">{n.time}</span>
                        </div>
                        <p className="text-xs text-stone-600 mt-1">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="px-3 pt-2 text-center border-t border-stone-100">
                    <button 
                      onClick={() => { setNotificationsOpen(false); setCurrentTab('track'); }} 
                      className="text-xs text-[#064E3B] font-semibold hover:underline"
                    >
                      {t('सर्व अर्ज पहा →', 'View all applications →')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Login Modal Trigger */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-300 hover:border-emerald-700 bg-white text-xs font-semibold text-stone-800 transition"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">
                    {user.name ? user.name[0] : 'य'}
                  </span>
                  <span className="max-w-[80px] sm:max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs font-bold text-stone-900">{user.name}</p>
                      <p className="text-[11px] text-stone-500">{user.phone}</p>
                      <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-[#064E3B]">
                        {user.role === 'agent' ? 'योजना दूत (Agent)' : 'नागरिक (Citizen)'}
                      </span>
                    </div>

                    <div className="py-1 text-xs text-stone-700">
                      {user.role === 'agent' && (
                        <button
                          onClick={() => { setCurrentTab('wallet'); setUserDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2 hover:bg-stone-50"
                        >
                          {t('माझे वॉलेट (₹' + (user.walletBalance || 455) + ')', 'My Wallet')}
                        </button>
                      )}
                      <button
                        onClick={() => { setCurrentTab('track'); setUserDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 hover:bg-stone-50"
                      >
                        {t('माझे अर्ज', 'My Applications')}
                      </button>
                      
                      {/* Quick demo switch */}
                      <div className="border-t border-stone-100 my-1 pt-1 px-4">
                        <p className="text-[10px] text-stone-400 mb-1">Demo Profile Switch:</p>
                        <div className="flex gap-1">
                          <button
                            onClick={() => { quickDemoLogin('agent'); setUserDropdownOpen(false); }}
                            className="text-[10px] px-2 py-0.5 rounded bg-stone-100 hover:bg-orange-100 text-stone-700"
                          >
                            Agent (राहुल)
                          </button>
                          <button
                            onClick={() => { quickDemoLogin('user'); setUserDropdownOpen(false); }}
                            className="text-[10px] px-2 py-0.5 rounded bg-stone-100 hover:bg-blue-100 text-stone-700"
                          >
                            Citizen (नागरिक)
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-stone-100 pt-1">
                      <button
                        onClick={() => { logout(); setUserDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium"
                      >
                        {t('लॉगआउट करा', 'Logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-3.5 py-1.5 rounded-full border border-stone-300 text-stone-800 hover:border-stone-400 hover:bg-stone-100 text-xs sm:text-sm font-semibold transition"
              >
                {t('लॉगिन', 'Login')}
              </button>
            )}

            {/* Primary Orange CTA: सेवा अर्ज करा */}
            <button
              onClick={onOpenApplyModal}
              className="bg-[#EA580C] hover:bg-[#c2410c] text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-full shadow-sm hover:shadow transition-all duration-150 active:scale-95"
            >
              {t('सेवा अर्ज करा', 'Apply for Service')}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-stone-700 hover:bg-stone-200/60"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 px-4 pt-2 pb-6 shadow-xl animate-fadeIn">
          <div className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-left px-4 py-2.5 rounded-lg text-sm font-medium ${
                  currentTab === item.id ? 'bg-[#f0ede6] text-[#064e3b] font-bold' : 'text-stone-700'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
              <span className="text-xs text-stone-500 font-semibold">भाषा निवडा / Select Language:</span>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-stone-100 border border-stone-200 text-center">
                <button
                  type="button"
                  onClick={() => switchLanguage('mr')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition ${
                    lang === 'mr' ? 'bg-[#064E3B] text-white shadow-xs' : 'text-stone-700'
                  }`}
                >
                  मराठी
                </button>
                <button
                  type="button"
                  onClick={() => switchLanguage('hi')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition ${
                    lang === 'hi' ? 'bg-[#064E3B] text-white shadow-xs' : 'text-stone-700'
                  }`}
                >
                  हिंदी
                </button>
                <button
                  type="button"
                  onClick={() => switchLanguage('en')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition ${
                    lang === 'en' ? 'bg-[#064E3B] text-white shadow-xs' : 'text-stone-700'
                  }`}
                >
                  English
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
