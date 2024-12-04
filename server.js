const express = require('express');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware pour servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Route pour le Dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/views', 'dashboard.html'));
});

// Route pour l'Espace Personnel
app.get('/personnel', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/views', 'personnel.html'));
});

// Route pour l'Espace Partagé
app.get('/partager', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/views', 'partager.html'));
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
