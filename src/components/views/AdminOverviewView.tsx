import React from 'react';
import { ScreenId } from '../../types';
import { ASSET_IMAGES } from '../../data/mockData';

interface AdminOverviewViewProps {
  onNavigate: (screen: ScreenId) => void;
  stats: {
    societyCount: number;
    workerCount: number;
    gmv: number;
    fulfillmentRate: number;
  };
}

export const AdminOverviewView: React.FC<AdminOverviewViewProps> = ({
  onNavigate,
  stats
}) => {
  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1b1c1c] pb-28 pt-14 px-4 md:px-8 max-w-5xl mx-auto font-sans overflow-x-hidden">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Platform Operations &amp; Heatmap
            </h1>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time urban grid telemetry across societies &amp; service pools
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('admin_verification_queue')}
            className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs py-2.5 px-3.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">verified_user</span>
            <span>Verification Queue</span>
          </button>
          <button
            onClick={() => onNavigate('admin_worker_directory')}
            className="bg-slate-900 hover:bg-black text-white font-bold text-xs py-2.5 px-3.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">badge</span>
            <span>Worker Directory</span>
          </button>
          <button
            onClick={() => onNavigate('admin_skills')}
            className="bg-slate-900 hover:bg-black text-white font-bold text-xs py-2.5 px-3.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">construction</span>
            <span>Skills Master</span>
          </button>
          <button
            onClick={() => onNavigate('admin_residents')}
            className="bg-slate-900 hover:bg-black text-white font-bold text-xs py-2.5 px-3.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">apartment</span>
            <span>Societies &amp; Residents</span>
          </button>
          <button
            onClick={() => onNavigate('admin_matching')}
            className="bg-neutral-800 hover:bg-neutral-900 text-white font-semibold text-xs py-2.5 px-3 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">hub</span>
            <span>AI Matching</span>
          </button>
          <button
            onClick={() => onNavigate('admin_forecasting')}
            className="bg-white border border-slate-300 hover:border-black text-neutral-900 font-semibold text-xs py-2.5 px-3 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">analytics</span>
            <span>Forecasting</span>
          </button>
        </div>
      </header>

      {/* High-Level Metrics Bento */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
            Active Societies
          </span>
          <div className="text-2xl sm:text-3xl font-black text-neutral-900">
            {stats.societyCount.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold">
            Real-time
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
            Active Workers
          </span>
          <div className="text-2xl sm:text-3xl font-black text-neutral-900">
            {stats.workerCount.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold">
            100% verified &amp; insured
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
            Fulfillment Rate
          </span>
          <div className="text-2xl sm:text-3xl font-black text-neutral-900">
            {stats.fulfillmentRate}%
          </div>
          <span className="text-[10px] text-neutral-500">
            Avg response: 14.2 mins
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
            Total GMV
          </span>
          <div className="text-2xl sm:text-3xl font-black text-neutral-900">
            ₹{stats.gmv.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold">
            Real-time
          </span>
        </div>
      </section>

      {/* Real-time Heatmap & Urban Activity Card */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              Live Society Demand Density Heatmap
            </h2>
            <p className="text-xs text-neutral-500">
              Real-time clustering based on resident registrations and pending visits
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span>High Demand</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Medium</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Balanced</span>
            </span>
          </div>
        </div>

        {/* Visual Map Render */}
        <div className="relative w-full h-80 sm:h-96 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group">
          <img
            src={ASSET_IMAGES.adminIsometricMap}
            alt="Demand Heatmap"
            className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
          />

          {/* Interactive Heatmap Pin Overlays */}
          <div className="absolute top-1/4 left-1/3 p-2 bg-black/80 text-white rounded-xl border border-red-500/50 backdrop-blur-xs text-xs shadow-lg animate-fade-in flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <div>
              <div className="font-bold">Green Valley Sector (12 units)</div>
              <div className="text-[10px] text-neutral-300">HVAC Group Deal active</div>
            </div>
          </div>

          <div className="absolute bottom-1/3 right-1/4 p-2 bg-black/80 text-white rounded-xl border border-amber-500/50 backdrop-blur-xs text-xs shadow-lg animate-fade-in flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <div>
              <div className="font-bold">Skyline Towers (4 units)</div>
              <div className="text-[10px] text-neutral-300">Plumbing on-site</div>
            </div>
          </div>
        </div>
      </section>

      {/* Top High-Volume Service Categories */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-neutral-900">
          Service Category Distribution &amp; Allocation Efficiency
        </h3>

        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between font-semibold text-neutral-800 mb-1">
              <span>HVAC &amp; AC Maintenance (42% of volume)</span>
              <span>₹7.8M GMV • 98.6% Matched</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-black rounded-full" style={{ width: '42%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between font-semibold text-neutral-800 mb-1">
              <span>Plumbing &amp; Leak Repair (28% of volume)</span>
              <span>₹5.1M GMV • 99.1% Matched</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-neutral-700 rounded-full" style={{ width: '28%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between font-semibold text-neutral-800 mb-1">
              <span>Electrical Inspection (18% of volume)</span>
              <span>₹3.3M GMV • 100% Matched</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-neutral-500 rounded-full" style={{ width: '18%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between font-semibold text-neutral-800 mb-1">
              <span>Deep Cleaning &amp; Others (12% of volume)</span>
              <span>₹2.2M GMV • 97.4% Matched</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-neutral-400 rounded-full" style={{ width: '12%' }}></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
