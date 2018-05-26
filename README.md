Dépôt git pour les développements liés à desert bus

Installation
============

npm install

Lancement
=========

npm start

Parametrage
===========

* main.js, fonction recupererDonsHelloAsso() : url doit correspondre à l'URL de l'API.
* main.js, fonction traiterHelloAsso() : enteteColonne sert à faire la correspondance entre le nom des colonnes du csv de hello asso et la propriété correspondante. Il faut donc changer les clés pour que cela colle avec celles du csv obtenu par l'API. C'est le même que celui téléchargeable dans le système.
* www/index.js, adresseSocket doit contenir l'URL du serveur socket

Liens utiles
============

* http://localhost:8080/ => Interface principal
* http://localhost:8080/compteur.html => Compteur
* http://localhost:8080/timer.html#timer=1&format=hm => Les timers (timer=1 correspond au timer n°1, format=hm format d'affichage [choix : h = heure seule, hm = heure minute, hms = heure minute seconde])

Todo
====

V0.1 obligatoire:

* Nettoyer les clés API/login/mdp/whatever, créer un ficher d’environment model
* Push ca en public/libre/anti-commerce sans l’historique de commit, sur github
* Donner les droits aux differents utilisateur ici present

Bonus:
* Upgrade des dépendances
* Verification de ce qui gère les fuseaux horaires
* Données exportable en CSV
* Ajout log des viewers twitch avec API twitch
* Systeme de recherche par valeur de dons des gens

> <a rel="license" href="http://creativecommons.org/licenses/by-nc/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc/4.0/">Creative Commons Attribution-NonCommercial 4.0 International License</a>.