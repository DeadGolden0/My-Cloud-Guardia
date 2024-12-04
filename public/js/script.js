  document.querySelector("button").addEventListener("click", () => {
    alert("Ajoutez un fichier ici !");
  });
  

  // Gestion des clics sur les trois points
  document.querySelectorAll('.fa-ellipsis-v').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const menu = e.target.closest('div').querySelector('.menu-options');
      menu.classList.toggle('hidden');
  
      // Masquer les autres menus ouverts
      document.querySelectorAll('.menu-options').forEach((otherMenu) => {
        if (otherMenu !== menu) {
          otherMenu.classList.add('hidden');
        }
      });
  
      // Arrêter la propagation pour éviter la fermeture immédiate
      e.stopPropagation();
    });
  });
  
  // Cacher le menu si on clique ailleurs
  document.addEventListener('click', () => {
    document.querySelectorAll('.menu-options').forEach((menu) => {
      menu.classList.add('hidden');
    });
  });
  
  
  