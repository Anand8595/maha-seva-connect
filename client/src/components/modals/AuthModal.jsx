import React, { useState, useEffect, useRef } from 'react';
import { X, Phone, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, Key } from '../common/Icons';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export const AuthModal = ({ isOpen, onClose, initialRole = 'user' }) => {
  const { t } = useLanguage();
  const { sendOtp, verifyOtp } = useAuth();
  
  const [role, setRole] = useState(initialRole);
  const [step, setStep] = useState(1); // 1: Enter Phone, 2: Enter OTP
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  
  // 6-digit OTP array
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [activeOtpBox, setActiveOtpBox] = useState(0);
  const otpInputRefs = useRef([]);
  
  // Real generated OTP received from service
  const [serverOtp, setServerOtp] = useState('');
  const [smsBanner, setSmsBanner] = useState(null);
  
  // Timers & loading
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setPhone('');
      setName('');
      setOtpDigits(['', '', '', '', '', '']);
      setError('');
      setSuccessMsg('');
      setSmsBanner(null);
      setRole(initialRole || 'user');
    }
  }, [isOpen, initialRole]);

  // Resend OTP countdown timer
  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  // Step 1: Send OTP to Mobile Number
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError(t('कृपया वैध १०-अंकी मोबाईल नंबर प्रविष्ट करा.', 'Please enter a valid 10-digit mobile number.'));
      return;
    }

    setLoading(true);
    try {
      const res = await sendOtp(cleanPhone, role);
      if (res.success) {
        setServerOtp(res.otp || '');
        setStep(2);
        setCountdown(30);
        setCanResend(false);
        setOtpDigits(['', '', '', '', '', '']);
        
        // Show realistic SMS incoming notification
        setSmsBanner({
          otp: res.otp,
          phone: cleanPhone,
          time: new Date().toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' }),
        });

        // Focus first OTP box
        setTimeout(() => {
          if (otpInputRefs.current[0]) {
            otpInputRefs.current[0].focus();
          }
        }, 150);
      } else {
        setError(res.message || 'OTP पाठवणे अयशस्वी.');
      }
    } catch {
      setError(t('सर्व्हरशी संपर्क होऊ शकला नाही. कृपया पुन्हा प्रयत्न करा.', 'Network error. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle OTP input typing (box by box)
  const handleOtpChange = (index, value) => {
    // Only accept numeric digit
    const char = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);

    // Auto-advance to next input
    if (char && index < 5) {
      if (otpInputRefs.current[index + 1]) {
        otpInputRefs.current[index + 1].focus();
        setActiveOtpBox(index + 1);
      }
    }
  };

  // Handle Backspace navigation
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      if (otpInputRefs.current[index - 1]) {
        otpInputRefs.current[index - 1].focus();
        setActiveOtpBox(index - 1);
      }
    }
  };

  // Handle Paste event for entire 6-digit OTP
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      const newDigits = ['', '', '', '', '', ''];
      pasted.split('').forEach((d, i) => {
        newDigits[i] = d;
      });
      setOtpDigits(newDigits);
      const nextFocus = Math.min(5, pasted.length);
      if (otpInputRefs.current[nextFocus]) {
        otpInputRefs.current[nextFocus].focus();
      }
    }
  };

  // 1-Click Auto-fill from incoming SMS banner
  const handleFillFromSms = () => {
    if (!serverOtp) return;
    const digits = serverOtp.split('').slice(0, 6);
    setOtpDigits(digits);
    if (otpInputRefs.current[5]) {
      otpInputRefs.current[5].focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setError(t('कृपया ६-अंकी संपूर्ण OTP प्रविष्ट करा.', 'Please enter complete 6-digit OTP.'));
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phone.trim().replace(/\D/g, '');
      const res = await verifyOtp(cleanPhone, fullOtp, role, name.trim());
      if (res.success) {
        setSuccessMsg(t('लॉगिन यशस्वी झाले!', 'Login successful!'));
        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        setError(res.message || t('प्रविष्ट केलेला OTP चुकीचा आहे.', 'Invalid OTP. Please check.'));
      }
    } catch {
      setError(t('पडताळणी करताना त्रुटी आली.', 'Error verifying OTP.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-left animate-scaleUp overflow-hidden border border-stone-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Brand Crest */}
        <div className="mb-5 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#EA580C] to-orange-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-orange-500/20">
            यो
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              {step === 1 ? t('मोबाईल नंबर लॉगिन', 'Mobile Login') : t('OTP पडताळणी', 'Verify OTP')}
            </h2>
            <p className="text-xs text-stone-500">
              {t('महाराष्ट्र शासन योजनादूत सुरक्षित पोर्टल', 'Official YojanaDut Facilitation Portal')}
            </p>
          </div>
        </div>

        {/* Role Selector Tabs (Citizen vs Agent) */}
        {step === 1 && (
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-100 rounded-2xl mb-5 text-xs font-bold text-stone-600">
            <button
              type="button"
              onClick={() => setRole('user')}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                role === 'user'
                  ? 'bg-[#064E3B] text-white shadow-sm font-black'
                  : 'hover:text-stone-900'
              }`}
            >
              <span>{t('नागरिक (Citizen)', 'Citizen')}</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('agent')}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                role === 'agent'
                  ? 'bg-[#064E3B] text-white shadow-sm font-black'
                  : 'hover:text-stone-900'
              }`}
            >
              <span>{t('योजना दूत (Agent)', 'Agent')}</span>
            </button>
          </div>
        )}

        {/* LIVE INCOMING SMS ALERT BANNER (When OTP is sent) */}
        {smsBanner && step === 2 && (
          <div className="mb-4 p-3 bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 border border-emerald-300 rounded-2xl shadow-sm text-xs text-emerald-950 animate-fadeIn">
            <div className="flex items-center justify-between font-bold text-[11px] text-emerald-900 mb-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                📩 योजनादूत SMS अलर्ट (Gov SMS Gateway)
              </span>
              <span className="text-emerald-700 text-[10px]">{smsBanner.time}</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed font-mono">
              तुमचा अधिकृत लॉगिन OTP: <strong className="text-base text-emerald-950 font-black tracking-wider bg-white px-2 py-0.5 rounded border border-emerald-300">{smsBanner.otp}</strong> आहे.
            </p>
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={handleFillFromSms}
                className="text-[11px] font-bold text-white bg-[#064E3B] hover:bg-emerald-900 px-3 py-1 rounded-lg transition shadow-xs flex items-center gap-1"
              >
                <span>हा OTP ऑटो-फिल करा (Auto-Fill)</span>
              </button>
            </div>
          </div>
        )}

        {/* Error / Success Notifications */}
        {error && (
          <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 mb-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{successMsg}</span>
          </div>
        )}

        {/* STEP 1: MOBILE NUMBER ENTRY */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1.5">
                {t('तुमचा मोबाईल क्रमांक (Mobile Number)', 'Mobile Number')}
              </label>
              
              <div className="relative flex items-center">
                {/* +91 Country Badge */}
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500 font-bold text-xs">
                  <span>🇮🇳 +91</span>
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="98XXXXXXXX"
                  className="w-full pl-16 pr-4 py-3 rounded-2xl border border-stone-300 text-base font-semibold text-stone-900 outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B] tracking-wider transition"
                />
              </div>
              <p className="text-[11px] text-stone-400 mt-1.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>या नंबरवर पडताळणीसाठी ६-अंकी OTP पाठवला जाईल.</span>
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-600 block mb-1">
                {t('पूर्ण नाव (ऐच्छिक / Optional)', 'Full Name (Optional)')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'agent' ? 'उदा. राहुल शिंदे' : 'उदा. सुनीता पाटील'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm outline-none focus:ring-2 focus:ring-[#064E3B]"
              />
            </div>

            <button
              type="submit"
              disabled={loading || phone.trim().length !== 10}
              className="w-full mt-2 bg-[#EA580C] hover:bg-[#c2410c] text-white font-bold py-3.5 px-4 rounded-2xl text-sm shadow-md transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>OTP पाठवत आहे...</span>
                </>
              ) : (
                <>
                  <span>OTP मिळवा (Get OTP)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: 6-DIGIT OTP VERIFICATION */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="text-stone-500 block text-[11px]">OTP पाठवलेला क्रमांक:</span>
                <span className="font-bold text-stone-900 font-mono text-sm">+91 {phone}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtpDigits(['', '', '', '', '', '']);
                  setError('');
                }}
                className="text-[#064E3B] font-bold hover:underline text-xs"
              >
                बदला (Edit)
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-2 text-center">
                {t('६-अंकी OTP प्रविष्ट करा (Enter 6-Digit OTP)', 'Enter 6-Digit OTP')}
              </label>

              {/* 6 Individual OTP Boxes */}
              <div className="flex items-center justify-between gap-1.5 sm:gap-2" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpInputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-13 sm:w-13 sm:h-14 text-center text-xl font-black rounded-2xl border-2 border-stone-300 focus:border-[#064E3B] focus:ring-2 focus:ring-[#064E3B]/20 outline-none transition bg-stone-50 focus:bg-white text-stone-900 font-mono shadow-xs"
                  />
                ))}
              </div>
            </div>

            {/* Resend Timer / Action */}
            <div className="flex items-center justify-between text-xs pt-1 text-stone-500">
              <span>OTP आला नाही?</span>
              {canResend ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-[#064E3B] hover:text-emerald-900 font-bold flex items-center gap-1 hover:underline"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>पुन्हा OTP पाठवा (Resend)</span>
                </button>
              ) : (
                <span className="text-stone-400 font-mono">
                  पुन्हा पाठवा: {countdown} सेकंदात
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otpDigits.join('').length !== 6}
              className="w-full mt-2 bg-[#064E3B] hover:bg-[#053d2e] text-white font-bold py-3.5 px-4 rounded-2xl text-sm shadow-md transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>पडताळणी होत आहे...</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>पडताळणी करा व लॉगिन व्हा (Verify & Login)</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Security Trust Footer */}
        <div className="mt-5 pt-4 border-t border-stone-100 text-center text-[11px] text-stone-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>सुरक्षित 256-Bit SSL एनक्रिप्टेड ओटीपी प्रमाणीकरण</span>
        </div>
      </div>
    </div>
  );
};
