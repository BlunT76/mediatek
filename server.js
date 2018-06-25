// Modules
let express = require('express');
let bodyparser = require('body-parser');
let ejs = require('ejs');
let books = require('google-books-search');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
let User = require('./User');
let userLogged;

//url de la database
const url = 'mongodb://bob:passwordbob1@ds163730.mlab.com:63730/mediatek';

//nom de la database
const dbName = 'mediatek';

// Set express
let app = express();
app.use(bodyparser.urlencoded({
    extended: false
}));
app.set('view engine', 'ejs');

//appel du dossier public (css, stripts.js)
app.use(express.static(__dirname + '/public'));

//book search 
books.search('devernay', function (error, results) {
    let lastbooks = [];
    if (!error) {
        //console.log(results);
        for (let i = 0; i < 10; i++) {
            lastbooks.push(results[i])
        }
        //show index
        app.get('/', function (req, res) {
            res.render('index', {
                books: lastbooks
            });
        });
    } else {
        console.log(error);
    }
});


app.post('/search', function (req, res) {
    console.log("recherche lancee")
    let searchItem = req.body.search;
    let lastbooks = [];
    books.search(searchItem, {
        lang: 'fr'
    }, function (error, results) {
        if (!error && results.length != 0) {
            console.log(results[0]);
            for (let i = 0; i < 10; i++) {
                lastbooks.push(results[i])
            }
            //show index
            res.render('index', {
                books: lastbooks
            });
        } else {
            console.log(error);
            res.render('index', {
                books: lastbooks
            });
        }
    });
});


//emprunter un livre
app.get('/test/:id', function (req, res) {
    if (userLogged != undefined) {
        //genere la date actuelle au format UTC
        let d = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
        //cree l'objet book
        let book = {
            title: req.params.id,
            user: userLogged,
            date: d
        };
        console.log(url);
        //se connecte a la database
        MongoClient.connect(
            url,
            function (err, client) {
                if (err) {
                    console.log(err);
                    db.close();
                }
                let db = client.db(dbName);
                let reservation = db.collection('reservation');
                //insert le livre emprunté dans la table reservation
                db.collection("reservation").insert(book, null, function (error, results) {
                    if (error) {
                        throw error;
                    } else {
                        console.log("Le document a bien été inséré");
                        client.close();
                        res.redirect('/');
                    }
                });
            }
        );
    } else {
        res.redirect('/userlogin');
    }
});

//suivi des emprunts
app.get('/suivi', function (req, res) {
    MongoClient.connect(
        url,
        function (err, client) {
            if (err) {
                console.log(err);
                db.close();
            }
            let db = client.db(dbName);
            let reservation = db.collection('reservation');
            //affiche tout les livre emprunté
            db.collection("reservation").find({}).toArray(function (err, emprunt) {
                res.render('pagesuivi', {
                    books: emprunt
                });
            });
        }
    );
});

//newuser signin
app.get('/newuser', function (req, res) {
    res.render('newuser');
})
//add newuser to database
app.post('/adduser/', function (req, res) {
    //cree l'objet user avecle contenu des inputs de newuser
    //console.log(req.body.username,req.body.usermail,req.body.userpassword)
    let new_user = new User(req.body.username, req.body.usermail, req.body.userpassword);
    new_user.signin();
    res.redirect('/');
});

//user login
app.get('/userlogin', function (req, res) {
    let user_response = "";
    res.render('userlogin', {
        login_response: user_response
    });
});
//verification du login/password
app.post('/loginuser/', function (req, res) {
    //cree l'objet user avec le contenu des inputs
    let tryLogin = {
        username: req.body.username,
        password: req.body.userpassword
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
            //cree un index pour pouvoir rechercher par mot clé
            users.createIndex({
                "username": "text"
            });
            //lance la recherche par mot clé
            users.find({
                $text: {
                    $search: tryLogin.username
                }
            }).toArray(function (err, results) {
                if (results.length == 0) {
                    res.render('/');
                } else {
                    if (tryLogin.username == results[0].username && tryLogin.password == results[0].password) {
                        console.log('user connection successful');
                        userLogged = tryLogin.username;
                        console.log(userLogged)
                        client.close();
                        res.redirect('/');
                    } else {
                        let user_response = "bad login or password";
                        res.render('userlogin', {
                            login_response: user_response
                        });
                    }
                }
                client.close();
            });
        }
    );
});

// Remove Reservation
app.get('/delete/:id', function (req, res) {
    let id = req.params.id;
    MongoClient.connect(
        url,
        function (err, client) {
            if (err) {
                console.log(err);
                db.close();
            }
            let db = client.db(dbName);
            let posts = db.collection('reservation');
            let MongoObjectID = require("mongodb").ObjectID; // Il nous faut ObjectID
            let idToFind = id;
            let objToFind = {
                _id: new MongoObjectID(idToFind)
            };
            db.collection("reservation").remove(objToFind, null, function (error, result) {
                if (error) {
                    throw error;
                } else if (id) {
                    console.log("reservation " + id + " removed");
                    res.redirect('/suivi');
                    client.close();
                } else {
                    console.log("reservation " + id + " does not exist, nothing to remove");
                    client.close();
                }
            });
        }
    );
});

// Listen
app.listen(8080, function (req, res) {
    console.log('Server Online')
})
