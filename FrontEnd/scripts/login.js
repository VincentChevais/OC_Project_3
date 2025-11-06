import {postLogin} from "./apiConfig.js";
import {displayError, toggleEdition} from "./interface.js";

export async function handleLoginForm(event) {
  event.preventDefault(); 

  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value.trim();

  const validation = validateLoginForm(email, password);
  if (!validation.valid) {
    displayError(validation.message);
    return;
  }

  const result = await postLogin(email, password);
  if (!result.success) {
    displayError(result.message);
    return;
  }

  displayError(""); 
  toggleEdition(true);
  window.location.href = "index.html";
}



function validateLoginForm(email, password) {
  if (!email || !password) {
    return { valid: false, message: "Veuillez remplir tous les champs." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: "Adresse e-mail invalide." };
  }

  return { valid: true };
}

export function logout() {
  localStorage.removeItem("token");
  toggleEdition(false);
  console.log("Déconnexion réussie — retour en mode visiteur");
  window.location.href = "index.html";
}



  



