# BolengeDB

# Les idées par rapport à son évolution

* On commence par la configuration de BolengeDB

* On commence par la création de la base de données

* Lors de l'implémentation (ou encore extraction) de la base de données dans le projet pour le mettre en production, on placera le dossier `config` dans `data` qui contiendra le fichier users et users.privileges

## PARTIE ACTUELLE (Important)

* Finir d'abord query-data-json comme un module à part permettant de gérer les fichier JSON pas comme une base de données mais comme de fichiers qu'on lire de données, écrire, modifier voir même supprimée et ensuite l'intégrer comme une dépendance dans BolengeDB

* Après la finalisation du précédent BolengeBD :
    * Création et gestion des utilisateurs
    * Connexion d'un utilisateur
    * Manipulation des données (collections, documents)

* Penser à forcer la suppression si le dev lui même le veut, sans compter le `state`