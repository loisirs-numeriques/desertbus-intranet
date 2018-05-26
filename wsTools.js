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

    static envoiStatic(connexion, tag, infos)
    {
        let obj = {tag: tag, donnees: infos};
        connexion.send(JSON.stringify(obj));
    };
}

module.exports = WStools;
