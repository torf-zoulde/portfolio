require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const nodemailer = require('nodemailer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// =======================
// MIDDLEWARES
// =======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers HTML / CSS / JS
app.use(express.static(path.join(__dirname, 'SK Digitale')));

// =======================
// CONNEXION MONGODB
// =======================
if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI manquant dans .env');
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connecté'))
    .catch(err => {
        console.error('❌ Erreur MongoDB', err);
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
// FICHIER POUR STOCKER LE MOT DE PASSE
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
// ROUTES PAGES HTML
// =======================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'SK Digitale', 'index.html'));
});

app.get('/messages', (req, res) => {
    res.sendFile(path.join(__dirname, 'SK Digitale', 'Messages.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'SK Digitale', 'Admin.html'));
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

        await new Message({ nom, email, sujet, message }).save();
        res.status(201).json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.get('/api/messages', async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (err) {
        console.error(err);
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
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.patch('/api/messages/:id/read', async (req, res) => {
    try {
        const msg = await Message.findById(req.params.id);
        if (!msg) return res.status(404).json({ error: 'Message introuvable' });

        const { isRead } = req.body;
        msg.lu = isRead !== undefined ? isRead : !msg.lu;
        await msg.save();

        res.json({ success: true, isRead: msg.lu });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.delete('/api/messages/:id', async (req, res) => {
    try {
        await Message.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// =======================
// ADMIN LOGIN SÉCURISÉ
// =======================
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';

app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Identifiant et mot de passe requis' });
    }

    const adminPassword = getAdminPassword();

    if (username === ADMIN_USERNAME && password === adminPassword) {
        return res.json({ success: true, redirect: '/messages' });
    } else {
        return res.status(401).json({ error: 'Identifiant ou mot de passe incorrect' });
    }
});

// =======================
// CHANGER MOT DE PASSE
// =======================
app.post('/api/admin/change-password', (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    const adminPassword = getAdminPassword();

    if (currentPassword !== adminPassword) {
        return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
    }

    if (newPassword.length < 4) {
        return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 4 caractères' });
    }

    try {
        setAdminPassword(newPassword);
        res.json({ success: true, message: 'Mot de passe modifié avec succès' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la modification' });
    }
});

// =======================
// ENVOYER RÉPONSE PAR EMAIL
// =======================
app.post('/api/messages/:id/reply', async (req, res) => {
    try {
        const { response } = req.body;
        if (!response) return res.status(400).json({ error: 'Message vide' });

        // Récupérer le message
        const message = await Message.findById(req.params.id);
        if (!message) return res.status(404).json({ error: 'Message non trouvé' });

        // Vérifier que les credentials Gmail sont configurés
        if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
            return res.status(500).json({ 
                error: 'Configuration email manquante. Veuillez configurer GMAIL_USER et GMAIL_PASS dans .env' 
            });
        }

        // Configurer Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            }
        });

        // Préparer l'email
        const mailOptions = {
            from: `SK Digitale <${process.env.GMAIL_USER}>`,
            to: message.email,
            subject: `Réponse à votre message : ${message.sujet}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f7fa; padding: 20px;">
                    <div style="background: #1a1d29; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
                        <h2 style="color: #ff6b35; margin: 0;">SK Digitale</h2>
                        <p style="color: #ffffff; margin: 10px 0 0;">Réponse à votre message</p>
                    </div>
                    
                    <div style="background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <p style="color: #333; margin-bottom: 20px;">Bonjour <strong>${message.nom}</strong>,</p>
                        
                        <p style="color: #666; margin-bottom: 20px;">
                            Merci pour votre message concernant : <strong>"${message.sujet}"</strong>
                        </p>
                        
                        <div style="background: #f5f7fa; padding: 20px; border-left: 4px solid #ff6b35; margin: 20px 0;">
                            <p style="color: #333; margin: 0; white-space: pre-wrap;">${response}</p>
                        </div>
                        
                        <p style="color: #666; margin-top: 30px;">
                            Cordialement,<br>
                            <strong style="color: #ff6b35;">L'équipe SK Digitale</strong>
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                        <p>Cet email a été envoyé en réponse à votre message du ${new Date(message.createdAt).toLocaleString('fr-FR')}</p>
                    </div>
                </div>
            `
        };

        // Envoyer l'email
        await transporter.sendMail(mailOptions);

        // Marquer le message comme lu
        message.lu = true;
        await message.save();

        res.json({ 
            success: true, 
            message: 'Réponse envoyée avec succès à ' + message.email 
        });
    } catch (err) {
        console.error('Erreur envoi email:', err);
        res.status(500).json({ 
            error: 'Erreur lors de l\'envoi de l\'email. Vérifiez votre configuration Gmail.',
            details: err.message 
        });
    }
});

// =======================
// LANCEMENT SERVEUR
// =======================
app.listen(PORT, () => {
    console.log('═══════════════════════════════════════');
    console.log('🚀 Serveur SK Digitale démarré');
    console.log('═══════════════════════════════════════');
    console.log(`➡️  Site web : http://localhost:${PORT}`);
    console.log(`📧 Messages : http://localhost:${PORT}/messages`);
    console.log(`🔐 Admin : http://localhost:${PORT}/admin`);
    console.log('═══════════════════════════════════════');
    console.log(`👤 Admin : ${ADMIN_USERNAME}`);
    console.log(`📧 Email : ${process.env.GMAIL_USER || 'Non configuré'}`);
    console.log('═══════════════════════════════════════');
});