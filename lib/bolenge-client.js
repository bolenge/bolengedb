const path = require('path');
const BolengeDBProvider = require('./bolengedb-provider');

/**
 * class BolengeClient
 */
class BolengeClient extends BolengeDBProvider {

    constructor (options = {data_path: '', db_name: '', locale: 'fr'}) {
        super(options)
    }
}

module.exports = BolengeClient