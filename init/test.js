let BolengeClient = require('./lib/bolenge-client')
let connection = {host: 'localhost', database: 'test', username: 'root', password: '12345'}
let client =  new BolengeClient

client.createdb('nouveua')

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

    // db.collection('users', (err, collection) => {
    //     if (err) throw err

    //     let users = [
    //         {nom: "Diani", email: "diani@gmail.com"},
    //         {nom: "Odette", email: "odette@gmail.com"}
    //     ]

    //     collection.create(users, (err, results) => {
    //         if (err) console.log(err);
    //         if (results) console.log(results);
            
    //     })
    // })

    db.collection('users', (err, collection) => {
        if (err) throw err

        // collection.find({_id: 1}, (err, results) => {
        //     if (err) console.log(err);
        //     if (results) console.log(results);
            
        // })

        // collection.update({sexe: "Femme"}, {$unset: {email: 1,nom: 1}}, (err, results) => {
        //     if (err) console.log(err);
        //     if (results) console.log(results);
            
        // })

        // collection.find(null, )

        // collection.$set({_id: 3}, {sexe: "Femme", age: "adulte"}, (err, results) => {
        //     if (err) console.log(err);
            
        //     console.log(results);
            
        // })

        // collection.find({$or: [{_id: 3}, {_id: 1}]}, (err, results) => {
        //     if (err) console.log(err);

        //     console.log(results);
            
        // })

        collection.find(null, (err, results) => {
            if (err) console.log(err);
            if (results) console.log(results);
            
        })
    })
    
})