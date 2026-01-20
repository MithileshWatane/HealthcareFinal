// ============================================
// DOCUMENTS RENDERING
// ============================================

// Render documents section
function renderDocuments(documents) {
  if (!documents || documents.length === 0) {
    return `
      <div class="glass-card rounded-3xl p-6 mb-6 fade-in">
        <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <div class="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <span>Medical Documents</span>
        </h2>
        <div class="text-center py-8 text-gray-500">
          <svg class="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <p class="text-sm">No documents yet</p>
        </div>
      </div>
    `;
  }

  const documentCards = documents.map(doc => {
    const isImage = doc.file_type.startsWith('image/');
    return `
      <div class="bg-white border border-gray-200 hover:border-blue-300 rounded-xl p-3 hover:shadow-lg transition-all duration-300 fade-in">
        <div class="flex items-start justify-between mb-2">
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <div class="p-1.5 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex-shrink-0">
              ${getFileIcon(doc.file_type).replace('w-5 h-5', 'w-4 h-4 text-blue-600')}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-bold text-gray-800 truncate text-sm">${doc.file_name}</p>
              <p class="text-xs text-gray-500 font-medium">${formatFileSize(doc.file_size)}</p>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 mb-3">
          <span class="text-xs px-2 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-full font-semibold uppercase tracking-wide">
            ${getCategoryLabel(doc.category)}
          </span>
          <span class="text-xs text-gray-500 font-medium">
            ${new Date(doc.uploaded_at).toLocaleDateString()}
          </span>
        </div>

        ${isImage ? `
          <img src="${doc.file_url}" alt="${doc.file_name}" 
               class="w-full h-32 object-cover rounded-lg mb-3 cursor-pointer hover:opacity-90 transition-opacity"
               onclick="window.open('${doc.file_url}', '_blank')">
        ` : ''}

        <div class="flex gap-2">
          <button onclick="window.open('${doc.file_url}', '_blank')"
                  class="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all text-xs font-bold flex items-center justify-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            View
          </button>
          <button onclick="downloadFile('${doc.file_url}', '${doc.file_name}')"
                  class="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all text-xs font-bold flex items-center justify-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Download
          </button>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="glass-card rounded-2xl p-4 fade-in">
      <h2 class="text-base font-bold text-gray-800 mb-3 flex items-center gap-1.5">
        <div class="p-1.5 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <span>Documents</span>
        <span class="ml-auto text-xs font-normal text-gray-500">${documents.length}</span>
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        ${documentCards}
      </div>
    </div>
  `;
}
