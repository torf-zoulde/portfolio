// Script pour initialiser la base de données avec des données de test
// Exécuter avec: node seed-database.js

const mongoose = require('mongoose');
require('dotenv').config();

// Modèle Message
const messageSchema = new mongoose.Schema({
    nom: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    sujet: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

// Données de test
const testMessages = [
    {
        nom: 'Jean Dupont',
        email: 'jean.dupont@email.com',
        sujet: 'Demande de devis',
        message: 'Bonjour, je souhaiterais obtenir un devis pour la création d\'un site web e-commerce. Pouvez-vous me contacter ?',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // Il y a 2 heures
    },
    {
        nom: 'Marie Martin',
        email: 'marie.martin@email.com',
        sujet: 'Question sur vos services',
        message: 'Bonjour, proposez-vous des services de maintenance pour les sites web ? Quels sont vos tarifs ?',
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Il y a 1 jour
    },
    {
        nom: 'Pierre Dubois',
        email: 'pierre.dubois@email.com',
        sujet: 'Collaboration potentielle',
        message: 'Bonjour, je représente une entreprise tech et nous cherchons des partenaires pour nos projets. Seriez-vous intéressé par une collaboration ?',
        isRead: false,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // Il y a 5 heures
    },
    {
        nom: 'Sophie Bernard',
        email: 'sophie.bernard@email.com',
        sujet: 'Refonte de site web',
        message: 'Bonjour, notre site actuel est obsolète et nous souhaitons le refaire complètement. Pouvez-vous nous aider ?',
        isRead: true,
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000) // Il y a 2 jours
    },
    {
        nom: 'Thomas Petit',
        email: 'thomas.petit@email.com',
        sujet: 'Formation développement web',
        message: 'Bonjour, proposez-vous des formations en développement web ? Je suis débutant et j\'aimerais apprendre.',
        isRead: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000) // Il y a 30 minutes
    },
    {
        nom: 'Caroline Leroy',
        email: 'caroline.leroy@email.com',
        sujet: 'Application mobile',
        message: 'Bonjour, nous avons besoin d\'une application mobile pour notre startup. Avez-vous de l\'expérience dans ce domaine ?',
        isRead: false,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // Il y a 3 heures
    },
    {
        nom: 'Laurent Moreau',
        email: 'laurent.moreau@email.com',
        sujet: 'SEO et référencement',
        message: 'Bonjour, mon site web a besoin d\'être mieux référencé sur Google. Proposez-vous des services SEO ?',
        isRead: true,
        createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000) // Il y a 3 jours
    },
    {
        nom: 'Isabelle Girard',
        email: 'isabelle.girard@email.com',
        sujet: 'Projet urgent',
        message: 'Bonjour, nous avons un projet urgent qui doit être terminé dans 2 semaines. Êtes-vous disponible ?',
        isRead: false,
        createdAt: new Date() // Maintenant
    }
];

// Fonction principale
async function seedDatabase() {
    try {
        // Connexion à MongoDB
        console.log('📡 Connexion à MongoDB...');
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sk-digitale';
        
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('✅ Connecté à MongoDB\n');
        
        // Supprimer les données existantes
        console.log('🗑️  Suppression des anciennes données...');
        await Message.deleteMany({});
        console.log('✅ Anciennes données supprimées\n');
        
        // Insérer les nouvelles données
        console.log('📝 Insertion des données de test...');
        const inserted = await Message.insertMany(testMessages);
        console.log(`✅ ${inserted.length} messages insérés avec succès\n`);
        
        // Afficher un résumé
        console.log('📊 Résumé:');
        console.log('─'.repeat(40));
        
        const stats = {
            total: await Message.countDocuments(),
            unread: await Message.countDocuments({ isRead: false }),
            read: await Message.countDocuments({ isRead: true })
        };
        
        console.log(`Total de messages: ${stats.total}`);
        console.log(`Messages non lus: ${stats.unread}`);
        console.log(`Messages lus: ${stats.read}`);
        console.log('─'.repeat(40));
        
        console.log('\n✅ Base de données initialisée avec succès !');
        console.log('\n💡 Vous pouvez maintenant démarrer le serveur avec: npm start\n');
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error.message);
        process.exit(1);
    } finally {
        // Fermer la connexion
        await mongoose.connection.close();
        console.log('🔌 Connexion MongoDB fermée\n');
        process.exit(0);
    }
}

// Exécuter le script
seedDatabase();