import {getWorks, getCategories} from "./apiConfig.js";


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