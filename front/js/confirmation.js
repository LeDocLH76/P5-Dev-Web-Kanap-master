// Recuperer le panier du locaStorage.
panier = JSON.parse(localStorage.getItem("panierKanap"));
console.table(panier);

// Si panier n'existe pas ou vide => info utilisateur et retour à l'acceuil.
// Si ok créer un tableau d'Id des articles presents dans le panier.
if (panier == null | panier == []) {
    alert("Le panier n'existe pas.\nRetour à l'acceuil");
    location.replace("index.html");
};

let products = [];
panier.forEach(element => {
    products.push(element.id);
});
console.table(products);

// Recupere l'objet contact dans le localStorage
contact = JSON.parse(localStorage.getItem("contact"));
console.table(contact);

// Si contact n'existe pas ou l'une des cles est vide => info utilisateur et retour au panier.
if (contact == null) {
    alert("Le formulaire de contact n'existe pas.");
    location.replace("cart.html");
} else {
    for (const key in contact) {
        if (contact[key] == "") {
            alert("Le formulaire est mal rempli");
            location.replace("cart.html");
        }
    }
};

// Prepare le Json du contact + panierId.
let content = JSON.stringify({ "contact": contact, "products": products });

// Envoyer le post et recuperer le retour.
commander(content);




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
                console.log("Reponse = " + res);
                return res.json();

            }
        })
        // Recupere lees données retournées par le serveur
        .then(function (value) {
            console.table(value);
            // Extrait le numero de confirmation de commande
            console.log(value.orderId);
            cible = document.getElementById("orderId");
            // Afficher le numero de confirm.
            cible.innerHTML = value.orderId;
            // Merci utilisateur, numero volatile, email envoyé.
            alert(`
            Nous vous remercions de votre commande.
                    Celle-ci est bien enregistrée.
                    Ce numéro ne sera plus affiché.
Un email de confirmation à été envoyé à ${value.contact.email}`);
            // Effacer panier du LS.
            localStorage.removeItem("panierKanap");
        })
        .catch(function (err) {
            console.log("Probleme " + err);
        })
        ;
}
