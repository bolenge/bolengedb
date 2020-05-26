module.exports = {
    db: {
        createdb: {
            success: "Base de données créée avec succès",
            exist: "Cette base de donnée existe déjà",
            warning: "Une erreur est survenue lors de la création de votre base de données, veuillez réssayer"
        },
        verify: {
            warning: "Cette base de donnée n'existe pas"
        },
        users: {
            exist: "Cet utilisateur existe deja",
            absent: "Cet utilisateur n'existe pas",
            optionsConnect: {
                empty: "Aucune option ne doit être vide",
                invalid: " est invalide.",
                options: "Voici la liste des options {host: '', database: '', username: '', password: ''}"
            },
            invalidPassword: "Mot de passe de l'utilisateur incorrect"
        },
        privileges: {
            invalid: "n'est pas réconnu comme privilège",
            empty: "Vous n'avez indiqué aucun privilège",
            userNoPrivilege: "Cet utilisateur n'a pas été ajouté à cette base de donnée ou la base de données n'existe pas",
            noEmptyPrivilege: "L'utilisateur n'est peut pas être sans privilège"
        },
        collection: {
            errorCreating: "Une erreur est survenue lors de la création de la collection",
            errorWhenFind: "Une erreur est survenue lors de la recherche de données dans la collection",
            errorSaving: "Une erreur est survenue lors de la sauvagarde de données",
            update: {
                noUpdateId: "Vous ne pouvez pas modifier l'_id d'un enregistrement",
                noDeleteField: " ne peut pas être supprimé",
                invalidKeyParam: " n'est pas réconnu comme clé valide. Essayez "
            },
            data: {
                nothing: "Aucun élément trouvé",
                badId: "_id indiqué est invalide"
            }
        }
    },
    config: {
        data: {
            path: {
                message: "Veuillez créer un dossier où seront stockées vos données passer le path de ce dossier en paramètre du constructeur de BolengeClient"
            }
        }
    },
    words: {
        or: 'ou'
    }
}