const remote = require('electron').remote;
const main = remote.require('./main.js');
const WStools = require('./wsTools.js');
const fs = remote.require('fs');
const request = remote.require('request');

let totalDonLigne = document.createElement('p');
totalDonLigne.id = "totalDonParagraphe";
totalDonLigne.innerHTML = "Total des dons actuels : " + "0" + "€";
document.body.appendChild(totalDonLigne);

function majDon(totalDon)
{
	let totalDonLigne = document.getElementById('totalDonParagraphe');
	if(totalDonLigne)
	{
		totalDonLigne.innerHTML = "Total des dons actuels : " + totalDon.toLocaleString("fr-FR", { style: 'currency', currency: 'EUR' });
		document.body.appendChild(totalDonLigne);
	}

	//On envoi aussi le compteur au site web !
	// mettreAJourCompteurSiteWeb(totalDon)
}

// function mettreAJourCompteurSiteWeb(montant)
// {
// 		let url = 'http://loisirsnumeriques.org/desertbus/compteur/envoiDonPourMettreAJourCompteur.php';
// 	request.post(
// 		{
// 			url : url,
// 			headers: {'content-type' : 'application/x-www-form-urlencoded'},
// 			body: 'code=DesertBusDeLEspoir&don='+montant
// 		},
// 		function(error, response, body){
// 			console.log(body);
// 		}
// 	);
// }

const adresseSocket = "ws://localhost:8080/"
const socket = new WebSocket(adresseSocket, "echo-protocol");

socket.addEventListener("open", function(event) {
	console.log("Connexion WS ouverte !");
	let wsTools = new WStools(socket);
});

socket.addEventListener("message", function(event) {
	let data = JSON.parse(event.data);
	console.log(data);
	if(data.tag)
	{
		let tag = data.tag;
		console.log("Tag : "+tag);
		let obj = data.donnees;
		console.log(obj);
		if(tag == "majDon")
		{
			majDon(obj.totalDon);
		}
	}
});

// window.onload = function()
// {
// 	let webview = document.getElementById('foo');

// 	webview.addEventListener('did-stop-loading', function(event) {
// 		event.target.removeEventListener(event.type, arguments.callee);
// 		console.log("event did-stop-loading");
// 		webview.addEventListener('did-navigate', function(event, url) {
// 			console.log("event did-navigate");
// 			setInterval(function() {
// 				console.log("Récupération du CSV");
// 				let url = "";//Url CSV hello asso
// 				webview.loadURL(url);
// 			}, 15000);
// 		});
// 	})
// }
