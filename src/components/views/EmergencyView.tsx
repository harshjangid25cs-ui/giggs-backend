import React, { useState } from 'react';
import { ScreenId } from '../../types';
import { ASSET_IMAGES } from '../../data/mockData';

interface EmergencyViewProps {
  onNavigate: (screen: ScreenId) => void;
  onRequestHelp: (type: string) => void;
}

export const EmergencyView: React.FC<EmergencyViewProps> = ({
  onNavigate,
  onRequestHelp
}) => {
  const [selectedType, setSelectedType] = useState('leak');
  const [sosRequested, setSosRequested] = useState(false);
  const [callModal, setCallModal] = useState(false);
  const [messageModal, setMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [chatMessages, setChatMessages] = useState<string[]>([
    'Worker: I am on my way with the main shutoff tool. Eta 3 minutes!'
  ]);

  const handleSos = () => {
    setSosRequested(true);
    onRequestHelp(selectedType);
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    setChatMessages((prev) => [...prev, `You: ${messageText}`]);
    setMessageText('');
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        'Worker: Understood, arriving in 2 minutes at your building gate!'
      ]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#fbf9f9] text-[#1b1c1c] font-sans antialiased pb-24">
      {/* Top App Bar */}
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 md:px-8 h-16 bg-[#fbf9f9] border-b border-[#cfc4c5]">
        <button
          onClick={() => onNavigate('resident_home')}
          className="text-black hover:bg-neutral-200 transition-colors p-2 rounded-full active:scale-95"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
        <span className="text-xl font-bold text-[#ba1a1a]">Emergency</span>
        <div className="w-8"></div>
      </header>

      {/* Main Canvas */}
      <main className="pt-14 px-4 md:px-8 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 overflow-x-hidden">
        {/* Left Column: Action Area & Categories */}
        <div className="md:col-span-5 flex flex-col gap-5">
          {/* Danger / SOS Hero Box */}
          <div className="bg-[#ffdad6] text-[#93000a] p-6 rounded-2xl shadow-lg border border-red-300 flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-5xl mb-3 fill">
              warning
            </span>
            <h1 className="text-2xl font-bold mb-1">Are you safe?</h1>
            <p className="text-xs font-medium mb-5 opacity-90 leading-relaxed">
              If you are in immediate physical danger, please call 911 or local emergency services immediately.
            </p>
            <button
              onClick={handleSos}
              className={`w-full bg-[#ba1a1a] hover:bg-red-800 text-white font-bold text-sm py-4 rounded-xl shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${
                !sosRequested ? 'pulse-urgent' : ''
              }`}
            >
              <span className="material-symbols-outlined text-xl fill">sos</span>
              <span>
                {sosRequested ? 'SOS Dispatch Active (Dispatched)' : 'Request Emergency Help'}
              </span>
            </button>
          </div>

          {/* Emergency Category Selector */}
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
            <h2 className="font-bold text-base text-neutral-900 mb-3">
              Select Emergency Type
            </h2>
            <div className="space-y-2.5">
              {/* Option 1: Electrical */}
              <label
                onClick={() => setSelectedType('electrical')}
                className={`flex items-center gap-3.5 p-3.5 border rounded-xl cursor-pointer transition-all ${
                  selectedType === 'electrical'
                    ? 'border-black bg-[#f5f3f3] ring-1 ring-black'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="emergency_type"
                  checked={selectedType === 'electrical'}
                  onChange={() => setSelectedType('electrical')}
                  className="text-black focus:ring-black h-4 w-4"
                />
                <span className="material-symbols-outlined text-neutral-800 text-xl">
                  electrical_services
                </span>
                <div className="flex-1">
                  <div className="text-xs font-bold text-neutral-900">
                    Electrical Hazard / Fire
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    Sparks, smoke, exposed wires
                  </div>
                </div>
              </label>

              {/* Option 2: Flooding */}
              <label
                onClick={() => setSelectedType('leak')}
                className={`flex items-center gap-3.5 p-3.5 border rounded-xl cursor-pointer transition-all ${
                  selectedType === 'leak'
                    ? 'border-black bg-[#f5f3f3] ring-1 ring-black'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="emergency_type"
                  checked={selectedType === 'leak'}
                  onChange={() => setSelectedType('leak')}
                  className="text-black focus:ring-black h-4 w-4"
                />
                <span className="material-symbols-outlined text-blue-600 text-xl fill">
                  water_drop
                </span>
                <div className="flex-1">
                  <div className="text-xs font-bold text-neutral-900">
                    Major Leak / Flooding
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    Burst pipes, rapid water accumulation
                  </div>
                </div>
              </label>

              {/* Option 3: Lockout */}
              <label
                onClick={() => setSelectedType('lockout')}
                className={`flex items-center gap-3.5 p-3.5 border rounded-xl cursor-pointer transition-all ${
                  selectedType === 'lockout'
                    ? 'border-black bg-[#f5f3f3] ring-1 ring-black'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="emergency_type"
                  checked={selectedType === 'lockout'}
                  onChange={() => setSelectedType('lockout')}
                  className="text-black focus:ring-black h-4 w-4"
                />
                <span className="material-symbols-outlined text-neutral-700 text-xl">
                  key
                </span>
                <div className="flex-1">
                  <div className="text-xs font-bold text-neutral-900">Lockout</div>
                  <div className="text-[11px] text-neutral-500">
                    Unable to access home or broken lock
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Map & Worker Tracking */}
        <div className="md:col-span-7 flex flex-col gap-4">
          <div className="relative w-full h-[460px] md:h-full min-h-[440px] rounded-2xl overflow-hidden shadow-md border border-slate-200">
            {/* Map Canvas Background */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${ASSET_IMAGES.emergencyMapBg})` }}
            ></div>

            {/* Worker GPS Marker */}
            <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-bounce-slow">
              <div className="bg-black text-white px-3 py-1 rounded-full text-xs font-bold mb-2 shadow-lg flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>3 Min Away</span>
              </div>
              <div className="w-14 h-14 bg-white rounded-full border-4 border-black shadow-2xl flex items-center justify-center overflow-hidden">
                <img
                  src={ASSET_IMAGES.emergencyWorkerPin}
                  alt="Mike T. Worker"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-1.5 h-6 bg-black/70"></div>
              <div className="w-3.5 h-3.5 bg-black rounded-full shadow-md"></div>
            </div>

            {/* Status Overlay Box at Bottom */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 w-full sm:w-auto">
                <div className="w-13 h-13 rounded-full overflow-hidden bg-slate-100 border border-slate-300 shrink-0">
                  <img
                    src={ASSET_IMAGES.emergencyWorkerProfile}
                    alt="Mike T."
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-bold text-sm text-neutral-900">Mike T.</div>
                  <div className="text-xs text-neutral-600 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-emerald-700 fill">
                      verified
                    </span>
                    <span>Certified Emergency Plumber</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setMessageModal(true)}
                  className="flex-1 sm:flex-none bg-white text-black border border-slate-300 hover:bg-slate-50 px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span className="material-symbols-outlined text-base">chat</span>
                  <span>Message</span>
                </button>
                <button
                  onClick={() => setCallModal(true)}
                  className="flex-1 sm:flex-none bg-black text-white hover:bg-neutral-800 px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span className="material-symbols-outlined text-base">call</span>
                  <span>Call Worker</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Call Modal */}
      {callModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto overflow-hidden border-2 border-black">
              <img
                src={ASSET_IMAGES.emergencyWorkerProfile}
                alt="Mike T"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Calling Mike T.</h3>
              <p className="text-xs text-slate-500">+1 (555) 019-2834</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 py-2 rounded-lg">
              <span className="w-2 h-2 bg-emerald-600 rounded-full animate-ping"></span>
              <span>Connected via Secure Line</span>
            </div>
            <button
              onClick={() => setCallModal(false)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-xs transition-colors"
            >
              End Call
            </button>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {messageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full flex flex-col space-y-3 shadow-2xl border border-slate-200 max-h-[80vh]">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <img
                  src={ASSET_IMAGES.emergencyWorkerProfile}
                  alt="Mike"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Mike T. (Plumber)</h4>
                  <span className="text-[10px] text-emerald-600 font-medium">Active on chat</span>
                </div>
              </div>
              <button
                onClick={() => setMessageModal(false)}
                className="text-slate-400 hover:text-black"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="space-y-2 overflow-y-auto flex-1 p-2 bg-slate-50 rounded-xl min-h-[160px] text-xs">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg max-w-[85%] ${
                    msg.startsWith('You:')
                      ? 'ml-auto bg-black text-white'
                      : 'bg-white border border-slate-200 text-slate-800'
                  }`}
                >
                  {msg}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type quick message (e.g. Unit 4B gate code)..."
                className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-black"
              />
              <button
                onClick={handleSendMessage}
                className="bg-black text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
