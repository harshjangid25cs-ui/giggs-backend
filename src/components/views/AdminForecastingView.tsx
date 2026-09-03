import React, { useState } from 'react';
import { ScreenId } from '../../types';
import { HOTSPOTS_DATA } from '../../data/mockData';
import confetti from 'canvas-confetti';
import { supabase } from '../../lib/supabaseClient';

interface AdminForecastingViewProps {
  onNavigate: (screen: ScreenId) => void;
  onApplyPlan: () => void;
}

export const AdminForecastingView: React.FC<AdminForecastingViewProps> = ({
  onNavigate,
  onApplyPlan
}) => {
  const [selectedDay, setSelectedDay] = useState('Sat');
  const [planApplied, setPlanApplied] = useState(false);
  const [aiForecast, setAiForecast] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const forecastData = [
    { day: 'Mon', actual: 420, forecast: 430, height: '40%' },
    { day: 'Tue', actual: 480, forecast: 490, height: '45%' },
    { day: 'Wed', actual: 510, forecast: 505, height: '48%' },
    { day: 'Thu', actual: 560, forecast: 580, height: '55%' },
    { day: 'Fri', actual: 720, forecast: 740, height: '70%' },
    { day: 'Sat', actual: null, forecast: 980, height: '95%', isPeak: true },
    { day: 'Sun', actual: null, forecast: 890, height: '85%' }
  ];

  const handleGenerateForecast = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-forecast', {
        body: { action: 'forecast', payload: { visits: HOTSPOTS_DATA } }
      });
      if (error) throw error;
      setAiForecast(data.forecast);
    } catch (e) {
      console.error("AI forecast failed", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    setPlanApplied(true);
    confetti({
      particleCount: 50,
      spread: 60
    });
    onApplyPlan();
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1b1c1c] pb-28 pt-14 px-4 md:px-8 max-w-5xl mx-auto font-sans overflow-x-hidden">
      {/* Top Header */}
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
                analytics
              </span>
              <h1 className="text-xl md:text-2xl font-bold text-neutral-900">
                Demand Forecasting &amp; AI Staffing
              </h1>
            </div>
            <p className="text-xs text-neutral-500">
              Predictive neural models predicting 7-day society service surges
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('admin_matching')}
          className="bg-white border border-slate-300 hover:border-black text-neutral-900 font-semibold text-xs py-2 px-4 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <span className="material-symbols-outlined text-sm">hub</span>
          <span>Open AI Matching</span>
        </button>
      </header>

      {/* Predictive Volume Trajectory Chart */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              Weekly Service Volume Trajectory
            </h2>
            <p className="text-xs text-neutral-500">
              Predicted peak on Saturday (+340% HVAC demand surge due to temperature rise)
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-black"></span>
              <span>Actual Volume</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500"></span>
              <span>AI Projected Peak</span>
            </span>
          </div>
        </div>

        {/* Visual Bar Graph */}
        <div className="h-56 w-full flex items-end justify-between gap-2 pt-8 pb-2 px-2 border-b border-slate-200">
          {forecastData.map((d) => (
            <div
              key={d.day}
              onClick={() => setSelectedDay(d.day)}
              className="flex-1 flex flex-col items-center gap-2 h-full justify-end cursor-pointer group"
            >
              <span className="text-[10px] font-bold text-neutral-600 group-hover:text-black transition-colors">
                {d.forecast}
              </span>
              <div className="w-full max-w-[42px] bg-slate-100 rounded-t-lg relative overflow-hidden flex flex-col justify-end h-full">
                <div
                  className={`w-full rounded-t-lg transition-all duration-500 ${
                    d.isPeak
                      ? 'bg-emerald-500 shadow-md ring-2 ring-emerald-600'
                      : d.actual
                      ? 'bg-neutral-900'
                      : 'bg-neutral-400'
                  }`}
                  style={{ height: d.height }}
                ></div>
              </div>
              <span
                className={`text-xs font-bold ${
                  selectedDay === d.day
                    ? 'text-black underline font-black'
                    : 'text-neutral-500'
                }`}
              >
                {d.day}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Two Column Bento: Hotspots & AI Staffing Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hotspots List */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-neutral-900">
            Top Projected Hotspots
          </h3>
          <div className="space-y-2.5">
            {HOTSPOTS_DATA.map((hs) => (
              <div
                key={hs.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                    #{hs.rank}
                  </span>
                  <div>
                    <h4 className="font-bold text-neutral-900">{hs.name}</h4>
                    <span className="text-[11px] text-neutral-500">
                      {hs.category}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-emerald-700 block">
                    {hs.demandLevel}
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    {hs.confidence}% conf.
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations & Optimization Plan */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-base text-neutral-900">
                AI Staffing Optimization Directives
              </h3>
              <button
                onClick={handleGenerateForecast}
                disabled={isGenerating}
                className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 hover:bg-emerald-200 transition-colors"
              >
                {isGenerating ? (
                  <span className="w-3 h-3 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></span>
                ) : (
                  <span className="material-symbols-outlined text-xs">auto_awesome</span>
                )}
                <span>Generate Gemini AI Forecast</span>
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {aiForecast ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl whitespace-pre-wrap text-neutral-700 leading-relaxed max-h-[300px] overflow-y-auto">
                  {aiForecast}
                </div>
              ) : (
                <>
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-emerald-950">
                    <span className="material-symbols-outlined text-base text-emerald-700 mt-0.5 shrink-0">
                      wb_sunny
                    </span>
                    <div>
                      <strong className="block font-bold">Pre-position +8 HVAC Technicians</strong>
                      <span>
                        Green Valley Society &amp; Sector 4 ahead of Saturday 36°C heatwave to capture 100% of volume.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-neutral-800">
                    <span className="material-symbols-outlined text-base text-blue-600 mt-0.5 shrink-0">
                      water_drop
                    </span>
                    <div>
                      <strong className="block font-bold">Extend Evening Plumbing Shift (+4 pros)</strong>
                      <span>
                        Northridge Suburbs has 6 recurring leak calls between 6 PM - 9 PM.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-neutral-800">
                    <span className="material-symbols-outlined text-base text-amber-600 mt-0.5 shrink-0">
                      electrical_services
                    </span>
                    <div>
                      <strong className="block font-bold">Rebalance Commercial MCB Audits (+5 pros)</strong>
                      <span>
                        Shift general electricians to tech park for scheduled Saturday shutdown.
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleApply}
              disabled={planApplied}
              className={`w-full font-bold text-xs py-3.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 active:scale-95 ${
                planApplied
                  ? 'bg-emerald-700 text-white'
                  : 'bg-black text-white hover:bg-neutral-800'
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {planApplied ? 'check_circle' : 'bolt'}
              </span>
              <span>
                {planApplied
                  ? 'AI Staffing Directives Active & Broadcasted'
                  : 'Deploy AI Capacity & Staffing Directives'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
