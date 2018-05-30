function putZero(n)
{
	if(n <= 9)
		return '0'+String(n);
	else
		return String(n);
}

class DonCtrl
{
	constructor()
	{
		this.dons = {};
		this.donsId = {};

		//Auto incremente
		this.id = 0;

		//Import Hello Asso
		this.cleExterne = [];

		//État compteur
		this.bloque = false;
		this.valeurBloque = 0;

		//Obselete
		/*this.nbDons = 0;
		this.heureCourante = {
			nbDons : 0,
			totalDons : 0,
			dons: []
		};*/
	}

	mettreDansIndex(don)
	{
		// console.log(don);
		console.log("Index : "+don.indexHeure);
		let index = don.indexHeure;
		if(this.dons[index] == undefined)
		{
			this.dons[index] = {
				nbDons : 1,
				totalDons : don.montant,
				dons: [don]
			};
		} else {
			this.dons[index].nbDons++;
			this.dons[index].totalDons += don.montant;
			this.dons[index].dons.push(don);
		}
		this.donsId[don.id] = index;

		console.log("Ajout dans l'index du don #"+don.id);
		// console.log(this.dons);
	}

	retirerDansIndex(don)
	{
		let index = this.donsId[don.id];
		this.dons[index].nbDons--;
		this.dons[index].totalDons -= don.montant;
		let indexDon = this.dons[index].dons.findIndex(function(d) { return d.id == don.id });
		this.dons[index].dons.splice(indexDon, 1);

		delete this.donsId[don.id];
	}

	retirerDansIndexParId(id)
	{
		let index = this.donsId[id];
		let indexDon = this.dons[index].dons.findIndex(function(d) { return d.id == id });
		let don = this.dons[index].dons[indexDon];

		this.dons[index].nbDons--;
		this.dons[index].totalDons -= don.montant;
		this.dons[index].dons.splice(indexDon, 1);

		delete this.donsId[id];

		console.log("Retrait de l'index #"+id);
		console.log("------------------------");
	}

	addDon(don)
	{
		// console.log("Ajout d'un don");
		// console.log(don);
		if(don.infos.cle !== undefined)
		{
			if(this.cleExterne.indexOf(don.infos.cle) != -1)
				return false; //Le don existe déjà, on ne l'ajoute pas
			else
				this.cleExterne.push(don.infos.cle);
		}
		this.id++;
		don.id = this.id;

		this.mettreDansIndex(don);

		return true;
	}

	removeDon(id)
	{
		console.log("Suppression du don #"+id);

		this.retirerDansIndexParId(id);
	}

	get totalDon()
	{
		if(this.bloque)
			return this.valeurBloque;
		else
		{
			let total = 0;
			for(let id in this.dons)
			{
				let heure = this.dons[id];
				if(!isNaN(heure.totalDons))
					total += heure.totalDons;
			}
			return total;
		}
	}

	get totalDonReel()
	{
		if(!this.bloque)
			return 0;
		else
		{
			let total = 0;
			for(let id in this.dons)
			{
				let heure = this.dons[id];
				if(!isNaN(heure.totalDons))
					total += heure.totalDons;
			}
			return total;
		}
	}

	get nbDons()
	{
		let nb = 0;
		for(let id in this.dons)
		{
			let heure = this.dons[id];
			if(!isNaN(heure.nbDons))
				nb += heure.nbDons;
		}
		return nb;
	}

	getDon(id)
	{
		let index = this.donsId[id];
		if(index == undefined)
			return null;
		let indexDon = this.dons[index].dons.findIndex(function(d) { return d.id == id });
		return this.dons[index].dons[indexDon];
	}

	modifDon(id, don)
	{
		console.log("Modification du don #"+id);
		//don.id = id; //Juste au cas où
	}

	updateHeure(index, montant)
	{
		this.dons[index].totalDons += montant;
	}

	resetDonHeureCourante()
	{
		return null;
	}

	get indexHeureCourante()
	{
		let now = new Date();
		return (
			putZero(now.getUTCFullYear()) +
			putZero(now.getUTCMonth()) +
			putZero(now.getUTCDate()) +
			putZero(now.getUTCHours()));
	}

	get heureCourante()
	{
		let index = this.indexHeureCourante;
		return this.getHeureIndex(index);
	}

	get maxDonHeureCourante()
	{
		let maxDon = 0;
		let donsHeureCourante = this.heureCourante.dons;
		for(let don of donsHeureCourante)
		{
			let montant = don.montant;
			if(montant > maxDon)
			{
				maxDon = montant;
			}
		}
		return maxDon;
	}

	getHeureIndex(index)
	{
		if(this.dons[index] == undefined)
			this.dons[index] = {
				nbDons : 0,
				totalDons : 0,
				dons: []
			};

		return this.dons[index];
	}
}

module.exports = DonCtrl;
