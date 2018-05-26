class TimerCtrl
{
	constructor()
	{
		this.timers = {};
		this.id = 0;
	}

	addTimer(timer)
	{
		console.log("Ajout d'un compteur de temps");
		console.log(timer);
		this.id++;
		timer.id = this.id;
		this.timers[timer.id] = timer;
	}

	removeTimer(id)
	{
		console.log("Suppression du compteur de temps #"+id);
		delete this.timers[id];
		console.log(this.timers);
	}

	getTimer(id)
	{
		return this.timers[id];
	}

	modifTimer(id, timer)
	{
		this.timers[id] = timer;
	}
}

module.exports = TimerCtrl;
