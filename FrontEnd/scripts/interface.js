import {getWorks, getCategories, deleteWork} from "./apiConfig.js";


// Affichage Works
    // Récupère un Array de works
    // Si des éléments sont déjà présents dans la div.gallery, le contenu de la div est réinitialisé
    // Pour chaque work dans works
        // Crée une <figure> avec class=categoryId
        // Crée une <img> avec src=imageUrl et alt=title
        // Crée une <figcaption> avec contenu=title
    // Injecte les balises enfants dans le DOM

export async function displayWorks(work) {

    const gallery = document.querySelector(".gallery"); 
    if (!gallery) return;

    let works = work || await getWorks();
    gallery.innerHTML = ""

    works.forEach(({imageUrl, title, categoryId}) => {
        const newWork = document.createElement("figure");
        newWork.dataset.id = categoryId;

        const newImage = document.createElement("img");
        newImage.src = imageUrl;
        newImage.alt = title;

        const newWorkCaption = document.createElement("figcaption")
        newWorkCaption.innerText = title;

        gallery.appendChild(newWork);
        newWork.appendChild(newImage);
        newWork.appendChild(newWorkCaption);
    })
}

// Affichage Filtres
    // Récupère un Array de works
    // Si des éléments sont déjà présents dans la div#filters, le contenu de la div est réinitialisé
    // Si user est connecté, les filtres ne s'affichent pas
    // Crée un <button> avec contenu="Tous" et class="selected 0"
    // Crée un <bouton> Filtre pour chaque catégorie
    // Injecte les balises enfants dans le DOM

export async function displayFilters() {
    const filterButtons = document.getElementById("filters");
    if (!filterButtons) return;

    let categories = await getCategories();
    if(!categories) return

    filterButtons.innerHTML = ""
    
    if (window.sessionStorage.getItem("token")) {
        filterButtons.style.display = "none";
        return;
    }

    const allCategoriesButton = document.createElement("button")
    allCategoriesButton.dataset.id = "0";
    allCategoriesButton.classList.add("selected");
    allCategoriesButton.innerText = "Tous";
    filterButtons.appendChild(allCategoriesButton);

    categories.forEach(({name, id}) => {
         const newFilter = document.createElement("button");
         newFilter.dataset.id = id;
         newFilter.innerText = name;
         filterButtons.appendChild(newFilter);
    })

    const token = localStorage.getItem("token");
    const gallery = document.querySelector(".gallery");
    const filters = document.getElementById("filters");
      if (token){
        filters.style.display = "none";
        gallery.style.marginTop = "90px";
      }
}


export function displayError(message) {
  const container = document.querySelector(".error-message-container");
  if (!container) return;

  const oldError = container.querySelector(".error-message");
  if (oldError) oldError.remove();

  if (!message) return; 

  const errorDiv = document.createElement("div");
  errorDiv.classList.add("error-message");
  errorDiv.textContent = message;
  container.style.display = "flex"

  Object.assign(errorDiv.style, {
    color: "#d63031",
    fontSize: "1.1em",
    fontWeight: 700
  });

  container.appendChild(errorDiv);
}

export function toggleEdition() {
  const token = localStorage.getItem("token");
  const isEditor = !!token; // true si token présent

  // Barre d’édition
  const editionBar = document.querySelector(".edition-bar");
  if (editionBar) {
    editionBar.style.display = isEditor ? "flex" : "none";
  }

  // Mode édition
  const edition = document.querySelectorAll(".edition");
  edition.forEach(el => {
    el.style.display = isEditor ? "initial" : "none";
  });

 

  // Mode visiteur
  const visitor = document.querySelectorAll(".visitor");
  visitor.forEach(el => {
    el.style.display = isEditor ? "none" : "initial";
  });
}

//Affichage Modale

export function toggleModal() {
    const modalContainer = document.querySelector(".modal-container");

    // La modale est-elle en train de s'ouvrir ou de se fermer ?
    const isOpening = !modalContainer.classList.contains("active");

    // Toggle l'état
    modalContainer.classList.toggle("active");

    const firstPage = document.getElementById("delete-modal");
    const secondPage = document.getElementById("add-modal");

    if (isOpening) {
        // On ouvre la modale : on revient toujours à la page 1
        firstPage.style.display = "flex";
        secondPage.style.display = "none";

        // Recharge catégories au cas où
        categoriesSelect();

    } else {
        // 👉 On ferme la modale : on reset la page d’ajout
        resetModal();
    }
}

//Gestion Pages modale

export function showModalPage(pageIdToShow) {
  const pages = document.querySelectorAll(".modal");

  pages.forEach(page => {
    if (page.id === pageIdToShow) {
      page.style.display = 'flex';
    } else {
      page.style.display = 'none';
    }
  });
}

//Affichage Works dans Modale
export async function displayWorksModale(work) {

    const modalGallery = document.querySelector(".modal-gallery"); 
    if (!modalGallery) return;

    let works = work || await getWorks();
    modalGallery.innerHTML = ""

    works.forEach(({imageUrl, title, id, categoryId}) => {
        const newWork = document.createElement("figure");
        newWork.dataset.id = id;
        newWork.dataset.categoryId = categoryId;

        const newImage = document.createElement("img");
        newImage.src = imageUrl;
        newImage.alt = title;

        const trashIcon = document.createElement("i");
        trashIcon.classList.add('fa-solid', 'fa-trash-can', 'trash');
        trashIcon.addEventListener("click", async () => {
            const confirmDelete = window.confirm("Êtes-vous sûr·e de vouloir supprimer ce projet ?");
            if (!confirmDelete) return;
            const updatedWorks = await deleteWork(id);
            if (updatedWorks) {
                displayWorksModale(updatedWorks);
                displayWorks(updatedWorks);
            }
        });

        modalGallery.appendChild(newWork);
        newWork.appendChild(newImage);
        newWork.appendChild(trashIcon);
    })
}

export async function categoriesSelect() {
  const select = document.getElementById("categorie");

  // Réinitialiser (utile si on revient en arrière dans la modale)
  select.innerHTML = '<option value=""></option>';

  try {
    const categories = await getCategories();

    categories.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat.id;
      option.textContent = cat.name;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Erreur chargement catégories :", error);
  }
}


export function checkFormValidity() {
  const imageInput = document.getElementById("image-input");
  const titleInput = document.getElementById("titre");
  const categorySelect = document.getElementById("categorie");
  const submitBtn = document.querySelector(".submit-btn");
    if (imageInput.files.length > 0 && titleInput.value.trim() !== '' && categorySelect.value) {
        submitBtn.disabled = false;
        submitBtn.classList.add("active");
    } else {
        submitBtn.disabled = true;
        submitBtn.classList.remove("active");
    }
}

export function resetModal() {
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