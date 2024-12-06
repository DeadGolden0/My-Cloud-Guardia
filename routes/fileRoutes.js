const path = require('path');
const express = require('express');
const multer = require('multer');
const { listerFichiers, createFolder, createFile, deleteFolder, renameFolder, viewFile, downloadFile, importFiles, getFileIcon } = require('../controllers/fileController');

const router = express.Router();
const upload = multer({ dest: 'temp/' });

// Route pour afficher les fichiers et dossiers partagés
router.get('/partager/*', async (req, res) => {
  if (!req.session.username || !req.session.password) {
    return res.redirect('/signin');
  }

  const relativePath = req.params[0] || '/'; // Chemin depuis /partager
  const basePath = `/secure/public/`; // Chemin racine pour la route partager

  try {
    const fileList = await listerFichiers(req, res, basePath, relativePath); // Fournit le chemin relatif
    res.render('partager', {
      title: `Espace Partagé - ${relativePath || '/'}`,
      fileList,
      currentPath: relativePath,
      getFileIcon,
    });
  } catch (err) {
    console.error('Erreur lors du chargement des fichiers :', err.message);
    res.status(500).send('Erreur lors du chargement des fichiers.');
  }
});

// Route pour afficher les fichiers et dossiers personnels
router.get('/personnel/*', async (req, res) => {
  if (!req.session.username || !req.session.password) {
    return res.redirect('/signin');
  }

  const relativePath = req.params[0] || '/'; // Chemin depuis /personnel
  const basePath = `/secure/${req.session.username}`; // Chemin racine pour la route personnel

  try {
    const fileList = await listerFichiers(req, res, basePath, relativePath); // Fournit le chemin relatif
    res.render('personnel', {
      title: `Espace Personnel - ${relativePath || '/'}`,
      fileList,
      currentPath: relativePath,
      basePath: basePath,
      getFileIcon,
    });
  } catch (err) {
    console.error('Erreur lors du chargement des fichiers :', err.message);
    res.status(500).send('Erreur lors du chargement des fichiers.');
  }
});

// Routes pour les actions
// Folders
router.post('/create-folder', createFolder);
router.post('/delete-folder', deleteFolder);
router.post('/rename-folder', renameFolder);

// Files
router.post('/create-file', createFile);
router.get('/download-file', downloadFile);
router.post('/view-file', viewFile);

// Import 
router.post('/import-files', upload.array('files'), importFiles);

module.exports = router;
