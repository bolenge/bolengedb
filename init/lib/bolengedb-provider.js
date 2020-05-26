let fs = require('fs')
let path = require('path')
let testyfile = require('testyfile')

let BolengeDBConfig = require('./bolengedb-config')

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

	constructor() {
		super()

		this.dataPath = this.serverConf._datapath
		this.dbPath   = path.join(this.dataPath, 'db')
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
	 */
	createdb(dbName) {

		testyfile.verify(this.dataPath, (exist, message, details) => {
			if (!exist) {
				throw this.locale.config.data.path.message
			}

			testyfile.verify(this.dbPath, (isSet, msg, fileDetails) => {
				if (!isSet) {
					fs.mkdir(this.dbPath, (err) => {
						if (err) throw err
					})
				}

				let database = path.join(this.dbPath, dbName)

				testyfile.verify(database, (exist, message, details) => {
					if (exist) {
						console.log(this.locale.db.createdb.exist);
					}else {
						fs.mkdir(database, (err) => {
							if (err) console.log(this.locale.db.createdb.warning);
							
							console.log(this.locale.db.createdb.success);
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
			let error = null
			
			if (!existe) error = this.locale.db.verify.warning

			callback(error)
		})
	}
}

module.exports = BolengeDBProvider