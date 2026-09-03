import React, { useState, useEffect } from 'react';
import { ScreenId, ServiceVisit } from '../../types';
import { ASSET_IMAGES } from '../../data/mockData';
import { fetchServices, fetchWorkers, fetchOnlineWorkers, matchesCategory } from '../../lib/api';

interface SocietyNewVisitViewProps {
  onNavigate: (screen: ScreenId) => void;
  onCreateVisit: (visit: ServiceVisit, actualWorkerId?: string, actualServiceId?: string) => void | Promise<void>;
}

export const SocietyNewVisitView: React.FC<SocietyNewVisitViewProps> = ({
  onNavigate,
  onCreateVisit
}) => {
  const [services, setServices] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [onlineWorkers, setOnlineWorkers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [timeWindow, setTimeWindow] = useState('');
  const [assignedPro, setAssignedPro] = useState('');
  const [tier1Price, setTier1Price] = useState(549);
  const [tier2Price, setTier2Price] = useState(449);
  const [tier3Price, setTier3Price] = useState(399);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [fetchedServices, fetchedWorkers, fetchedOnline] = await Promise.all([
        fetchServices(),
        fetchWorkers(),
        fetchOnlineWorkers()
      ]);
      setServices(fetchedServices);
      setWorkers(fetchedWorkers);
      setOnlineWorkers(fetchedOnline);
      
      if (fetchedServices.length > 0) {
        setCategory(fetchedServices[0].category);
        setTitle(fetchedServices[0].title);
        setDescription(fetchedServices[0].description);
        setTier1Price(fetchedServices[0].base_price || 549);
        setTier2Price(fetchedServices[0].base_price ? fetchedServices[0].base_price - 50 : 449);
        setTier3Price(fetchedServices[0].base_price ? fetchedServices[0].base_price - 100 : 399);
      }
      
      // Prefer online verified workers
      const firstOnline = fetchedOnline[0];
      const firstWorker = fetchedWorkers[0];
      const defaultWorker = firstOnline || firstWorker;
      if (defaultWorker?.users?.name) {
        setAssignedPro(defaultWorker.users.name);
      }

      // Set default date
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 3);
      setDate(nextWeek.toISOString().split('T')[0]);
      setTimeWindow('09:00 AM - 05:00 PM');
      
      setIsLoading(false);
    }
    loadData();
  }, []);

  const filteredWorkers = workers.filter((pro: any) => {
    const skills = (pro.worker_skills || []).map((sk: any) => sk.skill_name || sk);
    if (pro.skills && Array.isArray(pro.skills)) skills.push(...pro.skills);
    if (skills.length === 0) return true;
    return skills.some((sk: string) => matchesCategory(sk, category));
  });

  const displayWorkers = filteredWorkers.length > 0 ? filteredWorkers : workers;
  
  // Separate online vs offline for display
  const displayOnlineIds = new Set(onlineWorkers.map((w: any) => w.id));
  const sortedDisplayWorkers = [...displayWorkers].sort((a: any, b: any) => {
    const aOnline = displayOnlineIds.has(a.id) ? 0 : 1;
    const bOnline = displayOnlineIds.has(b.id) ? 0 : 1;
    return aOnline - bOnline;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const selectedService = services.find(s => s.title === title || s.category === category);
    const selectedWorker = displayWorkers.find(w => w.users?.name === assignedPro) || displayWorkers[0];
    
    const newVisit: ServiceVisit = {
      id: `sv-${Date.now()}`,
      title,
      category,
      societyName: 'Green Valley Society',
      address: 'Sector 4, Palm Boulevard',
      date,
      timeWindow,
      proName: assignedPro || selectedWorker?.users?.name || 'Verified Pro',
      proRating: selectedWorker?.rating || 4.9,
      proReviewsCount: 94,
      proPhoto: selectedWorker?.users?.avatar_url || ASSET_IMAGES.workerRameshInvited,
      proSpecialty: 'Certified Professional',
      currentRate: tier1Price,
      originalRate: tier1Price + 150,
      joinedCount: 0,
      targetCount: 15,
      nextTierRate: tier2Price,
      remainingForNextTier: 6,
      status: 'active',
      description,
      tiers: [
        { id: 't1', name: 'Base Tier (1-5)', minParticipants: 1, maxParticipants: 5, price: tier1Price },
        { id: 't2', name: 'Tier 2 (6-14)', minParticipants: 6, maxParticipants: 14, price: tier2Price },
        { id: 't3', name: 'Tier 3 (15+)', minParticipants: 15, maxParticipants: 30, price: tier3Price }
      ]
    };
    await onCreateVisit(newVisit, selectedWorker?.id, selectedService?.id);
    setIsSubmitting(false);
    onNavigate('society_dashboard');
  };

  const getCategoryIcon = (catName: string) => {
    const cat = catName.toLowerCase();
    if (cat.includes('ac')) return 'ac_unit';
    if (cat.includes('elec')) return 'bolt';
    if (cat.includes('plumb')) return 'plumbing';
    if (cat.includes('car')) return 'directions_car';
    if (cat.includes('appliance')) return 'microwave';
    if (cat.includes('carpent')) return 'carpenter';
    if (cat.includes('paint')) return 'format_paint';
    if (cat.includes('clean')) return 'cleaning_services';
    if (cat.includes('lock')) return 'lock';
    return 'build';
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1b1c1c] p-4 sm:p-6 pb-28 pt-14 flex flex-col items-center overflow-x-hidden">
      {/* Top Header */}
      <header className="w-full max-w-2xl mb-6 flex items-center justify-between">
        <button
          onClick={() => onNavigate('society_dashboard')}
          className="flex items-center gap-1 text-xs font-semibold text-neutral-600 hover:text-black transition-colors"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          <span>Back to Dashboard</span>
        </button>
        <span className="text-sm font-bold text-neutral-900">
          New Service Visit
        </span>
        <div className="w-16"></div>
      </header>

      <main className="w-full max-w-2xl bg-white rounded-2xl shadow-md border border-slate-200 p-6 md:p-8 animate-fade-in">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
              Schedule Society Service Visit
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Bundle maintenance across apartments to secure lower rates for residents.
            </p>
          </div>

          {/* 1. Category Selector */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
              Service Category
            </label>
            {isLoading ? (
              <div className="text-sm text-neutral-500">Loading services...</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Array.from(new Set(services.map(s => s.category))).map((catName: any) => {
                  const icon = getCategoryIcon(catName);
                  return (
                    <button
                      type="button"
                      key={catName}
                      onClick={() => {
                        setCategory(catName);
                        const firstService = services.find(s => s.category === catName);
                        if (firstService) {
                          setTitle(firstService.title);
                          setDescription(firstService.description);
                          setTier1Price(firstService.base_price || 549);
                          setTier2Price(firstService.base_price ? firstService.base_price - 50 : 449);
                          setTier3Price(firstService.base_price ? firstService.base_price - 100 : 399);
                        }
                        // Reset assigned pro to first available worker for this category
                        const matching = workers.filter((pro: any) => {
                          const skills = (pro.worker_skills || []).map((sk: any) => sk.skill_name || sk);
                          return skills.some((sk: string) => matchesCategory(sk, catName));
                        });
                        if (matching.length > 0 && matching[0].users?.name) {
                          setAssignedPro(matching[0].users.name);
                        }
                      }}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2 ${
                        category === catName
                          ? 'border-black bg-neutral-100 ring-1 ring-black font-semibold'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-neutral-700'
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">
                        {icon}
                      </span>
                      <span className="text-xs truncate">{catName}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Visit Title & Description */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1" htmlFor="visit_title">
                Visit Title
              </label>
              <input
                id="visit_title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-300 focus:border-black focus:ring-1 focus:ring-black text-xs py-2.5 px-3 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1" htmlFor="visit_desc">
                Scope &amp; Details for Residents
              </label>
              <textarea
                id="visit_desc"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-300 focus:border-black focus:ring-1 focus:ring-black text-xs p-3 outline-none"
              ></textarea>
            </div>
          </div>

          {/* 3. Date & Time Window */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1" htmlFor="visit_date">
                Scheduled Date
              </label>
              <input
                id="visit_date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 focus:border-black focus:ring-1 focus:ring-black text-xs py-2.5 px-3 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1" htmlFor="time_win">
                On-Site Time Window
              </label>
              <input
                id="time_win"
                type="text"
                value={timeWindow}
                onChange={(e) => setTimeWindow(e.target.value)}
                placeholder="e.g. 09:00 AM - 05:00 PM"
                className="w-full rounded-xl border border-slate-300 focus:border-black focus:ring-1 focus:ring-black text-xs py-2.5 px-3 outline-none"
              />
            </div>
          </div>

          {/* 4. Assign Pro */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Assign Certified Pro ({displayWorkers.length} available)
              </label>
              <span className="text-[11px] text-slate-500 font-medium">Filtered by {category}</span>
            </div>
            {isLoading ? (
              <div className="text-sm text-neutral-500">Loading workers...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sortedDisplayWorkers.map((pro: any) => {
                  const isOnline = displayOnlineIds.has(pro.id);
                  return (
                  <label
                    key={pro.id}
                    onClick={() => setAssignedPro(pro.users?.name)}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      assignedPro === pro.users?.name
                        ? 'border-black bg-neutral-100 ring-1 ring-black'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={pro.users?.avatar_url || ASSET_IMAGES.workerRameshInvited}
                        alt={pro.users?.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                      {/* Online indicator dot */}
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                      }`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <div className="text-xs font-bold text-neutral-900 truncate">
                          {pro.users?.name}
                        </div>
                        {isOnline && (
                          <span className="text-[9px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-full shrink-0">
                            ONLINE
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        {pro.rating || '4.9'} ★ • {category}
                      </div>
                    </div>
                  </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* 5. Volume Pricing Tiers */}
          <div className="bg-[#f5f3f3] p-4 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3">
              Volume Pricing Discount Tiers (Per Apartment)
            </h3>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-neutral-500 mb-1 font-medium">
                  Tier 1 (1-5 homes)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 font-bold text-neutral-500">₹</span>
                  <input
                    type="number"
                    value={tier1Price}
                    onChange={(e) => setTier1Price(Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-neutral-900 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-500 mb-1 font-medium">
                  Tier 2 (6-14 homes)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 font-bold text-neutral-500">₹</span>
                  <input
                    type="number"
                    value={tier2Price}
                    onChange={(e) => setTier2Price(Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-neutral-900 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-500 mb-1 font-medium">
                  Tier 3 (15+ homes)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 font-bold text-neutral-500">₹</span>
                  <input
                    type="number"
                    value={tier3Price}
                    onChange={(e) => setTier3Price(Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-neutral-900 outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black hover:bg-neutral-800 disabled:bg-neutral-500 disabled:cursor-not-allowed text-white font-bold text-sm py-4 rounded-xl shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>{isSubmitting ? 'Publishing...' : 'Publish & Open Registrations'}</span>
            {!isSubmitting && <span className="material-symbols-outlined text-base">send</span>}
          </button>
        </form>
      </main>
    </div>
  );
};
