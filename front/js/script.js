// Premier test d'extraction de données sur le serveur

const listeProduits = "http://localhost:3000/api/products";

// Recupere l'ensemble des articles disponibles sur le serveur
fetch(listeProduits)
    .then(function (res) {
        if (res.ok) {
            return res.json();
        }
    })
    .then(function (value) {
        let blocElementsDom = aglomerationElementsDOM(value)
        let pointInsertion = document.getElementById("items");
        pointInsertion.innerHTML = blocElementsDom
    })
    .catch(function (err) {
        console.log(err);
    })
    ;

// Parcours la liste des produits disponibles
// et aglomere les differentes cartes article
function aglomerationElementsDOM(produits) {
    console.log("Fonction aglomeration des éléments du Dom");
    let blocElementsDom = "";
    for (let index = 0; index < produits.length; index++) {
        const element = produits[index];
        // appel de la fonction de construction d'une carte
        blocElementsDom += constructionElementDOM(element);
    }
    return blocElementsDom
}

// Prepare les elements du DOM pour une carte article
function constructionElementDOM(produit) {
    console.log("Fontion construction d'un élément du Dom");
    let element = `
    <a href="./product.html?id=${produit._id}">\n
    <article>\n
    <img src="${produit.imageUrl}" alt="${produit.altTxt}, ${produit.name}">\n
    <h3 class="productName">${produit.name}</h3>\n
    <p class="productDescription">${produit.description}</p>\n
    </article>\n
    </a>\n`;
    return element;
}
