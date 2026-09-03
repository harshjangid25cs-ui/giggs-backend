// GIGGS Central Database Client & State Layer (Supabase Ready)
import {
  User,
  Society,
  Worker,
  ServiceVisit,
  Job,
  GuaranteeClaim,
  WelfareCoverage,
  CandidateMatch,
  HotspotForecast
} from '../types/database';

export interface DatabaseState {
  users: User[];
  societies: Society[];
  workers: Worker[];
  serviceVisits: ServiceVisit[];
  jobs: Job[];
  guaranteeClaims: GuaranteeClaim[];
  welfare: WelfareCoverage[];
  candidateMatches: CandidateMatch[];
  hotspots: HotspotForecast[];
}

export const INITIAL_DATABASE_STATE: DatabaseState = {
  users: [
    {
      id: 'usr-1',
      name: 'Arun Verma',
      phone: '+91 98231 44921',
      email: 'arun.verma@greenvalley.res',
      role: 'resident',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      societyId: 'soc-1',
      flatNo: 'B-402',
      createdAt: '2026-08-01'
    },
    {
      id: 'usr-2',
      name: 'Amit Sharma',
      phone: '+91 99881 12345',
      email: 'estate.manager@greenvalley.com',
      role: 'society_staff',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      societyId: 'soc-1',
      createdAt: '2026-07-15'
    },
    {
      id: 'usr-3',
      name: 'Ramesh Kumar',
      phone: '+91 94140 88219',
      email: 'ramesh.k@hvac-cooperative.org',
      role: 'worker',
      avatarUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-06-10'
    },
    {
      id: 'usr-4',
      name: 'Operations Command',
      phone: '+91 80000 11111',
      email: 'ops@giggs.community',
      role: 'admin',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-01-01'
    }
  ],

  societies: [
    {
      id: 'soc-1',
      name: 'Green Valley Society',
      address: 'Plot 4, Sector 12, Golf Course Ext Rd',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122001',
      totalFlats: 320,
      activeResidentsCount: 248,
      contactPerson: 'Amit Sharma (Facility Head)',
      contactPhone: '+91 99881 12345'
    },
    {
      id: 'soc-2',
      name: 'Skyline Towers',
      address: 'Wing B, Cyber Expressway',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122002',
      totalFlats: 180,
      activeResidentsCount: 140,
      contactPerson: 'Sunil Mehta',
      contactPhone: '+91 98765 43210'
    }
  ],

  workers: [
    {
      id: 'wrk-1',
      userId: 'usr-3',
      name: 'Ramesh Kumar',
      phone: '+91 94140 88219',
      photo: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
      skills: ['AC Servicing', 'HVAC Diagnostics', 'Coil Deep Cleaning'],
      cooperativeName: 'NCR Technician Guild & Welfare Coop',
      identityVerified: true,
      policeVerificationVerified: true,
      ppeCompliance: true,
      rating: 4.9,
      totalJobs: 426,
      punctualityScore: 99.2,
      cleanlinessScore: 98.5,
      isOnline: true,
      currentSocietyId: 'soc-1',
      availableBalance: 4500
    },
    {
      id: 'wrk-2',
      userId: 'usr-5',
      name: 'John Doe',
      phone: '+91 91234 56789',
      photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      skills: ['Master Plumbing', 'Leak Detection', 'Pipe Welding'],
      cooperativeName: 'All-India Plumber Alliance',
      identityVerified: true,
      policeVerificationVerified: true,
      ppeCompliance: true,
      rating: 4.8,
      totalJobs: 318,
      punctualityScore: 98.0,
      cleanlinessScore: 99.0,
      isOnline: true,
      currentSocietyId: 'soc-2',
      availableBalance: 3200
    }
  ],

  serviceVisits: [
    {
      id: 'SV-10293',
      societyId: 'soc-1',
      societyName: 'Green Valley Society',
      societyAddress: 'Plot 4, Sector 12, Gurugram',
      createdByStaffId: 'usr-2',
      serviceId: 'srv-ac',
      serviceTitle: 'AC Servicing & Maintenance',
      category: 'ac',
      workerId: 'wrk-1',
      proName: 'Ramesh Kumar',
      proRating: 4.9,
      proReviewsCount: 124,
      proPhoto: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
      proSpecialty: 'Master HVAC & Coils Specialist',
      date: 'Sunday, Oct 29',
      startTime: '10:00 AM',
      endTime: '04:00 PM',
      timeWindow: '10:00 AM - 04:00 PM',
      capacity: 15,
      joinedCount: 12,
      targetCount: 15,
      status: 'registrations_open',
      shareToken: 'ABC123',
      currentRate: 449,
      originalRate: 549,
      nextTierRate: 399,
      remainingForNextTier: 3,
      description: 'Society-wide air conditioner servicing batch. Includes indoor/outdoor coil pressure jet cleaning, gas pressure testing, filter sterilization, and drain pipe unclogging.',
      createdAt: '2026-08-25',
      tiers: [
        { id: 't1', minParticipants: 1, maxParticipants: 4, price: 549, label: 'Base Rate' },
        { id: 't2', minParticipants: 5, maxParticipants: 9, price: 499, label: 'Tier 1 Discount' },
        { id: 't3', minParticipants: 10, maxParticipants: 14, price: 449, label: 'Tier 2 Group Deal' },
        { id: 't4', minParticipants: 15, maxParticipants: 30, price: 399, label: 'Maximum Group Discount' }
      ]
    },
    {
      id: 'SV-10294',
      societyId: 'soc-2',
      societyName: 'Skyline Towers',
      societyAddress: 'Wing B, Cyber Expressway',
      createdByStaffId: 'usr-6',
      serviceId: 'srv-plumbing',
      serviceTitle: 'Plumbing & Leak Inspection',
      category: 'plumbing',
      workerId: 'wrk-2',
      proName: 'John Doe',
      proRating: 4.8,
      proReviewsCount: 88,
      proPhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      proSpecialty: 'High-Pressure Leak Specialist',
      date: 'Saturday, Oct 28',
      startTime: '09:00 AM',
      endTime: '01:00 PM',
      timeWindow: '09:00 AM - 01:00 PM',
      capacity: 10,
      joinedCount: 4,
      targetCount: 8,
      status: 'in_progress',
      shareToken: 'PLUMB99',
      currentRate: 199,
      originalRate: 299,
      nextTierRate: 149,
      remainingForNextTier: 4,
      description: 'Comprehensive inspection of shutoff valves, sink traps, geyser water connectors, and bathroom fixture leaks with free minor washer replacements.',
      createdAt: '2026-08-26',
      tiers: [
        { id: 'p1', minParticipants: 1, maxParticipants: 3, price: 299 },
        { id: 'p2', minParticipants: 4, maxParticipants: 7, price: 199 },
        { id: 'p3', minParticipants: 8, maxParticipants: 15, price: 149 }
      ]
    }
  ],

  jobs: [
    {
      id: 'job-1',
      serviceVisitId: 'SV-10294',
      residentId: 'usr-7',
      residentName: 'Aarav Patel',
      flatNo: '402',
      workerId: 'wrk-2',
      workerName: 'John Doe',
      serviceTitle: 'Master Bath Valve Replacement',
      category: 'plumbing',
      status: 'in_progress',
      requestedTime: '10:30 AM',
      labourAmount: 80,
      materials: [
        { id: 'm1', name: 'PVC Pipe Fittings', qty: 3, unitPrice: 18.5, customerApproved: true },
        { id: 'm2', name: 'Sealant Tape', qty: 1, unitPrice: 4.0, customerApproved: true },
        { id: 'm3', name: 'Replacement Valve', qty: 1, unitPrice: 32.0, customerApproved: true }
      ],
      discountAmount: 20,
      totalAmount: 134,
      residentPhotoEvidence: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&auto=format&fit=crop&q=80',
      guaranteeExpiresAt: '2026-11-08'
    },
    {
      id: 'job-2',
      serviceVisitId: 'SV-10294',
      residentId: 'usr-8',
      residentName: 'Sarah Jenkins',
      flatNo: '304',
      workerId: 'wrk-2',
      workerName: 'John Doe',
      serviceTitle: 'Kitchen Sink Trap Replacement',
      category: 'plumbing',
      status: 'pending',
      requestedTime: '11:15 AM',
      labourAmount: 75,
      materials: [],
      discountAmount: 15,
      totalAmount: 60
    }
  ],

  guaranteeClaims: [
    {
      id: 'CLM-9281',
      jobId: 'job-hist-1',
      serviceTitle: 'AC Servicing & Gas Top-up',
      residentName: 'Pooja Mehta',
      flatNo: 'A-201',
      workerName: 'Rajesh K.',
      claimDate: '2026-08-29',
      expiryDate: '2026-09-08',
      issueType: 'Water Dripping Inside Room',
      description: 'Drain pipe appears partially clogged after deep jet wash.',
      status: 'UNDER_REVIEW'
    }
  ],

  welfare: [
    {
      id: 'wlf-1',
      workerId: 'wrk-1',
      policyNo: 'WLF-88219',
      sumInsured: 500000,
      provider: 'Care Health Insurance',
      expiryDate: '2026-12-31',
      status: 'ACTIVE',
      telehealthEligible: true,
      accidentCover: true,
      familyAddon: true
    }
  ],

  candidateMatches: [
    {
      id: 'cand-1',
      workerId: 'wrk-1',
      name: 'Ramesh Kumar',
      tier: 'Master Pro (Co-op Lead)',
      distance: '0.8 km from Green Valley',
      matchScore: 96,
      skillScore: 98,
      proxScore: 94,
      rating: 4.9,
      availability: 'Immediate (Sunday Slot)',
      photo: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
      skills: ['AC Maintenance', 'Compressor Diagnostics', 'Coil Cleaning']
    },
    {
      id: 'cand-2',
      workerId: 'wrk-3',
      name: 'Sunita Devi',
      tier: 'Senior Certified Pro',
      distance: '1.4 km from Green Valley',
      matchScore: 91,
      skillScore: 92,
      proxScore: 89,
      rating: 4.85,
      availability: 'Available Sunday',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      skills: ['HVAC Servicing', 'Electrical Wiring', 'Fan Motor Replacement']
    },
    {
      id: 'cand-3',
      workerId: 'wrk-4',
      name: 'Vikram Singh',
      tier: 'Certified Pro',
      distance: '2.1 km from Green Valley',
      matchScore: 87,
      skillScore: 88,
      proxScore: 85,
      rating: 4.75,
      availability: 'Available Sunday Afternoon',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      skills: ['AC Jet Wash', 'Plumbing']
    }
  ],

  hotspots: [
    {
      id: 'hs-1',
      rank: 1,
      name: 'Green Valley Society',
      societyId: 'soc-1',
      category: 'AC & HVAC Servicing',
      demandLevel: 'High',
      confidence: 94,
      surgeMultiplier: 1.4,
      recommendedTechnicians: 8
    },
    {
      id: 'hs-2',
      rank: 2,
      name: 'Pink City Residency',
      societyId: 'soc-3',
      category: 'Deep Cleaning & Dust Proofing',
      demandLevel: 'High',
      confidence: 91,
      surgeMultiplier: 1.3,
      recommendedTechnicians: 6
    },
    {
      id: 'hs-3',
      rank: 3,
      name: 'Mansarovar Heights',
      societyId: 'soc-4',
      category: 'Plumbing & Pressure Valves',
      demandLevel: 'Med-High',
      confidence: 88,
      surgeMultiplier: 1.2,
      recommendedTechnicians: 4
    }
  ]
};
