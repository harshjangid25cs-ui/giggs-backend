import React, { useState, useEffect } from 'react';
import { ScreenId, ServiceVisit } from '../../types';
import { fetchJobsForVisit } from '../../lib/api';
import { supabase } from '../../lib/supabaseClient';

interface ResidentJob {
  id: string;
  flat_no: string;
  status: string;
  requested_time: string;
  total_amount: number | null;
  created_at: string;
  resident: { name: string | null; phone: string | null } | null;
}

interface SocietyDashboardViewProps {
  serviceVisits: ServiceVisit[];
  userName?: string;
  onNavigate: (screen: ScreenId) => void;
  onShareLink: (visit: ServiceVisit) => void;
}

export const SocietyDashboardView: React.FC<SocietyDashboardViewProps> = ({
  serviceVisits,
  userName,
  onNavigate,
  onShareLink
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeQueueVisitId, setActiveQueueVisitId] = useState<string | null>(null);
  const [queueJobs, setQueueJobs] = useState<ResidentJob[]>([]);
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);

  const handleCopy = (visit: ServiceVisit) => {
    setCopiedId(visit.id);
    onShareLink(visit);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleWhatsAppShare = (visit: ServiceVisit) => {
    const baseUrl = window.location.origin;
    const societyParam = encodeURIComponent(visit.societyName || 'society');
    const shareUrl = `${baseUrl}/join/${visit.id}?society=${societyParam}&token=${visit.shareToken}`;
    const text = `❄️ GIGGS SERVICE VISIT\n\n${visit.title} available at ${visit.societyName || 'your society'}.\n\n${visit.date}\n${visit.timeWindow}\n\n👷 ${visit.proName}\n⭐ ${visit.proRating}\n\nResidents can register here:\n${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  const handleManageQueue = async (visit: ServiceVisit) => {
    if (activeQueueVisitId === visit.id) {
      setActiveQueueVisitId(null);
      setQueueJobs([]);
      return;
    }
    setActiveQueueVisitId(visit.id);
    setIsLoadingQueue(true);
    try {
      const jobs = await fetchJobsForVisit(visit.id);
      setQueueJobs(jobs as ResidentJob[]);
    } catch (e) {
      console.error('Failed to load queue:', e);
    } finally {
      setIsLoadingQueue(false);
    }
  };

  // Real-time subscription for jobs on the active visit
  useEffect(() => {
    if (!activeQueueVisitId) return;

    const channel = supabase
      .channel(`jobs:visit:${activeQueueVisitId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: `service_visit_id=eq.${activeQueueVisitId}`
        },
        async () => {
          const jobs = await fetchJobsForVisit(activeQueueVisitId);
          setQueueJobs(jobs as ResidentJob[]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeQueueVisitId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-amber-100 text-amber-800';
    }
  };

  const activeVisitsCount = serviceVisits.filter(v => v.status !== 'COMPLETED' && v.status !== 'CANCELLED').length;
  const totalResidentsJoined = serviceVisits.reduce((sum, v) => sum + (v.joinedCount || 0), 0);
  const completedJobsCount = serviceVisits.reduce((sum, v) => sum + (v.status === 'COMPLETED' ? v.joinedCount : 0), 0);

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1b1c1c] pb-28 pt-14 px-4 md:px-8 max-w-5xl mx-auto overflow-x-hidden">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-black text-2xl">
              apartment
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight">
              {userName || 'Green Valley Society'}
            </h1>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Society Management &amp; Service Logistics Portal
          </p>
        </div>

        <button
          onClick={() => onNavigate('society_new_visit')}
          className="bg-black hover:bg-neutral-800 text-white font-semibold text-xs py-3 px-5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0"
        >
          <span className="material-symbols-outlined text-base">add_circle</span>
          <span>Schedule New Service Visit</span>
        </button>
      </div>

      {/* Metrics Bento */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Visits</span>
            <span className="material-symbols-outlined text-lg text-neutral-700">calendar_month</span>
          </div>
          <div className="text-3xl font-black text-neutral-900">{activeVisitsCount}</div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">Current scheduled service blocks</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Residents Joined</span>
            <span className="material-symbols-outlined text-lg text-neutral-700">groups</span>
          </div>
          <div className="text-3xl font-black text-neutral-900">{totalResidentsJoined}</div>
          <p className="text-[11px] text-neutral-500 mt-1">Total registrations</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Completed Jobs</span>
            <span className="material-symbols-outlined text-lg text-emerald-600 fill">check_circle</span>
          </div>
          <div className="text-3xl font-black text-neutral-900">{completedJobsCount}</div>
          <p className="text-[11px] text-neutral-500 mt-1">Successfully fulfilled requests</p>
        </div>
      </section>

      {/* Active Service Visits List */}
      <section className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-xl text-neutral-900">Active &amp; Scheduled Service Visits</h2>
          <span className="text-xs text-neutral-500">{serviceVisits.length} visits active</span>
        </div>

        <div className="space-y-4">
          {serviceVisits.map((visit) => {
            const progress = Math.min(100, Math.round((visit.joinedCount / visit.targetCount) * 100));
            const isQueueOpen = activeQueueVisitId === visit.id;

            return (
              <div key={visit.id} className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                {/* Visit Card */}
                <div className="p-5 flex flex-col md:flex-row justify-between gap-5">
                  {/* Left: Info */}
                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-2xl text-neutral-800">
                        {visit.category.toLowerCase().includes('ac') || visit.category.toLowerCase().includes('appliance')
                          ? 'ac_unit'
                          : visit.category.toLowerCase().includes('plumb')
                          ? 'water_drop'
                          : 'electrical_services'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base text-neutral-900">{visit.title}</h3>
                        <span className="bg-[#f5f3f3] text-neutral-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          {visit.category}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">calendar_today</span>
                          {visit.date} ({visit.timeWindow})
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">person</span>
                          Pro: {visit.proName} ({visit.proRating} ★)
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="pt-2 max-w-md">
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-neutral-700">
                            {visit.joinedCount} / {visit.targetCount} Residents Registered
                          </span>
                          <span className="text-black font-bold">
                            Current: ₹{visit.currentRate}{' '}
                            <span className="text-neutral-400 line-through font-normal">₹{visit.originalRate}</span>
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-black rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex md:flex-col justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <button
                      onClick={() => handleWhatsAppShare(visit)}
                      className="flex-1 md:flex-none px-4 py-2 border border-green-600 hover:bg-green-50 text-green-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">chat</span>
                      <span>Share on WhatsApp</span>
                    </button>
                    <button
                      onClick={() => handleCopy(visit)}
                      className="flex-1 md:flex-none px-4 py-2 border border-slate-300 hover:border-black rounded-xl text-xs font-semibold text-neutral-800 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {copiedId === visit.id ? 'check' : 'content_copy'}
                      </span>
                      <span>{copiedId === visit.id ? 'Link Copied!' : 'Copy Link'}</span>
                    </button>

                    <button
                      onClick={() => handleManageQueue(visit)}
                      className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                        isQueueOpen
                          ? 'bg-neutral-800 text-white'
                          : 'bg-black text-white hover:bg-neutral-800'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {isQueueOpen ? 'expand_less' : 'format_list_bulleted'}
                      </span>
                      <span>{isQueueOpen ? 'Close Queue' : `Queue (${visit.joinedCount})`}</span>
                    </button>
                  </div>
                </div>

                {/* Resident Queue Panel */}
                {isQueueOpen && (
                  <div className="border-t border-slate-200 bg-slate-50">
                    <div className="px-5 py-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                          <span className="material-symbols-outlined text-base text-black">groups</span>
                          Registered Residents Queue
                          <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {queueJobs.length} registered
                          </span>
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live
                        </div>
                      </div>

                      {isLoadingQueue ? (
                        <div className="flex items-center justify-center py-8 gap-3">
                          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs text-neutral-500">Loading queue...</span>
                        </div>
                      ) : queueJobs.length === 0 ? (
                        <div className="text-center py-8">
                          <span className="material-symbols-outlined text-3xl text-neutral-300">person_search</span>
                          <p className="text-xs text-neutral-500 mt-2">No residents have registered yet.</p>
                          <p className="text-xs text-neutral-400 mt-1">Share the WhatsApp link above to invite residents.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {queueJobs.map((job, idx) => (
                            <div
                              key={job.id}
                              className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center gap-3"
                            >
                              {/* Queue Position */}
                              <div className="w-7 h-7 rounded-full bg-black text-white text-[11px] font-black flex items-center justify-center shrink-0">
                                {idx + 1}
                              </div>

                              {/* Resident Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-bold text-neutral-900 truncate">
                                    {job.resident?.name || 'Resident'}
                                  </span>
                                  <span className="bg-slate-100 text-neutral-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    Flat {job.flat_no}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-[11px] text-neutral-500">
                                  {job.resident?.phone && (
                                    <span className="flex items-center gap-1">
                                      <span className="material-symbols-outlined text-xs">phone</span>
                                      {job.resident.phone}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">schedule</span>
                                    {job.requested_time || 'Any time'}
                                  </span>
                                </div>
                              </div>

                              {/* Status Badge */}
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 capitalize ${getStatusColor(job.status)}`}>
                                {job.status.replace('_', ' ')}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Society Recent Activity */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <h3 className="font-bold text-base text-neutral-900 mb-3">Live Society Activity Feed</h3>
        <div className="space-y-3 text-xs">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="font-semibold text-neutral-900">Flat A-104 (Amit Sharma)</span>
            <span className="text-neutral-500">registered for AC Servicing visit.</span>
            <span className="ml-auto text-neutral-400">5m ago</span>
          </div>
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span className="font-semibold text-neutral-900">Pro Alex M.</span>
            <span className="text-neutral-500">completed Plumbing Fix in 4B.</span>
            <span className="ml-auto text-neutral-400">42m ago</span>
          </div>
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="w-2 h-2 rounded-full bg-amber-600" />
            <span className="font-semibold text-neutral-900">Tier 2 Group Discount</span>
            <span className="text-neutral-500">unlocked for Green Valley (Rate reduced to ₹449).</span>
            <span className="ml-auto text-neutral-400">1h ago</span>
          </div>
        </div>
      </section>
    </div>
  );
};
