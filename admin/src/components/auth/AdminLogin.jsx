import React, { useState } from 'react';
import { adminApi } from '../../services/api';
import { ShieldCheck, Lock, Key, User, Eye, CheckCircle2, AlertCircle } from '../common/Icons';

export const AdminLogin = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin@yojanadut.in');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFillDemo = () => {
    setUsername('admin@yojanadut.in');
    setPassword('admin123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('कृपया ॲडमिन युझरनेम आणि पासवर्ड प्रविष्ट करा.');
      return;
    }

    setLoading(true);
    try {
      const res = await adminApi.login(username.trim(), password.trim());
      if (res.success) {
        onLoginSuccess(res.user);
      } else {
        setError(res.message || 'लॉगिन अयशस्वी झाले. कृपया क्रेडेंशियल्स तपासा.');
      }
    } catch {
      setError('सर्व्हरशी संपर्क होऊ शकला नाही. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-amber-500 selection:text-slate-900">
      {/* Background Decorative Mesh & Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-10 -right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar / Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-20 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-xl">
            य
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base tracking-tight">योजनादूत</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Admin Central
              </span>
            </div>
            <p className="text-[11px] text-slate-400">महाराष्ट्र शासन लोकसेवा हक्क अधिकृत पोर्टल</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>सुरक्षित एसएसएल एनक्रिप्शन (256-Bit SSL)</span>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10 my-6">
        <div className="w-full max-w-md">
          {/* Card Wrapper */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 backdrop-blur-xl relative">
            {/* Top Crest / Shield */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-indigo-500/20 border border-amber-500/30 text-amber-400 mb-3 shadow-inner">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">प्रशासक लॉगिन</h1>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                ग्राहक अर्ज व कागदपत्रे पडताळणी नियंत्रण कक्षामध्ये आपले स्वागत आहे.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ॲडमिन युझरनेम किंवा ईमेल
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin@yojanadut.in"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl text-sm text-white placeholder-slate-600 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  पासवर्ड (Security PIN)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl text-sm text-white placeholder-slate-600 transition-all outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 text-xs"
                    aria-label="Toggle password visibility"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Remember Me & Quick Help */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <span>सत्र लक्षात ठेवा (Remember)</span>
                </label>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-amber-400 hover:text-amber-300 font-medium underline underline-offset-4 decoration-amber-500/40"
                >
                  १-क्लिक डेमो भरा
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>प्रमाणीकरण होत आहे...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    <span>प्रशासकीय कक्षात प्रवेश करा</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials Info Box */}
            <div className="mt-6 pt-5 border-t border-slate-800/80">
              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 text-[11px] text-slate-400 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-slate-300 font-medium">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    डेमो क्रेडेंशियल्स (Instant Access):
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    Test Mode
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-300 pt-1 font-mono text-[10px]">
                  <div>
                    <span className="text-slate-500 block">आयडी:</span>
                    <code className="text-amber-300">admin@yojanadut.in</code>
                  </div>
                  <div>
                    <span className="text-slate-500 block">पासवर्ड:</span>
                    <code className="text-amber-300">admin123</code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Disclaimer footer under card */}
          <div className="text-center mt-4 text-[11px] text-slate-500">
            <span>🔒 हे पोर्टल उच्च सुरक्षेखाली आहे. सर्व ॲडमिन लॉग्स ऑडिट ट्रेलमध्ये नोंदवले जातात.</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-3 px-4 text-center text-xs text-slate-500">
        <p>© 2026 योजनादूत महा-सेवा कनेक्ट. सर्व हक्क राखीव. शासकीय दस्तऐवज पडताळणी सिस्टीम.</p>
      </footer>
    </div>
  );
};
