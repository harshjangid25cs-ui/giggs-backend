import React from 'react';
import { ScreenId, UserRole } from '../types';

interface BottomNavProps {
  currentScreen: ScreenId;
  currentRole: UserRole;
  onNavigate: (screen: ScreenId, role?: UserRole) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  currentRole,
  onNavigate
}) => {
  // Check if transactional screen where bottom nav is suppressed
  const suppressedScreens: ScreenId[] = [
    'welcome',
    'resident_checkout',
    'resident_emergency',
    'resident_rate',
    'resident_claim',
    'society_new_visit'
  ];

  if (suppressedScreens.includes(currentScreen)) {
    return null;
  }

  // Resident Tabs
  if (currentRole === 'resident') {
    return (
      <nav className="fixed bottom-0 left-0 w-full z-40 md:hidden flex justify-around items-end bg-[#f9f9f9]/95 backdrop-blur-md border-t border-[#e2e2e2] shadow-sm"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}>
        <button
          onClick={() => onNavigate('resident_home', 'resident')}
          className={`flex flex-col items-center justify-center px-4 py-1.5 transition-all ${
            currentScreen === 'resident_home'
              ? 'bg-[#e2e2e2] text-[#1b1b1b] rounded-full scale-95 font-semibold'
              : 'text-[#4c4546] hover:text-black'
          }`}
        >
          <span className={`material-symbols-outlined text-xl ${currentScreen === 'resident_home' ? 'fill' : ''}`}>
            home
          </span>
          <span className="text-[11px] mt-0.5">Home</span>
        </button>

        <button
          onClick={() => onNavigate('resident_invite', 'resident')}
          className={`flex flex-col items-center justify-center px-4 py-1.5 transition-all ${
            currentScreen === 'resident_invite'
              ? 'bg-[#e2e2e2] text-[#1b1b1b] rounded-full scale-95 font-semibold'
              : 'text-[#4c4546] hover:text-black'
          }`}
        >
          <span className={`material-symbols-outlined text-xl ${currentScreen === 'resident_invite' ? 'fill' : ''}`}>
            work
          </span>
          <span className="text-[11px] mt-0.5">Gigs</span>
        </button>

        <button
          onClick={() => onNavigate('resident_emergency', 'resident')}
          className={`flex flex-col items-center justify-center px-4 py-1.5 transition-all ${
            currentScreen === 'resident_emergency'
              ? 'bg-red-100 text-red-700 rounded-full scale-95 font-semibold'
              : 'text-[#4c4546] hover:text-red-700'
          }`}
        >
          <span className="material-symbols-outlined text-xl text-red-600">
            emergency
          </span>
          <span className="text-[11px] mt-0.5 text-red-600 font-semibold">Alerts</span>
        </button>

        <button
          onClick={() => onNavigate('resident_checkout', 'resident')}
          className={`flex flex-col items-center justify-center px-4 py-1.5 transition-all ${
            currentScreen === 'resident_checkout'
              ? 'bg-[#e2e2e2] text-[#1b1b1b] rounded-full scale-95 font-semibold'
              : 'text-[#4c4546] hover:text-black'
          }`}
        >
          <span className={`material-symbols-outlined text-xl ${currentScreen === 'resident_checkout' ? 'fill' : ''}`}>
            person
          </span>
          <span className="text-[11px] mt-0.5">Profile</span>
        </button>
      </nav>
    );
  }

  // Society Tabs
  if (currentRole === 'society') {
    return (
      <nav className="fixed bottom-0 left-0 w-full z-40 md:hidden flex justify-around items-center h-20 pb-safe bg-[#f9f9f9]/95 backdrop-blur-md border-t border-[#e2e2e2] shadow-sm">
        <button
          onClick={() => onNavigate('society_dashboard', 'society')}
          className={`flex flex-col items-center justify-center px-4 py-1.5 transition-all ${
            currentScreen === 'society_dashboard'
              ? 'bg-[#e2e2e2] text-[#1b1b1b] rounded-full scale-95 font-semibold'
              : 'text-[#4c4546] hover:text-black'
          }`}
        >
          <span className={`material-symbols-outlined text-xl ${currentScreen === 'society_dashboard' ? 'fill' : ''}`}>
            home
          </span>
          <span className="text-[11px] mt-0.5">Home</span>
        </button>

        <button
          onClick={() => onNavigate('society_new_visit', 'society')}
          className="flex flex-col items-center justify-center px-4 py-1.5 text-[#4c4546] hover:text-black"
        >
          <span className="material-symbols-outlined text-xl">add_circle</span>
          <span className="text-[11px] mt-0.5">New Visit</span>
        </button>
      </nav>
    );
  }

  // Worker Tabs
  if (currentRole === 'worker') {
    return (
      <nav className="fixed bottom-0 left-0 w-full z-40 md:hidden flex justify-around items-center h-20 pb-safe bg-[#f9f9f9]/95 backdrop-blur-md border-t border-[#e2e2e2] shadow-sm">
        <button
          onClick={() => onNavigate('worker_dashboard', 'worker')}
          className={`flex flex-col items-center justify-center px-3 py-1 transition-all ${
            currentScreen === 'worker_dashboard'
              ? 'bg-[#e2e2e2] text-[#1b1b1b] rounded-full scale-95 font-semibold'
              : 'text-[#4c4546] hover:text-black'
          }`}
        >
          <span className={`material-symbols-outlined text-xl ${currentScreen === 'worker_dashboard' ? 'fill' : ''}`}>
            home
          </span>
          <span className="text-[11px] mt-0.5">Home</span>
        </button>

        <button
          onClick={() => onNavigate('worker_queue', 'worker')}
          className={`flex flex-col items-center justify-center px-3 py-1 transition-all ${
            currentScreen === 'worker_queue'
              ? 'bg-[#e2e2e2] text-[#1b1b1b] rounded-full scale-95 font-semibold'
              : 'text-[#4c4546] hover:text-black'
          }`}
        >
          <span className={`material-symbols-outlined text-xl ${currentScreen === 'worker_queue' ? 'fill' : ''}`}>
            work
          </span>
          <span className="text-[11px] mt-0.5">Queue</span>
        </button>

        <button
          onClick={() => onNavigate('worker_welfare', 'worker')}
          className={`flex flex-col items-center justify-center px-3 py-1 transition-all ${
            currentScreen === 'worker_welfare'
              ? 'bg-[#e2e2e2] text-[#1b1b1b] rounded-full scale-95 font-semibold'
              : 'text-[#4c4546] hover:text-black'
          }`}
        >
          <span className={`material-symbols-outlined text-xl ${currentScreen === 'worker_welfare' ? 'fill' : ''}`}>
            shield
          </span>
          <span className="text-[11px] mt-0.5">Welfare</span>
        </button>

        <button
          onClick={() => onNavigate('worker_earnings', 'worker')}
          className={`flex flex-col items-center justify-center px-3 py-1 transition-all ${
            currentScreen === 'worker_earnings'
              ? 'bg-[#e2e2e2] text-[#1b1b1b] rounded-full scale-95 font-semibold'
              : 'text-[#4c4546] hover:text-black'
          }`}
        >
          <span className={`material-symbols-outlined text-xl ${currentScreen === 'worker_earnings' ? 'fill' : ''}`}>
            payments
          </span>
          <span className="text-[11px] mt-0.5">Earnings</span>
        </button>
      </nav>
    );
  }

  // Admin / Operations Tabs
  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 md:hidden flex justify-around items-center h-20 pb-safe bg-[#f9f9f9]/95 backdrop-blur-md border-t border-[#e2e2e2] shadow-sm">
      <button
        onClick={() => onNavigate('admin_overview', 'admin')}
        className={`flex flex-col items-center justify-center px-2 py-1 transition-all ${
          currentScreen === 'admin_overview'
            ? 'bg-[#e2e2e2] text-[#1b1b1b] rounded-full scale-95 font-semibold'
            : 'text-[#4c4546]'
        }`}
      >
        <span className="material-symbols-outlined text-xl">home</span>
        <span className="text-[10px] mt-0.5 font-medium">Home</span>
      </button>

      <button
        onClick={() => onNavigate('admin_verification_queue', 'admin')}
        className={`flex flex-col items-center justify-center px-2 py-1 transition-all ${
          currentScreen === 'admin_verification_queue'
            ? 'bg-[#e2e2e2] text-[#1b1b1b] rounded-full scale-95 font-semibold'
            : 'text-[#4c4546]'
        }`}
      >
        <span className="material-symbols-outlined text-xl">verified_user</span>
        <span className="text-[10px] mt-0.5 font-medium">Verify</span>
      </button>

      <button
        onClick={() => onNavigate('admin_worker_directory', 'admin')}
        className={`flex flex-col items-center justify-center px-2 py-1 transition-all ${
          currentScreen === 'admin_worker_directory'
            ? 'bg-[#e2e2e2] text-[#1b1b1b] rounded-full scale-95 font-semibold'
            : 'text-[#4c4546]'
        }`}
      >
        <span className="material-symbols-outlined text-xl">badge</span>
        <span className="text-[10px] mt-0.5 font-medium">Workers</span>
      </button>

      <button
        onClick={() => onNavigate('admin_skills', 'admin')}
        className={`flex flex-col items-center justify-center px-2 py-1 transition-all ${
          currentScreen === 'admin_skills'
            ? 'bg-[#e2e2e2] text-[#1b1b1b] rounded-full scale-95 font-semibold'
            : 'text-[#4c4546]'
        }`}
      >
        <span className="material-symbols-outlined text-xl">construction</span>
        <span className="text-[10px] mt-0.5 font-medium">Skills</span>
      </button>

      <button
        onClick={() => onNavigate('admin_residents', 'admin')}
        className={`flex flex-col items-center justify-center px-2 py-1 transition-all ${
          currentScreen === 'admin_residents'
            ? 'bg-[#e2e2e2] text-[#1b1b1b] rounded-full scale-95 font-semibold'
            : 'text-[#4c4546]'
        }`}
      >
        <span className="material-symbols-outlined text-xl">apartment</span>
        <span className="text-[10px] mt-0.5 font-medium">Societies</span>
      </button>
    </nav>
  );
};
