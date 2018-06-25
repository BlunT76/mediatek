//url de la database
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://bob:passwordbob1@ds163730.mlab.com:63730/mediatek';
//nom de la database
const dbName = 'mediatek';

function User(username, mail, password) {
    this.username = username;
    this.mail = mail;
    this.password = password;
    this.isLogged = false;
    //sign in method
    this.signin = function () {
        let newUser = {
            username: this.username,
            mail: this.mail,
            password: this.password
        };
        //se connecte a la database
        MongoClient.connect(
            url,
            function (err, client) {
                if (err) {
                    console.log(err);
                    db.close();
                }
                let db = client.db(dbName);
                let users = db.collection('users');
                //insert le nouveau post dans la database
                users.insert(newUser, null, function (error, results) {
                    if (error) {
                        throw error;
                    } else {
                        console.log("Le nouvel user a bien été inséré");
                        client.close();
                    }
                });
            }
        );
    }
    
}
module.exports = User;
