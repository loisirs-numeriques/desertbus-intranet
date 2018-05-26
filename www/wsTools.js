class WStools{
    constructor(co)
    {
        this.connexion = co;
    }

    envoi(tag, infos)
    {
        let obj = {tag: tag, donnees: infos};
        this.connexion.send(JSON.stringify(obj));
    };
}

class Timer
{
    constructor(obj)
    {
        this.nom = obj.nom;
        this.debut = new Date(obj.debut);
        this.active = obj.active;
        this.valeur = obj.valeur;
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
        this.debut = new Date();
        this.valeur = 0;
    }
}
