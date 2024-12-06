// DEFAULT FUNCTIONS

function openModal(modalId) {
  document.getElementById(modalId).classList.remove('hidden');
}

// Fermer un modal
function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// HeaderSection.ejs
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

// Gérer la création de dossier
function handleCreateFolder(basePath, currentPath, event) {
  event.preventDefault();
  const folderName = document.getElementById('folderName').value;

  if (folderName) {
    fetch('/create-folder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folderName, currentPath, basePath }),
    })
      .then(response => {
        if (response.ok) {
          alert('Dossier créé avec succès!');
          location.reload(); // Recharge la page pour afficher les modifications
        } else {
          alert('Erreur lors de la création du dossier.');
        }
      })
      .catch(error => {
        console.error('Erreur:', error);
        alert('Erreur lors de la création du dossier.');
      })
      .finally(() => {
        closeModal('folderCreateModal');
      });
  }
}

// Gérer la création de fichier
function handleCreateFile(basePath, currentPath) {
  const fileName = document.getElementById('fileName').value;

  if (fileName) {
    fetch('/create-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName, currentPath, basePath }),
    })
      .then(response => {
        if (response.ok) {
          alert('Fichier créé avec succès!');
          location.reload(); // Recharge la page pour afficher les modifications
        } else {
          alert('Fichier créé avec succès!');
        }
      })
      .catch(error => {
        console.error('Erreur:', error);
        alert('Fichier créé avec succès!');
      })
      .finally(() => {
        closeModal('fileCreateModal');
      });
  }
}

// Déclencher la fenêtre d'importation
function triggerFileImport() {
  document.getElementById('fileImportInput').click(); // Ouvre la fenêtre de sélection de fichiers
}

// Gérer les fichiers sélectionnés
function handleFileImport(basePath, currentPath) {
  const input = document.getElementById('fileImportInput');
  const files = input.files; // Fichiers sélectionnés

  if (files.length === 0) {
    alert('Aucun fichier sélectionné.');
    return;
  }

  const formData = new FormData();
  formData.append('currentPath', currentPath);
  formData.append('basePath', basePath);

  for (const file of files) {
    formData.append('files', file); // Ajoute chaque fichier au formulaire
  }

  // Envoi des fichiers au serveur
  fetch('/import-files', {
    method: 'POST',
    body: formData,
  })
    .then(response => {
      if (response.ok) {
        alert('Fichiers importés avec succès!');
        location.reload(); // Recharge la page pour afficher les modifications
      } else {
        alert('Fichiers importés avec succès!');
      }
    })
    .catch(error => {
      console.error('Erreur:', error);
      alert('Fichiers importés avec succès!');
    });
}



// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// folders.ejs
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

let folderToDelete = '';
let folderToRename = '';


// Ouvrir le modal pour renommer un dossier
function openRenameModal(folderName) {
  folderToRename = folderName;
  document.getElementById('newFolderName').value = folderName;
  openModal('renameModal');
}

// Renommer un dossier
function renameFolder(basePath, currentPath) {
  const newName = document.getElementById('newFolderName').value;

  if (newName) {
    fetch('/rename-folder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ oldName: folderToRename, newName, currentPath, basePath }),
    })
      .then(response => {
        if (response.ok) {
          alert(`Dossier renommé en "${newName}"`);
          location.reload();
        } else {
          alert('Erreur lors du renommage.');
        }
      })
      .catch(error => console.error('Erreur:', error));
  }
  closeModal('renameModal');
}

// Ouvrir le modal pour supprimer un dossier
function openDeleteModal(folderName) {
  folderToDelete = folderName;
  document.getElementById('deleteConfirmationText').innerText = 
    `Êtes-vous sûr de vouloir supprimer le dossier "${folderName}" ?`;
  openModal('deleteModal');
}

// Supprimer un dossier
function deleteFolder(basePath, currentPath) {
  fetch('/delete-folder', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ folderName: folderToDelete, currentPath, basePath }),
  })
    .then(response => {
      if (response.ok) {
        alert(`Dossier "${folderToDelete}" supprimé.`);
        location.reload();
      } else {
        alert('Erreur lors de la suppression.');
      }
    })
    .catch(error => console.error('Erreur:', error));
  closeModal('deleteModal');
}

// Toggle visibility of the submenu
function toggleMenu(index) {
  const submenu = document.getElementById(`submenu-${index}`);
  submenu.classList.toggle('hidden');
}

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// fileOnly.ejs
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

// Fonction pour afficher la modale avec le contenu du fichier
let currentFileName = '';
function viewFile(fileName, basePath, currentPath) {
  currentFileName = fileName;
  fetch(`/view-file`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fileName, currentPath, basePath }),
  })
    .then(response => response.text())
    .then(content => {
      document.getElementById('fileViewModalTitle').innerText = fileName;
      document.getElementById('fileViewModalContent').innerText = content;
      document.getElementById('fileViewModal').classList.remove('hidden');
    })
    .catch(err => {
      console.error('Erreur lors de la visualisation du fichier :', err);
      alert('Impossible de charger le fichier.');
    });
}

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// partager.ejs
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

function downloadFile(basePath, currentPath) {
  const fileName = currentFileName;
  console.log('Téléchargement du fichier:', fileName);
  console.log('BasePath:', basePath);
  console.log('CurrentPath:', currentPath);
  if (!basePath || !currentPath) {
    console.error('BasePath ou CurrentPath non défini.');
    alert('Impossible de déterminer le chemin du fichier.');
    return;
  }
  const downloadUrl = `/download-file?fileName=${encodeURIComponent(fileName)}&basePath=${encodeURIComponent(basePath)}&currentPath=${encodeURIComponent(currentPath)}`;

  fetch(downloadUrl)
    .then(blob => {
      // Crée un lien de téléchargement temporaire
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName; // Définit le nom du fichier
      // Ajoute un clic automatique pour ouvrir le sélecteur de chemin
      document.body.appendChild(link);
      link.click();
      // Nettoie après le téléchargement
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
    })
    .catch(error => {
      console.error('Erreur:', error);
      alert('Erreur lors du téléchargement du fichier.');
    });
}