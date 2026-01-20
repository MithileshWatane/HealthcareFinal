// ============================================
// UI COMPONENTS
// ============================================

// Loading state
function showLoading() {
  document.getElementById('app').innerHTML = `
    <div class="flex items-center justify-center min-h-screen p-4">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Loading patient data...</p>
      </div>
    </div>
  `;
}

// Error state
function showError(message) {
  document.getElementById('app').innerHTML = `
    <div class="flex items-center justify-center min-h-screen p-4">
      <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <svg class="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Data Not Found</h2>
        <p class="text-gray-600">${message}</p>
      </div>
    </div>
  `;
}

// Info card component
function InfoCard(icon, label, value, urgent = false) {
  const bgClass = urgent
    ? 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'
    : 'bg-white border-gray-200';
  const iconColorClass = urgent ? 'text-red-600' : 'text-indigo-600';

  return `
    <div class="${bgClass} p-2 rounded-lg border">
      <div class="flex items-center gap-1.5 mb-0.5">
        ${icon.replace('w-5 h-5', `w-3 h-3 ${iconColorClass}`)}
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide truncate">${label}</p>
      </div>
      <p class="font-bold text-gray-900 text-sm truncate ml-4">${value || 'N/A'}</p>
    </div>
  `;
}

// Format file size
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

// Get file icon
function getFileIcon(fileType) {
  if (fileType.startsWith('image/')) {
    return '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>';
  }
  return '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>';
}

// Get category label
function getCategoryLabel(category) {
  const categories = {
    photo: 'Photo',
    report: 'Lab Report',
    prescription: 'Prescription',
    xray: 'X-Ray',
    mri: 'MRI/CT Scan',
    other: 'Other'
  };
  return categories[category] || category;
}

// Download file function
window.downloadFile = function (url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
};

// Icons
const icons = {
  user: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>',
  phone: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>',
  droplet: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>',
  activity: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',
  heart: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>',
  alert: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>',
  pill: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
  file: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
  chart: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>',
  beaker: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>',
  shield: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>'
};

// ============================================
// PREDICTION UI COMPONENTS
// ============================================

// Risk gauge component
function RiskGauge(score, label) {
  const riskLevel = score >= 75 ? 'critical' : score >= 50 ? 'high' : score >= 25 ? 'moderate' : 'low';
  const colors = {
    critical: { bg: 'bg-red-100', bar: 'bg-red-600', text: 'text-red-700', border: 'border-red-300' },
    high: { bg: 'bg-orange-100', bar: 'bg-orange-500', text: 'text-orange-700', border: 'border-orange-300' },
    moderate: { bg: 'bg-yellow-100', bar: 'bg-yellow-500', text: 'text-yellow-700', border: 'border-yellow-300' },
    low: { bg: 'bg-green-100', bar: 'bg-green-500', text: 'text-green-700', border: 'border-green-300' }
  };

  const color = colors[riskLevel];

  return `
    <div class="p-3 ${color.bg} rounded-xl border ${color.border}">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-semibold ${color.text} uppercase">${label}</span>
        <span class="text-lg font-bold ${color.text}">${Math.round(score)}</span>
      </div>
      <div class="w-full bg-white rounded-full h-2 overflow-hidden">
        <div class="${color.bar} h-2 rounded-full transition-all duration-500" style="width: ${score}%"></div>
      </div>
      <div class="mt-1 text-xs ${color.text} font-medium capitalize">${riskLevel} Risk</div>
    </div>
  `;
}

// Prediction card component
function PredictionCard(prediction) {
  const riskColors = {
    critical: { bg: 'from-red-50 to-pink-50', border: 'border-red-200', icon: 'text-red-600', badge: 'bg-red-600' },
    high: { bg: 'from-orange-50 to-yellow-50', border: 'border-orange-200', icon: 'text-orange-600', badge: 'bg-orange-500' },
    moderate: { bg: 'from-yellow-50 to-amber-50', border: 'border-yellow-200', icon: 'text-yellow-600', badge: 'bg-yellow-500' },
    low: { bg: 'from-green-50 to-emerald-50', border: 'border-green-200', icon: 'text-green-600', badge: 'bg-green-500' }
  };

  const color = riskColors[prediction.risk_level] || riskColors.moderate;

  return `
    <div class="p-3 bg-gradient-to-br ${color.bg} rounded-xl border ${color.border} hover:shadow-md transition-all">
      <div class="flex items-start gap-2 mb-2">
        <div class="p-1.5 bg-white rounded-lg shadow-sm">
          ${icons.alert.replace('w-5 h-5', `w-4 h-4 ${color.icon}`)}
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <h4 class="font-bold text-gray-900 text-sm">${prediction.condition_name}</h4>
            <span class="${color.badge} text-white text-xs px-2 py-0.5 rounded-full font-semibold uppercase">${prediction.risk_level}</span>
          </div>
          <p class="text-xs text-gray-700 leading-relaxed">${prediction.description}</p>
        </div>
      </div>
      
      ${prediction.recommendations && prediction.recommendations.length > 0 ? `
        <div class="mt-2 pt-2 border-t border-gray-200">
          <p class="text-xs font-semibold text-gray-700 mb-1">Recommendations:</p>
          <ul class="space-y-1">
            ${prediction.recommendations.slice(0, 3).map(rec => `
              <li class="text-xs text-gray-600 flex items-start gap-1">
                <span class="text-gray-400 mt-0.5">•</span>
                <span>${rec}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `;
}

// Test recommendation card component
function TestRecommendationCard(test) {
  const priorityColors = {
    urgent: { bg: 'from-red-50 to-pink-50', border: 'border-red-300', badge: 'bg-red-600', text: 'text-red-700' },
    high: { bg: 'from-orange-50 to-yellow-50', border: 'border-orange-300', badge: 'bg-orange-500', text: 'text-orange-700' },
    medium: { bg: 'from-blue-50 to-indigo-50', border: 'border-blue-300', badge: 'bg-blue-500', text: 'text-blue-700' },
    low: { bg: 'from-gray-50 to-slate-50', border: 'border-gray-300', badge: 'bg-gray-500', text: 'text-gray-700' }
  };

  const color = priorityColors[test.priority_level] || priorityColors.medium;

  return `
    <div class="p-3 bg-gradient-to-br ${color.bg} rounded-xl border ${color.border} hover:shadow-md transition-all">
      <div class="flex items-start gap-2">
        <div class="p-1.5 bg-white rounded-lg shadow-sm">
          ${icons.beaker.replace('w-5 h-5', `w-4 h-4 ${color.text}`)}
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <h4 class="font-bold text-gray-900 text-sm">${test.test_name}</h4>
            <span class="${color.badge} text-white text-xs px-2 py-0.5 rounded-full font-semibold uppercase">${test.priority_level}</span>
          </div>
          <p class="text-xs ${color.text} mb-2">${test.reason}</p>
          
          <div class="flex items-center gap-3 text-xs text-gray-600">
            ${test.recommended_frequency ? `
              <div class="flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>${test.recommended_frequency.replace(/_/g, ' ')}</span>
              </div>
            ` : ''}
            ${test.test_category ? `
              <div class="px-2 py-0.5 bg-white rounded-md text-xs font-medium capitalize">
                ${test.test_category.replace(/_/g, ' ')}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}

// Trend indicator component
function TrendIndicator(trend) {
  const trends = {
    improving: { icon: '↗', color: 'text-green-600', bg: 'bg-green-100', label: 'Improving' },
    stable: { icon: '→', color: 'text-blue-600', bg: 'bg-blue-100', label: 'Stable' },
    declining: { icon: '↘', color: 'text-red-600', bg: 'bg-red-100', label: 'Declining' },
    unknown: { icon: '?', color: 'text-gray-600', bg: 'bg-gray-100', label: 'Unknown' }
  };

  const t = trends[trend] || trends.unknown;

  return `
    <div class="inline-flex items-center gap-1 px-2 py-1 ${t.bg} rounded-md">
      <span class="${t.color} font-bold text-sm">${t.icon}</span>
      <span class="${t.color} text-xs font-semibold">${t.label}</span>
    </div>
  `;
}

