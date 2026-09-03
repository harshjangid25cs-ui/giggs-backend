import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hahjfrckrtycppiavgid.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhaGpmcmNrcnR5Y3BwaWF2Z2lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMTU4OTYsImV4cCI6MjEwMzg5MTg5Nn0.DQs44JfxRvhsOvvgUqel9fkFKTqrZ5Y23HYc8LZWMwo';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
