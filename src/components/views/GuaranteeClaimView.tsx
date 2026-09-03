import React, { useState } from 'react';
import { ScreenId } from '../../types';
import { ASSET_IMAGES } from '../../data/mockData';

interface GuaranteeClaimViewProps {
  onNavigate: (screen: ScreenId) => void;
  onSubmitClaim: (issueType: string, description: string, photosCount: number) => void;
}

export const GuaranteeClaimView: React.FC<GuaranteeClaimViewProps> = ({
  onNavigate,
  onSubmitClaim
}) => {
  const [issueType, setIssueType] = useState('leak_returned');
  const [description, setDescription] = useState(
    'The connector under the sink started slowly dripping again this morning, 4 days after the repair.'
  );
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([
    ASSET_IMAGES.leakingFaucet
  ]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Add fake preview
      setUploadedFiles((prev) => [...prev, ASSET_IMAGES.leakingFaucet]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    onSubmitClaim(issueType, description, uploadedFiles.length);
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1b1c1c] p-4 sm:p-6 pb-24 flex flex-col items-center justify-center">
      {/* Top Header */}
      <header className="w-full max-w-xl mb-4 flex items-center justify-between">
        <button
          onClick={() => onNavigate('resident_home')}
          className="flex items-center gap-1 text-xs font-semibold text-neutral-600 hover:text-black transition-colors"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          <span>Back to Dashboard</span>
        </button>
        <span className="text-sm font-bold text-neutral-900">GIGGS Guarantee</span>
        <div className="w-16"></div>
      </header>

      <main className="w-full max-w-xl bg-white rounded-2xl shadow-md border border-slate-200 p-6 md:p-8 animate-fade-in">
        {isSubmitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-4xl">verified_user</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">
                Claim Submitted Successfully
              </h2>
              <p className="text-xs text-neutral-600 mt-1 max-w-md mx-auto">
                Claim #CLM-9281 has been filed. Our society coordinator will review within 2 hours and dispatch a free re-visit or issue a refund.
              </p>
            </div>
            <button
              onClick={() => onNavigate('resident_home')}
              className="bg-black text-white px-6 py-3 rounded-xl font-semibold text-xs hover:bg-neutral-800 transition-colors mt-4"
            >
              Return to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Guarantee Shield Header */}
            <div className="bg-[#f5f3f3] rounded-xl p-4 border border-slate-200/80 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xl fill">
                  verified_user
                </span>
              </div>
              <div>
                <h2 className="text-sm font-bold text-neutral-900">
                  10-Day Workmanship Guarantee
                </h2>
                <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                  Every service booked on GIGGS includes free resolution if the issue recurs within 10 days. Zero additional fees.
                </p>
              </div>
            </div>

            {/* Target Booking Info */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Associated Booking
                </span>
                <h3 className="font-bold text-sm text-slate-900 mt-0.5">
                  Plumbing Leak Repair
                </h3>
                <p className="text-xs text-slate-500">
                  Service by Alex M. • Oct 12, 2023 • ₹134.00
                </p>
              </div>
              <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                Eligible
              </span>
            </div>

            {/* Issue Selector */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5" htmlFor="issue_type">
                What went wrong?
              </label>
              <select
                id="issue_type"
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full rounded-xl border border-slate-300 focus:border-black focus:ring-1 focus:ring-black text-xs py-2.5 px-3 bg-white outline-none"
              >
                <option value="leak_returned">Issue / Leak returned after fix</option>
                <option value="incomplete">Incomplete repair or missing steps</option>
                <option value="damage">Property damage during service</option>
                <option value="parts">Faulty replacement part used</option>
                <option value="other">Other dissatisfaction</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5" htmlFor="claim_desc">
                Describe the problem
              </label>
              <textarea
                id="claim_desc"
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what happened and what requires fixing..."
                className="w-full rounded-xl border border-slate-300 focus:border-black focus:ring-1 focus:ring-black text-xs p-3 outline-none transition-all placeholder:text-neutral-400"
              ></textarea>
            </div>

            {/* File & Photo Upload */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Evidence Photos / Videos (Recommended)
              </label>
              <label
                htmlFor="photo_upload"
                className="border-2 border-dashed border-slate-300 hover:border-black rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50 hover:bg-slate-100/50"
              >
                <span className="material-symbols-outlined text-2xl text-slate-400 mb-1">
                  add_a_photo
                </span>
                <span className="text-xs font-semibold text-slate-700">
                  Click or drag photos here
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  PNG, JPG up to 10MB
                </span>
                <input
                  id="photo_upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Uploaded Thumbnails */}
              {uploadedFiles.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {uploadedFiles.map((src, i) => (
                    <div
                      key={i}
                      className="w-16 h-16 rounded-lg overflow-hidden border border-slate-300 relative group"
                    >
                      <img
                        src={src}
                        alt="Evidence"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setUploadedFiles(uploadedFiles.filter((_, idx) => idx !== i))
                        }
                        className="absolute top-1 right-1 bg-black/70 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] hover:bg-black"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-black hover:bg-neutral-800 text-white font-bold text-sm py-3.5 rounded-xl shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
            >
              <span>Submit Guarantee Claim</span>
              <span className="material-symbols-outlined text-base">shield</span>
            </button>
          </form>
        )}
      </main>
    </div>
  );
};
