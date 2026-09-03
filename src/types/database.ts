// Database Schema and Unified Relational Data Types for GIGGS

export type UserRole = 'resident' | 'society' | 'society_staff' | 'worker' | 'admin';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatarUrl: string;
  societyId?: string;
  flatNo?: string;
  createdAt: string;
}

export interface Society {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  totalFlats: number;
  activeResidentsCount: number;
  contactPerson: string;
  contactPhone: string;
  bannerImage?: string;
}

export interface SocietyStaff {
  id: string;
  userId: string;
  societyId: string;
  designation: string;
  department: string;
  canCreateVisits: boolean;
  canApproveBills: boolean;
}

export interface Skill {
  id: string;
  code: 'ac' | 'plumbing' | 'electrical' | 'carpentry' | 'cleaning' | 'locksmith';
  name: string;
  category: string;
  baseRatePerHour: number;
}

export interface Certification {
  id: string;
  workerId: string;
  title: string;
  issuingBody: string;
  issueDate: string;
  expiryDate?: string;
  verified: boolean;
  certificateUrl?: string;
}

export interface Worker {
  id: string;
  userId: string;
  name: string;
  phone: string;
  photo: string;
  skills: string[];
  cooperativeName: string;
  identityVerified: boolean;
  policeVerificationVerified: boolean;
  ppeCompliance: boolean;
  rating: number;
  totalJobs: number;
  punctualityScore: number;
  cleanlinessScore: number;
  isOnline: boolean;
  currentSocietyId?: string;
  availableBalance: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  basePrice: number;
}

export interface PricingTier {
  id: string;
  serviceId?: string;
  serviceVisitId?: string;
  minParticipants: number;
  maxParticipants: number;
  price: number;
  discountPercentage?: number;
  name?: string;
  label?: string;
}

export interface ServiceVisit {
  id: string;
  societyId: string;
  societyName: string;
  societyAddress: string;
  createdByStaffId: string;
  serviceId: string;
  serviceTitle: string;
  category: string;
  workerId: string;
  proName: string;
  proRating: number;
  proReviewsCount: number;
  proPhoto: string;
  proSpecialty: string;
  date: string;
  startTime: string;
  endTime: string;
  timeWindow: string;
  capacity: number;
  joinedCount: number;
  targetCount: number;
  status: 'draft' | 'registrations_open' | 'in_progress' | 'completed' | 'cancelled';
  shareToken: string;
  currentRate: number;
  originalRate: number;
  nextTierRate?: number;
  remainingForNextTier?: number;
  tiers: PricingTier[];
  description: string;
  createdAt: string;
}

export interface ServiceRegistration {
  id: string;
  serviceVisitId: string;
  residentId: string;
  residentName: string;
  flatNo: string;
  phone: string;
  preferredSlot: string;
  serviceOption: string;
  notes?: string;
  registeredAt: string;
  status: 'registered' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
}

export interface MaterialItem {
  id: string;
  jobId?: string;
  name: string;
  qty: number;
  unitPrice: number;
  customerApproved: boolean;
}

export interface Job {
  id: string;
  serviceVisitId: string;
  registrationId?: string;
  residentId: string;
  residentName: string;
  flatNo: string;
  workerId: string;
  workerName: string;
  serviceTitle: string;
  category: string;
  status: 'pending' | 'in_progress' | 'awaiting_payment' | 'completed' | 'cancelled';
  requestedTime: string;
  startedAt?: string;
  completedAt?: string;
  loggedDurationMinutes?: number;
  labourAmount: number;
  materials: MaterialItem[];
  discountAmount: number;
  totalAmount: number;
  notes?: string;
  residentPhotoEvidence?: string;
  guaranteeExpiresAt?: string;
}

export interface GuaranteeClaim {
  id: string;
  jobId: string;
  serviceTitle: string;
  residentName: string;
  flatNo: string;
  workerName: string;
  claimDate: string;
  expiryDate: string;
  issueType: string;
  description: string;
  evidencePhoto?: string;
  status: 'ACTIVE' | 'CLAIM_SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REVISIT_SCHEDULED' | 'RESOLVED' | 'REJECTED';
  resolutionNote?: string;
}

export interface WelfareCoverage {
  id: string;
  workerId: string;
  policyNo: string;
  sumInsured: number;
  provider: string;
  expiryDate: string;
  status: 'ACTIVE' | 'PENDING' | 'RENEWAL_DUE';
  telehealthEligible: boolean;
  accidentCover: boolean;
  familyAddon: boolean;
}

export interface CandidateMatch {
  id: string;
  workerId: string;
  name: string;
  tier: string;
  distance: string;
  matchScore: number;
  skillScore: number;
  proxScore: number;
  rating: number;
  availability: string;
  photo: string;
  skills: string[];
}

export interface HotspotForecast {
  id: string;
  rank: number;
  name: string;
  societyId: string;
  category: string;
  demandLevel: 'High' | 'Med-High' | 'Medium' | 'Low';
  confidence: number;
  surgeMultiplier: number;
  recommendedTechnicians: number;
}
