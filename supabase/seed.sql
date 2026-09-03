-- Seed mock data for Giggs

-- 1. Societies
INSERT INTO public.societies (id, name, address, city, state, pincode, total_flats, active_residents_count, contact_person, contact_phone)
VALUES
('b410425c-897e-4b44-a902-861c28c8efd1', 'Green Valley Society', 'Plot 4, Sector 12, Golf Course Ext Rd', 'Gurugram', 'Haryana', '122001', 320, 248, 'Amit Sharma (Facility Head)', '+91 99881 12345'),
('2d5dc825-9f5b-410a-ad20-c8313364f33b', 'Mansarovar Heights', 'Sector 55', 'Gurugram', 'Haryana', '122011', 200, 150, 'Vikram Gupta', '+91 98765 43210');

-- Since users require auth.users rows, we can't seed them purely in SQL unless we disable foreign key constraints or mock auth.users.
-- For a local sandbox, Supabase allows inserting into auth.users. 
-- We will just insert directly into public.users for now and assume the application will create auth.users, OR we can provide a seed that bypasses the FK if we drop it, but let's just insert into auth.users first.

INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token) (
select
  '00000000-0000-0000-0000-000000000000',
  uuid_generate_v4(),
  'authenticated',
  'authenticated',
  'estate.manager@greenvalley.com',
  crypt('password123', gen_salt('bf')),
  current_timestamp,
  current_timestamp,
  current_timestamp,
  '{"provider":"email","providers":["email"]}',
  '{}',
  current_timestamp,
  current_timestamp,
  '',
  '',
  '',
  ''
);

-- Note: In a real project, we use Supabase auth api to create users. 
-- Since we are prototyping, the frontend can handle sign-ups.

-- 2. Services
INSERT INTO public.services (id, category, title, base_price, description)
VALUES 
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'ac', 'AC Servicing & Maintenance', 549, 'Society-wide air conditioner servicing batch.'),
('8083c660-f655-46f4-a039-4ab4be22b5db', 'plumbing', 'Plumbing & Leak Inspection', 299, 'Comprehensive inspection of shutoff valves.');

