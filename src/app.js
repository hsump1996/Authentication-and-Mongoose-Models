const express = require('express');
const mongoose = require('mongoose');

require('./db');
const session = require('express-session');
const path = require('path');
const auth = require('./auth.js');

const app = express();

const ArticleSchema = mongoose.model('Article');

app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'add session secret here!',
    resave: false,
    saveUninitialized: true,
}));

// add req.session.user to every context object for templates
app.use((req, res, next) => {
    // now you can use {{user}} in your template!
    res.locals.user = req.session.user;
    next();
});



app.get('/', (req, res) => {

    ArticleSchema.find({}, (err, article) => {

        if (err) {
            console.log(err);
        
        } else {
            res.render('home', {'article': article});
        }
    });
});


app.get('/article/add', (req, res) => {

    //Make sure that only logged in users can reach this url
    if(req.session.user) {
        
        //Renders a template, article-add.hbs that contains a form
        res.render('article-add');


    } else {

        //Redirect to /login if the user is not logged in
        res.redirect('/login');
    }
});

app.post('/article/add', (req, res) => {

    //Make sure that only logged in users can reach this url
    if(req.session.user) {        
        //Create a new Article and associate it with a user
        const article = new ArticleSchema({title: req.body.title, url: req.body.url, description: req.body.description, user: req.session.user['_id']});

        article.save(err => {

            //Case where there's an error and re-renders the article-add.hbs
            if (err) {
                console.log(err);
                res.render('article-add', {message: err.message});
            
            //Case where the article / user is saved successfully and redirected to the home page
            } else {
                res.redirect('/');
            }
        });
    
    //Redirect to /login if the user is not logged in
    } else {
        res.redirect('/login');
    }
});

// come up with a url for /article/slug-name!
app.get('/article/:slug', (req, res) => {

    //Gets the value of query string parameters
    const slug = req.params.slug;

    ArticleSchema.findOne({slug: slug}).populate('user').exec((err, article) => {

        if (err) {
            console.log(err);
        
        } else {
            res.render('article-detail', {'title': article.title, 'url': article.url, 'username': article.user['username'], 'description': article.description});
        }
    });

});


//Render a template, register.hbs that contains a form register.hbs
app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {

    function success(user) {
        auth.startAuthenticatedSession(req, user, function cb() {
            res.redirect('/');
        });
    }
    
    function error(err) {
        res.render('register', {message: err.message});
    }

    auth.register(req.body.username, req.body.email, req.body.password, error, success);
        
});


app.get('/login', (req, res) => {

    res.render('login');

});

app.post('/login', (req, res) => {
    
    // successfully logged in!
    function success(user) {
        // start an authenticated session and redirect to another page
        auth.startAuthenticatedSession(req, user, function cb() {
            res.redirect('/');
        });
    }
    
    // render a template containing an error message
    function error(err) {
        res.render('login', {message: err.message});
    }
      
    auth.login(req.body.username, req.body.password, error, success);

});

app.listen(3000);
