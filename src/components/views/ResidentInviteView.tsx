import React, { useState, useEffect } from 'react';
import { ScreenId, ServiceVisit } from '../../types';
import { ASSET_IMAGES } from '../../data/mockData';
import { getServiceVisitByToken } from '../../lib/api';

interface ResidentInviteViewProps {
  visit?: ServiceVisit;
  onNavigate: (screen: ScreenId) => void;
  onRegisterSuccess: (visitId: string, flatNo: string, phone: string, slot: string, name?: string) => void | Promise<void>;
}

export const ResidentInviteView: React.FC<ResidentInviteViewProps> = ({
  visit: initialVisit,
  onNavigate,
  onRegisterSuccess
}) => {
  const [residentName, setResidentName] = useState('');
  const [visit, setVisit] = useState<ServiceVisit | undefined>(initialVisit);
  const [flatNo, setFlatNo] = useState('');
  const [phone, setPhone] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(() => {
    // Start in loading state if there's a token in the URL (shared link flow)
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token');
    const pathParts = window.location.pathname.split('/');
    const visitId = pathParts[2];
    return !!(token && visitId);
  });
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Sync prop changes to local state (e.g. when parent loads data late)
  useEffect(() => {
    if (initialVisit && (!visit || visit.id !== initialVisit.id)) {
      setVisit(initialVisit);
    }
  }, [initialVisit]);

  useEffect(() => {
    // If there's a token in the URL, always fetch from DB (source of truth for shared links)
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token');
    const pathParts = window.location.pathname.split('/');
    const visitId = pathParts[2]; // e.g. /join/sv-123

    if (token && visitId) {
      const fetchVisit = async () => {
        setIsFetching(true);
        try {
          const dbVisit = await getServiceVisitByToken(visitId, token);
          if (dbVisit) {
            // Map DB fields back to our local ServiceVisit type
              const joinedCount = dbVisit.jobs?.[0]?.count || 0;
              const tiers = (dbVisit.tiers || []).map((t: any) => ({
                id: t.id,
                name: t.label,
                minParticipants: t.min_participants,
                maxParticipants: t.max_participants,
                price: t.price
              })).sort((a: any, b: any) => a.minParticipants - b.minParticipants);

              let activeTierIdx = 0;
              for (let i = 0; i < tiers.length; i++) {
                if (joinedCount >= tiers[i].minParticipants) {
                  activeTierIdx = i;
                }
              }
              const currentRate = tiers[activeTierIdx]?.price || 0;
              
              let nextRate;
              let remainForNext = 0;
              if (activeTierIdx < tiers.length - 1) {
                nextRate = tiers[activeTierIdx + 1].price;
                remainForNext = tiers[activeTierIdx + 1].minParticipants - joinedCount;
              }
              
              setVisit({
                id: dbVisit.id,
                title: dbVisit.service?.title || 'Unknown Service',
                category: dbVisit.service?.category || 'general',
                societyName: dbVisit.society?.name || 'Unknown Society',
                address: dbVisit.society?.address || '',
                date: dbVisit.date,
                timeWindow: dbVisit.time_window,
                proName: dbVisit.worker?.users?.name || 'Assigned Pro',
                proRating: dbVisit.worker?.rating || 4.5,
                proReviewsCount: 0,
                proPhoto: dbVisit.worker?.users?.avatar_url || ASSET_IMAGES.workerRajeshAssign,
                proSpecialty: 'Professional',
                currentRate,
                originalRate: tiers[0]?.price ? tiers[0].price + 150 : 0,
                joinedCount,
                targetCount: dbVisit.capacity,
                nextTierRate: nextRate,
                remainingForNextTier: remainForNext > 0 ? remainForNext : 0,
                status: 'active',
                description: dbVisit.service?.description || '',
                tiers,
                shareToken: token
              });
          }
        } catch (e: any) {
          console.warn('Failed to load visit from token:', e);
          if (e.message?.includes('expired')) {
            setFetchError(e.message);
            setVisit(undefined);
          } else {
            setFetchError('Could not load service visit. The link may be invalid or expired.');
            setVisit(undefined);
          }
        } finally {
          setIsFetching(false);
        }
      };
      fetchVisit();
    } else {
      setIsFetching(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!residentName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!flatNo.trim()) {
      setError('Please enter your Flat or Villa number');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '').slice(0, 10);
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setIsSubmitting(true);
    const formattedPhone = `+91 ${cleanPhone}`;
    await onRegisterSuccess(visit?.id || '', flatNo, formattedPhone, timeSlot || 'Any time during the day', residentName.trim());
    setIsSubmitting(false);
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex flex-col items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-semibold text-neutral-600">Verifying secure link...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex flex-col items-center justify-center p-8">
        <span className="material-symbols-outlined text-4xl text-red-500 mb-4">hourglass_disabled</span>
        <h2 className="text-xl font-bold text-center">Link Expired</h2>
        <p className="text-neutral-600 text-center mt-2 max-w-sm">{fetchError}</p>
        <button onClick={() => onNavigate('resident_home')} className="mt-6 px-6 py-3 bg-black text-white rounded-xl font-semibold shadow-xs">Go Home</button>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex flex-col items-center justify-center p-8">
        <h2 className="text-xl font-bold">Service Visit Not Found</h2>
        <button onClick={() => onNavigate('resident_home')} className="mt-4 px-4 py-2 bg-black text-white rounded-xl">Go Home</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1b1c1c] flex flex-col items-center justify-center p-4 sm:p-8 pt-14 pb-28 overflow-x-hidden">
      {/* Standalone Brand Header */}
      <header className="w-full max-w-[600px] mb-6 flex items-center justify-between">
        <button
          onClick={() => onNavigate('resident_home')}
          className="flex items-center gap-1 text-sm font-semibold text-neutral-600 hover:text-black transition-colors"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          <span>Back to Home</span>
        </button>
        <h1 className="text-xl font-black tracking-tight text-black">GIGGS</h1>
        <div className="w-16"></div>
      </header>

      <main className="w-full max-w-[600px] bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden animate-fade-in">
        {/* Hero Banner */}
        <div className="relative h-44 bg-[#1b1c1c] p-6 flex flex-col justify-end text-white">
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm">
            <span className="material-symbols-outlined text-sm fill text-amber-300">
              star
            </span>
            <span>Group Deal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1 text-white">
            You're Invited!
          </h2>
          <p className="text-sm text-neutral-300">
            Join the community service visit.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Service Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Main Service Card */}
            <div className="bg-[#fbf9f9] rounded-xl p-4 border border-slate-200 flex gap-4 items-center md:col-span-2 shadow-xs">
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-200">
                <img
                  className="w-full h-full object-cover"
                  src={visit.category.toLowerCase().includes('ac') ? ASSET_IMAGES.acUnitSolo : ASSET_IMAGES.workerRajeshAssign}
                  alt={visit.title}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base text-neutral-900">
                  {visit.title}
                </h3>
                <div className="flex items-center gap-1.5 mt-1 text-neutral-600 text-xs">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  <span>{visit.societyName || 'Green Valley Society'}</span>
                </div>
              </div>
            </div>

            {/* Worker Profile Card */}
            <div className="bg-[#fbf9f9] rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-center">
              <p className="text-[10px] font-bold text-neutral-400 mb-2 uppercase tracking-wider">
                Service Professional
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 shrink-0 border border-slate-200">
                  <img
                    className="w-full h-full object-cover"
                    src={visit.proPhoto}
                    alt={visit.proName}
                  />
                </div>
                <div>
                  <p className="font-bold text-sm text-neutral-900">{visit.proName}</p>
                  <div className="flex items-center gap-1 text-emerald-700 text-xs font-semibold">
                    <span className="material-symbols-outlined text-sm fill">verified</span>
                    <span>Verified Pro</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Date & Price Card */}
            <div className="bg-[#fbf9f9] rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-center">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Scheduled For
                  </p>
                  <p className="text-sm font-semibold text-neutral-900 mt-1">
                    {visit.date}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {Math.max(0, visit.targetCount - visit.joinedCount)} slots remaining
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Group Price
                  </p>
                  <p className="text-xl font-black text-black mt-0.5">₹{visit.currentRate}</p>
                  {visit.nextTierRate && visit.remainingForNextTier && visit.remainingForNextTier > 0 && (
                    <p className="text-[10px] text-emerald-600 font-bold mt-1 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                      {visit.remainingForNextTier} more unlocks ₹{visit.nextTierRate}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="font-bold text-lg text-neutral-900 mb-4">
              Complete Your Registration
            </h3>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1" htmlFor="resident_name">
                  Your Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full rounded-xl border border-slate-300 focus:border-black focus:ring-1 focus:ring-black text-neutral-900 text-sm py-2.5 px-3.5 placeholder:text-neutral-400 outline-none transition-all"
                  id="resident_name"
                  placeholder="e.g. Rahul Sharma"
                  type="text"
                  value={residentName}
                  onChange={(e) => setResidentName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1" htmlFor="flat_no">
                  Flat / Villa No. <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full rounded-xl border border-slate-300 focus:border-black focus:ring-1 focus:ring-black text-neutral-900 text-sm py-2.5 px-3.5 placeholder:text-neutral-400 outline-none transition-all"
                  id="flat_no"
                  placeholder="e.g. A-104"
                  type="text"
                  value={flatNo}
                  onChange={(e) => setFlatNo(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1" htmlFor="phone">
                  Phone Number
                </label>
                <div className="flex rounded-xl border border-slate-300 bg-white overflow-hidden focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
                  <span className="inline-flex items-center px-3.5 bg-neutral-100 border-r border-slate-300 text-sm font-extrabold text-neutral-700 select-none">
                    +91
                  </span>
                  <input
                    className="w-full text-neutral-900 text-sm py-2.5 px-3.5 placeholder:text-neutral-400 outline-none transition-all"
                    id="phone"
                    placeholder="9876543210"
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1" htmlFor="time_slot">
                  Preferred Time Slot (Optional)
                </label>
                <select
                  className="w-full rounded-xl border border-slate-300 focus:border-black focus:ring-1 focus:ring-black text-neutral-900 text-sm py-2.5 px-3.5 bg-white outline-none transition-all cursor-pointer"
                  id="time_slot"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                >
                  <option value="">Any time during the day</option>
                  <option value="morning">Morning (9 AM - 12 PM)</option>
                  <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
                  <option value="evening">Evening (4 PM - 7 PM)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black hover:bg-neutral-800 disabled:bg-neutral-500 disabled:cursor-not-allowed text-white font-semibold text-sm py-3.5 rounded-xl shadow-xs transition-all active:scale-[0.98] mt-6 flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? 'Registering...' : 'Register Now'}</span>
                {!isSubmitting && <span className="material-symbols-outlined text-base">check_circle</span>}
              </button>

              <p className="text-center text-[11px] text-neutral-500 mt-3 leading-tight">
                By registering, you agree to our Terms of Service. Payment will be collected after service.
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
