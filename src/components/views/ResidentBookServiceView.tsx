import React, { useState, useEffect } from 'react';
import { ScreenId } from '../../types';
import { fetchAvailableServices, ServiceWithWorkers, AvailableWorker } from '../../lib/api';

interface ResidentBookServiceViewProps {
  onNavigate: (screen: ScreenId) => void;
  onBookService: (serviceId: string, workerId: string, date: string, time: string, notes: string) => Promise<void>;
}

export const ResidentBookServiceView: React.FC<ResidentBookServiceViewProps> = ({
  onNavigate,
  onBookService
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [services, setServices] = useState<ServiceWithWorkers[]>([]);

  const [selectedService, setSelectedService] = useState<ServiceWithWorkers | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<AvailableWorker | null>(null);
  
  // Booking Form State
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await fetchAvailableServices();
      setServices(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load available services');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedWorker || !date || !time) return;

    setIsSubmitting(true);
    try {
      await onBookService(selectedService.id, selectedWorker.id, date, time, notes);
    } catch (err: any) {
      alert(err.message || 'Failed to book service');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  // STEP 1: Categories/Services
  if (!selectedService) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] text-[#1b1c1c] flex flex-col pb-28 pt-14 px-4 md:px-8 max-w-4xl mx-auto overflow-x-hidden">
        <header className="mb-6 flex items-center gap-3">
          <button
            onClick={() => onNavigate('resident_home')}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-xs shrink-0"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-neutral-900 tracking-tight">Book a Service</h1>
            <p className="text-sm text-neutral-500">Available services in your society</p>
          </div>
        </header>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 text-sm">{error}</div>}

        {services.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">engineering</span>
            <p className="text-slate-600 font-medium">No services currently available in your society — check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map(service => (
              <button
                key={service.id}
                onClick={() => setSelectedService(service)}
                className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col items-start gap-2 hover:border-black hover:shadow-md transition-all text-left"
              >
                <div className="w-full flex justify-between items-center mb-2">
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-md">
                    {service.category}
                  </span>
                  <span className="text-sm font-bold text-neutral-900">₹{service.base_price}</span>
                </div>
                <h3 className="font-bold text-lg text-neutral-900">{service.title}</h3>
                <p className="text-sm text-neutral-500 line-clamp-2">{service.description}</p>
                
                <div className="mt-3 pt-3 border-t border-slate-100 w-full flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
                    <span className="text-xs font-medium text-slate-600">{service.workers.length} worker(s)</span>
                  </div>
                  {(service.onlineCount || 0) > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-emerald-700">{service.onlineCount} online now</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // STEP 2: Worker Selection
  if (!selectedWorker) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] text-[#1b1c1c] flex flex-col pb-28 pt-14 px-4 md:px-8 max-w-4xl mx-auto overflow-x-hidden">
        <header className="mb-6 flex items-center gap-3">
          <button
            onClick={() => setSelectedService(null)}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-xs shrink-0"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-neutral-900 tracking-tight">Select a Professional</h1>
            <p className="text-sm text-neutral-500">Verified experts for {selectedService.title}</p>
          </div>
        </header>

        <div className="space-y-4">
          {selectedService.workers.map(worker => (
            <div key={worker.id} className={`bg-white rounded-2xl p-4 md:p-5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center shadow-xs border-2 transition-all ${
              worker.is_online ? 'border-emerald-300' : 'border-slate-200'
            }`}>
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200">
                    {worker.avatar_url ? (
                      <img src={worker.avatar_url} alt={worker.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-2xl text-slate-400">person</span>
                    )}
                  </div>
                  {/* Online dot */}
                  <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${
                    worker.is_online ? 'bg-emerald-500' : 'bg-slate-300'
                  }`} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-neutral-900 flex items-center gap-2">
                    {worker.name}
                    <span className="material-symbols-outlined text-sm text-emerald-600 fill">verified</span>
                    {worker.is_online ? (
                      <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                        ONLINE
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">
                        OFFLINE
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-neutral-600 mt-1 font-medium">
                    <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                      <span className="material-symbols-outlined text-sm fill">star</span>
                      {worker.rating.toFixed(1)}
                    </span>
                    <span>{worker.total_jobs} jobs completed</span>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <button
                  onClick={() => setSelectedWorker(worker)}
                  className={`w-full text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 ${
                    worker.is_online
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-black hover:bg-neutral-800 text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{worker.is_online ? 'bolt' : 'person'}</span>
                  <span>{worker.is_online ? 'Book Now' : 'Select Worker'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // STEP 3: Booking Form
  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1b1c1c] flex flex-col pb-28 pt-14 px-4 md:px-8 max-w-4xl mx-auto overflow-x-hidden">
      <header className="mb-6 flex items-center gap-3">
        <button
          onClick={() => setSelectedWorker(null)}
          className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-xs shrink-0"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-neutral-900 tracking-tight">Complete Booking</h1>
          <p className="text-sm text-neutral-500">{selectedService.title}</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        
        {/* Booking Summary Card */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Assigned Professional</p>
            <p className="font-bold text-neutral-900">{selectedWorker.name}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Base Price</p>
            <p className="font-bold text-black text-lg">₹{selectedService.base_price}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-neutral-900 block">Preferred Date</label>
            <input 
              type="date" 
              required
              min={new Date().toISOString().split('T')[0]}
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-neutral-900 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-neutral-900 block">Preferred Time Slot</label>
            <select 
              required
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-neutral-900 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none"
            >
              <option value="">Select a time slot</option>
              <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
              <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
              <option value="Evening (4 PM - 7 PM)">Evening (4 PM - 7 PM)</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-900 block">Additional Notes (Optional)</label>
          <textarea 
            rows={3}
            placeholder="E.g., Please ring the doorbell, dogs inside..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-neutral-900 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full text-white text-sm font-semibold py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
            isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-black hover:bg-neutral-800 active:scale-[0.98]'
          }`}
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <span className="material-symbols-outlined text-lg">check_circle</span>
          )}
          <span>{isSubmitting ? 'Confirming...' : 'Confirm Booking'}</span>
        </button>

      </form>
    </div>
  );
};

