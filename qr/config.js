// ============================================
// CONFIGURATION
// ============================================
const SUPABASE_URL = 'https://edwuptavjdakjuqyrxaf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_cHYdCX_v8CTBV0VlqaaAwQ_GR-17x_Y';

// Gemini AI Configuration
const GEMINI_API_KEY = 'AIzaSyC9g5HVEnXKPUKs9aBqgD-ITf9lWMTFDik';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Get patient ID from URL
function getPatientId() {
    const urlParams = new URLSearchParams(window.location.search);
    const queryId = urlParams.get('id');

    const pathParts = window.location.pathname.split('/');
    const pathId = pathParts[pathParts.length - 1].replace('.html', '');

    return queryId || (pathId !== 'patient-profile' && pathId !== 'index' ? pathId : null);
}
