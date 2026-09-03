import React, { useState } from 'react';
import { ScreenId, UserRole } from '../../types';
import { supabase } from '../../lib/supabaseClient';

interface ResidentLoginViewProps {
  onNavigate: (screen: ScreenId, role?: UserRole) => void;
  onLoginSuccess: (emailOrPhone: string) => boolean | void;
}

export const ResidentLoginView: React.FC<ResidentLoginViewProps> = ({
  onNavigate,
  onLoginSuccess
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const isNumeric = /^\d+$/.test(identifier.replace(/\D/g, '')) && !identifier.includes('@') && !/[a-zA-Z]/.test(identifier);
    const cleanId = isNumeric ? `+91 ${identifier.replace(/\D/g, '').slice(0, 10)}` : identifier;
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(cleanId);
    }, 400);
  };



  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
      // Note: This will redirect the page to Google. The actual login success
      // needs to be handled when the app reloads and catches the session in App.tsx
    } catch (error) {
      console.error('Google login error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1b1c1c] flex flex-col items-center justify-center px-4 py-8 md:py-12">
      {/* Header Bar */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between">
        <button
          onClick={() => onNavigate('welcome', 'resident')}
          className="flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-black transition-colors group"
        >
          <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">
            arrow_back
          </span>
          <span>Back to Roles</span>
        </button>
        <span className="text-xs font-semibold px-2.5 py-1 bg-black text-white rounded-full">
          Resident Portal
        </span>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Top Banner Accent */}
        <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-black p-6 text-white relative">
          <div className="absolute top-4 right-4 text-white/20">
            <span className="material-symbols-outlined text-6xl">home_app_logo</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mb-1">Welcome Back</h1>
          <p className="text-xs text-neutral-300">
            Log in to your registered resident account to access society deals & services.
          </p>
        </div>

        {/* Form Content */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Continue with Google */}
          <div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white hover:bg-neutral-50 text-neutral-800 font-bold py-3 px-4 rounded-xl border border-slate-300 shadow-xs hover:shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-3 text-sm"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center justify-center text-xs mt-5 mb-1">
              <div className="border-t border-slate-200 w-full"></div>
              <span className="bg-white px-3 text-neutral-400 font-semibold uppercase tracking-wider shrink-0 absolute">
                or sign in with credentials
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone or Email */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                Mobile Number or Email
              </label>
              <div className="flex rounded-xl border border-slate-300 bg-neutral-50 overflow-hidden focus-within:bg-white focus-within:ring-2 focus-within:ring-black focus-within:border-transparent transition-all">
                {(/^\d/.test(identifier) || identifier === '') && (
                  <span className="inline-flex items-center px-3.5 bg-neutral-200 border-r border-slate-300 text-sm font-extrabold text-neutral-700 select-none">
                    +91
                  </span>
                )}
                {(!/^\d/.test(identifier) && identifier !== '') && (
                  <div className="pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <span className="material-symbols-outlined text-lg">person</span>
                  </div>
                )}
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d/.test(val)) {
                      setIdentifier(val.replace(/\D/g, '').slice(0, 10));
                    } else {
                      setIdentifier(val);
                    }
                  }}
                  placeholder="9876543210 or email"
                  className="w-full px-3.5 py-3 bg-transparent text-sm font-medium focus:outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                  Password / Passcode
                </label>
                <button
                  type="button"
                  onClick={() => alert('Demo Mode: Use default password123 or instant demo login button below.')}
                  className="text-xs text-neutral-500 hover:text-black font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <span className="material-symbols-outlined text-lg">lock</span>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-neutral-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-700"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me Toggle */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-neutral-700 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-black focus:ring-black border-slate-300"
                />
                Keep me signed in on this device
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black hover:bg-neutral-800 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all hover:shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 text-sm mt-4 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Log In to Resident Account</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </button>
          </form>


          {/* Switch to Registration */}
          <div className="pt-2 text-center text-xs text-neutral-500">
            Don't have a registered resident account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('resident_register', 'resident')}
              className="text-black font-extrabold hover:underline"
            >
              Register Flat / Residence
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
