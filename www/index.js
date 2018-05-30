//const remote = require('electron').remote;
//const main = remote.require('./main.js');
//const WStools = require('./wsTools.js');

let wsTools;
let listeDon = null;
let listeTimer = null;
let listeTimerIntervalle = null;
let etatCompteur = {bloque: false, vraieValeur: 0, valeurCourante: 0};

function majTwitch(infos)
{
	let totalViewers = document.getElementById('totalViewers');
	if (infos.desertbus && infos.jvtv)
		totalViewers.innerHTML = infos.desertbus + infos.jvtv;
}

function majDon(infos)
{
	let totalDonLigne = document.getElementById('totalDonMontant');
	if(!!totalDonLigne)
	{
		totalDonLigne.innerHTML = infos.totalDon.toLocaleString("fr-FR", { style: 'currency', currency: 'EUR' });
	}
	let totalDonUnite = document.getElementById('totalDonMontantUnite');
	if(!!totalDonUnite)
	{
		totalDonUnite.innerHTML = infos.totalDon.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0, style: 'currency', currency: 'EUR' });
	}
	let totalDonNb = document.getElementById('totalDonNb');
	if(!!totalDonNb)
	{
		totalDonNb.innerHTML = infos.nbDon.toLocaleString("fr-FR");
	}
	let totalDonHeureLigne = document.getElementById('totalDonHeureMontant');
	if(!!totalDonHeureLigne)
	{
		totalDonHeureLigne.innerHTML = infos.totalDonHeure.toLocaleString("fr-FR", { style: 'currency', currency: 'EUR' });
	}
	let totalDonHeureNb = document.getElementById('totalDonHeureNb');
	if(!!totalDonHeureNb)
	{
		totalDonHeureNb.innerHTML = infos.nbDonHeure.toLocaleString("fr-FR");
	}
	etatCompteur.bloque = infos.compteurBloque;
	etatCompteur.vraieValeur = infos.compteurVraieValeur;
	etatCompteur.valeurCourante = infos.totalDon;
	if(infos.compteurBloque)
		compteurEtatAfficherBloque(infos.compteurVraieValeur);
	else
		compteurEtatAfficherDirect();
}

function ajoutDonEnregistrerFormulaire(event)
{
	event.preventDefault();
	let id = document.getElementById('ajoutDonId').value;
	let date = document.getElementById('ajoutDonDate').value;
	let montant = document.getElementById('ajoutDonMontant').value;
	let infos = {
		nom: document.getElementById('ajoutDonNom').value,
		prenom: document.getElementById('ajoutDonPrenom').value,
		societe: document.getElementById('ajoutDonSociete').value,
		adresse: document.getElementById('ajoutDonAdresse').value,
		cp: document.getElementById('ajoutDonCP').value,
		ville: document.getElementById('ajoutDonVille').value,
		pays: document.getElementById('ajoutDonPays').value,
		courriel: document.getElementById('ajoutDonCourriel').value,
		commentaire: document.getElementById('ajoutDonCommentaire').value
	};
	wsTools.envoi("ajoutDon", {montant: parseFloat(montant), date: new Date(date), infos: infos, id: id});

	ajoutDonFormulaireCacher();

	//Et on vide
	document.getElementById('ajoutDonDate').value = "";
	document.getElementById('ajoutDonMontant').value = "";
	document.getElementById('ajoutDonId').value = "0";
	document.getElementById('ajoutDonNom').value = "";
	document.getElementById('ajoutDonPrenom').value = "";
	document.getElementById('ajoutDonSociete').value = "";
	document.getElementById('ajoutDonAdresse').value = "";
	document.getElementById('ajoutDonCP').value = "";
	document.getElementById('ajoutDonVille').value = "";
	document.getElementById('ajoutDonPays').value = "";
	document.getElementById('ajoutDonCourriel').value = "";
	document.getElementById('ajoutDonCommentaire').value = "";


	if(listeDon != null)
		listeDonDemande();
}

function ajoutDonInitModif(id)
{
	let d = listeDon[id];
	document.getElementById('ajoutDonDate').value = d.date;
	document.getElementById('ajoutDonMontant').value = d.montant;
	document.getElementById('ajoutDonId').value = d.id;
	document.getElementById('ajoutDonNom').value = d.infos.nom;
	document.getElementById('ajoutDonPrenom').value = d.infos.prenom;
	document.getElementById('ajoutDonSociete').value = d.infos.societe;
	document.getElementById('ajoutDonAdresse').value = d.infos.adresse;
	document.getElementById('ajoutDonCP').value = d.infos.cp;
	document.getElementById('ajoutDonVille').value = d.infos.ville;
	document.getElementById('ajoutDonPays').value = d.infos.pays;
	document.getElementById('ajoutDonCourriel').value = d.infos.courriel;
	document.getElementById('ajoutDonCommentaire').value = d.infos.commentaire;

	ajoutDonFormulaireAfficher();
}

function listeDonDemandeFormulaire(event)
{
	if(!!event)
		event.preventDefault();
	let index = document.getElementById('listeDonDemandeIndex').value;
	wsTools.envoi("listeDons", {index: index});
}

function listeDonDemande()
{
	let index = document.getElementById('listeDonDemandeIndex').value;
	wsTools.envoi("listeDons", {index: index});
}

function listeDonMaj(liste)
{
	let montants = [];
	if(liste !== undefined)
	{
		liste.dons.sort(function(a, b) {
			let dateA = new Date(a.date);
			let dateB = new Date(b.date);

			if(dateA.getTime() > dateB.getTime())
				return 1;
			else if(dateA.getTime() < dateB.getTime())
				return -1;

			return 0;
		});
		listeDon = liste.dons;
	}
	//On cherche le max
	for(let index in listeDon)
	{
		let item = listeDon[index];

		if(montants.indexOf(item.montant) == -1)
			montants.push(item.montant);
	}
	let maxMontant = Math.max.apply(null, montants);

	let table = document.getElementById('listeDon');
	table.innerHTML = '<tr><th>#</th><th>Donateur</th><th>Date</th><th>Montant</th><th>Actions</th></tr>'; //On vide

	let i = 1;
	let filtreMontant = document.getElementById('listeDonFiltre').value;
	let filtreTombola = document.getElementById('listeDonFiltreTombola').checked;
	for(let index in listeDon)
	{
		let item = listeDon[index];
		let id = item.id;
		let date = new Date(item.date);

		if((filtreMontant == -1 || filtreMontant == item.montant) && (!filtreTombola || item.infos.donOnly == true))
		{
			let tr = document.createElement('tr');
			let td;

			td = document.createElement('td');
			td.innerHTML = "#"+item.id;
			tr.appendChild(td);

			td = document.createElement('td');
			td.innerHTML = (!!item.infos.prenom ? item.infos.prenom : '') + ' ' + (!!item.infos.nom ? item.infos.nom : '') + ' ' + (!!item.infos.societe ? item.infos.societe : '');
			tr.appendChild(td);

			td = document.createElement('td');
			td.innerHTML = date.toLocaleDateString() + " " + date.toLocaleTimeString();
			tr.appendChild(td);

			td = document.createElement('td');
			td.innerHTML = item.montant.toLocaleString("fr-FR", { style: 'currency', currency: 'EUR' });
			if(item.montant == maxMontant)
				td.style.backgroundColor = "#66ebff";
			td.style.textAlign = 'center';
			tr.appendChild(td);

			td = document.createElement('td');
			td.innerHTML =
				"<a onclick=\"listeDonInfos("+index+");\" style=\"cursor: pointer; text-decoration: underline\">Voir informations</a> - " +
				"<a onclick=\"ajoutDonInitModif("+index+");\" style=\"cursor: pointer; text-decoration: underline\">Modifier</a> - " +
				"<a onclick=\"supprimerDon("+item.id+");\" style=\"cursor: pointer; text-decoration: underline\">Supprimer</a>";
			tr.appendChild(td);

			table.appendChild(tr);
			i++;
		}
	}

	if(liste !== undefined) //On vient de mettre à jour la liste, on met à jour les montants
		listeDonCreerFiltre(montants);
}

function listeDonHeureCourante()
{
	let now = new Date();
	let index = putZero(now.getUTCFullYear()) + putZero(now.getUTCMonth()) + putZero(now.getUTCDate()) + putZero(now.getUTCHours());
	document.getElementById('listeDonDemandeIndex').value = index;
	listeDonDemandeFormulaire();
}

function supprimerDon(id)
{
	wsTools.envoi("supprimerDon", {id: id});
	listeDonDemande();
}

function listeTimerMaj(liste)
{
	//On s'occupe de la fonction de mise à jour
	if(listeTimerIntervalle != null)
	{
		clearInterval(listeTimerIntervalle);
		listeTimerIntervalle = null;
	}

	listeTimer = {};
	let ul = document.getElementById('timerListe');
	if(ul == undefined)
	{
		for(let id in liste)
		{
			let item = new Timer(liste[id]);
			listeTimer[id] = item;
		}
		initTimerUnique();
		return null;
	}
	ul.innerHTML = ''; //On vide

	for(let id in liste)
	{
		let item = new Timer(liste[id]);
		listeTimer[id] = item;
		let li = document.createElement('li');
		let span;

		span = document.createElement('span');
		span.classList = "timerCompteurNom";
		span.innerHTML = item.nom;
		li.appendChild(span);

		li.innerHTML += '<br />';

		span = document.createElement('span');
		span.classList = "timerCompteurChrono";
		span.id="timerCompteur"+id;
		span.innerHTML = listeTimerFaireCompteur(item);
		li.appendChild(span);
		li.innerHTML += "<br />";

		//Liens
		span = document.createElement('span');
		span.classList = "timerCompteurAction";
		let premierBouton = (item.active ? "<a class=\"cliquable\" id=\"timerCompteurBoutonTrigger"+id+"\" onclick=\"listeTimerPause("+id+")\">Pause</a>" : "<a class=\"cliquable\" id=\"timerCompteurBoutonTrigger"+id+"\" onclick=\"listeTimerPlay("+id+")\">Lancer</a>");
		span.innerHTML = premierBouton +
			" - "+
			"<a class=\"cliquable\" onclick=\"listeTimerRemiseZero("+id+")\">Remise à zéro</a>"+
			"<br />"+
			"<a class=\"cliquable\" onclick=\"listeTimerSupprimer("+id+")\">Supprimer</a>";

		li.appendChild(span);

		ul.appendChild(li);
	}

	//Et on arme la mise à jour du compteur
	let now = new Date();
	setTimeout(function() {
		listeTimerIntervalle = setInterval(listeTimerMajCompteurs, 1000);
		listeTimerMajCompteurs();
	}, 1000 - now.getMilliseconds());
}

function putZero(n)
{
	if(n >= 0 && n <= 9)
		return String('0'+n);
	else
		return String(n);
}

function listeTimerMajCompteurs()
{
	for(let id in listeTimer)
	{
		listeTimerMajCompteur(id);
	}
}

function listeTimerMajCompteur(id, idSpan, format)
{
	if(idSpan == undefined)
		idSpan = 'timerCompteur'+id;
	let item = listeTimer[id];
	let span = document.getElementById(idSpan);
	if(!!span)
		span.innerHTML = listeTimerFaireCompteur(item, format);
}

function listeTimerFaireCompteur(item, format)
{
	if(format == undefined)
		format = 'hms';

	let diff = item.temps; //En seconde

	let negatif = diff < 0;
	if(negatif)
		diff = -1 * diff;

	//Heures
	let diffH = Math.floor(diff / 3600);

	//Minutes
	let diffM = Math.floor((diff % 3600) / 60);

	//Secondes
	let diffS = diff % 60;

	if(format == 'hms')
		return (negatif ? '-' : '')+putZero(diffH)+":"+putZero(diffM)+":"+putZero(diffS);
	else if(format == 'hm')
		return (negatif ? '-' : '')+putZero(diffH)+"h"+putZero(diffM);
	else if(format == 'h')
		return (negatif ? '-' : '')+putZero(diffH)+"h";
}

function listeTimerPause(id)
{
	let item = listeTimer[id];
	item.pause();
	//Mettre à jour bouton dans interface
	let a = document.getElementById('timerCompteurBoutonTrigger'+id);
	a.onclick = function() { listeTimerPlay(id); };
	a.innerHTML = "Lancer";
	//Envoyer commande au serveur
	item.id = id;
	wsTools.envoi("ajoutTimer", item);

	listeTimerMajCompteur(id);
}

function listeTimerPlay(id)
{
	let item = listeTimer[id];
	item.play();
	//Mettre à jour bouton dans interface
	let a = document.getElementById('timerCompteurBoutonTrigger'+id);
	a.onclick = function() { listeTimerPause(id); };
	a.innerHTML = "Pause";
	//Envoyer commande au serveur
	item.id = id;
	wsTools.envoi("ajoutTimer", item);

	listeTimerMajCompteur(id);
}

function listeTimerRemiseZero(id)
{
	let item = listeTimer[id];
	if(confirm("Remettre à zéro le compteur "+item.nom+" ?"))
	{
		item.reset();
		//Envoyer commande au serveur
		item.id = id;
		wsTools.envoi("ajoutTimer", item);

		listeTimerMajCompteur(id);
	}
}

function listeTimerSupprimer(id)
{
	let item = listeTimer[id];
	if(confirm("Supprimer le compteur "+item.nom+" ?"))
	{
		wsTools.envoi("supprimerTimer", {id: id});
		listeTimerDemande();
	}
}

function ajoutTimerEnregistrerFormulaire(event)
{
	event.preventDefault();
	let nom = document.getElementById('ajoutTimerNom').value;
	let debut = document.getElementById('ajoutTimerDebut').value;
	let id = document.getElementById('ajoutTimerId').value;
	let active = document.getElementById('ajoutTimerDemarrerImmediatement').checked;
	wsTools.envoi("ajoutTimer", {nom: nom, debut: debut, active: active, id: id});

	ajoutTimerFormulaireCacher();

	//Et on vide
	document.getElementById('ajoutTimerNom').value = "";
	document.getElementById('ajoutTimerDebut').value = "";
	document.getElementById('ajoutTimerId').value = "0";

	listeTimerDemande();
}

function listeTimerDemande()
{
	wsTools.envoi("listeTimers");
}

function listeDonCreerSelecteur()
{
	let select = document.getElementById('listeDonDemandeIndex');
	if(!!select)
	{
		let now = new Date();
		//Attention, les dates sont en UTC
		let jour = new Date();
		jour.setDate(jour.getDate() - 4);
		for(let i = 0; i < 5; i++)
		{
			for(let h = 0; h < 24; h++)
			{
				jour.setUTCHours(h);
				let option = document.createElement('option');
				option.value = putZero(jour.getUTCFullYear()) + putZero(jour.getUTCMonth()) + putZero(jour.getUTCDate()) + putZero(jour.getUTCHours());
				option.innerHTML = jour.toLocaleDateString() + " " +jour.getHours() + "h";
				if(now.getDate() == jour.getDate() && now.getHours() == jour.getHours())
					option.setAttribute('selected', true);
				select.appendChild(option);
			}
			jour.setDate(jour.getDate() + 1);
		}
	}
}

function listeDonCreerFiltre(montant)
{
	let select = document.getElementById('listeDonFiltre');
	select.innerHTML = ''; //On vide
	montant.sort(function(a, b) {
		if(parseFloat(a) > parseFloat(b))
			return 1;
		else if(parseFloat(a) < parseFloat(b))
			return -1;

		return 0;
	});
	let option = document.createElement('option');
	option.value = -1;
	option.innerHTML = "Tous les montants";
	select.appendChild(option);
	for(let i in montant)
	{
		let m = montant[i];
		option = document.createElement('option');
		option.value = m;
		option.innerHTML = m.toLocaleString("fr-FR", { style: 'currency', currency: 'EUR' });
		select.appendChild(option);
	}
}

function listeDonInfos(index)
{
	let item = listeDon[index];
	let text = "Montant : "+item.montant.toLocaleString("fr-FR", { style: 'currency', currency: 'EUR' })+"\n"+
		"Date : "+(new Date(item.date)).toLocaleString()+"\n";
	for(let cle in item.infos)
	{
		if(cle != 'cle')
			text += cle+" : "+item.infos[cle]+"\n";
	}
	text += "id: " + item.id + "\n" 
	alert(text);
}

function ajoutTimerFormulaireAfficher()
{
	document.getElementById('ajoutTimerFormulaire').style.display = 'block';
}

function ajoutTimerFormulaireCacher()
{
	document.getElementById('ajoutTimerFormulaire').style.display = 'none';
}

function ajoutTimerFormulaireTrigger()
{
	if(document.getElementById('ajoutTimerFormulaire').style.display == 'block')
		ajoutTimerFormulaireCacher();
	else
		ajoutTimerFormulaireAfficher();
}

function ajoutDonFormulaireAfficher()
{
	document.getElementById('ajoutDonFormulaire').style.display = 'block';
}

function ajoutDonFormulaireCacher()
{
	document.getElementById('ajoutDonFormulaire').style.display = 'none';
}

function ajoutDonFormulaireTrigger()
{
	if(document.getElementById('ajoutDonFormulaire').style.display == 'block')
		ajoutDonFormulaireCacher();
	else
		ajoutDonFormulaireAfficher();
}

function compteurEtatTrigger()
{
	if(etatCompteur.bloque)
	{
		//On débloque…
		wsTools.envoi("etatCompteur", {bloque: false, valeur: 0});
		compteurEtatAfficherDirect()
	} else {
		//On bloque
		let nouvelleValeur = prompt("Valeur du compteur ?", etatCompteur.valeurCourante);
		wsTools.envoi("etatCompteur", {bloque: true, valeur: nouvelleValeur});
		compteurEtatAfficherBloque(nouvelleValeur)
	}
}

function compteurEtatAfficherDirect()
{
	document.getElementById('compteurEtat').innerHTML = 'Direct';
	document.getElementById('compteurEtatAction').innerHTML = 'Bloquer';
}

function compteurEtatAfficherBloque(nouvelleValeur)
{
	document.getElementById('compteurEtat').innerHTML = 'Bloqué (valeur actuelle : '+nouvelleValeur.toLocaleString("fr-FR", { style: 'currency', currency: 'EUR' })+')';
	document.getElementById('compteurEtatAction').innerHTML = 'Débloquer';
}

const adresseSocket = "ws://" + window.location.hostname + ":8080/"
const socket = new WebSocket(adresseSocket, "echo-protocol");
listeDonCreerSelecteur();

socket.addEventListener("open", function(event) {
	console.log("Connexion WS ouverte !");
	wsTools = new WStools(socket);

	wsTools.envoi("majDon");
	wsTools.envoi("majTwitch");
	wsTools.envoi("listeTimers");
});

socket.addEventListener("message", function(event) {
	let data = JSON.parse(event.data);
	console.log(data);
	if(!!data.tag)
	{
		let tag = data.tag;
		console.log("Tag : "+tag);
		let obj = data.donnees;
		console.log(obj);
		if(tag == "majDon")
		{
			majDon(obj);
		} else if(tag == "majTwitch")
		{
			majTwitch(obj);
		} else if(tag == "listeDons")
		{
			listeDonMaj(obj);
		} else if(tag == "listeTimers")
		{
			console.log("Réception de la liste des timers");
			listeTimerMaj(obj);
		}
	}
});
