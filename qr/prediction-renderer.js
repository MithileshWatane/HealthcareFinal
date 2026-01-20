// ============================================
// HEALTH PREDICTIONS RENDERING
// Display AI-generated predictions and recommendations
// ============================================

// Render health predictions section
function renderHealthPredictions(predictions, testRecommendations, riskAssessments, summary, timestamp, isCached = false) {
    if (!predictions || predictions.length === 0) {
        return `
            <div class="glass-card rounded-2xl p-4 fade-in">
                <h2 class="text-base font-bold text-gray-800 mb-3 flex items-center gap-1.5">
                    <div class="p-1.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                        ${icons.shield.replace('w-5 h-5', 'w-4 h-4 text-white')}
                    </div>
                    <span>Health Predictions</span>
                </h2>
                <div class="text-center py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"></div>
                    <p class="text-sm text-gray-600">Analyzing your health data...</p>
                </div>
            </div>
        `;
    }

    return `
        <div class="glass-card rounded-2xl p-4 fade-in">
            <h2 class="text-base font-bold text-gray-800 mb-3 flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                    <div class="p-1.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                        ${icons.shield.replace('w-5 h-5', 'w-4 h-4 text-white')}
                    </div>
                    <span>AI Health Predictions</span>
                </div>
                ${timestamp ? `
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-500">
                            ${isCached ? '📦 Cached' : '✨ Fresh'} · ${formatPredictionAge(timestamp)}
                        </span>
                        <button onclick="refreshPredictions()" class="text-xs px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors">
                            🔄 Refresh
                        </button>
                    </div>
                ` : ''}
            </h2>

            ${summary ? `
                <div class="mb-4 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <p class="text-sm text-gray-700 leading-relaxed">${summary}</p>
                </div>
            ` : ''}

            <!-- Health Risk Predictions -->
            ${predictions.length > 0 ? `
                <div class="mb-4">
                    <h3 class="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                        ${icons.alert.replace('w-5 h-5', 'w-4 h-4 text-orange-600')}
                        <span>Identified Health Risks</span>
                    </h3>
                    <div class="grid gap-2">
                        ${predictions.map(pred => PredictionCard(pred)).join('')}
                    </div>
                </div>
            ` : ''}

            <!-- Risk Assessment Dashboard -->
            ${riskAssessments && riskAssessments.length > 0 ? `
                <div class="mb-4">
                    <h3 class="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                        ${icons.chart.replace('w-5 h-5', 'w-4 h-4 text-blue-600')}
                        <span>Risk Assessment Dashboard</span>
                    </h3>
                    <div class="grid grid-cols-2 gap-2">
                        ${riskAssessments.map(assessment =>
        RiskGauge(
            assessment.overall_risk_score,
            assessment.assessment_type.replace(/_/g, ' ')
        )
    ).join('')}
                    </div>
                </div>
            ` : ''}

            <!-- Recommended Medical Tests -->
            ${testRecommendations && testRecommendations.length > 0 ? `
                <div>
                    <h3 class="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                        ${icons.beaker.replace('w-5 h-5', 'w-4 h-4 text-green-600')}
                        <span>Recommended Medical Tests</span>
                    </h3>
                    <div class="grid gap-2">
                        ${testRecommendations.slice(0, 6).map(test => TestRecommendationCard(test)).join('')}
                    </div>
                    ${testRecommendations.length > 6 ? `
                        <p class="text-xs text-gray-500 mt-2 text-center">
                            +${testRecommendations.length - 6} more recommendations
                        </p>
                    ` : ''}
                </div>
            ` : ''}

            <!-- Disclaimer -->
            <div class="mt-4 pt-3 border-t border-gray-200">
                <p class="text-xs text-gray-500 text-center">
                    ⚠️ These predictions are for informational purposes only and should not replace professional medical advice.
                </p>
            </div>
        </div>
    `;
}

// Render loading state for predictions
function renderPredictionsLoading() {
    return `
        <div class="glass-card rounded-2xl p-4 fade-in">
            <h2 class="text-base font-bold text-gray-800 mb-3 flex items-center gap-1.5">
                <div class="p-1.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                    ${icons.shield.replace('w-5 h-5', 'w-4 h-4 text-white')}
                </div>
                <span>Health Predictions</span>
            </h2>
            <div class="text-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p class="text-sm font-semibold text-gray-700 mb-1">Analyzing Your Health Data</p>
                <p class="text-xs text-gray-500">AI is reviewing your medical history, lifestyle, and documents...</p>
            </div>
        </div>
    `;
}

// Render error state
function renderPredictionsError(error) {
    return `
        <div class="glass-card rounded-2xl p-4 fade-in">
            <h2 class="text-base font-bold text-gray-800 mb-3 flex items-center gap-1.5">
                <div class="p-1.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                    ${icons.shield.replace('w-5 h-5', 'w-4 h-4 text-white')}
                </div>
                <span>Health Predictions</span>
            </h2>
            <div class="text-center py-8">
                <svg class="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                <p class="text-sm font-semibold text-gray-700 mb-1">Unable to Generate Predictions</p>
                <p class="text-xs text-gray-500">${error || 'Please try again later'}</p>
            </div>
        </div>
    `;
}
