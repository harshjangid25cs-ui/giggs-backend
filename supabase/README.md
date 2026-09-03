# Giggs Supabase Setup

This project uses Supabase as the central backend, handling Database, Authentication, and Storage.

## How to use locally

1. If you haven't already, install the Supabase CLI globally or via npx:
   ```bash
   npm i -g supabase
   ```
2. Start the local Supabase environment (Docker required):
   ```bash
   supabase start
   ```
3. Run migrations and seed data:
   ```bash
   supabase db reset
   ```
4. Copy `.env.example` to `.env` and fill in the local Supabase URL and Anon Key that was printed out in step 2.

## How to use on Supabase Cloud

1. Create a new project on [Supabase](https://supabase.com/).
2. Copy your API keys (URL and anon key) into your `.env` file.
3. Open the **SQL Editor** in your Supabase dashboard.
4. Paste and execute the contents of `supabase/migrations/20260831185855_initial_schema.sql`.
5. Paste and execute the contents of `supabase/seed.sql` to get demo users and services.
6. Make sure to go to **Authentication > Users** in Supabase and create the 4 test users, or let the seed SQL script insert them if it's permitted (or just rely on the fallback mock authentication).

### Demo Accounts
The login uses these fallback mock accounts:
- **Resident**: arun.verma@greenvalley.res
- **Society Staff**: estate.manager@greenvalley.com
- **Worker**: ramesh.k@hvac-cooperative.org
- **Admin**: ops@giggs.community
