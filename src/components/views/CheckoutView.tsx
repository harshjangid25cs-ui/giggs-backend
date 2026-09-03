import React, { useState } from 'react';
import { ScreenId, WorkerJob } from '../../types';
import { ASSET_IMAGES } from '../../data/mockData';
import confetti from 'canvas-confetti';

interface CheckoutViewProps {
  job?: WorkerJob;
  onNavigate: (screen: ScreenId) => void;
  onPaymentComplete: (amount: number) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  job,
  onNavigate,
  onPaymentComplete
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  // Defaults if no job is provided
  const labourCost = job ? (job.category === 'plumbing' ? 90 : 499) : 90;
  const materials = job?.materials || [
    { id: '1', name: 'PVC Pipe Fittings (x3)', qty: 3, cost: 18.50 },
    { id: '2', name: 'Sealant Tape', qty: 1, cost: 4.00 },
    { id: '3', name: 'Replacement Valve', qty: 1, cost: 32.00 }
  ];
  const materialTotal = materials.reduce((acc, item) => acc + item.cost, 0);
  const subtotal = labourCost + materialTotal;
  const groupDiscount = job ? (job.category === 'ac' ? 150 : 15) : 15; // Random demo discount logic
  const platformFee = 4.50;
  const total = subtotal - groupDiscount + platformFee;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
      onPaymentComplete(total);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#fbf9f9] text-[#1b1c1c] pb-24 font-sans antialiased">
      {/* Top Header */}
      <header className="flex justify-between items-center px-4 md:px-12 w-full h-16 bg-[#fbf9f9] border-b border-[#cfc4c5] sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('resident_home')}
            className="p-2 -ml-2 rounded-full hover:bg-[#e3e2e2]/60 transition-colors text-black"
            aria-label="Back"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <h1 className="text-2xl font-bold text-black font-sans">Checkout</h1>
        </div>
        <div className="w-8 h-8 rounded-full overflow-hidden bg-[#e3e2e2] border border-[#cfc4c5]">
          <img
            alt="User profile avatar"
            className="w-full h-full object-cover"
            src={ASSET_IMAGES.checkoutUserAvatar}
          />
        </div>
      </header>

      {/* Main Canvas */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-6 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        {/* Left Column: Details & Breakdown */}
        <div className="md:col-span-7 flex flex-col gap-4">
          {/* Service Summary Card */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden shrink-0 bg-slate-100">
              <img
                alt="Plumbing setup"
                className="w-full h-full object-cover"
                src={ASSET_IMAGES.hvacCheckout}
              />
            </div>
            <div className="flex flex-col justify-center w-full">
              <div className="flex justify-between items-start mb-1">
                <span className="bg-[#f5f3f3] text-black text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
                  Completed
                </span>
                <span className="text-xs text-neutral-500">Today, 2:30 PM</span>
              </div>
              <h2 className="text-lg font-bold text-neutral-900 mb-1">
                Plumbing Leak Repair
              </h2>
              <p className="text-xs text-neutral-600 mb-2">
                Service by Alex M. • 2 hrs logged
              </p>
              <div className="flex items-center gap-2 mt-auto">
                <div className="flex text-amber-500">
                  <span className="material-symbols-outlined text-sm fill">star</span>
                  <span className="material-symbols-outlined text-sm fill">star</span>
                  <span className="material-symbols-outlined text-sm fill">star</span>
                  <span className="material-symbols-outlined text-sm fill">star</span>
                  <span className="material-symbols-outlined text-sm fill">star</span>
                </div>
                <span className="text-xs font-semibold text-neutral-600">
                  5.0 (124 reviews)
                </span>
              </div>
            </div>
          </section>

          {/* 10-Day Protection Active Badge */}
          <div className="bg-[#f5f3f3] border border-[#cfc4c5]/60 rounded-xl p-3 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-black text-lg fill">
              verified_user
            </span>
            <span className="text-xs font-bold text-black uppercase tracking-wider">
              10-Day Protection Active
            </span>
          </div>

          {/* Invoice Breakdown */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6">
            <h3 className="text-lg font-bold text-neutral-900 border-b border-slate-100 pb-3 mb-4">
              Invoice Breakdown
            </h3>
            <div className="flex flex-col gap-3 text-sm">
              {/* Labor */}
              <div className="flex justify-between items-center text-neutral-800">
                <span className="text-neutral-600">Labor Cost (2 hours @ ₹45/hr)</span>
                <span className="font-semibold text-neutral-900">₹{labourCost.toFixed(2)}</span>
              </div>

              {/* Materials Section */}
              <div className="pt-1">
                <span className="text-neutral-700 font-semibold text-xs uppercase tracking-wider block mb-2">
                  Materials Added:
                </span>
                <div className="pl-3 border-l-2 border-slate-200 flex flex-col gap-2 text-xs">
                  {materials.map((m, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-neutral-600">{m.name}</span>
                      <span className="font-medium text-neutral-900">₹{m.cost.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 my-1"></div>

              {/* Subtotal */}
              <div className="flex justify-between items-center font-medium text-neutral-800">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              {/* Discounts & Fees */}
              <div className="flex justify-between items-center text-emerald-700 font-medium">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">group</span>
                  <span>Neighborhood Group Discount (3 participants)</span>
                </span>
                <span>-₹{groupDiscount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-neutral-700">
                <span className="flex items-center gap-1 text-neutral-600">
                  Platform Fee
                  <span className="material-symbols-outlined text-xs text-neutral-400">
                    info
                  </span>
                </span>
                <span>₹{platformFee.toFixed(2)}</span>
              </div>

              <div className="border-t border-slate-200 my-2"></div>

              {/* Total */}
              <div className="flex justify-between items-center mt-1">
                <span className="text-xl font-bold text-neutral-900">Total to Pay</span>
                <span className="text-2xl font-black text-black">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Payment & Action */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sticky top-24">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">
              Payment Method
            </h3>

            {isPaid ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-3xl">check_circle</span>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-neutral-900">Payment Successful!</h4>
                  <p className="text-xs text-neutral-500 mt-1">
                    ₹{total.toFixed(2)} paid via {paymentMethod === 'card' ? 'Card •••• 4242' : 'UPI'}
                  </p>
                </div>
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => onNavigate('resident_rate')}
                    className="w-full bg-black text-white py-3 rounded-xl font-semibold text-xs hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">star</span>
                    <span>Rate {job?.workerName?.split(' ')[0] || 'Alex'}'s Service</span>
                  </button>
                  <button
                    onClick={() => onNavigate('resident_claim')}
                    className="w-full bg-white border border-slate-300 text-neutral-700 py-3 rounded-xl font-semibold text-xs hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">verified_user</span>
                    <span>File a Guarantee Claim</span>
                  </button>
                  <button
                    onClick={() => onNavigate('resident_home')}
                    className="w-full text-xs text-neutral-500 hover:text-black py-2"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3 mb-6">
                  {/* Option 1: Card */}
                  <label
                    onClick={() => setPaymentMethod('card')}
                    className={`flex items-center p-3.5 border-2 rounded-xl cursor-pointer transition-all ${
                      paymentMethod === 'card'
                        ? 'border-black bg-[#f5f3f3]'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="text-black focus:ring-black h-4 w-4 mr-3"
                    />
                    <div className="flex-1 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-neutral-800">
                          credit_card
                        </span>
                        <div>
                          <span className="font-semibold text-xs text-neutral-900 block">
                            •••• 4242
                          </span>
                          <span className="text-[10px] text-neutral-500 block">
                            Expires 12/25
                          </span>
                        </div>
                      </div>
                      <img
                        alt="Mastercard"
                        className="h-5 object-contain opacity-80"
                        src={ASSET_IMAGES.mastercardIcon}
                      />
                    </div>
                  </label>

                  {/* Option 2: UPI */}
                  <label
                    onClick={() => setPaymentMethod('upi')}
                    className={`flex items-center p-3.5 border rounded-xl cursor-pointer transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-black bg-[#f5f3f3] ring-1 ring-black'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="text-black focus:ring-black h-4 w-4 mr-3"
                    />
                    <div className="flex-1 flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-neutral-700">
                        account_balance_wallet
                      </span>
                      <span className="font-semibold text-xs text-neutral-800">
                        UPI / Bank Transfer (GPay / PhonePe)
                      </span>
                    </div>
                  </label>

                  {/* Option 3: Add New */}
                  <button
                    type="button"
                    className="flex items-center gap-2 p-3 border border-dashed border-slate-300 rounded-xl text-neutral-700 hover:bg-slate-50 transition-colors justify-center text-xs font-medium"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    <span>Add New Payment Method</span>
                  </button>
                </div>

                {/* Pay Button */}
                <button
                  disabled={isProcessing}
                  onClick={handlePay}
                  className="w-full bg-black hover:bg-neutral-800 disabled:opacity-50 text-white font-bold text-base py-4 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <span className="animate-spin material-symbols-outlined text-lg">
                        progress_activity
                      </span>
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">lock</span>
                      <span>Pay ₹{total.toFixed(2)}</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] font-medium text-center text-neutral-500 mt-3">
                  Payments are secure, 256-bit encrypted with GIGGS protection.
                </p>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};
