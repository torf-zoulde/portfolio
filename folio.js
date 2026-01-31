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
// Réduire le nombre de particules sur mobile pour de meilleures performances
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

        // Rebond sur les bords
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

// Créer les particules
for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
}

// Animation
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dessiner et mettre à jour les particules
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    // Dessiner les connexions
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 120) {
                ctx.beginPath();
                ctx.strokeStyle =  `rgba(14, 165, 233 , ${1 - distance / 120})`;
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

menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('active');
    menuBtn.classList.toggle('active');
});

// Fermer le menu si on clique ailleurs
document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !menuBtn.contains(e.target)) {
        menu.classList.remove('active');
        menuBtn.classList.remove('active');
    }
});

// Fermer le menu au clic sur un lien
document.querySelectorAll('.menu-link').forEach(link => {
    link.addEventListener('click', () => {
        menu.classList.remove('active');
        menuBtn.classList.remove('active');
    });
});

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
            
            // Scroll fluide vers la timeline
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

// Observer tous les éléments avec animation
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

btnContact.addEventListener('click', () => {
    formContact.classList.toggle('active');
    
    if (formContact.classList.contains('active')) {
        btnContact.innerHTML = '<i class="fas fa-times"></i> Fermer le formulaire';
    } else {
        btnContact.innerHTML = '<i class="fas fa-paper-plane"></i> Envoyer un message';
    }
});

// Soumettre le formulaire
formContact.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nom = document.getElementById('nom').value;
    const email = document.getElementById('email').value;
    const sujet = document.getElementById('sujet').value;
    const message = document.getElementById('message').value;
    
    // Créer le sujet et le corps de l'email
    const emailSubject = encodeURIComponent(sujet);
    const emailBody = encodeURIComponent(
        `Nom: ${nom}\n` +
        `Email: ${email}\n\n` +
        `Message:\n${message}`
    );
    
    // Ouvrir le client email
    window.location.href = `mailto:rogardossou@email.com?subject=${emailSubject}&body=${emailBody}`;
    
    // Afficher un message de confirmation
    alert('Merci pour votre message ! Votre client email va s\'ouvrir.');
    
    // Réinitialiser le formulaire
    formContact.reset();
    formContact.classList.remove('active');
    btnContact.innerHTML = '<i class="fas fa-paper-plane"></i> Envoyer un message';
});

// ===================================
// SCROLL TO TOP BUTTON
// ===================================
const scrollTopBtn = document.getElementById('scroll-top');

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

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
    } else {
        header.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.4)';
    }
    
    lastScroll = currentScroll;
});

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
// ANIMATION COMPTEUR (pour les stats)
// ===================================
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

// ===================================
// EFFET DE TYPING POUR LE TITRE
// ===================================
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// ===================================
// EFFET PARALLAX SIMPLE
// ===================================
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.parallax');
    
    parallaxElements.forEach(element => {
        const speed = element.dataset.speed || 0.5;
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// ===================================
// ANIMATION AU CHARGEMENT
// ===================================
window.addEventListener('load', () => {
    // Ajouter classe loaded pour déclencher les animations
    document.body.classList.add('loaded');
    
    // Animation de la photo après un délai
    setTimeout(() => {
        if (photoFrame) {
            photoFrame.style.opacity = '1';
            photoFrame.style.transform = 'scale(1)';
        }
    }, 500);
});

// ===================================
// GESTION DES TOOLTIPS
// ===================================
document.querySelectorAll('[data-tooltip]').forEach(element => {
    element.addEventListener('mouseenter', (e) => {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = e.target.dataset.tooltip;
        document.body.appendChild(tooltip);
        
        const rect = e.target.getBoundingClientRect();
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
        tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
    });
    
    element.addEventListener('mouseleave', () => {
        const tooltip = document.querySelector('.tooltip');
        if (tooltip) tooltip.remove();
    });
});

// ===================================
// CURSEUR PERSONNALISÉ (optionnel)
// ===================================
const cursor = document.createElement('div');
cursor.className = 'custom-cursor';
document.body.appendChild(cursor);

document.addEventListener('mousemove', (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
});

// Effet sur les liens et boutons
document.querySelectorAll('a, button').forEach(element => {
    element.addEventListener('mouseenter', () => {
        cursor.classList.add('hover');
    });
    
    element.addEventListener('mouseleave', () => {
        cursor.classList.remove('hover');
    });
});

// ===================================
// DÉTECTION MOBILE
// ===================================
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

if (isMobile) {
    // Désactiver certaines animations sur mobile pour les performances
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
// EASTER EGG - KONAMI CODE
// ===================================
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiPosition = 0;

document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiPosition]) {
        konamiPosition++;
        if (konamiPosition === konamiCode.length) {
            activateEasterEgg();
            konamiPosition = 0;
        }
    } else {
        konamiPosition = 0;
    }
});

function activateEasterEgg() {
    // Effet visuel spécial
    document.body.style.animation = 'rainbow 2s infinite';
    
    setTimeout(() => {
        document.body.style.animation = '';
        alert('🎉 Bravo ! Vous avez trouvé l\'easter egg ! 🎉');
    }, 2000);
}

// ===================================
// PRÉCHARGEMENT DES IMAGES
// ===================================
function preloadImages(urls) {
    urls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

// Liste des images à précharger
const imagesToPreload = [
    'IMG-20250727-WA0016.jpg'
];

preloadImages(imagesToPreload);

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
// ANALYTICS (si nécessaire)
// ===================================
function trackEvent(category, action, label) {
    // Placeholder pour Google Analytics ou autre
    console.log(`Event tracked: ${category} - ${action} - ${label}`);
}

// Tracker les clics sur les boutons importants
document.querySelectorAll('.btn-download, .btn-view, .social-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const label = this.textContent.trim();
        trackEvent('Button', 'Click', label);
    });
});