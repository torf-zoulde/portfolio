// ===================================
// UTILISER LA CONFIGURATION
// ===================================
const API_URL =`https://portfolio-production-7786.up.railway.app/api`;


// ===================================
// CANVAS BACKGROUND ANIMATION
// ===================================
const canvas = document.getElementById('creative-bg');
if (canvas) {
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

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
}

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
// FORMULAIRE CONTACT
// ===================================
const btnContact = document.getElementById('btn-contact');
const formContact = document.getElementById('form-contact');

if (btnContact && formContact) {
    btnContact.addEventListener('click', () => {
        formContact.classList.toggle('active');
        
        if (formContact.classList.contains('active')) {
            btnContact.innerHTML = '<i class="fas fa-times"></i> Fermer le formulaire';
        } else {
            btnContact.innerHTML = '<i class="fas fa-paper-plane"></i> Envoyer un message';
        }
    });

    formContact.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nom = document.getElementById('nom').value.trim();
        const email = document.getElementById('email').value.trim();
        const sujet = document.getElementById('sujet').value.trim();
        const message = document.getElementById('message').value.trim();
        
        if (!nom || !email || !sujet || !message) {
            showNotification('Veuillez remplir tous les champs', 'error');
            return;
        }
        
        const submitBtn = formContact.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
        
        try {
            const response = await fetch(`${API_URL}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nom, email, sujet, message })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showNotification('Message envoyé avec succès ! 🎉', 'success');
                formContact.reset();
                formContact.classList.remove('active');
                btnContact.innerHTML = '<i class="fas fa-paper-plane"></i> Envoyer un message';
            } else {
                showNotification(data.error || 'Erreur lors de l\'envoi du message', 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showNotification('Impossible de contacter le serveur. Vérifiez votre connexion.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
}

// ===================================
// FONCTION DE NOTIFICATION
// ===================================
function showNotification(message, type = 'info') {
    const existingNotif = document.querySelector('.notification');
    if (existingNotif) {
        existingNotif.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'error' ? 'fa-exclamation-circle' : 
                 'fa-info-circle';
    
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    }, 10);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// ===================================
// LOGIN ADMIN
// ===================================
const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const loadingIndicator = document.getElementById('loading-indicator');
const togglePassword = document.getElementById('toggle-password');

if (togglePassword) {
    togglePassword.addEventListener('click', () => {
        const passwordInput = document.getElementById('password');
        const icon = togglePassword.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
}

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
// TEST DE CONNEXION API AU CHARGEMENT
// ===================================
async function testAPIConnection() {
    try {
        const response = await fetch(`${API_URL}/messages/stats/summary`);

        if (response.ok) {
            console.log('✅ API connectée et fonctionnelle');
        } else {
            console.warn(`⚠️ API accessible mais réponse invalide (${response.status})`);
        }

    } catch (error) {
        console.warn('❌ Serveur API non accessible.');
        console.warn('➡️ Vérifie que le backend est démarré ou que l’URL API est correcte');
    }
}

// Tester la connexion API UNIQUEMENT en développement
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    testAPIConnection();
}

// ===================================
// CONSOLE MESSAGE
// ===================================
const ENV = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? 'DÉVELOPPEMENT 🔧'
    : 'PRODUCTION 🚀';

console.log(
    '%c👋 Bienvenue sur mon portfolio !',
    'color: #ff6b35; font-size: 20px; font-weight: bold;'
);

console.log(
    `%cEnvironnement: ${ENV}`,
    'color: #ff8c5a; font-size: 14px;'
);

console.log(
    `%cAPI utilisée: ${API_URL}`,
    'color: #38bdf8; font-size: 13px;'
);
