function putZero(n)
{
    if(n <= 9)
        return '0'+String(n);
    else
        return String(n);
}

class Don
{
    constructor(date, montant, infos)
    {
        this.date = date;
        this.montant = montant;
        this.infos = infos;
        this.id = null;
    }

    estDonDeLheure()
    {
        let now = new Date();
        return (
            (this.date.getUTCFullYear() == now.getUTCFullYear()) &&
            (this.date.getUTCMonth() == now.getUTCMonth()) &&
            (this.date.getUTCDate() == now.getUTCDate()) &&
            (this.date.getUTCHours() == now.getUTCHours())
        );
    }

    get indexHeure()
    {
        return (
            putZero(this.date.getUTCFullYear()) +
            putZero(this.date.getUTCMonth()) +
            putZero(this.date.getUTCDate()) +
            putZero(this.date.getUTCHours()));
    }
}

module.exports = Don;
