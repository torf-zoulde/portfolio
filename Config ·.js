// Configuration pour différents environnements
module.exports = {
    development: {
        port: 3000,
        mongoURI: 'mongodb://localhost:27017/sk-digitale',
        corsOrigin: '*',
        sessionDuration: 8 * 60 * 60 * 1000, // 8 heures
    },
    production: {
        port: process.env.PORT || 3000,
        mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/sk-digitale',
        corsOrigin: process.env.CORS_ORIGIN || '*',
        sessionDuration: 8 * 60 * 60 * 1000, // 8 heures
    },
    test: {
        port: 3001,
        mongoURI: 'mongodb://localhost:27017/sk-digitale-test',
        corsOrigin: '*',
        sessionDuration: 1 * 60 * 60 * 1000, // 1 heure
    }
};