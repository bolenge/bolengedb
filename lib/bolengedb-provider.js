let fs = require('fs')
let path = require('path')
let testyfile = require('mb-file')
let locales = require('./i18n')

let BolengeDBConfig = require('./bolengedb-config')
let QueryDataJSON = require('./query/query-data-json')

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
class BolengeDBProvider extends BolengeDBConfig {

	constructor(options = {data_path: '', db_name: '', locale: 'fr'}) {
		super()

		this.dbName = options.db_name;
		this.dataPath = options.data_path;
		this.dbPath = path.join(this.dataPath, 'db');
		this.locale = locales[options.locale];
	}

	/**
	 * Permet de créer un dossier s'il n'existe pas
	 * @param {String} dirname L'emplacement du dossier à créer
	 * @param {CallbackWithError} callback La fonction callback à appeler
	 */
	mkdirFolder(dirname, callback) {
		testyfile.verify(dirname, (exist, message, detailsFile) => {
			if (!exist) {
				fs.mkdir(dirname, (err) => {
					callback(err)
				})
			}

			callback(null)
		})
	}

	/**
	 * Permet de créer une base de donnée
	 * @param {String} dbName Le nom de la base dedonnées
	 * @param {Function} callback
	 */
	createdb(dbName, callback) {
		testyfile.verify(this.dataPath, (exist, message, details) => {
			if (!exist) {
				throw this.locale.config.data.path.message
			}

			testyfile.verify(this.dbPath, (isSet, msg, fileDetails) => {
				if (!isSet) {
					fs.mkdir(this.dbPath, (err) => {
						if (err) throw this.locale.config.data.path.message
					})
				}

				let database = path.join(this.dbPath, dbName)

				testyfile.verify(database, (exist, message, details) => {
					if (exist) {
						callback(true, this.locale.db.createdb.exist)
					}else {
						fs.mkdir(database, (err) => {
							if (err) {
								callback(false, this.locale.db.createdb.warning);
							}else {
								callback(true, this.locale.db.createdb.success);
							}
						})
					}
				})
			})
		})
	}

	/**
	 * Vérifie si la base de données dont le nom passé en parmètre existe
	 * @param {String} dbName Le nom de la base de données
	 * @param {Function} callback Fonction à appeler
	 */
	verifyDBExists(dbName, callback) {
		let dbPathName = path.join(this.dbPath, dbName)

		testyfile.verify(dbPathName, (existe, message, details) => {
			if (existe) {
				callback(true, null);
			}else {
				callback(false, this.locale.db.verify.warning)
			}
		})
	}

	/**
	 * Connexion à la base de données
	 * @param {Function} callback 
	 */
	connect(callback) {
		let db_name = this.dbName;
		let db = new QueryDataJSON(this.dbPath, this.locale)

		this.verifyDBExists(db_name, (db_exists, err) => {
			if (!db_exists) {
				this.createdb(db_name, (success, message) => {
					if (success) {
						callback(null, db);
					}else {
						callback(message, null);
					}
				});
			}else {
				callback(null, db);
			}
		})
	}
}

module.exports = BolengeDBProvider