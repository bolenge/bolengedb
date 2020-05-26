let path = require('path')
let fs   = require('fs')

let config = require('../config')
let dirnameConfig = config.path._configdirname
let OptionsConnect = require('./options-connection')

let BolengeDBProvider = require('./bolengedb-provider')

/**
 * Gère les utilisateur des bases de données
 */
class ManagerUsersClient extends BolengeDBProvider {

    constructor() {
        super()

        this.usersFileName = path.join(dirnameConfig, 'users.json')
        this.usersPrivilegesFileName = path.join(dirnameConfig, 'users.privileges.json')
        this.usersPrivileges = require('../config/users.privileges.json')
        this.users = require('../config/users.json')
        this.listPrivileges = ["read", "write", "delete", "update"]
    }

    /**
	 * Permet de créer un utilisateur
	 * @param {String} username Le nom de l'utilisateur
	 * @param {String} password Le mot de passe du compte de l'utilisateur
     * @param {SimpleCallbackFunction}
	 */
	createUser(username, password, callback) {
        this.findUserByUsername(username, (user) => {
            if (!user) {
                let lengthUsers = this.users.length
                let user = {
                    _id: lengthUsers + 1,
                    username: username,
                    password: password,
                    state: true,
                    created_at: new Date,
                    updated_at: new Date
                }
                
                this.users.push(user)
                this.save(this.users, this.usersFileName, callback)   
            }else {
                callback(this.locale.db.users.exist, null)
            }
        })
    }

    /**
     * Saugarde les données des utilisateurs créés
     * @param {Object} data Les données à sauvegarder
     * @param {CallbackSaveUserClient} callback Fonction callback à appeler
     */
    save(data, filename, callback) {
		let dataLength = data.length
        let lastStore = data[dataLength - 1]
        
        fs.writeFile(filename,  JSON.stringify(data), function (err) {
			if (!err) {
				let results = {
					lastInsertId: lastStore._id,
					data: lastStore
				}

				callback(null, results)
			}else {
				callback(err, null)
			}
		})
    }
    
    /**
     * Trouve tous les users
     * @param {SimpleCallbackFunction} callback 
     */
    findAllUsers(callback) {
        callback(this.users)
    }

    /**
     * Permet de trouver un par son username
     * @param {String} username Le nom d'utilisateur
     * @param {Function} callback
     * @param {Boolean} allStates S'il faut trouver l'utilisateur supprimé
     */
    findUserByUsername(username, callback, allStates = false) {
        let user = null

        this.findAllUsers((users) => {
            if (users.length == 0) {
                callback(null)
            }else {
                users.forEach((element, index, tab) => {
                    let cond = !allStates 
                               ? element.username === username && element.state == true
                               : element.username === username

                    if (cond) {
                        user = element
                    }

                    if (index + 1 == tab.length) {
                        callback(user)
                    }
                })
            }
        })
    }

    /**
     * Permet d'ajouter un utilisateur à une base de données
     * @param {String} username Le nom d'utilisateur
     * @param {String} dbName Le nom de la base de données
     * @param {Array} privileges Les privilèges à ajouter sur l'utilisateur face à cette DB
     * @param {Function} callback 
     */
    addUserToDB(username, dbName, privileges = [], callback) {
        let error = null

		this.findUserByUsername(username, (user) => {
            
            if (!user) {
                callback(this.locale.db.users.absent, null)
            }else {
                this.verifyDBExists(dbName, (err) => {
                    if (err) {
                        callback(err, null)
                    }else {
                        if (privileges.indexOf("all") >= 0) {
                            privileges = this.listPrivileges
                        }

                        this.verifyPrivileges(privileges, (err) => {
                            if (err) {
                                callback(err, null)
                            }else {
                                let listPrivileges = this.usersPrivileges
                                let privilegesLength = this.usersPrivileges.length
                                let privilege = {
                                    _id: privilegesLength + 1,
                                    user_id: user._id,
                                    database: dbName,
                                    privileges: privileges,
                                    state: true,
                                    created_at: new Date,
                                    updated_at: new Date
                                }

                                this.findUserPrivilegesByDB(username, dbName, (err, results) => {
                                    if (err) {
                                        listPrivileges.push(privilege)

                                        this.save(listPrivileges, this.usersPrivilegesFileName, callback)
                                    }else {
                                        this.addUserPrivilegesOnDB(username, dbName, privileges, callback)
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    }
    
    /**
     * Vérifie si les privilèges sont valide
     * @param {Array} privileges Les privilèges à vérifier
     * @param {Function} callback 
     */
    verifyPrivileges(privileges = [], callback) {
        let err = null

        if (privileges.length > 0) {

            for (let i = 0; i < privileges.length; i++) {
                const privilege = privileges[i];
                
                if (this.listPrivileges.indexOf(privilege) < 0) {
                    err = "'" + privilege + "' " + this.locale.db.privileges.invalid
                    break
                }
            }
        }else {
            err = this.locale.db.privileges.empty
        }

        callback(err)
    }

    /**
     * Trouve tous les utilisateurs avec leurs privileges
     * @param {Function} callback 
     */
    findAllUsersPrivileges(callback) {
        callback(this.usersPrivileges)
    }

    /**
     * Permet trouver un utilisateur et ses privilèges par rapport à une base de données
     * @param {String} username Le nom d'utilisateur
     * @param {String} database Le nom de la base de données
     * @param {Function} callback Fonction callback à appeler
     * @param {Boolean} allStates Peu importe le state
     */
    findUserPrivilegesByDB(username, database, callback, allStates = false) {
        this.findUserByUsername(username, (user) => {
            let err = null
            let results = null

            if (user) {
                let usersPrivileges = this.usersPrivileges

                for (let i = 0; i < usersPrivileges.length; i++) {
                    const element = usersPrivileges[i];
                    let condition = !allStates 
                                    ? element.user_id == user._id && element.database == database && element.state == true
                                    : element.user_id == user._id && element.database == database
                    
                    if (condition) {
                        results = element
                        break
                    }
                }

                err = !results ? this.locale.db.privileges.userNoPrivilege : null
            }else {
                err = this.locale.db.users.absent
            }

            callback(err, results)
        })
    }

    /**
     * Permet d'ajouter des privilèges à un utilisateur sur une base de données
     * @param {String} username Le nom d'utilisateur
     * @param {String} database Le nom de la base de données
     * @param {Array|String} privileges Les privilèges à ajouter
     * @param {Function} callback Fonction callback à appeler
     */
    addUserPrivilegesOnDB(username, database, privileges, callback) {
        this.findUserPrivilegesByDB(username, database, (err, results) => {
            if (!err) {
                privileges = !Array.isArray(privileges) ? privileges.split(' ') : privileges
                privileges = privileges.indexOf("all") >= 0 ? this.listPrivileges : privileges
                
                this.verifyPrivileges(privileges, (err) => {
                    if (!err) {
                        this.findAllUsersPrivileges((allUsersPrivileges) => {
                            for (let i = 0; i < allUsersPrivileges.length; i++) {
                                const element = allUsersPrivileges[i];
                                
                                if (element.user_id == results.user_id && element.database == results.database) {
                                    for (let i2 = 0; i2 < privileges.length; i2++) {
                                        const privilege = privileges[i2];
                                        
                                        if (element.privileges.indexOf(privilege) < 0) {
                                            element.privileges.push(privilege)
                                            element.updated_at = new Date
                                        }
                                    }

                                    break
                                }
                            }

                            this.save(allUsersPrivileges, this.usersPrivilegesFileName, callback)
                        })
                    }else {
                        callback(err, null)
                    }
                })
            }else {
                callback(err, null)
            }
        })
    }

    /**
     * Permet d'enlever à un utilisateur des privilèges
     * @param {String} username Le nom d'utilisateur
     * @param {String} database Le nom de la base de données
     * @param {Array|String} privileges Les privilèges
     * @param {Function} callback Callback à appeler
     */
    removeUserPrivilegesOnDB(username, database, privileges, callback) {
        let error = null

        this.findUserPrivilegesByDB(username, database, (err, results) => {
            if (!err) {
                privileges = !Array.isArray(privileges) ? privileges.split(' ') : privileges
                privileges = privileges.indexOf("all") >= 0 ? this.listPrivileges : privileges

                this.verifyPrivileges(privileges, (err) => {
                    if (!err) {
                        this.findAllUsersPrivileges((allUsersPrivileges) => {
                            for (let i = 0; i < allUsersPrivileges.length; i++) {
                                const element = allUsersPrivileges[i];
                                
                                if (element.user_id == results.user_id && element.database == results.database) {
                                    for (let i2 = 0; i2 < privileges.length; i2++) {
                                        const privilege = privileges[i2];
                                        const privilegeIndex = element.privileges.indexOf(privilege)
                                        
                                        if (privilegeIndex >= 0) {
                                            if (element.privileges.length == 1) {
                                                error = this.locale.db.privileges.noEmptyPrivilege
                                            }else {
                                                element.privileges.splice(privilegeIndex, 1)
                                                element.updated_at = new Date
                                            }
                                        }
                                    }

                                    break
                                }
                            }

                            if (error) {
                                callback(error, null)
                            }else {
                                this.save(allUsersPrivileges, this.usersPrivilegesFileName, callback)
                            }
                        })
                    }else {
                        callback(err, null)
                    }
                })
            }else {
                callback(err, null)
            }
        })
    }

    /**
     * Permet de faire connecter un utilisateur
     * @param {OptionsConnect} options Les options de la connexion
     * @param {Function} callback Fonction callbakc à appeler
     */
    connectUser(options = OptionsConnect, callback) {
        this.verifyConnectOptions(options, (err) => {
            if (!err) {
                this.findUserByUsername(options.username, (user) => {
                    if (user) {
                        if (user.password == options.password) {
                            this.findUserPrivilegesByDB(options.username, options.database, (err, results) => {
                                if (!err) {
                                    callback(err, results)
                                }else {
                                    callback(err, null)
                                }
                            })
                        }else {
                            callback(this.locale.db.users.invalidPassword, null)
                        }
                    }else {
                        callback(this.locale.db.users.absent, null)
                    }
                })
            }else {
                callback(err, null)
            }
        })
    }
    
    /**
     * Permet de vérifier les options de la connexion
     * @param {Object} options Les options de la connextion
     * @param {Function} callback Fonction callback
     */
    verifyConnectOptions(options, callback) {
        let error = ''

        if (typeof options == "object") {
            for (const key in options) {
                if (OptionsConnect.hasOwnProperty(key)) {
                    const option = options[key];
                    
                    if (!option) {
                        error += this.locale.db.users.optionsConnect.empty
                        break
                    }
                }else {
                    error += key + " " + this.locale.db.users.optionsConnect.invalid
                    error += " " + this.locale.db.users.optionsConnect.options
                    break
                }
            }
        }else {
            error += this.locale.db.users.optionsConnect.options
        }

        callback(error)
    }
}

module.exports = ManagerUsersClient