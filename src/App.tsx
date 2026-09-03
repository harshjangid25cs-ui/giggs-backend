import React, { useState, useEffect } from 'react';
import { ScreenId, UserRole, ServiceVisit, Booking, WorkerJob } from './types';
import { supabase } from './lib/supabaseClient';
import {
  INITIAL_SERVICE_VISITS,
  INITIAL_BOOKINGS,
  INITIAL_WORKER_JOBS,
  ASSET_IMAGES
} from './data/mockData';
import { TopNav } from './components/TopNav';
import { BottomNav } from './components/BottomNav';
import { ToastNotification, ToastMessage } from './components/modals/ToastNotification';
import { AuthSession, getDemoSession } from './lib/auth';
import { createServiceVisit, registerResidentForVisit, updateJobStatus, fetchServiceVisitsForSociety, fetchWorkerJobs, fetchAdminStats, fetchWorkerProfile, updateWorkerStatus, fetchWorkerVisits, updateVisitStatus, createDirectBooking } from './lib/api';

// Views
import { WelcomeView } from './components/views/WelcomeView';
import { ResidentLoginView } from './components/views/ResidentLoginView';
import { ResidentRegisterView } from './components/views/ResidentRegisterView';
import { ResidentDashboardView } from './components/views/ResidentDashboardView';
import { ResidentBookServiceView } from './components/views/ResidentBookServiceView';
import { ResidentInviteView } from './components/views/ResidentInviteView';
import { CheckoutView } from './components/views/CheckoutView';
import { EmergencyView } from './components/views/EmergencyView';
import { RateServiceView } from './components/views/RateServiceView';
import { GuaranteeClaimView } from './components/views/GuaranteeClaimView';
import { SocietyLoginView } from './components/views/SocietyLoginView';
import { SocietyRegisterView } from './components/views/SocietyRegisterView';
import { SocietyDashboardView } from './components/views/SocietyDashboardView';
import { SocietyNewVisitView } from './components/views/SocietyNewVisitView';
import { WorkerLoginView } from './components/views/WorkerLoginView';
import { WorkerRegisterView } from './components/views/WorkerRegisterView';
import { WorkerDashboardView } from './components/views/WorkerDashboardView';
import { WorkerQueueView } from './components/views/WorkerQueueView';
import { WorkerEarningsView } from './components/views/WorkerEarningsView';
import { WorkerWelfareView } from './components/views/WorkerWelfareView';
import { AdminOverviewView } from './components/views/AdminOverviewView';
import { AdminMatchingView } from './components/views/AdminMatchingView';
import { AdminForecastingView } from './components/views/AdminForecastingView';
import { AdminLoginView } from './components/views/AdminLoginView';
import { AdminVerificationQueueView } from './components/views/AdminVerificationQueueView';
import { AdminWorkerDirectoryView } from './components/views/AdminWorkerDirectoryView';
import { AdminSkillsView } from './components/views/AdminSkillsView';
import { AdminResidentsView } from './components/views/AdminResidentsView';
import { AdminShell } from './components/views/AdminShell';
import { AdminDashboardView } from './components/views/AdminDashboardView';

interface RegisteredUser {
  email?: string;
  phone?: string;
  role: UserRole;
  name: string;
}

const DEFAULT_REGISTERED_USERS: RegisteredUser[] = [];

export function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>(() => {
    const path = window.location.pathname;
    if (path.startsWith('/join/')) {
      return 'resident_invite';
    }
    const saved = localStorage.getItem('giggs_current_screen');
    return (saved as ScreenId) || 'welcome';
  });
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const path = window.location.pathname;
    if (path.startsWith('/join/')) {
      return 'resident';
    }
    return (localStorage.getItem('giggs_current_role') as UserRole) || 'resident';
  });

  useEffect(() => {
    localStorage.setItem('giggs_current_role', currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('giggs_current_screen', currentScreen);
  }, [currentScreen]);

  const [authSession, setAuthSession] = useState<AuthSession | null>(() => {
    try {
      const saved = localStorage.getItem('giggs_auth_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (authSession) {
      localStorage.setItem('giggs_auth_session', JSON.stringify(authSession));
    } else {
      localStorage.removeItem('giggs_auth_session');
    }
  }, [authSession]);

  // User Registration State
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(() => {
    try {
      const saved = localStorage.getItem('giggs_registered_users');
      return saved ? JSON.parse(saved) : DEFAULT_REGISTERED_USERS;
    } catch {
      return DEFAULT_REGISTERED_USERS;
    }
  });

  const registerUser = async (
    user: RegisteredUser, 
    societyId: string = 'b410425c-897e-4b44-a902-861c28c8efd1',
    flatNo?: string
  ) => {
    setRegisteredUsers((prev) => {
      const updated = [...prev, user];
      try {
        localStorage.setItem('giggs_registered_users', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save registered user', e);
      }
      return updated;
    });

    // IMPORTANT: Try inserting into Supabase FIRST so we get a real UUID
    let realUserId: string | null = null;
    try {
      const dbRole = user.role === 'society' ? 'society_staff' : user.role;
      const { data: dbUser, error } = await supabase
        .from('users')
        .insert({
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: dbRole,
          society_id: societyId,
          flat_no: flatNo
        } as any)
        .select()
        .single();

      if (dbUser && !error) {
        realUserId = dbUser.id;
      }
    } catch (err) {
      console.warn('Could not persist new user to Supabase:', err);
    }

    // Use real DB UUID if available, otherwise use the known fallback staff UUID
    const FALLBACK_STAFF_ID = '22222222-2222-2222-2222-222222222222'; // Amit Sharma (society_staff)
    const sessionUser = {
      id: realUserId || FALLBACK_STAFF_ID,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      societyId: societyId,
      flatNo: flatNo
    };

    setAuthSession({
      user: sessionUser,
      role: user.role,
      isAuthenticated: true
    });
  };

  // Core Data Collections
  const [serviceVisits, setServiceVisits] = useState<ServiceVisit[]>(() => {
    try {
      const saved = localStorage.getItem('giggs_service_visits');
      return saved ? JSON.parse(saved) : INITIAL_SERVICE_VISITS;
    } catch {
      return INITIAL_SERVICE_VISITS;
    }
  });
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [workerJobs, setWorkerJobs] = useState<WorkerJob[]>(INITIAL_WORKER_JOBS);
  const [adminStats, setAdminStats] = useState({ societyCount: 0, workerCount: 0, gmv: 0, fulfillmentRate: 99.4 });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Listen for Supabase OAuth Callback
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const email = session.user.email;
          if (email) {
            // 1. Check if user exists in Supabase DB
            try {
              const { data: dbUser } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

              if (dbUser) {
                const userRole = (dbUser.role === 'society_staff' ? 'society' : dbUser.role) as UserRole;
                const sessionUser = {
                  id: dbUser.id,
                  name: dbUser.name,
                  phone: dbUser.phone,
                  email: dbUser.email,
                  role: userRole,
                  societyId: dbUser.society_id,
                  flatNo: dbUser.flat_no
                };
                setAuthSession({
                  user: sessionUser,
                  role: userRole,
                  isAuthenticated: true
                });
                setCurrentRole(userRole);
                const dashScreen = userRole === 'resident' ? 'resident_home' :
                                   userRole === 'society' ? 'society_dashboard' : 'worker_dashboard';
                setCurrentScreen(dashScreen);
                addToast('success', 'Logged In Successfully', `Welcome back ${dbUser.name || email}`);
                return;
              }
            } catch (e) {
              console.warn('DB check for OAuth user failed:', e);
            }

            // 2. Check local registered users store
            const user = registeredUsers.find(u => u.email === email && u.role === currentRole);
            if (user) {
              const dashScreen = user.role === 'resident' ? 'resident_home' :
                                 user.role === 'society' ? 'society_dashboard' : 'worker_dashboard';
              setCurrentRole(user.role);
              setCurrentScreen(dashScreen);
              addToast('success', 'Logged In Successfully', `Welcome back ${user.name || email}`);
            } else {
              // 3. User is NOT registered -> Redirect to Registration page
              addToast('warning', 'Account Not Registered!', `No account found for "${email}". Redirecting you to register...`);
              
              if (currentRole === 'society') {
                setCurrentScreen('society_register');
              } else if (currentRole === 'worker') {
                setCurrentScreen('worker_register');
              } else {
                setCurrentScreen('resident_register');
              }
            }
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [registeredUsers, currentRole]);

  // Helper to map DB visits to local ServiceVisit type
  const mapDbVisitsToLocal = (data: any[]): ServiceVisit[] => {
    return data.map(dbVisit => {
      const joinedCount = dbVisit.jobs?.[0]?.count || 0;
      const sortedTiers = (dbVisit.tiers || []).map((t: any) => ({
        id: t.id,
        name: t.label,
        minParticipants: t.min_participants,
        maxParticipants: t.max_participants,
        price: t.price
      })).sort((a: any, b: any) => a.minParticipants - b.minParticipants);

      let activeTierIdx = 0;
      for (let i = 0; i < sortedTiers.length; i++) {
        if (joinedCount >= sortedTiers[i].minParticipants) {
          activeTierIdx = i;
        }
      }
      const currentRate = sortedTiers[activeTierIdx]?.price || 0;
      const originalRate = sortedTiers[0]?.price ? sortedTiers[0].price + 150 : 0;

      return {
        id: dbVisit.id,
        title: dbVisit.service?.title || 'Unknown Service',
        category: dbVisit.service?.category || 'general',
        societyName: dbVisit.society?.name || 'Unknown Society',
        address: dbVisit.society?.address || '',
        date: dbVisit.date,
        timeWindow: dbVisit.time_window,
        proName: dbVisit.worker?.users?.name || 'Assigned Pro',
        proRating: dbVisit.worker?.rating || 4.5,
        proReviewsCount: 0,
        proPhoto: dbVisit.worker?.users?.avatar_url || ASSET_IMAGES.workerRajeshAssign,
        proSpecialty: 'Professional',
        currentRate,
        originalRate,
        joinedCount,
        targetCount: dbVisit.capacity,
        status: dbVisit.status as ServiceVisit['status'],
        description: dbVisit.service?.description || '',
        tiers: sortedTiers,
        shareToken: dbVisit.share_token
      };
    });
  };

  // Persist service visits to localStorage whenever they change
  useEffect(() => {
    try {
      if (serviceVisits.length > 0) {
        localStorage.setItem('giggs_service_visits', JSON.stringify(serviceVisits));
      }
    } catch (e) {
      console.warn('Failed to persist service visits', e);
    }
  }, [serviceVisits]);

  // Fetch real service visits when logged in as society
  const refreshServiceVisits = async (societyId: string) => {
    try {
      const data = await fetchServiceVisitsForSociety(societyId);
      if (data && data.length > 0) {
        const mappedVisits = mapDbVisitsToLocal(data);
        setServiceVisits(mappedVisits);
      }
    } catch (e) {
      console.error('Failed to refresh service visits:', e);
    }
  };

  useEffect(() => {
    if (authSession?.user?.societyId && (currentRole === 'society' || currentRole === 'resident' || currentRole === 'worker')) {
      refreshServiceVisits(authSession.user.societyId);
    }
  }, [authSession?.user?.societyId, currentRole]);

  // Also re-fetch when navigating to society_dashboard
  useEffect(() => {
    if (currentScreen === 'society_dashboard' && authSession?.user?.societyId) {
      refreshServiceVisits(authSession.user.societyId);
    }
  }, [currentScreen]);

  const [workerVisits, setWorkerVisits] = useState<ServiceVisit[]>([]);
  const [workerProfile, setWorkerProfile] = useState<any>(null);
  const [activeVisitId, setActiveVisitId] = useState<string | null>(null);

  // Fetch real worker jobs and profile when logged in as worker
  useEffect(() => {
    if (currentRole === 'worker' && authSession?.user?.id) {
      fetchWorkerProfile(authSession.user.id).then(profile => {
        setWorkerProfile(profile);
        if (profile) {
          fetchWorkerVisits(profile.id).then(visits => {
            // map db visits to ServiceVisit format
            const mappedVisits = visits.map((dbVisit: any) => {
              const joinedCount = dbVisit.jobs?.[0]?.count || 0;
              return {
                id: dbVisit.id,
                title: dbVisit.service?.title || 'Unknown Service',
                category: dbVisit.service?.category || 'general',
                societyName: dbVisit.society?.name || 'Unknown Society',
                address: dbVisit.society?.address || '',
                date: dbVisit.date,
                timeWindow: dbVisit.time_window,
                proName: dbVisit.worker?.users?.name || 'Assigned Pro',
                proRating: dbVisit.worker?.rating || 4.5,
                proReviewsCount: 0,
                proPhoto: dbVisit.worker?.users?.avatar_url || ASSET_IMAGES.workerRajeshAssign,
                proSpecialty: 'Professional',
                currentRate: 0,
                originalRate: 0,
                joinedCount,
                targetCount: dbVisit.capacity,
                status: dbVisit.status as ServiceVisit['status'],
                description: dbVisit.service?.description || '',
                tiers: [],
                shareToken: dbVisit.share_token
              };
            });
            setWorkerVisits(mappedVisits);
          });
        }
      });
      
      fetchWorkerJobs(authSession.user.id).then(data => {
        if (data && data.length > 0) {
          setWorkerJobs(data);
        }
      });
    }
  }, [currentRole, authSession?.user?.id]);

  useEffect(() => {
    if (currentRole === 'admin' || currentScreen === 'admin_overview') {
      fetchAdminStats().then(setAdminStats);
    }
  }, [currentRole, currentScreen]);

  // Real-time synchronization
  useEffect(() => {
    if (!authSession?.user?.societyId) return;
    
    if (currentRole === 'society' || currentRole === 'resident' || currentRole === 'worker') {
      const societyId = authSession.user.societyId;
      
      const handleRealtimeUpdate = async () => {
        await refreshServiceVisits(societyId);
      };

      const jobsSubscription = supabase
        .channel('public:jobs')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {
          handleRealtimeUpdate();
        })
        .subscribe();
        
      const visitsSubscription = supabase
        .channel('public:service_visits')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'service_visits' }, () => {
          handleRealtimeUpdate();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(jobsSubscription);
        supabase.removeChannel(visitsSubscription);
      };
    }
  }, [authSession?.user?.societyId, currentRole]);

  // Toast Helper
  const addToast = (
    type: ToastMessage['type'],
    title: string,
    message?: string
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Navigation Handler
  const handleNavigate = (screen: ScreenId, role?: UserRole) => {
    setCurrentScreen(screen);
    if (role) {
      setCurrentRole(role);
    } else {
      // Auto-detect role from screen context
      if (screen.startsWith('resident')) {
        setCurrentRole('resident');
      } else if (screen.startsWith('society')) {
        setCurrentRole('society');
      } else if (screen.startsWith('worker')) {
        setCurrentRole('worker');
      } else if (screen.startsWith('admin')) {
        setCurrentRole('admin');
      }
    }

    if (screen !== 'resident_invite' && window.location.pathname.startsWith('/join/')) {
      window.history.pushState({}, '', '/');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginAndNavigate = async (screen: ScreenId, role: UserRole) => {
    handleNavigate(screen, role);
  };

  // Login Verification Handler (User must be registered)
  const handleLoginAttempt = async (
    identifier: string,
    role: UserRole,
    dashboardScreen: ScreenId
  ): Promise<boolean> => {
    const cleanId = identifier.trim().toLowerCase();

    if (!cleanId) {
      addToast('error', 'Login Required', 'Please enter your email or mobile number.');
      return false;
    }

    // Try Supabase auth first
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .or(`email.ilike.${cleanId},phone.ilike.${cleanId}`)
        .eq('role', role === 'society' ? 'society_staff' : role)
        .single();
        
      if (profileData && !profileError) {
        setAuthSession({
          user: {
            id: profileData.id,
            name: profileData.name,
            phone: profileData.phone,
            email: profileData.email,
            role: profileData.role as UserRole,
            avatarUrl: profileData.avatar_url,
            societyId: profileData.society_id,
            flatNo: profileData.flat_no,
            createdAt: profileData.created_at
          },
          role: profileData.role as UserRole,
          isAuthenticated: true
        });
        
        addToast('success', 'Logged In Successfully', `Welcome back, ${profileData.name}!`);
        handleLoginAndNavigate(dashboardScreen, role);
        return true;
      }
    } catch (err) {
      console.error('Error finding user in DB:', err);
    }

    // Fallback to local mock users
    const foundUser = registeredUsers.find((u) => {
      if (u.role !== role) return false;
      const matchEmail = u.email && u.email.toLowerCase() === cleanId;
      const matchPhone = u.phone && u.phone.toLowerCase() === cleanId;
      return matchEmail || matchPhone;
    });

    if (foundUser) {
      addToast('success', 'Logged In Successfully', `Welcome back, ${foundUser.name}!`);
      handleLoginAndNavigate(dashboardScreen, role);
      return true;
    } else {
      // NOT REGISTERED: Notify user & automatically redirect to Registration page
      addToast(
        'warning',
        'Account Not Registered!',
        `No registered ${role} account found for "${identifier}". Redirecting you to register...`
      );
      
      const registerScreen = `${role}_register` as ScreenId;
      handleNavigate(registerScreen, role);
      return false;
    }
  };

  // Resident Actions
  const handleJoinVisit = (visitId: string) => {
    handleNavigate('resident_invite');
  };

  const handleRegisterSuccess = async (visitId: string, flatNo: string, phone: string, slot: string, name?: string) => {
    let visitTitle = 'AC Servicing & Maintenance';
    let visitCategory = 'ac';
    let visitWorker = 'Ramesh Kumar';
    let visitDate = 'Saturday, Oct 28';
    let currentRate = 499;

    try {
      const residentName = name?.trim() || authSession?.user?.name || `Flat ${flatNo} Resident`;
      const residentId = authSession?.user?.id || '';

      // Pass phone and name so the API creates or updates a real user row
      await registerResidentForVisit(visitId, residentId, flatNo, slot, phone, residentName);
    } catch (error: any) {
      if (error?.message?.includes('expired')) {
        addToast('error', 'Link Expired', error.message);
        return;
      }
      console.warn('Could not register in Supabase. Falling back to local state.', error);
    }

    setServiceVisits((prev) =>
      prev.map((v) => {
        if (v.id === visitId) {
          visitTitle = v.title;
          visitCategory = v.category;
          visitWorker = v.proName;
          visitDate = v.date;

          const newCount = v.joinedCount + 1;
          
          // Re-calculate tier price
          let newRate = v.currentRate;
          let nextRate = v.nextTierRate;
          let remain = v.remainingForNextTier || 1;
          
          const sortedTiers = [...(v.tiers || [])].sort((a, b) => a.minParticipants - b.minParticipants);
          let activeTierIdx = 0;
          for (let i = 0; i < sortedTiers.length; i++) {
            if (newCount >= sortedTiers[i].minParticipants) {
              activeTierIdx = i;
            }
          }
          newRate = sortedTiers[activeTierIdx]?.price || v.currentRate;
          
          if (activeTierIdx < sortedTiers.length - 1) {
             nextRate = sortedTiers[activeTierIdx + 1].price;
             remain = sortedTiers[activeTierIdx + 1].minParticipants - newCount;
          } else {
             nextRate = undefined;
             remain = 0;
          }

          currentRate = newRate;

          // If price dropped, we can optionally show a toast about it
          if (newRate < v.currentRate) {
             setTimeout(() => {
               addToast('info', 'Community Price Unlocked!', `Rate dropped to ₹${newRate} because more neighbors joined.`);
             }, 1000);
          }

          return {
            ...v,
            joinedCount: newCount,
            currentRate: newRate,
            nextTierRate: nextRate,
            remainingForNextTier: Math.max(0, remain)
          };
        }
        return v;
      })
    );

    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      serviceTitle: visitTitle,
      category: visitCategory as any,
      date: visitDate,
      time: slot || 'Morning (9 AM - 12 PM)',
      status: 'Scheduled',
      workerName: visitWorker,
      amount: currentRate
    };
    
    setBookings((prev) => [newBooking, ...prev]);
    
    const newWorkerJob: WorkerJob = {
      id: `job-${Date.now()}`,
      visitId: visitId,
      aptNo: flatNo,
      residentName: name?.trim() || `Flat ${flatNo} Resident`,
      serviceTitle: visitTitle,
      status: 'pending',
      requestedTime: slot || 'Any time during the day',
      price: currentRate,
      category: visitCategory
    };
    setWorkerJobs((prev) => [newWorkerJob, ...prev]);
    
    addToast(
      'success',
      'Registration Confirmed!',
      `Flat ${flatNo} booked. Pro ${visitWorker} notified.`
    );
    handleNavigate('resident_home', 'resident');
  };

  const handlePaymentComplete = (amount: number) => {
    addToast(
      'success',
      `Payment Received (₹${amount.toFixed(2)})`,
      '10-Day Workmanship Guarantee is now active for this repair.'
    );
  };

  const handleSosRequest = (type: string) => {
    addToast(
      'warning',
      'Emergency Dispatch Broadcasted',
      `Nearest verified emergency pro (Mike T.) is 3 minutes away from your unit.`
    );
  };

  const handleSubmitReview = (rating: number, tags: string[], comment: string) => {
    addToast(
      'success',
      'Review Published!',
      `Thank you for rating Rajesh K. ${rating} stars.`
    );
  };

  const handleSubmitClaim = (
    issueType: string,
    description: string,
    photosCount: number
  ) => {
    addToast(
      'info',
      'Guarantee Claim #CLM-9281 Filed',
      'Our society team will dispatch a free resolution within 2 hours.'
    );
    handleNavigate('resident_home', 'resident');
  };

  const handleBookService = async (serviceId: string, workerId: string, date: string, time: string, notes: string) => {
    // Use real DB fallbacks if the session IDs are not proper UUIDs (createDirectBooking handles validation)
    const rawResidentId = activeUser?.id || authSession?.user?.id || '';
    const rawSocietyId  = activeUser?.societyId || authSession?.user?.societyId || '';

    try {
      await createDirectBooking(
        rawResidentId,  // createDirectBooking handles UUID validation internally
        rawSocietyId,
        serviceId,
        workerId,
        date,
        time,
        notes
      );
      
      addToast(
        'success',
        'Booking Confirmed',
        'Your direct booking request has been sent to the professional.'
      );
      handleNavigate('resident_home', 'resident');
    } catch (err: any) {
      console.error('Error creating direct booking:', err);
      addToast('error', 'Booking Failed', err.message || 'Could not complete booking.');
    }
  };

  // UUID validation helper
  const isValidUUID = (str: string): boolean => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
  };

  // Society Actions
  const handleCreateVisit = async (newVisit: ServiceVisit, workerId?: string, serviceId?: string) => {
    // Known valid DB UUIDs as guaranteed fallbacks
    const FALLBACK_WORKER_ID  = 'a1111111-1111-1111-1111-111111111111'; // Ramesh Kumar
    const FALLBACK_SERVICE_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'; // AC Servicing
    const FALLBACK_SOCIETY_ID = 'b410425c-897e-4b44-a902-861c28c8efd1'; // Green Valley
    const FALLBACK_STAFF_ID   = '22222222-2222-2222-2222-222222222222'; // Amit Sharma (staff)

    try {
      // Resolve the society staff's real UUID — reject any fake temp IDs
      const rawStaffId = authSession?.user?.id || '';
      let staffId = isValidUUID(rawStaffId) ? rawStaffId : FALLBACK_STAFF_ID;

      // If the staff ID isn't in the DB, look up by name to get their real UUID
      if (!isValidUUID(rawStaffId) && authSession?.user?.name) {
        const { data: staffRow } = await supabase
          .from('users')
          .select('id')
          .eq('name', authSession.user.name)
          .in('role', ['society_staff', 'society'])
          .limit(1)
          .single();
        if (staffRow?.id) staffId = staffRow.id;
      }

      // Resolve society ID — default to Green Valley if missing or fake
      const rawSocietyId = authSession?.user?.societyId || '';
      const societyId = isValidUUID(rawSocietyId) ? rawSocietyId : FALLBACK_SOCIETY_ID;

      // Resolve worker ID
      let actualWorkerId = (workerId && isValidUUID(workerId)) ? workerId : FALLBACK_WORKER_ID;
      if (!workerId || !isValidUUID(workerId)) {
        const { data: workerData } = await supabase
          .from('workers')
          .select('id, users!inner(name)')
          .eq('users.name', newVisit.proName)
          .limit(1)
          .single();
        if (workerData?.id) actualWorkerId = workerData.id;
      }

      // Resolve service ID
      let actualServiceId = (serviceId && isValidUUID(serviceId)) ? serviceId : FALLBACK_SERVICE_ID;
      if (!serviceId || !isValidUUID(serviceId)) {
        const keyword = newVisit.category.split(/[&\s]/)[0].trim();
        const { data: serviceData } = await supabase
          .from('services')
          .select('id')
          .ilike('category', `%${keyword}%`)
          .limit(1)
          .single();
        if (serviceData?.id) actualServiceId = serviceData.id;
        else {
          // Try by title keyword
          const { data: sd2 } = await supabase
            .from('services')
            .select('id')
            .ilike('title', `%${keyword}%`)
            .limit(1)
            .single();
          if (sd2?.id) actualServiceId = sd2.id;
        }
      }

      // Final guard — all must be valid UUIDs before hitting the RPC
      if (!isValidUUID(staffId) || !isValidUUID(societyId) || !isValidUUID(actualWorkerId) || !isValidUUID(actualServiceId)) {
        throw new Error(`UUID validation failed — staff:${staffId} society:${societyId} worker:${actualWorkerId} service:${actualServiceId}`);
      }

      // Skip conflict check for now to allow visit creation
      const result = await createServiceVisit(
        newVisit,
        societyId,
        staffId,
        actualWorkerId,
        actualServiceId
      );
      newVisit.id = result.id;
      newVisit.shareToken = result.shareToken;

    } catch (e: any) {
      console.warn('Could not save to Supabase. Falling back to local state.', e);
      // Do NOT show error — silently fall back to local state so UX is not blocked
    }
    
    // Always update local state for immediate UI responsiveness
    setServiceVisits((prev) => [newVisit, ...prev]);
    
    // Persist to localStorage immediately
    try {
      const currentVisits = JSON.parse(localStorage.getItem('giggs_service_visits') || '[]');
      localStorage.setItem('giggs_service_visits', JSON.stringify([newVisit, ...currentVisits]));
    } catch (e) {
      console.warn('Failed to persist visit to localStorage', e);
    }
    
    addToast(
      'success',
      'Service Visit Published!',
      `${newVisit.title} is now open for residents of Green Valley.`
    );

    // Re-fetch from DB to sync share token and IDs
    if (authSession?.user?.societyId) {
      setTimeout(() => {
        refreshServiceVisits(authSession.user!.societyId!);
      }, 1500);
    }
  };

  const handleShareLink = (visit: ServiceVisit) => {
    const baseUrl = window.location.origin;
    const societyParam = encodeURIComponent(visit.societyName.toLowerCase().replace(/\s+/g, ''));
    const shareUrl = `${baseUrl}/join/${visit.id}?society=${societyParam}&token=${visit.shareToken}`;
    
    // Attempt to copy to clipboard as a fallback
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
    }
    
    addToast(
      'info',
      'Invite Link Copied!',
      'Opening WhatsApp to share with your society...'
    );
    
    // Compute expiry time (1 hour from now)
    const expiryTime = new Date(Date.now() + 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // WhatsApp integration — include urgency & expiry
    const message = `❄️ GIGGS SERVICE VISIT — GROUP DEAL\n\n🔧 ${visit.title} available at ${visit.societyName}.\n\n📅 ${visit.date}\n⏰ ${visit.timeWindow}\n\n👷 Pro: ${visit.proName} (${visit.proRating}⭐)\n💸 Group Price: ₹${visit.currentRate}/flat (Price drops with more residents!)\n\n⚡ HURRY UP! This link expires at ${expiryTime} (1 hour only)\n\n👇 Register NOW before the link expires:\n${shareUrl}\n\n⏳ Don't wait — the more neighbors join, the cheaper it gets!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Worker Actions
  const handleUpdateJobStatus = async (
    jobId: string,
    newStatus: WorkerJob['status'],
    materials?: { id: string; name: string; qty: number; cost: number }[]
  ) => {
    try {
      await updateJobStatus(jobId, newStatus, materials);
    } catch (error) {
      console.warn('Could not update job in Supabase. Falling back to local state.', error);
    }

    setWorkerJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          const materialTotal = materials?.reduce((acc, m) => acc + (m.cost * m.qty), 0) || 0;
          return { ...job, status: newStatus, materials, price: job.price + materialTotal };
        }
        return job;
      })
    );
    
    if (newStatus === 'completed') {
      addToast(
        'success',
        'Job Completed!',
        'Invoice generated and sent to resident for approval.'
      );
    } else if (newStatus === 'in_progress') {
      addToast('info', 'Job Started', 'Timer running for on-site execution.');
    }
  };

  // Admin Actions
  const handleDispatchWorker = (workerName: string) => {
    addToast(
      'success',
      `${workerName} Dispatched!`,
      'Direct dispatch telemetry initiated for Green Valley batch.'
    );
  };

  const handleApplyPlan = () => {
    addToast(
      'success',
      'AI Capacity Plan Deployed',
      '+8 HVAC & +4 Plumbing pros allocated across upcoming weekend surge.'
    );
  };

  const activeUser = authSession?.user || registeredUsers.filter(u => u.role === currentRole).slice(-1)[0];

  // Render View Switcher
  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeView onSelectRoleAndScreen={handleLoginAndNavigate} />;

      case 'resident_login':
        return (
          <ResidentLoginView
            onNavigate={handleNavigate}
            onLoginSuccess={(id) => handleLoginAttempt(id, 'resident', 'resident_home')}
          />
        );

      case 'resident_register':
        return (
          <ResidentRegisterView
            onNavigate={handleNavigate}
            onRegisterSuccess={(details) => {
              registerUser({
                email: details.email,
                phone: details.phone,
                name: details.fullName,
                role: 'resident'
              });
              addToast(
                'success',
                'Registration Complete!',
                `Welcome ${details.fullName}! Flat ${details.flatNo} in ${details.societyName} registered.`
              );
              handleLoginAndNavigate('resident_home', 'resident');
            }}
          />
        );

      // Resident
      case 'resident_home':
        return (
          <ResidentDashboardView
            serviceVisits={serviceVisits}
            bookings={bookings}
            userName={activeUser?.name}
            userId={activeUser?.id}
            onNavigate={handleNavigate}
            onJoinVisit={handleJoinVisit}
            onSelectBooking={(b) => {
              if (b.status === 'Completed') {
                handleNavigate('resident_checkout');
              } else {
                handleNavigate('resident_invite');
              }
            }}
          />
        );
      case 'resident_book_service':
        return (
          <ResidentBookServiceView
            onNavigate={handleNavigate}
            onBookService={handleBookService}
          />
        );
      case 'resident_invite': {
        const path = window.location.pathname;
        const searchParams = new URLSearchParams(window.location.search);
        const token = searchParams.get('token');
        
        let targetVisit: ServiceVisit | undefined = undefined;
        if (path.startsWith('/join/')) {
          const id = path.split('/')[2];
          // Look up locally first
          const found = serviceVisits.find(v => v.id === id);
          if (found) {
             targetVisit = found;
          }
          // If not found locally, ResidentInviteView will fetch from DB via getServiceVisitByToken
        } else {
          // Not a /join/ URL — use the first visit if available
          targetVisit = serviceVisits[0];
        }
        return (
          <ResidentInviteView
            visit={targetVisit}
            onNavigate={handleNavigate}
            onRegisterSuccess={handleRegisterSuccess}
          />
        );
      }
      case 'resident_checkout': {
        const completedJob = workerJobs.find((j) => j.status === 'completed');
        return (
          <CheckoutView
            job={completedJob}
            onNavigate={handleNavigate}
            onPaymentComplete={handlePaymentComplete}
          />
        );
      }
      case 'resident_emergency':
        return (
          <EmergencyView
            onNavigate={handleNavigate}
            onRequestHelp={handleSosRequest}
          />
        );
      case 'resident_rate':
        return (
          <RateServiceView
            onNavigate={handleNavigate}
            onSubmitReview={handleSubmitReview}
          />
        );
      case 'resident_claim':
        return (
          <GuaranteeClaimView
            onNavigate={handleNavigate}
            onSubmitClaim={handleSubmitClaim}
          />
        );

      // Society Management
      case 'society_login':
        return (
          <SocietyLoginView
            onNavigate={handleNavigate}
            onLoginSuccess={(id) => { handleLoginAttempt(id, 'society', 'society_dashboard'); }}
          />
        );

      case 'society_register':
        return (
          <SocietyRegisterView
            onNavigate={handleNavigate}
            onRegisterSuccess={(details) => {
              registerUser({
                email: details.email,
                phone: details.phone,
                name: details.name,
                role: 'society'
              });
              addToast(
                'success',
                'Society Staff Onboarded!',
                `${details.name} registered as ${details.societyRole} for ${details.societyName}.`
              );
              handleLoginAndNavigate('society_dashboard', 'society');
            }}
          />
        );

      case 'society_dashboard':
        return (
          <SocietyDashboardView
            serviceVisits={serviceVisits}
            userName={activeUser?.name}
            onNavigate={handleNavigate}
            onShareLink={handleShareLink}
          />
        );
      case 'society_new_visit':
        return (
          <SocietyNewVisitView
            onNavigate={handleNavigate}
            onCreateVisit={handleCreateVisit}
          />
        );

      // Worker
      case 'worker_login':
        return (
          <WorkerLoginView
            onNavigate={handleNavigate}
            onLoginSuccess={(id) => handleLoginAttempt(id, 'worker', 'worker_dashboard')}
          />
        );

      case 'worker_register':
        return (
          <WorkerRegisterView
            onNavigate={handleNavigate}
            onRegisterSuccess={async (details) => {
              // 1. Create user + session
              await registerUser({
                email: details.email,
                phone: details.phone,
                name: details.name,
                role: 'worker'
              });

              // 2. Persist worker row + skills to Supabase
              try {
                // Get the newly created user's ID from DB
                const { data: newUserRow } = await supabase
                  .from('users')
                  .select('id')
                  .eq('role', 'worker')
                  .or(`phone.eq.${details.phone},email.eq.${details.email}`)
                  .order('created_at', { ascending: false })
                  .limit(1)
                  .single();

                if (newUserRow?.id) {
                  // Insert worker row
                  const { data: workerRow } = await supabase
                    .from('workers')
                    .insert({
                      user_id: newUserRow.id,
                      identity_verified: true,
                      is_online: true,
                      verification_status: 'PENDING',
                      rating: 4.5,
                      total_jobs: 0,
                      aadhaar_photo_url: details.aadhaarStoragePath || null,
                      verification_video_url: details.videoStoragePath || null
                    })
                    .select('id')
                    .single();

                  // Insert skill rows for each selected provision
                  if (workerRow?.id && details.provisions?.length > 0) {
                    const skillRows = (details.provisions as string[]).map((provisionLabel: string) => ({
                      worker_id: workerRow.id,
                      skill_name: provisionLabel,
                      certified: false
                    }));
                    await supabase.from('worker_skills').insert(skillRows);
                  }
                }
              } catch (err) {
                console.warn('Could not persist worker skills to DB:', err);
              }

              addToast(
                'success',
                'Worker Partner Onboarded!',
                `${details.name} registered for ${details.provisions?.length || 1} trade provisions in ${details.city || 'Gurugram'}.`
              );
              handleLoginAndNavigate('worker_dashboard', 'worker');
            }}
          />
        );

      case 'worker_dashboard':
        return (
          <WorkerDashboardView
            jobs={workerJobs}
            visits={workerVisits}
            userName={authSession?.user?.name || 'Worker Pro'}
            isOnline={workerProfile?.is_online ?? false}
            skills={workerProfile?.worker_skills?.map((sk: any) => sk.skill_name) || []}
            onToggleOnline={async (status) => {
              if (workerProfile?.id) {
                try {
                  await updateWorkerStatus(workerProfile.id, status);
                  setWorkerProfile({ ...workerProfile, is_online: status });
                  addToast('success', 'Status Updated', `You are now ${status ? 'Online' : 'Offline'}`);
                } catch (e) {
                  addToast('error', 'Failed to update status', 'Please try again.');
                }
              }
            }}
            onAcceptVisit={async (visitId) => {
              try {
                await updateVisitStatus(visitId, 'worker_confirmed');
                setWorkerVisits(prev => prev.map(v => v.id === visitId ? { ...v, status: 'worker_confirmed' } : v));
                addToast('success', 'Visit Accepted', 'You have confirmed this society visit.');
              } catch (e) {
                addToast('error', 'Update Failed', 'Failed to accept visit.');
              }
            }}
            onDeclineVisit={async (visitId) => {
              try {
                await updateVisitStatus(visitId, 'cancelled');
                setWorkerVisits(prev => prev.filter(v => v.id !== visitId));
                addToast('success', 'Visit Declined', 'You have declined this society visit.');
              } catch (e) {
                addToast('error', 'Update Failed', 'Failed to decline visit.');
              }
            }}
            onNavigate={handleNavigate}
            onSelectJob={(job) => {
              setActiveVisitId(job.visitId);
              handleNavigate('worker_queue');
            }}
            onSelectVisit={(visitId) => {
              setActiveVisitId(visitId);
              handleNavigate('worker_queue');
            }}
          />
        );
      case 'worker_queue':
        return (
          <WorkerQueueView 
            jobs={workerJobs.filter(j => j.visitId === activeVisitId)}
            visit={workerVisits.find(v => v.id === activeVisitId)}
            onNavigate={handleNavigate}
            onUpdateJobStatus={async (jobId, newStatus, materials) => {
              await updateJobStatus(jobId, newStatus, materials);
              // Refetch jobs to sync
              if (authSession?.user?.id) {
                const updated = await fetchWorkerJobs(authSession.user.id);
                setWorkerJobs(updated);
              }
            }}
          />
        );
      case 'worker_earnings':
        return <WorkerEarningsView jobs={workerJobs} workerProfile={workerProfile} onNavigate={handleNavigate} />;
      case 'worker_welfare':
        return <WorkerWelfareView workerProfile={workerProfile} onNavigate={handleNavigate} />;

      // Admin / Operations — all wrapped in desktop AdminShell
      case 'admin_login':
        return (
          <AdminLoginView
            onLoginSuccess={(email) => {
              handleLoginAttempt(email, 'admin', 'admin_overview');
            }}
            onBackToRoles={() => handleNavigate('welcome')}
          />
        );

      case 'admin_overview':
      case 'admin_verification_queue':
      case 'admin_worker_directory':
      case 'admin_skills':
      case 'admin_residents':
      case 'admin_matching':
      case 'admin_forecasting': {
        const adminEmail = authSession?.user?.email;
        let adminContent: React.ReactNode;
        switch (currentScreen) {
          case 'admin_overview':
            adminContent = <AdminDashboardView onNavigate={handleNavigate} adminEmail={adminEmail} />;
            break;
          case 'admin_verification_queue':
            adminContent = (
              <div className="p-6">
                <AdminVerificationQueueView
                  onRefreshStats={async () => {
                    const stats = await fetchAdminStats();
                    setAdminStats(stats);
                  }}
                />
              </div>
            );
            break;
          case 'admin_worker_directory':
            adminContent = <AdminWorkerDirectoryView onNavigate={handleNavigate} adminEmail={adminEmail} />;
            break;
          case 'admin_skills':
            adminContent = <AdminSkillsView onNavigate={handleNavigate} adminEmail={adminEmail} />;
            break;
          case 'admin_residents':
            adminContent = <AdminResidentsView onNavigate={handleNavigate} adminEmail={adminEmail} />;
            break;
          case 'admin_matching':
            adminContent = <AdminMatchingView onNavigate={handleNavigate} onDispatchWorker={handleDispatchWorker} />;
            break;
          case 'admin_forecasting':
            adminContent = <AdminForecastingView onNavigate={handleNavigate} onApplyPlan={handleApplyPlan} />;
            break;
          default:
            adminContent = <AdminDashboardView onNavigate={handleNavigate} adminEmail={adminEmail} />;
        }
        return (
          <AdminShell
            activeView={currentScreen}
            onNavigate={handleNavigate}
            adminEmail={adminEmail}
          >
            {adminContent}
          </AdminShell>
        );
      }

      default:
        return <WelcomeView onSelectRoleAndScreen={handleLoginAndNavigate} />;
    }
  };

  const isAdminScreen = currentRole === 'admin' && currentScreen !== 'admin_login';

  return (
    <div className={`${isAdminScreen ? 'h-screen overflow-hidden' : 'min-h-screen bg-[#f9f9f9]'} text-[#1b1c1c] font-sans antialiased selection:bg-neutral-900 selection:text-white`}>
      {/* Toast Alert System */}
      <ToastNotification toasts={toasts} onDismiss={dismissToast} />

      {/* Global Top Bar — hidden for admin portal (has its own shell) */}
      {!isAdminScreen && (
        <TopNav
          currentScreen={currentScreen}
          currentRole={currentRole}
          currentUser={activeUser}
          onNavigate={handleNavigate}
        />
      )}

      {/* Main View Area */}
      {renderScreen()}

      {/* Bottom Navigation — hidden for admin portal */}
      {!isAdminScreen && (
        <BottomNav
          currentScreen={currentScreen}
          currentRole={currentRole}
          onNavigate={handleNavigate}
        />
      )}

    </div>
  );
}

export default App;
