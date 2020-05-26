# bolengedb

Module nodejs qui permet de gérer les données sous forme d'une base de données partant de fichiers JSON.
Ceci est fait pour aider ceux qui développent sur ElectronJS et autres.

## Installation

Ceci est un [Node.js](https://nodejs.org/en/) module disponible sur
[npm registry](https://www.npmjs.com/).

```bash
$ npm i bolengedb --save
```

## Usage

```js
const bolengedb = require('bolengedb');
const path = require('path');

const BolengeClient = bolengedb.BolengeClient;
const client = new BolengeClient({
    data_path: path.join(__dirname, './data'),
    db_name: 'users',
    locale: "fr"
})

client.connect((err, db) => {
    if (err) throw err;

    db.collection('users', (err_collection, collection) => {
        if (err_collection) throw err_collection;

        collection.insert({
            nom: 'Moliso',
            prenom: 'Don de Dieu'
        }, (err_creating, results) => {
            if (err_creating) throw err_creating;

            console.log(results);
        })
    })
})
```

## API

### Introduction

Une fois vous avez installé ce module dans votre projet, vous devez créer un dossier dans lequel seront stockés vos base de données et toutes vos collections (entité ou table).

Les tables sont considérées comme des collections et les champs comme des documents, ceux qui sont familliés aux base de données NoSql comme `Mongodb` pour ne citer que ça vont se retrouvés si facilement.

#### bolengedb.BolengeClient(options)

* `options` : Les options de la configuration de la base de données
    * `options.data_path` : Le dossier de données
    * `options.db_name` : Le nom de la base de données
    * `options.locale` : La langue à utiliser pour l'affichage des messages d'erreurs

```js
const bolengedb = require('bolengedb');
const BolengeClient = bolengedb.BolengeClient;
const client = new BolengeClient({
    data_path: '/to/path/data',
    db_name: 'test',
    locale: 'fr'
})
```

##### bolengedb.BolengeClient.connect(callback)

Activation de la connexion à la base de données dont le nom est passé en `options.db_name`

* `callback(err, db)` : La fonction callback qui reçoit `err` et `db`
    * `err` : L'erreur traquée lors de la connexion
    * `db` : L'instance de `QueryDataJSON` qui est une classe permettant de faire de requêtes vers les fichiers JSON

```js
client.connect((err, db) => {
    if (err) throw err;
})
```

### QueryDataJSON (db)

L'instance de `QueryDataJSON` qui est une classe permettant de faire de requêtes vers les fichiers JSON, comme évoqué ci-haut.

#### db.collection(collection_name, callback)

Cette méthode permet de mettre le curseur sur la collection passée en paramère
* `collection_name` : Le nom de la collection
* `callback(err, collection)` : Ce callback prend deux paramètres :
    * `err` : L'erreur survenue
    * `collection` : L'instance de `CollectionQuery` qui permet gérer les différentes opérations à faire aux collections

##### collection.create(data, callback) ou collection.insert(data, callback)

Permet de faire la création ou l'enregistrement d'une nouvelle entrée.

* `data` : Les données à stocker, ça peut être un tableau d'objet ou un seul objet
* `callback(err, results)` : La fonction callback à appeler qui prend deux paramètres :
    * `err` : L'erreur de l'enregistrement
    * `results` : Le résultat de l'enregistrement fait

```js
client.connect((err, db) => {
    if (err) throw err;

    db.collection('users', (err_collection, collection) => {
        if (err_collection) throw err_collection;

        collection.insert({
            nom: 'Mbuyu',
            prenom: 'Josué'
        }, (err_creating, results) => {
            if (err_creating) throw err_creating;

            console.log(results);
        })
    })
})
```

##### collection.insertMany(data, callback)

Permet de faire l'insertion de plusieurs données en même temps.

* `data` : Les données à stocker, doit être un tableau d'objet
* `callback(err, results)` : La fonction callback à appeler qui prend deux paramètres :
    * `err` : L'erreur de l'enregistrement
    * `results` : Le résultat de l'enregistrement fait

```js
client.connect((err, db) => {
    if (err) throw err;

    db.collection('users', (err_collection, collection) => {
        if (err_collection) throw err_collection;

        collection.insertMany([{ nom: 'Mbuyu', prenom: 'Josué'}, { nom: 'Mukangu', prenom: 'David'}], (err_creating, results) => {
            if (err_creating) throw err_creating;

            console.log(results);
        })
    })
})
```

##### collection.find(predicate, callback)

Cette méthode permet de rechercher (genre `SELECT` sur SQL) surbase du prédicat passé en paramètre.

* `predicate` : La condition de filtre de données à rechercher
* `callback(err, results)` : Cette fonction prend deux paramètres `err` et `results`
    * `err` : L'erreur survenue
    * `results` : Le result, qui est objet ayant deux propriétés :
        * `length` : Le nombre d'élément trouvés
        * `data` : Les données trouvées

Exemple
```js
client.connect((err, db) => {
    if (err) throw err;

    db.collection('users', (err_collection, collection) => {
        if (err_collection) throw err_collection;

        collection.find({nom: 'jean'}, (err, results) => {
            if (err) throw err;

            console.log(results);
        })
    })
})
```

##### collection.findAll(callback)

Cette méthode permet de trouver (genre `SELECT` sur SQL) toutes les entrées

* `callback(err, results)` : Cette fonction prend deux paramètres `err` et `results`
    * `err` : L'erreur survenue
    * `results` : Le result, qui est objet ayant deux propriétés :
        * `length` : Le nombre d'élément trouvés
        * `data` : Les données trouvées

Exemple
```js
client.connect((err, db) => {
    if (err) throw err;

    db.collection('users', (err_collection, collection) => {
        if (err_collection) throw err_collection;

        collection.findAll((err, results) => {
            if (err) throw err;

            console.log(results);
        })
    })
})
```

##### collection.findOne(predicate, callback)

Cette méthode permet de trouver une entrée par rapport au prédicat

* `predicate` : La condition de filtre de données à rechercher
* `callback(err, results)` : Cette fonction prend deux paramètres `err` et `results`
    * `err` : L'erreur survenue
    * `results` : Le result, qui est objet ayant deux propriétés :
        * `length` : Le nombre d'élément trouvés
        * `data` : L'objet des données trouvées

Exemple
```js
client.connect((err, db) => {
    if (err) throw err;

    db.collection('users', (err_collection, collection) => {
        if (err_collection) throw err_collection;

        collection.findOne(predicate, (err, results) => {
            if (err) throw err;

            console.log(results);
        })
    })
})
```

##### collection.findOneById(_id_, callback)

Cette méthode permet de trouver une entrée par rapport au prédicat

* `_id_` : L'identifiant de l'entrée à rechercher
* `callback(err, results)` : Cette fonction prend deux paramètres `err` et `results`
    * `err` : L'erreur survenue
    * `results` : Le result, qui est objet ayant deux propriétés :
        * `length` : Le nombre d'élément trouvés
        * `data` : L'objet des données trouvées

Exemple
```js
client.connect((err, db) => {
    if (err) throw err;

    db.collection('users', (err_collection, collection) => {
        if (err_collection) throw err_collection;

        collection.findOne(predicate, (err, results) => {
            if (err) throw err;

            console.log(results);
        })
    })
})
```

##### collection.update(predicate, option, callback)

Cette méthode permet d'apporter des modifications sur les éléments lié à la condition du `predicate`.

* `predicate` : La condition de filtre de données à rechercher
* `option` : L'option et les données à modifier :
    * `option.$set` : Permet de modifier les informations
    * `option.$unset` :  Permet de supprimer des propriétés

Exemple $set
```js
client.connect((err, db) => {
    if (err) throw err;

    db.collection('users', (err_collection, collection) => {
        if (err_collection) throw err_collection;

        collection.update({nom: 'Jean'}, {$set: {prenom: 'Claude'}}, (err, results) => {
            if (err) throw err;

            console.log(results);
            
        })
    })
})
```

Exemple $unset
```js
client.connect((err, db) => {
    if (err) throw err;

    db.collection('users', (err_collection, collection) => {
        if (err_collection) throw err_collection;

        collection.update({nom: 'Jean'}, {$unset: {prenom: ''}}, (err, results) => {
            if (err) throw err;

            collection.findOne({nom: 'Jean'}, (err_found, results_found) => {
                if (err_found) throw err_found;

                console.log(results_found);
            })
        })
    })
})
```

### Features

* `collection.delete` : Suppression d'une entrée
* `collection.clear` : Suppression toutes les informations dans une collection