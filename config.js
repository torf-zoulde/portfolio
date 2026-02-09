// ===================================
// CONFIGURATION AUTOMATIQUE DE L'API
// ===================================

/**
 * Détecte automatiquement l'environnement et configure l'URL de l'API
 * 
 * - En développement (localhost) : http://localhost:3000/api
 * - En production : https://votre-domaine.com/api
 */

function getAPIUrl() {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port;

    // Développement local
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3000/api';
    }

    // Production
    // L'API sera sur le même domaine que le site
    if (port) {
        return `https://portfolio-production-7786.up.railway.app/api`;

    }
    
    return `https://portfolio-production-7786.up.railway.app/api`;


// Export de la configuration
const API_URL = getAPIUrl();

// Log pour debug (seulement en développement)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🔧 Mode: DÉVELOPPEMENT');
    console.log('📡 API URL:', API_URL);
} else {
    console.log('🚀 Mode: PRODUCTION');
    console.log('📡 API URL:', API_URL);
}

// Rendre disponible globalement
window.API_CONFIG = {
    API_URL: API_URL,
    IS_PRODUCTION: !(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'),
    HOSTNAME: window.location.hostname,
    PROTOCOL: window.location.protocol
};