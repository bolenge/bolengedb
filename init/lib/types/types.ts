import { UserClient, ResultsSaveUserClient } from "./interfaces";

/**
 * Callback avec un paramètre err
 * @param err L'erreur
 */
function CallbackWithError(err:string) {}

/**
 * Callback appeler  sur Testyfile.verify
 * @param existe Si le fichier ou dossier existe
 * @param message Le message à renvoyer
 * @param detailsFile Les détails sur le fichier ou dossier vérifié
 */
function CallbackTestyfileVerify(existe:boolean, message:string, detailsFile:object) {}

/**
 * Fonction callback appelée lors de la save de données users
 * @param err L'erreur lors de l'écriture sur le fichier
 * @param results Le données du dernier enregistrement
 */
function CallbackSaveUserClient(err:string, results: ResultsSaveUserClient) {}

/**
 * Simple fonction callback à appeler
 * @param err L'erreur au cas où y en a
 * @param data Les données
 */
function SimpleCallbackFunction(err:string, data:object) {}

/**
 * Callback à appeler quand on cherche un utilisateur
 * @param user Les données de l'utilisateur trouvé
 */
function CallbackFindUser(user:object) {
    
}