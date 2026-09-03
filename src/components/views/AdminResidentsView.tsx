import React, { useState, useEffect } from 'react';
import { ScreenId } from '../../types';
import { fetchSocietiesAndResidents } from '../../lib/adminApi';

interface AdminResidentsViewProps {
  onNavigate: (screen: ScreenId) => void;
  adminEmail?: string;
}

export const AdminResidentsView: React.FC<AdminResidentsViewProps> = ({
  onNavigate,
  adminEmail
}) => {
  const [societies, setSocieties] = useState<any[]>([]);
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSocietyFilter, setSelectedSocietyFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'residents' | 'societies'>('residents');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchSocietiesAndResidents();
      setSocieties(data.societies);
      setResidents(data.residents);
    } catch (err) {
      console.error('Failed to load societies & residents:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredResidents = residents.filter((r) => {
    const nameMatch = (r.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const phoneMatch = (r.phone || '').includes(searchQuery);
    const emailMatch = (r.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const flatMatch = (r.flat_no || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSearch = nameMatch || phoneMatch || emailMatch || flatMatch;

    if (selectedSocietyFilter === 'ALL') return matchesSearch;
    return matchesSearch && r.society_id === selectedSocietyFilter;
  });

  const filteredSocieties = societies.filter((s) => {
    return (
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.city.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-24 text-neutral-900">
      {/* Top Header */}
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
                <span className="material-symbols-outlined text-slate-800">apartment</span>
                Societies & Resident Directory
              </h1>
              <p className="text-xs text-slate-500">
                View platform customers, registered societies, and resident accounts
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Metric Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="material-symbols-outlined text-slate-500 mb-1">domain</span>
            <p className="text-xs font-bold text-slate-500">Active Societies</p>
            <p className="text-2xl font-black text-neutral-900 mt-1">{societies.length}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="material-symbols-outlined text-slate-500 mb-1">groups</span>
            <p className="text-xs font-bold text-slate-500">Total Residents</p>
            <p className="text-2xl font-black text-neutral-900 mt-1">{residents.length}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="material-symbols-outlined text-slate-500 mb-1">home</span>
            <p className="text-xs font-bold text-slate-500">Total Society Flats</p>
            <p className="text-2xl font-black text-neutral-900 mt-1">
              {societies.reduce((sum, s) => sum + (s.total_flats || 0), 0)}
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="material-symbols-outlined text-slate-500 mb-1">verified_user</span>
            <p className="text-xs font-bold text-slate-500">Verified Coverage</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">100%</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex border-b md:border-b-0 border-slate-200 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('residents')}
              className={`py-2 px-5 font-extrabold text-xs rounded-xl transition-all ${
                activeTab === 'residents'
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Residents ({residents.length})
            </button>
            <button
              onClick={() => setActiveTab('societies')}
              className={`py-2 px-5 font-extrabold text-xs rounded-xl transition-all ${
                activeTab === 'societies'
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Societies ({societies.length})
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'residents' ? 'Search resident, phone, flat...' : 'Search society name, city...'}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all"
            />
          </div>
        </div>

        {/* Tab 1: Residents List */}
        {activeTab === 'residents' && (
          <div>
            {/* Society Filter Options */}
            {societies.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4">
                <button
                  onClick={() => setSelectedSocietyFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                    selectedSocietyFilter === 'ALL'
                      ? 'bg-black text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  All Societies
                </button>
                {societies.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSocietyFilter(s.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                      selectedSocietyFilter === s.id
                        ? 'bg-black text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-black rounded-full animate-spin mb-4" />
                <p className="text-sm font-medium text-slate-500">Loading resident directory...</p>
              </div>
            ) : filteredResidents.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">
                  person_off
                </span>
                <h3 className="font-bold text-base text-slate-700">No residents found</h3>
                <p className="text-xs text-slate-500 mt-1">Try clearing filters or search terms.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResidents.map((res) => (
                  <div
                    key={res.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                        {res.avatar_url ? (
                          <img src={res.avatar_url} alt={res.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-2xl text-slate-400">person</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-neutral-900">{res.name}</h3>
                        <p className="text-xs text-slate-500 font-mono">{res.phone}</p>
                        <p className="text-[11px] text-slate-400 font-medium">
                          Flat {res.flat_no || 'N/A'} • {res.societies?.name || 'Unassigned Society'}
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold text-[11px] rounded-lg">
                      Resident
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Societies List */}
        {activeTab === 'societies' && (
          <div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-black rounded-full animate-spin mb-4" />
                <p className="text-sm font-medium text-slate-500">Loading societies...</p>
              </div>
            ) : filteredSocieties.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">
                  domain_disabled
                </span>
                <h3 className="font-bold text-base text-slate-700">No societies found</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSocieties.map((society) => (
                  <div
                    key={society.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-extrabold text-base text-neutral-900">{society.name}</h3>
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-full border border-emerald-100">
                          {society.total_flats || 0} Flats
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                        <span className="material-symbols-outlined text-sm text-slate-400">location_on</span>
                        {society.address}, {society.city}, {society.state} {society.pincode}
                      </p>

                      {society.contact_person && (
                        <p className="text-xs text-slate-600 font-medium">
                          Contact: {society.contact_person} ({society.contact_phone || 'N/A'})
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
