// ============================================
// MAIN RENDERING LOGIC
// ============================================

// Calculate patient stats
function calculatePatientStats(data) {
  const age = data.dob ? Math.floor((new Date() - new Date(data.dob)) / (365.25 * 24 * 60 * 60 * 1000)) : null;
  const bmi = (data.weight && data.height) ? (data.weight / Math.pow(data.height / 100, 2)).toFixed(1) : null;
  return { age, bmi };
}

// Render patient data
function renderPatient(data, documents, mentalHealthScores, lifestyleData) {
  const stats = calculatePatientStats(data);

  document.getElementById('app').innerHTML = `
    <div class="min-h-screen bg-gray-50">
      <!-- Top Header -->
      <div class="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600 rounded-xl shadow-lg">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <div>
                <h1 class="text-2xl font-bold text-gray-900">${data.full_name || 'Patient'}</h1>
                <p class="text-sm text-gray-600">Medical Dashboard</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              ${stats.age ? `<div class="px-4 py-2 bg-purple-50 rounded-lg"><span class="text-sm font-semibold text-purple-700">${stats.age} years</span></div>` : ''}
              ${stats.bmi ? `<div class="px-4 py-2 bg-blue-50 rounded-lg"><span class="text-sm font-semibold text-blue-700">BMI ${stats.bmi}</span></div>` : ''}
              ${data.blood_group ? `<div class="px-4 py-2 bg-red-50 rounded-lg"><span class="text-sm font-semibold text-red-700">${data.blood_group}</span></div>` : ''}
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="max-w-7xl mx-auto px-4 py-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- Left Sidebar -->
          <div class="lg:col-span-1 space-y-4">
            <!-- Personal Information -->
            <div class="glass-card rounded-2xl p-3 fade-in">
              <h2 class="text-base font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                <div class="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <span>Personal Info</span>
              </h2>
              <div class="grid grid-cols-2 gap-1.5">
                ${InfoCard(icons.user, 'DOB', data.dob)}
                ${InfoCard(icons.user, 'Gender', data.gender)}
                ${InfoCard(icons.droplet, 'Blood', data.blood_group, true)}
                ${InfoCard(icons.phone, 'Phone', data.phone)}
                ${InfoCard(icons.phone, 'Emergency', data.emergency_contact, true)}
                ${InfoCard(icons.activity, 'Height', data.height ? `${data.height} cm` : null)}
                ${InfoCard(icons.activity, 'Weight', data.weight ? `${data.weight} kg` : null)}
              </div>
            </div>

            <!-- Lifestyle Analytics Sidebar -->
            ${renderLifestyleAnalytics(lifestyleData)}
          </div>

          <!-- Main Content Area -->
          <div class="lg:col-span-2 space-y-6">

            <!-- Medical History -->
            <div class="glass-card rounded-2xl p-4 fade-in">
              <h2 class="text-base font-bold text-gray-800 mb-3 flex items-center gap-1.5">
                <div class="p-1.5 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                </div>
                <span>Medical History</span>
              </h2>
          <div class="grid md:grid-cols-2 gap-2">
            ${data.diseases ? `
              <div class="p-3 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-200">
                <div class="flex items-start gap-2">
                  <div class="p-1 bg-red-100 rounded-md">
                    ${icons.alert.replace('w-5 h-5', 'w-3.5 h-3.5 text-red-600')}
                  </div>
                  <div class="flex-1">
                    <p class="font-bold text-red-900 mb-1 text-sm">Known Diseases</p>
                    <p class="text-red-700 text-sm">${data.diseases}</p>
                  </div>
                </div>
              </div>
            ` : ''}
            
            ${data.allergies ? `
              <div class="p-3 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border border-orange-200">
                <div class="flex items-start gap-2">
                  <div class="p-1 bg-orange-100 rounded-md">
                    ${icons.alert.replace('w-5 h-5', 'w-3.5 h-3.5 text-orange-600')}
                  </div>
                  <div class="flex-1">
                    <p class="font-bold text-orange-900 mb-1 text-sm">Allergies</p>
                    <p class="text-orange-700 text-sm">${data.allergies}</p>
                  </div>
                </div>
              </div>
            ` : ''}
            
            ${data.medications ? `
              <div class="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                <div class="flex items-start gap-2">
                  <div class="p-1 bg-blue-100 rounded-md">
                    ${icons.pill.replace('w-5 h-5', 'w-3.5 h-3.5 text-blue-600')}
                  </div>
                  <div class="flex-1">
                    <p class="font-bold text-blue-900 mb-1 text-sm">Medications</p>
                    <p class="text-blue-700 text-sm">${data.medications}</p>
                  </div>
                </div>
              </div>
            ` : ''}
            
            ${data.surgeries ? `
              <div class="p-3 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                <div class="flex items-start gap-2">
                  <div class="p-1 bg-purple-100 rounded-md">
                    ${icons.file.replace('w-5 h-5', 'w-3.5 h-3.5 text-purple-600')}
                  </div>
                  <div class="flex-1">
                    <p class="font-bold text-purple-900 mb-1 text-sm">Surgeries</p>
                    <p class="text-purple-700 text-sm">${data.surgeries}</p>
                  </div>
                </div>
              </div>
            ` : ''}
            
            ${data.lifestyle ? `
              <div class="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div class="flex items-start gap-2">
                  <div class="p-1 bg-green-100 rounded-md">
                    ${icons.activity.replace('w-5 h-5', 'w-3.5 h-3.5 text-green-600')}
                  </div>
                  <div class="flex-1">
                    <p class="font-bold text-green-900 mb-1 text-sm">Lifestyle</p>
                    <p class="text-green-700 text-sm">${data.lifestyle}</p>
                  </div>
                </div>
              </div>
            ` : ''}
            
            ${data.notes ? `
              <div class="p-3 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200 md:col-span-2">
                <div class="flex items-start gap-2">
                  <div class="p-1 bg-gray-100 rounded-md">
                    ${icons.file.replace('w-5 h-5', 'w-3.5 h-3.5 text-gray-600')}
                  </div>
                  <div class="flex-1">
                    <p class="font-bold text-gray-900 mb-1 text-sm">Notes</p>
                    <p class="text-gray-700 text-sm">${data.notes}</p>
                  </div>
                </div>
              </div>
            ` : ''}
              </div>
            </div>

            <!-- AI Health Predictions Section -->
            <div id="predictions-section">
              ${renderPredictionsLoading()}
            </div>

            <!-- Mental Health Analytics -->
        ${renderMentalHealthAnalytics(mentalHealthScores)}

            <!-- Medical Documents -->
            ${renderDocuments(documents)}
          </div>
        </div>

        <!-- Footer -->
        <div class="mt-6 text-center">
          <div class="inline-flex items-center gap-2 text-gray-500 text-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            <p>Confidential Medical Information</p>
          </div>
        </div>
      </div>
    </div>

      </div>
    </div>
  `;
}

// Main function
async function loadPatientData() {
  showLoading();

  const patientId = getPatientId();

  if (!patientId) {
    showError('No patient ID provided in URL');
    return;
  }

  console.log('Loading data for patient ID:', patientId);

  try {
    // Fetch all data in parallel
    const [patientData, documents, mentalHealthScores, lifestyleData] = await Promise.all([
      fetchPatientData(patientId),
      fetchPatientDocuments(patientId),
      fetchMentalHealthScores(patientId),
      fetchLifestyleData(patientId)
    ]);

    console.log('All data loaded:', { patientData, documents, mentalHealthScores, lifestyleData });

    renderPatient(patientData, documents, mentalHealthScores, lifestyleData);

    // Generate AI predictions asynchronously
    generateAndDisplayPredictions(patientData, lifestyleData, mentalHealthScores, documents);
  } catch (err) {
    console.error('Error:', err);
    showError('Failed to load patient data. Please check your configuration.');
  }
}

// Generate and display AI predictions (with caching)
async function generateAndDisplayPredictions(patientData, lifestyleData, mentalHealthScores, documents) {
  try {
    console.log('Loading health predictions...');
    const patientId = getPatientId();

    // First, try to fetch cached predictions from database
    const [cachedPredictions, cachedTests, cachedRisks] = await Promise.all([
      fetchCachedPredictions(patientId),
      fetchCachedTestRecommendations(patientId),
      fetchCachedRiskAssessments(patientId)
    ]);

    console.log('Cached data fetched:', {
      predictions: cachedPredictions?.length || 0,
      tests: cachedTests?.length || 0,
      risks: cachedRisks?.length || 0,
      queriedUserId: patientId
    });

    if (cachedPredictions && cachedPredictions.length > 0) {
      console.log('Sample cached prediction:', cachedPredictions[0]);
    }

    if (cachedTests && cachedTests.length > 0) {
      console.log('Sample cached test:', cachedTests[0]);
    }

    if (cachedRisks && cachedRisks.length > 0) {
      console.log('Sample cached risk:', cachedRisks[0]);
    }

    // Check if we have fresh cached predictions (< 24 hours old)
    if (cachedPredictions && arePredictionsFresh(cachedPredictions)) {
      console.log('Using cached predictions from database');

      const predictionsSection = document.getElementById('predictions-section');
      if (predictionsSection) {
        const timestamp = cachedPredictions[0]?.created_at;
        const summary = 'Health analysis based on your latest data';

        predictionsSection.innerHTML = renderHealthPredictions(
          cachedPredictions,
          cachedTests || [],
          cachedRisks || [],
          summary,
          timestamp,
          true // isCached flag
        );
      }
      return;
    }

    // If no cached predictions or they're stale, generate new ones
    console.log('Generating new AI-powered health predictions...');

    // Call AI prediction engine
    const aiPredictions = await generateAIPredictions(
      patientData,
      lifestyleData,
      mentalHealthScores,
      documents
    );

    // Update the predictions section with results
    const predictionsSection = document.getElementById('predictions-section');
    if (predictionsSection) {
      predictionsSection.innerHTML = renderHealthPredictions(
        aiPredictions.predictions,
        aiPredictions.testRecommendations,
        aiPredictions.riskAssessments,
        aiPredictions.summary,
        new Date().toISOString(),
        false // isCached flag
      );
    }
  } catch (error) {
    console.error('Error generating predictions:', error);
    const predictionsSection = document.getElementById('predictions-section');
    if (predictionsSection) {
      predictionsSection.innerHTML = renderPredictionsError(error.message);
    }
  }
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', loadPatientData);
