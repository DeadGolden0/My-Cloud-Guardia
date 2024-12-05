const SFTPClient = require('ssh2-sftp-client');
const path = require('path');
const fs = require('fs');

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
async function listerFichiers(req, res, relativePath = '') {
  const client = await connectSFTP(req);
  try {
    const absolutePath = `/home/${req.session.username}/${relativePath || ''}`;
    const fileList = await client.list(absolutePath);
    return fileList.length > 0 ? fileList : [];
  } catch (err) {
    throw new Error(err.message);
  } finally {
    client.end();
  }
}

// Créer un dossier
async function createFolder(req, res) {
  const { folderName, currentPath } = req.body;
  if (!validatePath(folderName) || !validatePath(currentPath)) {
    return res.status(400).send('Nom ou chemin invalide.');
  }

  const client = await connectSFTP(req);
  try {
    const absolutePath = `/home/${req.session.username}/${currentPath || ''}/${folderName}`;
    await client.mkdir(absolutePath, true);
    res.redirect(`/partager/${currentPath || ''}`);
  } catch (err) {
    console.error('Erreur lors de la création du dossier :', err.message);
    res.status(500).send('Erreur lors de la création du dossier.');
  } finally {
    client.end();
  }
}

// Créer un fichier
async function createFile(req, res) {
    const { fileName, currentPath } = req.body;
  
    // Validation des noms
    if (!validatePath(fileName) || !validatePath(currentPath)) {
      return res.status(400).send('Nom de fichier ou chemin invalide.');
    }
  
    const client = await connectSFTP(req);
    try {
      const filePath = `/home/${req.session.username}/${currentPath || ''}/${fileName}`;
      await client.put(Buffer.from(''), filePath); // Crée un fichier vide
      res.redirect(`/partager/${currentPath || ''}`); // Redirige vers le chemin actuel
    } catch (err) {
      console.error('Erreur lors de la création du fichier :', err.message);
      res.status(500).send('Erreur lors de la création du fichier.');
    } finally {
      client.end();
    }
}

async function downloadFile(req, res) {
  const { fileName, currentPath } = req.query; // Récupération des paramètres
  const client = new SFTPClient();

  try {
    await client.connect({
      host: process.env.SFTP_HOST,
      port: parseInt(process.env.SFTP_PORT, 10),
      username: req.session.username,
      password: req.session.password,
    });

    const remotePath = `/home/${req.session.username}/${currentPath}/${fileName}`;
    const localTempPath = path.join(__dirname, 'temp', fileName);

    // Assurez-vous que le répertoire temporaire existe
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Téléchargement du fichier dans le répertoire temporaire
    await client.fastGet(remotePath, localTempPath);
    await client.end();

    // Envoi du fichier au client pour téléchargement
    res.download(localTempPath, fileName, (err) => {
      if (err) {
        console.error('Erreur lors du téléchargement du fichier :', err.message);
        res.status(500).send('Erreur lors du téléchargement du fichier.');
      } else {
        // Supprimez le fichier temporaire après téléchargement
        fs.unlinkSync(localTempPath);
      }
    });
  } catch (err) {
    console.error('Erreur lors du téléchargement du fichier :', err.message);
    res.status(500).send('Erreur lors du téléchargement du fichier.');
  }
}
  

// Supprimer un dossier
async function deleteFolder(req, res) {
  const { folderName, currentPath } = req.body;
  if (!validatePath(folderName) || !validatePath(currentPath)) {
    return res.status(400).send('Nom ou chemin invalide.');
  }

  const client = await connectSFTP(req);
  try {
    const folderPath = `/home/${req.session.username}/${currentPath || ''}/${folderName}`;
    await client.rmdir(folderPath, true);
    res.redirect(`/partager/${currentPath || ''}`);
  } catch (err) {
    console.error('Erreur lors de la suppression :', err.message);
    res.status(500).send('Erreur lors de la suppression du dossier.');
  } finally {
    client.end();
  }
}

// Renommer un dossier
async function renameFolder(req, res) {
  const { oldName, newName, currentPath } = req.body;
  if (!validatePath(oldName) || !validatePath(newName) || !validatePath(currentPath)) {
    return res.status(400).send('Nom ou chemin invalide.');
  }

  const client = await connectSFTP(req);
  try {
    const oldPath = `/home/${req.session.username}/${currentPath || ''}/${oldName}`;
    const newPath = `/home/${req.session.username}/${currentPath || ''}/${newName}`;
    await client.rename(oldPath, newPath);
    res.redirect(`/partager/${currentPath || ''}`);
  } catch (err) {
    console.error('Erreur lors du renommage :', err.message);
    res.status(500).send('Erreur lors du renommage du dossier.');
  } finally {
    client.end();
  }
}

// Visualiser un fichier
async function viewFile(req, res) {
  const { fileName, currentPath } = req.body;
  if (!validatePath(fileName) || !validatePath(currentPath)) {
    return res.status(400).send('Nom ou chemin invalide.');
  }

  const client = await connectSFTP(req);
  try {
    const remotePath = `/home/${req.session.username}/${currentPath || ''}/${fileName}`;
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
  const { currentPath } = req.body;
  const client = new SFTPClient();
  const uploadPath = `/home/${req.session.username}/${currentPath}`; // Destination sur le serveur

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send('Aucun fichier reçu');
    }

    // Connexion au serveur SFTP
    await client.connect({
      host: process.env.SFTP_HOST,
      port: parseInt(process.env.SFTP_PORT, 10),
      username: req.session.username,
      password: req.session.password,
    });

    for (const file of req.files) {
      const fileName = path.basename(file.originalname); // Récupère uniquement le nom du fichier
      const remotePath = path.posix.join(uploadPath, fileName); // Chemin sur le serveur SFTP

      // Téléchargez le fichier temporaire sur le serveur SFTP
      await client.put(file.path, remotePath);

      // Supprimez le fichier temporaire local
      fs.unlinkSync(file.path);
    }

    await client.end(); // Fermez la connexion SFTP
    res.status(200).send('Fichiers importés avec succès');
  } catch (err) {
    console.error('Erreur lors de l’importation des fichiers :', err.message);
    res.status(500).send('Erreur lors de l’importation des fichiers.');
  }
}

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


module.exports = { listerFichiers, createFolder, createFile, deleteFolder, renameFolder, viewFile, downloadFile, importFiles, getFileIcon };