class Timer
{
    constructor(nom, debut, active)
    {
        if(active === undefined)
            active = true;
        this.nom = nom;
        this.debut = debut;
        this.active = active;
        this.valeur = 0;
    }

    get temps()
    {
        if(this.active)
        {
            let now = new Date();
            return this.valeur + Math.floor((now.getTime() - this.debut.getTime())/1000);
        } else {
            return this.valeur;
        }
    }

    pause()
    {
        this.valeur = this.temps;
        this.active = false;
    }

    play()
    {
        this.active = true;
        this.debut = new Date();
    }

    reset()
    {
        this.active = false;
        this.debut = null;
        this.valeur = 0;
    }
}

module.exports = Timer;
