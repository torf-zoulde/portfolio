// ===================================
// CONFIGURATION AUTOMATIQUE DE L'API
// ===================================

function getAPIUrl() {
    const hostname = window.location.hostname;
    
    // Développement local
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3000/api';
    }
    
    // Production sur Railway
    return 'https://portfolio-production-a296.up.railway.app/api';
}

// Export de la configuration
const API_URL = getAPIUrl();

// Log pour debug
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🔧 Mode: DÉVELOPPEMENT');
} else {
    console.log('🚀 Mode: PRODUCTION');
}
console.log('📡 API URL:', API_URL);