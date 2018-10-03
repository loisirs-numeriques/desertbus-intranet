const electron = require('electron');
const {
	app,
	BrowserWindow
} = electron;
const websocket = require('websocket');
const WebSocketServer = websocket.server;
const http = require('http');
const fs = require('fs');
const url = require('url');
const request = require('request');

const WStools = require('./wsTools.js');
const Don = require('./class/don.js');
const DonCtrl = require('./ctrl/don.ctrl.js');
const Timer = require('./class/timer.js');
const TimerCtrl = require('./ctrl/timer.ctrl.js');
const Credentials = require('./class/credentials.js')

let donCtrl = new DonCtrl();
let timerCtrl = new TimerCtrl();
let twitchDesertbus = 0;
let twitchJvtv = 0;

const port = 8080;

var credentials = new Credentials('credentials.json');

let server = http.createServer(function (request, response) {
	//console.log((new Date()) + ' [HTTP] Demande d\'une page');

	let page = url.parse(request.url).pathname;
	console.log((new Date()) + ' [HTTP] Demande de ' + page);

	if (page == "/" || page == "/index.html") {
		fs.readFile('./www/index.html', 'utf-8', function (error, content) {
			response.writeHead(200, {
				"Content-Type": "text/html"
			});
			response.end(content);
		});
	} else if (page == "/compteur.html") {
		fs.readFile('./www/compteur.html', 'utf-8', function (error, content) {
			response.writeHead(200, {
				"Content-Type": "text/html"
			});
			response.end(content);
		});
	} else if (page == "/index.js") {
		fs.readFile('./www/index.js', 'binary', function (error, content) {
			response.writeHead(200, {
				"Content-Type": "application/javascript"
			});
			response.end(content, 'binary');
		});
	} else if (page == "/wsTools.js") {
		fs.readFile('./www/wsTools.js', 'binary', function (error, content) {
			response.writeHead(200, {
				"Content-Type": "application/javascript"
			});
			response.end(content, 'binary');
		});
	} else if (page == "/timer.html") {
		fs.readFile('./www/timer.html', 'utf-8', function (error, content) {
			response.writeHead(200, {
				"Content-Type": "text/html"
			});
			response.end(content);
		});
	} else if (page == "/timer.js") {
		fs.readFile('./www/timer.js', 'utf-8', function (error, content) {
			response.writeHead(200, {
				"Content-Type": "application/javascript"
			});
			response.end(content);
		});
	} else if (page == "/desertbus.css") {
		fs.readFile('./www/desertbus.css', 'utf-8', function (error, content) {
			response.writeHead(200, {
				"Content-Type": "text/css"
			});
			response.end(content);
		});
	} else if (page == "/logoDefinitif.png") {
		fs.readFile('./www/logoDefinitif.png', function (error, content) {
			response.writeHead(200, {
				"Content-Type": "image/png"
			});
			response.end(content);
		});
	} else {
		response.writeHead(404);
		response.end();
	}
});

server.listen(port, function () {
	console.log((new Date()) + ' Serveur à l\'écoute sur le port ' + port);
});

let webserver = new WebSocketServer({
	httpServer: server
	//, autoAcceptConnections: false // Protection à mettre en place pour la prod ?
});

function sauvegarderSysteme() {
	let donnees = {
		dons: donCtrl.dons,
		donId: donCtrl.id,
		donsId: donCtrl.donsId,
		donsCleExterne: donCtrl.cleExterne,
		timer: timerCtrl.timers,
		timerId: timerCtrl.id
	};
	fs.writeFileSync('sauvegarde.json', JSON.stringify(donnees));
}

function restaurerSysteme() {
	fs.readFile('sauvegarde.json', 'utf-8', function (err, data) {
		if (!err) {
			let obj = JSON.parse(data);
			for (let heure in obj.dons) {
				// console.log(obj.dons);
				for (let donId in obj.dons[heure].dons) {
					let item = obj.dons[heure].dons[donId];
					// console.log(item);
					let don = new Don(new Date(item.date), item.montant, item.infos);
					donCtrl.addDon(don);
				}
			}
			/*donCtrl.dons = obj.dons;
			donCtrl.id = obj.donId;
			donCtrl.cleExterne = obj.donsCleExterne;
			donCtrl.donsId = obj.donsId;*/
			timerCtrl.timers = obj.timer;
			timerCtrl.id = obj.timerId;
		}
	});
}

function getObjMajDon() {
	return {
		totalDon: donCtrl.totalDon,
		nbDon: donCtrl.nbDons,
		totalDonHeure: donCtrl.heureCourante.totalDons,
		nbDonHeure: donCtrl.heureCourante.nbDons,
		compteurBloque: donCtrl.bloque,
		compteurVraieValeur: donCtrl.totalDonReel
	};
}

function majDon() {
	console.log("Total don : " + donCtrl.totalDon);
	allConnexion
		.filter(function (c) {
			return c.connected;
		})
		.forEach(
			function (c) {
				WStools.envoiStatic(c, "majDon", getObjMajDon());
			}
		);
	sauvegarderSysteme();
}

function majTwitch() {
	console.log("Total viewers : " + (twitchJvtv + twitchDesertbus));
	allConnexion
		.filter(function (c) {
			return c.connected;
		})
		.forEach(
			function (c) {
				WStools.envoiStatic(c, "majTwitch", {
					desertbus: twitchDesertbus,
					jvtv: twitchJvtv
				});
			}
		);
}

function majTimer() {
	console.log("Envoi de la mise à jour des timers");
	allConnexion
		.filter(function (c) {
			return c.connected;
		})
		.forEach(
			function (c) {
				WStools.envoiStatic(c, "listeTimers", timerCtrl.timers);
			}
		);
}

let allConnexion = [];

//On prépare déjà le reset des dons de l'heure courante
let now = new Date();
setTimeout(
	function () {
		setInterval(function () {
			donCtrl.resetDonHeureCourante();
			majDon();
			majTwitch()
		}, 3600000);
		donCtrl.resetDonHeureCourante();
		majDon();
		majTwitch()
	},
	(59 - now.getMinutes()) * 60000 + (59 - now.getSeconds()) * 1000 + (1000 - now.getMilliseconds())
);

function decodeUTF16LE(binaryStr) {
	var cp = [];
	for (var i = 0; i < binaryStr.length; i += 2) {
		cp.push(
			binaryStr.charCodeAt(i) |
			(binaryStr.charCodeAt(i + 1) << 8)
		);
	}

	return String.fromCharCode.apply(String, cp);
}

function recupererTwitch() {
	request({
			url: "https://api.twitch.tv/kraken/streams/desertbusfr",
			headers: {
				"Client-ID": "4wjei4iwb43xcysa0r70x9i4n8sxy8z"
			}
		},
		function (error, response, body) {
			if (body == null || body[0] != '{') {
				console.log("body", body);
				return;
			} else
				var data = JSON.parse(body)
			if (data.stream != null)
				twitchDesertbus = data.stream.viewers
			majTwitch()
		}
	)

	request({
			url: "https://api.twitch.tv/kraken/streams/jvtv",
			headers: {
				"Client-ID": "4wjei4iwb43xcysa0r70x9i4n8sxy8z"
			}
		},
		function (error, response, body) {
			if (body == null || body[0] != '{') {
				console.log("body", body);
				return;
			} else
				var data = JSON.parse(body)
			if (data.stream != null)
				twitchJvtv = data.stream.viewers
			majTwitch()
		}
	)
}

// function requestMaxPage() {
// 	let auth = "Basic " + new Buffer(credentials.username + ":" + credentials.password).toString("base64");

// 	request({
// 		url: "https://api.helloasso.com/v3/campaigns/"+campaigns_id+"/actions.json?page=1&results_per_page=100",
// 		headers: {
// 			"Authorization": auth
// 		}
// 	},
// 	function (error, response, body) {
// 		if (body == "You do not have permission to view this directory or page.") {
// 			console.log("body", body);
// 			requestMaxPage()
// 		} else {
// 			var data = JSON.parse(body);
// 			return data.pagination.max_page
// 		}
// 	})

// 	return 20;
// }

//Récupération des dons hello asso
function recupererDonsHelloAsso() {
	let auth = "Basic " + new Buffer(credentials.username + ":" + credentials.password).toString("base64");
	let campaigns_id = credentials.campaigns_id

	request({
			url: "https://api.helloasso.com/v3/campaigns/" + campaigns_id + "/actions.json?page=1&results_per_page=100",
			headers: {
				"Authorization": auth
			}
		},
		function (error, response, body) {
			if (body == null || body[0] != '{') {
				console.log("body", body);
				return;
			} else {
				var data = JSON.parse(body);
				traiterHelloAsso(data);
			}

			for (let i = 2; i <= data.pagination.max_page; i++) {
				request({
						url: "https://api.helloasso.com/v3/campaigns/" + campaigns_id + "/actions.json?page=" + i + "&results_per_page=100",
						headers: {
							"Authorization": auth
						}
					},
					function (error, response, body) {
						if (body == null || body[0] != '{') {
							console.log("body", body);
							i--
						} else {
							let data = JSON.parse(body);
							traiterHelloAsso(data);
						}
					}
				);
				setTimeout(() => {}, 200);
			}
		}
	);
}

function traiterHelloAsso(contenu) {
	// console.log('contenu', contenu)

	if (contenu.resources != null) {
		contenu.resources.map((el) => {
			let infos = {};
			infos.date = new Date(el.date);
			infos.montant = el.amount
			infos.infos = {}
			infos.infos.cle = el.id
			infos.infos.donOnly = false
			infos.infos.prenom = el.first_name
			infos.infos.nom = el.last_name
			infos.infos.adresse = el.address
			infos.infos.cp = el.zip_code
			infos.infos.ville = el.city
			infos.infos.pays = el.country
			infos.infos.courriel = el.email

			el.custom_infos.map((lot) => {
				if (lot.label == 'Je souhaite participer au tirage au sort de la loterie') {
					infos.infos.donOnly = (lot.value === 'Oui')
				}
			})

			let don = new Don(infos.date, infos.montant, infos.infos);
			donCtrl.addDon(don);
		})
	}


	// for (let el of contenu.resources) {
	// 	let infos = {};
	// 	infos.date = new Date(el.date);
	// 	infos.montant = el.amount
	// 	infos.infos = {}
	// 	infos.infos.cle = el.id
	// 	infos.infos.donOnly = false
	// 	infos.infos.prenom = el.first_name
	// 	infos.infos.nom = el.last_name
	// 	infos.infos.adresse = el.address
	// 	infos.infos.cp = el.zip_code
	// 	infos.infos.ville = el.city
	// 	infos.infos.pays = el.country
	// 	infos.infos.courriel = el.email

	// 	for (let lot of el.custom_infos) {
	// 		if (lot.label == 'Je souhaite participer au tirage au sort de la loterie') {
	// 			infos.infos.donOnly = (lot.value === 'Oui')
	// 		}
	// 	}

	// 	let don = new Don(infos.date, infos.montant, infos.infos);
	// 	donCtrl.addDon(don);
	// }

	// console.log("contenu.ressources[0]", contenu.ressources[0])

	majDon();
}

restaurerSysteme();
recupererDonsHelloAsso();
setInterval(recupererTwitch, 10000);
setInterval(recupererDonsHelloAsso, 10000);

webserver.on('request', function (request) {
	let connexion = request.accept('echo-protocol', request.origin);
	allConnexion.push(connexion);
	let wsTools = new WStools(connexion);

	console.log((new Date()) + ' Connexion de ' + connexion.remoteAddress);

	connexion.on("message", function (event) {
		// console.log(event);
		let data = JSON.parse(event.utf8Data);
		console.log(data);
		if (!!data.tag) {
			let tag = data.tag;
			console.log("Tag : " + tag);
			let obj = data.donnees;
			if (obj == undefined)
				obj = {};
			// console.log(obj);
			if (tag == "ajoutDon") {
				let date, montant, infos;
				if (!!obj.date)
					date = new Date(obj.date);
				else
					date = new Date();

				if (!!obj.montant)
					montant = obj.montant;
				else
					montant = 0;

				infos = obj.infos || {};
				if (!!obj.id && parseInt(obj.id) > 0) {
					let don = donCtrl.getDon(parseInt(obj.id));
					let diff = montant - don.montant;
					let index = don.indexHeure;
					don.montant = montant;
					don.date = date;
					for (let cle in don.infos) {
						if (infos[cle] !== undefined)
							don.infos[cle] = infos[cle];
					}
					//don.infos = infos;
					donCtrl.updateHeure(index, diff);
					//donCtrl.modifDon(parseInt(obj.id), don);
				} else {
					let don = new Don(date, montant, infos);
					donCtrl.addDon(don);
				}
				majDon();
			} else if (tag == "majDon") {
				wsTools.envoi("majDon", getObjMajDon());
			} else if (tag == "majTwitch") {
				wsTools.envoi("majTwitch", {
					desertbus: twitchDesertbus,
					jvtv: twitchJvtv
				});
			} else if (tag == "listeDons") {
				let index;
				if (!!obj.index)
					index = obj.index;
				else
					index = donCtrl.indexHeureCourante;

				wsTools.envoi("listeDons", donCtrl.getHeureIndex(index));
			} else if (tag == "supprimerDon") {
				donCtrl.removeDon(obj.id);
				majDon();
			} else if (tag == "ajoutTimer") {
				let debut;
				if (!!obj.debut)
					debut = new Date(obj.debut);
				else
					debut = new Date();
				let nom = obj.nom;
				let active = obj.active;
				if (!!obj.id && parseInt(obj.id) > 0) {
					let id = parseInt(obj.id);
					console.log("Mise à jour du timer #" + id);
					let timer = timerCtrl.getTimer(id);
					let valeur = obj.valeur;
					timer.nom = nom;
					timer.debut = debut;
					timer.active = active;
					timer.valeur = valeur;
					timerCtrl.modifTimer(id, timer);
				} else {
					console.log("Ajout d'un nouveau timer");
					let timer = new Timer(nom, debut, active);
					timerCtrl.addTimer(timer);
				}
				majTimer();
			} else if (tag == "supprimerTimer") {
				timerCtrl.removeTimer(obj.id);
				majTimer();
			} else if (tag == "listeTimers") {
				wsTools.envoi("listeTimers", timerCtrl.timers);
			} else if (tag == "etatCompteur") {
				donCtrl.bloque = obj.bloque;
				donCtrl.valeurBloque = obj.valeur;
				majDon();
				majTwitch()
			}
		}
	});

	connexion.on('close', function (reasonCode, description) {
		console.log((new Date()) + ' Deconnexion de ' + connexion.remoteAddress);
	});
});

app.on('ready', () => {
	let fenetre = new BrowserWindow({
		width: 800,
		height: 600,
		autoHideMenuBar: true
	});
	fenetre.loadURL('file://' + __dirname + '/index.html');
	let webContents = fenetre.webContents;
	webContents.session.on('will-download', function (event, item, webContents) {
		//event.stopPropagation();
		// Set the save path, making Electron not to prompt a save dialog.
		item.setSavePath('/tmp/save.csv');
		console.log("will - Download");
		console.log(item.getSavePath());

		item.on('updated', (event, state) => {
			if (state === 'interrupted') {
				console.log('Download is interrupted but can be resumed')
			} else if (state === 'progressing') {
				if (item.isPaused()) {
					console.log('Download is paused')
				} else {
					console.log(`Received bytes: ${item.getReceivedBytes()}`)
				}
			}
		})
		item.once('done', (event, state) => {
			if (state === 'completed') {
				console.log('Download successfully');
				fs.readFile('/tmp/save.csv', function read(err, data) {
					if (err) {
						throw err;
					}
					var content = data;

					// Invoke the next step here however you like
					console.log(String.fromCharCode.apply(null, new Uint16Array(content))); // Put all of the code here (not the best solution)
				});
			} else {
				console.log(`Download failed: ${state}`)
			}
		})
	});
	fenetre.webContents.openDevTools();
});