let locales = require('./i18n')

class BolengeDBConfig {
    
    constructor() {
        this.serverConf = require('../config/server.conf.json')
        this.locale = locales[this.serverConf.locale]
    }
}

module.exports = BolengeDBConfig