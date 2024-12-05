const SFTPClient = require('ssh2-sftp-client');
const config = require('../config/sftpConfig');

// Fonction pour vérifier les identifiants
async function checkLogin(req, res) {
    const { username, password } = req.body;
    const client = new SFTPClient();
  
    try {
      await client.connect({ ...config, username, password });
      await client.end();
  
      req.session.username = username;
      req.session.password = password;
      res.redirect('/partager/');
    } catch (err) {
      console.error('Erreur de connexion SFTP :', err.message);
      res.render('signin', { 
        title: 'Connexion',
        error: 'Identifiants incorrects. Veuillez réessayer.' // Message d'erreur
      });
    }
  }

module.exports = { checkLogin };
