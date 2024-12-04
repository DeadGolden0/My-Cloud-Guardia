const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const Client = require('ssh2-sftp-client');

const app = express();
const PORT = 5000;

// Middleware pour servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true })); // Pour traiter les données du formulaire

// Route pour le SignIN
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/views', 'signin.html'));
});

// Route pour le Dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/views', 'dashboard.html'));
});

// Traitement des informations de connexion pour l'accès SFTP
app.post('/signin', async (req, res) => {
  const { username, password } = req.body;

  const sftp = new Client();
  const config = {
    host: '10.10.1.23',
    port: 22, // Par défaut pour SFTP
    username: username,
    password: password,
  };

  try {
    // Connexion au serveur SFTP
    await sftp.connect(config);

    // Lister les fichiers et dossiers dans le répertoire de l'utilisateur
    const fileList = await sftp.list('/home/serveur-fichier/Drive'); // Changez '/' par le chemin souhaité si nécessaire

    // Déconnecter SFTP après récupération des fichiers
    await sftp.end();

    // Envoyer la liste des fichiers et dossiers au client
    res.send(`
      <h1>Fichiers et dossiers disponibles</h1>
      <ul>
        ${fileList.map(file => `<li>${file.name} (${file.type})</li>`).join('')}
      </ul>
      <a href="/">Retour</a>
    `);
  } catch (err) {
    console.error('Erreur de connexion SFTP :', err.message);
    res.status(500).send('Échec de connexion au serveur SFTP. Vérifiez vos identifiants.');
  }
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
