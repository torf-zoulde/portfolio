// ===================================
// UTILISER LA CONFIGURATION
// ===================================
const API_URL = `https://portfolio-production-7786.up.railway.app/api`;


// ===================================
// CANVAS BACKGROUND
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
            ctx.fillStyle = 'rgba(255,107,53,0.6)';
            ctx.fill();
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(255,107,53,${1 - dist / 120})`;
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
// VARIABLES GLOBALES
// ===================================
let messagesData = [];
let currentMessage = null;
let currentFilter = 'all';

// Éléments DOM
const messagesContainer = document.getElementById('messages-container');
const searchInput = document.getElementById('search-input');
const filterButtons = document.querySelectorAll('.filter-btn');
const btnRefresh = document.getElementById('btn-refresh');
const logoutBtn = document.getElementById('btn-logout');

const statTotal = document.getElementById('stat-total');
const statUnread = document.getElementById('stat-unread');
const statRead = document.getElementById('stat-read');
const statToday = document.getElementById('stat-today');

const messageModal = document.getElementById('message-modal');
const closeModalBtn = document.getElementById('close-modal');
const btnToggleRead = document.getElementById('btn-toggle-read');
const btnDeleteMessage = document.getElementById('btn-delete-message');
const responseText = document.getElementById('response-text');
const btnSendResponse = document.getElementById('btn-send-response');
const readStatusText = document.getElementById('read-status-text');

// Menu latéral
const btnMenu = document.getElementById('btn-menu');
const sideMenu = document.getElementById('side-menu');
const closeMenu = document.getElementById('close-menu');
const menuOverlay = document.getElementById('menu-overlay');

// ===================================
// NOTIFICATION
// ===================================
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notif = document.createElement('div');
    notif.className = `notification notification-${type}`;
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    notif.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
    document.body.appendChild(notif);

    setTimeout(() => {
        notif.style.transform = 'translateX(0)';
        notif.style.opacity = '1';
    }, 10);

    setTimeout(() => {
        notif.style.transform = 'translateX(400px)';
        notif.style.opacity = '0';
        setTimeout(() => notif.remove(), 300);
    }, 5000);
}

// ===================================
// MENU LATÉRAL
// ===================================
if (btnMenu && sideMenu && closeMenu && menuOverlay) {
    btnMenu.addEventListener('click', () => {
        sideMenu.classList.add('active');
        menuOverlay.classList.add('active');
    });

    closeMenu.addEventListener('click', () => {
        sideMenu.classList.remove('active');
        menuOverlay.classList.remove('active');
    });

    menuOverlay.addEventListener('click', () => {
        sideMenu.classList.remove('active');
        menuOverlay.classList.remove('active');
    });

    // Menu items
    const menuDashboard = document.getElementById('menu-dashboard');
    const menuAllData = document.getElementById('menu-all-data');
    const menuSettings = document.getElementById('menu-settings');
    const menuExport = document.getElementById('menu-export');

    if (menuDashboard) {
        menuDashboard.addEventListener('click', () => {
            sideMenu.classList.remove('active');
            menuOverlay.classList.remove('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    if (menuAllData) {
        menuAllData.addEventListener('click', () => {
            sideMenu.classList.remove('active');
            menuOverlay.classList.remove('active');
            showAllDataModal();
        });
    }

    if (menuSettings) {
        menuSettings.addEventListener('click', () => {
            sideMenu.classList.remove('active');
            menuOverlay.classList.remove('active');
            document.getElementById('settings-modal').style.display = 'flex';
        });
    }

    if (menuExport) {
        menuExport.addEventListener('click', () => {
            sideMenu.classList.remove('active');
            menuOverlay.classList.remove('active');
            exportData();
        });
    }
}

// ===================================
// CHARGEMENT MESSAGES
// ===================================
async function loadMessages() {
    if (!messagesContainer) return;
    messagesContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>Chargement des messages...</p></div>';

    try {
        const res = await fetch(`${API_URL}/messages`);
        if (!res.ok) throw new Error('Erreur API');
        messagesData = await res.json();
        displayMessages(messagesData);
        updateStats();
    } catch (err) {
        messagesContainer.innerHTML = '<p style="color: var(--color-white); text-align: center;">Erreur de chargement des messages</p>';
        console.error(err);
        showNotification('Erreur de chargement', 'error');
    }
}

function displayMessages(messages) {
    if (!messagesContainer) return;

    if (messages.length === 0) {
        messagesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>Aucun message trouvé</h3>
                <p>Il n'y a aucun message correspondant à vos critères.</p>
            </div>
        `;
        return;
    }

    messagesContainer.innerHTML = messages.map(m => `
        <div class="message-card ${m.lu ? 'read' : 'unread'}" data-id="${m._id}">
            <div class="message-status ${m.lu ? 'read' : 'unread'}">
                <i class="fas ${m.lu ? 'fa-check-circle' : 'fa-envelope'}"></i>
            </div>
            <div class="message-content">
                <div class="message-header">
                    <div class="message-from">
                        <h4>${m.nom}</h4>
                        ${!m.lu ? '<span class="message-badge unread">Nouveau</span>' : ''}
                    </div>
                    <span class="message-date">${new Date(m.createdAt).toLocaleString('fr-FR')}</span>
                </div>
                <p class="message-subject">${m.sujet}</p>
                <p class="message-preview">${m.message.substring(0, 120)}...</p>
                <div class="message-footer">
                    <span class="message-email">
                        <i class="fas fa-envelope"></i>
                        ${m.email}
                    </span>
                </div>
            </div>
        </div>
    `).join('');

    // Ajouter les événements de clic
    document.querySelectorAll('.message-card').forEach(card => {
        card.addEventListener('click', () => {
            openMessageModal(card.dataset.id);
        });
    });
}

// ===================================
// MODAL MESSAGE
// ===================================
function openMessageModal(id) {
    currentMessage = messagesData.find(m => m._id === id);
    if (!currentMessage) return;

    document.getElementById('detail-nom').textContent = currentMessage.nom;
    document.getElementById('detail-email').textContent = currentMessage.email;
    document.getElementById('detail-sujet').textContent = currentMessage.sujet;
    document.getElementById('detail-date').textContent = new Date(currentMessage.createdAt).toLocaleString('fr-FR');
    document.getElementById('detail-message').textContent = currentMessage.message;

    readStatusText.textContent = currentMessage.lu ? 'Marquer comme non lu' : 'Marquer comme lu';
    responseText.value = '';

    if (messageModal) messageModal.style.display = 'flex';
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        messageModal.style.display = 'none';
    });
}

// ===================================
// MARQUER COMME LU / NON LU
// ===================================
if (btnToggleRead) {
    btnToggleRead.addEventListener('click', async () => {
        if (!currentMessage) return;

        try {
            const res = await fetch(`${API_URL}/messages/${currentMessage._id}/read`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isRead: !currentMessage.lu })
            });

            if (!res.ok) throw new Error('Erreur');

            currentMessage.lu = !currentMessage.lu;
            readStatusText.textContent = currentMessage.lu ? 'Marquer comme non lu' : 'Marquer comme lu';

            await loadMessages();
            showNotification('Statut mis à jour', 'success');
        } catch (err) {
            console.error(err);
            showNotification('Erreur lors de la mise à jour', 'error');
        }
    });
}

// ===================================
// SUPPRIMER MESSAGE
// ===================================
if (btnDeleteMessage) {
    btnDeleteMessage.addEventListener('click', () => {
        confirmDelete();
    });
}

function confirmDelete() {
    const confirmModal = document.getElementById('confirm-modal');
    const btnOk = document.getElementById('btn-confirm-ok');
    const btnCancel = document.getElementById('btn-confirm-cancel');

    confirmModal.style.display = 'flex';

    btnCancel.onclick = () => {
        confirmModal.style.display = 'none';
    };

    btnOk.onclick = async () => {
        if (!currentMessage) return;

        try {
            const res = await fetch(`${API_URL}/messages/${currentMessage._id}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('Erreur');

            showNotification('Message supprimé', 'success');
            confirmModal.style.display = 'none';
            messageModal.style.display = 'none';
            await loadMessages();
        } catch (err) {
            console.error(err);
            showNotification('Erreur lors de la suppression', 'error');
        }
    };
}

// ===================================
// ENVOYER RÉPONSE
// ===================================
if (btnSendResponse) {
    btnSendResponse.addEventListener('click', async () => {
        if (!currentMessage) return;

        const response = responseText.value.trim();
        if (!response) {
            showNotification('Veuillez écrire un message', 'error');
            return;
        }

        btnSendResponse.disabled = true;
        btnSendResponse.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';

        try {
            const res = await fetch(`${API_URL}/messages/${currentMessage._id}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ response })
            });

            const data = await res.json();

            if (res.ok) {
                showNotification('Réponse envoyée avec succès !', 'success');
                responseText.value = '';
            } else {
                showNotification('Erreur : ' + (data.error || 'Échec de l\'envoi'), 'error');
            }
        } catch (err) {
            console.error(err);
            showNotification('Erreur lors de l\'envoi de la réponse', 'error');
        } finally {
            btnSendResponse.disabled = false;
            btnSendResponse.innerHTML = '<i class="fas fa-paper-plane"></i> Envoyer la réponse';
        }
    });
}

// ===================================
// RECHERCHE
// ===================================
if (searchInput) {
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        const filtered = messagesData.filter(m =>
            m.nom.toLowerCase().includes(query) ||
            m.email.toLowerCase().includes(query) ||
            m.sujet.toLowerCase().includes(query) ||
            m.message.toLowerCase().includes(query)
        );
        displayMessages(applyFilter(filtered));
    });
}

// ===================================
// FILTRES
// ===================================
if (filterButtons) {
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;

            const query = searchInput ? searchInput.value.toLowerCase() : '';
            let filtered = messagesData;

            if (query) {
                filtered = filtered.filter(m =>
                    m.nom.toLowerCase().includes(query) ||
                    m.email.toLowerCase().includes(query) ||
                    m.sujet.toLowerCase().includes(query) ||
                    m.message.toLowerCase().includes(query)
                );
            }

            displayMessages(applyFilter(filtered));
        });
    });
}

function applyFilter(messages) {
    if (currentFilter === 'read') {
        return messages.filter(m => m.lu);
    } else if (currentFilter === 'unread') {
        return messages.filter(m => !m.lu);
    }
    return messages;
}

// ===================================
// BOUTON ACTUALISER
// ===================================
if (btnRefresh) {
    btnRefresh.addEventListener('click', async () => {
        btnRefresh.disabled = true;
        const icon = btnRefresh.querySelector('i');
        if (icon) icon.style.animation = 'spin 1s linear infinite';

        await loadMessages();

        setTimeout(() => {
            btnRefresh.disabled = false;
            if (icon) icon.style.animation = '';
        }, 1000);

        showNotification('Messages actualisés', 'success');
    });
}

// ===================================
// BOUTON DÉCONNEXION
// ===================================
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
            window.location.href = 'index.html';
        }
    });
}

// ===================================
// MISE À JOUR DES STATS
// ===================================
async function updateStats() {
    try {
        const res = await fetch(`${API_URL}/messages/stats/summary`);
        if (!res.ok) throw new Error('Erreur stats');

        const stats = await res.json();
        if (statTotal) statTotal.textContent = stats.total;
        if (statUnread) statUnread.textContent = stats.unread;
        if (statRead) statRead.textContent = stats.read;
        if (statToday) statToday.textContent = stats.today;
    } catch (err) {
        console.error(err);
    }
}

// ===================================
// MODAL TOUTES LES DONNÉES
// ===================================
function showAllDataModal() {
    const modal = document.getElementById('all-data-modal');
    const container = document.getElementById('data-table-container');

    if (!modal || !container) return;

    modal.style.display = 'flex';
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>Chargement des données...</p></div>';

    setTimeout(() => {
        if (messagesData.length === 0) {
            container.innerHTML = '<p style="color: var(--color-white); text-align: center;">Aucune donnée disponible</p>';
            return;
        }

        container.innerHTML = `
            <div style="overflow-x: auto;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Nom</th>
                            <th>Email</th>
                            <th>Sujet</th>
                            <th>Message</th>
                            <th>Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${messagesData.map(m => `
                            <tr>
                                <td>${new Date(m.createdAt).toLocaleString('fr-FR')}</td>
                                <td>${m.nom}</td>
                                <td>${m.email}</td>
                                <td>${m.sujet}</td>
                                <td style="max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${m.message}</td>
                                <td>
                                    <span class="status-badge ${m.lu ? 'read' : 'unread'}">
                                        ${m.lu ? 'Lu' : 'Non lu'}
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }, 500);
}

const closeAllData = document.getElementById('close-all-data');
if (closeAllData) {
    closeAllData.addEventListener('click', () => {
        const modal = document.getElementById('all-data-modal');
        if (modal) modal.style.display = 'none';
    });
}

// ===================================
// CHANGER MOT DE PASSE
// ===================================
const closeSettings = document.getElementById('close-settings');
if (closeSettings) {
    closeSettings.addEventListener('click', () => {
        const modal = document.getElementById('settings-modal');
        if (modal) modal.style.display = 'none';
    });
}

const changePasswordForm = document.getElementById('change-password-form');
if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) {
            showNotification('Les mots de passe ne correspondent pas', 'error');
            return;
        }

        if (newPassword.length < 4) {
            showNotification('Le mot de passe doit contenir au moins 4 caractères', 'error');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/admin/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await res.json();

            if (res.ok) {
                showNotification('Mot de passe modifié avec succès', 'success');
                document.getElementById('settings-modal').style.display = 'none';
                changePasswordForm.reset();
            } else {
                showNotification(data.error || 'Erreur lors du changement', 'error');
            }
        } catch (err) {
            console.error(err);
            showNotification('Erreur de connexion au serveur', 'error');
        }
    });
}

// ===================================
// EXPORTER LES DONNÉES
// ===================================
function exportData() {
    if (messagesData.length === 0) {
        showNotification('Aucune donnée à exporter', 'error');
        return;
    }

    const csvContent = [
        ['Date', 'Nom', 'Email', 'Sujet', 'Message', 'Statut'].join(','),
        ...messagesData.map(m => [
            new Date(m.createdAt).toLocaleString('fr-FR'),
            `"${m.nom}"`,
            m.email,
            `"${m.sujet}"`,
            `"${m.message.replace(/"/g, '""')}"`,
            m.lu ? 'Lu' : 'Non lu'
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `messages_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    showNotification('Données exportées avec succès', 'success');
}

// ===================================
// INIT
// ===================================
window.addEventListener('DOMContentLoaded', () => {
    const env = location.hostname === 'localhost' ? 'DÉVELOPPEMENT' : 'PRODUCTION';
    console.log('Messages.js chargé - Environnement:', env);
    loadMessages();
});
