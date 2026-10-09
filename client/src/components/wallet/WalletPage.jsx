import React, { useState, useEffect } from 'react';
import { Wallet, Clock, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle } from '../common/Icons';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const WalletPage = ({ onOpenWithdrawModal }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [walletData, setWalletData] = useState(null);

  useEffect(() => {
    const fetchWallet = async () => {
      const res = await api.getWalletOverview();
      if (res && res.data) {
        setWalletData(res.data);
      }
    };
    fetchWallet();
  }, []);

  const balance = user?.walletBalance !== undefined ? user.walletBalance : (walletData?.availableBalance || 455);
  const pending = user?.pendingBalance !== undefined ? user.pendingBalance : (walletData?.pendingBalance || 50);
  const cleared = user?.totalEarned !== undefined ? user.totalEarned : (walletData?.clearedTotal || 1240);
  const withdrawn = walletData?.withdrawnTotal || 500;
  const transactions = walletData?.transactions || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#064E3B] tracking-tight">
            {t('वॉलेट व कमाई व्यवस्थापन', 'Wallet & Earnings')}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            {t('तुमची शिल्लक रक्कम, प्रलंबित कमिशन आणि सुरक्षित बँक/UPI ट्रान्सफर इतिहास.', 'Your balance, pending rewards, and withdrawal records.')}
          </p>
        </div>

        <button
          onClick={onOpenWithdrawModal}
          className="bg-[#EA580C] hover:bg-[#c2410c] text-white font-bold px-6 py-3 rounded-xl text-sm shadow-md transition active:scale-95 flex items-center gap-2 shrink-0"
        >
          <Wallet className="w-4 h-4" />
          <span>{t('रक्कम काढा (Withdraw)', 'Withdraw Funds')}</span>
        </button>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#064E3B] text-white rounded-2xl p-6 shadow-sm">
          <span className="text-xs text-emerald-200 font-medium">{t('उपलब्ध शिल्लक', 'Available Balance')}</span>
          <div className="text-3xl font-extrabold mt-2">₹{balance}</div>
          <span className="text-[11px] text-emerald-300 mt-2 block">कधीही काढता येणारी रक्कम</span>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">{t('प्रलंबित कमिशन', 'Pending Commission')}</span>
          <div className="text-3xl font-extrabold text-stone-900 mt-2">₹{pending}</div>
          <span className="text-[11px] text-amber-600 font-semibold mt-2 block">अर्ज तपासणीनंतर जमा होईल</span>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">{t('एकूण मंजूर कमाई', 'Total Approved')}</span>
          <div className="text-3xl font-extrabold text-[#064E3B] mt-2">₹{cleared}</div>
          <span className="text-[11px] text-stone-400 mt-2 block">सर्व रेफरल्समधून कमाई</span>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">{t('काढलेली रक्कम', 'Total Withdrawn')}</span>
          <div className="text-3xl font-extrabold text-stone-900 mt-2">₹{withdrawn}</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-2 block">बँकेत यशस्वी वर्ग</span>
        </div>
      </div>

      {/* Transactions History */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-7 shadow-xs">
        <h3 className="text-lg font-bold text-stone-900 mb-4">
          {t('व्यवहार तपशील (Transaction History)', 'Transaction History')}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-stone-400 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-2">व्यवहार प्रकार</th>
                <th className="py-3 px-2">तपशील</th>
                <th className="py-3 px-2">तारीख</th>
                <th className="py-3 px-2">रक्कम</th>
                <th className="py-3 px-2">स्थिती</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {transactions.map((t) => (
                <tr key={t._id} className="hover:bg-stone-50 transition">
                  <td className="py-3 px-2 font-bold text-stone-900">
                    {t.type === 'credit' ? 'रेफरल कमिशन' : 'विड्रॉल पेआउट'}
                  </td>
                  <td className="py-3 px-2 text-stone-600">
                    {t.serviceTitle} {t.applicationNumber && `(${t.applicationNumber})`}
                  </td>
                  <td className="py-3 px-2 text-stone-400 text-xs">
                    {t.createdAt ? new Date(t.createdAt).toLocaleDateString('mr-IN') : '2026-10-05'}
                  </td>
                  <td className="py-3 px-2 font-extrabold">
                    <span className={t.type === 'credit' ? 'text-emerald-700' : 'text-rose-600'}>
                      {t.type === 'credit' ? `+₹${t.amount}` : `-₹${t.amount}`}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        t.status === 'cleared'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {t.status === 'cleared' ? 'मंजूर' : 'प्रलंबित'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
