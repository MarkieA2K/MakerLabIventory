import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xdvvpxdkztuqouvcjvus.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkdnZweGRrenR1cW91dmNqdnVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDkwODMzNTgsImV4cCI6MjAyNDY1OTM1OH0.hNDYJREX_0-NTawZQ0URjXxnNh8fS2aZA3KyU_IZhQE'
);
export default supabase;
