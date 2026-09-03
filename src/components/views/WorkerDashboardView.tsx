import React, { useState } from 'react';
import { ScreenId, WorkerJob, ServiceVisit } from '../../types';
import { ASSET_IMAGES } from '../../data/mockData';

interface WorkerDashboardViewProps {
  jobs: WorkerJob[];
  visits?: ServiceVisit[];
  userName?: string;
  isOnline: boolean;
  skills?: string[];
  onToggleOnline: (status: boolean) => void;
  onAcceptVisit?: (visitId: string) => void;
  onDeclineVisit?: (visitId: string) => void;
  onNavigate: (screen: ScreenId) => void;
  onSelectJob: (job: WorkerJob) => void;
  onSelectVisit: (visitId: string) => void;
}

export const WorkerDashboardView: React.FC<WorkerDashboardViewProps> = ({
  jobs,
  visits = [],
  userName,
  isOnline,
  skills = [],
  onToggleOnline,
  onAcceptVisit,
  onDeclineVisit,
  onNavigate,
  onSelectJob,
  onSelectVisit
}) => {
  const activeJob = jobs.find((j) => j.status === 'in_progress') || jobs[0];
  const pendingVisits = visits.filter(v => v.status === 'registrations_open');
  const activeVisits = visits.filter(v => v.status === 'worker_confirmed' || v.status === 'in_progress');

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1b1c1c] pb-28 pt-14 px-4 md:px-8 max-w-4xl mx-auto overflow-x-hidden">
      {/* Header & Status Toggle */}
      <section className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-300">
            <img
              src={ASSET_IMAGES.workerAvatar}
              alt="Worker profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-neutral-900">
              {userName || 'Worker Pro'}
            </h1>
            <p className="text-xs text-neutral-500">
              Certified Service Professional
            </p>
          </div>
        </div>

        {/* Online / Offline Toggle */}
        <button
          onClick={() => onToggleOnline(!isOnline)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all shadow-xs ${
            isOnline
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-slate-100 border-slate-300 text-slate-600'
          }`}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isOnline ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'
            }`}
          ></span>
          <span>{isOnline ? 'Online & Available' : 'Offline'}</span>
        </button>
      </section>

      {/* Metrics Bento */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <div
          onClick={() => onNavigate('worker_earnings')}
          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs cursor-pointer hover:border-slate-400 transition-colors"
        >
          <div className="flex justify-between items-center text-xs text-neutral-500 mb-1">
            <span className="font-semibold">Today's Earnings</span>
            <span className="material-symbols-outlined text-sm">payments</span>
          </div>
          <div className="text-2xl font-black text-neutral-900">
            ₹{jobs.filter(j => j.status === 'completed').reduce((acc, j) => acc + j.price, 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold">
            Lifetime accumulated
          </span>
        </div>

        <div
          onClick={() => onNavigate('worker_queue')}
          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs cursor-pointer hover:border-slate-400 transition-colors"
        >
          <div className="flex justify-between items-center text-xs text-neutral-500 mb-1">
            <span className="font-semibold">Jobs in Queue</span>
            <span className="material-symbols-outlined text-sm">checklist</span>
          </div>
          <div className="text-2xl font-black text-neutral-900">
            {jobs.filter((j) => j.status !== 'completed').length} Pending
          </div>
          <span className="text-[10px] text-neutral-500">
            {activeVisits.length} active society visits
          </span>
        </div>

        <div
          onClick={() => onNavigate('worker_welfare')}
          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs cursor-pointer hover:border-slate-400 transition-colors"
        >
          <div className="flex justify-between items-center text-xs text-neutral-500 mb-1">
            <span className="font-semibold">Welfare &amp; Rating</span>
            <span className="material-symbols-outlined text-sm text-amber-500 fill">
              verified
            </span>
          </div>
          <div className="text-2xl font-black text-neutral-900">4.9 ★</div>
          <span className="text-[10px] text-emerald-700 font-semibold">
            Covered by GIGGS Welfare
          </span>
        </div>
      </section>

      {/* Worker Skills / Trade Provisions */}
      {skills && skills.length > 0 && (
        <section className="mb-8">
          <h2 className="text-base font-bold text-neutral-900 mb-3">Your Trade Skills</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((sk) => (
              <span
                key={sk}
                className="inline-flex items-center gap-1.5 bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-full"
              >
                <span className="material-symbols-outlined text-sm">verified</span>
                {sk}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Pending Visit Invitations */}
      {pendingVisits.length > 0 && (
        <section className="mb-8 space-y-3">
          <h2 className="text-lg font-bold text-neutral-900">New Visit Requests</h2>
          {pendingVisits.map((visit) => (
            <div key={visit.id} className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-neutral-900">{visit.societyName}</h3>
                  <p className="text-xs text-neutral-600">{visit.title} • {visit.date} {visit.timeWindow}</p>
                </div>
                <span className="bg-amber-200 text-amber-900 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                  NEW REQUEST
                </span>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => onAcceptVisit && onAcceptVisit(visit.id)}
                  className="flex-1 bg-black text-white py-2 rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors"
                >
                  Accept Visit
                </button>
                <button
                  onClick={() => onDeclineVisit && onDeclineVisit(visit.id)}
                  className="flex-1 bg-white border border-slate-300 text-neutral-800 py-2 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Current Active Visit & Queue Preview */}
      <section className="mb-8 space-y-4">
        {activeVisits.length > 0 ? activeVisits.map(visit => (
          <div key={visit.id} className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">
                  Current Location: {visit.societyName}
                </h2>
                <p className="text-xs text-neutral-500">
                  {visit.title} • {visit.targetCount} units requested
                </p>
              </div>

              <button
                onClick={() => onSelectVisit(visit.id)}
                className="bg-black hover:bg-neutral-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
              >
                <span>Open Queue</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        )) : (
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              No Active Visits
            </h2>
            <p className="text-xs text-neutral-500">
              You are not currently confirmed for any visits today.
            </p>
          </div>
        )}

        {/* In-Progress Job Card */}
        {activeJob && (
          <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping"></span>
                <span className="bg-black text-white text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                  Active Now • Flat {activeJob.aptNo}
                </span>
              </div>
              <span className="text-xs font-bold text-neutral-900">
                ₹{activeJob.price}
              </span>
            </div>

            <div className="flex gap-4 items-center">
              <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden border shrink-0">
                <img
                  src={activeJob.image || ASSET_IMAGES.leakingFaucet}
                  alt="Job issue"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-base text-neutral-900">
                  {activeJob.serviceTitle}
                </h3>
                <p className="text-xs text-neutral-600">
                  Resident: {activeJob.residentName} • Requested: {activeJob.requestedTime}
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  onSelectJob(activeJob);
                  onNavigate('worker_queue');
                }}
                className="flex-1 bg-black text-white py-2.5 rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">play_arrow</span>
                <span>Resume / Manage Job</span>
              </button>
              <button
                onClick={() => onNavigate('resident_emergency')}
                className="px-3 py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">emergency</span>
                <span>SOS Alert</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Up Next in Queue */}
      <section className="space-y-3">
        <h3 className="font-bold text-base text-neutral-900">
          Remaining Units in Skyline Towers
        </h3>
        <div className="space-y-2.5">
          {jobs
            .filter((j) => j.status !== 'in_progress')
            .map((job) => (
              <div
                key={job.id}
                onClick={() => {
                  onSelectJob(job);
                  onNavigate('worker_queue');
                }}
                className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-800">
                    {job.aptNo}
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-neutral-900">
                      {job.residentName} • {job.serviceTitle}
                    </h4>
                    <span className="text-[11px] text-neutral-500">
                      Slot: {job.requestedTime}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      job.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {job.status === 'completed' ? 'Completed' : 'Pending'}
                  </span>
                  <span className="material-symbols-outlined text-slate-400 text-base">
                    chevron_right
                  </span>
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
};
