// Recuperer le panier et contact dans le locaStorage.
panier = JSON.parse(localStorage.getItem("panierKanap"));
console.table(panier);
contact = JSON.parse(localStorage.getItem("contact"));
console.table(contact);

// Si panier n'existe pas ou vide => info utilisateur et retour à l'acceuil.
if (panier == null | panier == []) {
    console.log("Le panier est vide ou n'existe pas")
    alert("Le panier n'existe pas.\nRetour à l'acceuil");
    location.replace("index.html");
};

// Si l'objet contact est incomplet => info utilisateur et retour au panier
for (const key in contact) {
    if (contact[key] == "") {
        console.log("Il y à un problème sur le formulaire")
        alert("Le formulaire n'est pas bien rempli.");
        location.replace("cart.html");

    }
}

let pageCourante = window.location.href;
let url = new URL(pageCourante);
// Recupere la valeur du parametre idCde passé par la page d'appel
let orderId = url.searchParams.get("idCde");
console.log(`Le numero de commande est ${orderId}`);
cible = document.getElementById("orderId");
// Afficher le numero de confirm.
cible.innerHTML = orderId;
// Vérifie que l'utilisateur a bien un numéro de confirmation
if (orderId != null) {
    // Merci utilisateur, numero volatile, email envoyé.
    alert(`
            Nous vous remercions de votre commande.
                    Celle-ci est bien enregistrée.
                    Ce numéro ne sera plus affiché.
Un email de confirmation à été envoyé à ${contact.email}`);
    // Effacer panier du LS.
    localStorage.removeItem("panierKanap");
    console.log("Panier effacé\nBye bye.");
} else {
    // Pour le cas ou l'utilisateur n'a pas suivi le cours normal des pages
    cible = document.getElementsByClassName("confirmation");
    console.log("Modification du Dom" + cible);
    cible[0].innerHTML = "<p>Commande invalide ! <br>Veuillez retourner à l'acceuil</p>";
};
