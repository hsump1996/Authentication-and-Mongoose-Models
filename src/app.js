const express = require('express');
const mongoose = require('mongoose');

require('./db');
const session = require('express-session');
const path = require('path');
const auth = require('./auth.js');

const app = express();


const UserSchema = mongoose.model('User');
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
    console.log(res.locals.user);
    next();
});

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/article/add', (req, res) => {

    if(req.session.user.username) {

        res.render('article-add');

    } else {
        res.redirect('/login');
    }

});

app.post('/article/add', (req, res) => {
});

// come up with a url for /article/slug-name!
// app.get('add url here!', (req, res) => {
// });


//Render a template, register.hbs that contains a form register.hbs
app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {

    function success(user) {
        auth.startAuthenticatedSession(req, user, function cb() {
            res.redirect('/');
            console.log(user);
        });
    };
    
    function error(err) {
        res.render('register', {message: err.message});
    };

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
