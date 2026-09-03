import React, { useState, useEffect } from 'react';
import { ScreenId } from '../../types';
import { supabase } from '../../lib/supabaseClient';

interface AdminShellProps {
  activeView: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  adminEmail?: string;
  children: React.ReactNode;
}

interface PlatformStats {
  total_workers: number;
  verified_workers: number;
  pending_workers: number;
  suspended_workers: number;
  total_residents: number;
  total_societies: number;
  total_services: number;
  total_bookings: number;
}

const NAV_ITEMS: { id: ScreenId; icon: string; label: string; group: string }[] = [
  // Operations
  { id: 'admin_overview', icon: 'dashboard', label: 'Dashboard', group: 'Operations' },
  { id: 'admin_verification_queue', icon: 'how_to_reg', label: 'Verification Queue', group: 'Operations' },
  { id: 'admin_worker_directory', icon: 'badge', label: 'Worker Directory', group: 'Operations' },
  // Platform
  { id: 'admin_skills', icon: 'construction', label: 'Skills & Services', group: 'Platform' },
  { id: 'admin_residents', icon: 'apartment', label: 'Societies & Residents', group: 'Platform' },
  // AI
  { id: 'admin_matching', icon: 'hub', label: 'AI Matching Engine', group: 'Intelligence' },
  { id: 'admin_forecasting', icon: 'trending_up', label: 'Demand Forecasting', group: 'Intelligence' },
];

export const AdminShell: React.FC<AdminShellProps> = ({
  activeView,
  onNavigate,
  adminEmail,
  children
}) => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  useEffect(() => {
    loadStats();
  }, [activeView]);

  const loadStats = async () => {
    try {
      const { data, error } = await (supabase as any).rpc('get_admin_platform_stats');
      if (!error && data) setStats(data);
    } catch {
      const [workers, residents, societies, services] = await Promise.all([
        supabase.from('workers').select('id, verification_status'),
        supabase.from('users').select('id').eq('role', 'resident'),
        supabase.from('societies').select('id'),
        supabase.from('services').select('id'),
      ]);
      const wData = (workers.data || []);
      setStats({
        total_workers: wData.length,
        verified_workers: wData.filter((w: any) => w.verification_status === 'VERIFIED').length,
        pending_workers: wData.filter((w: any) => w.verification_status === 'PENDING').length,
        suspended_workers: wData.filter((w: any) => w.verification_status === 'SUSPENDED').length,
        total_residents: (residents.data || []).length,
        total_societies: (societies.data || []).length,
        total_services: (services.data || []).length,
        total_bookings: 0,
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onNavigate('welcome');
  };

  const groups = Array.from(new Set(NAV_ITEMS.map(i => i.group)));
  const currentNav = NAV_ITEMS.find(n => n.id === activeView);

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden font-sans border-t border-white/10">
      {/* ── SIDEBAR (MONOCHROME BLACK & WHITE) ── */}
      <aside
        className={`flex flex-col shrink-0 border-r border-white/10 bg-[#000000] transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Logo Row */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${sidebarCollapsed ? 'justify-center' : ''}`}>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center shrink-0 shadow-sm">
                <span className="font-black text-sm tracking-tighter">G</span>
              </div>
              <div className="min-w-0">
                <p className="font-black text-sm text-white tracking-wider leading-none uppercase">GIGGS</p>
                <p className="text-[9px] text-neutral-400 font-mono leading-none mt-1 uppercase tracking-widest">Admin Control</p>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center">
              <span className="font-black text-xs">G</span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all shrink-0"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className="material-symbols-outlined text-base">
              {sidebarCollapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>
        </div>

        {/* Platform Stats Chips - Black & White / Red for Alerts */}
        {!sidebarCollapsed && stats && (
          <div className="px-3 pt-3 pb-3 border-b border-white/10 grid grid-cols-2 gap-2">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-center">
              <p className="text-white font-black text-lg leading-none">{stats.verified_workers}</p>
              <p className="text-neutral-400 text-[9px] font-mono uppercase tracking-wider mt-1">Active</p>
            </div>
            <div className={`border rounded-xl p-2.5 text-center ${stats.pending_workers > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-neutral-900 border-neutral-800'}`}>
              <p className={`font-black text-lg leading-none ${stats.pending_workers > 0 ? 'text-red-500' : 'text-white'}`}>{stats.pending_workers}</p>
              <p className={`text-[9px] font-mono uppercase tracking-wider mt-1 ${stats.pending_workers > 0 ? 'text-red-400 font-bold' : 'text-neutral-400'}`}>Pending</p>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-center">
              <p className="text-white font-black text-lg leading-none">{stats.total_residents}</p>
              <p className="text-neutral-400 text-[9px] font-mono uppercase tracking-wider mt-1">Users</p>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-center">
              <p className="text-white font-black text-lg leading-none">{stats.total_societies}</p>
              <p className="text-neutral-400 text-[9px] font-mono uppercase tracking-wider mt-1">Societies</p>
            </div>
          </div>
        )}

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
          {groups.map(group => (
            <div key={group}>
              {!sidebarCollapsed && (
                <p className="text-[9px] font-mono uppercase tracking-widest text-neutral-400 px-2 mb-1.5">{group}</p>
              )}
              <div className="space-y-1">
                {NAV_ITEMS.filter(n => n.group === group).map(item => {
                  const isActive = activeView === item.id;
                  const isPendingQueue = item.id === 'admin_verification_queue' && stats && stats.pending_workers > 0;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all relative ${
                        isActive
                          ? 'bg-white text-black font-extrabold shadow-md'
                          : 'text-neutral-300 hover:text-white hover:bg-neutral-900 border border-transparent'
                      } ${sidebarCollapsed ? 'justify-center' : ''}`}
                    >
                      <span className={`material-symbols-outlined text-[18px] shrink-0 ${isActive ? 'text-black' : 'text-neutral-400'}`}>
                        {item.icon}
                      </span>
                      {!sidebarCollapsed && (
                        <>
                          <span className="text-xs font-semibold leading-none">{item.label}</span>
                          {isPendingQueue && (
                            <span className="ml-auto px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-mono font-bold shrink-0 animate-pulse">
                              {stats!.pending_workers}
                            </span>
                          )}
                        </>
                      )}
                      {sidebarCollapsed && isPendingQueue && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Admin User Footer */}
        <div className={`border-t border-white/10 p-3 bg-black ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white text-black border border-neutral-300 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{adminEmail || 'admin@giggs.app'}</p>
                <p className="text-[10px] text-neutral-400 font-mono">SUPER ADMIN</p>
              </div>
              <button
                onClick={() => setShowSignOutConfirm(true)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                title="Sign out"
              >
                <span className="material-symbols-outlined text-base">logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSignOutConfirm(true)}
              className="p-2 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
              title="Sign out"
            >
              <span className="material-symbols-outlined text-base">logout</span>
            </button>
          )}
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#050505]">
        {/* Top Bar (Pure Black & White with Red Alerts) */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-black/90 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-black text-sm text-white tracking-wide uppercase leading-tight">
                {currentNav?.label || 'Admin Control Room'}
              </h1>
              <p className="text-[11px] text-neutral-400 font-mono">
                Giggs System Control
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Indicator */}
            <div className="flex items-center gap-2 px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span className="text-[10px] font-mono font-bold text-white tracking-widest uppercase">SYSTEM LIVE</span>
            </div>

            {/* Pending Alert Badge - RED ONLY */}
            {stats && stats.pending_workers > 0 && (
              <button
                onClick={() => onNavigate('admin_verification_queue')}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-red-600/10 border border-red-500/40 rounded-lg hover:bg-red-600/20 transition-all"
              >
                <span className="material-symbols-outlined text-sm text-red-500">warning</span>
                <span className="text-[11px] font-mono font-bold text-red-500 uppercase tracking-wider">
                  ALERT: {stats.pending_workers} PENDING REVIEW
                </span>
              </button>
            )}

            <button
              onClick={loadStats}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
              title="Refresh platform data"
            >
              <span className="material-symbols-outlined text-base">refresh</span>
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#050505]">
          {children}
        </main>
      </div>

      {/* Sign Out Confirmation Modal */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-black border border-white/20 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-xl">logout</span>
            </div>
            <h3 className="font-black text-white text-lg mb-1">Sign Out of Admin Portal?</h3>
            <p className="text-neutral-400 text-xs mb-6 font-mono">Your administrative session will be terminated immediately.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="px-4 py-2.5 rounded-xl border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-900 font-bold text-xs transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs transition-all shadow-lg shadow-red-600/20"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
