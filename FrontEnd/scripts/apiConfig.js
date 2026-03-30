//  Base URL configurable via variable d'environnement
const BASE_URL = 'http://localhost:5678/api';
//  Endpoints centralisés
const ENDPOINTS = {
  WORKS: '/works',
  LOGIN: '/users/login',
  CATEGORIES: '/categories'
};
// Fonction utilitaire pour construire l'URL complète
const getEndpoint = (endpoint) => `${BASE_URL}${endpoint}`;


/*Récupération Work API
*    Charge les works depuis le LocalStorage
*       Retourne les works en mémoire en objet
*    Sinon, charge les works depuis l'API avec Fetch
*        Sauvegarde les works chargés dans le LocalStorage
*        Retourne les works
*    Lance Erreur si statut !== 200
*/
export async function getWorks() {
  try {
    // Vérifie si les works sont déjà en LocalStorage
    const storedWorks = JSON.parse(window.localStorage.getItem("works"));
    if (storedWorks) {
      return storedWorks; // Retour si les données sont déjà en cache
    }

    // Sinon, requête GET à l'API sur l'endpoint /works
    const r = await fetch(getEndpoint(ENDPOINTS.WORKS), {
      method: 'GET', // method GET : on lit des données
      headers: { // headers : on accepte JSON
        "Accept": "application/json",
      }
    });

    // Si la requête échoue (statut HTTP non 2xx)
    if (!r.ok) {
      throw new Error('Impossible de contacter le serveur/works');
    }

    // Récupère la réponse JSON
    const works = await r.json();

    // Met en cache dans le LocalStorage pour accélérer les prochaines requêtes
    window.localStorage.setItem("works", JSON.stringify(works));

    // Retourne les données obtenues
    return works;

  } catch (error) {
    // // Gestion des erreurs : affichage dans la console 
    console.error(`Erreur lors du chargement des travaux : ${error}`)
  }
}

/*Récupération Catégories API
*    Charge les categories depuis l'API avec Fetch
*      Retourne les categories en objet
*    Lance Erreur si statut !== 200
*/
export async function getCategories() {
  try {
    // Requête GET à l’API sur l'endpoint /categories
    const r = await fetch(getEndpoint(ENDPOINTS.CATEGORIES), {
      method: 'GET', // method GET : on lit des données
      headers: { // headers : on accepte JSON
        "Accept": "application/json",
      }
    });

    // Si la requête échoue (statut HTTP non 2xx)
    if (!r.ok) {
      throw new Error('Impossible de contacter le serveur/categories')
    }

    // Retourne les données sous forme d'objet JavaScript
    return await r.json();

  } catch (error) {
    // // Gestion des erreurs : affichage dans la console
    console.error(`Erreur lors du chargement des catégories : ${error}`)
  }
}

/* Fonction de connexion utilisateur
*   Paramètre : email et password
*   Retourne un objet
*/
export async function postLogin(email, password) {
  try {
    // Requête POST à l'API sur l'endpoint /users/login
    const r = await fetch(getEndpoint(ENDPOINTS.LOGIN), {
      method: "POST", // method POST : on crée une session
      headers: { // headers : on accepte JSON et on envoie JSON
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password }) // body : email et password encodés en JSON
    });

    // Si la requête échoue (identifiants invalides)
    if (!r.ok) {
      // Retourne un objet indiquant succès false et message
      return { success: false, message: "Identifiants incorrects." };
    }

    // Récupération des données de réponse (token)
    const data = await r.json();

    // Stockage du token dans le localStorage pour maintenir la session
    localStorage.setItem("token", data.token);
    // Retourne un objet indiquant succès true et token
    return { success: true, token: data.token };

  } catch (error) {
    // // Gestion des erreurs : affichage dans la console 
    console.error("Erreur lors de la connexion :", error);
    // Retourne un objet indiquant succès false et message
    return { success: false, message: "Erreur de connexion au serveur." };
  }
}

/* Supprime un Work via l'API
*   Met à jour le localStorage
*   Paramètre: id (identifiant du work à supprimer)
*   Retourne un array des works mis à jour. Null en cas d'erreur
*/
export async function deleteWork(id) {
  try {
    // Récupération du token depuis le localStorage pour authentification
    const token = localStorage.getItem("token");
    if (!token) return null;

    // Requête DELETE à l'API sur l'endpoint /works/:id
    const r = await fetch(`${getEndpoint(ENDPOINTS.WORKS)}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}` // token nécessaire pour API sécurisée
      }
    });

    // Si la requête échoue 
    if (!r.ok) {
      throw new Error('La session a expiré ou le work est introuvable.');
    }

    // Nouvelle requête GET pour récupérer la liste actualisée des works
    const refreshed = await fetch(getEndpoint(ENDPOINTS.WORKS));
    const works = await refreshed.json();
    // Mise à jour du localStorage avec la liste actualisée
    localStorage.setItem("works", JSON.stringify(works));

    // Retourne les works mis à jour
    return works;

  } catch (error) {
    // Gestion des erreurs : affichage dans la console 
    console.error(`Erreur lors de la suppression du work :`, error);
    // Retourne null
    return null;
  }
}

/* Ajoute un nouveau Works via l'API
*  Met à jour le localStorage
*  Paramètre : formData fourni lors du submit du formulaire d'ajout
*  Retourne le nouveau work
*/
export async function addWork(formData) {
  try {
    // Récupération du token depuis le localStorage pour authentification
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Vous devez être connecté·e.");

    // Requête POST à l'API sur l'endpoint /works
    const r = await fetch(getEndpoint(ENDPOINTS.WORKS), {
      method: "POST",
      headers: { // En-tête pour l'authentification
        Authorization: `Bearer ${token}`,
      },
      body: formData, // FormData contenant image, titre, et catégorie
    });

    // Si la requête échoue
    if (!r.ok) {
      throw new Error("Impossible d'ajouter le work.");
    }

    // Retourne le work ajouté
    const newWork = await r.json();
    //ParseInt pour permettre aux filtres de fonctionner avec les newWorks
    newWork.categoryId = parseInt(newWork.categoryId, 10);

    // Récupération de la liste des works
    const works = JSON.parse(localStorage.getItem("works")) || [];
    // Ajouter le nouveau work à la liste existante
    works.push(newWork);
    // Mettre à jour le localStorage avec le nouveau work
    localStorage.setItem("works", JSON.stringify(works));

    // Retourne le nouveau work
    return newWork;

  } catch (error) {
    // Gestion des erreurs : affichage dans la console 
    console.error("Erreur lors de l'ajout du work :", error);
    return null;
  }
}
