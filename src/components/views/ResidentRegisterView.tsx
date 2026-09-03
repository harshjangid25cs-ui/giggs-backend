import React, { useState } from 'react';
import { ScreenId, UserRole } from '../../types';

interface ResidentRegisterViewProps {
  onNavigate: (screen: ScreenId, role?: UserRole) => void;
  onRegisterSuccess: (details: {
    societyName: string;
    flatNo: string;
    floor?: string;
    landmark?: string;
    fullName: string;
    phone: string;
    email: string;
  }) => void;
}

export const ResidentRegisterView: React.FC<ResidentRegisterViewProps> = ({
  onNavigate,
  onRegisterSuccess
}) => {
  const [societyName, setSocietyName] = useState('');
  const [flatNo, setFlatNo] = useState('');
  const [floor, setFloor] = useState('');
  const [landmark, setLandmark] = useState('');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const cleanDigits = phone.replace(/\D/g, '').slice(0, 10);
    const formattedPhone = cleanDigits ? `+91 ${cleanDigits}` : phone;

    setTimeout(() => {
      setIsLoading(false);
      onRegisterSuccess({
        societyName,
        flatNo,
        floor,
        landmark,
        fullName,
        phone: formattedPhone,
        email
      });
      onNavigate('resident_home', 'resident');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3] text-[#1b1c1c] flex flex-col items-center justify-start px-4 py-6 md:py-10">
      {/* Top Bar Header (Pixel-perfect matching Figma prototype) */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <button
          onClick={() => onNavigate('welcome', 'resident')}
          className="flex items-center gap-2 text-neutral-900 hover:text-black font-extrabold text-xl tracking-tight group"
        >
          <span className="material-symbols-outlined text-2xl group-hover:-translate-x-1 transition-transform">
            arrow_back
          </span>
          <span>GIGGS</span>
        </button>
        <span className="text-xs font-semibold px-2.5 py-1 bg-black text-white rounded-full">
          Resident Registration
        </span>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md bg-[#f3f3f3] md:bg-white md:rounded-2xl md:shadow-lg md:border md:border-slate-200 overflow-hidden">
        {/* Title Section (Figma Exact Copy) */}
        <div className="pt-2 pb-4 md:px-6">
          <h1 className="text-3xl font-extrabold text-black tracking-tight mb-2">
            Address Details
          </h1>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Where should we deliver your services? We need a few details to locate you accurately within your community.
          </p>
        </div>

        {/* Address Card (Figma Exact Styling) */}
        <form onSubmit={handleSubmit} className="space-y-4 md:px-6 pb-6">
          <div className="bg-[#eef0f2]/60 md:bg-neutral-50/80 rounded-2xl p-4 md:p-5 border border-slate-200/80 space-y-4">
            {/* Society / Building Name */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-neutral-600">domain</span>
                <span>Society / Building Name</span>
              </label>
              <input
                type="text"
                required
                value={societyName}
                onChange={(e) => setSocietyName(e.target.value)}
                placeholder="e.g., Green Valley Apartments"
                className="w-full px-4 py-3 bg-[#e5e7eb]/80 md:bg-white border border-slate-300/70 rounded-xl text-sm font-medium text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
              />
            </div>

            {/* Flat / Villa Number */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-neutral-600">home</span>
                <span>Flat / Villa Number</span>
              </label>
              <input
                type="text"
                required
                value={flatNo}
                onChange={(e) => setFlatNo(e.target.value)}
                placeholder="e.g., A-402"
                className="w-full px-4 py-3 bg-[#e5e7eb]/80 md:bg-white border border-slate-300/70 rounded-xl text-sm font-medium text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
              />
            </div>

            {/* Floor (Optional) */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-neutral-600">swap_vert</span>
                <span>Floor <span className="text-neutral-500 font-normal">(Optional)</span></span>
              </label>
              <input
                type="text"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder="e.g., 4th"
                className="w-full px-4 py-3 bg-[#e5e7eb]/80 md:bg-white border border-slate-300/70 rounded-xl text-sm font-medium text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
              />
            </div>

            {/* Landmark */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-neutral-600">location_on</span>
                <span>Landmark</span>
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g., Near Main Gate"
                className="w-full px-4 py-3 bg-[#e5e7eb]/80 md:bg-white border border-slate-300/70 rounded-xl text-sm font-medium text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
              />
            </div>
          </div>

          {/* Personal Account Details */}
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Resident Contact Details
            </h3>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Arun Verma"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">Mobile Phone Number</label>
              <div className="flex rounded-xl border border-slate-300 bg-neutral-50 overflow-hidden focus-within:bg-white focus-within:ring-2 focus-within:ring-black transition-all">
                <span className="inline-flex items-center px-3.5 bg-neutral-200 border-r border-slate-300 text-sm font-extrabold text-neutral-700 select-none">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  maxLength={10}
                  className="w-full px-3.5 py-2.5 bg-transparent text-sm font-medium focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="arun.verma@greenvalley.res"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">Create Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all"
              />
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black hover:bg-neutral-800 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all hover:shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Saving Details...</span>
              </>
            ) : (
              <>
                <span>Save & Complete Registration</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Existing Account Switch */}
        <div className="py-4 text-center text-xs text-neutral-500 bg-white border-t border-slate-100">
          Already registered as a resident?{' '}
          <button
            type="button"
            onClick={() => onNavigate('resident_login', 'resident')}
            className="text-black font-extrabold hover:underline"
          >
            Log In Here
          </button>
        </div>
      </div>
    </div>
  );
};
