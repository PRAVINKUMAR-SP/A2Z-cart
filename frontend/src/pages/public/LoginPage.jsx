import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginWithCredentials } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleStandardLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const user = await loginWithCredentials({
        identifier: email.trim(),
        password: password.trim(),
      });

      if (!user) {
        throw new Error('No registered account found with this email or mobile number. Please register first.');
      }

      toast.success(`Welcome back, ${user.name || 'User'}!`);

      if (user.role === 'ROLE_ADMIN' || user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'ROLE_SELLER' || user.role === 'SELLER') {
        navigate('/seller/dashboard');
      } else {
        navigate('/shop');
      }
    } catch (err) {
      const cleanMsg = err.message || 'No registered account found with this email or mobile number. Please register first.';
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
              Sign in to your account
            </p>
          </div>
        </div>

        {/* Right Side: Attractive Sign In Form */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-center bg-white">
          <div className="space-y-1 mb-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit'] tracking-tight">
              Sign in to your account
            </h2>
            <p className="text-xs text-slate-500">
              Enter your credentials below to access your account
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span className="font-medium leading-relaxed">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleStandardLogin} className="space-y-4">
            {/* Email Address or Mobile Number */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 tracking-wide">
                Email Address or Mobile Number
              </label>
              <div className="relative group">
                <input
                  type="text"
                  required
                  placeholder="name@example.com or +91 98765 43210"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50/80 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 rounded-xl outline-none font-medium text-xs sm:text-sm text-slate-800 placeholder-slate-400 transition-all duration-200 shadow-2xs"
                />
                <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 absolute left-3.5 top-3.5 transition-colors" />
              </div>
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
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
                <span>Remember session</span>
              </label>
              <a
                href="#forgot"
                className="text-blue-600 font-bold hover:text-blue-700 hover:underline transition-colors"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Account'}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          {/* Footer Call-to-action */}
          <div className="text-center pt-5 border-t border-slate-100 text-xs text-slate-500 mt-5">
            <span>Don't have an account? </span>
            <Link
              to="/register"
              className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              Register now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
