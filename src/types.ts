export type UserRole = 'resident' | 'society' | 'society_staff' | 'worker' | 'admin';

export type ScreenId =
  | 'welcome'
  | 'resident_login'
  | 'resident_register'
  | 'resident_home'
  | 'resident_book_service'
  | 'resident_invite'
  | 'resident_checkout'
  | 'resident_emergency'
  | 'resident_rate'
  | 'resident_claim'
  | 'society_login'
  | 'society_register'
  | 'society_dashboard'
  | 'society_new_visit'
  | 'worker_login'
  | 'worker_register'
  | 'worker_dashboard'
  | 'worker_queue'
  | 'worker_earnings'
  | 'worker_welfare'
  | 'admin_login'
  | 'admin_overview'
  | 'admin_verification_queue'
  | 'admin_worker_directory'
  | 'admin_skills'
  | 'admin_residents'
  | 'admin_matching'
  | 'admin_forecasting';

export interface PricingTier {
  id: string;
  name?: string;
  label?: string;
  minParticipants: number;
  maxParticipants: number;
  price: number;
}

export interface ServiceVisit {
  id: string;
  title: string;
  category: string;
  societyName: string;
  address: string;
  date: string;
  timeWindow: string;
  proName: string;
  proRating: number;
  proReviewsCount: number;
  proPhoto: string;
  proSpecialty: string;
  currentRate: number;
  originalRate: number;
  joinedCount: number;
  targetCount: number;
  nextTierRate?: number;
  remainingForNextTier?: number;
  tiers: PricingTier[];
  status: 'active' | 'scheduled' | 'completed' | 'registrations_open' | 'in_progress' | 'cancelled' | 'worker_confirmed';
  description: string;
  shareToken?: string;
}

export interface Booking {
  id: string;
  serviceTitle: string;
  category: 'plumbing' | 'electrical' | 'ac' | 'cleaning' | 'locksmith';
  date: string;
  time: string;
  status: 'Completed' | 'In Progress' | 'Scheduled' | 'Cancelled';
  workerName: string;
  workerPhoto?: string;
  amount: number;
  hasClaim?: boolean;
  hasRated?: boolean;
}

export interface WorkerJob {
  id: string;
  visitId: string;
  aptNo: string;
  residentName: string;
  serviceTitle: string;
  status: 'in_progress' | 'pending' | 'completed';
  requestedTime: string;
  price: number;
  urgent?: boolean;
  category: string;
  image?: string;
  materials?: { id: string; name: string; qty: number; cost: number }[];
}

export interface Review {
  id: string;
  authorName: string;
  authorPhoto: string;
  date: string;
  serviceTitle: string;
  rating: number;
  comment: string;
}

export interface CandidateMatch {
  id: string;
  name: string;
  tier: string;
  distance: string;
  matchScore: number;
  skillScore: number;
  proxScore: number;
  rating: number;
  availability: string;
  photo?: string;
}

export interface Hotspot {
  id: string;
  rank: number;
  name: string;
  category: string;
  demandLevel: 'High' | 'Med-High' | 'Medium' | 'Low';
  confidence: number;
}
