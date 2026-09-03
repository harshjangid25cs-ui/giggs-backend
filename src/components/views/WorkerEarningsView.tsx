import React, { useState, useMemo } from 'react';
import { ScreenId, WorkerJob } from '../../types';
import { ASSET_IMAGES, REVIEWS_LIST } from '../../data/mockData';
import confetti from 'canvas-confetti';

interface WorkerEarningsViewProps {
  jobs: WorkerJob[];
  workerProfile: any;
  onNavigate: (screen: ScreenId) => void;
}

export const WorkerEarningsView: React.FC<WorkerEarningsViewProps> = ({
  jobs,
  workerProfile,
  onNavigate
}) => {
  const completedJobs = jobs.filter(j => j.status === 'completed');
  const totalEarnings = useMemo(() => completedJobs.reduce((acc, job) => acc + job.price, 0), [completedJobs]);
  
  const [availableBalance, setAvailableBalance] = useState(totalEarnings);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState(false);

  const handleWithdraw = () => {
    setWithdrawing(true);
    setTimeout(() => {
      setWithdrawing(false);
      setAvailableBalance(0);
      setWithdrawModal(false);
      confetti({
        particleCount: 50,
        spread: 60
      });
    }, 1000);
  };

  const rating = workerProfile?.rating || 4.8;
  const ratingFloor = Math.floor(rating);
  const totalReviews = 124; // Mocked until we add reviews to DB

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1b1c1c] pb-28 pt-14 px-4 md:px-8 max-w-4xl mx-auto font-sans overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-300">
            <img
              src={ASSET_IMAGES.workerSelfEarningsAvatar}
              alt="Worker self"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-neutral-900">
              Earnings &amp; Ratings
            </h1>
            <p className="text-xs text-neutral-500">
              Verified GIGGS Pro Dashboard
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('worker_welfare')}
          className="text-xs font-semibold text-neutral-700 bg-white border border-slate-300 hover:border-black px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm text-emerald-600">
            shield_with_heart
          </span>
          <span>View Welfare</span>
        </button>
      </header>

      {/* Earnings Hero Banner */}
      <section className="bg-black text-white rounded-2xl p-6 shadow-md mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          <div>
            <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider block mb-1">
              Available for Instant Payout
            </span>
            <div className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
              ₹{availableBalance.toLocaleString()}
            </div>
            <p className="text-xs text-neutral-400">
              Total lifetime earned: ₹{totalEarnings.toLocaleString()}
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <button
              disabled={availableBalance === 0}
              onClick={() => setWithdrawModal(true)}
              className="w-full sm:w-auto bg-white text-black font-bold text-xs py-3.5 px-6 rounded-xl hover:bg-neutral-200 disabled:opacity-40 transition-all active:scale-95 shadow-xs flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">account_balance</span>
              <span>Withdraw to Bank Account</span>
            </button>
            <span className="text-[11px] text-neutral-400">
              Direct transfer to HDFC •••• 9214
            </span>
          </div>
        </div>
      </section>

      {/* Ratings & Breakdown Bento */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-8">
        {/* Rating Score Card */}
        <div className="md:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-base text-neutral-900">
                Overall Rating
              </h3>
              <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
                Top Rated Pro
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-black text-neutral-900">{rating.toFixed(1)}</span>
              <span className="text-xs text-neutral-500">out of 5.0</span>
            </div>

            <div className="flex text-amber-500 mb-2">
              {Array.from({ length: 5 }).map((_, idx) => (
                <span key={idx} className="material-symbols-outlined text-lg fill">
                  {idx < ratingFloor ? 'star' : 'star_border'}
                </span>
              ))}
            </div>
            <p className="text-xs text-neutral-500">Based on {totalReviews} verified resident reviews</p>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-neutral-600">Punctuality Score</span>
              <span className="font-bold text-neutral-900">99.2%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Job Completion Rate</span>
              <span className="font-bold text-neutral-900">100%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Cleanliness &amp; Etiquette</span>
              <span className="font-bold text-neutral-900">98.5%</span>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="md:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <h3 className="font-bold text-base text-neutral-900 mb-3">
            Rating Distribution
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center gap-3">
              <span className="w-12 font-medium text-neutral-600">5 Stars</span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-black rounded-full" style={{ width: '85%' }}></div>
              </div>
              <span className="w-8 text-right font-bold text-neutral-900">85%</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="w-12 font-medium text-neutral-600">4 Stars</span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-neutral-600 rounded-full" style={{ width: '12%' }}></div>
              </div>
              <span className="w-8 text-right font-bold text-neutral-900">12%</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="w-12 font-medium text-neutral-600">3 Stars</span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-neutral-400 rounded-full" style={{ width: '3%' }}></div>
              </div>
              <span className="w-8 text-right font-bold text-neutral-900">3%</span>
            </div>

            <div className="flex items-center gap-3 opacity-40">
              <span className="w-12 font-medium text-neutral-600">2 Stars</span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-neutral-300 rounded-full" style={{ width: '0%' }}></div>
              </div>
              <span className="w-8 text-right font-bold text-neutral-900">0%</span>
            </div>

            <div className="flex items-center gap-3 opacity-40">
              <span className="w-12 font-medium text-neutral-600">1 Star</span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-neutral-300 rounded-full" style={{ width: '0%' }}></div>
              </div>
              <span className="w-8 text-right font-bold text-neutral-900">0%</span>
            </div>
          </div>

          <p className="text-[11px] text-emerald-700 font-semibold mt-4">
            ✓ Eligible for quarterly top-tier bonus payout (+₹2,500)
          </p>
        </div>
      </section>

      {/* Resident Feedback Reviews */}
      <section className="space-y-4">
        <h3 className="font-bold text-base text-neutral-900">
          Recent Resident Reviews
        </h3>
        <div className="space-y-3">
          {REVIEWS_LIST.map((rev) => (
            <div
              key={rev.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2.5"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.authorPhoto}
                    alt={rev.authorName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-neutral-900">
                      {rev.authorName}
                    </h4>
                    <span className="text-[11px] text-neutral-500">
                      {rev.serviceTitle} • {rev.date}
                    </span>
                  </div>
                </div>

                <div className="flex text-amber-500">
                  {Array.from({ length: Math.floor(rev.rating) }).map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-sm fill">
                      star
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-xs text-neutral-700 leading-relaxed">
                "{rev.comment}"
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Withdraw Modal */}
      {withdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-lg text-neutral-900">Confirm Payout</h3>
            <p className="text-xs text-neutral-600">
              Transfer <strong>₹{availableBalance.toLocaleString()}</strong> to your registered bank account?
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border text-xs text-neutral-800 space-y-1">
              <div>Bank: <strong>HDFC Bank Ltd</strong></div>
              <div>Account: •••• 9214</div>
              <div>IFSC: HDFC0001289</div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                disabled={withdrawing}
                onClick={handleWithdraw}
                className="flex-1 bg-black text-white py-3 rounded-xl font-bold text-xs hover:bg-neutral-800 disabled:opacity-50 transition-colors"
              >
                {withdrawing ? 'Processing Transfer...' : 'Confirm & Transfer'}
              </button>
              <button
                onClick={() => setWithdrawModal(false)}
                className="px-4 py-3 border border-slate-300 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
