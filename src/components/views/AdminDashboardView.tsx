import React, { useState, useEffect } from 'react';
import { ScreenId } from '../../types';
import { supabase } from '../../lib/supabaseClient';

interface AdminDashboardViewProps {
  onNavigate: (screen: ScreenId) => void;
  adminEmail?: string;
}

interface StatCard {
  label: string;
  value: number | string;
  icon: string;
  isAlert?: boolean;
  screen?: ScreenId;
}

interface AuditLogEntry {
  id: string;
  action: string;
  target_type: string;
  target_id: string;
  notes: string;
  created_at: string;
}

interface WorkerSummary {
  id: string;
  name: string;
  status: string;
  skills: string[];
  created_at: string;
}

interface LiveEvent {
  id: string;
  type: string;
  label: string;
  time: string;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_workers: 0,
    verified_workers: 0,
    pending_workers: 0,
    suspended_workers: 0,
    total_residents: 0,
    total_societies: 0,
    total_services: 0,
    total_bookings: 0,
  });
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [recentWorkers, setRecentWorkers] = useState<WorkerSummary[]>([]);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);

  const addEvent = (type: string, label: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setLiveEvents(prev => [{ id, type, label, time: new Date().toLocaleTimeString('en-IN') }, ...prev].slice(0, 30));
  };

  useEffect(() => {
    loadAll(true);

    const workerSub = supabase
      .channel('admin:workers')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'workers' }, (p) => {
        addEvent('worker', `New worker registered (…${String(p.new.id).slice(-6)})`);
        loadAll();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'workers' }, (p) => {
        addEvent('worker_update', `Worker status → ${p.new.verification_status}`);
        loadAll();
      })
      .subscribe();

    const userSub = supabase
      .channel('admin:users')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'users' }, (p) => {
        addEvent(p.new.role || 'user', `New ${p.new.role || 'user'} registered: ${p.new.name || 'Unknown'}`);
        loadAll();
      })
      .subscribe();

    const societySub = supabase
      .channel('admin:societies')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'societies' }, (p) => {
        addEvent('society', `New society: ${p.new.name || 'Unknown'}`);
        loadAll();
      })
      .subscribe();

    const jobSub = supabase
      .channel('admin:jobs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'jobs' }, () => {
        addEvent('job', 'New resident job/booking registered');
        loadAll();
      })
      .subscribe();

    const visitSub = supabase
      .channel('admin:visits')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'service_visits' }, () => {
        addEvent('visit', 'New service visit created');
        loadAll();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(workerSub);
      supabase.removeChannel(userSub);
      supabase.removeChannel(societySub);
      supabase.removeChannel(jobSub);
      supabase.removeChannel(visitSub);
    };
  }, []);

  const loadAll = async (isInitial = false) => {
    setLoading(true);
    try {
      const [workers, residents, societies, services, bookings, logs] = await Promise.all([
        supabase.from('workers').select('id, verification_status, created_at, users:user_id(name)', { count: 'exact' }),
        supabase.from('users').select('id', { count: 'exact' }).eq('role', 'resident'),
        supabase.from('societies').select('id', { count: 'exact' }),
        supabase.from('services').select('id', { count: 'exact' }),
        (supabase.from as any)('bookings').select('id', { count: 'exact' }),
        (supabase.from as any)('admin_audit_log').select('*').order('created_at', { ascending: false }).limit(20),
      ]);

      const wData = workers.data || [];
      setStats({
        total_workers: wData.length,
        verified_workers: wData.filter((w: any) => w.verification_status === 'VERIFIED').length,
        pending_workers: wData.filter((w: any) => w.verification_status === 'PENDING').length,
        suspended_workers: wData.filter((w: any) => w.verification_status === 'SUSPENDED').length,
        total_residents: residents.count || 0,
        total_societies: societies.count || 0,
        total_services: services.count || 0,
        total_bookings: bookings.count || 0,
      });

      setAuditLogs(logs.data || []);

      // Recent workers
      const { data: recentW } = await (supabase as any)
        .from('workers')
        .select('id, verification_status, created_at, users:user_id(name), worker_skills(skill_name)')
        .order('created_at', { ascending: false })
        .limit(8);

      setRecentWorkers((recentW || []).map((w: any) => ({
        id: w.id,
        name: Array.isArray(w.users) ? w.users[0]?.name : w.users?.name || 'Unknown',
        status: w.verification_status,
        skills: (w.worker_skills || []).map((s: any) => s.skill_name).slice(0, 2),
        created_at: w.created_at,
      })));

      if (isInitial) {
        // Fetch historical events for the live feed
        const [pastUsers, pastWorkers, pastSocieties, pastJobs, pastVisits] = await Promise.all([
          supabase.from('users').select('id, name, role, created_at').order('created_at', { ascending: false }).limit(10),
          supabase.from('workers').select('id, created_at').order('created_at', { ascending: false }).limit(10),
          supabase.from('societies').select('id, name, created_at').order('created_at', { ascending: false }).limit(10),
          supabase.from('jobs').select('id, created_at').order('created_at', { ascending: false }).limit(10),
          supabase.from('service_visits').select('id, created_at').order('created_at', { ascending: false }).limit(10)
        ]);

        const allEvents: (LiveEvent & { rawDate: Date })[] = [];

        (pastUsers.data || []).forEach(u => {
          allEvents.push({
            id: `u-${u.id}`,
            type: u.role || 'user',
            label: `New ${u.role || 'user'} registered: ${u.name || 'Unknown'}`,
            time: new Date(u.created_at).toLocaleTimeString('en-IN'),
            rawDate: new Date(u.created_at)
          });
        });

        (pastWorkers.data || []).forEach(w => {
          allEvents.push({
            id: `w-${w.id}`,
            type: 'worker',
            label: `New worker registered (…${String(w.id).slice(-6)})`,
            time: new Date(w.created_at).toLocaleTimeString('en-IN'),
            rawDate: new Date(w.created_at)
          });
        });

        (pastSocieties.data || []).forEach(s => {
          allEvents.push({
            id: `s-${s.id}`,
            type: 'society',
            label: `New society added: ${s.name || 'Unknown'}`,
            time: new Date(s.created_at).toLocaleTimeString('en-IN'),
            rawDate: new Date(s.created_at)
          });
        });

        (pastJobs.data || []).forEach(j => {
          allEvents.push({
            id: `j-${j.id}`,
            type: 'job',
            label: 'New resident job/booking registered',
            time: new Date(j.created_at).toLocaleTimeString('en-IN'),
            rawDate: new Date(j.created_at)
          });
        });

        (pastVisits.data || []).forEach(v => {
          allEvents.push({
            id: `v-${v.id}`,
            type: 'visit',
            label: 'New service visit created',
            time: new Date(v.created_at).toLocaleTimeString('en-IN'),
            rawDate: new Date(v.created_at)
          });
        });

        // Sort by rawDate descending and take top 30
        allEvents.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
        setLiveEvents(allEvents.slice(0, 30).map(({ rawDate, ...rest }) => rest));
      }

    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards: StatCard[] = [
    {
      label: 'Total Workers',
      value: stats.total_workers,
      icon: 'groups',
      screen: 'admin_worker_directory',
    },
    {
      label: 'Verified Workers',
      value: stats.verified_workers,
      icon: 'verified',
      screen: 'admin_worker_directory',
    },
    {
      label: 'Pending Verification',
      value: stats.pending_workers,
      icon: 'pending_actions',
      isAlert: stats.pending_workers > 0,
      screen: 'admin_verification_queue',
    },
    {
      label: 'Active Residents',
      value: stats.total_residents,
      icon: 'person',
      screen: 'admin_residents',
    },
    {
      label: 'Registered Societies',
      value: stats.total_societies,
      icon: 'apartment',
      screen: 'admin_residents',
    },
    {
      label: 'Service Categories',
      value: stats.total_services,
      icon: 'construction',
      screen: 'admin_skills',
    },
    {
      label: 'Suspended Workers',
      value: stats.suspended_workers,
      icon: 'block',
      isAlert: stats.suspended_workers > 0,
      screen: 'admin_worker_directory',
    },
    {
      label: 'Total Bookings',
      value: stats.total_bookings,
      icon: 'receipt_long',
    },
  ];

  // Strictly Black & White with RED for alerts
  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      VERIFIED: { label: 'VERIFIED', cls: 'bg-white text-black font-black border border-white' },
      PENDING: { label: 'PENDING', cls: 'bg-red-500/10 text-red-500 border border-red-500/30 font-bold' },
      SUSPENDED: { label: 'SUSPENDED', cls: 'bg-red-950 text-red-400 border border-red-800 font-bold' },
      REJECTED: { label: 'REJECTED', cls: 'bg-red-900/50 text-red-300 border border-red-700 font-bold' },
      REUPLOAD_REQUESTED: { label: 'REUPLOAD', cls: 'bg-red-500/15 text-red-400 border border-red-500/40 font-bold' },
    };
    const config = map[status] || map['PENDING'];
    return <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wider ${config.cls}`}>{config.label}</span>;
  };

  const getActionIcon = (action: string) => {
    const isDestructive = action.includes('REJECTED') || action.includes('REMOVED') || action.includes('DELETED') || action.includes('SUSPEND');
    const isWarning = action.includes('REUPLOAD');
    
    let colorCls = 'text-neutral-400';
    if (isDestructive || isWarning) colorCls = 'text-red-500';

    const map: Record<string, string> = {
      WORKER_VERIFIED: 'verified',
      WORKER_REJECTED: 'cancel',
      WORKER_REMOVED: 'block',
      WORKER_RESTORED: 'settings_backup_restore',
      REUPLOAD_REQUESTED: 'find_in_page',
      SERVICE_CREATED: 'add_circle',
      SERVICE_UPDATED: 'edit',
      SERVICE_DELETED: 'delete',
    };
    return { icon: map[action] || 'info', colorCls };
  };

  return (
    <div className="p-8 space-y-8 bg-[#050505] min-h-full font-sans text-white">
      {/* Page Header (Monochrome & Red Alert CTA) */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">Platform Dashboard</h2>
          <p className="text-neutral-400 text-xs font-mono mt-1">REAL-TIME PLATFORM CONTROL & TELEMETRY</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadAll}
            className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800 transition-all text-xs font-mono font-bold"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            REFRESH DATA
          </button>

          {/* EMERGENCY / URGENT ACTION BUTTON IN RED */}
          {stats.pending_workers > 0 ? (
            <button
              onClick={() => onNavigate('admin_verification_queue')}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl text-white font-mono font-black text-xs transition-all shadow-lg shadow-red-600/30 uppercase tracking-wider animate-pulse"
            >
              <span className="material-symbols-outlined text-base">warning</span>
              REVIEW {stats.pending_workers} PENDING WORKERS
            </button>
          ) : (
            <div className="px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-400 font-mono text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white" />
              NO QUEUED ALERTS
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-28">
          <div className="space-y-4 text-center">
            <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
            <p className="text-neutral-400 text-xs font-mono tracking-widest uppercase">Fetching System Telemetry...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stat Cards Grid - Monochrome with Red Alerts */}
          <div className="grid grid-cols-4 gap-4">
            {statCards.map((card, i) => {
              const alertStyle = card.isAlert
                ? 'bg-red-500/10 border-red-500/40 hover:bg-red-500/20'
                : 'bg-neutral-900/60 border-neutral-800 hover:border-white/30 hover:bg-neutral-900';

              return (
                <button
                  key={i}
                  onClick={() => card.screen && onNavigate(card.screen)}
                  className={`border rounded-2xl p-5 text-left transition-all group relative overflow-hidden ${alertStyle} ${
                    card.screen ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                      card.isAlert ? 'bg-red-500/20 border-red-500/40 text-red-500' : 'bg-white/10 border-white/10 text-white'
                    }`}>
                      <span className="material-symbols-outlined text-lg">{card.icon}</span>
                    </div>
                    {card.isAlert && (
                      <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[9px] font-mono font-black uppercase tracking-wider">
                        ALERT
                      </span>
                    )}
                  </div>

                  <p className={`text-3xl font-black font-mono leading-none ${card.isAlert ? 'text-red-500' : 'text-white'}`}>
                    {card.value}
                  </p>
                  <p className="text-neutral-400 text-xs font-medium mt-2">{card.label}</p>

                  {card.screen && (
                    <p className={`text-[10px] font-mono font-bold mt-3 flex items-center gap-1 transition-colors ${
                      card.isAlert ? 'text-red-400 group-hover:text-red-300' : 'text-neutral-400 group-hover:text-white'
                    }`}>
                      OPEN MODULE <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Worker Verification Funnel */}
          {stats.total_workers > 0 && (
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5 border-b border-neutral-900 pb-3">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Verification Status Distribution</h3>
                <span className="text-xs font-mono text-neutral-400">TOTAL: {stats.total_workers} WORKERS</span>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Verified & Active', value: stats.verified_workers, barCls: 'bg-white', textCls: 'text-white' },
                  { label: 'Pending Verification (Action Required)', value: stats.pending_workers, barCls: 'bg-red-600', textCls: 'text-red-500 font-bold' },
                  { label: 'Suspended / Removed', value: stats.suspended_workers, barCls: 'bg-red-900', textCls: 'text-red-400' },
                ].map((row) => {
                  const pct = stats.total_workers > 0 ? (row.value / stats.total_workers) * 100 : 0;
                  return (
                    <div key={row.label} className="flex items-center gap-4">
                      <div className="w-56 shrink-0">
                        <p className="text-neutral-300 text-xs font-medium">{row.label}</p>
                      </div>
                      <div className="flex-1 bg-neutral-900 rounded-full h-2.5 border border-neutral-800 overflow-hidden">
                        <div
                          className={`${row.barCls} h-full rounded-full transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="w-24 text-right">
                        <span className={`text-xs font-mono font-black ${row.textCls}`}>{row.value}</span>
                        <span className="text-neutral-400 text-xs font-mono ml-1.5">({pct.toFixed(0)}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Actions (Monochrome & Red Alerts) */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6">
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4">Quick Navigation Modules</h3>
            <div className="grid grid-cols-6 gap-3">
              {[
                { label: 'Verify Workers', icon: 'how_to_reg', screen: 'admin_verification_queue', alert: stats.pending_workers > 0 },
                { label: 'Worker Directory', icon: 'badge', screen: 'admin_worker_directory' },
                { label: 'Manage Services', icon: 'construction', screen: 'admin_skills' },
                { label: 'Societies & Residents', icon: 'apartment', screen: 'admin_residents' },
                { label: 'AI Matching Engine', icon: 'hub', screen: 'admin_matching' },
                { label: 'Demand Forecast', icon: 'trending_up', screen: 'admin_forecasting' },
              ].map((action) => (
                <button
                  key={action.screen}
                  onClick={() => onNavigate(action.screen as ScreenId)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all text-center gap-2 group ${
                    action.alert
                      ? 'bg-red-500/10 border-red-500/40 text-red-500 hover:bg-red-600 hover:text-white'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-white hover:text-black hover:border-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl">{action.icon}</span>
                  <span className="text-xs font-bold leading-tight">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Grid: Audit Activity Log + Recent Workers */}
          <div className="grid grid-cols-2 gap-6">
            {/* Audit Log (Monochrome & Red Destructive Actions) */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4 border-b border-neutral-900 pb-3">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">System Audit Trail</h3>
                <span className="text-[10px] font-mono text-neutral-400">{auditLogs.length} LOGGED EVENTS</span>
              </div>
              <div className="space-y-2 overflow-y-auto max-h-80 pr-1">
                {auditLogs.length === 0 ? (
                  <p className="text-neutral-400 text-xs text-center py-10 font-mono">No admin activity logged</p>
                ) : (
                  auditLogs.map((log) => {
                    const ai = getActionIcon(log.action);
                    return (
                      <div key={log.id} className="flex items-start gap-3 py-2.5 border-b border-neutral-900 last:border-0">
                        <div className={`w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0`}>
                          <span className={`material-symbols-outlined text-base ${ai.colorCls}`}>{ai.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-mono font-bold leading-tight">{log.action.replace(/_/g, ' ')}</p>
                          {log.notes && (
                            <p className="text-neutral-400 text-[11px] leading-tight mt-0.5 truncate">{log.notes}</p>
                          )}
                        </div>
                        <span className="text-neutral-400 text-[10px] font-mono shrink-0">
                          {new Date(log.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Recently Registered Workers */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4 border-b border-neutral-900 pb-3">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Recently Registered Workers</h3>
                <button
                  onClick={() => onNavigate('admin_worker_directory')}
                  className="text-[10px] font-mono text-neutral-400 hover:text-white font-bold transition-colors flex items-center gap-1"
                >
                  DIRECTORY <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
                </button>
              </div>
              <div className="space-y-3 overflow-y-auto max-h-80 pr-1">
                {recentWorkers.length === 0 ? (
                  <p className="text-neutral-400 text-xs text-center py-10 font-mono">No workers registered yet</p>
                ) : (
                  recentWorkers.map((w) => (
                    <div key={w.id} className="flex items-center justify-between py-2 border-b border-neutral-900 last:border-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-white text-black font-black text-xs flex items-center justify-center shrink-0">
                          {(w.name || 'U')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-xs font-bold truncate">{w.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {w.skills.map((s, i) => (
                              <span key={i} className="text-neutral-400 text-[9px] bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded font-mono">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(w.status)}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ── Live Registrations Feed ── */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4 border-b border-neutral-900 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Live Registrations Feed</h3>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">AUTO-UPDATING • ALL PORTALS</span>
            </div>

            {liveEvents.length === 0 ? (
              <p className="text-neutral-500 text-xs text-center py-8 font-mono">
                Listening for new registrations… Activity will appear here in real-time.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {liveEvents.map((ev) => {
                  const typeConfig: Record<string, { icon: string; cls: string }> = {
                    worker:        { icon: 'engineering',   cls: 'bg-white/10 text-white border-white/20' },
                    worker_update: { icon: 'sync',          cls: 'bg-neutral-800 text-neutral-300 border-neutral-700' },
                    resident:      { icon: 'person',        cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
                    society:       { icon: 'apartment',     cls: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
                    job:           { icon: 'receipt_long',  cls: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
                    visit:         { icon: 'calendar_today',cls: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
                    user:          { icon: 'person_add',    cls: 'bg-slate-700 text-slate-300 border-slate-600' },
                  };
                  const cfg = typeConfig[ev.type] || typeConfig['user'];
                  return (
                    <div key={ev.id} className="flex items-center gap-3 py-2 border-b border-neutral-900 last:border-0">
                      <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${cfg.cls}`}>
                        <span className="material-symbols-outlined text-sm">{cfg.icon}</span>
                      </div>
                      <p className="flex-1 text-xs text-neutral-200 font-mono">{ev.label}</p>
                      <span className="text-[10px] text-neutral-500 font-mono shrink-0">{ev.time}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
