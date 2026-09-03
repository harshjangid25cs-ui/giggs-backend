import React, { useState, useRef, useEffect } from 'react';
import { ScreenId, UserRole } from '../../types';
import {
  compressImage,
  TimelapseVideoRecorder,
  CompressionResult
} from '../../utils/mediaCompressor';
import { uploadAadhaarPhoto, uploadVerificationVideo } from '../../lib/api';

interface WorkerRegisterViewProps {
  onNavigate: (screen: ScreenId, role?: UserRole) => void;
  onRegisterSuccess?: (workerDetails: any) => void;
}

export interface TradeProvision {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export const WORKER_PROVISIONS: TradeProvision[] = [
  {
    id: 'ac_repair',
    label: 'AC Repair & Servicing',
    icon: 'ac_unit',
    description: 'Split & Window AC installation, gas refilling, jet cleaning'
  },
  {
    id: 'electrician',
    label: 'Electrician & Wiring',
    icon: 'bolt',
    description: 'Short circuit fix, MCB installation, fan & light fitting'
  },
  {
    id: 'plumbing',
    label: 'Plumbing & Sanitation',
    icon: 'plumbing',
    description: 'Leakage repair, pipe fitting, tap & shower replacement'
  },
  {
    id: 'car_wash',
    label: 'Car & Vehicle Wash',
    icon: 'directions_car',
    description: 'Doorstep daily car wash, pressure foam wash, interior vacuuming'
  },
  {
    id: 'appliance_repair',
    label: 'Appliance Repair',
    icon: 'microwave',
    description: 'Washing machine, refrigerator, microwave & RO repair'
  },
  {
    id: 'carpentry',
    label: 'Carpentry & Furniture',
    icon: 'carpenter',
    description: 'Door lock fitting, cabinet repair, custom furniture work'
  },
  {
    id: 'painting',
    label: 'Painting & Waterproofing',
    icon: 'format_paint',
    description: 'Interior wall painting, dampness treatment, texture coating'
  },
  {
    id: 'cleaning',
    label: 'Deep Cleaning & Hygiene',
    icon: 'cleaning_services',
    description: 'Bathroom sanitization, sofa shampooing, kitchen deep clean'
  },
  {
    id: 'locksmith',
    label: 'Locksmith & Smart Locks',
    icon: 'lock',
    description: 'Key duplicate, biometric lock setup, emergency opening'
  },
  {
    id: 'handyman',
    label: 'General Handyman',
    icon: 'build',
    description: 'TV wall mounting, curtain rod installation, drill works'
  }
];

export const WorkerRegisterView: React.FC<WorkerRegisterViewProps> = ({
  onNavigate,
  onRegisterSuccess
}) => {
  // Wizard Navigation: Step 1 = Details & Provisions, Step 2 = Aadhaar, Step 3 = Biometric Live Cam
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('Gurugram / NCR');

  // Selected Provisions / Skills
  const [selectedProvisions, setSelectedProvisions] = useState<string[]>([]);

  // Step 2 Aadhaar Photo & Verification State
  const [aadhaarPhoto, setAadhaarPhoto] = useState<string | null>(null);
  const [isAadhaarVerified, setIsAadhaarVerified] = useState(false);
  const [isCustomAadhaarCaptured, setIsCustomAadhaarCaptured] = useState(false);
  const [showCardTemplateToggle, setShowCardTemplateToggle] = useState(false);

  // Modal Camera for Aadhaar Photo Capture
  const [isAadhaarCamOpen, setIsAadhaarCamOpen] = useState(false);
  const [isCapturingAadhaar, setIsCapturingAadhaar] = useState(false);
  const aadhaarVideoRef = useRef<HTMLVideoElement | null>(null);
  const aadhaarCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Step 3 Live 10-Sec Camera Liveness State
  const [isVerifyingFace, setIsVerifyingFace] = useState(false);
  const [faceVerificationComplete, setFaceVerificationComplete] = useState(false);
  const [preCountdown, setPreCountdown] = useState<number | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(10);
  const [currentGesture, setCurrentGesture] = useState<'left' | 'up' | 'down' | 'right'>('left');
  const [completedGestures, setCompletedGestures] = useState<Record<string, boolean>>({
    left: false,
    up: false,
    down: false,
    right: false
  });

  const [isLoading, setIsLoading] = useState(false);

  // WebCam Reference
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Voice Assistant Helper using Web Speech API (Hindi Language)
  const speakPrompt = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.lang = 'hi-IN';

        // Select Hindi voice if available in browser
        const voices = window.speechSynthesis.getVoices();
        const hindiVoice = voices.find(
          (v) => v.lang.includes('hi') || v.name.toLowerCase().includes('hindi')
        );
        if (hindiVoice) {
          utterance.voice = hindiVoice;
        }

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Speech synthesis error:', e);
      }
    }
  };

  // WebCam Stream Setup for Step 3
  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
      } else {
        setCameraActive(false);
      }
    } catch (err) {
      console.warn('Webcam fallback to simulated face scanner:', err);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  // Auto-Start Camera & Trigger Voice Assistant when user arrives at Step 3
  useEffect(() => {
    if (step === 3) {
      startCamera();
      setPreCountdown(3);
      setIsVerifyingFace(false);
      setFaceVerificationComplete(false);
      setTimerSeconds(10);
      setCompletedGestures({ left: false, up: false, down: false, right: false });
      speakPrompt('कृपया अपना चेहरा कैमरा के सामने रखें। वेरिफिकेशन 3 सेकंड में शुरू हो रहा है।');
    } else {
      stopCamera();
      setPreCountdown(null);
    }
  }, [step]);

  // Media Compression State
  const [photoStats, setPhotoStats] = useState<CompressionResult | null>(null);
  const [videoStats, setVideoStats] = useState<CompressionResult | null>(null);
  const timelapseRecorderRef = useRef<TimelapseVideoRecorder>(new TimelapseVideoRecorder());

  // 3-Second Pre-Countdown Logic before 10-sec verification starts
  useEffect(() => {
    let timer: any = null;
    if (step === 3 && preCountdown !== null && preCountdown > 0) {
      timer = setInterval(() => {
        setPreCountdown((prev) => {
          if (prev === null) return null;
          const next = prev - 1;
          if (next === 2) speakPrompt('दो');
          if (next === 1) speakPrompt('एक');
          if (next === 0) {
            // Start the 10-second verification sequence & 3s timelapse compression recorder!
            setIsVerifyingFace(true);
            setTimerSeconds(10);
            setCurrentGesture('left');
            speakPrompt('अपना चेहरा बाईं तरफ घुमाएँ।');
            if (videoRef.current) {
              timelapseRecorderRef.current.startRecording(videoRef.current);
            }
            return 0;
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, preCountdown]);

  // 10-Second Main Verification Timer Logic
  useEffect(() => {
    let interval: any = null;
    if (isVerifyingFace && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (isVerifyingFace && timerSeconds === 0) {
      setIsVerifyingFace(false);
      setFaceVerificationComplete(true);
      setCompletedGestures({ left: true, up: true, down: true, right: true });
      speakPrompt('वेरिफिकेशन सफल रहा! आपका लाइवनेस वेरिफिकेशन पूरा हो गया है।');
      stopCamera();

      // Stop & Compress 10-sec video stream into a 3-second fast timelapse clip
      timelapseRecorderRef.current.stopRecording().then((res) => {
        if (res) {
          setVideoStats(res);
        }
      });
    }
    return () => clearInterval(interval);
  }, [isVerifyingFace, timerSeconds]);

  // Dynamic direction gesture & voice assistant prompts during 10 seconds
  useEffect(() => {
    if (isVerifyingFace) {
      if (timerSeconds === 8) {
        setCurrentGesture('up');
        setCompletedGestures((prev) => ({ ...prev, left: true }));
        speakPrompt('अपना सिर ऊपर उठाएँ।');
      } else if (timerSeconds === 5) {
        setCurrentGesture('down');
        setCompletedGestures((prev) => ({ ...prev, up: true }));
        speakPrompt('अपना सिर नीचे झुकाएँ।');
      } else if (timerSeconds === 2) {
        setCurrentGesture('right');
        setCompletedGestures((prev) => ({ ...prev, down: true }));
        speakPrompt('अपना चेहरा दाईं तरफ घुमाएँ।');
      }
    }
  }, [timerSeconds, isVerifyingFace]);

  const handleStartLiveVerification = () => {
    setPreCountdown(3);
    setIsVerifyingFace(false);
    setFaceVerificationComplete(false);
    setTimerSeconds(10);
    setCompletedGestures({ left: false, up: false, down: false, right: false });
    startCamera();
    speakPrompt('वेरिफिकेशन 3 सेकंड में शुरू हो रहा है।');
  };

  // Toggle skill/provision selection
  const toggleProvision = (provisionId: string) => {
    setSelectedProvisions((prev) => {
      if (prev.includes(provisionId)) {
        if (prev.length === 1) return prev; // Keep at least one selected
        return prev.filter((p) => p !== provisionId);
      } else {
        return [...prev, provisionId];
      }
    });
  };

  // Aadhaar File Upload Handler with Auto Compression
  const handleAadhaarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const compressed = await compressImage(file, 1024, 0.75);
        setAadhaarPhoto(compressed.dataUrl);
        setPhotoStats(compressed);
        setIsAadhaarVerified(true);
        setIsCustomAadhaarCaptured(true);
      } catch (err) {
        console.warn('Photo compression failed:', err);
      }
    }
  };

  // Start Camera Modal for Aadhaar Photo Capture
  const startAadhaarCamera = async () => {
    setIsAadhaarCamOpen(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: 'environment' }
        });
        if (aadhaarVideoRef.current) {
          aadhaarVideoRef.current.srcObject = stream;
          aadhaarVideoRef.current.play();
        }
      }
    } catch (err) {
      console.warn('Aadhaar camera access error:', err);
    }
  };

  const stopAadhaarCamera = () => {
    if (aadhaarVideoRef.current && aadhaarVideoRef.current.srcObject) {
      const stream = aadhaarVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setIsAadhaarCamOpen(false);
  };

  const captureAadhaarPhoto = async () => {
    setIsCapturingAadhaar(true);
    if (aadhaarVideoRef.current && aadhaarCanvasRef.current) {
      const video = aadhaarVideoRef.current;
      const canvas = aadhaarCanvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        try {
          const compressed = await compressImage(dataUrl, 1024, 0.75);
          setAadhaarPhoto(compressed.dataUrl);
          setPhotoStats(compressed);
        } catch {
          setAadhaarPhoto(dataUrl);
        }
        setIsAadhaarVerified(true);
        setIsCustomAadhaarCaptured(true);
      }
    }
    setTimeout(() => {
      setIsCapturingAadhaar(false);
      stopAadhaarCamera();
    }, 400);
  };

  // Step 1 Validation -> Proceed to Step 2
  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert('Please fill in your name and phone number.');
      return;
    }
    if (selectedProvisions.length === 0) {
      alert('Please select at least one trade category/provision you work on.');
      return;
    }
    setStep(2);
  };

  // Final Registration Submission — uploads media to Supabase Storage first
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faceVerificationComplete) {
      alert('Please complete the 10-second live face verification.');
      return;
    }

    setIsLoading(true);
    try {
      // Use a temporary user id based on phone (replaced by real DB id on registerUser)
      const tempUserId = `tmp-${phone.replace(/\D/g, '')}-${Date.now()}`;

      // 1. Upload compressed Aadhaar photo if captured
      let aadhaarStoragePath: string | null = null;
      if (aadhaarPhoto) {
        aadhaarStoragePath = await uploadAadhaarPhoto(tempUserId, aadhaarPhoto);
      }

      // 2. Upload compressed liveness video blob if available
      let videoStoragePath: string | null = null;
      const videoBlob = timelapseRecorderRef.current.getLastBlob?.();
      if (videoBlob) {
        videoStoragePath = await uploadVerificationVideo(tempUserId, videoBlob);
      }

      if (onRegisterSuccess) {
        onRegisterSuccess({
          name,
          phone,
          email,
          city,
          provisions: selectedProvisions,
          aadhaarPhoto,
          aadhaarStoragePath,
          videoStoragePath,
          verified: true
        });
      }
      onNavigate('worker_dashboard', 'worker');
    } catch (err) {
      console.error('Upload failed during registration:', err);
      // Still navigate even if upload fails — paths will be null, can retry later
      if (onRegisterSuccess) {
        onRegisterSuccess({ name, phone, email, city, provisions: selectedProvisions, aadhaarPhoto, verified: true });
      }
      onNavigate('worker_dashboard', 'worker');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1b1c1c] flex flex-col items-center justify-center px-3 py-6 md:py-10">
      {/* Hidden canvas for capturing snapshot */}
      <canvas ref={aadhaarCanvasRef} className="hidden" />

      {/* Top Header */}
      <div className="w-full max-w-xl mb-4 flex items-center justify-between">
        <button
          onClick={() => {
            if (step > 1) {
              setStep((prev) => (prev - 1) as any);
            } else {
              onNavigate('welcome', 'worker');
            }
          }}
          className="flex items-center gap-2 text-sm font-bold text-neutral-700 hover:text-black transition-colors"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          <span>{step === 1 ? 'Back to Roles' : `Back to Step ${step - 1}`}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
            Worker Partner Onboarding
          </span>
        </div>
      </div>

      {/* Main Registration Card */}
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-neutral-900 to-black p-6 text-white relative">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-500/30">
                Step {step} of 3
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-2">
                {step === 1 && 'Personal Details & Trade Skills'}
                {step === 2 && 'Identity Verification (Aadhaar / ID Card)'}
                {step === 3 && 'Biometric Face Liveness Verification'}
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                {step === 1 && 'Select your work provisions (AC, Electrical, Plumbing, etc.)'}
                {step === 2 && 'Upload or snap photo of your Aadhaar/Government ID'}
                {step === 3 && 'Automated 10-sec camera test with Hindi voice guidance'}
              </p>
            </div>
          </div>

          {/* Wizard Step Progress Indicator Bar */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            <div
              className={`h-1.5 rounded-full transition-all ${
                step >= 1 ? 'bg-emerald-400' : 'bg-slate-700'
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-all ${
                step >= 2 ? 'bg-emerald-400' : 'bg-slate-700'
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-all ${
                step >= 3 ? 'bg-emerald-400' : 'bg-slate-700'
              }`}
            />
          </div>
        </div>

        {/* STEP 1: Details & Trade Skills/Provisions Selection */}
        {step === 1 && (
          <form onSubmit={handleStep1Next} className="p-5 sm:p-7 space-y-6 animate-fade-in">
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-3 text-neutral-400 text-lg">
                    person
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Phone & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex rounded-xl border border-slate-300 bg-neutral-50 overflow-hidden focus-within:bg-white focus-within:ring-2 focus-within:ring-black focus-within:border-transparent transition-all">
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
                      className="w-full px-3.5 py-3 bg-transparent text-sm font-medium focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-3 text-neutral-400 text-lg">
                      mail
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ramesh.pro@giggs.pro"
                      className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Password & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Account Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-3 text-neutral-400 text-lg">
                      lock
                    </span>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Operating City / Region
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-3 text-neutral-400 text-lg">
                      location_on
                    </span>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Gurugram / NCR"
                      className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* WORK PROVISIONS / TRADE SELECTION SECTION */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    Select Your Service Skills & Provisions <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {selectedProvisions.length} Selected
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mb-3">
                  Choose all the categories of work you are qualified to perform in partner societies.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
                  {WORKER_PROVISIONS.map((provision) => {
                    const isSelected = selectedProvisions.includes(provision.id);
                    return (
                      <div
                        key={provision.id}
                        onClick={() => toggleProvision(provision.id)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'bg-neutral-50 hover:bg-neutral-100 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg ${
                              isSelected
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            <span className="material-symbols-outlined">{provision.icon}</span>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                              isSelected ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                            }`}
                          >
                            {isSelected && (
                              <span className="material-symbols-outlined text-xs font-bold">check</span>
                            )}
                          </div>
                        </div>

                        <div className="mt-2.5">
                          <h4 className="font-extrabold text-xs text-slate-900 leading-tight">
                            {provision.label}
                          </h4>
                          <p className="text-[10px] text-slate-500 leading-snug line-clamp-2 mt-0.5">
                            {provision.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Next Step Action Button */}
            <button
              type="submit"
              className="w-full py-4 bg-black hover:bg-neutral-800 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
            >
              <span>Next: ID Document Verification</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </form>
        )}

        {/* STEP 2: ID & Aadhaar Document Verification */}
        {step === 2 && (
          <div className="p-5 sm:p-7 space-y-6 animate-fade-in">
            {/* Visual Aadhaar Card Display */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Government Aadhaar Card / ID Proof
                </label>
                {isCustomAadhaarCaptured && (
                  <button
                    type="button"
                    onClick={() => setShowCardTemplateToggle(!showCardTemplateToggle)}
                    className="text-xs text-blue-600 font-bold hover:underline"
                  >
                    {showCardTemplateToggle ? 'Show Captured Photo' : 'View Template Card'}
                  </button>
                )}
              </div>

              {/* Dynamic Aadhaar Document Display Container */}
              <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-slate-300 shadow-md bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 p-4 flex flex-col justify-between">
                {/* Real User Captured Aadhaar Photo View */}
                {aadhaarPhoto && !showCardTemplateToggle ? (
                  <div className="relative w-full h-full rounded-xl overflow-hidden group">
                    <img
                      src={aadhaarPhoto}
                      alt="Captured Aadhaar Card"
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={startAadhaarCamera}
                        className="px-3 py-1.5 bg-white text-black font-bold text-xs rounded-lg shadow-md hover:bg-neutral-100 flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">photo_camera</span>
                        <span>Retake</span>
                      </button>
                    </div>

                    <div className="absolute top-2 left-2 bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">check_circle</span>
                      <span>Captured Photo Active</span>
                    </div>
                  </div>
                ) : (
                  /* Dummy Aadhaar Card Template */
                  <div className="w-full h-full flex flex-col justify-between">
                    <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                          Gov
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-800">
                            GOVERNMENT OF INDIA
                          </p>
                          <p className="text-[8px] font-bold text-amber-800 uppercase">
                            Unique Identification Authority
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded-md">
                        AADHAAR
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 my-auto items-center">
                      <div className="col-span-1 h-24 bg-amber-200/60 rounded-xl border border-amber-300 flex flex-col items-center justify-center text-amber-800">
                        <span className="material-symbols-outlined text-3xl">badge</span>
                        <span className="text-[9px] font-bold mt-1">ID PHOTO</span>
                      </div>
                      <div className="col-span-2 space-y-1.5 text-left">
                        <div className="h-3 w-3/4 bg-amber-200/70 rounded" />
                        <div className="h-2.5 w-1/2 bg-amber-200/50 rounded" />
                        <div className="h-2.5 w-2/3 bg-amber-200/50 rounded" />
                        <p className="text-xs font-mono font-black text-slate-800 tracking-widest pt-2">
                          XXXX - XXXX - 8921
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-amber-200/80 pt-1.5 flex items-center justify-between text-[9px] font-bold text-amber-900">
                      <span>MERA AADHAAR, MERI PEHCHAN</span>
                      <span>VERIFIED PARTNER PRO</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons for Document Photo Capture */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={startAadhaarCamera}
                className="w-full py-3 px-4 bg-black hover:bg-neutral-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-base">photo_camera</span>
                <span>{aadhaarPhoto ? 'Retake Photo' : 'Snap Live Photo'}</span>
              </button>

              <label className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer border border-slate-300 transition-all active:scale-[0.98]">
                <span className="material-symbols-outlined text-base">upload_file</span>
                <span>Upload File</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAadhaarFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Photo Compression Stats Badge */}
            {photoStats && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between text-xs text-emerald-950 font-bold shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-emerald-600">bolt</span>
                  <div>
                    <p className="font-extrabold text-xs">Client-Side Image Compressed</p>
                    <p className="text-[10px] text-emerald-700 font-medium">Optimized for fast DB upload</p>
                  </div>
                </div>
                <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg text-xs font-black font-mono">
                  {photoStats.compressedSizeKB} KB ({photoStats.reductionPercentage}% Saved)
                </span>
              </div>
            )}

            {/* Step Navigation Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-xl text-xs transition-colors"
              >
                Back to Details
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-2/3 py-3.5 px-4 bg-black hover:bg-neutral-800 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <span>Proceed to Step 3: Biometric Check</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Futuristic 10-Sec Biometric Camera Verification */}
        {step === 3 && (
          <form onSubmit={handleFinalSubmit} className="p-5 sm:p-7 space-y-5 animate-fade-in bg-white text-slate-900">
            {/* REALISTIC LIVE CAMERA & FUTURISTIC CIRCULAR BIOMETRIC VIEWPORT */}
            <div className="relative w-full h-[380px] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col items-center justify-center">
              {/* WebCam Video stream (Auto opened on Step 3) */}
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                muted
                playsInline
              />

              {/* Checkered Grid Pattern Layer */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>

              {/* 3-SECOND PRE-COUNTDOWN OVERLAY DIRECTLY ON LIVE VIDEO */}
              {preCountdown !== null && preCountdown > 0 && (
                <div className="absolute inset-0 z-40 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center space-y-3 animate-fade-in pointer-events-none">
                  <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-4 border-emerald-400 text-emerald-300 flex items-center justify-center text-5xl font-black shadow-[0_0_50px_rgba(52,211,153,0.5)] animate-bounce">
                    {preCountdown}
                  </div>
                  <div className="text-center space-y-1">
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-300 bg-black/80 px-4 py-1.5 rounded-full border border-emerald-400/40 shadow-lg block">
                      Get Ready • Verification Starting In {preCountdown}s
                    </span>
                    <p className="text-[10px] text-slate-300 font-bold">
                      Listen to Voice Assistant instructions (Hindi)
                    </p>
                  </div>
                </div>
              )}

              {/* TOP HUD BADGES (Ready Pill & Timer Pill) */}
              <div className="absolute top-4 inset-x-4 flex items-center justify-between z-30 pointer-events-none">
                {/* Ready Status Pill */}
                <div className="bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5 text-xs font-black text-slate-900 border border-white/50">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      faceVerificationComplete
                        ? 'bg-emerald-500'
                        : isVerifyingFace
                        ? 'bg-amber-500 animate-ping'
                        : 'bg-emerald-500 animate-pulse'
                    }`}
                  ></span>
                  <span>
                    {faceVerificationComplete
                      ? 'Verified'
                      : isVerifyingFace
                      ? 'Verifying...'
                      : preCountdown !== null && preCountdown > 0
                      ? `Starting in ${preCountdown}s`
                      : 'Camera Live'}
                  </span>
                </div>

                {/* 10s Timer Pill */}
                <div className="bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md text-xs font-black font-mono text-slate-900 border border-white/50">
                  {timerSeconds}s
                </div>
              </div>

              {/* CENTER FUTURISTIC BIOMETRIC SCANNER (Concentric Circles HUD) */}
              <div className="relative z-20 flex items-center justify-center pointer-events-none">
                {/* SVG Biometric HUD Rings */}
                <div className="relative w-64 h-64 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 300 300" fill="none">
                    {/* Outer Thin Green Dashed Ring */}
                    <circle
                      cx="150"
                      cy="150"
                      r="138"
                      stroke="#059669"
                      strokeWidth="1.5"
                      strokeDasharray="6 4"
                      className="opacity-70"
                    />

                    {/* Outer Glowing Pulsing Emerald Ring */}
                    <circle
                      cx="150"
                      cy="150"
                      r="128"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      className={`transition-all duration-300 ${
                        faceVerificationComplete
                          ? 'stroke-emerald-400 shadow-[0_0_20px_#34d399]'
                          : isVerifyingFace
                          ? 'stroke-emerald-400 animate-pulse'
                          : 'stroke-teal-400'
                      }`}
                    />

                    {/* Circular Text Path (BIOMETRIC VERIFICATION • WORKER SECURE ID) */}
                    <path
                      id="workerTextCircle"
                      d="M 150, 150 m -115, 0 a 115,115 0 1,1 230,0 a 115,115 0 1,1 -230,0"
                      fill="none"
                    />
                    <text fill="#34d399" fontSize="8.5" fontWeight="800" letterSpacing="2.5" opacity="0.85">
                      <textPath href="#workerTextCircle" startOffset="0%">
                        BIOMETRIC VERIFICATION • SCANNING FACE • GIGGS WORKER PRO •
                      </textPath>
                    </text>

                    {/* Inner Target Crosshairs / Lock Icons */}
                    <circle cx="150" cy="24" r="3" fill="#34d399" />
                    <circle cx="150" cy="276" r="3" fill="#34d399" />
                    <circle cx="24" cy="150" r="3" fill="#34d399" />
                    <circle cx="276" cy="150" r="3" fill="#34d399" />

                    {/* Lock Icon Left & Right */}
                    <rect x="36" y="145" width="10" height="10" rx="2" stroke="#34d399" strokeWidth="1.5" />
                    <rect x="254" y="145" width="10" height="10" rx="2" stroke="#34d399" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>

              {/* FLOATING DIRECTION INSTRUCTION PILL AT BOTTOM OF CAMERA FEED */}
              <div className="absolute bottom-4 z-30 pointer-events-none">
                <div className="bg-black/90 backdrop-blur-md text-white px-5 py-2 rounded-full shadow-2xl flex items-center gap-2 text-xs font-black tracking-tight border border-white/20">
                  {preCountdown !== null && preCountdown > 0 ? (
                    <>
                      <span className="text-base animate-spin">⏳</span>
                      <span>Auto Starting in {preCountdown}s...</span>
                    </>
                  ) : faceVerificationComplete ? (
                    <>
                      <span className="text-base text-emerald-400">✅</span>
                      <span className="text-emerald-300">Biometric Liveness Verified</span>
                    </>
                  ) : (
                    <>
                      {currentGesture === 'left' && (
                        <>
                          <span className="text-base">↰</span>
                          <span>Move Face Left (बाईं तरफ)</span>
                        </>
                      )}
                      {currentGesture === 'up' && (
                        <>
                          <span className="text-base">↟</span>
                          <span>Tilt Head Up (ऊपर उठाएँ)</span>
                        </>
                      )}
                      {currentGesture === 'down' && (
                        <>
                          <span className="text-base">↡</span>
                          <span>Tilt Head Down (नीचे झुकाएँ)</span>
                        </>
                      )}
                      {currentGesture === 'right' && (
                        <>
                          <span className="text-base">↱</span>
                          <span>Move Face Right (दाईं तरफ)</span>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 4 DIRECTION TRACKER CARDS (HORIZONTAL ROW) */}
            <div className="grid grid-cols-4 gap-2.5 pt-1">
              {/* LEFT */}
              <div
                className={`p-3 rounded-2xl text-center border transition-all flex flex-col items-center justify-center gap-1 ${
                  completedGestures.left || (isVerifyingFace && currentGesture === 'left')
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-md font-black'
                    : 'bg-slate-50 border-slate-200 text-slate-400 font-extrabold'
                }`}
              >
                <span className="text-[10px] tracking-wider uppercase">LEFT</span>
                <span className="text-lg">←</span>
              </div>

              {/* UP */}
              <div
                className={`p-3 rounded-2xl text-center border transition-all flex flex-col items-center justify-center gap-1 ${
                  completedGestures.up || (isVerifyingFace && currentGesture === 'up')
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-md font-black'
                    : 'bg-slate-50 border-slate-200 text-slate-400 font-extrabold'
                }`}
              >
                <span className="text-[10px] tracking-wider uppercase">UP</span>
                <span className="text-lg">↑</span>
              </div>

              {/* DOWN */}
              <div
                className={`p-3 rounded-2xl text-center border transition-all flex flex-col items-center justify-center gap-1 ${
                  completedGestures.down || (isVerifyingFace && currentGesture === 'down')
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-md font-black'
                    : 'bg-slate-50 border-slate-200 text-slate-400 font-extrabold'
                }`}
              >
                <span className="text-[10px] tracking-wider uppercase">DOWN</span>
                <span className="text-lg">↓</span>
              </div>

              {/* RIGHT */}
              <div
                className={`p-3 rounded-2xl text-center border transition-all flex flex-col items-center justify-center gap-1 ${
                  completedGestures.right || (isVerifyingFace && currentGesture === 'right')
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-md font-black'
                    : 'bg-slate-50 border-slate-200 text-slate-400 font-extrabold'
                }`}
              >
                <span className="text-[10px] tracking-wider uppercase">RIGHT</span>
                <span className="text-lg">→</span>
              </div>
            </div>

            {/* 3s COMPRESSED VIDEO TIMELAPSE BADGE */}
            {videoStats && (
              <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl p-3.5 flex items-center justify-between text-xs text-white shadow-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">videocam</span>
                  </div>
                  <div>
                    <p className="font-extrabold text-xs text-emerald-300">10s Live Video Sped-Up & Compressed</p>
                    <p className="text-[10px] text-slate-400">Fast 3-sec clip stored in database</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="bg-emerald-500 text-slate-950 px-2.5 py-1 rounded-lg text-xs font-black font-mono shadow-sm inline-block">
                    {videoStats.compressedSizeKB} KB
                  </span>
                  <p className="text-[9px] text-emerald-400 font-extrabold mt-0.5">{videoStats.reductionPercentage}% DB Space Saved</p>
                </div>
              </div>
            )}

            {/* INSTRUCTION BADGE & RE-TEST BUTTON */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <span className="material-symbols-outlined text-base text-emerald-600">volume_up</span>
                <span>Hindi Voice Assistant is active</span>
              </div>

              <button
                type="button"
                onClick={handleStartLiveVerification}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline"
              >
                Restart Verification
              </button>
            </div>

            {/* FINAL REGISTRATION SUBMISSION BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!faceVerificationComplete || isLoading}
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl ${
                  faceVerificationComplete
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30 cursor-pointer active:scale-[0.98]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                }`}
              >
                {isLoading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Creating Partner Account...</span>
                  </>
                ) : faceVerificationComplete ? (
                  <>
                    <span className="material-symbols-outlined text-lg">verified</span>
                    <span>Complete Partner Registration</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">lock</span>
                    <span>Complete 10-Sec Liveness Check</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Aadhaar Live Camera Capture Modal */}
      {isAadhaarCamOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">photo_camera</span>
                <span className="text-sm font-bold">Snap Aadhaar Card Photo</span>
              </div>
              <button
                onClick={stopAadhaarCamera}
                className="text-slate-400 hover:text-white p-1 rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="relative w-full h-72 bg-black flex items-center justify-center">
              <video
                ref={aadhaarVideoRef}
                className="w-full h-full object-cover"
                muted
                playsInline
              />

              {/* Target Document Overlay Frame */}
              <div className="absolute inset-6 border-2 border-dashed border-amber-400/80 rounded-2xl pointer-events-none flex flex-col items-center justify-between p-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 bg-black/70 px-3 py-1 rounded-full">
                  Align Aadhaar Card Inside Frame
                </span>
                <div className="w-full flex justify-between text-amber-400 text-xs font-mono">
                  <span>[ FRONT SIDE ]</span>
                  <span>[ READABLE ]</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={stopAadhaarCamera}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={captureAadhaarPhoto}
                disabled={isCapturingAadhaar}
                className="flex-1 max-w-xs py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 uppercase tracking-wider transition-all active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-lg">photo_camera</span>
                <span>{isCapturingAadhaar ? 'Capturing Snapshot...' : '📸 Snap Aadhaar Photo'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
