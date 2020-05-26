const path = require('path');
const options = { 
    data_path : path.join(__dirname, 'data'),
    db_name: 'essaies',
    locale: 'fr'
}

const bolengedb = require('./index');
const BolengeClient = bolengedb.BolengeClient;
const client = new BolengeClient({
    data_path: path.join(__dirname, './data'),
    db_name: 'essaies',
    locale: "fr"
});

client.connect((err, db) => {
    if (err) throw err;

    db.collection('users', (err_collection, collection) => {
        if (err_collection) throw err_collection;

        /* collection.insert({
            nom: 'Moliso',
            prenom: 'Don de Dieu'
        }, (err_creating, results) => {
            if (err_creating) throw err_creating;

            console.log(results);
        }) */

        /* collection.insertMany([{nom: 'Etokila', prenom: 'Diani'}, {nom: 'Bolenge', prenom: 'Nancy'}],
        (err_creating, results) => {
            if (err_creating) throw err_creating;

            console.log(results);
        }) */

        /* collection.find({nom: 'Bolenge'}, (err, results) => {
            console.log(results);
            
        }) */

        /* collection.findAll((err, results) => {
            if (err) throw err;

            console.log(results);
            
        }) */

        /* collection.update({nom: 'Moliso'}, {$set: {prenom: 'Don'}}, (err, results) => {
            if (err) throw err;

            console.log(results);
            
        }) */

        collection.update({nom: 'Moliso'}, {$unset: {updated_at: ''}}, (err, results) => {
            if (err) throw err;

            collection.findOne({nom: 'Moliso'}, (err_found, results_found) => {
                if (err_found) throw err_found;

                console.log(results_found);
            })
            
        })

        /* collection.findOne({_id: 1}, (err, results) => {
            if (err) throw err;

            console.log(results);
            
        }) */

        /* collection.findOneById(1, (err, results) => {
            if (err) throw err;

            console.log(results);
            
        }) */
    })
})