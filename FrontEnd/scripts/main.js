
import {handleLoginForm, logout} from "./login.js";
import {displayWorks, displayFilters, toggleEdition} from "./interface.js"
import {getWorks} from "./apiConfig.js";





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
const loginForm = document.querySelector("#login");
if (loginForm) {
    loginForm.addEventListener("submit", handleLoginForm);
}

//Gestion du logout
const logoutBtn = document.getElementById("logout-btn");
console.log(logoutBtn);
if (logoutBtn){
    logoutBtn.addEventListener("click", logout);
}

//Initialisation

toggleEdition();
displayWorks();
displayFilters();    
    




