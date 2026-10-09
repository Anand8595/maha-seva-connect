import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Navbar } from './components/common/Navbar';
import { HeroSection } from './components/home/HeroSection';
import { CategoryFilter } from './components/home/CategoryFilter';
import { PopularServicesGrid } from './components/home/PopularServicesGrid';
import { ReferralAndWalletSection } from './components/home/ReferralAndWalletSection';
import { NoticesAndHelpWidget } from './components/home/NoticesAndHelpWidget';
import { TrackStatusPage } from './components/track/TrackStatusPage';
import { ServiceDetailPage } from './components/service/ServiceDetailPage';
import { ServicesPage } from './components/service/ServicesPage';
import { AgentDashboard } from './components/agent/AgentDashboard';
import { WalletPage } from './components/wallet/WalletPage';
import { ApplyServiceModal } from './components/modals/ApplyServiceModal';
import { AuthModal } from './components/modals/AuthModal';
import { WithdrawModal } from './components/modals/WithdrawModal';
import { WhatsAppFloatingButton } from './components/common/WhatsAppFloatingButton';
import { Footer } from './components/common/Footer';
import { api, fallbackServices } from './services/api';

function MainApp() {
  const { t } = useLanguage();
  const [currentTab, setCurrentTab] = useState('home');
  const [services, setServices] = useState(fallbackServices);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedService, setSelectedService] = useState(null);
  const [initialTrackQuery, setInitialTrackQuery] = useState('');

  // Modals state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyServiceTarget, setApplyServiceTarget] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);

  // Initialize and load all services
  useEffect(() => {
    const loadServices = async () => {
      try {
        const res = await api.getServices('all');
        if (res && res.services && res.services.length > 0) {
          setServices(res.services);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadServices();
  }, []);

  // Listen to browser URL and back/forward navigation
  useEffect(() => {
    const syncFromUrl = () => {
      try {
        const url = new URL(window.location.href);
        const path = url.pathname;
        const catParam = url.searchParams.get('cat');

        if (path.includes('/services') || catParam) {
          setCurrentTab('services');
          if (catParam) {
            setSelectedCategory(catParam);
          }
        } else if (path.includes('/track')) {
          setCurrentTab('track');
        } else if (path.includes('/agent')) {
          setCurrentTab('agent');
        } else if (path.includes('/wallet')) {
          setCurrentTab('wallet');
        }
      } catch (e) {
        // Fallback gracefully
      }
    };

    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

  // Navigation handlers
  const handleNavigateTab = (tab) => {
    setCurrentTab(tab);
    try {
      if (tab === 'home') {
        window.history.pushState({ tab: 'home' }, '', '/');
      } else if (tab === 'services') {
        const newUrl = selectedCategory === 'all' ? '/services' : `/services?cat=${selectedCategory}`;
        window.history.pushState({ tab: 'services', cat: selectedCategory }, '', newUrl);
      } else if (tab === 'track') {
        window.history.pushState({ tab: 'track' }, '', '/track-status');
      } else {
        window.history.pushState({ tab }, '', `/${tab}`);
      }
    } catch (e) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // When clicking a category card from Home page
  const handleCategoryClickFromHome = (catId) => {
    setSelectedCategory(catId);
    setCurrentTab('services');
    try {
      const newUrl = catId === 'all' ? '/services' : `/services?cat=${catId}`;
      window.history.pushState({ tab: 'services', cat: catId }, '', newUrl);
    } catch (e) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // When changing category inside Services page
  const handleServicesCategoryChange = (catId) => {
    setSelectedCategory(catId);
    try {
      const newUrl = catId === 'all' ? '/services' : `/services?cat=${catId}`;
      window.history.pushState({ tab: 'services', cat: catId }, '', newUrl);
    } catch (e) {}
  };

  const handleSelectService = (service) => {
    setSelectedService(service);
    setCurrentTab('service-detail');
    try {
      window.history.pushState({ tab: 'service-detail', slug: service.slug }, '', `/services/${service.slug}`);
    } catch (e) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyClick = (service = null) => {
    setApplyServiceTarget(service || services[0]);
    setApplyModalOpen(true);
  };

  const handleApplySuccess = (applicationNumber) => {
    setInitialTrackQuery(applicationNumber);
    setCurrentTab('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWhatsAppQuery = (service) => {
    const text = encodeURIComponent(
      `नमस्कार! मला ${service.marathiTitle} (${service.title}) सेवेबद्दल अधिक माहिती हवी आहे.`
    );
    window.open(`https://api.whatsapp.com/send?phone=919822012345&text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-stone-800">
      
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={handleNavigateTab}
        onOpenApplyModal={() => handleApplyClick(null)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
      />

      {/* Main Content Area based on currentTab */}
      <main className="flex-1">
        {/* TAB 1: HOME (Landing View) */}
        {currentTab === 'home' && (
          <div className="space-y-2">
            <HeroSection
              onOpenApplyModal={() => handleApplyClick(null)}
              onOpenAgentModal={() => handleNavigateTab('agent')}
            />

            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategoryClickFromHome}
            />

            <PopularServicesGrid
              services={services}
              onSelectService={handleSelectService}
              onApplyService={handleApplyClick}
              onViewAllServices={() => handleCategoryClickFromHome('all')}
            />

            <ReferralAndWalletSection
              onOpenAgentPage={() => handleNavigateTab('agent')}
              onOpenWalletPage={() => handleNavigateTab('wallet')}
            />

            <NoticesAndHelpWidget
              onOpenWhatsApp={() => {
                const text = encodeURIComponent('नमस्कार! मला शासकीय कागदपत्रे सेवेबद्दल मदत हवी आहे.');
                window.open(`https://api.whatsapp.com/send?phone=919822012345&text=${text}`, '_blank');
              }}
            />
          </div>
        )}

        {/* TAB 2: SERVICES (Full Catalog Matching Screenshot) */}
        {currentTab === 'services' && (
          <ServicesPage
            services={services}
            selectedCategory={selectedCategory}
            onSelectCategory={handleServicesCategoryChange}
            onSelectService={handleSelectService}
            onApplyService={handleApplyClick}
          />
        )}

        {/* TAB 3: TRACK STATUS (/track-status) */}
        {currentTab === 'track' && (
          <TrackStatusPage initialQuery={initialTrackQuery} />
        )}

        {/* TAB 4: SERVICE DETAILS (/services/:slug) */}
        {currentTab === 'service-detail' && (
          <ServiceDetailPage
            service={selectedService || services[0]}
            onBack={() => handleNavigateTab('services')}
            onApply={(s) => handleApplyClick(s)}
            onWhatsAppQuery={handleWhatsAppQuery}
          />
        )}

        {/* TAB 5: AGENT / YOJANA DUT PROGRAM */}
        {currentTab === 'agent' && (
          <AgentDashboard onOpenWithdrawModal={() => setWithdrawModalOpen(true)} />
        )}

        {/* TAB 6: WALLET & EARNINGS */}
        {currentTab === 'wallet' && (
          <WalletPage onOpenWithdrawModal={() => setWithdrawModalOpen(true)} />
        )}

        {/* TAB 7: NOTICES / ANNOUNCEMENTS */}
        {currentTab === 'notices' && (
          <div className="max-w-4xl mx-auto px-4 py-8 text-left animate-fadeIn">
            <h1 className="text-3xl font-extrabold text-[#064E3B] mb-2">{t('ताज्या शासकीय सूचना व अपडेट्स', 'Announcements & Notices')}</h1>
            <p className="text-sm text-stone-500 mb-6">{t('महत्त्वाचे जीआर, योजना आणि शेवटच्या मुदतीची माहिती', 'Important GRs, scheme updates, and deadlines')}</p>
            <NoticesAndHelpWidget
              onOpenWhatsApp={() => {
                const text = encodeURIComponent('नमस्कार! मला ताज्या योजनांबद्दल माहिती हवी आहे.');
                window.open(`https://api.whatsapp.com/send?phone=919822012345&text=${text}`, '_blank');
              }}
            />
          </div>
        )}

        {/* TAB 8: CONTACT */}
        {currentTab === 'contact' && (
          <div className="max-w-3xl mx-auto px-4 py-12 text-left animate-fadeIn">
            <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm space-y-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#064E3B]">{t('संपर्क व मदत केंद्र', 'Contact & Help Center')}</h1>
              <p className="text-sm text-stone-600 leading-relaxed">
                {t('कागदपत्रांबद्दल कोणतीही शंका असल्यास किंवा योजना दूत म्हणून मोठ्या प्रमाणावर काम सुरू करायचे असल्यास आमच्याशी थेट संपर्क साधा.', 'For any questions about documents or partnering as Yojana Dut in your area, contact us directly.')}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                  <span className="text-xs text-emerald-800 font-bold block mb-1">WhatsApp त्वरित मदत:</span>
                  <a href="https://api.whatsapp.com/send?phone=919822012345" target="_blank" rel="noreferrer" className="text-base font-extrabold text-[#064E3B] hover:underline">
                    +९१ ९८२२० १२३४५
                  </a>
                  <p className="text-[11px] text-stone-500 mt-1">सकाळी ९ ते संध्या. ७</p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <span className="text-xs text-stone-500 font-bold block mb-1">ईमेल सपोर्ट:</span>
                  <span className="text-base font-bold text-stone-900">support@yojanadut.in</span>
                  <p className="text-[11px] text-stone-400 mt-1">२४ तासांत उत्तर</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Floating WhatsApp Quick Assist Action */}
      <WhatsAppFloatingButton />

      {/* Footer */}
      <Footer onNavigate={handleNavigateTab} />

      {/* Modals */}
      <ApplyServiceModal
        initialService={applyServiceTarget}
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        onSuccess={handleApplySuccess}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <WithdrawModal
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </LanguageProvider>
  );
}