#!/bin/bash

# Script d'installation automatique pour SK Digitale Admin
# Exécuter avec: bash install.sh

echo "╔════════════════════════════════════════════════════════╗"
echo "║     Installation SK Digitale - Système d'Admin        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher un message de succès
success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Fonction pour afficher un message d'information
info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Fonction pour afficher un message d'erreur
error() {
    echo -e "${RED}✗${NC} $1"
}

# Fonction pour afficher un message d'avertissement
warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Vérifier Node.js
echo ""
info "Vérification de Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    success "Node.js installé: $NODE_VERSION"
else
    error "Node.js n'est pas installé"
    echo "Téléchargez-le depuis: https://nodejs.org/"
    exit 1
fi

# Vérifier npm
info "Vérification de npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    success "npm installé: $NPM_VERSION"
else
    error "npm n'est pas installé"
    exit 1
fi

# Installer les dépendances
echo ""
info "Installation des dépendances..."
npm install
if [ $? -eq 0 ]; then
    success "Dépendances installées avec succès"
else
    error "Erreur lors de l'installation des dépendances"
    exit 1
fi

# Vérifier MongoDB
echo ""
info "Vérification de MongoDB..."
if command -v mongod &> /dev/null; then
    MONGO_VERSION=$(mongod --version | head -1)
    success "MongoDB installé: $MONGO_VERSION"
    
    # Vérifier si MongoDB est en cours d'exécution
    if pgrep -x "mongod" > /dev/null; then
        success "MongoDB est en cours d'exécution"
    else
        warning "MongoDB est installé mais ne semble pas être en cours d'exécution"
        info "Pour démarrer MongoDB:"
        echo "  - Linux/macOS: sudo systemctl start mongodb"
        echo "  - Windows: Démarrez le service MongoDB depuis les Services"
    fi
else
    warning "MongoDB n'est pas installé ou n'est pas dans le PATH"
    echo ""
    echo "Installation de MongoDB:"
    echo "  - Windows: https://www.mongodb.com/try/download/community"
    echo "  - macOS: brew install mongodb-community"
    echo "  - Linux: sudo apt-get install mongodb"
    echo ""
fi

# Copier .env.example vers .env si nécessaire
echo ""
if [ ! -f .env ]; then
    info "Création du fichier .env..."
    cp .env.example .env
    success "Fichier .env créé"
else
    success "Fichier .env existe déjà"
fi

# Créer le dossier public s'il n'existe pas
if [ ! -d "public" ]; then
    info "Création du dossier public..."
    mkdir public
    success "Dossier public créé"
fi

# Résumé
echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║              Installation terminée !                   ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
success "Installation terminée avec succès!"
echo ""
echo "Prochaines étapes:"
echo ""
echo "1. Placez vos fichiers frontend dans le dossier public/:"
echo "   - admin.html"
echo "   - messages.html"
echo "   - folio.js"
echo "   - folio.css"
echo ""
echo "2. (Optionnel) Initialisez la base de données avec des données de test:"
echo "   ${BLUE}node seed-database.js${NC}"
echo ""
echo "3. Démarrez le serveur:"
echo "   ${BLUE}npm start${NC}"
echo ""
echo "4. Accédez à l'application:"
echo "   - Page d'accueil: ${BLUE}http://localhost:3000${NC}"
echo "   - Page admin: ${BLUE}http://localhost:3000/admin${NC}"
echo "   - Identifiants: ${YELLOW}rogar${NC} / ${YELLOW}002rogar${NC}"
echo ""
echo "Pour plus d'informations, consultez README.md ou QUICKSTART.md"
echo ""