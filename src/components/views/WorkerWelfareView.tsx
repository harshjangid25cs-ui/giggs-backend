import React, { useState } from 'react';
import { ScreenId } from '../../types';
import { ASSET_IMAGES } from '../../data/mockData';

interface WorkerWelfareViewProps {
  workerProfile: any;
  onNavigate: (screen: ScreenId) => void;
}

export const WorkerWelfareView: React.FC<WorkerWelfareViewProps> = ({
  workerProfile,
  onNavigate
}) => {
  const [telehealthModal, setTelehealthModal] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadCard = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  // Live fields from workers table
  const identityVerified   = workerProfile?.identity_verified   ?? true;
  const policeVerified      = workerProfile?.police_verification_verified ?? true;
  const ppeCompliant        = workerProfile?.ppe_compliance      ?? true;
  const rating              = workerProfile?.rating              ?? 4.8;
  const totalJobs           = workerProfile?.total_jobs          ?? 0;
  const cooperativeName     = workerProfile?.cooperative_name    || 'GIGGS Partner';
  const isFullyVerified     = identityVerified && policeVerified && ppeCompliant;

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1b1c1c] pb-28 pt-14 px-4 md:px-8 max-w-4xl mx-auto font-sans overflow-x-hidden">
      {/* Top Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-300">
            <img
              src={ASSET_IMAGES.workerAvatarWelfare}
              alt="Worker profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-neutral-900">
              Worker Welfare &amp; Protection
            </h1>
            <p className="text-xs text-neutral-500">
              {cooperativeName} &amp; Partner Benefits
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('worker_earnings')}
          className="text-xs font-semibold text-neutral-700 bg-white border border-slate-300 hover:border-black px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">payments</span>
          <span>Earnings &amp; Ratings</span>
        </button>
      </header>

      {/* Main Insurance Hero Card */}
      <section className="bg-emerald-950 text-white rounded-2xl p-6 md:p-8 shadow-md mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-6">
          <div className="space-y-3">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 ${isFullyVerified ? 'bg-emerald-800/60 border-emerald-400/30 text-emerald-300' : 'bg-amber-800/60 border-amber-400/30 text-amber-300'} border rounded-full text-xs font-bold`}>
              <span className={`w-2 h-2 rounded-full ${isFullyVerified ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span>{isFullyVerified ? 'Active Coverage • Policy #WLF-88219' : 'Pending Verification — Coverage Partial'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Comprehensive Health &amp; Accidental Cover
            </h2>

            <p className="text-xs text-emerald-200/80 max-w-lg leading-relaxed">
              {isFullyVerified
                ? 'You are 100% insured for emergency hospitalizations, on-site accident care, and equipment damage while performing jobs on GIGGS.'
                : 'Complete your verification steps below to unlock full insurance coverage.'}
            </p>

            <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-emerald-100">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-emerald-400">check_circle</span>
                <span>₹5,00,000 Sum Insured</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-emerald-400">check_circle</span>
                <span>0% Deductible</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-emerald-400">check_circle</span>
                <span>Family Add-on Eligible</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col gap-2">
            <button
              onClick={handleDownloadCard}
              disabled={!isFullyVerified}
              className="bg-white text-emerald-950 font-bold text-xs py-3.5 px-5 rounded-xl hover:bg-emerald-50 disabled:opacity-40 transition-all shadow-xs flex items-center justify-center gap-2 active:scale-95"
            >
              <span className="material-symbols-outlined text-base">download</span>
              <span>{downloadSuccess ? 'Card Downloaded!' : 'Download Digital Card'}</span>
            </button>
            <span className="text-[10px] text-emerald-300/80 text-center">
              Powered by Care Health Insurance
            </span>
          </div>
        </div>
      </section>

      {/* Live Stats Strip */}
      <section className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-center">
          <div className="text-2xl font-black text-neutral-900">{rating.toFixed(1)}</div>
          <div className="text-[10px] text-neutral-500 font-semibold mt-0.5">Avg Rating</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-center">
          <div className="text-2xl font-black text-neutral-900">{totalJobs}</div>
          <div className="text-[10px] text-neutral-500 font-semibold mt-0.5">Total Jobs</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-center">
          <div className={`text-2xl font-black ${isFullyVerified ? 'text-emerald-700' : 'text-amber-600'}`}>
            {isFullyVerified ? '✓' : '!'}
          </div>
          <div className="text-[10px] text-neutral-500 font-semibold mt-0.5">
            {isFullyVerified ? 'Fully Verified' : 'Needs Action'}
          </div>
        </div>
      </section>

      {/* Welfare Services Bento */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {/* 24/7 Telehealth */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">local_hospital</span>
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-900">
                24/7 Telehealth Consultation
              </h3>
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                Connect with general physicians for instant medical advice, prescriptions, and symptom checks at zero cost.
              </p>
            </div>
          </div>

          <button
            onClick={() => setTelehealthModal(true)}
            className="w-full bg-slate-100 hover:bg-slate-200 text-neutral-900 font-semibold text-xs py-3 rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base text-blue-600">video_call</span>
            <span>Book Instant Telehealth Call</span>
          </button>
        </div>

        {/* Mental Health & Well-being */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">psychology</span>
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-900">
                Mental Wellness &amp; Support
              </h3>
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                Confidential one-on-one sessions with certified counselors for stress relief, family guidance, and work-life balance.
              </p>
            </div>
          </div>

          <button
            onClick={() => setTelehealthModal(true)}
            className="w-full bg-slate-100 hover:bg-slate-200 text-neutral-900 font-semibold text-xs py-3 rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base text-rose-600">support_agent</span>
            <span>Schedule Confidential Session</span>
          </button>
        </div>
      </section>

      {/* Safety Certifications & Badges — Live from DB */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-neutral-900">
          Your Verified Badges &amp; Credentials
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Identity Verified */}
          <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${identityVerified ? 'border-slate-200 bg-slate-50/60' : 'border-amber-200 bg-amber-50'}`}>
            <span className={`material-symbols-outlined text-2xl fill ${identityVerified ? 'text-emerald-700' : 'text-amber-600'}`}>
              {identityVerified ? 'verified' : 'pending'}
            </span>
            <div>
              <h4 className="font-bold text-xs text-neutral-900">Identity Verified</h4>
              <p className="text-[10px] text-neutral-500">
                {identityVerified ? 'KYC Confirmed' : 'Pending Review'}
              </p>
            </div>
          </div>

          {/* PPE Compliance */}
          <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${ppeCompliant ? 'border-slate-200 bg-slate-50/60' : 'border-amber-200 bg-amber-50'}`}>
            <span className={`material-symbols-outlined text-2xl fill ${ppeCompliant ? 'text-blue-700' : 'text-amber-600'}`}>
              {ppeCompliant ? 'safety_check' : 'pending'}
            </span>
            <div>
              <h4 className="font-bold text-xs text-neutral-900">PPE &amp; Safety Audit</h4>
              <p className="text-[10px] text-neutral-500">
                {ppeCompliant ? '100% Compliance' : 'Audit Pending'}
              </p>
            </div>
          </div>

          {/* Police Verification */}
          <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${policeVerified ? 'border-slate-200 bg-slate-50/60' : 'border-amber-200 bg-amber-50'}`}>
            <span className={`material-symbols-outlined text-2xl fill ${policeVerified ? 'text-amber-700' : 'text-amber-600'}`}>
              {policeVerified ? 'shield' : 'pending'}
            </span>
            <div>
              <h4 className="font-bold text-xs text-neutral-900">Police Background Check</h4>
              <p className="text-[10px] text-neutral-500">
                {policeVerified ? 'Clear Record Verified' : 'Verification Pending'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Telehealth Modal */}
      {telehealthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 text-center">
            <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">video_call</span>
            </div>
            <div>
              <h3 className="font-bold text-lg text-neutral-900">Doctor Connected</h3>
              <p className="text-xs text-neutral-600 mt-1">
                Dr. Priya Nair (General Physician) is ready. Connecting via secure audio/video channel...
              </p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
              <span>Call in progress (Demo Mode)</span>
            </div>
            <button
              onClick={() => setTelehealthModal(false)}
              className="w-full bg-red-600 text-white py-3 rounded-xl font-bold text-xs hover:bg-red-700"
            >
              End Consultation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
