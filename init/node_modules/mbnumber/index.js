/**
 * Module avec des méthodes qui traitent les nombres en Javascript
 */

/**
 * Vérifie si réellement la valeur passée en paramètre est véritablement un entier
 * @param {Number|String} value La valeur à vérifier
 * @return {Boolean}
 */
exports.isIntValid = (value) => {
    let regex = /\./

    if (regex.test(value)) {
        return false
    }

    value = parseInt(value);

    if (value) {
        return true
    }

    return false
}