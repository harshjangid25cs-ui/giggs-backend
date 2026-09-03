-- Users table to extend auth.users
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE,
  email TEXT UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('resident', 'society_staff', 'worker', 'admin')),
  avatar_url TEXT,
  society_id UUID, -- if resident or staff
  flat_no TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Societies
CREATE TABLE public.societies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT,
  total_flats INTEGER,
  active_residents_count INTEGER DEFAULT 0,
  contact_person TEXT,
  contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Foreign key for users
ALTER TABLE public.users ADD CONSTRAINT fk_society FOREIGN KEY (society_id) REFERENCES public.societies(id);

-- Workers
CREATE TABLE public.workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) UNIQUE,
  cooperative_name TEXT,
  identity_verified BOOLEAN DEFAULT FALSE,
  police_verification_verified BOOLEAN DEFAULT FALSE,
  ppe_compliance BOOLEAN DEFAULT FALSE,
  rating NUMERIC(3, 2) DEFAULT 0,
  total_jobs INTEGER DEFAULT 0,
  is_online BOOLEAN DEFAULT FALSE,
  available_balance NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Worker Skills
CREATE TABLE public.worker_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  certified BOOLEAN DEFAULT FALSE
);

-- Services
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  base_price NUMERIC(10, 2),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Visits
CREATE TABLE public.service_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID REFERENCES public.societies(id),
  created_by_staff_id UUID REFERENCES public.users(id),
  service_id UUID REFERENCES public.services(id),
  worker_id UUID REFERENCES public.workers(id),
  date DATE NOT NULL,
  time_window TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  status TEXT DEFAULT 'registrations_open',
  share_token TEXT UNIQUE NOT NULL,
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pricing Tiers for Service Visits
CREATE TABLE public.pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_visit_id UUID REFERENCES public.service_visits(id) ON DELETE CASCADE,
  min_participants INTEGER NOT NULL,
  max_participants INTEGER NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  label TEXT
);

-- Service Registrations (Bookings / Jobs)
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_visit_id UUID REFERENCES public.service_visits(id),
  resident_id UUID REFERENCES public.users(id),
  flat_no TEXT,
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed, cancelled
  requested_time TEXT,
  labour_amount NUMERIC(10, 2) DEFAULT 0,
  discount_amount NUMERIC(10, 2) DEFAULT 0,
  total_amount NUMERIC(10, 2) DEFAULT 0,
  resident_photo_evidence TEXT,
  guarantee_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Materials for Jobs
CREATE TABLE public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  qty INTEGER NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  customer_approved BOOLEAN DEFAULT FALSE
);

-- Ratings
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id),
  customer_id UUID REFERENCES public.users(id),
  worker_id UUID REFERENCES public.workers(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guarantee Claims
CREATE TABLE public.guarantee_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id),
  issue_type TEXT,
  description TEXT,
  status TEXT DEFAULT 'UNDER_REVIEW', -- UNDER_REVIEW, APPROVED, REVISIT_SCHEDULED, RESOLVED
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS setup (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Policies for users
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);

-- Staff can view residents in their society
CREATE POLICY "Staff can view residents in their society" ON public.users FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users AS staff WHERE staff.id = auth.uid() AND staff.role = 'society_staff' AND staff.society_id = public.users.society_id)
);

-- Admins have full access
CREATE POLICY "Admins have full access on users" ON public.users FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users AS admin WHERE admin.id = auth.uid() AND admin.role = 'admin')
);

-- For prototype/hackathon purposes, we might want to allow some public reads or relaxed rules temporarily, but RLS is enabled.
