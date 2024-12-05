require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');

const app = express();
const PORT = 5000;

// Configuration du moteur de vue
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public/views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'votre_secret',
  resave: false,
  saveUninitialized: true,
}));

// Routes
app.use('/', authRoutes);
app.use('/', fileRoutes);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
