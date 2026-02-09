require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const nodemailer = require('nodemailer');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// =======================
// CONFIGURATION CORS
// =======================
app.use(cors({
    origin: 'https://portfolio-production-7786.up.railway.app',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// =======================
// MIDDLEWARES
// =======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging des requêtes
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// =======================
// SERVIR LES FICHIERS STATIQUES (racine)
// =======================
app.use(express.static(path.join(__dirname)));

// =======================
// CONNEXION MONGODB (CORRIGÉ)
// =======================
if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI manquant dans .env');
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connecté'))
    .catch(err => {
        console.error('❌ Erreur MongoDB:', err.message);
        process.exit(1);
    });

// =======================
// MODELE MESSAGE
// =======================
const messageSchema = new mongoose.Schema({
    nom: String,
    email: String,
    sujet: String,
    message: String,
    lu: { type: Boolean, default: false }
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

// =======================
// GESTION MOT DE PASSE ADMIN
// =======================
const PASSWORD_FILE = path.join(__dirname, '.admin-password');

function getAdminPassword() {
    if (fs.existsSync(PASSWORD_FILE)) {
        return fs.readFileSync(PASSWORD_FILE, 'utf8').trim();
    }
    return process.env.ADMIN_PASSWORD || '1234';
}

function setAdminPassword(newPassword) {
    fs.writeFileSync(PASSWORD_FILE, newPassword, 'utf8');
}

// =======================
// HEALTH CHECK
// =======================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'API fonctionnelle',
        timestamp: new Date().toISOString()
    });
});

// =======================
// ROUTES HTML
// =======================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/messages', (req, res) => {
    res.sendFile(path.join(__dirname, 'Messages.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'Admin.html'));
});

// =======================
// API MESSAGES
// =======================
app.post('/api/messages', async (req, res) => {
    try {
        const { nom, email, sujet, message } = req.body;

        if (!nom || !email || !sujet || !message) {
            return res.status(400).json({ error: 'Champs manquants' });
        }

        const newMessage = await new Message({ nom, email, sujet, message }).save();
        console.log('✅ Nouveau message:', newMessage._id);

        res.status(201).json({
            success: true,
            message: 'Message enregistré',
            id: newMessage._id
        });
    } catch (err) {
        console.error('❌ POST /api/messages:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.get('/api/messages', async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (err) {
        console.error('❌ GET /api/messages:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.get('/api/messages/stats/summary', async (req, res) => {
    try {
        const total = await Message.countDocuments();
        const read = await Message.countDocuments({ lu: true });
        const unread = await Message.countDocuments({ lu: false });
        const today = await Message.countDocuments({
            createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        });

        res.json({ total, read, unread, today });
    } catch (err) {
        console.error('❌ stats:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.patch('/api/messages/:id/read', async (req, res) => {
    try {
        const msg = await Message.findById(req.params.id);
        if (!msg) return res.status(404).json({ error: 'Message introuvable' });

        msg.lu = req.body.isRead ?? !msg.lu;
        await msg.save();

        res.json({ success: true, isRead: msg.lu });
    } catch (err) {
        console.error('❌ PATCH read:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.delete('/api/messages/:id', async (req, res) => {
    try {
        const deleted = await Message.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Message introuvable' });

        res.json({ success: true });
    } catch (err) {
        console.error('❌ DELETE message:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// =======================
// ADMIN LOGIN
// =======================
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';

app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_USERNAME && password === getAdminPassword()) {
        return res.json({ success: true, redirect: '/messages' });
    }
    res.status(401).json({ error: 'Identifiants incorrects' });
});

// =======================
// CHANGER MOT DE PASSE
// =======================
app.post('/api/admin/change-password', (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (currentPassword !== getAdminPassword()) {
        return res.status(401).json({ error: 'Mot de passe incorrect' });
    }

    setAdminPassword(newPassword);
    res.json({ success: true });
});

// =======================
// ROUTE 404
// =======================
app.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée', path: req.url });
});

// =======================
// LANCEMENT SERVEUR
// =======================
app.listen(PORT, '0.0.0.0', () => {
    console.log('═══════════════════════════════════════');
    console.log('🚀 Serveur SK Digitale démarré');
    console.log(`➡️  Port : ${PORT}`);
    console.log(`🌐 http://localhost:${PORT}`);
    console.log(`📧 /messages`);
    console.log(`🔐 /admin`);
    console.log('═══════════════════════════════════════');
});
