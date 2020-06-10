// Modules required
let fs = require('fs')
let path = require('path')
let testyfile = require('mb-file');
let mbnumber = require('mbnumber')

/**
 * Class gérant les différentes requêtes vers les données
 */
class CollectionQuery {

    /**
     * Contructeur principal
     * @param {String} collectionFileName Le dossier de la base de données
     */
    constructor(collectionFileName, locale) {
		this.updateMethods = [
			'$set',
			'$unset'
		]

        this.collectionFileName = collectionFileName;
		this.lastInsertId = null;
		this.locale = locale;
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

					data['_id'] = donnees._id;
	
					for (const key in data) {
						if (data.hasOwnProperty(key)) {
							const value = data[key];
							donnees[key] = value
						}
					}
	
					resultsData.push(donnees)

					if (iId == tab.length) {
						this.writeToCollection(resultsData, tab, callback)
					}
				});
			}else {
				callback(err, null)
			}
		})
	}
	
	/**
	 * Permet de faire une insertion
	 * @param {Object} data Les données à insérer
	 * @param {Function} callback La fonction callback à appeler
	 */
	insert(data, callback) {
		this.create(data, callback)
	}

	/**
	 * Permet de faire une insertion d'un tableau d'élément
	 * @param {Array} data Les données à insérer
	 * @param {Function} callback La fonction callback à appeler
	 */
	insertMany(data, callback) {
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
				callback(this.locale.db.collection.errorWhenFind, null)
			}	
		})
    }
    
    /**
	 * Permet de sauvegarder les données dans le fichier à stocker
	 * @param {Array} data Les données à sauvegarder
	 * @param {Function} callback La fonction callback à appeler
	 */
	writeToCollection(data, new_data, callback) {
		let dataLength = data.length
		let lastStore = data[dataLength - 1]

		this.lastInsertId = lastStore._id

		fs.writeFile(this.collectionFileName,  JSON.stringify(data), function (err) {
			if (!err) {
				let results = {
					nInsert: new_data.length,
					data: new_data
				}

				callback(null, results)
			}else {
				callback(this.locale.db.collection.errorSaving, null)
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
						callback(null, response)
					}
				}else {
					callback(null, response)
				}
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
				let response = {
					length: 0,
					data: []
				}

				if (results.length > 0) {
					let data = results.data;

					response.length = 1;
					response.data = data[0];

					callback(null, response);
				}else {
					callback(null, response);
				}
			}else {
				callback(err, null);
			}
		})
	}

	/**
	 * Permet de trouver un élément partant de son ID
	 * @param {Number} _id L'identifiant de l'élément à trouver
	 * @param {Function} callback La fonction callbcak à appeler
	 */
	findOneById(_id, callback) {
		if (mbnumber.isIntValid(_id)) {
			this.findOne({_id: _id}, callback)
		}else {
			callback(this.locale.db.collection.data.badId, null)
		}
	}

	/**
	 * Permet de modifier ou ajouter des champs dans une entrée
	 * @param {Object} predicate Me prédicat (condition à valider)
	 * @param {Object} option L'option et les données à modifier
	 * @param {Function} callback La fonction callback à appeler
	 */
	update(predicate, option, callback) {
		if (typeof option == "object") {
			if (Object.keys(option)) {
				for (const key in option) {
					if (this.updateMethods.indexOf(key) >= 0) {
						this[key](predicate, option[key], callback)
					}else {
						callback(key + this.locale.db.collection.update.invalidKeyParam + this.updateMethods.join(' ' + this.locale.words.or + ' '), null)
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
												error = this.locale.db.collection.update.noUpdateId
												break
											}
										}
									}
								})

								if ((i + 1) == tab.length) {
									if (!error) {
										this.writeToCollection(tab, datas, (err, results) => {
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
											if (field !== '_id') {
												for (const elKey in element) {
													if (element.hasOwnProperty(field)) {
														const elVal = element[elKey];
														if (field != elKey) {
															newElement[elKey] = elVal
														}	
													}
												}
											}else {
												error =  field + this.locale.db.collection.update.noDeleteField
												break
											}
										}
									}
								})

								newElement = Object.keys(newElement).length > 0 ? newElement : element
								dataToSave.push(newElement)
								newElement = {}

								if ((i + 1) == tab.length) {
									if (!error) {
										this.writeToCollection(dataToSave, datas, (err, results) => {
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
}

module.exports = CollectionQuery