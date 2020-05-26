class LastQueryDataJSON {
    
    /**
	 * Vérifie si le fichier de données existe déjà
	 * @param {String} fileDataName Le fichier de données
	 */
	testFileDataExit(fileDataName, forceCreateFileData = true) {
		let fileName = this.fileName

		testyfile.verify(fileDataName, (exist, message, detailsFile) => {
			if (!exist) {
				if (forceCreateFileData) {
					fs.writeFile(fileName,  '[]', function (err) {
						if (err) throw err
					})
				}else {
					throw message
				}
			}

			return true
		})
	}

	/**
	 * Permet de créer le dossier de données s'il n'existe pas
	 * @param {String} dirname L'emplacement du dossier de données
	 * @param {Boolean} forceCreateFileData S'il faut forcer la création du dossier ou pas
	 */
	mkdirDataFolder(dirname, forceCreateFileData) {
		testyfile.verify(dirname, (exist, message, detailsFile) => {
			if (!exist) {
				if (forceCreateFileData) {
					fs.mkdir(dirname, (err) => {
						if (err) throw err
					})
				}else {
					throw message
				}
			}

			return true
		})
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

				data.id = parseInt(resultsLength) + 1
				resultsData.push(data)

				this.save(resultsData, callback)
			}else {
				callback(err, null)
			}
		})
	}

	/**
	 * Trouve tous les enregistrments
	 * @param {Closure} callback Fonction callback à appeler
	 */
	findAll(callback) {
		let fileName = this.fileName

		fs.readFile(fileName, function (err, dataResult) {
			if (!err) {
				let results = JSON.parse(dataResult)
				let response = {
					length: results.length,
					data: results
				}

				callback(null, response)
			}else {
				callback(err, null)
			}	
		})
	}

	/**
	 * Permet de sauvegarder les données dans le fichier à stocker
	 * @param {Array} data Les données à sauvegarder
	 * @param {Closure} callback La fonction callback à appeler
	 */
	save(data, callback) {
		let fileName = this.fileName
		let dataLength = data.length
		let lastStore = data[dataLength - 1]

		this.lastInsertId = lastStore.id

		fs.writeFile(fileName,  JSON.stringify(data), function (err) {
			if (!err) {
				let results = {
					lastInsertId: lastStore.id,
					data: lastStore
				}

				callback(null, results)
			}else {
				callback(err, null)
			}
		})
	}

	find(cond = ContraintesForme, callback) {
		this.findAll((err, results) => {
			if (err) throw err

			let length = results.length
			let data   = results.data
			let response = []

			if (length > 0) {
				let where = cond.where ? cond.where : null

				data.forEach((element, index, tab) => {
					let andValues = where.and ? Object.values(where.and) : null
					let andFields = where.and ? Object.keys(where.and) : null

					if (andValues) {
						let elementValues = Object.values(element)
						let elementFields = Object.keys(element)
						let counter = 0

						for (let field in where.and) {
							let indexField = elementFields.indexOf(field)
							let indexValue = elementValues.indexOf(where.and[field])

							if ((indexField >= 0) && (indexField == indexValue)) {
								counter++
							}
						}

						if (andValues.length == counter) {
							response.push(element)
						}
					}

					if (index + 1 == length) {
						console.log(response)
					}
				})
			}
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
					if (err) error = locale.db.collection.errorCreating
				})
			}

			callback(error)
		})
	}
}