import React, { useState, useEffect } from 'react';
import { ScreenId } from '../../types';
import {
  fetchServicesMaster,
  createServiceMaster,
  updateServiceMaster,
  deleteServiceMaster
} from '../../lib/adminApi';

interface AdminSkillsViewProps {
  onNavigate: (screen: ScreenId) => void;
  adminEmail?: string;
}

interface ServiceItem {
  id: string;
  title: string;
  category: string;
  description: string | null;
  base_price: number | null;
  created_at?: string;
}

export const AdminSkillsView: React.FC<AdminSkillsViewProps> = ({
  onNavigate,
  adminEmail
}) => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // New Service Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newBasePrice, setNewBasePrice] = useState<number>(299);

  // Edit Service Modal State
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editBasePrice, setEditBasePrice] = useState<number>(0);

  // Delete Confirmation Modal
  const [deletingService, setDeletingService] = useState<ServiceItem | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await fetchServicesMaster();
      setServices(data || []);
    } catch (err) {
      console.error('Failed to load services master:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.from(new Set(services.map((s) => s.category)));

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (categoryFilter === 'ALL') return matchesSearch;
    return matchesSearch && s.category === categoryFilter;
  });

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCategory.trim()) return;

    setSubmitting(true);
    try {
      await createServiceMaster({
        title: newTitle.trim(),
        category: newCategory.trim(),
        description: newDescription.trim(),
        base_price: newBasePrice
      });
      setFeedback({ type: 'success', text: `Profession "${newTitle}" created successfully!` });
      setShowAddModal(false);
      setNewTitle('');
      setNewCategory('');
      setNewDescription('');
      setNewBasePrice(299);
      await loadServices();
    } catch (err) {
      console.error('Failed to create service category:', err);
      setFeedback({ type: 'error', text: 'Error adding new profession/service.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !editTitle.trim() || !editCategory.trim()) return;

    setSubmitting(true);
    try {
      await updateServiceMaster(editingService.id, {
        title: editTitle.trim(),
        category: editCategory.trim(),
        description: editDescription.trim(),
        base_price: editBasePrice
      });
      setFeedback({ type: 'success', text: `Updated "${editTitle}" master details.` });
      setEditingService(null);
      await loadServices();
    } catch (err) {
      console.error('Failed to update service:', err);
      setFeedback({ type: 'error', text: 'Failed to update service.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteService = async () => {
    if (!deletingService) return;
    setSubmitting(true);
    try {
      await deleteServiceMaster(deletingService.id, deletingService.title);
      setFeedback({ type: 'success', text: `Deleted "${deletingService.title}" profession.` });
      setDeletingService(null);
      await loadServices();
    } catch (err) {
      console.error('Failed to delete service:', err);
      setFeedback({ type: 'error', text: 'Error removing profession category.' });
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (service: ServiceItem) => {
    setEditingService(service);
    setEditTitle(service.title);
    setEditCategory(service.category);
    setEditDescription(service.description || '');
    setEditBasePrice(service.base_price || 299);
  };

  return (
    <div className="min-h-screen bg-[#050505] pb-24 text-white font-sans">
      {/* Top Bar */}
      <div className="bg-black border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('admin_overview')}
              className="p-2 hover:bg-neutral-900 rounded-full text-neutral-400 transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h1 className="font-black text-xl text-white flex items-center gap-2 uppercase tracking-tight">
                <span className="material-symbols-outlined text-white">construction</span>
                Professions & Skills Master
              </h1>
              <p className="text-xs text-neutral-400 font-mono">
                Add, edit, or remove service categories
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-white text-black font-black text-xs uppercase tracking-wider rounded flex items-center gap-2 transition-all hover:bg-neutral-200"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>Add Profession</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {feedback && (
          <div
            className={`mb-6 p-4 rounded font-mono text-sm flex items-center justify-between border ${
              feedback.type === 'success'
                ? 'bg-neutral-900 text-white border-white/20'
                : 'bg-red-950 text-red-400 border-red-800'
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              <span className="material-symbols-outlined">
                {feedback.type === 'success' ? 'check' : 'warning'}
              </span>
              <span>{feedback.text}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-neutral-500 hover:text-white text-xs font-bold"
            >
              DISMISS
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="bg-neutral-900 p-4 rounded border border-white/10 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-neutral-500">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH CATEGORY OR NAME..."
              className="w-full pl-10 pr-4 py-2 bg-black border border-white/20 rounded text-sm text-white font-mono placeholder:text-neutral-600 focus:outline-none focus:border-white transition-all"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-3 py-1.5 rounded font-mono font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap border ${
                categoryFilter === 'ALL'
                  ? 'bg-white text-black border-white'
                  : 'bg-transparent text-neutral-400 border-white/20 hover:border-white/50 hover:text-white'
              }`}
            >
              All ({services.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded font-mono font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap border ${
                  categoryFilter === cat
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent text-neutral-400 border-white/20 hover:border-white/50 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of Profession Cards */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4" />
            <p className="text-sm font-mono text-neutral-500">LOADING SERVICE MASTER DIRECTORY...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-neutral-900 p-12 rounded-xl border border-white/10 text-center">
            <span className="material-symbols-outlined text-4xl text-neutral-600 mb-2">
              construction
            </span>
            <h3 className="font-bold font-mono text-base text-white tracking-widest uppercase">No professions registered</h3>
            <p className="text-xs text-neutral-400 mt-1 font-mono">
              Click "Add Profession" above to add new service offerings.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-neutral-900 rounded border border-white/10 p-5 hover:border-white/30 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 bg-white text-black font-black text-[10px] uppercase tracking-wider rounded-sm">
                      {service.category}
                    </span>
                    <span className="font-mono text-xs text-white bg-black px-2 py-1 border border-white/20">
                      ₹{service.base_price || 299} BASE
                    </span>
                  </div>

                  <h3 className="font-black text-lg text-white mb-1 uppercase tracking-tight">
                    {service.title}
                  </h3>
                  <p className="text-xs text-neutral-400 line-clamp-2 mb-4 font-mono leading-relaxed">
                    {service.description || 'Standard society marketplace service offering.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(service)}
                    className="py-1.5 px-3 bg-black hover:bg-neutral-800 text-white border border-white/20 font-bold text-xs flex items-center gap-1 transition-colors uppercase tracking-widest"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span> EDIT
                  </button>

                  <button
                    onClick={() => setDeletingService(service)}
                    className="py-1.5 px-2.5 bg-red-950 hover:bg-red-900 border border-red-800 text-red-400 font-bold text-xs flex items-center gap-1 transition-colors uppercase tracking-widest"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span> DELETE
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-white/20 rounded max-w-md w-full p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-black text-lg text-white flex items-center gap-2 uppercase tracking-tight">
                <span className="material-symbols-outlined text-white">add_circle</span>
                Add New Profession
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-neutral-500 hover:text-white transition-colors rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider">Service Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Carpenter, AC Technician, Plumber..."
                  required
                  className="w-full p-3 bg-black border border-white/20 rounded text-sm text-white font-mono placeholder:text-neutral-700 focus:outline-none focus:border-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider">Category</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g. Carpentry, Electrical, Plumbing, Cleaning..."
                  required
                  className="w-full p-3 bg-black border border-white/20 rounded text-sm text-white font-mono placeholder:text-neutral-700 focus:outline-none focus:border-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider">Base Price (₹)</label>
                <input
                  type="number"
                  value={newBasePrice}
                  onChange={(e) => setNewBasePrice(Number(e.target.value))}
                  min={0}
                  required
                  className="w-full p-3 bg-black border border-white/20 rounded text-sm text-white font-mono placeholder:text-neutral-700 focus:outline-none focus:border-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider">Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Brief description of the service offered to residents..."
                  rows={3}
                  className="w-full p-3 bg-black border border-white/20 rounded text-sm text-white font-mono placeholder:text-neutral-700 focus:outline-none focus:border-white transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2.5 px-4 text-xs font-bold text-neutral-400 hover:text-white uppercase tracking-widest transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="py-2.5 px-5 bg-white hover:bg-neutral-200 disabled:opacity-50 text-black font-black text-xs uppercase tracking-widest rounded transition-colors"
                >
                  {submitting ? 'ADDING...' : 'SAVE PROFESSION'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Service Modal */}
      {editingService && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-white/20 rounded max-w-md w-full p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-black text-lg text-white flex items-center gap-2 uppercase tracking-tight">
                <span className="material-symbols-outlined text-white">edit</span>
                Edit Profession
              </h2>
              <button
                onClick={() => setEditingService(null)}
                className="p-1 text-neutral-500 hover:text-white transition-colors rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleUpdateService} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider">Service Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full p-3 bg-black border border-white/20 rounded text-sm text-white font-mono placeholder:text-neutral-700 focus:outline-none focus:border-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider">Category</label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  required
                  className="w-full p-3 bg-black border border-white/20 rounded text-sm text-white font-mono placeholder:text-neutral-700 focus:outline-none focus:border-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider">Base Price (₹)</label>
                <input
                  type="number"
                  value={editBasePrice}
                  onChange={(e) => setEditBasePrice(Number(e.target.value))}
                  min={0}
                  required
                  className="w-full p-3 bg-black border border-white/20 rounded text-sm text-white font-mono placeholder:text-neutral-700 focus:outline-none focus:border-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full p-3 bg-black border border-white/20 rounded text-sm text-white font-mono placeholder:text-neutral-700 focus:outline-none focus:border-white transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="py-2.5 px-4 text-xs font-bold text-neutral-400 hover:text-white uppercase tracking-widest transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="py-2.5 px-5 bg-white hover:bg-neutral-200 disabled:opacity-50 text-black font-black text-xs uppercase tracking-widest rounded transition-colors"
                >
                  {submitting ? 'SAVING...' : 'UPDATE PROFESSION'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingService && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-red-900/50 rounded max-w-sm w-full p-6 shadow-2xl animate-scale-up">
            <h3 className="font-black text-lg text-red-500 flex items-center gap-2 mb-3 uppercase tracking-tight">
              <span className="material-symbols-outlined">warning</span>
              Delete Profession
            </h3>
            <p className="text-sm text-neutral-400 mb-6 font-mono leading-relaxed">
              Are you sure you want to delete <strong className="text-white bg-neutral-800 px-1 py-0.5 rounded">{deletingService.title}</strong>? Workers assigned to this category will no longer be listed under it.
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setDeletingService(null)}
                className="py-2.5 px-4 text-xs font-bold text-neutral-400 hover:text-white uppercase tracking-widest transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={handleDeleteService}
                disabled={submitting}
                className="py-2.5 px-5 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest rounded transition-colors"
              >
                {submitting ? 'DELETING...' : 'DELETE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
