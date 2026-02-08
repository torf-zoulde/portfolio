// ===================================
// CONFIGURATION API
// ===================================
// IMPORTANT: Changez cette URL selon votre environnement
const API_URL = 'http://localhost:3000/api';
// En production, remplacez par: const API_URL = 'https://votre-domaine.com/api';

// ===================================
// CANVAS BACKGROUND ANIMATION
// ===================================
const canvas = document.getElementById('creative-bg');
const ctx = canvas.getContext('2d');

// Fonction pour redimensionner le canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Particules
const particles = [];
const particleCount = window.innerWidth < 768 ? 50 : 100;

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.radius = Math.random() * 2 + 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(14, 165, 233, 0.6)';
        ctx.fill();
    }
}

for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 120) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(14, 165, 233, ${1 - distance / 120})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }

    requestAnimationFrame(animate);
}

animate();

// ===================================
// MENU MOBILE TOGGLE
// ===================================
const menuBtn = document.getElementById('menuBtn');
const menu = document.getElementById('menu');

if (menuBtn && menu) {
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('active');
        menuBtn.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !menuBtn.contains(e.target)) {
            menu.classList.remove('active');
            menuBtn.classList.remove('active');
        }
    });

    document.querySelectorAll('.menu-link').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('active');
            menuBtn.classList.remove('active');
        });
    });
}

// ===================================
// BOUTON VOIR PLUS - PARCOURS SCOLAIRE
// ===================================
const btnVoirParcours = document.getElementById('btn-voir-parcours');
const parcoursComplet = document.getElementById('parcours-complet');

if (btnVoirParcours && parcoursComplet) {
    btnVoirParcours.addEventListener('click', () => {
        if (parcoursComplet.style.display === 'none' || parcoursComplet.style.display === '') {
            parcoursComplet.style.display = 'block';
            btnVoirParcours.innerHTML = '<i class="fas fa-chevron-up"></i> Voir moins';
            btnVoirParcours.classList.add('active');
            
            setTimeout(() => {
                parcoursComplet.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        } else {
            parcoursComplet.style.display = 'none';
            btnVoirParcours.innerHTML = '<i class="fas fa-chevron-down"></i> Voir plus';
            btnVoirParcours.classList.remove('active');
        }
    });
}

// ===================================
// SCROLL ANIMATIONS
// ===================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.timeline-item, .experience-card, .skill-category, .soft-skill-card, .project-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(50px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ===================================
// ANIMATION BARRES DE COMPÉTENCES
// ===================================
const skillBars = document.querySelectorAll('.skill-progress');

const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const bar = entry.target;
            const width = bar.style.width;
            bar.style.width = '0';
            setTimeout(() => {
                bar.style.width = width;
            }, 100);
        }
    });
}, { threshold: 0.5 });

skillBars.forEach(bar => skillObserver.observe(bar));

// ===================================
// FORMULAIRE CONTACT - CORRIGÉ
// ===================================
const btnContact = document.getElementById('btn-contact');
const formContact = document.getElementById('form-contact');

if (btnContact && formContact) {
    // Afficher/masquer le formulaire
    btnContact.addEventListener('click', () => {
        formContact.classList.toggle('active');
        
        if (formContact.classList.contains('active')) {
            btnContact.innerHTML = '<i class="fas fa-times"></i> Fermer le formulaire';
        } else {
            btnContact.innerHTML = '<i class="fas fa-paper-plane"></i> Envoyer un message';
        }
    });

    // Soumettre le formulaire avec envoi vers l'API
    formContact.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nom = document.getElementById('nom').value.trim();
        const email = document.getElementById('email').value.trim();
        const sujet = document.getElementById('sujet').value.trim();
        const message = document.getElementById('message').value.trim();
        
        // Validation
        if (!nom || !email || !sujet || !message) {
            showNotification('Veuillez remplir tous les champs', 'error');
            return;
        }
        
        // Désactiver le bouton pendant l'envoi
        const submitBtn = formContact.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
        
        try {
            // Envoyer les données à l'API
            const response = await fetch(`${API_URL}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nom,
                    email,
                    sujet,
                    message
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Succès
                showNotification('Message envoyé avec succès ! 🎉', 'success');
                
                // Réinitialiser le formulaire
                formContact.reset();
                formContact.classList.remove('active');
                btnContact.innerHTML = '<i class="fas fa-paper-plane"></i> Envoyer un message';
            } else {
                // Erreur serveur
                showNotification(data.error || 'Erreur lors de l\'envoi du message', 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showNotification('Impossible de contacter le serveur. Vérifiez votre connexion.', 'error');
        } finally {
            // Réactiver le bouton
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
}

// ===================================
// FONCTION DE NOTIFICATION
// ===================================
function showNotification(message, type = 'info') {
    // Supprimer les notifications existantes
    const existingNotif = document.querySelector('.notification');
    if (existingNotif) {
        existingNotif.remove();
    }
    
    // Créer la notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'error' ? 'fa-exclamation-circle' : 
                 'fa-info-circle';
    
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    Admin
    // Ajouter au DOM
    document.body.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    }, 10);
    
    // Supprimer après 5 secondes
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// ===================================
// SCROLL TO TOP BUTTON
// ===================================
const scrollTopBtn = document.getElementById('scroll-top');

if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ===================================
// SMOOTH SCROLL POUR LES LIENS D'ANCRE
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===================================
// HEADER SCROLL EFFECT
// ===================================
const header = document.getElementById('header');
let lastScroll = 0;

if (header) {
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
        } else {
            header.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.4)';
        }
        
        lastScroll = currentScroll;
    });
}

// ===================================
// INTERACTION PHOTO HERO
// ===================================
const photoFrame = document.querySelector('.photo-frame');

if (photoFrame) {
    photoFrame.addEventListener('mouseenter', () => {
        photoFrame.style.transform = 'scale(1.05) rotate(5deg)';
    });
    
    photoFrame.addEventListener('mouseleave', () => {
        photoFrame.style.transform = 'scale(1) rotate(0deg)';
    });
}

// ===================================
// ANIMATION AU CHARGEMENT
// ===================================
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    setTimeout(() => {
        if (photoFrame) {
            photoFrame.style.opacity = '1';
            photoFrame.style.transform = 'scale(1)';
        }
    }, 500);
});

// ===================================
// DÉTECTION MOBILE
// ===================================
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

if (isMobile) {
    document.body.classList.add('mobile');
}

// ===================================
// GESTION DES ERREURS D'IMAGES
// ===================================
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
        this.style.display = 'none';
        const placeholder = document.createElement('div');
        placeholder.className = 'img-placeholder';
        placeholder.innerHTML = '<i class="fas fa-image"></i>';
        this.parentNode.appendChild(placeholder);
    });
});

// ===================================
// CONSOLE MESSAGE
// ===================================
console.log(
    '%c👋 Bienvenue sur mon portfolio !',
    'color: #0ea5e9; font-size: 20px; font-weight: bold;'
);
console.log(
    '%cSi vous regardez le code, vous êtes probablement un développeur comme moi ! 😊',
    'color: #38bdf8; font-size: 14px;'
);
console.log(
    '%cN\'hésitez pas à me contacter si vous voulez discuter tech !',
    'color: #0284c7; font-size: 14px;'
);

// ===================================
// PERFORMANCE MONITORING
// ===================================
if (window.performance) {
    window.addEventListener('load', () => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`⚡ Temps de chargement: ${pageLoadTime}ms`);
    });
}

// ===================================
// TEST DE CONNEXION API AU CHARGEMENT
// ===================================
async function testAPIConnection() {
    try {
        const response = await fetch(`${API_URL}/messages/stats/summary`);
        if (response.ok) {
            console.log('✅ API connectée et fonctionnelle');
        } else {
            console.warn('⚠️ API accessible mais erreur de réponse');
        }
    } catch (error) {
        console.warn('⚠️ Serveur API non accessible. Assurez-vous que server.js est démarré.');
        console.warn('➡️ Pour démarrer le serveur: npm start');
    }
}

// Tester la connexion API au chargement (en mode développement)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    testAPIConnection();
}

// LOGIN ADMIN
const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const loadingIndicator = document.getElementById('loading-indicator');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.style.display = 'none';
        loadingIndicator.style.display = 'flex';

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        try {
            const response = await fetch(`${API_URL}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            loadingIndicator.style.display = 'none';

            if (response.ok) {
                // Redirection vers messages.html
                window.location.href = data.redirect;
            } else {
                errorText.textContent = data.error || 'Erreur de connexion';
                errorMessage.style.display = 'flex';
            }
        } catch (err) {
            loadingIndicator.style.display = 'none';
            errorText.textContent = 'Impossible de contacter le serveur';
            errorMessage.style.display = 'flex';
            console.error(err);
        }
    });
}






// ===================================
// CHARGEMENT DES MESSAGES AVEC MODAL
// ===================================
async function loadMessages() {
    const container = document.getElementById('messages-container');
    if (!container) return;

    container.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Chargement des messages...</p>
        </div>
    `;

    try {
        const response = await fetch(`${API_URL}/messages`);
        if (!response.ok) throw new Error(`HTTP ${response.status} - ${response.statusText}`);
        const messages = await response.json();

        if (messages.length === 0) {
            container.innerHTML = '<p>Aucun message reçu pour le moment.</p>';
            return;
        }

        container.innerHTML = messages.map(msg => `
            <div class="message-card ${msg.lu ? 'read' : 'unread'}" data-id="${msg._id}">
                <div class="message-summary">
                    <span class="message-nom">${msg.nom}</span>
                    <span class="message-date">${new Date(msg.createdAt).toLocaleString()}</span>
                    <button class="btn-view-message">
                        <i class="fas fa-eye"></i> Voir
                    </button>
                </div>
            </div>
        `).join('');

        // Ajouter les événements pour ouvrir la modal
        document.querySelectorAll('.btn-view-message').forEach(btn => {
            btn.addEventListener('click', () => {
                const card = btn.closest('.message-card');
                const id = card.dataset.id;
                const messageData = messages.find(m => m._id === id);
                openMessageModal(messageData);
            });
        });

    } catch (err) {
        console.error('Erreur de chargement des messages:', err);
        container.innerHTML = `<p>Erreur de chargement des messages. ${err.message}</p>`;
    }
}










// ===================================
// MODAL MESSAGE
// ===================================
const modal = document.getElementById('message-modal');
const closeModalBtn = document.getElementById('close-modal');

function openMessageModal(msg) {
    if (!msg) return;
    
    document.getElementById('detail-nom').textContent = msg.nom;
    document.getElementById('detail-email').textContent = msg.email;
    document.getElementById('detail-sujet').textContent = msg.sujet;
    document.getElementById('detail-date').textContent = new Date(msg.createdAt).toLocaleString();
    document.getElementById('detail-message').textContent = msg.message;

    // Bouton marquer lu/non lu
    const readStatusText = document.getElementById('read-status-text');
    const btnToggleRead = document.getElementById('btn-toggle-read');
    readStatusText.textContent = msg.lu ? 'Marquer comme non lu' : 'Marquer comme lu';

    btnToggleRead.onclick = async () => {
        try {
            await fetch(`${API_URL}/messages/${msg._id}/read`, { method: 'PATCH' });
            modal.style.display = 'none';
            loadMessages();
        } catch (err) {
            console.error(err);
            alert('Impossible de mettre à jour le statut du message.');
        }
    };

    // Bouton supprimer
    const btnDelete = document.getElementById('btn-delete-message');
    btnDelete.onclick = () => openConfirmModal(async () => {
        try {
            await fetch(`${API_URL}/messages/${msg._id}`, { method: 'DELETE' });
            modal.style.display = 'none';
            loadMessages();
        } catch (err) {
            console.error(err);
            alert('Impossible de supprimer le message.');
        }
    });

    // Bouton répondre
    const btnSendResponse = document.getElementById('btn-send-response');
    btnSendResponse.onclick = () => {
        const responseText = document.getElementById('response-text').value.trim();
        if (!responseText) return alert('Veuillez écrire une réponse.');
        window.location.href = `mailto:${msg.email}?subject=Réponse: ${msg.sujet}&body=${encodeURIComponent(responseText)}`;
    };

    modal.style.display = 'flex';
}

closeModalBtn.onclick = () => modal.style.display = 'none';
window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

// ===================================
// MODAL DE CONFIRMATION
// ===================================
const confirmModal = document.getElementById('confirm-modal');
const btnConfirmOk = document.getElementById('btn-confirm-ok');
const btnConfirmCancel = document.getElementById('btn-confirm-cancel');

let confirmCallback = null;

function openConfirmModal(callback) {
    confirmCallback = callback;
    confirmModal.style.display = 'flex';
}

btnConfirmCancel.onclick = () => confirmModal.style.display = 'none';
btnConfirmOk.onclick = () => {
    confirmModal.style.display = 'none';
    if (typeof confirmCallback === 'function') confirmCallback();
};
window.onclick = (e) => { if (e.target === confirmModal) confirmModal.style.display = 'none'; };

// ===================================
// CHARGER LES MESSAGES AU DEMARRAGE
// ===================================
if (window.location.pathname.includes('Messages.html')) {
    loadMessages();
}

// Charger les messages dès que la page est prête
window.addEventListener('DOMContentLoaded', () => {
    loadMessages();
});



