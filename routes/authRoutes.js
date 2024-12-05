const express = require('express');
const router = express.Router();
const { checkLogin } = require('../controllers/authController');

// Redirection de la page d'accueil vers /signin
router.get('/', (req, res) => { res.redirect('/signin'); });
router.get('/signin', (req, res) => { res.render('signin', { title: 'Connexion', error: null }); });  
router.post('/signin', checkLogin);

// Déconnexion
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/signin');
});

  
module.exports = router;
