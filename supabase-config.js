// ==========================================
// AVANIKA.CO — SUPABASE CONFIGURATION
// supabase-config.js
// ==========================================

'use strict';

(function() {
  // Default API configuration keys (Modify here, or paste in Developer Dashboard UI)
  const DEFAULT_SUPABASE_URL = "https://wazynxirytsmknrcnmxr.supabase.co";
  const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhenlueGlyeXRzbWtucmNubXhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNTk1NTIsImV4cCI6MjA5NjgzNTU1Mn0.rNRbesXs_wfCLpYJzMoz7DNiOb1w3mylHcXINdvKMls";

  // Check localStorage for developer overrides first
  const supabaseUrl = localStorage.getItem('avanika_supabase_url') || DEFAULT_SUPABASE_URL;
  const supabaseAnonKey = localStorage.getItem('avanika_supabase_key') || DEFAULT_SUPABASE_ANON_KEY;

  // Determine if Supabase is properly configured
  const isConfigured = 
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== "YOUR_SUPABASE_URL" && 
    supabaseAnonKey !== "YOUR_SUPABASE_ANON_KEY" && 
    supabaseUrl.trim() !== "" && 
    supabaseAnonKey.trim() !== "";

  let supabaseClient = null;

  if (isConfigured && typeof supabase !== 'undefined') {
    try {
      supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);
      console.log('%c⚡ Supabase Client initialized successfully.', 'color: #2a9d8f; font-weight: bold;');
    } catch (e) {
      console.error('❌ Error initializing Supabase client:', e);
    }
  } else {
    console.log('%c🔌 Supabase is running in OFFLINE simulation fallback mode.', 'color: #DFB76C; font-weight: bold;');
  }

  // Make config values globally accessible
  window.supabaseUrl = supabaseUrl;
  window.supabaseAnonKey = supabaseAnonKey;
  window.isSupabaseConfigured = isConfigured;
  window.supabaseClient = supabaseClient;

  // Function to save configurations dynamically
  window.configureSupabase = function(url, key) {
    if (url && key) {
      localStorage.setItem('avanika_supabase_url', url.trim());
      localStorage.setItem('avanika_supabase_key', key.trim());
      return true;
    }
    return false;
  };

  // Function to disconnect Supabase
  window.disconnectSupabase = function() {
    localStorage.removeItem('avanika_supabase_url');
    localStorage.removeItem('avanika_supabase_key');
    window.location.reload();
  };
})();
