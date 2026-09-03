import React, { useState, useEffect } from 'react';
import { ScreenId } from '../../types';
import {
  fetchAllWorkers,
  softDeleteWorker,
  restoreWorker,
  requestWorkerReupload,
  PendingWorkerItem
} from '../../lib/adminApi';

interface AdminWorkerDirectoryViewProps {
  onNavigate: (screen: ScreenId) => void;
  adminEmail?: string;
}

export const AdminWorkerDirectoryView: React.FC<AdminWorkerDirectoryViewProps> = ({
  onNavigate,
  adminEmail
}) => {
  const [workers, setWorkers] = useState<PendingWorkerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING' | 'SUSPENDED' | 'REJECTED'>('ALL');
  
  // Selected worker for actions
  const [selectedWorker, setSelectedWorker] = useState<PendingWorkerItem | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'documents' | 'actions'>('details');

  // Modals
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  
  const [showReuploadModal, setShowReuploadModal] = useState(false);
  const [reuploadDocType, setReuploadDocType] = useState('aadhar');
  const [reuploadReason, setReuploadReason] = useState('');

  const [previewMedia, setPreviewMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    setLoading(true);
    try {
      const data = await fetchAllWorkers();
      setWorkers(data);
    } catch (err) {
      console.error('Failed to load workers directory:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkers = workers.filter(w => {
    const nameMatch = (w.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const phoneMatch = (w.user?.phone || '').includes(searchQuery);
    const emailMatch = (w.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const coopMatch = (w.cooperative_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const skillMatch = w.skills.some(s => s.skill_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSearch = nameMatch || phoneMatch || emailMatch || coopMatch || skillMatch;
    
    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && w.verification_status === statusFilter;
  });

  const handleSuspendWorker = async () => {
    if (!selectedWorker || !suspendReason.trim()) return;
    setSubmitting(true);
    try {
      await softDeleteWorker(selectedWorker.id, suspendReason.trim());
      setActionMessage({ type: 'success', text: `Worker ${selectedWorker.user.name} has been suspended.` });
      setShowSuspendModal(false);
      setSuspendReason('');
      setSelectedWorker(null);
      await loadWorkers();
    } catch (err) {
      console.error('Failed to suspend worker:', err);
      setActionMessage({ type: 'error', text: 'Error suspending worker.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestoreWorker = async (worker: PendingWorkerItem) => {
    setSubmitting(true);
    try {
      await restoreWorker(worker.id);
      setActionMessage({ type: 'success', text: `Worker ${worker.user.name} restored to Verified status!` });
      await loadWorkers();
    } catch (err) {
      console.error('Failed to restore worker:', err);
      setActionMessage({ type: 'error', text: 'Failed to restore worker profile.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestReupload = async () => {
    if (!selectedWorker || !reuploadReason.trim()) return;
    setSubmitting(true);
    try {
      await requestWorkerReupload(selectedWorker.id, reuploadDocType, reuploadReason.trim());
      setActionMessage({ type: 'success', text: `Re-upload request sent to ${selectedWorker.user.name}.` });
      setShowReuploadModal(false);
      setReuploadReason('');
      setSelectedWorker(null);
      await loadWorkers();
    } catch (err) {
      console.error('Failed to request reupload:', err);
      setActionMessage({ type: 'error', text: 'Failed to submit re-upload request.' });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">verified</span> Verified
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-xs flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">hourglass_empty</span> Pending Verification
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-full font-bold text-xs flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">block</span> Suspended
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full font-bold text-xs flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">cancel</span> Rejected
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full font-bold text-xs">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 text-neutral-900">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('admin_overview')}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h1 className="font-extrabold text-xl text-neutral-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-800">badge</span>
                Worker Directory & Governance
              </h1>
              <p className="text-xs text-slate-500">
                Manage, suspend, or re-verify service professionals on Giggs
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('admin_verification_queue')}
            className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-base">how_to_reg</span>
            <span>Pending Queue</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Action notification banner */}
        {actionMessage && (
          <div
            className={`mb-6 p-4 rounded-xl font-medium text-sm flex items-center justify-between shadow-xs ${
              actionMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-rose-50 text-rose-900 border border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">
                {actionMessage.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <span>{actionMessage.text}</span>
            </div>
            <button
              onClick={() => setActionMessage(null)}
              className="text-slate-500 hover:text-slate-700 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filters & Search Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Search bar */}
          <div className="relative w-full md:w-96">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by worker name, phone, skill..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {(['ALL', 'VERIFIED', 'PENDING', 'SUSPENDED', 'REJECTED'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                  statusFilter === filter
                    ? 'bg-neutral-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter === 'ALL' ? 'All Workers' : filter}
              </button>
            ))}
          </div>
        </div>

        {/* Worker Table / Cards */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-black rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-slate-500">Loading worker directory...</p>
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">
              person_search
            </span>
            <h3 className="font-bold text-base text-slate-700">No workers found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search criteria or status filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkers.map((worker) => (
              <div
                key={worker.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                        {worker.user.avatar_url ? (
                          <img
                            src={worker.user.avatar_url}
                            alt={worker.user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="material-symbols-outlined text-2xl text-slate-400">
                            person
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-neutral-900 leading-tight">
                          {worker.user.name}
                        </h3>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                          {worker.user.phone}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(worker.verification_status)}
                  </div>

                  {/* Skills badges */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {worker.skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-semibold"
                      >
                        {s.skill_name}
                      </span>
                    ))}
                    {worker.skills.length === 0 && (
                      <span className="text-xs text-slate-400 italic">No skills listed</span>
                    )}
                  </div>

                  {worker.cooperative_name && (
                    <div className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                      <span className="material-symbols-outlined text-sm text-slate-400">group</span>
                      <span>Coop: {worker.cooperative_name}</span>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedWorker(worker)}
                    className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    <span>View Profile</span>
                  </button>

                  {worker.verification_status === 'SUSPENDED' ? (
                    <button
                      onClick={() => handleRestoreWorker(worker)}
                      disabled={submitting}
                      className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-colors shadow-2xs"
                    >
                      <span className="material-symbols-outlined text-sm">settings_backup_restore</span>
                      <span>Restore</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedWorker(worker);
                        setShowSuspendModal(true);
                      }}
                      className="py-2 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                      title="Suspend worker"
                    >
                      <span className="material-symbols-outlined text-sm">block</span>
                      <span>Suspend</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Worker Detail Modal */}
      {selectedWorker && !showSuspendModal && !showReuploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative animate-scale-up">
            <button
              onClick={() => setSelectedWorker(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                {selectedWorker.user.avatar_url ? (
                  <img
                    src={selectedWorker.user.avatar_url}
                    alt={selectedWorker.user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-3xl text-slate-400">person</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-extrabold text-xl text-neutral-900">{selectedWorker.user.name}</h2>
                  {getStatusBadge(selectedWorker.verification_status)}
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Phone: {selectedWorker.user.phone} • Email: {selectedWorker.user.email || 'N/A'}
                </p>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 mb-4">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-2 px-4 font-bold text-xs border-b-2 transition-colors ${
                  activeTab === 'details'
                    ? 'border-black text-black'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Overview & Skills
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`pb-2 px-4 font-bold text-xs border-b-2 transition-colors ${
                  activeTab === 'documents'
                    ? 'border-black text-black'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Verification Documents ({selectedWorker.documents.length})
              </button>
            </div>

            {activeTab === 'details' && (
              <div className="space-y-4 text-xs text-slate-700">
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-slate-400 font-medium">Worker ID</p>
                    <p className="font-mono text-slate-800 break-all">{selectedWorker.id}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Cooperative</p>
                    <p className="font-semibold text-slate-800">{selectedWorker.cooperative_name || 'Independent'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Joined Date</p>
                    <p className="font-semibold text-slate-800">
                      {new Date(selectedWorker.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Registered Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedWorker.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-slate-100 text-slate-800 rounded-xl font-semibold flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
                        {skill.skill_name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-3">
                {selectedWorker.documents.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4">No uploaded verification documents found.</p>
                ) : (
                  selectedWorker.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-slate-600">
                          {doc.document_type === 'video' ? 'videocam' : 'badge'}
                        </span>
                        <div>
                          <p className="font-bold text-xs uppercase text-slate-900">{doc.document_type}</p>
                          <p className="text-[11px] text-slate-500 font-mono">Status: {doc.status}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {doc.document_url ? (
                          <button
                            onClick={() =>
                              setPreviewMedia({
                                url: doc.document_url,
                                type: doc.document_type === 'video' ? 'video' : 'image'
                              })
                            }
                            className="px-3 py-1.5 bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span> Preview
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">No URL</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => setShowReuploadModal(true)}
                className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs flex items-center gap-1 shadow-2xs"
              >
                <span className="material-symbols-outlined text-base">find_in_page</span>
                Request Document Re-upload
              </button>

              {selectedWorker.verification_status !== 'SUSPENDED' && (
                <button
                  onClick={() => setShowSuspendModal(true)}
                  className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs flex items-center gap-1 shadow-2xs"
                >
                  <span className="material-symbols-outlined text-base">block</span>
                  Suspend Account
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Suspend Confirmation Modal */}
      {showSuspendModal && selectedWorker && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-scale-up">
            <h3 className="font-extrabold text-lg text-rose-600 flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined">warning</span>
              Suspend Worker Profile
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Are you sure you want to remove/suspend <strong>{selectedWorker.user.name}</strong>? They will no longer be visible or bookable by residents.
            </p>

            <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Suspension</label>
            <textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="e.g. Non-compliance, invalid documents, or user reports..."
              rows={3}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 mb-4"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowSuspendModal(false);
                  setSuspendReason('');
                }}
                className="py-2 px-4 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspendWorker}
                disabled={submitting || !suspendReason.trim()}
                className="py-2 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-2xs"
              >
                {submitting ? 'Processing...' : 'Confirm Suspension'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Re-upload Request Modal */}
      {showReuploadModal && selectedWorker && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-scale-up">
            <h3 className="font-extrabold text-lg text-amber-600 flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined">find_in_page</span>
              Request Re-upload
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Request worker <strong>{selectedWorker.user.name}</strong> to re-upload clear proof documents.
            </p>

            <label className="block text-xs font-bold text-slate-700 mb-1">Document Type</label>
            <select
              value={reuploadDocType}
              onChange={(e) => setReuploadDocType(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold mb-4 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="aadhar">Aadhaar Card Photo</option>
              <option value="video">Verification Video (10s)</option>
              <option value="police_verification">Police Verification Certificate</option>
            </select>

            <label className="block text-xs font-bold text-slate-700 mb-1">Reason / Instructions</label>
            <textarea
              value={reuploadReason}
              onChange={(e) => setReuploadReason(e.target.value)}
              placeholder="e.g. Photo was blurry or video lighting was insufficient..."
              rows={3}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 mb-4"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowReuploadModal(false);
                  setReuploadReason('');
                }}
                className="py-2 px-4 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestReupload}
                disabled={submitting || !reuploadReason.trim()}
                className="py-2 px-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-2xs"
              >
                {submitting ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-4 relative shadow-2xl animate-scale-up">
            <button
              onClick={() => setPreviewMedia(null)}
              className="absolute top-3 right-3 p-1.5 bg-black/50 text-white rounded-full hover:bg-black"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            {previewMedia.type === 'video' ? (
              <video src={previewMedia.url} controls autoPlay className="w-full rounded-2xl max-h-[70vh]" />
            ) : (
              <img src={previewMedia.url} alt="Document" className="w-full rounded-2xl max-h-[70vh] object-contain" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
