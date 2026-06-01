import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://quczvnmjdedtwkcpyqnd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1Y3p2bm1qZGVkdHdrY3B5cW5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0MDg4NjgsImV4cCI6MjA5NDk4NDg2OH0.2BCKbbbuQrdqn1Cy6rEXV6OPsx03qT8vxc8rUsgQP2s',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
