// Modules required
let fs = require('fs')
let path = require('path')
let testyfile = require('testyfile')
let mbnumber = require('mbnumber')

let locales = require('../i18n')
let serverConf = require('../../config/server.conf.json')
let locale = locales[serverConf.locale]

/**
 * Class gérant les différentes requêtes vers les données
 */
class CollectionQuery {

    /**
     * Contructeur principal
     * @param {String} collectionFileName Le dossier de la base de données
     */
    constructor(collectionFileName) {
		this.updateMethods = [
			'$set',
			'$unset'
		]

        this.collectionFileName = collectionFileName
        this.lastInsertId = null
    }
    
    /**
	 * Permet de créer un nouvel enregistrement
	 * @param {Object} data Les données à insérer
	 * @param {Closure} callback callback à appeler
	 */
	create(data, callback) {

		this.findAll((err, results) => {
			if (!err) {
				let resultsLength = results.length
				let resultsData = results.data
				let datas = null

				if (!Array.isArray(data)) {
					datas = [data]
				}else {
					datas = data
				}

				let iId = 0

				datas.forEach((data, index, tab) => {
					iId++

					let donnees = {
						_id: parseInt(resultsLength) + iId
					}
	
					for (const key in data) {
						if (data.hasOwnProperty(key)) {
							const value = data[key];
							donnees[key] = value
						}
					}
	
					donnees.state = true
					donnees.created_at = new Date
					donnees.updated_at = new Date
	
					resultsData.push(donnees)

					if (iId == tab.length) {
						this.writeToCollection(resultsData, callback)
					}
				});
			}else {
				callback(err, null)
			}
		})
	}
	
	/**
	 * Permet de faire la même chose que create()
	 * @param {Object} data Les données à insérer
	 * @param {Function} callback La fonction callback à appeler
	 */
	insert(data, callback) {
		this.create(data, callback)
	}
    
    /**
	 * Trouve tous les enregistrments
	 * @param {Function} callback Fonction callback à appeler
	 */
	findAll(callback) {

		fs.readFile(this.collectionFileName, function (err, dataResult) {
			if (!err) {
				let results = JSON.parse(dataResult)
				let response = {
					length: results.length,
					data: results
				}

				callback(null, response)
			}else {
				callback(locale.db.collection.errorWhenFind, null)
			}	
		})
    }
    
    /**
	 * Permet de sauvegarder les données dans le fichier à stocker
	 * @param {Array} data Les données à sauvegarder
	 * @param {Function} callback La fonction callback à appeler
	 */
	writeToCollection(data, callback) {
		let dataLength = data.length
		let lastStore = data[dataLength - 1]

		this.lastInsertId = lastStore._id

		fs.writeFile(this.collectionFileName,  JSON.stringify(data), function (err) {
			if (!err) {
				let results = {
					lastInsertId: lastStore._id,
					data: lastStore
				}

				callback(null, results)
			}else {
				callback(locale.db.collection.errorSaving, null)
			}
		})
	}

	/**
	 * Permet de trouver les données
	 * @param {Object} predicate Le prédicat (condition à valider) pour les données à récuperer
	 * @param {Function} callback Fonction callback à appeler
	 */
	find(predicate, callback) {
		this.findAll((err, results) => {
			if (err) {
				callback(err, null)
			}else{

				predicate = predicate ? predicate : {}

				let predicates = predicate['$or'] ? predicate.$or : [predicate]
				let matched = []
				let exit = 0
				let response = {
					length: 0,
					data: null
				}
				
				if (results.length > 0) {
					if ((predicates.length > 0) && (Object.keys(predicates[0]).length > 0)) {
						results.data.forEach((element, index, tab) => {
							exit++

							for (let j = 0; j < predicates.length; j++) {
								const condition = predicates[j];

								let conditionKeys = Object.keys(condition)
								let conditionVals = Object.values(condition)
								let lengthFieldsCondition = conditionKeys.length

								if (lengthFieldsCondition > 0) {
									let counterCond = 0

									for (const key in condition) {
										if (condition.hasOwnProperty(key)) {
											const field = condition[key];
											
											if (field == element[key]) {
												counterCond++
											}
										}
									}
									
									if (lengthFieldsCondition == counterCond) {
										matched.push(element)
									}
								}
							}

							if (exit == tab.length) {
								response.length = matched.length
								response.data = matched

								callback(null, response)
							}
						});
					}else {
						callback(null, results)
					}
				}else {
					callback(null, response)
				}
			}
		})
	}

	/**
	 * Permet de modifier ou ajouter des champs dans une entrée
	 * @param {Object} predicate Me prédicat (condition à valider)
	 * @param {Object} data Les données à modifier ou à jouter
	 * @param {Function} callback La fonction callback à appeler
	 */
	update(predicate, data, callback) {
		if (typeof data == "object") {
			if (Object.keys(data)) {
				for (const key in data) {
					if (this.updateMethods.indexOf(key) >= 0) {
						this[key](predicate, data[key], callback)
					}else {
						callback(key + locale.db.collection.update.invalidKeyParam + this.updateMethods.join(' ' + locale.words.or + ' '), null)
					}
				}
			}
		}
	}

	/**
	 * Permet de modifier les données dans la collection
	 * @param {Object} predicate Le prédicat (condition à valider) sur les données qu'il faut modifer
	 * @param {Object} data Les données à modifier
	 * @param {Function} callback La fonction callback à appeler
	 */
	$set(predicate, data, callback) {
		let error = null
		let toSet = data
		let response = {
			nModified: 0,
			nMatched: 0,
			ok: false
		}

		this.find(predicate, (err, results) => {
			if (!err) {
				if (results.length > 0) {
					let datas = results.data

					this.findAll((err, results) => {
						if (!err) {
							results.data.map((element, i, tab) => {
								datas.map((data, index, array) => {
									if (element._id == data._id) {
										for (const field in toSet) {
											if (field !== '_id') {
												const value = toSet[field];
												element[field] = value
											}else {
												error = locale.db.collection.update.noUpdateId
												break
											}
										}



										element.updated_at = !error ? new Date : element.updated_at
									}
								})

								if ((i + 1) == tab.length) {
									if (!error) {
										this.writeToCollection(tab, (err, results) => {
											if (!err) {
												response.nMatched = datas.length
												response.nModified = datas.length
												response.ok = true

												callback(null, response)
											}else {
												callback(err, null)
											}
										})
									}else {
										callback(error, null)
									}
								}
							})
						}else {
							callback(err, null)
						}
					})
				}else {
					response.ok = true
					callback(null, response)
				}
			}else {
				callback(err, null)
			}
		})
	}

	/**
	 * Permet de supprimer des items ou champs dans 1 ou n enregistremenet
	 * @param {Object} predicate Le prédicat (condition à valider) sur les données à supprimer des champs
	 * @param {Object} data Les données à supprimer
	 * @param {Function} callback La fonction callback à appeler
	 */
	$unset(predicate, data, callback) {
		let error = null
		let toUnset = data
		let response = {
			nModified: 0,
			nMatched: 0,
			ok: false
		}

		this.find(predicate, (err, results) => {
			if (!err) {
				if (results.length > 0) {
					let datas = results.data
					let dataToSave = []
					let newElement  = {}

					this.findAll((err, results) => {
						if (!err) {
							results.data.map((element, i, tab) => {
								datas.map((data, index, array) => {
									if (element._id == data._id) {
										for (const field in toUnset) {
											if (field !== '_id' && field !== 'state') {
												for (const elKey in element) {
													if (element.hasOwnProperty(field)) {
														const elVal = element[elKey];
														if (field != elKey) {
															newElement[elKey] = elVal
														}	
													}
												}
											}else {
												error =  field + locale.db.collection.update.noDeleteField
												break
											}
										}

										newElement.updated_at = !error ? new Date : newElement.updated_at
									}
								})

								newElement = Object.keys(newElement).length > 0 ? newElement : element
								dataToSave.push(newElement)
								newElement = {}

								if ((i + 1) == tab.length) {
									if (!error) {
										this.writeToCollection(dataToSave, (err, results) => {
											if (!err) {
												response.nMatched = datas.length
												response.nModified = datas.length
												response.ok = true

												callback(null, response)
											}else {
												callback(err, null)
											}
										})
									}else {
										callback(error, null)
									}
								}
							})
						}else {
							callback(err, null)
						}
					})
				}else {
					response.ok = true
					callback(null, response)
				}
			}else {
				callback(err, null)
			}
		})
	}

	/**
	 * Permet de trouver qu'une seule entrée
	 * @param {Object} predicate Le prédicat (condition à valider)
	 * @param {Function} callback La fonction callback à appeler
	 */
	findOne(predicate, callback) {
		this.find(predicate, (err, results) => {
			if (!err) {
				if (results.length > 0) {
					let data = results.data
					let response = {
						length: 1,
						data: data[0]
					}

					callback(null, response)
				}else {
					callback(locale.db.collection.data.nothing, null)
				}
			}else {
				callback(err, null)
			}
		})
	}

	/**
	 * Permet de trouver un élément partant de son ID
	 * @param {Number} _id L'identifiant de l'élément à trouver
	 * @param {Function} callback La fonction callbcak à appeler
	 */
	findById(_id, callback) {
		if (mbnumber.isIntValid(_id)) {
			this.findOne({_id: _id}, callback)
		}else {
			callback(locale.db.collection.data.badId, null)
		}
	}

	/**
	 * Permet de supprimer un ou plusiers documents
	 * @param {Object} predicate Le prédicat (condition à valider) pour supprimer les éléments demandés
	 * @param {Function } callback La fonction callback à appeler
	 */
	delete(predicate, callback) {
		this.find(predicate, (err, results) => {
			if (!err) {
				
			}
		})
	}
}

module.exports = CollectionQuery