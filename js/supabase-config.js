
// Supabase Configuration
const SUPABASE_URL = 'https://fqoyrcmhphwnyelibhgx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxb3lyY21ocGh3bnllbGliaGd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4Njg3MjgsImV4cCI6MjA4MTQ0NDcyOH0.f944gb8EsSLpDXJwPo8oImXKbe4_Jmzy_6BIITRGwUQ';

// Initialize Supabase Client
// Ensure @supabase/supabase-js is loaded in the HTML before this script
const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
window.supabaseClient = _supabase;
