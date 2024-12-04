// Gestion des dossiers et fichiers dynamiques
document.getElementById('createFolder').addEventListener('click', () => {
  const folderName = prompt('Nom du dossier :', 'Nouveau Dossier');
  if (folderName) {
    const folderSection = document.getElementById('folderSection');
    const folderDiv = document.createElement('div');
    folderDiv.className = 'flex items-center bg-gray-50 border rounded-lg p-4 shadow hover:bg-gray-200 transition';
    folderDiv.innerHTML = `
      <div class="flex-shrink-0">
        <i class="fas fa-folder text-blue-500 text-4xl"></i>
      </div>
      <div class="ml-4 flex-grow">
        <h4 class="font-bold text-lg truncate">${folderName}</h4>
      </div>
      <div class="flex-shrink-0">
        <i class="fas fa-ellipsis-v text-gray-500 cursor-pointer"></i>
      </div>
    `;
    folderSection.appendChild(folderDiv);
  }
});

document.getElementById('createFile').addEventListener('click', () => {
  const fileName = prompt('Nom du fichier (avec extension) :', 'nouveauFichier.txt');
  const fileSize = prompt('Taille du fichier :', '100 Ko');
  if (fileName && fileSize) {
    const fileSection = document.getElementById('fileSection');
    const fileDiv = document.createElement('div');
    fileDiv.className = 'flex flex-col items-center bg-gray-50 border rounded-lg p-4 shadow hover:bg-gray-200 transition';
    const fileIcon = getFileIcon(fileName);
    fileDiv.innerHTML = `
      <div class="flex-shrink-0">
        <i class="fas ${fileIcon} text-blue-500 text-6xl"></i>
      </div>
      <div class="mt-4 text-center">
        <h4 class="font-bold text-lg">${fileName}</h4>
        <p class="text-gray-500 text-sm">${fileSize}</p>
      </div>
    `;
    fileSection.appendChild(fileDiv);
  }
});

function getFileIcon(fileName) {
  const extension = fileName.split('.').pop().toLowerCase();
  switch (extension) {
    case 'pdf': return 'fa-file-pdf text-red-500';
    case 'doc': case 'docx': return 'fa-file-word text-blue-500';
    case 'xls': case 'xlsx': return 'fa-file-excel text-green-500';
    case 'ppt': case 'pptx': return 'fa-file-powerpoint text-orange-500';
    case 'txt': return 'fa-file-alt text-gray-500';
    case 'js': case 'css': case 'html': return 'fa-file-code text-purple-500';
    default: return 'fa-file text-gray-500';
  }
}