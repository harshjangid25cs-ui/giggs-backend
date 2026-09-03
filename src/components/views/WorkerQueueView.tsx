import React, { useState, useEffect } from 'react';
import { ScreenId, WorkerJob, ServiceVisit } from '../../types';
import { ASSET_IMAGES } from '../../data/mockData';

interface WorkerQueueViewProps {
  jobs: WorkerJob[];
  visit?: ServiceVisit;
  onNavigate: (screen: ScreenId) => void;
  onUpdateJobStatus: (jobId: string, newStatus: WorkerJob['status'], materials?: { id: string; name: string; qty: number; cost: number }[]) => void;
}

interface MaterialItem {
  id: string;
  name: string;
  qty: number;
  cost: number;
}

export const WorkerQueueView: React.FC<WorkerQueueViewProps> = ({
  jobs,
  visit,
  onNavigate,
  onUpdateJobStatus
}) => {
  const [seconds, setSeconds] = useState(2535); // ~42 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const activeJob = jobs.find((j) => j.status === 'in_progress') || jobs[0];
  const [materials, setMaterials] = useState<MaterialItem[]>(activeJob?.materials || []);

  useEffect(() => {
    if (activeJob) {
      setMaterials(activeJob.materials || []);
    }
  }, [activeJob?.id]);
  const [newMaterialName, setNewMaterialName] = useState('');
  const [newMaterialQty, setNewMaterialQty] = useState(1);
  const [newMaterialCost, setNewMaterialCost] = useState(15.0);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterialName.trim()) return;
    setMaterials((prev) => [
      ...prev,
      {
        id: `mat-${Date.now()}`,
        name: newMaterialName,
        qty: newMaterialQty,
        cost: newMaterialCost
      }
    ]);
    setNewMaterialName('');
    setShowMaterialModal(false);
  };


  const completedJobs = jobs.filter((j) => j.status === 'completed');
  const pendingJobs = jobs.filter(
    (j) => j.status === 'pending' && j.id !== activeJob?.id
  );

  const totalMaterialsCost = materials.reduce((acc, m) => acc + (m.cost * m.qty), 0);
  const totalBill = activeJob ? activeJob.price + totalMaterialsCost : 0;

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1b1c1c] pb-28 pt-14 px-4 md:px-8 max-w-4xl mx-auto font-sans overflow-x-hidden">
      {/* Top Header */}
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('worker_dashboard')}
            className="p-2 -ml-2 rounded-full hover:bg-slate-200 transition-colors text-black"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-neutral-900">
              {visit?.societyName || 'Society'} On-Site Queue
            </h1>
            <p className="text-xs text-neutral-500">
              {jobs.length} total scheduled apartments
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-600">Progress:</span>
          <span className="text-xs font-bold bg-neutral-200 text-neutral-900 px-2.5 py-1 rounded-full">
            {completedJobs.length} / {jobs.length} Done
          </span>
        </div>
      </header>

      {/* Main Active Job Card */}
      {activeJob && (
        <section className="bg-white border-2 border-black rounded-2xl p-5 md:p-6 shadow-md mb-8 space-y-5">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-xs font-black uppercase tracking-wider bg-black text-white px-3 py-1 rounded-full">
                Active Job • Apartment {activeJob.aptNo}
              </span>
            </div>

            {/* Live Logged Timer */}
            <div className="flex items-center gap-3 bg-[#f5f3f3] px-3.5 py-1.5 rounded-xl border border-slate-200">
              <span className="material-symbols-outlined text-base text-neutral-600">
                timer
              </span>
              <span className="font-mono font-bold text-sm text-neutral-900">
                {formatTimer(seconds)}
              </span>
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="text-xs font-semibold text-neutral-700 hover:text-black underline ml-1"
              >
                {isTimerRunning ? 'Pause' : 'Resume'}
              </button>
            </div>
          </div>

          {/* Job Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-8 space-y-3">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">
                  {activeJob.serviceTitle}
                </h2>
                <p className="text-xs text-neutral-600 mt-0.5">
                  Resident: <strong className="text-neutral-900">{activeJob.residentName}</strong> • Requested slot: {activeJob.requestedTime}
                </p>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <span className="material-symbols-outlined text-sm shrink-0 mt-0.5 text-amber-700">
                  info
                </span>
                <span>
                  Resident noted: Constant drip from cold water shutoff valve under master sink.
                </span>
              </div>

              {/* Added Materials List */}
              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Materials Logged ({materials.length})
                  </span>
                  <button
                    onClick={() => setShowMaterialModal(true)}
                    className="text-xs font-semibold text-black hover:underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    <span>Add Material</span>
                  </button>
                </div>

                <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {materials.map((m) => (
                    <div
                      key={m.id}
                      className="flex justify-between items-center text-xs text-neutral-800"
                    >
                      <span>
                        {m.name} (x{m.qty})
                      </span>
                      <span className="font-semibold text-neutral-900">
                        ₹{(m.cost * m.qty).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Resident Evidence Photo */}
            <div className="md:col-span-4 flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Resident Photo
              </span>
              <div className="w-full h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative group">
                <img
                  src={activeJob.image || ASSET_IMAGES.leakingFaucet}
                  alt="Leaking faucet"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-100">
            <button
              disabled={isUpdating}
              onClick={async () => {
                setIsUpdating(true);
                await onUpdateJobStatus(activeJob.id, 'completed', materials);
                setIsUpdating(false);
              }}
              className="flex-1 bg-black hover:bg-neutral-800 disabled:bg-neutral-500 disabled:cursor-not-allowed text-white font-bold text-sm py-3.5 rounded-xl shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>{isUpdating ? 'Processing...' : `Complete Job & Bill Resident (₹${totalBill.toFixed(0)})`}</span>
              {!isUpdating && <span className="material-symbols-outlined text-base">check_circle</span>}
            </button>

            <button
              onClick={() => setShowMaterialModal(true)}
              className="px-4 py-3 border border-slate-300 hover:border-black rounded-xl text-xs font-semibold text-neutral-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">build</span>
              <span>+ Add Parts / Items</span>
            </button>
          </div>
        </section>
      )}

      {/* Up Next / Pending Queue */}
      <section className="space-y-3 mb-8">
        <h3 className="font-bold text-base text-neutral-900">
          Upcoming in Queue ({visit?.societyName || 'Society'})
        </h3>
        <div className="space-y-3">
          {pendingJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 font-bold text-sm flex items-center justify-center text-slate-800 shrink-0">
                  {job.aptNo}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-neutral-900">
                    {job.residentName} • {job.serviceTitle}
                  </h4>
                  <p className="text-xs text-neutral-500">
                    Scheduled: {job.requestedTime} • Est. ₹{job.price}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    setIsUpdating(true);
                    await onUpdateJobStatus(job.id, 'in_progress');
                    setIsUpdating(false);
                  }}
                  disabled={isUpdating}
                  className="w-full sm:w-auto bg-black text-white disabled:bg-neutral-500 disabled:cursor-not-allowed text-xs font-semibold px-4 py-2 rounded-xl hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">play_arrow</span>
                  <span>{isUpdating ? 'Starting...' : 'Start This Job'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Completed Section */}
      {completedJobs.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-bold text-base text-neutral-900">Completed Today</h3>
          <div className="space-y-2.5 opacity-80">
            {completedJobs.map((job) => (
              <div
                key={job.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-600">
                    check_circle
                  </span>
                  <div>
                    <span className="font-bold text-xs text-neutral-900 block">
                      Apt {job.aptNo} • {job.residentName}
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {job.serviceTitle}
                    </span>
                  </div>
                </div>
                <span className="font-bold text-xs text-neutral-900">
                  ₹{job.price}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Add Materials Modal */}
      {showMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-neutral-900">
                Log Material Used
              </h3>
              <button
                onClick={() => setShowMaterialModal(false)}
                className="text-slate-400 hover:text-black"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleAddMaterial} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 uppercase mb-1">
                  Item / Part Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Copper coupling 1/2 in"
                  value={newMaterialName}
                  onChange={(e) => setNewMaterialName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-neutral-700 uppercase mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newMaterialQty}
                    onChange={(e) => setNewMaterialQty(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:border-black font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 uppercase mb-1">
                    Cost per Unit (₹)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newMaterialCost}
                    onChange={(e) => setNewMaterialCost(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:border-black font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-black text-white py-3 rounded-xl font-bold hover:bg-neutral-800 transition-colors"
                >
                  Add to Bill
                </button>
                <button
                  type="button"
                  onClick={() => setShowMaterialModal(false)}
                  className="px-4 py-3 border border-slate-300 rounded-xl font-medium text-neutral-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
