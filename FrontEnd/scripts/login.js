import { postLogin } from "./apiConfig.js";
import { displayError, toggleEdition } from "./interface.js";


/* Gestion du formulaire de connexion
*  Paramètre : L'évènement de soumission du formulaire
*/
export async function handleLoginForm(event) {
  // Empêche le comportement par défaut du formulaire (rechargement de la page)
  event.preventDefault();

  // Récupère les valeurs saisies dans les champs email et mot de passe
  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value.trim();

  // Vérifie que les champs respectent les critères de validation
  const validation = validateLoginForm(email, password);
  // validateLoginForm renvoie un objet { valid: boolean, message: string }
  if (!validation.valid) {
    displayError(validation.message); // Affiche un message d'erreur si invalide
    return; // Arrête l'exécution si validation échoue
  }

  // Envoie les identifiants à l'API pour tenter la connexion
  const result = await postLogin(email, password);
  // postLogin renvoie un objet { success: boolean, token?: string, message?: string }
  if (!result.success) {
    displayError(result.message); // Affiche un message d'erreur si login échoue
    return; // Arrête l'exécution si connexion échoue
  }

  // Efface les messages d'erreur existants
  displayError("");
  // Active le Mode Edition
  toggleEdition(true);
  // Redirige vers la page principale après une connexion réussie
  window.location.href = "index.html";
}

/* Valide les champs du formulaire de connexion   
 *  Vérifie que les champs email et mot de passe sont remplis, 
 *  et que l'email a un format valide.
 * Paramètre : email et password saisi par le User
 * Retourne un objet contenant valid et message
 */

function validateLoginForm(email, password) {
  // Vérifie si l'email ou le mot de passe est vide
  if (!email || !password) {
    // Si l'un des champs est vide, retourne un objet : invalide
    return { valid: false, message: "Veuillez remplir tous les champs." };
  }

  // Définition d'une expression régulière pour valider le format d'une adresse e-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Vérifie si l'adresse e-mail ne correspond pas au format attendu
  if (!emailRegex.test(email)) {
    // Si le format est incorrect, retourne un objet : invalide
    return { valid: false, message: "Adresse e-mail invalide." };
  }

  // Si toutes les vérifications sont passées, retourne un objet : valide
  return { valid: true };
}

/* Gestion de la déconnexion
*/
export function logout() {
  // Supprime le token stocké dans le localStorage, ce qui déconnecte l'utilisateur
  localStorage.removeItem("token");

  // Met à jour l'affichage de l'interface pour repasser en mode visiteur
  toggleEdition(false);

  // Affiche un message dans la console pour indiquer que la déconnexion a réussi
  console.log("Déconnexion réussie — retour en mode visiteur");

  // Redirige l'utilisateur vers la page d'accueil
  window.location.href = "index.html";
}







