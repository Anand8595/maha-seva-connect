import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Phone,
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Key,
  RefreshCw,
} from '../common/Icons';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export const AuthModal = ({ isOpen, onClose, initialRole = 'user', initialMode = 'register' }) => {
  const { t } = useLanguage();
  const { login, register, sendOtp, verifyOtp } = useAuth();

  // Mode: 'register' | 'login'
  const [mode, setMode] = useState(initialMode || 'register');
  // Login method: 'password' | 'otp'
  const [loginMethod, setLoginMethod] = useState('password');

  // Role: 'user' (नागरिक) | 'agent' (योजना दूत)
  const [role, setRole] = useState(initialRole || 'user');

  // Registration Form Fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Password Login Fields
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // OTP Login Fields & State
  const [otpStep, setOtpStep] = useState(1); // 1: send OTP, 2: verify OTP
  const [otpPhone, setOtpPhone] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const otpInputRefs = useRef([]);
  const [serverOtp, setServerOtp] = useState('');
  const [smsBanner, setSmsBanner] = useState(null);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Common UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || 'register');
      setLoginMethod('password');
      setRole(initialRole || 'user');
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setRegPassword('');
      setShowRegPassword(false);
      setLoginPhone('');
      setLoginPassword('');
      setShowLoginPassword(false);
      setOtpPhone('');
      setOtpDigits(['', '', '', '', '', '']);
      setOtpStep(1);
      setError('');
      setSuccessMsg('');
      setShowRegisterPrompt(false);
      setSmsBanner(null);
    }
  }, [isOpen, initialRole, initialMode]);

  // Resend OTP Countdown
  useEffect(() => {
    let timer;
    if (mode === 'login' && loginMethod === 'otp' && otpStep === 2 && countdown > 0) {
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
  }, [mode, loginMethod, otpStep, countdown]);

  if (!isOpen) return null;

  // Handle Tab Switch
  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccessMsg('');
    setShowRegisterPrompt(false);
  };

  // 1. REGISTRATION HANDLER
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setShowRegisterPrompt(false);

    const cleanName = regName.trim();
    const cleanEmail = regEmail.trim();
    const cleanPhone = regPhone.trim().replace(/\D/g, '');
    const cleanPassword = regPassword.trim();

    if (!cleanName) {
      setError(t('कृपया आपले पूर्ण नाव प्रविष्ट करा.', 'Please enter your full name.'));
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError(t('कृपया वैध ईमेल पत्ता प्रविष्ट करा.', 'Please enter a valid email address.'));
      return;
    }

    if (cleanPhone.length !== 10) {
      setError(t('कृपया वैध १०-अंकी मोबाईल नंबर प्रविष्ट करा.', 'Please enter a valid 10-digit mobile number.'));
      return;
    }

    if (cleanPassword.length < 4) {
      setError(t('पासवर्ड किमान ४ अक्षरांचा असणे आवश्यक आहे.', 'Password must be at least 4 characters long.'));
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        password: cleanPassword,
        role,
      });

      if (res.success) {
        setSuccessMsg(t('नोंदणी यशस्वी झाली! स्वागत आहे.', 'Registration successful! Welcome.'));
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setError(res.message || t('नोंदणी अयशस्वी झाली. कृपया पुन्हा प्रयत्न करा.', 'Registration failed.'));
      }
    } catch {
      setError(t('सर्व्हरशी संपर्क होऊ शकला नाही. कृपया पुन्हा प्रयत्न करा.', 'Network error. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // 2. PHONE & PASSWORD LOGIN HANDLER
  const handlePasswordLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setShowRegisterPrompt(false);

    const cleanPhone = loginPhone.trim().replace(/\D/g, '');
    const cleanPassword = loginPassword.trim();

    if (cleanPhone.length !== 10) {
      setError(t('कृपया वैध १०-अंकी मोबाईल नंबर प्रविष्ट करा.', 'Please enter a valid 10-digit mobile number.'));
      return;
    }

    if (!cleanPassword) {
      setError(t('कृपया आपला पासवर्ड प्रविष्ट करा.', 'Please enter your password.'));
      return;
    }

    setLoading(true);
    try {
      const res = await login(cleanPhone, cleanPassword);
      if (res.success) {
        setSuccessMsg(t('लॉगिन यशस्वी झाले!', 'Login successful!'));
        setTimeout(() => {
          onClose();
        }, 700);
      } else {
        const msg = res.message || 'लॉगिन अयशस्वी.';
        setError(msg);
        // If user is not registered, highlight registration option
        if (msg.includes('नोंदणीकृत नाही') || msg.includes('Register') || msg.includes('नोंदणी')) {
          setShowRegisterPrompt(true);
        }
      }
    } catch {
      setError(t('सर्व्हरशी संपर्क होऊ शकला नाही. कृपया पुन्हा प्रयत्न करा.', 'Network error. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // 3. OTP LOGIN: Send OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    const cleanPhone = otpPhone.trim().replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError(t('कृपया वैध १०-अंकी मोबाईल नंबर प्रविष्ट करा.', 'Please enter a valid 10-digit mobile number.'));
      return;
    }

    setLoading(true);
    try {
      const res = await sendOtp(cleanPhone, role);
      if (res.success) {
        setServerOtp(res.otp || '');
        setOtpStep(2);
        setCountdown(30);
        setCanResend(false);
        setOtpDigits(['', '', '', '', '', '']);
        setSmsBanner({
          otp: res.otp,
          phone: cleanPhone,
          time: new Date().toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' }),
        });
        setTimeout(() => {
          if (otpInputRefs.current[0]) otpInputRefs.current[0].focus();
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

  // 3. OTP LOGIN: Verify OTP
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
      const cleanPhone = otpPhone.trim().replace(/\D/g, '');
      const res = await verifyOtp(cleanPhone, fullOtp, role);
      if (res.success) {
        setSuccessMsg(t('लॉगिन यशस्वी झाले!', 'Login successful!'));
        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        setError(res.message || t('प्रविष्ट केलेला OTP चुकीचा आहे.', 'Invalid OTP.'));
      }
    } catch {
      setError(t('पडताळणी करताना त्रुटी आली.', 'Error verifying OTP.'));
    } finally {
      setLoading(false);
    }
  };

  const handleOtpBoxChange = (index, value) => {
    const char = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);
    if (char && index < 5 && otpInputRefs.current[index + 1]) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  const handleOtpBoxKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0 && otpInputRefs.current[index - 1]) {
      otpInputRefs.current[index - 1].focus();
    }
  };

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
      if (otpInputRefs.current[nextFocus]) otpInputRefs.current[nextFocus].focus();
    }
  };

  const handleFillFromSms = () => {
    if (!serverOtp) return;
    const digits = serverOtp.split('').slice(0, 6);
    setOtpDigits(digits);
    if (otpInputRefs.current[5]) otpInputRefs.current[5].focus();
  };

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-7 shadow-2xl relative text-left animate-scaleUp overflow-hidden border border-stone-200 my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Brand Crest Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#EA580C] to-orange-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-orange-500/20 shrink-0">
            यो
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              {mode === 'register' ? t('नवीन नोंदणी (Registration)', 'New Registration') : t('खाते लॉगिन (Login)', 'Account Login')}
            </h2>
            <p className="text-xs text-stone-500">
              {t('महाराष्ट्र शासन योजनादूत सुरक्षित नागरिक पोर्टल', 'Official Maharashtra YojanaDut Portal')}
            </p>
          </div>
        </div>

        {/* Top Segmented Mode Switcher: Register vs Login */}
        <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-2xl mb-4 text-xs font-bold border border-stone-200">
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-[#064E3B] text-white shadow font-black'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>📝 {t('नवीन नोंदणी', 'Register')}</span>
          </button>
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-[#064E3B] text-white shadow font-black'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>🔑 {t('लॉगिन करा', 'Login')}</span>
          </button>
        </div>

        {/* Error / Alert Message */}
        {error && (
          <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="block leading-relaxed">{error}</span>
              {showRegisterPrompt && (
                <button
                  type="button"
                  onClick={() => {
                    setRegPhone(loginPhone);
                    switchMode('register');
                  }}
                  className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-[#064E3B] text-white rounded-lg font-bold text-[11px] hover:bg-emerald-900 transition shadow-xs"
                >
                  <span>येथे लगेच नोंदणी करा (Register Now)</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMsg && (
          <div className="p-3 mb-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{successMsg}</span>
          </div>
        )}

        {/* ==================================================================== */}
        {/* MODE 1: REGISTRATION FORM (Name, Email, Phone, Password, Role)       */}
        {/* ==================================================================== */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            {/* Role Toggle: Citizen vs Agent */}
            <div>
              <label className="text-[11px] font-bold text-stone-500 block mb-1">
                {t('नोंदणीचा प्रकार / भूमिका निवडा (Role):', 'Select Role:')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold text-left transition flex items-center gap-2 ${
                    role === 'user'
                      ? 'border-[#064E3B] bg-emerald-50/60 text-[#064E3B] ring-1 ring-[#064E3B]'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <User className="w-3.5 h-3.5 shrink-0" />
                  <div>
                    <span className="block font-black">{t('नागरिक', 'Citizen')}</span>
                    <span className="text-[10px] text-stone-500 block leading-tight font-normal">सेवा व योजनांसाठी</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('agent')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold text-left transition flex items-center gap-2 ${
                    role === 'agent'
                      ? 'border-[#064E3B] bg-emerald-50/60 text-[#064E3B] ring-1 ring-[#064E3B]'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <Key className="w-3.5 h-3.5 shrink-0 text-[#EA580C]" />
                  <div>
                    <span className="block font-black">{t('योजना दूत', 'Agent / Mitra')}</span>
                    <span className="text-[10px] text-stone-500 block leading-tight font-normal">कमवा व मदत करा</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                {t('पूर्ण नाव (Full Name) *', 'Full Name *')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder={t('उदा. अमोल रमेश पाटील', 'e.g. Amol Ramesh Patil')}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold text-stone-900 outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B] transition"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                {t('ईमेल पत्ता (Email Address) *', 'Email Address *')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="amol.patil@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold text-stone-900 outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B] transition"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                {t('मोबाईल क्रमांक (Mobile Number) *', 'Mobile Number *')}
              </label>
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500 font-bold text-xs">
                  <span>🇮🇳 +91</span>
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="98XXXXXXXX"
                  className="w-full pl-16 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold text-stone-900 outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B] tracking-wider transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                {t('पासवर्ड तयार करा (Password) *', 'Password *')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  minLength={4}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder={t('किमान ४ अक्षरे / अंकी पासवर्ड', 'Min 4 characters')}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold text-stone-900 outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B] transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  aria-label="Toggle password"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700"
                >
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Registration Submit Button */}
            <button
              type="submit"
              disabled={loading || !regName || !regEmail || regPhone.length !== 10 || regPassword.length < 4}
              className="w-full mt-2 bg-[#EA580C] hover:bg-[#c2410c] text-white font-bold py-3 px-4 rounded-2xl text-sm shadow-md transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>नोंदणी होत आहे...</span>
                </>
              ) : (
                <>
                  <span>{t('नोंदणी करा व खाते उघडा', 'Register & Create Account')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Footer switcher to Login */}
            <div className="text-center pt-2 text-xs text-stone-500">
              <span>{t('आधीच खाते आहे का?', 'Already have an account?')} </span>
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-[#064E3B] font-bold hover:underline"
              >
                {t('येथे लॉगिन करा (Login)', 'Login here')}
              </button>
            </div>
          </form>
        )}

        {/* ==================================================================== */}
        {/* MODE 2: LOGIN FORM (Phone & Password OR OTP)                          */}
        {/* ==================================================================== */}
        {mode === 'login' && (
          <div>
            {/* Sub-selector: Phone + Password (Primary) vs OTP (Secondary) */}
            <div className="flex items-center justify-between text-xs mb-3.5 pb-2 border-b border-stone-100">
              <span className="font-bold text-stone-600">
                {loginMethod === 'password' ? '🔐 पासवर्ड द्वारे लॉगिन' : '💬 मोबाईल OTP द्वारे लॉगिन'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setLoginMethod(loginMethod === 'password' ? 'otp' : 'password');
                  setError('');
                }}
                className="text-[#064E3B] font-bold hover:underline text-[11px]"
              >
                {loginMethod === 'password' ? 'OTP द्वारे लॉगिन करा →' : '← पासवर्ड द्वारे लॉगिन करा'}
              </button>
            </div>

            {/* SUB-MODE 2A: PHONE & PASSWORD LOGIN */}
            {loginMethod === 'password' && (
              <form onSubmit={handlePasswordLoginSubmit} className="space-y-3.5">
                {/* Phone Number */}
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    {t('नोंदणीकृत मोबाईल क्रमांक (Mobile Number) *', 'Registered Mobile Number *')}
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500 font-bold text-xs">
                      <span>🇮🇳 +91</span>
                    </div>
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="98XXXXXXXX"
                      className="w-full pl-16 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold text-stone-900 outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B] tracking-wider transition"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    {t('पासवर्ड (Password) *', 'Password *')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder={t('आपला पासवर्ड प्रविष्ट करा', 'Enter your password')}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold text-stone-900 outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B] transition font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      aria-label="Toggle password"
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Login Button */}
                <button
                  type="submit"
                  disabled={loading || loginPhone.length !== 10 || !loginPassword.trim()}
                  className="w-full mt-2 bg-[#064E3B] hover:bg-[#053d2e] text-white font-bold py-3 px-4 rounded-2xl text-sm shadow-md transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>लॉगिन होत आहे...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      <span>{t('लॉगिन करा (Login)', 'Login Now')}</span>
                    </>
                  )}
                </button>

                {/* Switch to Registration */}
                <div className="text-center pt-2 text-xs text-stone-500">
                  <span>{t('नवीन वापरकर्ता आहात का?', 'New user?')} </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (loginPhone) setRegPhone(loginPhone);
                      switchMode('register');
                    }}
                    className="text-[#EA580C] font-bold hover:underline"
                  >
                    {t('येथे नवीन नोंदणी करा (Register)', 'Register here')}
                  </button>
                </div>
              </form>
            )}

            {/* SUB-MODE 2B: OTP LOGIN (STEP 1: Enter Phone) */}
            {loginMethod === 'otp' && otpStep === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    {t('मोबाईल क्रमांक (Mobile Number) *', 'Mobile Number *')}
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500 font-bold text-xs">
                      <span>🇮🇳 +91</span>
                    </div>
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      value={otpPhone}
                      onChange={(e) => setOtpPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="98XXXXXXXX"
                      className="w-full pl-16 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold text-stone-900 outline-none focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B] tracking-wider transition"
                    />
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>या नंबरवर पडताळणीसाठी ६-अंकी OTP पाठवला जाईल.</span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || otpPhone.length !== 10}
                  className="w-full mt-2 bg-[#EA580C] hover:bg-[#c2410c] text-white font-bold py-3 px-4 rounded-2xl text-sm shadow-md transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>OTP पाठवत आहे...</span>
                    </>
                  ) : (
                    <>
                      <span>{t('OTP मिळवा (Get OTP)', 'Get OTP')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* SUB-MODE 2B: OTP LOGIN (STEP 2: Verify 6-digit OTP) */}
            {loginMethod === 'otp' && otpStep === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                {/* Live SMS banner */}
                {smsBanner && (
                  <div className="p-3 bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 border border-emerald-300 rounded-2xl shadow-xs text-xs text-emerald-950 animate-fadeIn">
                    <div className="flex items-center justify-between font-bold text-[11px] text-emerald-900 mb-1">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        📩 योजनादूत SMS अलर्ट
                      </span>
                      <span className="text-emerald-700 text-[10px]">{smsBanner.time}</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-relaxed font-mono">
                      लॉगिन OTP: <strong className="text-base text-emerald-950 font-black tracking-wider bg-white px-2 py-0.5 rounded border border-emerald-300">{smsBanner.otp}</strong> आहे.
                    </p>
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={handleFillFromSms}
                        className="text-[11px] font-bold text-white bg-[#064E3B] hover:bg-emerald-900 px-3 py-1 rounded-lg transition shadow-xs flex items-center gap-1"
                      >
                        <span>ऑटो-फिल करा (Auto-Fill)</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-stone-500 text-[11px]">क्रमांक:</span>
                    <span className="font-bold text-stone-900 font-mono ml-1">+91 {otpPhone}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep(1);
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
                    {t('६-अंकी OTP प्रविष्ट करा', 'Enter 6-Digit OTP')}
                  </label>
                  <div className="flex items-center justify-between gap-1.5" onPaste={handleOtpPaste}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpBoxChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpBoxKeyDown(idx, e)}
                        className="w-11 h-12 text-center text-lg font-black rounded-xl border-2 border-stone-300 focus:border-[#064E3B] focus:ring-2 focus:ring-[#064E3B]/20 outline-none transition bg-stone-50 focus:bg-white text-stone-900 font-mono shadow-xs"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 text-stone-500">
                  <span>OTP आला नाही?</span>
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-[#064E3B] hover:text-emerald-900 font-bold flex items-center gap-1 hover:underline"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>पुन्हा पाठवा (Resend)</span>
                    </button>
                  ) : (
                    <span className="text-stone-400 font-mono">पुन्हा पाठवा: {countdown}s</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || otpDigits.join('').length !== 6}
                  className="w-full mt-2 bg-[#064E3B] hover:bg-[#053d2e] text-white font-bold py-3 px-4 rounded-2xl text-sm shadow-md transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>पडताळणी होत आहे...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      <span>पडताळणी करा व लॉगिन व्हा</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Security Trust Footer */}
        <div className="mt-4 pt-3 border-t border-stone-100 text-center text-[11px] text-stone-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>सुरक्षित 256-Bit SSL एनक्रिप्टेड महाराष्ट्र शासन अधिकृत प्रणाली</span>
        </div>
      </div>
    </div>
  );
};
