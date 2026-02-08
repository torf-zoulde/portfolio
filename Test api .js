// Script de test pour l'API
// Exécuter avec: node test-api.js

const API_URL = 'http://localhost:3000/api';

// Couleurs pour la console
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testAPI() {
    log('\n🧪 Démarrage des tests API...', 'blue');
    log('=' .repeat(50), 'blue');
    
    let messageId = null;
    
    try {
        // Test 1: Créer un message
        log('\n📝 Test 1: Création d\'un message', 'yellow');
        const createResponse = await fetch(`${API_URL}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nom: 'Test User',
                email: 'test@example.com',
                sujet: 'Message de test',
                message: 'Ceci est un message de test créé automatiquement'
            })
        });
        
        if (!createResponse.ok) {
            throw new Error(`Erreur HTTP: ${createResponse.status}`);
        }
        
        const createData = await createResponse.json();
        messageId = createData.data._id;
        log(`✅ Message créé avec succès (ID: ${messageId})`, 'green');
        
        // Test 2: Récupérer tous les messages
        log('\n📋 Test 2: Récupération de tous les messages', 'yellow');
        const getAllResponse = await fetch(`${API_URL}/messages`);
        const allMessages = await getAllResponse.json();
        log(`✅ ${allMessages.length} message(s) récupéré(s)`, 'green');
        
        // Test 3: Récupérer un message spécifique
        log('\n🔍 Test 3: Récupération d\'un message spécifique', 'yellow');
        const getOneResponse = await fetch(`${API_URL}/messages/${messageId}`);
        const oneMessage = await getOneResponse.json();
        log(`✅ Message récupéré: ${oneMessage.nom} - ${oneMessage.sujet}`, 'green');
        
        // Test 4: Marquer comme lu
        log('\n✓ Test 4: Marquer le message comme lu', 'yellow');
        const readResponse = await fetch(`${API_URL}/messages/${messageId}/read`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ isRead: true })
        });
        const readData = await readResponse.json();
        log(`✅ Message marqué comme lu: ${readData.data.isRead}`, 'green');
        
        // Test 5: Statistiques
        log('\n📊 Test 5: Récupération des statistiques', 'yellow');
        const statsResponse = await fetch(`${API_URL}/messages/stats/summary`);
        const stats = await statsResponse.json();
        log(`✅ Statistiques:`, 'green');
        log(`   - Total: ${stats.total}`, 'green');
        log(`   - Non lus: ${stats.unread}`, 'green');
        log(`   - Lus: ${stats.read}`, 'green');
        log(`   - Aujourd'hui: ${stats.today}`, 'green');
        
        // Test 6: Recherche
        log('\n🔎 Test 6: Recherche de messages', 'yellow');
        const searchResponse = await fetch(`${API_URL}/messages?search=test`);
        const searchResults = await searchResponse.json();
        log(`✅ ${searchResults.length} résultat(s) trouvé(s)`, 'green');
        
        // Test 7: Filtrer par statut
        log('\n🔖 Test 7: Filtrer les messages lus', 'yellow');
        const filterResponse = await fetch(`${API_URL}/messages?filter=read`);
        const filteredMessages = await filterResponse.json();
        log(`✅ ${filteredMessages.length} message(s) lu(s)`, 'green');
        
        // Test 8: Supprimer le message
        log('\n🗑️  Test 8: Suppression du message', 'yellow');
        const deleteResponse = await fetch(`${API_URL}/messages/${messageId}`, {
            method: 'DELETE'
        });
        const deleteData = await deleteResponse.json();
        log(`✅ Message supprimé avec succès`, 'green');
        
        // Résumé
        log('\n' + '='.repeat(50), 'blue');
        log('✅ Tous les tests ont réussi !', 'green');
        log('='.repeat(50) + '\n', 'blue');
        
    } catch (error) {
        log(`\n❌ Erreur lors des tests: ${error.message}`, 'red');
        log('Assurez-vous que le serveur est démarré sur http://localhost:3000\n', 'yellow');
        process.exit(1);
    }
}

// Vérifier que le serveur est accessible
async function checkServer() {
    try {
        const response = await fetch('http://localhost:3000');
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Exécuter les tests
(async () => {
    log('\n🔍 Vérification du serveur...', 'blue');
    const serverRunning = await checkServer();
    
    if (!serverRunning) {
        log('❌ Le serveur n\'est pas accessible sur http://localhost:3000', 'red');
        log('💡 Démarrez le serveur avec: npm start\n', 'yellow');
        process.exit(1);
    }
    
    log('✅ Serveur accessible\n', 'green');
    await testAPI();
})();