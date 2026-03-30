import { getWorks, getCategories, deleteWork } from "./apiConfig.js";


/* Affichage de la gallerie de travaux (Works) dans la page.
*     Récupère un Array de works
*     Crée dynamiquement les éléments HTML pour les afficher dans la div.gallery.
*     Si aucun tableau n’est fourni en argument, elle appelle getWorks()
*     pour récupérer les travaux depuis le localStorage ou l’API.
*/
export async function displayWorks(work) {
  // Récupère la div qui contiendra les travaux
  const gallery = document.querySelector(".gallery");
  if (!gallery) return; // Sort si la galerie n'existe pas dans le DOM

  // Utilise le tableau fourni ou récupère les travaux via getWorks()
  let works = work || await getWorks();
  gallery.innerHTML = ""; // Réinitialise le contenu de la galerie pour éviter les doublons

  // Parcourt chaque work pour créer les éléments HTML correspondants
  works.forEach(({ imageUrl, title, categoryId }) => {
    // Crée un <figure> pour chaque work et lui associe la catégorie
    const newWork = document.createElement("figure");
    newWork.dataset.id = categoryId; // stockage de l'id de catégorie pour filtrage

    // Crée l'image avec l'URL et le texte alternatif
    const newImage = document.createElement("img");
    newImage.src = imageUrl;
    newImage.alt = title;

    // Crée un figcaption pour afficher le titre du work
    const newWorkCaption = document.createElement("figcaption");
    newWorkCaption.innerText = title;

    // Injection dans le DOM : figure → img + figcaption
    newWork.appendChild(newImage);
    newWork.appendChild(newWorkCaption);

    // Ajoute le <figure> complet à la galerie
    gallery.appendChild(newWork);
  });
}

/* Affichage Filtres de la gallerie
*   Récupère la liste des catégories depuis l'API
*   Si User est connecté les filtres ne sont pas affichés
*   Crée un bouton "Tous"
*   Crée dynamiquement un bouton pour chaque catégorie
*/
export async function displayFilters() {
  // Récupère le conteneur des filtres
  const filterButtons = document.getElementById("filters");
  if (!filterButtons) return; // Sort si le conteneur n'existe pas

  // Récupère les catégories depuis l'API
  let categories = await getCategories();
  if (!categories) return; // Sort si aucune catégorie n'est trouvée

  // Réinitialise le contenu pour éviter doublons
  filterButtons.innerHTML = "";

  // Si l’utilisateur est connecté, on masque les filtres
  const token = localStorage.getItem("token");
  if (token) {
    filterButtons.style.display = "none"; // masque les filtres
    const gallery = document.querySelector(".gallery");
    if (gallery) gallery.style.marginTop = "90px"; // ajuste l'espace de la galerie
    return;
  }

  // Crée le bouton "Tous" pour afficher toutes les travaux
  const allCategoriesButton = document.createElement("button")
  allCategoriesButton.dataset.id = "0"; // id spécial pour "tous"
  allCategoriesButton.classList.add("selected"); // sélection par défaut
  allCategoriesButton.innerText = "Tous";
  filterButtons.appendChild(allCategoriesButton);

  // Crée un bouton pour chaque catégorie récupérée
  categories.forEach(({ name, id }) => {
    const newFilter = document.createElement("button");
    newFilter.dataset.id = id; // id de la catégorie pour le filtrage
    newFilter.innerText = name; // nom affiché sur le bouton
    filterButtons.appendChild(newFilter);
  })
}

/* Affichage des Erreurs du Login Form
* Crée dynamiquement un message d'erreur
* Prend en paramètre le message fourni
* Applique un style CSS
*/
export function displayError(message) {
  // Sélection du conteneur d'erreur
  const container = document.querySelector(".error-message-container");
  if (!container) return;

  // Supprime l'ancien message s'il existe
  const oldError = container.querySelector(".error-message");
  if (oldError) oldError.remove();

  // Si aucun message n'est fourni, on ne fait rien
  if (!message) return;

  // Création du nouvel élément d'erreur
  const errorDiv = document.createElement("div");
  errorDiv.classList.add("error-message");
  errorDiv.textContent = message; // Ajoute le message d'erreur fourni
  container.style.display = "flex" // Assure que le conteneur est visible

  // Applique des styles CSS directement
  Object.assign(errorDiv.style, {
    color: "#d63031",
    fontSize: "1.1em",
    fontWeight: 700
  });

  // Ajoute l'élément au DOM
  container.appendChild(errorDiv);
}

/* Affiche le mode édition quand User est connecté
*  et le mode visiteur si aucun token n'est présent
*  Rappel : l'affichage des filtres est géré dans displayFilters
*/
export function toggleEdition() {
  // Vérifie si un token est présent => mode édition activé
  const token = localStorage.getItem("token");
  const isEditor = !!token; // true si token présent

  // Affichage de la barre d’édition
  const editionBar = document.querySelector(".edition-bar");
  if (editionBar) {
    editionBar.style.display = isEditor ? "flex" : "none";
  }

  // Affichage des éléments du mode Edition
  const edition = document.querySelectorAll(".edition");
  edition.forEach(el => {
    el.style.display = isEditor ? "initial" : "none";
  });

  // Affichage des éléments du mode Visiteur
  const visitor = document.querySelectorAll(".visitor");
  visitor.forEach(el => {
    el.style.display = isEditor ? "none" : "initial";
  });
}

/* Affichage de la Modale
*   Ouvre et ferme la modale en gérant les deux pages internes
*/
export function toggleModal() {
  // Selection de la modale
  const modalContainer = document.querySelector(".modal-container");
  if (!modalContainer) return; // Sécurité

  // Détermine si la modale s'ouvre
  const isOpening = !modalContainer.classList.contains("active");

  // Toggle l'état : ajoute ou retire la classe active
  modalContainer.classList.toggle("active");

  // Récupération des deux pages internes de la modale
  const firstPage = document.getElementById("delete-modal");
  const secondPage = document.getElementById("add-modal");

  if (isOpening) {
    // On ouvre la modale : on revient par défaut à la page 1
    firstPage.style.display = "flex";
    secondPage.style.display = "none";

    // Charge la liste des catégories dans le select
    categoriesSelect();

  } else {
    // On ferme la modale : on reset le formulaire de la page 2
    resetModal();
  }
}

/* Gestion Pages modale
*   Gère le passage d'une page à une autre
*   Appelée par la gestion d'évènement sur les boutons
*/

export function showModalPage(pageIdToShow) {
  // On récupère les deux pages
  const pages = document.querySelectorAll(".modal");
  if (!pages.length) return; // Sécurité : aucune page trouvée

  pages.forEach(page => {
    // Affiche la page ciblée
    if (page.id === pageIdToShow) {
      page.style.display = 'flex';
    }
    // Masque l'autre page
    else {
      page.style.display = 'none';
    }
  });
}

/* Affichage Works dans la gallerie de la Modale
*     Récupère la liste des works (paramètre optionnel ou via getWorks()).
*     Vide la galerie modale pour éviter les doublons.
*     Pour chaque work : crée un <figure> contenant <img> et un bouton de suppression.
*     Attache un handler au clic du bouton poubelle qui :
*       demande une confirmation à l'utilisateur,
*       appelle deleteWork(id) pour supprimer côté API,
*       si succès, recharge la modale et la galerie principale avec les données mises à jour.
*/
export async function displayWorksModale(work) {
  // Récupère le conteneur de la galerie dans la modale
  const modalGallery = document.querySelector(".modal-gallery");
  if (!modalGallery) return; // Sécurité : quitte si l'élément n'existe pas

  // Utilise le tableau fourni ou récupère les works via l'API / sessionStorage
  let works = work || await getWorks();

  // Vide la galerie pour éviter les doublons d'affichage
  modalGallery.innerHTML = "";

  // Parcours des works pour construire le DOM
  works.forEach(({ imageUrl, title, id, categoryId }) => {

    // Création du conteneur <figure> et stockage des metadata
    const newWork = document.createElement("figure");
    newWork.dataset.id = id; // id du work (utile pour suppression)
    newWork.dataset.categoryId = categoryId; // id de la catégorie

    // Image : src et alt (accessibilité)
    const newImage = document.createElement("img");
    newImage.src = imageUrl;
    newImage.alt = title;

    // Bouton poubelle
    const trashIcon = document.createElement("i");
    trashIcon.classList.add('fa-solid', 'fa-trash-can', 'trash');

    // Evènement au clic sur bouton poubelle
    trashIcon.addEventListener("click", async () => {

      // Confirmation utilisateur
      const confirmDelete = window.confirm("Êtes-vous sûr·e de vouloir supprimer ce projet ?");
      if (!confirmDelete) return;

      // Suppression côté API (deleteWork doit retourner la liste actualisée)
      const updatedWorks = await deleteWork(id);

      // Si suppression réussie, on recharge la modale et la galerie principale
      if (updatedWorks) {
        displayWorksModale(updatedWorks);
        displayWorks(updatedWorks);
      }
      // ICI AJOUTER UNE GESTION ERREUR SI SUPPRESSION ECHOUE GEREE PAR DISPLAYERROR ?
    });

    // Assemblage DOM 
    newWork.appendChild(newImage); // Ajout de l'image
    newWork.appendChild(trashIcon); // Ajout de l'icone
    modalGallery.appendChild(newWork); // Ajout dans la galerie
  });
}

/* Charge le <select> de la page 2 de la modale
*  avec les catégories fournies par l'API
*/
export async function categoriesSelect() {
  // Récupère l'élément <select> où seront ajoutées les catégories
  const select = document.getElementById("categorie");

  // Réinitialiser le contenu de <select>
  select.innerHTML = '<option value=""></option>';

  try {
    // Récupère la liste des catégories (appel API ou cache selon getCategories)
    const categories = await getCategories();

    // Pour chaque catégorie récupérée...
    categories.forEach(cat => {
      const option = document.createElement("option"); // Crée un élément <option>
      option.value = cat.id; // Valeur envoyée dans le formulaire
      option.textContent = cat.name; // Texte affiché dans la liste déroulante
      select.appendChild(option); // Ajoute l'option au <select>
    });
  } catch (error) {

    // Affiche une erreur si les catégories n'ont pas pu être chargées
    console.error("Erreur chargement catégories :", error);
  }
}

/* Vérifie si le formulaire d'ajout de la modale page 2 est rempli
*  La vérification de taille et de type d'image sont faites dans lors de l'ajout d'image
*/
export function checkFormValidity() {
  // Récupération des champs du formulaire
  const imageInput = document.getElementById("image-input"); // Input de l'image uploadée
  const titleInput = document.getElementById("titre"); // Champ texte du titre
  const categorySelect = document.getElementById("categorie"); // Select des catégories
  const submitBtn = document.querySelector(".submit-btn"); // Bouton "Valider"

  // Conditions de validité
  const isValid =
    imageInput.files.length > 0 && // Une image a été sélectionnée
    titleInput.value.trim() !== '' && // Le titre n'est pas vide 
    categorySelect.value; // - Une catégorie est choisie

  if (isValid) {
    // On active le bouton de validation
    submitBtn.disabled = false;
    submitBtn.classList.add("active");
  } else {
    // On désactive le bouton de validation
    submitBtn.disabled = true;
    submitBtn.classList.remove("active");
  }
}

/* Réinitialisation de tous les champs de la modale page 2
* Appelée à chaque fermeture de modale
* ou retour en arrière à la page 1
*/
export function resetModal() {
  // Récupération des éléments dans le DOM
  const imageInput = document.getElementById("image-input");
  const imagePreview = document.getElementById("img-preview");
  const uploadContent = document.querySelector(".upload-content");
  const titleInput = document.getElementById("titre");
  const categorySelect = document.getElementById("categorie");
  const submitBtn = document.querySelector(".submit-btn");

  // Réinitialisation du champ file
  imageInput.value = "";

  // Masquer l’aperçu
  imagePreview.src = "";
  imagePreview.style.display = "none";

  // Réafficher la zone d’upload (bleue)
  uploadContent.style.display = "flex";

  // Réinitialiser les inputs texte / select
  titleInput.value = "";
  categorySelect.value = "";

  // Désactiver le bouton Valider
  submitBtn.disabled = true;
  submitBtn.classList.remove("active");
}