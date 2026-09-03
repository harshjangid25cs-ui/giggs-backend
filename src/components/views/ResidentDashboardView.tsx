import React, { useState, useEffect } from 'react';
import { ScreenId, ServiceVisit, Booking } from '../../types';
import { ASSET_IMAGES } from '../../data/mockData';
import { fetchResidentDirectBookings } from '../../lib/api';
interface ResidentDashboardViewProps {
  serviceVisits: ServiceVisit[];
  bookings: Booking[];
  userName?: string;
  userId?: string;
  onNavigate: (screen: ScreenId) => void;
  onJoinVisit: (visitId: string) => void;
  onSelectBooking: (booking: Booking) => void;
}

export const ResidentDashboardView: React.FC<ResidentDashboardViewProps> = ({
  serviceVisits,
  bookings,
  userName,
  onNavigate,
  onJoinVisit,
  onSelectBooking,
  userId
}) => {
  const [directBookings, setDirectBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => {
    if (userId) {
      loadDirectBookings(userId);
    }
  }, [userId]);

  const loadDirectBookings = async (userId: string) => {
    try {
      setLoadingBookings(true);
      const data = await fetchResidentDirectBookings(userId);
      setDirectBookings(data);
    } catch (err) {
      console.error('Failed to load direct bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const activeVisit = serviceVisits[0] || {
    id: 'sv-1',
    title: 'AC Servicing & Repair',
    category: 'Appliance Repair',
    societyName: 'Green Valley Society',
    currentRate: 449,
    originalRate: 699,
    joinedCount: 12,
    targetCount: 15,
    nextTierRate: 399,
    remainingForNextTier: 3,
    description: 'Certified technicians currently on-site in Green Valley. Join the group booking to unlock lower rates.'
  };

  const progressPercentage = Math.min(
    100,
    Math.round((activeVisit.joinedCount / activeVisit.targetCount) * 100)
  );

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1b1c1c] pb-28 pt-14 px-4 md:px-8 max-w-4xl mx-auto overflow-x-hidden">
      {/* Welcome Section */}
      <section className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">
            Hello, {userName || 'Resident'}!
          </h1>
          <div className="flex items-center gap-1 mt-1 text-neutral-600 text-sm font-medium">
            <span className="material-symbols-outlined text-base">location_on</span>
            <span>Green Valley Society</span>
          </div>
        </div>
      </section>

      {/* Quick Action Bento Grid */}
      <section className="grid grid-cols-3 gap-2 sm:gap-3 mb-8">
        {/* Book a Service */}
        <button
          onClick={() => onNavigate('resident_book_service')}
          className="bg-white border border-slate-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center gap-1.5 transition-all group text-center"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-neutral-100 text-neutral-900 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
            <span className="material-symbols-outlined text-lg sm:text-xl">home_repair_service</span>
          </div>
          <span className="font-semibold text-[10px] sm:text-xs text-neutral-900 leading-tight">Book Service</span>
        </button>

        {/* My Visits */}
        <button
          onClick={() => onNavigate('resident_checkout')}
          className="bg-white border border-slate-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center gap-1.5 transition-all group text-center"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-neutral-100 text-neutral-900 flex items-center justify-center group-hover:bg-neutral-300 transition-colors">
            <span className="material-symbols-outlined text-lg sm:text-xl">calendar_today</span>
          </div>
          <span className="font-semibold text-[10px] sm:text-xs text-neutral-900 leading-tight">My Visits</span>
        </button>

        {/* Emergency SOS */}
        <button
          onClick={() => onNavigate('resident_emergency')}
          className="bg-red-50 border border-red-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center gap-1.5 transition-all group text-center"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-red-600 text-white flex items-center justify-center pulse-urgent shadow-sm">
            <span className="material-symbols-outlined text-lg sm:text-xl fill">emergency</span>
          </div>
          <span className="font-bold text-[10px] sm:text-xs text-red-700 leading-tight">SOS</span>
        </button>
      </section>

      {/* Active Service Visits in your Society */}
      <section className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-xl text-neutral-900">
            Active Service Visits in your Society
          </h2>
          <button
            onClick={() => onNavigate('resident_invite')}
            className="text-xs font-semibold text-black hover:underline"
          >
            View All
          </button>
        </div>

        {/* Hero Active Visit Card */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden flex flex-col relative group max-w-full">
          {/* Volume Discount Badge */}
          <div className="absolute top-4 right-4 bg-neutral-800 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm z-10 flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">trending_down</span>
            <span>Volume Discount</span>
          </div>

          {/* Thumbnail Image */}
          <div className="w-full h-44 sm:h-52 relative overflow-hidden shrink-0">
            <img
              src={ASSET_IMAGES.acServiceRepair}
              alt="AC Service"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Right Content */}
          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-1.5 text-black mb-1">
                <span className="material-symbols-outlined text-sm">ac_unit</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                  {activeVisit.category}
                </span>
              </div>
              <h3 className="text-xl font-bold text-neutral-900">
                {activeVisit.title}
              </h3>
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                {activeVisit.description}
              </p>
            </div>

            {/* Price & Progress Box */}
            <div className="bg-[#f5f3f3] p-3.5 rounded-xl border border-slate-200/70">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <span className="text-[11px] text-neutral-500 font-medium block">Current Rate</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-black">
                      ₹{activeVisit.currentRate}
                    </span>
                    <span className="text-xs text-neutral-400 line-through">
                      ₹{activeVisit.originalRate}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-neutral-500 font-medium block">Tier Goal</span>
                  <span className="text-xs font-bold text-neutral-900">
                    {activeVisit.joinedCount} / {activeVisit.targetCount} Joined
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-neutral-800 rounded-full transition-all duration-700"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>

              <p className="text-[11px] text-neutral-600 font-medium mt-2 text-center">
                {activeVisit.remainingForNextTier || 3} more bookings to unlock ₹{activeVisit.nextTierRate || 399} rate!
              </p>
            </div>

            {/* Join Button */}
            <button
              onClick={() => onJoinVisit(activeVisit.id)}
              className="w-full bg-black text-white text-sm font-semibold py-3 px-4 rounded-xl hover:bg-neutral-800 transition-all shadow-xs flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <span>Join Service List</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* Direct Bookings */}
      <section className="space-y-3 mb-8">
        <h2 className="font-bold text-xl text-neutral-900">My Bookings</h2>
        
        {loadingBookings ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
          </div>
        ) : directBookings.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center">
            <p className="text-slate-500 text-sm">You have no upcoming direct bookings.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {directBookings.map((dbBooking) => (
              <div
                key={dbBooking.id}
                className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col hover:bg-slate-50 transition-all shadow-xs"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700">
                      <span className="material-symbols-outlined text-lg">
                        {dbBooking.service?.category === 'plumbing'
                          ? 'water_drop'
                          : dbBooking.service?.category === 'electrical'
                          ? 'electrical_services'
                          : 'ac_unit'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-neutral-900">
                        {dbBooking.service?.title || 'Service Booking'}
                      </h4>
                      <p className="text-xs text-neutral-500">
                        ₹{dbBooking.service?.base_price} • With {dbBooking.worker?.users?.name}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide
                    ${dbBooking.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      dbBooking.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border border-red-100' :
                      'bg-amber-50 text-amber-700 border border-amber-100'}`}
                  >
                    {dbBooking.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                    <span className="material-symbols-outlined text-[14px]">event</span>
                    {new Date(dbBooking.preferred_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    {dbBooking.preferred_time_slot}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Legacy Recent Bookings (mock) */}
      {bookings.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-bold text-xl text-neutral-900">Past Service Visits</h2>
          <div className="space-y-2.5">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                onClick={() => onSelectBooking(booking)}
                className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer group shadow-xs"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 group-hover:bg-neutral-200 transition-colors">
                    <span className="material-symbols-outlined text-xl">
                      {booking.category === 'plumbing'
                        ? 'water_drop'
                        : booking.category === 'electrical'
                        ? 'electrical_services'
                        : 'ac_unit'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-neutral-900">
                      {booking.serviceTitle}
                    </h4>
                    <p className="text-xs text-neutral-500">
                      {booking.date} • {booking.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-neutral-100 text-neutral-800 text-[11px] font-semibold px-3 py-1 rounded-full">
                    {booking.status}
                  </span>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-black text-base">
                    chevron_right
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
