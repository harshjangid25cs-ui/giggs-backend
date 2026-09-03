import React, { useState } from 'react';
import { ScreenId } from '../../types';
import { ASSET_IMAGES } from '../../data/mockData';
import confetti from 'canvas-confetti';

interface RateServiceViewProps {
  onNavigate: (screen: ScreenId) => void;
  onSubmitReview: (rating: number, tags: string[], comment: string) => void;
}

export const RateServiceView: React.FC<RateServiceViewProps> = ({
  onNavigate,
  onSubmitReview
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Punctual',
    'Professional',
    'Clean Work'
  ]);
  const [comment, setComment] = useState(
    'Rajesh was on time, diagnosed the cooling leak within 10 minutes, and left the room spotless. Outstanding service!'
  );
  const [isSubmitted, setIsSubmitted] = useState(false);

  const tagsList = [
    'Punctual',
    'Professional',
    'Clean Work',
    'Fair Price',
    'Great Communication',
    'Quick Diagnostics',
    'Polite & Courteous'
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    confetti({
      particleCount: 60,
      spread: 50,
      origin: { y: 0.6 }
    });
    onSubmitReview(rating, selectedTags, comment);
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1b1c1c] flex flex-col justify-center items-center p-4 sm:p-6 pb-24">
      {/* Top Header */}
      <header className="w-full max-w-[520px] mb-4 flex items-center justify-between">
        <button
          onClick={() => onNavigate('resident_home')}
          className="p-2 -ml-2 rounded-full hover:bg-slate-200 transition-colors text-black"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
        <span className="text-base font-bold text-neutral-900">Rate Service</span>
        <div className="w-8"></div>
      </header>

      <main className="w-full max-w-[520px] bg-white rounded-2xl shadow-md border border-slate-200 p-6 md:p-8 animate-fade-in">
        {isSubmitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-4xl">thumb_up</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Thank You!</h2>
              <p className="text-xs text-neutral-600 mt-1">
                Your review helps keep GIGGS trusted across your society.
              </p>
            </div>
            <button
              onClick={() => onNavigate('resident_home')}
              className="bg-black text-white px-6 py-3 rounded-xl font-semibold text-xs hover:bg-neutral-800 transition-colors mt-4"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header Text */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
                Rate Your Experience
              </h1>
              <p className="text-xs text-neutral-500 mt-1">
                How was your service with Rajesh K.?
              </p>
            </div>

            {/* Worker & Job Summary */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 shadow-sm">
                <img
                  src={ASSET_IMAGES.workerRajeshRating}
                  alt="Rajesh K."
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-sm text-neutral-900">
                  AC Deep Clean &amp; Service
                </h3>
                <p className="text-xs text-neutral-500">October 24, 2023</p>
              </div>
            </div>

            {/* Interactive Stars */}
            <div className="flex justify-center items-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 text-3xl focus:outline-none transition-transform hover:scale-125 text-amber-400"
                    aria-label={`Rate ${star} star`}
                  >
                    <span
                      className={`material-symbols-outlined text-4xl ${
                        isFilled ? 'fill text-amber-500' : 'text-slate-300'
                      }`}
                    >
                      star
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Positive Tags */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2 text-center">
                What went well?
              </label>
              <div className="flex flex-wrap gap-2 justify-center">
                {tagsList.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-black text-white shadow-xs'
                          : 'bg-slate-100 text-neutral-700 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback Textarea */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5" htmlFor="comment">
                Detailed Feedback (Optional)
              </label>
              <textarea
                id="comment"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us more about the service quality, punctuality, and workmanship..."
                className="w-full rounded-xl border border-slate-300 focus:border-black focus:ring-1 focus:ring-black text-xs p-3 outline-none transition-all placeholder:text-neutral-400"
              ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                className="w-full bg-black hover:bg-neutral-800 text-white font-bold text-sm py-3.5 rounded-xl shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>Submit Review</span>
                <span className="material-symbols-outlined text-base">send</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('resident_home')}
                className="w-full py-2.5 text-xs font-semibold text-neutral-500 hover:text-black transition-colors"
              >
                Skip for now
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};
