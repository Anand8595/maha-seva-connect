import React, { useState } from 'react';
import { X, Wallet, CheckCircle2, IndianRupee } from '../common/Icons';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const WithdrawModal = ({ isOpen, onClose, currentBalance = 455 }) => {
  const { t } = useLanguage();
  const { updateUser } = useAuth();
  const [amount, setAmount] = useState('400');
  const [payoutMethod, setPayoutMethod] = useState('upi'); // 'upi' | 'bank'
  const [upiId, setUpiId] = useState('rahulshinde@okaxis');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [holderName, setHolderName] = useState('राहुल शिंदे');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(amount) > currentBalance) {
      alert('उपलब्ध शिल्लकीपेक्षा जास्त रक्कम काढता येत नाही.');
      return;
    }

    setSubmitting(true);
    try {
      await api.requestWithdrawal({
        amount: Number(amount),
        payoutMethod,
        upiId,
        accountNumber,
        ifscCode,
        holderName,
      });

      updateUser({ walletBalance: Math.max(0, currentBalance - Number(amount)) });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-left animate-scaleUp">
        
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#064E3B] flex items-center justify-center font-bold text-base mb-3 shadow-xs">
            <Wallet className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900">
            {t('कमाई विड्रॉल करा', 'Withdraw Earnings')}
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            {t('उपलब्ध शिल्लक: ', 'Available Balance: ')}
            <strong className="text-[#064E3B] font-bold text-sm">₹{currentBalance}</strong>
          </p>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-bold text-stone-900">
              {t('विड्रॉल विनंती यशस्वी!', 'Withdrawal Request Submitted!')}
            </h3>
            <p className="text-xs text-stone-500">
              {t(`₹${amount} रक्कम तुमच्या खात्यात २४ तासांत वर्ग केली जाईल.`, `₹${amount} will be credited to your account within 24 hours.`)}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                {t('विड्रॉल रक्कम (₹) *', 'Withdrawal Amount (₹) *')}
              </label>
              <input
                type="number"
                min="100"
                max={currentBalance}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-lg font-bold text-[#064E3B] outline-none"
              />
              <span className="text-[11px] text-stone-400 mt-1 block">
                {t('किमान विड्रॉल रक्कम ₹१००', 'Minimum withdrawal Rs. 100')}
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                {t('पेआउट पद्धत', 'Payout Method')}
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setPayoutMethod('upi')}
                  className={`p-2.5 rounded-xl border text-center transition ${
                    payoutMethod === 'upi' ? 'bg-[#064E3B] text-white border-[#064E3B]' : 'bg-stone-50 text-stone-700 border-stone-200'
                  }`}
                >
                  UPI ID (GooglePay/PhonePe)
                </button>
                <button
                  type="button"
                  onClick={() => setPayoutMethod('bank')}
                  className={`p-2.5 rounded-xl border text-center transition ${
                    payoutMethod === 'bank' ? 'bg-[#064E3B] text-white border-[#064E3B]' : 'bg-stone-50 text-stone-700 border-stone-200'
                  }`}
                >
                  बँक ट्रान्सफर (NEFT/IMPS)
                </button>
              </div>
            </div>

            {payoutMethod === 'upi' ? (
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  {t('तुमचा UPI ID *', 'Your UPI ID *')}
                </label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="उदा. 9822012345@paytm किंवा name@okaxis"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm outline-none"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">खातेदाराचे नाव</label>
                  <input
                    type="text"
                    required
                    value={holderName}
                    onChange={(e) => setHolderName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">खाते क्रमांक</label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="XXXXXXXXXXXX"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">IFSC कोड</label>
                  <input
                    type="text"
                    required
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    placeholder="SBIN0001234"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs uppercase"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || Number(amount) < 100}
              className="w-full bg-[#064E3B] hover:bg-[#043c2d] text-white font-bold py-3.5 px-4 rounded-xl text-sm shadow-md transition active:scale-98 disabled:opacity-50"
            >
              {submitting ? t('विनंती पाठवत आहे...', 'Processing...') : t('विड्रॉल विनंती सबमिट करा', 'Submit Withdrawal')}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
