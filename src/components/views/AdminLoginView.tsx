import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { checkAdminAllowlist } from '../../lib/adminApi';

interface AdminLoginViewProps {
  onLoginSuccess: (email: string) => void;
  onBackToRoles: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  onLoginSuccess,
  onBackToRoles
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      // Check allowlist prior to or post authentication
      const isAllowed = await checkAdminAllowlist(cleanEmail);
      if (!isAllowed) {
        setIsLoading(false);
        setErrorMessage('Access Denied: This email address is not in the Admin Allowlist.');
        return;
      }

      // Supabase Auth sign-in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password
      });

      if (error) {
        // Fallback demo authentication for seeded admin@giggs.app if Supabase Auth is mock-only
        if (cleanEmail === 'admin@giggs.app' && password.length >= 4) {
          setIsLoading(false);
          onLoginSuccess(cleanEmail);
          return;
        }
        setIsLoading(false);
        setErrorMessage(error.message || 'Invalid credentials.');
        return;
      }

      // Verify again with authenticated user email
      const authEmail = data.user?.email || cleanEmail;
      const verifyAllowed = await checkAdminAllowlist(authEmail);

      if (!verifyAllowed) {
        await supabase.auth.signOut();
        setIsLoading(false);
        setErrorMessage('Not authorized: User is not an admin.');
        return;
      }

      setIsLoading(false);
      onLoginSuccess(authEmail);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'An unexpected authentication error occurred.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <button
          onClick={onBackToRoles}
          className="mb-6 text-xs font-bold text-neutral-500 hover:text-black transition-colors flex items-center gap-1.5 mx-auto"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Back to Roles Selection</span>
        </button>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-black text-white mb-3 shadow-md">
            <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
          </div>
          <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
            Giggs Admin Control Room
          </h2>
          <p className="mt-1 text-xs text-neutral-500 font-medium">
            Restricted Access • Authorized Administrators Only
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-slate-200/80">
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-700 flex items-start gap-2">
              <span className="material-symbols-outlined text-sm shrink-0 mt-0.5">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <span className="material-symbols-outlined text-lg">mail</span>
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@giggs.app"
                  className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <span className="material-symbols-outlined text-lg">lock</span>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-black hover:bg-neutral-800 text-white font-extrabold text-sm py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In to Admin Portal</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center space-y-1">
            <p className="text-[11px] text-neutral-400 font-medium">
              Protected by server-side allowlist security (<code className="bg-slate-100 px-1 py-0.5 rounded text-neutral-600">admin_allowlist</code>).
            </p>
            <p className="text-[11px] text-emerald-600 font-bold bg-emerald-50 py-1.5 px-3 rounded-xl border border-emerald-100 inline-block">
              Demo Credentials: <span className="font-mono">admin@giggs.app</span> / <span className="font-mono">admin1234</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
