// apiConfig.js

// // Base URL configurable via variable d'environnement
// const BASE_URL = process.env.API_URL || 'http://localhost:5678/api';
// // Endpoints centralisés
// const ENDPOINTS = {
//   WORKS: '/works',
//   LOGIN: '/users/login',
//   CATEGORIES: '/categories'
// };
// // Fonction utilitaire pour construire l'URL complète
// const getEndpoint = (endpoint) => `${BASE_URL}${endpoint}`;
// export { BASE_URL, ENDPOINTS, getEndpoint };

//Récupération Work API
    //Charge les works depuis le SessionStorage
        //Retourne les works en mémoire
    //Sinon, charge les works depuis l'API avec Fetch
        //Sauvegarde les works chargés dans le SessionStorage
        //Retourne les works
    //Lance Erreur si statut !== 200

export async function getWorks() {
    try {
        const storedWorks = JSON.parse(window.sessionStorage.getItem("works"));
        if (storedWorks){
            return storedWorks;
        }

        const r = await fetch('http://localhost:5678/api/works', {
            method: 'GET',
            headers: {
                "Accept": "application/json",
            }
        });

        if (!r.ok) {
            throw new Error ('Impossible de contacter le serveur/works')
        }
        const works = await r.json();
        window.sessionStorage.setItem("works", JSON.stringify(works));
        return works

    } catch(error) {
        console.error(`Erreur lors du chargement des travaux : ${error}`)
    }
    
}

// Récupération Catégories API
    // Charge les categories depuis l'API avec Fetch
      // Retourne les categories
    // Lance Erreur si statut !== 200

export async function getCategories() {
    try {
        const r = await fetch('http://localhost:5678/api/categories', {
            method: 'GET',
            headers: {
                "Accept": "application/json",
            }
        });

        if (!r.ok) {
            throw new Error ('Impossible de contacter le serveur/categories')  
        }
        return await r.json();

    } catch(error) {
        console.error(`Erreur lors du chargement des catégories : ${error}`)
    }
  }

export async function postLogin(email, password) {
  try {
    const response = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      return { success: false, message: "Identifiants incorrects." };
    }

    const data = await response.json();
    localStorage.setItem("token", data.token); // ✅ stockage du token
    return { success: true, token: data.token };

  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    return { success: false, message: "Erreur de connexion au serveur." };
  }
}
