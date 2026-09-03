import React, { useState, useEffect } from 'react';
import {
  fetchPendingVerificationWorkers,
  approveWorker,
  rejectWorker,
  requestWorkerReupload,
  PendingWorkerItem
} from '../../lib/adminApi';

interface AdminVerificationQueueViewProps {
  onRefreshStats?: () => void;
}

export const AdminVerificationQueueView: React.FC<AdminVerificationQueueViewProps> = ({
  onRefreshStats
}) => {
  const [workers, setWorkers] = useState<PendingWorkerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Modals state
  const [rejectingWorker, setRejectingWorker] = useState<PendingWorkerItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [reuploadWorker, setReuploadWorker] = useState<PendingWorkerItem | null>(null);
  const [reuploadDocType, setReuploadDocType] = useState('aadhar');
  const [reuploadReason, setReuploadReason] = useState('');

  // Selected document modal preview
  const [previewDoc, setPreviewDoc] = useState<{ title: string; url: string; type: 'image' | 'video' } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPendingVerificationWorkers();
      setWorkers(data);
    } catch (err) {
      console.error('Error loading pending verification queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (worker: PendingWorkerItem) => {
    setActionLoadingId(worker.id);
    try {
      await approveWorker(worker.id);
      setWorkers(prev => prev.filter(w => w.id !== worker.id));
      if (onRefreshStats) onRefreshStats();
    } catch (err: any) {
      alert(`Error approving worker: ${err.message || err}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const submitReject = async () => {
    if (!rejectingWorker || !rejectReason.trim()) return;
    setActionLoadingId(rejectingWorker.id);
    try {
      await rejectWorker(rejectingWorker.id, rejectReason.trim());
      setWorkers(prev => prev.filter(w => w.id !== rejectingWorker.id));
      setRejectingWorker(null);
      setRejectReason('');
      if (onRefreshStats) onRefreshStats();
    } catch (err: any) {
      alert(`Error rejecting worker: ${err.message || err}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const submitReuploadRequest = async () => {
    if (!reuploadWorker || !reuploadReason.trim()) return;
    setActionLoadingId(reuploadWorker.id);
    try {
      await requestWorkerReupload(reuploadWorker.id, reuploadDocType, reuploadReason.trim());
      setWorkers(prev => prev.filter(w => w.id !== reuploadWorker.id));
      setReuploadWorker(null);
      setReuploadReason('');
      setReuploadDocType('aadhar');
      if (onRefreshStats) onRefreshStats();
    } catch (err: any) {
      alert(`Error requesting document re-upload: ${err.message || err}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              Worker Verification Queue
            </h2>
            <span className="bg-amber-100 text-amber-800 font-extrabold text-xs px-2.5 py-0.5 rounded-full">
              {workers.length} Pending
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1 font-medium">
            Review worker identities, Aadhar documents, and selfie video verifications before enabling public bookings.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="self-start sm:self-auto bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold py-2.5 px-4 rounded-xl transition-all flex items-center gap-1.5 shrink-0"
        >
          <span className={`material-symbols-outlined text-sm ${isLoading ? 'animate-spin' : ''}`}>refresh</span>
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
          <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-bold text-neutral-500">Loading worker verification queue...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && workers.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-2xl">verified_user</span>
          </div>
          <h3 className="text-base font-extrabold text-neutral-900">Verification Queue Clear</h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1 font-medium">
            All registered workers have been reviewed. New worker registrations will automatically appear here.
          </p>
        </div>
      )}

      {/* Queue List */}
      {!isLoading && workers.length > 0 && (
        <div className="space-y-4">
          {workers.map((worker) => (
            <div
              key={worker.id}
              className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              {/* Left Column: Worker info & Claimed Skills */}
              <div className="space-y-3 flex-1">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center font-bold text-neutral-600 text-lg">
                    {worker.user.avatar_url ? (
                      <img src={worker.user.avatar_url} alt={worker.user.name} className="w-full h-full object-cover" />
                    ) : (
                      worker.user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-extrabold text-neutral-900">{worker.user.name}</h3>
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-md">
                        PENDING REVIEW
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-neutral-500 mt-0.5 font-medium flex-wrap">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">call</span>
                        {worker.user.phone}
                      </span>
                      {worker.user.email && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">mail</span>
                          {worker.user.email}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-neutral-400">
                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                        Registered {new Date(worker.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Claimed Skills */}
                <div>
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Claimed Skills / Professions
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {worker.skills.length > 0 ? (
                      worker.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-neutral-100 text-neutral-800 text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-xs text-black">build</span>
                          {skill.skill_name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-neutral-400 italic">No skills listed</span>
                    )}
                  </div>
                </div>

                {/* Documents & Verification Previews */}
                <div>
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Submitted Identity Documents
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {worker.aadhaar_photo_url ? (
                      <button
                        onClick={() => setPreviewDoc({ title: `${worker.user.name}'s Aadhar Card`, url: worker.aadhaar_photo_url!, type: 'image' })}
                        className="bg-slate-50 border border-slate-200 hover:border-black rounded-xl p-2 flex items-center gap-2 transition-all text-xs font-bold text-neutral-800"
                      >
                        <span className="material-symbols-outlined text-emerald-600 text-base">badge</span>
                        <span>Aadhar Card (Attached)</span>
                        <span className="material-symbols-outlined text-xs text-neutral-400">visibility</span>
                      </button>
                    ) : (
                      <span className="text-xs text-rose-500 font-medium flex items-center gap-1 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                        <span className="material-symbols-outlined text-xs">warning</span>
                        No Aadhar photo uploaded
                      </span>
                    )}

                    {worker.verification_video_url ? (
                      <button
                        onClick={() => setPreviewDoc({ title: `${worker.user.name}'s Live Verification Video`, url: worker.verification_video_url!, type: 'video' })}
                        className="bg-slate-50 border border-slate-200 hover:border-black rounded-xl p-2 flex items-center gap-2 transition-all text-xs font-bold text-neutral-800"
                      >
                        <span className="material-symbols-outlined text-purple-600 text-base">videocam</span>
                        <span>Verification Video (Attached)</span>
                        <span className="material-symbols-outlined text-xs text-neutral-400">play_circle</span>
                      </button>
                    ) : (
                      <span className="text-xs text-amber-600 font-medium flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                        <span className="material-symbols-outlined text-xs">info</span>
                        No video preview
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Verification Action Buttons */}
              <div className="flex flex-row lg:flex-col gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
                <button
                  onClick={() => handleApprove(worker)}
                  disabled={actionLoadingId === worker.id}
                  className="flex-1 lg:w-44 bg-black hover:bg-neutral-800 text-white font-extrabold text-xs py-3 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {actionLoadingId === worker.id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">check_circle</span>
                      <span>Approve Worker</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setReuploadWorker(worker)}
                  disabled={actionLoadingId === worker.id}
                  className="flex-1 lg:w-44 bg-white border border-amber-300 text-amber-900 hover:bg-amber-50 font-bold text-xs py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">find_in_page</span>
                  <span>Request Re-upload</span>
                </button>

                <button
                  onClick={() => setRejectingWorker(worker)}
                  disabled={actionLoadingId === worker.id}
                  className="flex-1 lg:w-44 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">cancel</span>
                  <span>Reject Worker</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Worker Modal */}
      {rejectingWorker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-700">
                <span className="material-symbols-outlined text-2xl">cancel</span>
                <h3 className="text-base font-extrabold text-neutral-900">Reject Worker Registration</h3>
              </div>
              <button
                onClick={() => setRejectingWorker(null)}
                className="text-neutral-400 hover:text-neutral-700 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-600 font-medium">
              Please specify a clear rejection reason for <strong className="text-neutral-900">{rejectingWorker.user.name}</strong>. This notification will be sent directly to the worker.
            </p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Aadhar identity mismatch, invalid documentation, failed verification criteria..."
              className="w-full p-3 bg-neutral-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingWorker(null)}
                className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={submitReject}
                disabled={!rejectReason.trim()}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Document Re-upload Modal */}
      {reuploadWorker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-700">
                <span className="material-symbols-outlined text-2xl">find_in_page</span>
                <h3 className="text-base font-extrabold text-neutral-900">Request Document Re-upload</h3>
              </div>
              <button
                onClick={() => setReuploadWorker(null)}
                className="text-neutral-400 hover:text-neutral-700 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-600 font-medium">
              Flag a document for <strong className="text-neutral-900">{reuploadWorker.user.name}</strong> to re-upload. The worker will be notified and can resubmit directly in their profile.
            </p>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Document Type
              </label>
              <select
                value={reuploadDocType}
                onChange={(e) => setReuploadDocType(e.target.value)}
                className="w-full p-3 bg-neutral-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="aadhar">Aadhar Card Photo</option>
                <option value="video">Verification Video Preview</option>
                <option value="certification">Trade Certification</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Reason / Guidance for Worker
              </label>
              <textarea
                rows={3}
                value={reuploadReason}
                onChange={(e) => setReuploadReason(e.target.value)}
                placeholder="e.g., Aadhar photo is blurry or unreadable. Please upload a clear photo of front and back."
                className="w-full p-3 bg-neutral-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReuploadWorker(null)}
                className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={submitReuploadRequest}
                disabled={!reuploadReason.trim()}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl disabled:opacity-50"
              >
                Send Re-upload Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-neutral-900">{previewDoc.title}</h3>
              <button
                onClick={() => setPreviewDoc(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-600"
              >
                ✕
              </button>
            </div>

            <div className="bg-black/5 rounded-2xl overflow-hidden min-h-[250px] flex items-center justify-center p-2">
              {previewDoc.type === 'video' ? (
                <video src={previewDoc.url} controls autoPlay className="max-h-[70vh] rounded-xl w-full object-contain" />
              ) : (
                <img src={previewDoc.url} alt={previewDoc.title} className="max-h-[70vh] rounded-xl w-full object-contain" />
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-5 py-2.5 bg-black text-white font-extrabold text-xs rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
