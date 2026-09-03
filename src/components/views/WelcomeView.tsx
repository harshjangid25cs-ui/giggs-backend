import React, { useState } from 'react';
import { ScreenId, UserRole } from '../../types';
import { ASSET_IMAGES } from '../../data/mockData';
import { GiggsLogo } from '../ui/GiggsLogo';

interface WelcomeViewProps {
  onSelectRoleAndScreen: (screen: ScreenId, role: UserRole) => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({ onSelectRoleAndScreen }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('resident');

  const handleStart = () => {
    switch (selectedRole) {
      case 'resident':
        onSelectRoleAndScreen('resident_register', 'resident');
        break;
      case 'society':
        onSelectRoleAndScreen('society_register', 'society');
        break;
      case 'worker':
        onSelectRoleAndScreen('worker_register', 'worker');
        break;
      case 'admin':
        onSelectRoleAndScreen('admin_login', 'admin');
        break;
    }
  };

  const handleLoginClick = () => {
    if (selectedRole === 'resident') {
      onSelectRoleAndScreen('resident_login', 'resident');
    } else if (selectedRole === 'society') {
      onSelectRoleAndScreen('society_login', 'society');
    } else if (selectedRole === 'worker') {
      onSelectRoleAndScreen('worker_login', 'worker');
    } else {
      handleStart();
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f6] text-[#1b1b1b] flex flex-col items-center justify-start sm:justify-center px-3 py-4 sm:px-6 sm:py-8 font-sans antialiased overflow-x-hidden">
      
      {/* ── Top Logo Header on WebApp ── */}
      <header className="w-full max-w-md md:max-w-4xl mb-3 sm:mb-5 flex items-center justify-between px-2 pt-1">
        <GiggsLogo size="sm" showText textColor="dark" className="max-h-7" />
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-600 bg-neutral-200/80 px-2.5 py-1 rounded-full whitespace-nowrap">
            Society Marketplace
          </span>
        </div>
      </header>

      {/* ── Main Landing Card (Matching Figma & Mobile Design) ── */}
      <main className="w-full max-w-md md:max-w-4xl bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden flex flex-col md:grid md:grid-cols-2">
        
        {/* ── Hero Image Banner ── */}
        <div className="relative h-48 sm:h-56 md:h-full w-full shrink-0 overflow-hidden">
          <img
            alt="Worker delivering service to resident"
            className="w-full h-full object-cover object-center"
            src={ASSET_IMAGES.welcomeHero}
          />
          {/* Soft dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"></div>
          
          {/* Overlaid Title & Subtitle */}
          <div className="absolute bottom-4 left-5 right-5 text-white">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-xs">GIGGS</h2>
            <p className="text-xs sm:text-sm font-medium text-slate-200 leading-snug">
              Trusted local services for modern societies.
            </p>
          </div>
        </div>

        {/* ── Content & Role Selection Section ── */}
        <div className="p-4 sm:p-6 md:p-8 flex flex-col justify-between space-y-4">
          
          {/* Section Heading */}
          <div className="text-center">
            <p className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase">
              Choose Your Role
            </p>
          </div>

          {/* Role Options */}
          <div className="space-y-3">
            
            {/* 1. Resident Role Card */}
            <div
              onClick={() => setSelectedRole('resident')}
              className={`w-full rounded-2xl p-3.5 border-2 transition-all cursor-pointer ${
                selectedRole === 'resident'
                  ? 'border-black bg-white ring-1 ring-black/10 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-xl">person</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900 leading-tight">
                      I am a Resident
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Book services for your home
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-neutral-900 font-bold">
                  arrow_forward
                </span>
              </div>

              {/* Log In & Register Buttons when Resident is selected */}
              {selectedRole === 'resident' && (
                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2.5 animate-fade-in">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRoleAndScreen('resident_login', 'resident');
                    }}
                    className="w-full py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-neutral-900 flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-base">login</span>
                    <span>Log In</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRoleAndScreen('resident_register', 'resident');
                    }}
                    className="w-full py-2.5 px-3 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-base">grid_view</span>
                    <span>Register Flat</span>
                  </button>
                </div>
              )}
            </div>

            {/* 2. Society Management Card */}
            <div
              onClick={() => setSelectedRole('society')}
              className={`w-full rounded-2xl p-3.5 border transition-all cursor-pointer ${
                selectedRole === 'society'
                  ? 'border-2 border-black bg-white ring-1 ring-black/10 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-neutral-700 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-xl">apartment</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900 leading-tight">
                      I manage a Society
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Coordinate community services
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-neutral-900 font-bold">
                  arrow_forward
                </span>
              </div>

              {/* Log In & Register Buttons when Society is selected */}
              {selectedRole === 'society' && (
                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2.5 animate-fade-in">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRoleAndScreen('society_login', 'society');
                    }}
                    className="w-full py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-neutral-900 flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-base">login</span>
                    <span>Staff Log In</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRoleAndScreen('society_register', 'society');
                    }}
                    className="w-full py-2.5 px-3 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-base">badge</span>
                    <span>Register Staff</span>
                  </button>
                </div>
              )}
            </div>

            {/* 3. Worker Card */}
            <div
              onClick={() => setSelectedRole('worker')}
              className={`w-full rounded-2xl p-3.5 border transition-all cursor-pointer ${
                selectedRole === 'worker'
                  ? 'border-2 border-black bg-white ring-1 ring-black/10 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-neutral-700 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-xl">work</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900 leading-tight">
                      I am a Worker
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Find gigs and manage schedule
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-neutral-900 font-bold">
                  arrow_forward
                </span>
              </div>

              {/* Log In & Register Buttons when Worker is selected */}
              {selectedRole === 'worker' && (
                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2.5 animate-fade-in">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRoleAndScreen('worker_login', 'worker');
                    }}
                    className="w-full py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-neutral-900 flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-base">login</span>
                    <span>Pro Log In</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRoleAndScreen('worker_register', 'worker');
                    }}
                    className="w-full py-2.5 px-3 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-base">engineering</span>
                    <span>Register Worker</span>
                  </button>
                </div>
              )}
            </div>

            {/* 4. Admin Card */}
            <div
              onClick={() => setSelectedRole('admin')}
              className={`w-full rounded-2xl p-3.5 border transition-all cursor-pointer ${
                selectedRole === 'admin'
                  ? 'border-2 border-black bg-white ring-1 ring-black/10 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-neutral-700 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900 leading-tight">
                      Admin Control Room
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Verify workers & platform settings
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-neutral-900 font-bold">
                  arrow_forward
                </span>
              </div>

              {/* Log In Button when Admin is selected */}
              {selectedRole === 'admin' && (
                <div className="mt-3 pt-3 border-t border-slate-100 animate-fade-in">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRoleAndScreen('admin_login', 'admin');
                    }}
                    className="w-full py-2.5 px-3 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-base">lock</span>
                    <span>Admin Restricted Login</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={handleStart}
            className="w-full bg-black hover:bg-neutral-800 text-white font-bold text-base py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>Get Started</span>
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>

          {/* Footer Link */}
          <p className="text-center text-xs text-neutral-500 pt-0.5">
            Already registered?{' '}
            <button
              onClick={handleLoginClick}
              className="text-neutral-900 font-bold hover:underline"
            >
              Log In
            </button>
          </p>

        </div>

      </main>
    </div>
  );
};
