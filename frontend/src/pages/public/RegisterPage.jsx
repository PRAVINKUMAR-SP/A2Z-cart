import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Phone, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { registerUser } = useAuthStore();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle strictly numbers only and max 10 digits
  const handlePhoneChange = (e) => {
    const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setForm((prev) => ({ ...prev, phone: onlyDigits }));
  };

  const handlePhoneKeyDown = (e) => {
    // Allow navigation and editing keys
    if (
      ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key) ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }
    // Block any non-digit keypress
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePhonePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const onlyDigits = pasted.replace(/\D/g, '').slice(0, 10);
    setForm((prev) => ({ ...prev, phone: onlyDigits }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Strict 10-digit validation
    const cleanPhone = form.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      const msg = 'Please enter a valid 10-digit mobile number.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setIsLoading(true);

    try {
      const user = await registerUser({
        name: form.name,
        email: form.email,
        phone: cleanPhone,
        password: form.password,
      });

      if (!user) {
        throw new Error('Registration failed. Please check your details.');
      }

      const welcomeMsg = `Account created successfully! Welcome, ${user.name || 'User'}`;
      setSuccessMessage(welcomeMsg);
      toast.success(welcomeMsg);

      setTimeout(() => {
        if (user.role === 'ROLE_ADMIN' || user.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else if (user.role === 'ROLE_SELLER' || user.role === 'SELLER') {
          navigate('/seller/dashboard');
        } else {
          navigate('/shop');
        }
      }, 700);
    } catch (err) {
      const cleanMsg = err.message || 'Registration failed. Please check your details.';
      setErrorMessage(cleanMsg);
      toast.error(cleanMsg);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
      {/* Decorative Gradient Background Auras */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main 2-Column Split Container */}
      <div className="w-full max-w-[740px] bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-indigo-950/10 overflow-hidden grid grid-cols-1 md:grid-cols-12 relative z-10">
        
        {/* Left Side: Clean Branded Welcome Showcase */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950 text-white p-6 sm:p-8 flex flex-col justify-center relative overflow-hidden">
          {/* Ambient decorative glowing bubbles */}
          <div className="absolute -top-16 -left-16 w-56 h-56 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Center Welcome Copy */}
          <div className="relative z-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black font-['Outfit'] text-white tracking-tight leading-[1.15]">
              Welcome to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-300">
                A2Z~cart
              </span>
            </h2>
            <p className="text-sm sm:text-base font-bold text-slate-200 font-['Outfit'] pt-0.5">
              Create your account
            </p>
          </div>
        </div>

        {/* Right Side: Attractive Registration Form */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-center bg-white">
          <div className="space-y-1 mb-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit'] tracking-tight">
              Create your account
            </h2>
            <p className="text-xs text-slate-500">
              Fill in your details below to get started in seconds
            </p>
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span className="font-medium leading-relaxed">{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
              <span className="font-medium leading-relaxed">{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 tracking-wide">
                Full Name
              </label>
              <div className="relative group">
                <input
                  type="text"
                  required
                  placeholder="Rahul Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50/80 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 rounded-xl outline-none font-medium text-xs sm:text-sm text-slate-800 placeholder-slate-400 transition-all duration-200 shadow-2xs"
                />
                <User className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 absolute left-3.5 top-3.5 transition-colors" />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 tracking-wide">
                Email Address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  required
                  placeholder="rahul@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50/80 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 rounded-xl outline-none font-medium text-xs sm:text-sm text-slate-800 placeholder-slate-400 transition-all duration-200 shadow-2xs"
                />
                <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 absolute left-3.5 top-3.5 transition-colors" />
              </div>
            </div>

            {/* Mobile Number (10 Digits Only) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 tracking-wide">
                  Mobile Number
                </label>
                <span
                  className={`text-[11px] font-semibold transition-colors ${
                    form.phone.length === 10 ? 'text-emerald-600 font-bold' : 'text-slate-400'
                  }`}
                >
                  {form.phone.length}/10 digits
                </span>
              </div>
              <div className="relative group flex items-center">
                {/* Country Code & Icon */}
                <div className="absolute left-3.5 flex items-center gap-1.5 pointer-events-none select-none z-10">
                  <Phone className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <span className="text-xs font-bold text-slate-700 pl-0.5 pr-2 border-r border-slate-300">
                    +91
                  </span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  required
                  maxLength={10}
                  pattern="[0-9]{10}"
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={handlePhoneChange}
                  onKeyDown={handlePhoneKeyDown}
                  onPaste={handlePhonePaste}
                  className="w-full pl-[76px] pr-4 py-3 bg-slate-50/80 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 rounded-xl outline-none font-medium text-xs sm:text-sm text-slate-800 placeholder-slate-400 tracking-wider transition-all duration-200 shadow-2xs"
                />
              </div>
              <p className="text-[10px] text-slate-400">
                Enter your 10-digit mobile number without country code or spaces
              </p>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 tracking-wide">
                Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-11 py-3 bg-slate-50/80 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 rounded-xl outline-none font-medium text-xs sm:text-sm text-slate-800 placeholder-slate-400 transition-all duration-200 shadow-2xs"
                />
                <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 absolute left-3.5 top-3.5 transition-colors" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors p-0.5 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Terms notice */}
            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
              By creating an account, you agree to A2Z~cart's{' '}
              <a href="#terms" className="text-blue-600 hover:underline font-semibold">Terms of Service</a>{' '}
              and{' '}
              <a href="#privacy" className="text-blue-600 hover:underline font-semibold">Privacy Policy</a>.
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer disabled:opacity-70 group"
            >
              <span>{isLoading ? 'Creating Account...' : 'Create Free Account'}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          {/* Footer Call-to-action */}
          <div className="text-center pt-5 border-t border-slate-100 text-xs text-slate-500 mt-5">
            <span>Already have an account? </span>
            <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
