let BolengeClient = require('./lib/bolenge-client')
let connection = {host: 'localhost', database: 'test', username: 'root', password: '12345'}
let client =  new BolengeClient

// client.createdb('nouveua')

// client.createUser('root', "12345", (err, results) => {
//     if (err) console.log(err);
//     if (results) console.log(results);
// })

// client.addUserToDB('root', 'test', ["all"], (err, results) => {
//     if (err) console.log(err);
//     if (results) console.log(results);
    
// })

client.connect(connection, (err, db) => {
    if (err) throw err

    db.collection('produits', (err, collection) => {
        let produit = {
            intitule: "Vans",
            description: "Un basket vans, donc comprenez kaka...",
            prix: 15,
            devise: "$"
        }

        // collection.create(produit, (err, results) => {
        //     if (err) console.log(err);
        //     if (results) console.log(results);
        // })

        // collection.findOne({devise: 'Fc'}, (err, results) => {
        //     if (err) console.log(err);
        //     if (results) console.log(results);
            
        // })

        // collection.findById(3, (err, results) => {
        //     if (err) console.log(err);
        //     if (results) console.log(results);
            
        // })

        collection.delete({state: true}, (err, results) => {
            if (err) console.log(err);
            if (results) console.log(results);
            
        })
    })
})