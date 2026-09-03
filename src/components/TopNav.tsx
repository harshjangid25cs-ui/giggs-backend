import React, { useState } from 'react';
import { ScreenId, UserRole } from '../types';
import { ASSET_IMAGES } from '../data/mockData';
import { supabase } from '../lib/supabaseClient';

interface TopNavProps {
  currentScreen: ScreenId;
  currentRole: UserRole;
  currentUser?: { name: string; email?: string } | null;
  onNavigate: (screen: ScreenId, role?: UserRole) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentScreen,
  currentRole,
  currentUser,
  onNavigate
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Return avatar based on current role
  const getAvatar = () => {
    switch (currentRole) {
      case 'resident':
        return ASSET_IMAGES.residentAvatar;
      case 'society':
        return ASSET_IMAGES.staffAvatar;
      case 'worker':
        return ASSET_IMAGES.workerAvatar;
      case 'admin':
        return ASSET_IMAGES.adminProfileAvatar;
      default:
        return ASSET_IMAGES.residentAvatar;
    }
  };

  const getRoleLabel = () => {
    switch (currentRole) {
      case 'resident': return 'Resident View';
      case 'society':  return 'Society Admin';
      case 'worker':   return 'Worker View';
      case 'admin':    return 'Platform Ops';
    }
  };

  // Suppress on Welcome screen
  if (currentScreen === 'welcome') return null;

  return (
    <header
      className="fixed top-0 left-0 w-full z-40 bg-[#f9f9f9]/95 backdrop-blur-md border-b border-[#e2e2e2] flex items-center justify-between px-3 md:px-8"
      style={{ height: '56px', paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      {/* ── Left: Brand + Role Badge ── */}
      <div className="flex items-center gap-1.5 min-w-0">
        <button
          onClick={() => onNavigate(currentRole === 'resident' ? 'resident_home' : currentRole === 'society' ? 'society_dashboard' : currentRole === 'worker' ? 'worker_dashboard' : 'admin_overview')}
          className="flex items-center gap-1.5 shrink-0"
        >
          <span className="font-black tracking-tight text-xl text-black font-sans">GIGGS</span>
        </button>

        {/* Role badge — visible sm+ */}
        <div className="hidden sm:flex items-center gap-1.5 ml-1 px-2 py-0.5 bg-[#e2e2e2] text-[#1b1b1b] rounded-full text-[10px] font-semibold whitespace-nowrap shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
          <span>{getRoleLabel()}</span>
        </div>
      </div>

      {/* ── Right: Notifications + Avatar ── */}
      <div className="flex items-center gap-1 md:gap-2 shrink-0">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
            className="p-2 text-neutral-700 hover:bg-[#e2e2e2]/60 rounded-full transition-colors relative"
            style={{ minWidth: 44, minHeight: 44 }}
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ba1a1a] rounded-full ring-2 ring-[#f9f9f9]"></span>
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-fade-in"
              style={{ maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <h4 className="font-semibold text-xs text-slate-800 uppercase tracking-wider">Live Notifications</h4>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">3 New</span>
              </div>
              <div className="space-y-1 text-xs">
                {[
                  { title: 'Group deal unlock rate!', body: '12 / 15 neighbors joined AC repair in Green Valley.', screen: 'resident_home' as ScreenId, role: 'resident' as UserRole },
                  { title: 'New job in queue: 4A Sarah Jenkins', body: 'Urgent plumbing leak repair assigned.', screen: 'worker_queue' as ScreenId, role: 'worker' as UserRole },
                  { title: 'AI matching optimization ready', body: '12 high priority requests routed.', screen: 'admin_matching' as ScreenId, role: 'admin' as UserRole },
                ].filter(n => n.role === currentRole).map((n, i) => (
                  <div
                    key={i}
                    onClick={() => { onNavigate(n.screen, n.role); setShowNotifications(false); }}
                    className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors min-h-[44px] flex flex-col justify-center"
                  >
                    <p className="font-medium text-slate-900">{n.title}</p>
                    <p className="text-slate-500 text-[11px]">{n.body}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="mt-2 w-full text-center text-xs text-neutral-500 hover:text-black py-2 sm:hidden border-t border-slate-100"
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <div className="relative">
          <button
            onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
            className="w-8 h-8 rounded-full overflow-hidden border border-slate-300 hover:ring-2 hover:ring-black transition-all cursor-pointer block"
            style={{ minWidth: 44, minHeight: 44, padding: '6px' }}
            aria-label="Profile Menu"
          >
            <img
              src={getAvatar()}
              alt="User profile avatar"
              className="w-full h-full object-cover rounded-full"
            />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-fade-in">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <img src={getAvatar()} alt="User avatar" className="w-10 h-10 rounded-full object-cover border shrink-0" />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-slate-900 truncate">
                    {currentUser?.name || (currentRole === 'resident' ? 'Resident User'
                      : currentRole === 'society' ? 'Society Admin'
                      : currentRole === 'worker' ? 'Worker Pro'
                      : 'Ops Director')}
                  </h4>
                  <p className="text-xs text-slate-500 capitalize">{currentRole} account</p>
                </div>
              </div>
              <div className="pt-2 space-y-1 text-xs font-medium">
                <button
                  onClick={async () => { 
                    await supabase.auth.signOut();
                    onNavigate('welcome', currentRole); 
                    setShowProfileMenu(false); 
                  }}
                  className="w-full text-left px-2 py-2.5 hover:bg-slate-100 rounded-lg text-slate-700 flex items-center gap-2 min-h-[44px]"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  <span>Log Out</span>
                </button>
              </div>
              <button
                onClick={() => setShowProfileMenu(false)}
                className="mt-1 w-full text-center text-xs text-neutral-500 hover:text-black py-2 sm:hidden border-t border-slate-100"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
