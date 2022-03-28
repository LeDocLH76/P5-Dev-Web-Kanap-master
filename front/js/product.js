let pageCourante = window.location.href;
let url = new URL(pageCourante);
// Récupère la valeur du parametre id passé par la page d'appel
let productId = url.searchParams.get("id");
// Adresse de récupération de tout les produits
const listeProduits = "http://localhost:3000/api/products";
// Ajoute un id pour ne recuperer les info que de un produit
const urlUnProduit = listeProduits + "/" + productId;

// Récupération des informations sur un produit.
fetch(urlUnProduit)
    .then(function (res) {
        if (res.ok) {
            return res.json();
        }
    })
    .then(function (value) {
        remplirLeDom(value);
        console.log("Le DOM est rempli.");
        resteDuScript(value);
    })
    .catch(function (err) {
        console.log(err);
    });


// Le reste dans une fonction.

function resteDuScript(value) {
    //Définition de l'objet produit utilisé pour remplir le panier
    const produit = {
        nom: value.name,
        id: productId,
        couleur: "",
        quantite: 0
    };

    //Ecoute le bouton ajouter
    let boutonAjouter = document.getElementById("addToCart");
    boutonAjouter.addEventListener("click", function ajoutePanier() {
        console.log("Clic ajout au panier.");
        //Lire et modifier la couleur du produit courant
        lireCouleur(produit, value);
        //Lire et filtrer la quantité
        quantite = lireQuantite(produit);
        if (produit.couleur == "" | quantite == 0) {
            alert("Veuillez indiquer une couleur et une quantité valide.");
        } else {
            valideArticle(produit);
            console.log("Le produit à été ajouté au panier");
            console.log("Quantité d'article dans le panier = " + lireLocalStorage().length);
            if (confirm(`Il y a maintenant ${lireLocalStorage().length} ${lireLocalStorage().length < 2 ? "référence" : "références"} dans le panier.\nOk pour aller au panier.\nAnnuler pour rester ici.`)) {
                document.location.replace("cart.html");
            } else {
                console.log("Je reste ici !")
            }
        }
        //Efface la quantité sur le formulaire pour éviter une double entrée.
        razQuantite();
    });
    console.log("Attente CTA");
}

// ************* Définitions de fonctions*****************************************

//Compare le produit à ajouter avec ceux contenus dans le loalStorage
// Selon le cas, ajoute le produit, ou modifie la quantité de celui existant
function compareIdLocalStorage(produit) {
    console.log("Fonction compare");
    let contenuLocalStorage = lireLocalStorage();
    let flagPresentCouleur = false, position = 0;
    //Parcours le contenu du localStorage
    for (let index = 0; index < contenuLocalStorage.length; index++) {
        const element = contenuLocalStorage[index];
        //Si id déja présent de la meme couleur, leve le drapeau
        if (element.id == produit.id & element.couleur == produit.couleur) {
            flagPresentCouleur = true;
        }
    }
    //Si le produit à ajouter est déja présent de la meme couleur
    if (flagPresentCouleur) {
        console.log("Mise a jour de la quantité");
        //Mettre à jour la quantité
        contenuLocalStorage[position].quantite += produit.quantite;
    } else {
        //Le produit à ajouter n'est pas présent, ou pas de la meme couleur
        //ajoute le produit au tableau
        contenuLocalStorage.push(produit);
    }
    //Met à jour toujours
    majLocalStorage(contenuLocalStorage);
}

//Remet à jour le localStorage avec les infos contenues dans panier
function majLocalStorage(panier) {
    console.log("Fonction maj du LS");
    let panierJson = JSON.stringify(panier);
    localStorage.setItem("panierKanap", panierJson);
}

//récupère le contenu du locaStorage
function lireLocalStorage() {
    console.log("Fonction lire LS");
    return JSON.parse(localStorage.getItem("panierKanap"));
}

//Vérifie l'état du localStorage
//et agit en création ou modification selon son état.
function valideArticle(produit) {
    console.log("Fonction valide article");
    let panier = lireLocalStorage();
    //Si le panier n'existe pas, création du premier enregistrement
    if (panier == null) {
        let panierJson = JSON.stringify([produit]);
        localStorage.setItem("panierKanap", panierJson);
        console.log("Panier créé!");
    } else {
        //Si le panier contient quelque chose
        console.log("Le panier existe déja");
        //On compare et on met à jour le panier suivant ce qu'il contient déja
        compareIdLocalStorage(produit);
    }
    //Retour en attente d'action utilisateur
}

//Lire la couleur sur le Dom et l'affecter au produit
function lireCouleur(produit, value) {
    console.log("Fonction lire couleur");
    let cibleCouleur = document.querySelector("#colors");
    //Pas de couleur selectionnée
    if (cibleCouleur.selectedIndex == 0) {
        console.log("Mauvaise couleur");
        produit.couleur = "";
    } else {
        //Affecte la couleur à l'index -1 depuis le tableau de couleur récuperé sur le serveur à produit.couleur
        console.log("La couleur choisie est: " + value.colors[cibleCouleur.selectedIndex - 1]);
        produit.couleur = value.colors[cibleCouleur.selectedIndex - 1];
    };
}

// Remet à 0 la quantité sur le Dom
function razQuantite() {
    console.log("Fonction raz quantité");
    let cibleQuantite = document.querySelector("#quantity");
    cibleQuantite.value = 0;
}

//Lit la quantité sur le Dom
function lireQuantite(produit) {
    console.log("Fontion lire quantité");
    let cibleQuantite = document.querySelector("#quantity");
    let quantite = cibleQuantite.value;
    //Vérifie la validité
    if (quantite == NaN | quantite == "" | quantite < 1 | quantite > 100) {
        //Si non valide, remet à 0 et retourne sur l'attente d'une entrée valide
        console.log("Mauvaise quantité");
        quantite = 0;
        produit.quantite = 0;
        cibleQuantite.value = 0;
    } else {
        //Si valide l'affecte au produit en type number
        produit.quantite = parseInt(quantite);
    };
    //Et la retourne
    return quantite;
}

// Remplir le Dom avec les infos retounées par le serveur
function remplirLeDom(produit) {

    let elementCible = document.getElementsByClassName("item__img")[0];
    elementCible.innerHTML = `<img src="${produit.imageUrl}" alt="${produit.altTxt}">\n`;

    elementCible = document.getElementById("title");
    elementCible.innerHTML = produit.name;

    elementCible = document.getElementById("price");
    elementCible.innerHTML = produit.price;

    elementCible = document.getElementById("description");
    elementCible.innerHTML = produit.description;

    elementCible = document.getElementById("colors");
    let contenuDom = '<option value="">--SVP, choisissez une couleur --</option>\n';
    produit.colors.forEach(element => {
        contenuDom += `<option value="${element}">${element}</option>\n`;
    });
    elementCible.innerHTML = contenuDom;
}

