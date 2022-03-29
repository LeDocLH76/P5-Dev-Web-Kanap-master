const listeProduits = "http://localhost:3000/api/products";

// Recupere l'ensemble des articles disponibles sur le serveur
fetch(listeProduits)
    .then(function (res) {
        if (res.ok) {
            return res.json();
        }
    })
    .then(function (value) {
        //Tout le reste se passe ici
        resteDuScript(value)
    })
    .catch(function (err) {
        console.log(err);
    })
    ;

// Tout le reste du script dans une fonction

function resteDuScript(contenuMagasin) {
    //Recharge la page si le localStorage à changé alors que cette page était déja ouverte dans un autre onglet.
    window.addEventListener("storage", function () {
        location.reload();
    });

    let contenuPanierDom = "";
    let quantiteTotale = 0;
    let prixTotal = 0
    let panier = lireLocalStorage();
    // console.log("panier = " + panier);
    if (panier != null) {
        //Tri du panier sur le nom
        trierPanier(panier);
    }

    // Si un panier existe dans le localStorage
    if (panier != null) {
        //Pour chaque element dans le panier
        // Construction du dom et cumul quantité et prix
        for (let index = 0; index < panier.length; index++) {
            const element = panier[index];
            //Pour chaque article dans contenuMagasin
            for (let index = 0; index < contenuMagasin.length; index++) {
                const article = contenuMagasin[index];
                //Si egaux construire un element du dom et aglomerer à l'existant
                //Incremente le prix total et le nombre d'articles
                if (article.name == element.nom) {
                    quantiteTotale += parseInt(element.quantite);
                    prixTotal += article.price * parseInt(element.quantite);
                    contenuPanierDom += constructionElementDOM(element, article);
                }
            }
        }
    }

    //Remplir le dom avec l'aglomerat d'éléments créé
    let cibleDom = document.getElementById("cart__items");
    cibleDom.innerHTML = contenuPanierDom;
    // Affiche quantité et prix total
    majQuantiteDom(quantiteTotale);
    majPrixDom(prixTotal);

    // Si un panier existe dans le localStorage
    if (panier != null) {
        //Pour tout les articles dans la page
        //Ajoute un ecouteur sur un changement de quantite qui modifie le panier et le localStorage en fonction
        for (let index = 0; index < panier.length; index++) {
            cibleDom.children[index].querySelector(".itemQuantity").addEventListener("change", function () {
                let cibleDom = document.getElementById("cart__items");
                let id = cibleDom.children[index].dataset.id;
                let couleur = cibleDom.children[index].dataset.color;
                let quantite = cibleDom.children[index].querySelector(".itemQuantity").value;
                cibleDom.children[index].querySelector(".itemQuantity").value = quantite;

                if (quantite > 0 & quantite <= 100 & quantite != null & quantite != NaN & quantite != "") {
                    quantite = parseInt(quantite);
                    //Met à jour la quantité totale sur la page                
                    cibleDom.children[index].querySelector(".itemQuantity").value = quantite;
                    // De combien la quantité à changé ?
                    let quantitePanier = panier[index].quantite;
                    let differenceQuantite = quantitePanier - quantite;
                    // Met à jour
                    quantiteTotale -= differenceQuantite;
                    majQuantiteDom(quantiteTotale);
                    // Quel est le prix de l'article en cours de traitement
                    let prixArticle = trouvePrixArticle(contenuMagasin, id);
                    //Met à jour le prix total et le total sur la page
                    prixTotal -= differenceQuantite * prixArticle;
                    majPrixDom(prixTotal);
                    //Modifie la quantité dans le localStorage
                    modifierQuantité(panier, id, couleur, quantite);
                } else {
                    // L'entrée n'est pas valide, reaffiche le contenu du panier
                    cibleDom.children[index].querySelector(".itemQuantity").value = panier[index].quantite;
                }
            });
            //Ajoute un ecouteur sur la suppression qui modifie le localStorage en fonction et recharge la page
            cibleDom.children[index].querySelector(".deleteItem").addEventListener("click", function () {
                let cibleDom = document.getElementById("cart__items");
                let id = cibleDom.children[index].dataset.id;
                let couleur = cibleDom.children[index].dataset.color;
                retirerLocalStorage(panier, id, couleur);
            });
        }

    }


    // Debut du traitement du formulaire**************************

    // Creation d'un objet contact vide
    let contact = {
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        email: ""
    }

    // Si localStorage contact n'existe pas, il est créé avec des valeurs vides.
    if (localStorage.getItem("contact") == null) {
        localStorage.setItem("contact", JSON.stringify(contact));
    }

    // Lecture des valeurs de contact enregistrées.
    let contactStorage = JSON.parse(localStorage.getItem("contact"));
    // Pour tout les input
    // Si une valeur valide est presente dans le localStorage
    // Rempli l'objet contact avec les valeurs presentes
    if (contactStorage.firstName != "") {
        console.log("Un prénom existe");
        contact.firstName = contactStorage.firstName
    };
    if (contactStorage.lastName != "") {
        console.log("Un nom existe");
        contact.lastName = contactStorage.lastName
    };
    if (contactStorage.address != "") {
        console.log("Une adresse existe");
        contact.address = contactStorage.address
    };
    if (contactStorage.city != "") {
        console.log("Une ville existe");
        contact.city = contactStorage.city
    };
    if (contactStorage.email != "") {
        console.log("Un email existe");
        contact.email = contactStorage.email
    };
    // Met à jours avec les infos connues
    majContactStorage(contact);


    // Création d'un tableau d'objets contenant les valeurs utiles pour chaques entrées input
    let tableVerification = [
        { label: "firstName", labelMessage: "firstNameErrorMsg", regExp: "^[a-zA-ZàÀâÂãÃäÄçÇèÈéÉêÊëËîÎïÏñÑôÔöÖûÛüÜ' -]{1,30}$", message: "Erreur => Majuscules minuscules accents espaces tirets 30c maximum", valide: false },
        { label: "lastName", labelMessage: "lastNameErrorMsg", regExp: "^[a-zA-ZàÀâÂãÃäÄçÇèÈéÉêÊëËîÎïÏñÑôÔöÖûÛüÜ' -]{1,30}$", message: "Erreur => Majuscules minuscules accents espaces tirets 30c maximum", valide: false },
        { label: "address", labelMessage: "addressErrorMsg", regExp: "^[\\w][\\wàÀâÂãÃäÄçÇèÈéÉêÊëËîÎïÏñÑôÔöÖûÛüÜ' °/\\u005C-]{1,28}[\\wàÀâÂãÃäÄçÇèÈéÉêÊëËîÎïÏñÑôÔöÖûÛüÜ]$", message: "Erreur => Majuscules minuscules chiffres accents espaces tirets apostrophe 30c maximum", valide: false },
        { label: "city", labelMessage: "cityErrorMsg", regExp: "^[\\wàÀâÂãÃäÄçÇèÈéÉêÊëËîÎïÏñÑôÔöÖûÛüÜ' /-]{1,29}[\\wàÀâÂãÃäÄçÇèÈéÉêÊëËîÎïÏñÑôÔöÖûÛüÜ]$", message: "Erreur => Majuscules minuscules chiffres accents espaces tirets apostrophe 30c maximum", valide: false },
        { label: "email", labelMessage: "emailErrorMsg", regExp: "^[\\w.+-]{1,64}@[\\w-]{2,252}\\.[a-zA-Z]{1,6}\\.?[a-zA-Z]{1,6}$", message: "Veuillez entrer une adresse valide", valide: false }
    ];

    // Vérification de la conformité des entrées input
    // Pour chaque objet de la table de vérification
    // Prérempli le formulaire avec les données valides déja connues
    tableVerification.forEach(element => {
        let cible = document.getElementById(element.label);
        let messageCible = document.getElementById(element.labelMessage);
        // Prérempli l'input en cours par la dernière donnée valide connue
        // Et bascule le drapeau valide dans la table de vérification à vrai
        cible.value = contact[element.label];
        if (cible.value != "") {
            element.valide = true
        }
        // Place un ecouteur sur changement
        cible.addEventListener("change", function () {
            // Nouvel objet RegExp suivant la valeur dans la table de vérification
            const regExVal = new RegExp(element.regExp);
            console.log(regExVal);
            // Input valide ?
            if (cible.value.match(regExVal)) {
                console.log("Entrée valide " + element.label);
                // Bascule le drapeau valide dans la table de vérification à vrai
                element.valide = true;

                // *****************************************************************************************
                // Formate le prénom => Première lettre majuscule
                if (element.label == "firstName") {
                    cible.value = cible.value.substr(0, 1).toUpperCase() + cible.value.substr(1, cible.value.length).toLowerCase();
                }
                // Formate le nom et la ville => Majuscules
                if (element.label == "lastName" | element.label == "city") {
                    cible.value = cible.value.toUpperCase();
                }
                // ****************************************************************************************

                // Met à jour contact et contactStorage avec la nouvelle donnée valide              
                contact[element.label] = cible.value;
                majContactStorage(contact);
            } else {
                console.log("Entrée non autorisée!");
                // Efface l'entrée erronée 
                cible.value = "";
                // Informe l'utilisateur
                messageCible.innerHTML = element.message;
                // Bascule le drapeau valide dans la table de vérification à faux
                element.valide = false;
                console.log(`Erreur de ${element.label} !`);
            }

        });
        // efface les message d'erreur quand l'utilisateur clique dans l'input
        cible.addEventListener("click", function () {
            messageCible.innerHTML = "";
        });
    });

    // Si un panier existe dans le localStorage
    if (panier != null) {
        // Ecoute le bouton commander et réagi au click
        document.getElementById("order").addEventListener("click", function (e) {
            e.preventDefault();
            // Vérifie que le panier n'est pas vide
            if (panier.length != 0) {
                // Indique bon pour commande
                let flagCommander = true;
                // Pour chaque input du formulaire
                tableVerification.forEach(element => {
                    console.log(`Imput du formulaire bien rempli ? ${element.valide}`);
                    // Vérifie si valide
                    if (element.valide == false) {
                        // Si invalide, indicateur bon pour commande = false
                        flagCommander = false;
                    }
                });
                // Si tout les input sont valides
                if (flagCommander == true) {
                    content = preparePost(panier);
                    // Commander et changer de page
                    commander(content);
                } else {
                    // Un au moins des input est invalide
                    alert("Le formulaire n'est pas bien rempli !");
                }
                console.log(`Le panier contient ${panier.length} ${panier.length > 1 ? "réferences" : "réference"}`);
            }
        })
    } else {
        alert("Le panier est vide !\nAllez à l'acceuil.");
    }
    console.log("Attente action utilisateur");

}// ************** Fin ***********

//Définitions de fonctions***************************************

// Passer la commande
function commander(content) {
    const commandeUrl = "http://localhost:3000/api/products/order";
    fetch(commandeUrl, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        method: 'post',
        body: content
    })
        .then(function (res) {
            if (res.ok) {
                console.log("Reponse du serveur");
                console.table(res);
                return res.json();

            }
        })
        // Recupere les données retournées par le serveur
        .then(function (value) {
            console.table(value);
            // Extrait le numero de confirmation de commande
            console.log(`L'identifiant de commande est ${value.orderId}`);
            // Construit l'url d'appel de la page confirmation avec passage du numéro de confirmation
            urlConfirmation = `confirmation.html?idCde=${value.orderId}`;
            console.log(urlConfirmation);
            // Change de page
            location.replace(urlConfirmation);
        })
        .catch(function (err) {
            console.log("Probleme " + err);
        });
}


// Prépare le post
function preparePost(panier) {
    console.log("Fonction prepare le post")
    let products = [];
    panier.forEach(element => {
        products.push(element.id);
    });
    console.table(products);
    // Recupere l'objet contact dans le localStorage
    contact = JSON.parse(localStorage.getItem("contact"));
    console.table(contact);
    // Prépare le Json du contact + panierId.
    let content = JSON.stringify({ "contact": contact, "products": products });
    // Et le retourne
    return content;
}

// Met à jour les infos de contact dans le localStorage
function majContactStorage(contact) {
    console.log("Fonction mise à jour contact dans le localStorage");
    let contactJson = JSON.stringify(contact);
    localStorage.setItem("contact", contactJson);
}

//Parcours le tableau des articles du serveur et retourne le prix correspondant à l'id passé en parametre
function trouvePrixArticle(contenuMagasin, id) {
    console.log("Fonction trouve le prix d'un article");
    for (let index = 0; index < contenuMagasin.length; index++) {
        const element = contenuMagasin[index];
        if (element._id == id) {
            return element.price
        }
    }
}

// Met à jour le prix sur la page
function majPrixDom(prixTotal) {
    console.log("Fonction met le prix à jour sur la page");
    cibleDom = document.getElementById("totalPrice");
    cibleDom.innerHTML = prixTotal;
}

// Met à jour la quantité sur la page
function majQuantiteDom(quantiteTotale) {
    console.log("fonction met la quantité à jour sur la page");
    cibleDom = document.getElementById("totalQuantity");
    cibleDom.innerHTML = quantiteTotale;

}

// Retire un article du panier et du localStorage puis recharge la page
function retirerLocalStorage(panier, id, couleur) {
    console.log("Fonction retire un article du localStorage");
    for (let index = 0; index < panier.length; index++) {
        const element = panier[index];
        if (element.id == id & element.couleur == couleur) {
            //Si present, efface cartAndFormContainer de l'adresse de la page
            window.location.hash = "";
            panier.splice(index, 1);
            majLocalStorage(panier);
            //Insere cartAndFormContainer dans l'adresse de la page
            window.location.hash = "cartAndFormContainer"
            //Force le rechargement de la page au niveau du haut du panier id=cartAndFormContainer
            location.reload();
        }
    }
}

// Modifie la quantité d'un article dans le panier et le localStorage
function modifierQuantité(panier, id, couleur, quantite) {
    console.log("Fonction modifier quantité dans le localStorage");
    panier.forEach(element => {
        if (element.id == id & element.couleur == couleur) {
            element.quantite = quantite;
            majLocalStorage(panier);
        }
    });
}

// Met à jour le localStorage avec le contenu du panier
function majLocalStorage(panier) {
    console.log("Fonction mise à jour du localStorage");
    let panierJson = JSON.stringify(panier);
    localStorage.setItem("panierKanap", panierJson);
}

// Trie le panier par ordre alphabetique
// Permet de regrouper les articles de meme id et de couleurs differentes
function trierPanier(panier) {
    console.log("Fonction trier le panier");
    panier.sort(function compare(a, b) {
        if (a.nom < b.nom)
            return -1;
        if (a.nom > b.nom)
            return 1;
        return 0;
    });
}

// Construit un élément du Dom
function constructionElementDOM(element, article) {
    console.log("Fonction construction d'un élément du Dom");
    contenuUnElement = `
    <article class="cart__item" data-id="${element.id}" data-color="${element.couleur}">\n
    <div class="cart__item__img">\n
    <img src="${article.imageUrl}" alt="${article.altTxt}">\n
    </div>\n
    <div class="cart__item__content">\n
    <div class="cart__item__content__description">\n
    <h2>${element.nom}</h2>\n
    <p>${element.couleur}</p>\n
    <p>${article.price} €</p>\n
    </div>\n
    <div class="cart__item__content__settings">\n
    <div class="cart__item__content__settings__quantity">\n
    <p>Qté : </p>\n
    <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${element.quantite}">\n
    </div>\n
    <div class="cart__item__content__settings__delete">\n
    <p class="deleteItem">Supprimer</p>\n
    </div>\n
    </div>\n
    </div>\n
    </article>\n
    `;
    return contenuUnElement
}

// Lecture du panier sur le localStorage
function lireLocalStorage() {
    console.log("Fonction lire le localStorage");
    if (localStorage.getItem("panierKanap") != null) {
        return JSON.parse(localStorage.getItem("panierKanap"));
    } else {
        return null;
    }
}
