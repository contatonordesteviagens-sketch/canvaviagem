import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kcbnzfawhulazoqkrahc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjYm56ZmF3aHVsYXpvcWtyYWhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0NDA3NDgsImV4cCI6MjA4MDAxNjc0OH0.kQzrlF1_jWNOo-RvC2XwbU1TCP8McT-TpfGTyaT7DGg';

export const supabase = createClient(supabaseUrl, supabaseKey);