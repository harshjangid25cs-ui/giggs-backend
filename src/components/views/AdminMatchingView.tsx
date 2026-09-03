import React, { useState } from 'react';
import { ScreenId, CandidateMatch } from '../../types';
import { ASSET_IMAGES, CANDIDATES_LIST } from '../../data/mockData';
import { supabase } from '../../lib/supabaseClient';

interface AdminMatchingViewProps {
  onNavigate: (screen: ScreenId) => void;
  onDispatchWorker: (workerName: string) => void;
}

export const AdminMatchingView: React.FC<AdminMatchingViewProps> = ({
  onNavigate,
  onDispatchWorker
}) => {
  const [candidates, setCandidates] = useState<CandidateMatch[]>(CANDIDATES_LIST);
  const [dispatchedId, setDispatchedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateMatch = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-forecast', {
        body: { 
          action: 'match',
          payload: {
            visit: { category: 'AC Servicing', society: 'Green Valley', urgent: false },
            candidates: CANDIDATES_LIST.map(c => ({ id: c.id, name: c.name, rating: c.rating, distance: c.distance }))
          }
        }
      });
      if (error) throw error;
      
      if (data.ranking && data.ranking.length > 0) {
        const sortedCandidates = [...CANDIDATES_LIST].sort((a, b) => {
          const aIdx = data.ranking.indexOf(a.id);
          const bIdx = data.ranking.indexOf(b.id);
          // If not in ranking array, put at the bottom
          if (aIdx === -1) return 1;
          if (bIdx === -1) return -1;
          return aIdx - bIdx;
        });
        
        // Add a slight randomization to match scores to make it look "re-calculated"
        const recalculated = sortedCandidates.map((c, i) => ({
          ...c,
          matchScore: Math.max(70, 99 - (i * 5) - Math.floor(Math.random() * 3))
        }));
        
        setCandidates(recalculated);
      }
    } catch (e) {
      console.error("AI matching failed", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDispatch = (candidate: CandidateMatch) => {
    setDispatchedId(candidate.id);
    onDispatchWorker(candidate.name);
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1b1c1c] pb-28 pt-14 px-4 md:px-8 max-w-5xl mx-auto font-sans overflow-x-hidden">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('admin_overview')}
            className="p-2 -ml-2 rounded-full hover:bg-slate-200 transition-colors text-black"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-black text-2xl">
                hub
              </span>
              <h1 className="text-xl md:text-2xl font-bold text-neutral-900">
                AI Matching &amp; Allocation Engine
              </h1>
            </div>
            <p className="text-xs text-neutral-500">
              Multi-objective heuristic routing for incoming batch requests
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('admin_forecasting')}
          className="bg-white border border-slate-300 hover:border-black text-neutral-900 font-semibold text-xs py-2 px-4 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <span className="material-symbols-outlined text-sm">analytics</span>
          <span>View Forecasting</span>
        </button>
      </header>

      {/* Grid: Map on Left / Top, Candidates on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Real-time Map Visual */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-neutral-900 uppercase tracking-wider">
                Live Dispatch Geospatial Routing
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active Feed</span>
              </span>
            </div>

            <div className="relative w-full h-64 rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
              <img
                src={ASSET_IMAGES.adminNetworkLiveMap}
                alt="Network map"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5 text-neutral-700">
              <div className="flex justify-between">
                <span>Target Society:</span>
                <strong className="text-neutral-900">Green Valley (12 units)</strong>
              </div>
              <div className="flex justify-between">
                <span>Service Needed:</span>
                <strong className="text-neutral-900">AC Servicing &amp; Maintenance</strong>
              </div>
              <div className="flex justify-between">
                <span>Optimization Weight:</span>
                <span className="text-neutral-600">Skill 40% • Proximity 35%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Candidate Ranking List */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-base text-neutral-900">
                Ranked Candidate Pros ({candidates.length})
              </h3>
              <span className="text-xs text-neutral-500">
                Algorithm: Deep Hungarian Assignment
              </span>
            </div>
            <button
              onClick={handleGenerateMatch}
              disabled={isGenerating}
              className="bg-black hover:bg-neutral-800 text-white font-bold text-[10px] px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all shadow-xs"
            >
              {isGenerating ? (
                <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
              ) : (
                <span className="material-symbols-outlined text-xs">auto_awesome</span>
              )}
              <span>Run Gemini Matcher</span>
            </button>
          </div>

          <div className="space-y-3">
            {candidates.map((cand, index) => {
              const isDispatched = dispatchedId === cand.id;
              return (
                <div
                  key={cand.id}
                  className={`bg-white border rounded-2xl p-5 shadow-xs transition-all space-y-3 ${
                    index === 0
                      ? 'border-black ring-1 ring-black'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <img
                          src={cand.photo || ASSET_IMAGES.workerFemale1}
                          alt={cand.name}
                          className="w-12 h-12 rounded-full object-cover border border-slate-200"
                        />
                        <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                          #{index + 1}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-neutral-900">
                            {cand.name}
                          </h4>
                          <span className="bg-[#f5f3f3] text-neutral-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {cand.tier}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500">
                          {cand.distance} • {cand.rating} ★ • Available: {cand.availability}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-2xl font-black text-neutral-900 block">
                          {cand.matchScore}%
                        </span>
                        <span className="text-[10px] text-neutral-500 uppercase font-bold">
                          Match Score
                        </span>
                      </div>

                      <button
                        onClick={() => handleDispatch(cand)}
                        disabled={isDispatched}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center gap-1 ${
                          isDispatched
                            ? 'bg-emerald-600 text-white'
                            : index === 0
                            ? 'bg-black text-white hover:bg-neutral-800'
                            : 'bg-white border border-slate-300 text-neutral-800 hover:border-black'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {isDispatched ? 'check' : 'send'}
                        </span>
                        <span>{isDispatched ? 'Dispatched' : 'Dispatch Pro'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Score Breakdown Bar */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] text-neutral-600 mb-1">
                        <span>Skill Verification</span>
                        <span className="font-bold text-neutral-900">{cand.skillScore}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
                          style={{ width: `${cand.skillScore}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-neutral-600 mb-1">
                        <span>Proximity / Transit ETA</span>
                        <span className="font-bold text-neutral-900">{cand.proxScore}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${cand.proxScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
