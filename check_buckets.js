
const { createClient } = require('@supabase/supabase-js');
const config = require('./js/supabase-config.js'); // Trying to read config

// Hardcoding credentials because I can't easily require the browser-based config file without parsing
// Reading credentials from the viewed file js/supabase-config.js in previous turn
const SUPABASE_URL = 'https://fqoyrcmhphwnyelibhgx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxb3lyY21ocGh3bnllbGliaGd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4Njg3MjgsImV4cCI6MjA4MTQ0NDcyOH0.f944gb8EsSLpDXJwPo8oImXKbe4_Jmzy_6BIITRGwUQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function listBuckets() {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
        console.error('Error listing buckets:', error);
    } else {
        console.log('Buckets:', data);
    }
}

listBuckets();
