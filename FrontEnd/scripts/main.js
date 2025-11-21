
import {handleLoginForm, logout} from "./login.js";
import {displayWorks, displayFilters, resetModal, toggleEdition, checkFormValidity, toggleModal, displayWorksModale, showModalPage} from "./interface.js"
import {getWorks, addWork} from "./apiConfig.js";





// Gestion des Evénements Filtres
    // Création d'une délégation d'évènement sur le parent
        // Vérification du <Button>
    // Supprime la classe "selected" de tous les boutons
    // Ajoute la classe "selected" au bouton cliqué
    // Récupère l'id du filtre
    // Récupère tous les travaux (depuis cache ou API)
    // Si "Tous" est cliqué (id=0), on affiche tout
    // Réaffiche les travaux filtrés
const filterButtons = document.getElementById("filters");
if (filterButtons){
    filterButtons.addEventListener("click", async (e) => {
    if (e.target.tagName === "BUTTON") {
        
        const allButtons = filterButtons.querySelectorAll("button");
        allButtons.forEach(btn => btn.classList.remove("selected"));
        
        e.target.classList.add("selected");
        
        const categoryId = parseInt(e.target.dataset.id, 10);
        
        const allWorks = await getWorks();
        
        const filteredWorks = categoryId === 0
            ? allWorks
            : allWorks.filter(work => work.categoryId === categoryId);

        displayWorks(filteredWorks);
    }
    });
}

//Gestion du login
const loginForm = document.getElementById("login");
if (loginForm) {
    loginForm.addEventListener("submit", handleLoginForm);
}

//Gestion du logout
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn){
    logoutBtn.addEventListener("click", logout);
}

//Affichage de la modale
const modalTriggers = document.querySelectorAll(".modal-trigger");
if (modalTriggers){
    modalTriggers.forEach(trigger => trigger.addEventListener("click", toggleModal));
    displayWorksModale();
}

// Bouton de Toggle Modale 1 & 2
const modaleFirstPage = document.querySelector(".switch-modal");
if (modaleFirstPage){
modaleFirstPage.addEventListener('click', () => {
  showModalPage("add-modal");
});
}

const modaleSecondPage = document.getElementById("arrowReturn");
if (modaleSecondPage){
modaleSecondPage.addEventListener('click', () => {
  showModalPage("delete-modal");
  resetModal();
});
}


// Aperçu image modale
const imageInput = document.getElementById("image-input");
const uploadContent = document.querySelector(".upload-content");
const imagePreview = document.getElementById("img-preview");
const titleInput = document.getElementById("titre");
const categorySelect = document.getElementById("categorie");
if (imageInput&&uploadContent&&imagePreview&&titleInput&&categorySelect) {
    imageInput.addEventListener("change", () => {
        const file = imageInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.style.display = "block";
            uploadContent.style.display = "none"; // cacher la zone bleue
        };
        reader.readAsDataURL(file);

        checkFormValidity();
    });

    titleInput.addEventListener("input", checkFormValidity);
    categorySelect.addEventListener("change", checkFormValidity);
}

//Gestion Ajout Travaux
const form = document.querySelector(".modal-form");
if(form) {
    form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const imageInput = document.getElementById("image-input");
    const titleInput = document.getElementById("titre");
    const categorySelect = document.getElementById("categorie");

    // Vérifier qu'il y a bien une image
    if (!imageInput.files[0]) return;

    // Préparer le FormData
    const formData = new FormData();
    formData.append("image", imageInput.files[0]);
    formData.append("title", titleInput.value.trim());
    formData.append("category", categorySelect.value); // categoryId
    
    // Appel à l'API
    const newWork = await addWork(formData);
       
    if (newWork) {
        // Mettre à jour la galerie principale et la modale
        const works = JSON.parse(localStorage.getItem("works"));
        displayWorks(works);       // galerie principale
        displayWorksModale(works); // galerie modale

        // Réinitialiser le formulaire
        resetModal();
    }
    });
}

//Initialisation

toggleEdition();
displayWorks();
displayFilters();    
    




