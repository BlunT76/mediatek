// Modules
let express = require('express');
let bodyparser = require('body-parser');
let ejs = require('ejs');
let books = require('google-books-search');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');


//url de la database
const url = 'mongodb://bob:passwordbob1@ds163730.mlab.com:63730/mediatek';
//mongodb://<dbuser>:<dbpassword>@ds163730.mlab.com:63730/mediatek
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
books.search('mediatheque', function (error, results) {
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
    books.search(searchItem,{lang: 'fr'}, function (error, results) {
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
app.get('/test/:id', function (req,res){
    console.log("test: ")
    console.log(req.params.id);
    // addpost insert the post in database, when we click on newpost submit 

    //genere la date actuelle au format UTC
    let d = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    //cree l'objet postUser avecle contenu des inputs de newpost
    let book = {
        title: req.params.id,
        user: 'bob',
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
            //insert le nouveau post dans la database
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


    
});
// Listen
app.listen(8080, function (req, res) {
    console.log('Server Online')
})
