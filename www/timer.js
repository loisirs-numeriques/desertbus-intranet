function initTimerUnique()
{
    let url = document.location.hash.substr(1); //On enlève le # initial
    let param = url.split('&');
    let idTimer = 0;
    let format = 'hms';
    for(let p in param)
    {
        let infos = param[p].split("=");
        if(infos[0] == 'timer')
            idTimer = parseInt(infos[1]);
        else if(infos[0] == 'format')
            format = infos[1];
    }

    let now = new Date();
	setTimeout(function() {
		listeTimerIntervalle = setInterval(function() { listeTimerMajCompteur(idTimer, 'timerUnique', format); }, 1000);
		listeTimerMajCompteur(idTimer, 'timerUnique', format);
	}, 1000 - now.getMilliseconds());
    listeTimerMajCompteur(idTimer, 'timerUnique', format);
}
