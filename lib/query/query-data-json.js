let fs = require('fs')
let path = require('path')
let testyfile = require('testyfile')
let locales = require('../i18n')
let serverConf = require('../../config/server.conf.json')
let locale = locales[serverConf.locale]
let CollectionQuery = require('./collection-query')


let ContraintesForme = {
	limit: {
		debut: Number,
		fin: Number
	},
	where: {
		and: {},
		or: {}
	}
}

/**
 * Class permettant de gérer les requêtes avec les données stockées dans des fichiers JSON
 */
class QueryDataJSON {

	/**
	 * Constructeur principal
	 * @param {String} dbDirname Le chemin du dossier de la base de données
	 */
	constructor(dbDirname, locale) {

		this.dbDirname = dbDirname;
		this.lastInsertId = null;
		this.locale = locale;
	}

	/**
	 * Met le cursor (cible) sur la collection
	 * @param {String} collection Le nom de la collection
	 * @param {Function} callback Fonction callback à appeler
	 */
	collection(collection, callback) {
		let Collection = null

		this.testFileCollection(collection, (err, collectionFileName) => {
			if (!err) {
				Collection = new CollectionQuery(collectionFileName, this.locale)
			}

			callback(err, Collection)
		})
	}

	/**
	 * Vérifie si le fichier de données de la collection existe déjà
	 * @param {String} collection Le fichier de la collection
	 * @param {Function} callback Fonction callback à appeler
	 */
	testFileCollection(collection, callback) {
		let collectionFileName = path.join(this.dbDirname, collection + '.json')
		let error = null

		testyfile.verify(collectionFileName, (exist, message, detailsFile) => {
			if (!exist) {
				fs.writeFile(collectionFileName,  '[]', function (err) {
					if (err) {
						callback(this.locale.db.collection.errorCreating, null)
					}else {
						callback(null, collectionFileName)
					}
				})
			}else {
				callback(null, collectionFileName)
			}
		})
    }
}

module.exports = QueryDataJSON