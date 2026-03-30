
import { handleLoginForm, logout } from "./login.js";
import { displayWorks, displayFilters, resetModal, toggleEdition, checkFormValidity, toggleModal, displayWorksModale, showModalPage } from "./interface.js"
import { getWorks, addWork } from "./apiConfig.js";




// Gestion des Filtres
const filterButtons = document.getElementById("filters");
if (filterButtons) {
    // Création d'une délégation d'évènement sur le parent
    filterButtons.addEventListener("click", async (e) => {
        if (e.target.tagName === "BUTTON") {

            // Récupère les filtres crées dynamiquement
            const allButtons = filterButtons.querySelectorAll("button");

            // Enlève la classe "selected"
            allButtons.forEach(btn => btn.classList.remove("selected"));

            // Ajoute la classe "selected" au bouton cliqué
            e.target.classList.add("selected");

            // Récupère l'id du filtre
            const categoryId = parseInt(e.target.dataset.id, 10);

            // Récupère tous les travaux (depuis cache ou API)
            const allWorks = await getWorks();

            // Si "Tous" est cliqué (id=0), on affiche tout
            // Sinon, on flitre par le categoryId
            const filteredWorks = categoryId === 0
                ? allWorks
                : allWorks.filter(work => work.categoryId === categoryId);

            // Réaffiche les travaux filtrés
            displayWorks(filteredWorks);
        }
    });
}

// Gestion du login
// Bouton submit du Login Form
const loginForm = document.getElementById("login");
if (loginForm) {
    loginForm.addEventListener("submit", handleLoginForm);
}

// Gestion du logout
// Bouton Logout de la nav
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();  // Empêche le rechargement de la page
        logout();            // Appelle la fonction de déconnexion
    });
}

// Affichage de la modale
// Trigger sur les éléments du Mode Edition
const modalTriggers = document.querySelectorAll(".modal-trigger");
if (modalTriggers) {
    modalTriggers.forEach(trigger => trigger.addEventListener("click", toggleModal));
    displayWorksModale();
}

// Bouton de Toggle Modale 1 
// Bouton "Ajouter une image"
const modaleFirstPage = document.querySelector(".switch-modal");
if (modaleFirstPage) {
    modaleFirstPage.addEventListener('click', () => {
        showModalPage("add-modal");
    });
}

// Bouton de Toggle Modale 2
// Icone Arrow Return
const modaleSecondPage = document.getElementById("arrowReturn");
if (modaleSecondPage) {
    modaleSecondPage.addEventListener('click', () => {
        showModalPage("delete-modal");
        resetModal();
    });
}

// Gestion upload Image
// Sélection des éléments du DOM liés à l'upload
const imageInput = document.getElementById("image-input"); // input file
const uploadContent = document.querySelector(".upload-content"); // zone d'upload
const imagePreview = document.getElementById("img-preview"); // balise <img> pour prévisualiser
const titleInput = document.getElementById("titre"); // champ titre
const categorySelect = document.getElementById("categorie"); // champ select catégorie

if (imageInput && uploadContent && imagePreview && titleInput && categorySelect) {

    // Événement sur le changement de fichier dans l'input
    imageInput.addEventListener("change", () => {
        const file = imageInput.files[0]; // récupère le fichier sélectionné
        if (!file) return; // si aucun fichier, arrêt de l'exécution

        // Validation taille Image
        const maxSize = 4 * 1024 * 1024; // 4Mo en octets
        if (file.size > maxSize) {
            alert("Le fichier est trop volumineux. Taille maximum : 4Mo");
            imageInput.value = ""; // Réinitialise l'input
            return; // Arrête l'exécution
        }

        // Validation type Image
        const validTypes = ["image/jpeg", "image/jpg", "image/png"];
        if (!validTypes.includes(file.type)) {
            alert("Format non supporté. Utilisez JPG ou PNG uniquement.");
            imageInput.value = ""; // Réinitialise l'input
            return; // Arrête l'exécution
        }

        //Prévisualisation image
        const reader = new FileReader(); // objet pour lire le fichier
        reader.onload = (e) => {
            imagePreview.src = e.target.result; // affiche l'image dans <img>. e.target.result contient la Data URL
            imagePreview.style.display = "block"; // rend visible la prévisualisation
            uploadContent.style.display = "none"; // cache le formulaire d'image
        };
        reader.readAsDataURL(file); // lecture du fichier en base64

        // Vérifie la validité du formulaire pour activer le bouton "Valider"
        checkFormValidity();
    });

    // Vérifie la validité du formulaire pour activer le bouton "Valider"
    titleInput.addEventListener("input", checkFormValidity);
    categorySelect.addEventListener("change", checkFormValidity);
}

//Gestion Ajout Travaux
// Sélection du formulaire d'ajout de work
const form = document.querySelector(".modal-form");
if (form) {
    // Ajout d'un événement sur le submit du formulaire
    form.addEventListener("submit", async (e) => {
        e.preventDefault(); // Empêche le rechargement par défaut de la page

        // Récupération des champs du formulaire
        const imageInput = document.getElementById("image-input");
        const titleInput = document.getElementById("titre");
        const categorySelect = document.getElementById("categorie");

        // Vérifie qu'il y a bien une image
        if (!imageInput.files[0]) return;

        // Prépare le FormData et ses données
        const formData = new FormData();
        formData.append("image", imageInput.files[0]); // le fichier sélectionné
        formData.append("title", titleInput.value.trim()); // titre
        formData.append("category", categorySelect.value); // categoryId

        // Envoie des données à l'API
        const newWork = await addWork(formData);

        // Si l'ajout a réussi
        if (newWork) {
            // Récupération de la liste mise à jour des works depuis le localStorage
            const works = JSON.parse(localStorage.getItem("works"));
            // Mettre à jour la galerie principale et la modale
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





