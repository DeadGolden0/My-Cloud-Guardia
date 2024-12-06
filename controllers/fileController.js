const SFTPClient = require('ssh2-sftp-client');
const path = require('path');
const fs = require('fs');
const { CryptFile, DecryptFile } = require('./remoteController');

// Fonction utilitaire pour valider les chemins et noms
const validatePath = (path) => {
  const invalidCharacters = /[<>:"|?*\0]/;
  return !invalidCharacters.test(path);
};

// Fonction utilitaire pour connecter au SFTP
async function connectSFTP(req) {
  const client = new SFTPClient();
  await client.connect({
    host: process.env.SFTP_HOST,
    port: parseInt(process.env.SFTP_PORT, 10),
    username: req.session.username,
    password: req.session.password,
  });
  return client;
}

// Lister les fichiers/dossiers
async function listerFichiers(req, res, basePath, relativePath = '') {
  const client = await connectSFTP(req);
  try {
    const absolutePath = path.posix.join(basePath, relativePath || '');
    const fileList = await client.list(absolutePath);
    const filteredList = fileList.filter(file => file.name !== 'temp');
    return filteredList.length > 0 ? filteredList : [];
  } catch (err) {
    throw new Error(`Erreur lors de la liste des fichiers : ${err.message}`);
  } finally {
    client.end();
  }
}

// Créer un dossier
async function createFolder(req, res) {
  const { folderName, currentPath, basePath } = req.body;
  if (!validatePath(folderName) || !validatePath(currentPath)) {
    return res.status(400).send('Nom ou chemin invalide.');
  }

  const client = await connectSFTP(req);
  try {
    const absolutePath = path.posix.join(basePath, currentPath || '', folderName);
    await client.mkdir(absolutePath, true);
    res.redirect(req.headers.referer || '/');
  } catch (err) {
    console.error('Erreur lors de la création du dossier :', err.message);
    res.status(500).send('Erreur lors de la création du dossier.');
  } finally {
    client.end();
  }
}

// Créer un fichier
async function createFile(req, res) {
  const { fileName, currentPath, basePath } = req.body;

  if (!validatePath(fileName) || !validatePath(currentPath)) {
    return res.status(400).send('Nom ou chemin invalide.');
  }

  const client = await connectSFTP(req);
  try {
    const filePath = path.posix.join(basePath, currentPath || '', fileName);
    //await client.put(Buffer.from(''), filePath);
    await client.put(Buffer.from(''), "/secure/tmp/" + fileName); // Création du fichier dans le dossier temporaire

    const destinationPath = path.posix.join(basePath, currentPath || '');
    await CryptFile(fileName, req.session.password, req.session.username, destinationPath); // Cryptage du fichier

    res.redirect(req.headers.referer || '/'); // Redirige vers la page actuelle
  } catch (err) {
    console.error('Erreur lors de la création du fichier :', err.message);
    res.status(200).send('Erreur lors de la création du fichier.');
  } finally {
    client.end();
  }
}

// Télécharger un fichier
async function downloadFile(req, res) {
  const { fileName, currentPath, basePath } = req.query; // Ajout de basePath ici
  if (!fileName || !currentPath || !basePath) {
      return res.status(400).send('Paramètres manquants.');
  }

  const client = await connectSFTP(req);
  try {
      // Tenter de décrypter le fichier
      try {
          const destinationPath = path.posix.join(basePath, currentPath || '');
          await DecryptFile(fileName, req.session.password, req.session.username, destinationPath);
          console.log(`Fichier ${fileName} décrypté avec succès.`);
      } catch (decryptErr) {
          console.error(`Erreur lors du décryptage du fichier ${fileName} :`, decryptErr.message);
      }

      const remotePath = path.posix.join("/secure/tmp/", fileName); // Téléchargement du fichier dans le dossier temporaire
      const localTempPath = path.join(__dirname, 'temp', fileName);

      if (!fs.existsSync(path.dirname(localTempPath))) {
          fs.mkdirSync(path.dirname(localTempPath), { recursive: true });
      }

      await client.fastGet(remotePath, localTempPath);
      res.download(localTempPath, fileName, (err) => {
          if (err) {
              console.error('Erreur lors du téléchargement du fichier :', err.message);
              res.status(200).send('Erreur lors du téléchargement.');
          } else {
              fs.unlinkSync(localTempPath); // Nettoyage du fichier temporaire
          }
      });
  } catch (err) {
      console.error('Erreur lors du téléchargement du fichier :', err.message);
      res.status(200).send('Erreur lors du téléchargement.');
  } finally {
      client.end();
  }
}


// Supprimer un dossier
async function deleteFolder(req, res) {
  const { folderName, currentPath, basePath } = req.body;
  if (!validatePath(folderName) || !validatePath(currentPath)) {
    return res.status(400).send('Nom ou chemin invalide.');
  }

  const client = await connectSFTP(req);
  try {
    const folderPath = path.posix.join(basePath, currentPath || '', folderName);
    await client.rmdir(folderPath, true);
    res.redirect(req.headers.referer || '/');
  } catch (err) {
    console.error('Erreur lors de la suppression :', err.message);
    res.status(500).send('Erreur lors de la suppression du dossier.');
  } finally {
    client.end();
  }
}

// Renommer un dossier
async function renameFolder(req, res) {
  const { oldName, newName, currentPath, basePath } = req.body;
  if (!validatePath(oldName) || !validatePath(newName) || !validatePath(currentPath)) {
    return res.status(400).send('Nom ou chemin invalide.');
  }

  const client = await connectSFTP(req);
  try {
    const oldPath = path.posix.join(basePath, currentPath || '', oldName);
    const newPath = path.posix.join(basePath, currentPath || '', newName);
    await client.rename(oldPath, newPath);
    res.redirect(req.headers.referer || '/');
  } catch (err) {
    console.error('Erreur lors du renommage :', err.message);
    res.status(500).send('Erreur lors du renommage du dossier.');
  } finally {
    client.end();
  }
}

// Visualiser un fichier
async function viewFile(req, res) {
  const { fileName, currentPath, basePath } = req.body;
  if (!validatePath(fileName) || !validatePath(currentPath)) {
    return res.status(400).send('Nom ou chemin invalide.');
  }

  const client = await connectSFTP(req);
  try {
    const remotePath = path.posix.join(basePath, currentPath || '', fileName);
    const fileContent = await client.get(remotePath);
    res.send(fileContent.toString());
  } catch (err) {
    console.error('Erreur lors de la visualisation du fichier :', err.message);
    res.status(500).send('Erreur lors de la visualisation du fichier.');
  } finally {
    client.end();
  }
}

// Importer des fichiers
async function importFiles(req, res) {
  const { currentPath, basePath } = req.body;
  const client = await connectSFTP(req);

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send('Aucun fichier reçu.');
    }

    const destinationPath = path.posix.join(basePath, currentPath || '');
    const uploadPath = "/secure/tmp"; // Importation des fichiers dans le dossier temporaire

    for (const file of req.files) {
      const fileName = path.basename(file.originalname);
      const remotePath = path.posix.join(uploadPath, fileName);

      await client.put(file.path, remotePath);
      
      await CryptFile(fileName, req.session.password, req.session.username, destinationPath);

      fs.unlinkSync(file.path);
    }

    res.status(200).send('Fichiers importés avec succès.');
  } catch (err) {
    res.status(200).send('Fichiers importés avec succès.');
  } finally {
    client.end();
  }
}

// Icône des fichiers
function getFileIcon(fileName) {
  const extension = fileName.split('.').pop().toLowerCase();
  switch (extension) {
    case 'pdf': return 'fa-file-pdf text-red-500';
    case 'doc': case 'docx': return 'fa-file-word text-blue-500';
    case 'xls': case 'xlsx': return 'fa-file-excel text-green-500';
    case 'ppt': case 'pptx': return 'fa-file-powerpoint text-orange-500';
    case 'txt': return 'fa-file-alt text-gray-500';
    case 'js': case 'css': case 'html': return 'fa-file-code text-purple-500';
    case 'png': case 'jpg': case 'jpeg': case 'gif': return 'fa-file-image text-pink-500';
    default: return 'fa-file-lines text-blue-500';
  }
}

module.exports = {
  listerFichiers,
  createFolder,
  createFile,
  deleteFolder,
  renameFolder,
  viewFile,
  downloadFile,
  importFiles,
  getFileIcon,
};
