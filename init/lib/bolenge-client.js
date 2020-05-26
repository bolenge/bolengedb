let path = require('path')
let OptionsConnect = require('./options-connection')
let ManagerUsersClient = require('./manager-users-client')
let QueryDataJSON = require('./query/query-data-json')

/**
 * class BolengeClient
 */
class BolengeClient extends ManagerUsersClient {

    constructor () {
        super()

        this.isConnected = false
        this.userConnected = null
        this.dbName = null
        this.username = null
        this.userPrivileges = null
        this.dbDirname = null
    }

    /**
     * Permet de faire connecter un utilisateur
     * @param {Object} options Les options de la connexion
     * @param {Function} callback Fonction callback à appeler
     */
    connect(options = OptionsConnect, callback) {
        this.connectUser(options, (err, results) => {
            if (!err) {
                this.isConnected = true
                this.userConnected = results
                this.dbName = results.database
                this.userPrivileges = results.privileges
                this.dbDirname = path.join(this.dbPath, results.database)

                let db = new QueryDataJSON(this.dbDirname)

                callback(null, db)
            }else {
                callback(err, null)
            }
        })
    }
}

module.exports = BolengeClient