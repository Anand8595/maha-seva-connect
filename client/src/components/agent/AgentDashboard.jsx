import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Gift,
  Copy,
  Share2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  User,
  ArrowRight,
  Filter,
  WhatsAppIcon,
  IndianRupee,
} from '../common/Icons';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const AgentDashboard = ({ onOpenWithdrawModal }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [walletData, setWalletData] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const fetchWallet = async () => {
      const res = await api.getWalletOverview();
      if (res && res.data) {
        setWalletData(res.data);
      }
    };
    fetchWallet();
  }, []);

  const referralCode = user?.referralCode || walletData?.referralCode || 'YD-RAHUL100';
  const referralLink = `${window.location.origin}/?ref=${referralCode}`;

  const copyToClipboard = (text, isCode = false) => {
    navigator.clipboard.writeText(text);
    if (isCode) {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(
      `नमस्कार! सरकारी कागदपत्रे जसे की पॅन कार्ड, उत्पन्न दाखला, शेतकरी ओळखपत्र घरबसल्या मिळवा. खालील लिंकवरून अर्ज करा:\n${referralLink}\nकिंवा माझा रेफरल कोड वापरा: *${referralCode}*`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const availableBalance = user?.walletBalance !== undefined ? user.walletBalance : (walletData?.availableBalance || 455);
  const pendingBalance = user?.pendingBalance !== undefined ? user.pendingBalance : (walletData?.pendingBalance || 50);
  const clearedTotal = user?.totalEarned !== undefined ? user.totalEarned : (walletData?.clearedTotal || 1240);

  const transactions = walletData?.transactions || [];
  const filteredTransactions = transactions.filter((t) => {
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left animate-fadeIn">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-[#EA580C] text-xs font-bold mb-2">
            <Gift className="w-3.5 h-3.5" />
            <span>{t('योजना दूत भागीदार कार्यक्रम', 'Yojana Dut Partner Program')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#064E3B] tracking-tight">
            {t('योजना दूत डॅशबोर्ड', 'Yojana Dut Dashboard')}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            {t('तुमची रेफरल लिंक शेअर करा आणि प्रत्येक यशस्वी अर्जावर थेट कमिशन कमवा.', 'Share your referral link and earn commissions on every completed application.')}
          </p>
        </div>

        <button
          onClick={onOpenWithdrawModal}
          className="bg-[#EA580C] hover:bg-[#c2410c] text-white font-bold px-6 py-3 rounded-xl text-sm shadow-md transition-all active:scale-95 flex items-center gap-2 shrink-0"
        >
          <Wallet className="w-4 h-4" />
          <span>{t('पैसे काढा (Withdraw)', 'Withdraw Earnings')}</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Card 1: Available Balance */}
        <div className="bg-[#064E3B] text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-200 font-medium">
              {t('उपलब्ध शिल्लक', 'Available Balance')}
            </span>
            <Wallet className="w-5 h-5 text-emerald-200" />
          </div>
          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              ₹{availableBalance}
            </span>
            <p className="text-[11px] text-emerald-300 mt-1">
              {t('थेट UPI किंवा बँक खात्यात काढता येते', 'Withdrawable to UPI or Bank')}
            </p>
          </div>
        </div>

        {/* Card 2: Pending Balance */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500 font-medium">
              {t('प्रलंबित कमिशन', 'Pending Commission')}
            </span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              ₹{pendingBalance}
            </span>
            <p className="text-[11px] text-stone-400 mt-1">
              {t('अर्ज पूर्ण झाल्यावर शिल्लकमध्ये जोडले जाईल', 'Added to available once application finishes')}
            </p>
          </div>
        </div>

        {/* Card 3: Cleared Total */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500 font-medium">
              {t('एकूण मंजूर कमाई', 'Total Cleared Earnings')}
            </span>
            <ShieldCheck className="w-5 h-5 text-[#064E3B]" />
          </div>
          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              ₹{clearedTotal}
            </span>
            <p className="text-[11px] text-stone-400 mt-1">
              {t('आजपर्यंत मिळवलेली एकूण रेफरल कमाई', 'Lifetime total commissions earned')}
            </p>
          </div>
        </div>
      </div>

      {/* Referral Link & Code Generator Banner */}
      <div className="bg-orange-50/70 border border-orange-200 rounded-3xl p-6 sm:p-8 mb-8 shadow-xs">
        <h3 className="text-base sm:text-lg font-bold text-stone-900 mb-2">
          {t('तुमचा युनिक रेफरल कोड व लिंक', 'Your Unique Referral Code & Link')}
        </h3>
        <p className="text-xs sm:text-sm text-stone-600 mb-6 max-w-2xl leading-relaxed">
          {t(
            'गावातील नागरिकांना सेवा सुचवताना हा कोड वापरण्यास सांगा किंवा खालील लिंक पाठवा. लिंकवरून अर्ज केल्यास आपोआप तुमच्या खात्यात रिवॉर्ड जमा होईल.',
            'Share your link or code with citizens. When they apply using your link, commission will automatically credit to your wallet.'
          )}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          {/* Referral Code Box */}
          <div className="bg-white p-4 rounded-2xl border border-orange-200 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[11px] text-stone-400 font-medium block">
                {t('रेफरल कोड', 'Referral Code')}
              </span>
              <span className="text-lg font-mono font-extrabold text-[#EA580C] tracking-wide">
                {referralCode}
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(referralCode, true)}
              className="px-3.5 py-1.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-[#EA580C] text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
            >
              {copiedCode ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? t('कॉपी केले!', 'Copied!') : t('कोड कॉपी करा', 'Copy')}</span>
            </button>
          </div>

          {/* Referral Link & Share on WhatsApp */}
          <div className="flex gap-2">
            <button
              onClick={() => copyToClipboard(referralLink, false)}
              className="flex-1 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-semibold p-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-98"
            >
              <Copy className="w-4 h-4 text-stone-500" />
              <span>{copiedLink ? t('लिंक कॉपी झाली!', 'Link Copied!') : t('रेफरल लिंक कॉपी करा', 'Copy Link')}</span>
            </button>

            <button
              onClick={shareOnWhatsApp}
              className="bg-[#25D366] hover:bg-[#20ba59] text-white font-bold px-5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-98"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>{t('WhatsApp वर शेअर करा', 'Share')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Commission Ledger Table */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-lg font-bold text-stone-900">
              {t('कमिशन लेजर व व्यवहार', 'Commission Ledger & History')}
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              {t('सर्व जमा झालेले व प्रलंबित व्यवहार', 'All credited and pending transactions')}
            </p>
          </div>

          {/* Filter tabs: All, Pending, Cleared */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl text-xs font-semibold text-stone-600">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${statusFilter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'}`}
            >
              {t('सर्व', 'All')}
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg transition ${statusFilter === 'pending' ? 'bg-white text-amber-700 shadow-xs' : 'hover:text-stone-900'}`}
            >
              {t('प्रलंबित', 'Pending')}
            </button>
            <button
              onClick={() => setStatusFilter('cleared')}
              className={`px-3 py-1.5 rounded-lg transition ${statusFilter === 'cleared' ? 'bg-white text-emerald-700 shadow-xs' : 'hover:text-stone-900'}`}
            >
              {t('मंजूर', 'Cleared')}
            </button>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-stone-400 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-2">{t('तपशील', 'Details')}</th>
                <th className="py-3 px-2">{t('अर्जदार', 'Applicant')}</th>
                <th className="py-3 px-2">{t('तारीख', 'Date')}</th>
                <th className="py-3 px-2">{t('रक्कम', 'Amount')}</th>
                <th className="py-3 px-2">{t('स्थिती', 'Status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-stone-400">
                    {t('या फिल्टरमध्ये कोणतेही व्यवहार नाहीत.', 'No transactions found under this filter.')}
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-stone-50/70 transition">
                    <td className="py-3.5 px-2 font-medium">
                      <div className="font-bold text-stone-900">{tx.serviceTitle}</div>
                      {tx.applicationNumber && (
                        <span className="text-[11px] font-mono text-stone-400">{tx.applicationNumber}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-2 text-stone-600">
                      {tx.applicantName || '—'}
                    </td>
                    <td className="py-3.5 px-2 text-stone-400 text-xs">
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('mr-IN') : '2026-10-05'}
                    </td>
                    <td className="py-3.5 px-2 font-extrabold">
                      <span className={tx.type === 'credit' ? 'text-emerald-700' : 'text-rose-600'}>
                        {tx.type === 'credit' ? `+₹${tx.amount}` : `-₹${tx.amount}`}
                      </span>
                    </td>
                    <td className="py-3.5 px-2">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          tx.status === 'cleared'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {tx.status === 'cleared' ? t('मंजूर (Cleared)', 'Cleared') : t('प्रलंबित (Pending)', 'Pending')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
