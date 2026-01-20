// ============================================
// LIFESTYLE DATA RENDERING
// ============================================

// Render lifestyle analytics section
function renderLifestyleAnalytics(lifestyleData) {
  if (!lifestyleData || !lifestyleData.hasData) {
    return `
      <div class="glass-card rounded-2xl p-5 fade-in">
        <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <div class="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </div>
          <span>Lifestyle</span>
        </h2>
        <div class="text-center py-8 text-gray-500">
          <svg class="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          <p class="text-sm">No data yet</p>
        </div>
      </div>
    `;
  }

  const { stats, goals } = lifestyleData;

  const metrics = [
    {
      icon: '🌙',
      label: 'Sleep',
      value: `${stats.avgSleep}h`,
      target: '8h',
      progress: stats.sleepProgress,
      color: 'purple'
    },
    {
      icon: '👟',
      label: 'Steps',
      value: stats.avgSteps.toLocaleString(),
      target: '10k',
      progress: stats.stepsProgress,
      color: 'blue'
    },
    {
      icon: '💧',
      label: 'Water',
      value: `${stats.avgHydration} cups`,
      target: '10 cups',
      progress: stats.hydrationProgress,
      color: 'cyan'
    },
    {
      icon: '🍽️',
      label: 'Calories',
      value: stats.avgCalories.toLocaleString(),
      target: '2,000',
      progress: stats.caloriesProgress,
      color: 'orange'
    }
  ];

  const colorClasses = {
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', bar: 'bg-purple-500' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', bar: 'bg-blue-500' },
    cyan: { bg: 'bg-cyan-100', text: 'text-cyan-600', bar: 'bg-cyan-500' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600', bar: 'bg-orange-500' }
  };

  return `
    <div class="glass-card rounded-2xl p-5 fade-in">
      <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <div class="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </div>
        <span>Lifestyle</span>
      </h2>

      <!-- Metrics -->
      <div class="space-y-3 mb-4">
        ${metrics.map(metric => {
    const colors = colorClasses[metric.color];
    return `
            <div class="bg-white border border-gray-200 rounded-xl p-3">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span class="text-xl">${metric.icon}</span>
                  <span class="text-sm font-semibold text-gray-700">${metric.label}</span>
                </div>
                <span class="text-base font-bold text-gray-900">${metric.value}</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="flex-1 bg-gray-200 rounded-full h-2">
                  <div class="${colors.bar} h-2 rounded-full transition-all" style="width: ${metric.progress}%"></div>
                </div>
                <span class="text-xs ${colors.text} font-semibold">${metric.progress}%</span>
              </div>
            </div>
          `;
  }).join('')}
      </div>

      <!-- Goals Section -->
      ${goals && goals.length > 0 ? `
        <div class="p-3 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-200 mb-4">
          <h3 class="font-semibold text-gray-800 mb-2 text-sm flex items-center gap-1">
            <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Active Goals
          </h3>
          <div class="space-y-2">
            ${goals.slice(0, 3).map(goal => {
    const progress = Math.min(100, Math.round(((goal.current_value || 0) / goal.target_value) * 100));
    return `
                <div class="bg-white rounded-lg p-2">
                  <div class="flex justify-between items-start mb-1">
                    <p class="font-medium text-gray-800 text-sm">${goal.title}</p>
                    <span class="text-xs font-semibold text-green-600">${progress}%</span>
                  </div>
                  <p class="text-xs text-gray-500 mb-1">
                    ${goal.current_value || 0} / ${goal.target_value} ${goal.unit}
                  </p>
                  <div class="w-full bg-gray-200 rounded-full h-1.5">
                    <div class="bg-gradient-to-r from-green-500 to-blue-500 h-1.5 rounded-full transition-all" style="width: ${progress}%"></div>
                  </div>
                </div>
              `;
  }).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Health Summary -->
      <div class="p-3 bg-blue-50 rounded-xl border border-blue-200">
        <h3 class="font-semibold text-gray-800 mb-2 text-sm flex items-center gap-1">
          <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Weekly Summary
        </h3>
        <div class="text-xs text-gray-700 space-y-1">
          ${stats.avgSleep >= 7 ?
      '<p>✅ Sleep duration is healthy</p>' :
      '<p>⚠️ Consider getting more sleep</p>'
    }
          ${stats.avgSteps >= 7000 ?
      '<p>✅ Good activity level</p>' :
      '<p>⚠️ Try to increase daily activity</p>'
    }
          ${stats.avgHydration >= 8 ?
      '<p>✅ Hydration levels are good</p>' :
      '<p>⚠️ Remember to drink more water</p>'
    }
        </div>
      </div>
    </div>
  `;
}
